const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { protect, adminOrHR } = require('../middleware/auth');
const { logAction } = require('../services/auditService');
const { sendEmail } = require('../services/emailService');
const { generatePayslipPdf } = require('../services/payslipService');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const sumValues = (obj = {}) => Object.values(obj).reduce((acc, value) => acc + (Number(value) || 0), 0);

// @route   POST /api/payroll
// @desc    Create/process payroll
// @access  Private/Admin+HR
router.post(
  '/',
  protect,
  adminOrHR,
  [
    body('employee').notEmpty().withMessage('employee is required'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('month must be 1-12'),
    body('year').isInt({ min: 2000, max: 2100 }).withMessage('year is invalid'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { employee, month, year } = req.body;
      const employeeDoc = await Employee.findById(employee);
      if (!employeeDoc) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      const periodStart = new Date(Number(year), Number(month) - 1, 1);
      const periodEnd = new Date(Number(year), Number(month), 0);
      const attendanceRows = await Attendance.find({
        employee,
        date: { $gte: periodStart, $lte: periodEnd },
      }).select('status');
      const presentDays = attendanceRows.filter((row) => row.status === 'Present' || row.status === 'Half-Day').length;
      const leaveDays = attendanceRows.filter((row) => row.status === 'Leave').length;
      const workingDays = periodEnd.getDate();

      const basicSalary = Number(req.body.basicSalary ?? employeeDoc.salary ?? 0);
      const allowances = req.body.allowances || {};
      const deductions = req.body.deductions || {};
      const grossSalary = basicSalary + sumValues(allowances);
      const netSalary = grossSalary - sumValues(deductions);

      const existing = await Payroll.findOne({ employee, month, year });
      if (existing) {
        const previous = existing.toObject();
        existing.basicSalary = basicSalary;
        existing.allowances = allowances;
        existing.deductions = deductions;
        existing.grossSalary = grossSalary;
        existing.netSalary = netSalary;
        existing.workingDays = workingDays;
        existing.presentDays = presentDays;
        existing.leaveDays = leaveDays;
        existing.status = 'Processed';
        await existing.save();
        await logAction(req, 'UPDATE', 'Payroll', existing._id, previous, existing.toObject(), employeeDoc.employeeId);
        return res.json({ success: true, message: 'Payroll updated successfully', data: existing });
      }

      const payroll = await Payroll.create({
        employee,
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        grossSalary,
        netSalary,
        workingDays,
        presentDays,
        leaveDays,
        status: 'Processed',
      });
      await payroll.populate('employee', 'firstName lastName employeeId');

      await logAction(req, 'CREATE', 'Payroll', payroll._id, null, payroll.toObject(), employeeDoc.employeeId);
      res.status(201).json({ success: true, message: 'Payroll processed successfully', data: payroll });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/payroll/mine
// @desc    Current user's payroll records
// @access  Private
router.get('/mine', protect, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const query = { employee: employee._id };
    const [rows, total] = await Promise.all([
      Payroll.find(query).sort({ year: -1, month: -1 }).skip(skip).limit(limit),
      Payroll.countDocuments(query),
    ]);

    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/payroll
// @desc    List payroll records
// @access  Private/Admin+HR
router.get('/', protect, adminOrHR, async (req, res, next) => {
  try {
    const { employee, month, year, status } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};
    if (employee) query.employee = employee;
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (status) query.status = status;

    const [rows, total] = await Promise.all([
      Payroll.find(query)
        .populate('employee', 'firstName lastName employeeId department')
        .sort({ year: -1, month: -1 })
        .skip(skip)
        .limit(limit),
      Payroll.countDocuments(query),
    ]);

    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/payroll/:id/release
// @desc    Release payroll
// @access  Private/Admin+HR
router.put(
  '/:id/release',
  protect,
  adminOrHR,
  [
    body('paymentDate').optional().isISO8601().withMessage('Payment date must be valid'),
    body('paymentMethod')
      .optional()
      .isIn(['Bank Transfer', 'Cheque', 'Cash'])
      .withMessage('Invalid payment method'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const payroll = await Payroll.findById(req.params.id).populate({
        path: 'employee',
        populate: { path: 'user', select: 'email firstName' },
      });
      if (!payroll) {
        return res.status(404).json({ success: false, message: 'Payroll not found' });
      }

      const previous = payroll.toObject();
      payroll.status = 'Released';
      payroll.paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
      payroll.paymentMethod = req.body.paymentMethod || payroll.paymentMethod || 'Bank Transfer';

      const pdfResult = await generatePayslipPdf({ payroll, employee: payroll.employee });
      payroll.payslipUrl = `/generated-payslips/${pdfResult.filename}`;
      await payroll.save();

      await logAction(req, 'APPROVE', 'Payroll', payroll._id, previous, payroll.toObject(), payroll.employee.employeeId);
      if (payroll.employee.user?.email) {
        await sendEmail(payroll.employee.user.email, 'payslipReady', [
          payroll.employee.firstName,
          payroll.month,
          payroll.year,
          payroll.payslipUrl,
        ]);
      }

      res.json({ success: true, message: 'Payroll released successfully', data: payroll });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
