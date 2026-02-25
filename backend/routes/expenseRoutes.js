const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { protect, managerOrHR } = require('../middleware/auth');
const { logAction } = require('../services/auditService');
const { canUserManageEmployee, getManagerScopedEmployeeIds } = require('../services/managerScopeService');
const expenseService = require('../services/expenseService');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// @route   POST /api/expenses
// @desc    Submit expense
// @access  Private
router.post(
  '/',
  protect,
  [
    body('category').isIn(['Travel', 'Meals', 'Supplies', 'Medical', 'Internet', 'Training', 'Other']),
    body('amount').isFloat({ gt: 0 }),
    body('description').notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const expense = await expenseService.submitExpense(req.user.id, {
        category: req.body.category,
        amount: req.body.amount,
        description: req.body.description,
        receiptUrl: req.body.receiptUrl,
      });

      res.status(201).json({ success: true, message: 'Expense submitted successfully', data: expense });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/expenses/mine
// @desc    Get current user's expenses
// @access  Private
router.get('/mine', protect, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.json({ success: true, count: 0, total: 0, page: 1, pages: 1, data: [] });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const query = { employee: employee._id };
    if (req.query.status) query.status = req.query.status;
    const [rows, total] = await Promise.all([
      Expense.find(query).sort({ submittedOn: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(query),
    ]);
    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/expenses
// @desc    Get all expenses
// @access  Private/Manager+
router.get('/', protect, managerOrHR, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};
    if (req.query.employee) query.employee = req.query.employee;
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.fromDate || req.query.toDate) {
      query.submittedOn = {};
      if (req.query.fromDate) query.submittedOn.$gte = new Date(req.query.fromDate);
      if (req.query.toDate) query.submittedOn.$lte = new Date(req.query.toDate);
    }
    if (req.user.role === 'manager') {
      const scopedEmployeeIds = await getManagerScopedEmployeeIds(req.user);
      query.employee = { $in: scopedEmployeeIds };
    }

    const [rows, total] = await Promise.all([
      Expense.find(query)
        .populate('employee', 'firstName lastName employeeId department')
        .populate('approvedBy', 'firstName lastName role')
        .sort({ submittedOn: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(query),
    ]);
    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/expenses/report/monthly
// @desc    Monthly expense summary by employee
// @access  Private/Manager+
router.get('/report/monthly', protect, managerOrHR, async (req, res, next) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'Valid month and year are required' });
    }

    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const report = await Expense.aggregate([
      {
        $match: {
          submittedOn: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$employee',
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          approvedAmount: {
            $sum: {
              $cond: [{ $in: ['$status', ['Approved', 'Paid']] }, '$amount', 0],
            },
          },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          _id: 0,
          employeeId: '$employee.employeeId',
          employeeName: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] },
          department: '$employee.department',
          totalAmount: 1,
          totalCount: 1,
          approvedAmount: 1,
          paidAmount: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({ success: true, month, year, data: report });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/expenses/:id/approve
// @desc    Approve expense
// @access  Private/Manager+
router.put(
  '/:id/approve',
  protect,
  managerOrHR,
  [body('reviewRemarks').optional().isString().isLength({ max: 1000 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const expense = await Expense.findById(req.params.id).populate('employee', 'employeeId');
      if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
      const canManage = await canUserManageEmployee(req.user, expense.employee._id);
      if (!canManage) return res.status(403).json({ success: false, message: 'Not authorized to approve this expense' });

      const isManager = req.user.role === 'manager';
      const isHR = req.user.role === 'hr' || req.user.role === 'admin';

      const previous = expense.toObject();

      if (isManager && !isHR) {
        if (expense.status !== 'Pending') {
          return res.status(400).json({ success: false, message: 'Expense applies for manager approval only in Pending state.' });
        }

        expense.status = 'Manager Approved';
        expense.managerReviewedBy = req.user.id;
        expense.managerReviewedOn = new Date();
        expense.managerReviewRemarks = req.body.reviewRemarks || '';
        await expense.save();
        await logAction(req, 'MANAGER_APPROVE', 'Expense', expense._id, previous, expense.toObject(), expense.employee?.employeeId || '');

        if (expense.employee.user) {
          await Notification.create({
            recipient: expense.employee.user,
            title: 'Expense Manager Approved',
            message: `Your expense request for ${expense.category} ($${expense.amount}) has been manager approved. It will now be reviewed by HR.`,
            type: 'info',
            link: '/expenses'
          });
        }
        return res.json({ success: true, message: 'Expense manager approved successfully', data: expense });
      }

      if (isHR) {
        if (expense.status === 'Approved' || expense.status === 'Rejected' || expense.status === 'Paid') {
          return res.status(400).json({ success: false, message: `Expense cannot be approved from ${expense.status} state` });
        }

        expense.status = 'Approved';
        expense.approvedBy = req.user.id;
        expense.reviewedOn = new Date();
        expense.reviewRemarks = req.body.reviewRemarks || expense.reviewRemarks || '';
        await expense.save();
        await logAction(req, 'APPROVE', 'Expense', expense._id, previous, expense.toObject(), expense.employee?.employeeId || '');

        if (expense.employee.user) {
          await Notification.create({
            recipient: expense.employee.user,
            title: 'Expense Approved',
            message: `Your expense request for ${expense.category} ($${expense.amount}) has been fully approved by HR.`,
            type: 'success',
            link: '/expenses'
          });
        }

        return res.json({ success: true, message: 'Expense approved successfully', data: expense });
      }
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/expenses/:id/reject
// @desc    Reject expense
// @access  Private/Manager+
router.put(
  '/:id/reject',
  protect,
  managerOrHR,
  [body('reviewRemarks').optional().isString().isLength({ max: 1000 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const expense = await Expense.findById(req.params.id).populate('employee', 'employeeId');
      if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
      const canManage = await canUserManageEmployee(req.user, expense.employee._id);
      if (!canManage) return res.status(403).json({ success: false, message: 'Not authorized to reject this expense' });

      const previous = expense.toObject();
      expense.status = 'Rejected';
      expense.approvedBy = req.user.id;
      expense.reviewedOn = new Date();
      expense.reviewRemarks = req.body.reviewRemarks || '';
      await expense.save();
      await logAction(req, 'REJECT', 'Expense', expense._id, previous, expense.toObject(), expense.employee?.employeeId || '');

      if (expense.employee.user) {
        await Notification.create({
          recipient: expense.employee.user,
          title: 'Expense Rejected',
          message: `Your expense request for ${expense.category} ($${expense.amount}) has been rejected.`,
          type: 'error',
          link: '/expenses'
        });
      }

      res.json({ success: true, message: 'Expense rejected successfully', data: expense });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/expenses/:id/pay
// @desc    Mark expense as paid
// @access  Private/Manager+
router.put(
  '/:id/pay',
  protect,
  managerOrHR,
  [body('paymentDate').optional().isISO8601().withMessage('Payment date must be valid')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const expense = await Expense.findById(req.params.id).populate('employee', 'employeeId');
      if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
      const canManage = await canUserManageEmployee(req.user, expense.employee._id);
      if (!canManage) return res.status(403).json({ success: false, message: 'Not authorized to pay this expense' });

      const previous = expense.toObject();
      expense.status = 'Paid';
      expense.paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
      await expense.save();
      await logAction(req, 'APPROVE', 'Expense', expense._id, previous, expense.toObject(), expense.employee?.employeeId || '');

      if (expense.employee.user) {
        await Notification.create({
          recipient: expense.employee.user,
          title: 'Expense Paid',
          message: `Your expense request for ${expense.category} ($${expense.amount}) has been marked as Paid.`,
          type: 'info',
          link: '/expenses'
        });
      }

      res.json({ success: true, message: 'Expense marked as paid', data: expense });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
