const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Holiday = require('../models/Holiday');
const Notification = require('../models/Notification');
const { protect, managerOrHR } = require('../middleware/auth');
const { logAction } = require('../services/auditService');
const { sendEmail } = require('../services/emailService');
const { canUserManageEmployee, getManagerScopedEmployeeIds } = require('../services/managerScopeService');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const calcLeaveDays = (fromDate, toDate, isHalfDay = false) => {
  if (isHalfDay) return 0.5;
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffMs = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

// @route   POST /api/leaves
// @desc    Apply leave
// @access  Private
router.post(
  '/',
  protect,
  [
    body('leaveType')
      .isIn(['Sick', 'Casual', 'Paid', 'Unpaid', 'Maternity', 'Paternity', 'Compensatory'])
      .withMessage('Invalid leave type'),
    body('fromDate').isISO8601().withMessage('fromDate must be valid'),
    body('toDate').isISO8601().withMessage('toDate must be valid'),
    body('reason').notEmpty().withMessage('Reason is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const employee = await Employee.findOne({ user: req.user.id });
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee profile not found' });
      }

      const { leaveType, fromDate, toDate, reason, isHalfDay, halfDaySlot } = req.body;
      const totalDays = calcLeaveDays(fromDate, toDate, isHalfDay);
      if (totalDays <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid leave date range' });
      }

      const holidayCount = await Holiday.countDocuments({
        date: { $gte: new Date(fromDate), $lte: new Date(toDate) },
      });
      if (holidayCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Leave range includes holiday dates. Please exclude holidays.',
        });
      }

      const leave = await Leave.create({
        employee: employee._id,
        leaveType,
        fromDate,
        toDate,
        reason,
        isHalfDay: Boolean(isHalfDay),
        halfDaySlot,
        totalDays,
      });

      await leave.populate('employee', 'firstName lastName employeeId');
      await logAction(req, 'CREATE', 'Leave', leave._id, null, leave.toObject(), `${employee.firstName} ${employee.lastName}`);

      res.status(201).json({ success: true, message: 'Leave applied successfully', data: leave });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/leaves/mine
// @desc    Current user's leaves
// @access  Private
router.get('/mine', protect, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.json({ success: true, count: 0, total: 0, page: 1, pages: 1, data: [] });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const query = { employee: employee._id };
    const [rows, total] = await Promise.all([
      Leave.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Leave.countDocuments(query),
    ]);

    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/leaves
// @desc    List leaves
// @access  Private/Manager+
router.get('/', protect, managerOrHR, async (req, res, next) => {
  try {
    const { employeeId, status, leaveType, fromDate, toDate } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};
    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (fromDate || toDate) {
      query.fromDate = {};
      if (fromDate) query.fromDate.$gte = new Date(fromDate);
      if (toDate) query.fromDate.$lte = new Date(toDate);
    }
    if (req.user.role === 'manager') {
      const scopedEmployeeIds = await getManagerScopedEmployeeIds(req.user);
      query.employee = { $in: scopedEmployeeIds };
    }

    const [rows, total] = await Promise.all([
      Leave.find(query)
        .populate('employee', 'firstName lastName employeeId department')
        .populate('reviewedBy', 'firstName lastName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Leave.countDocuments(query),
    ]);

    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/leaves/:id/approve
// @desc    Approve leave
// @access  Private/Manager+
router.put(
  '/:id/approve',
  protect,
  managerOrHR,
  [body('reviewRemarks').optional().isString().isLength({ max: 1000 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const leave = await Leave.findById(req.params.id).populate({
        path: 'employee',
        populate: { path: 'user', select: 'email firstName' },
      });
      if (!leave) {
        return res.status(404).json({ success: false, message: 'Leave not found' });
      }
      const canManage = await canUserManageEmployee(req.user, leave.employee._id);
      if (!canManage) {
        return res.status(403).json({ success: false, message: 'Not authorized to approve this employee leave' });
      }

      const isManager = req.user.role === 'manager';
      const isHR = req.user.role === 'hr' || req.user.role === 'admin';

      const previous = leave.toObject();

      if (isManager && !isHR) {
        if (leave.status !== 'Pending') {
          return res.status(400).json({ success: false, message: 'Leave is not in Pending state for manager approval' });
        }
        leave.status = 'Manager Approved';
        leave.managerReviewedBy = req.user.id;
        leave.managerReviewedOn = new Date();
        leave.managerReviewRemarks = req.body.reviewRemarks || '';
        await leave.save();

        await logAction(req, 'MANAGER_APPROVE', 'Leave', leave._id, previous, leave.toObject(), `${leave.employee.firstName} ${leave.employee.lastName}`);
        if (leave.employee.user) {
          await Notification.create({
            recipient: leave.employee.user._id,
            title: 'Leave Manager Approved',
            message: `Your ${leave.leaveType} leave has been approved by your manager and is pending HR approval.`,
            type: 'info',
            link: '/my-leaves'
          });
        }

        return res.json({ success: true, message: 'Leave manager approved successfully', data: leave });
      }

      if (isHR) {
        if (leave.status === 'Approved' || leave.status === 'Rejected' || leave.status === 'Cancelled') {
          return res.status(400).json({ success: false, message: `Leave cannot be approved from ${leave.status} state` });
        }

        leave.status = 'Approved';
        leave.reviewedBy = req.user.id;
        leave.reviewedOn = new Date();
        leave.reviewRemarks = req.body.reviewRemarks || leave.reviewRemarks || '';

        const leaveBalanceMap = {
          Sick: 'sick',
          Casual: 'casual',
          Paid: 'paid',
          Unpaid: 'unpaid',
        };
        const balanceKey = leaveBalanceMap[leave.leaveType];
        if (balanceKey && leave.employee.leaveBalance?.[balanceKey] !== undefined) {
          if (leave.leaveType !== 'Unpaid' && leave.employee.leaveBalance[balanceKey] < leave.totalDays) {
            return res.status(400).json({ success: false, message: `Insufficient ${leave.leaveType} leave balance` });
          }
          leave.employee.leaveBalance[balanceKey] = Math.max(0, (leave.employee.leaveBalance[balanceKey] || 0) - leave.totalDays);
          await leave.employee.save();
        }

        await leave.save();

        const days = Math.max(1, Math.ceil(leave.totalDays));
        for (let i = 0; i < days; i += 1) {
          const leaveDate = new Date(leave.fromDate);
          leaveDate.setDate(leaveDate.getDate() + i);
          leaveDate.setHours(0, 0, 0, 0);
          await Attendance.findOneAndUpdate(
            { employee: leave.employee._id, date: leaveDate },
            {
              employee: leave.employee._id,
              date: leaveDate,
              status: 'Leave',
              leaveType: leave.leaveType,
              leaveReason: leave.reason,
              approvedBy: req.user.id,
              isApproved: true,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }

        await logAction(req, 'APPROVE', 'Leave', leave._id, previous, leave.toObject(), `${leave.employee.firstName} ${leave.employee.lastName}`);
        if (leave.employee.user) {
          if (leave.employee.user.email) {
            await sendEmail(leave.employee.user.email, 'leaveStatusUpdate', [
              leave.employee.firstName,
              'Approved',
              leave.fromDate.toDateString(),
              leave.toDate.toDateString(),
            ]);
          }

          await Notification.create({
            recipient: leave.employee.user._id,
            title: 'Leave Approved',
            message: `Your ${leave.leaveType} leave from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been fully approved by HR.`,
            type: 'success',
            link: '/my-leaves'
          });
        }

        return res.json({ success: true, message: 'Leave approved successfully', data: leave });
      }
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/leaves/:id/reject
// @desc    Reject leave
// @access  Private/Manager+
router.put(
  '/:id/reject',
  protect,
  managerOrHR,
  [body('reviewRemarks').optional().isString().isLength({ max: 1000 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const leave = await Leave.findById(req.params.id).populate({
        path: 'employee',
        populate: { path: 'user', select: 'email firstName' },
      });
      if (!leave) {
        return res.status(404).json({ success: false, message: 'Leave not found' });
      }
      const canManage = await canUserManageEmployee(req.user, leave.employee._id);
      if (!canManage) {
        return res.status(403).json({ success: false, message: 'Not authorized to reject this employee leave' });
      }

      const previous = leave.toObject();
      leave.status = 'Rejected';
      leave.reviewedBy = req.user.id;
      leave.reviewedOn = new Date();
      leave.reviewRemarks = req.body.reviewRemarks || '';
      await leave.save();

      await logAction(req, 'REJECT', 'Leave', leave._id, previous, leave.toObject(), `${leave.employee.firstName} ${leave.employee.lastName}`);
      if (leave.employee.user) {
        if (leave.employee.user.email) {
          await sendEmail(leave.employee.user.email, 'leaveStatusUpdate', [
            leave.employee.firstName,
            'Rejected',
            leave.fromDate.toDateString(),
            leave.toDate.toDateString(),
          ]);
        }

        await Notification.create({
          recipient: leave.employee.user._id,
          title: 'Leave Rejected',
          message: `Your ${leave.leaveType} leave from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been rejected.`,
          type: 'error',
          link: '/my-leaves'
        });
      }

      res.json({ success: true, message: 'Leave rejected successfully', data: leave });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/leaves/:id/cancel
// @desc    Cancel leave request by employee
// @access  Private
router.put(
  '/:id/cancel',
  protect,
  [body('reviewRemarks').optional().isString().isLength({ max: 1000 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const employee = await Employee.findOne({ user: req.user.id });
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee profile not found' });
      }

      const leave = await Leave.findById(req.params.id);
      if (!leave) {
        return res.status(404).json({ success: false, message: 'Leave not found' });
      }

      if (leave.employee.toString() !== employee._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this leave' });
      }

      if (['Rejected', 'Cancelled'].includes(leave.status)) {
        return res.status(400).json({ success: false, message: `Cannot cancel leave in ${leave.status} state` });
      }

      const previous = leave.toObject();
      leave.status = 'Cancelled';
      leave.reviewRemarks = req.body.reviewRemarks || leave.reviewRemarks;
      await leave.save();

      if (previous.status === 'Approved') {
        await Attendance.deleteMany({
          employee: leave.employee,
          date: { $gte: new Date(leave.fromDate), $lte: new Date(leave.toDate) },
          status: 'Leave',
        });
      }

      await logAction(req, 'UPDATE', 'Leave', leave._id, previous, leave.toObject(), employee.employeeId);
      res.json({ success: true, message: 'Leave cancelled successfully', data: leave });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
