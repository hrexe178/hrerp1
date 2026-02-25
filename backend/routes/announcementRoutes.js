const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { protect, adminOrHR } = require('../middleware/auth');
const { logAction } = require('../services/auditService');
const { sendEmail } = require('../services/emailService');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// @route   GET /api/announcements
// @desc    Get announcements visible to current user
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const now = new Date();
    const employee = await Employee.findOne({ user: req.user.id }).select('department');

    const visibilityConditions = [
      { targetAudience: 'All' },
      ...(employee?.department ? [{ targetAudience: 'Department', targetDept: employee.department }] : []),
      ...(employee?._id ? [{ targetAudience: 'Specific', targetEmployees: employee._id }] : []),
    ];

    const query = {
      isActive: true,
      publishDate: { $lte: now },
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }],
      $and: [{ $or: visibilityConditions }],
    };

    const [rows, total] = await Promise.all([
      Announcement.find(query)
        .populate('postedBy', 'firstName lastName role')
        .sort({ publishDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Announcement.countDocuments(query),
    ]);

    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/announcements/admin/all
// @desc    Get all announcements for management
// @access  Private/Admin+HR
router.get('/admin/all', protect, adminOrHR, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { active } = req.query;
    const query = {};
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;

    const [rows, total] = await Promise.all([
      Announcement.find(query)
        .populate('postedBy', 'firstName lastName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Announcement.countDocuments(query),
    ]);

    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/announcements
// @desc    Create announcement
// @access  Private/Admin+HR
router.post(
  '/',
  protect,
  adminOrHR,
  [
    body('title', 'Title is required').notEmpty(),
    body('message', 'Message is required').notEmpty(),
    body('targetAudience').optional().isIn(['All', 'Department', 'Specific']),
    body('targetDept').optional().isString(),
    body('targetEmployees').optional().isArray(),
    body('publishDate').optional().isISO8601(),
    body('expiryDate').optional().isISO8601(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const payload = { ...req.body, postedBy: req.user.id };
      const created = await Announcement.create(payload);
      await created.populate('postedBy', 'firstName lastName role');

      // Broadcast mail based on target audience.
      let usersToNotify = [];
      if (created.targetAudience === 'All') {
        usersToNotify = await User.find({ isActive: true }).select('email firstName');
      } else if (created.targetAudience === 'Department' && created.targetDept) {
        const employees = await Employee.find({ department: created.targetDept }).populate('user', 'email firstName');
        usersToNotify = employees.map((row) => row.user).filter(Boolean);
      } else if (created.targetAudience === 'Specific' && created.targetEmployees?.length) {
        const employees = await Employee.find({ _id: { $in: created.targetEmployees } }).populate('user', 'email firstName');
        usersToNotify = employees.map((row) => row.user).filter(Boolean);
      }

      for (const user of usersToNotify) {
        if (user?.email) {
          await sendEmail(user.email, 'announcementPublished', [user.firstName || 'User', created.title]);
        }
      }

      await logAction(req, 'CREATE', 'Announcement', created._id, null, created.toObject(), created.title);
      res.status(201).json({ success: true, message: 'Announcement created successfully', data: created });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private/Admin+HR
router.put(
  '/:id',
  protect,
  adminOrHR,
  [
    body('title').optional().notEmpty(),
    body('message').optional().notEmpty(),
    body('targetAudience').optional().isIn(['All', 'Department', 'Specific']),
    body('targetDept').optional().isString(),
    body('targetEmployees').optional().isArray(),
    body('publishDate').optional().isISO8601(),
    body('expiryDate').optional().isISO8601(),
    body('isActive').optional().isBoolean(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const existing = await Announcement.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }
      const previous = existing.toObject();
      const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
        'postedBy',
        'firstName lastName role'
      );

      await logAction(req, 'UPDATE', 'Announcement', updated._id, previous, updated.toObject(), updated.title);
      res.json({ success: true, message: 'Announcement updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/announcements/:id
// @desc    Deactivate announcement
// @access  Private/Admin+HR
router.delete('/:id', protect, adminOrHR, async (req, res, next) => {
  try {
    const existing = await Announcement.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    const previous = existing.toObject();
    existing.isActive = false;
    await existing.save();
    await logAction(req, 'DELETE', 'Announcement', existing._id, previous, existing.toObject(), existing.title);

    res.json({ success: true, message: 'Announcement deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
