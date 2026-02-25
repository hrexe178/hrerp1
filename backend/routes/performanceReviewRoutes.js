const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PerformanceReview = require('../models/PerformanceReview');
const Employee = require('../models/Employee');
const { protect, managerOrHR, adminOrHR } = require('../middleware/auth');
const { logAction } = require('../services/auditService');
const { sendEmail } = require('../services/emailService');
const { canUserManageEmployee, getManagerScopedEmployeeIds } = require('../services/managerScopeService');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// @route   POST /api/performance-reviews
// @desc    Create review cycle record for employee
// @access  Private/Admin+HR
router.post(
  '/',
  protect,
  adminOrHR,
  [
    body('employee').notEmpty(),
    body('reviewCycle').notEmpty(),
    body('reviewPeriod.startDate').isISO8601(),
    body('reviewPeriod.endDate').isISO8601(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const employee = await Employee.findById(req.body.employee);
      if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

      const created = await PerformanceReview.create({
        ...req.body,
        createdBy: req.user.id,
      });
      await created.populate({
        path: 'employee',
        select: 'firstName lastName employeeId department user',
        populate: { path: 'user', select: 'email firstName' },
      });
      await logAction(req, 'CREATE', 'PerformanceReview', created._id, null, created.toObject(), `${employee.employeeId}-${created.reviewCycle}`);
      if (created.employee?.user?.email) {
        await sendEmail(created.employee.user.email, 'performanceReviewStatus', [created.employee.firstName, created.reviewCycle, 'Draft']);
      }

      res.status(201).json({ success: true, message: 'Performance review created successfully', data: created });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/performance-reviews/stats
// @desc    Get aggregate performance stats for charts
// @access  Private/Admin+HR
router.get('/stats', protect, adminOrHR, async (req, res, next) => {
  try {
    const pipeline = [
      { $match: { status: 'Completed', overallRating: { $ne: null } } },
      {
        $group: {
          _id: '$reviewCycle',
          averageRating: { $avg: '$overallRating' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Basic sort by cycle string (e.g., '2026-01')
    ];

    const stats = await PerformanceReview.aggregate(pipeline);

    // Format for recharts
    const formattedStats = stats.map(stat => ({
      name: stat._id,
      rating: Number(stat.averageRating.toFixed(2)),
      reviews: stat.count
    }));

    res.json({ success: true, data: formattedStats });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/performance-reviews/mine
// @desc    Get current user's reviews
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
      PerformanceReview.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PerformanceReview.countDocuments(query),
    ]);
    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/performance-reviews
// @desc    Get all reviews
// @access  Private/Manager+
router.get('/', protect, managerOrHR, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};
    if (req.query.employee) query.employee = req.query.employee;
    if (req.query.status) query.status = req.query.status;
    if (req.query.reviewCycle) query.reviewCycle = req.query.reviewCycle;
    if (req.user.role === 'manager') {
      const scopedEmployeeIds = await getManagerScopedEmployeeIds(req.user);
      query.employee = { $in: scopedEmployeeIds };
    }

    const [rows, total] = await Promise.all([
      PerformanceReview.find(query)
        .populate('employee', 'firstName lastName employeeId department reportingManager')
        .populate('createdBy', 'firstName lastName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PerformanceReview.countDocuments(query),
    ]);
    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/performance-reviews/:id/self-submit
// @desc    Employee submits self assessment
// @access  Private
router.put(
  '/:id/self-submit',
  protect,
  [
    body('selfAssessment').optional().isString().isLength({ max: 5000 }),
    body('kpis').optional().isArray(),
    body('goals').optional().isArray(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const employee = await Employee.findOne({ user: req.user.id });
      if (!employee) return res.status(404).json({ success: false, message: 'Employee profile not found' });

      const review = await PerformanceReview.findById(req.params.id).populate({
        path: 'employee',
        select: 'firstName lastName user',
        populate: { path: 'user', select: 'email firstName' },
      });
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
      if (review.employee.toString() !== employee._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized for this review' });
      }

      const previous = review.toObject();
      review.selfAssessment = req.body.selfAssessment || review.selfAssessment;
      review.kpis = req.body.kpis || review.kpis;
      review.goals = req.body.goals || review.goals;
      review.status = 'Submitted';
      await review.save();
      await logAction(req, 'UPDATE', 'PerformanceReview', review._id, previous, review.toObject(), review.reviewCycle);
      if (review.employee?.user?.email) {
        await sendEmail(review.employee.user.email, 'performanceReviewStatus', [review.employee.firstName, review.reviewCycle, 'Submitted']);
      }

      res.json({ success: true, message: 'Self assessment submitted', data: review });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/performance-reviews/:id/manager-review
// @desc    Manager/HR review
// @access  Private/Manager+
router.put(
  '/:id/manager-review',
  protect,
  managerOrHR,
  [
    body('managerAssessment').optional().isString().isLength({ max: 5000 }),
    body('finalRating').optional().isFloat({ min: 1, max: 5 }),
    body('overallRating').optional().isFloat({ min: 1, max: 5 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const review = await PerformanceReview.findById(req.params.id).populate({
        path: 'employee',
        select: 'firstName lastName user',
        populate: { path: 'user', select: 'email firstName' },
      });
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
      const canManage = await canUserManageEmployee(req.user, review.employee._id);
      if (!canManage) return res.status(403).json({ success: false, message: 'Not authorized to review this employee' });
      const previous = review.toObject();

      review.managerAssessment = req.body.managerAssessment || review.managerAssessment;
      review.finalRating = req.body.finalRating ?? review.finalRating;
      review.overallRating = req.body.overallRating ?? review.overallRating;
      review.status = 'Under Review';
      await review.save();
      await logAction(req, 'UPDATE', 'PerformanceReview', review._id, previous, review.toObject(), review.reviewCycle);
      if (review.employee?.user?.email) {
        await sendEmail(review.employee.user.email, 'performanceReviewStatus', [review.employee.firstName, review.reviewCycle, 'Under Review']);
      }

      res.json({ success: true, message: 'Manager review updated', data: review });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/performance-reviews/:id/complete
// @desc    Finalize review
// @access  Private/Admin+HR
router.put(
  '/:id/complete',
  protect,
  adminOrHR,
  [
    body('finalRating').optional().isFloat({ min: 1, max: 5 }),
    body('overallRating').optional().isFloat({ min: 1, max: 5 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const review = await PerformanceReview.findById(req.params.id).populate({
        path: 'employee',
        select: 'firstName lastName user',
        populate: { path: 'user', select: 'email firstName' },
      });
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
      const previous = review.toObject();

      review.finalRating = req.body.finalRating ?? review.finalRating;
      review.overallRating = req.body.overallRating ?? review.overallRating;
      review.status = 'Completed';
      await review.save();
      await logAction(req, 'APPROVE', 'PerformanceReview', review._id, previous, review.toObject(), review.reviewCycle);
      if (review.employee?.user?.email) {
        await sendEmail(review.employee.user.email, 'performanceReviewStatus', [review.employee.firstName, review.reviewCycle, 'Completed']);
      }

      res.json({ success: true, message: 'Performance review completed', data: review });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
