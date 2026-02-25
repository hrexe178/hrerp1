const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Holiday = require('../models/Holiday');
const { protect, adminOrHR } = require('../middleware/auth');
const { logAction } = require('../services/auditService');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// @route   GET /api/holidays
// @desc    Get holiday calendar
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { year, type, month } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    if (year) query.year = Number(year);
    if (type) query.type = type;

    if (month) {
      const parsedYear = Number(year) || new Date().getUTCFullYear();
      const monthIndex = Number(month) - 1;
      const start = new Date(Date.UTC(parsedYear, monthIndex, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(parsedYear, monthIndex + 1, 0, 23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    const [rows, total] = await Promise.all([
      Holiday.find(query).sort({ date: 1 }).skip(skip).limit(limit),
      Holiday.countDocuments(query),
    ]);

    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/holidays
// @desc    Create holiday
// @access  Private/Admin+HR
router.post(
  '/',
  protect,
  adminOrHR,
  [
    body('name', 'Holiday name is required').notEmpty(),
    body('date', 'Holiday date is required').isISO8601(),
    body('type', 'Holiday type is required').isIn(['National', 'Company', 'Optional']),
    body('description').optional().isString(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const payload = { ...req.body };
      if (!payload.year) payload.year = new Date(payload.date).getUTCFullYear();
      const created = await Holiday.create(payload);
      await logAction(req, 'CREATE', 'Holiday', created._id, null, created.toObject(), created.name);

      res.status(201).json({ success: true, message: 'Holiday created successfully', data: created });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/holidays/:id
// @desc    Update holiday
// @access  Private/Admin+HR
router.put(
  '/:id',
  protect,
  adminOrHR,
  [
    body('name').optional().notEmpty(),
    body('date').optional().isISO8601(),
    body('type').optional().isIn(['National', 'Company', 'Optional']),
    body('description').optional().isString(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const existing = await Holiday.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Holiday not found' });
      }

      const previous = existing.toObject();
      const updatedPayload = { ...req.body };
      if (updatedPayload.date && !updatedPayload.year) {
        updatedPayload.year = new Date(updatedPayload.date).getUTCFullYear();
      }
      const updated = await Holiday.findByIdAndUpdate(req.params.id, updatedPayload, {
        new: true,
        runValidators: true,
      });

      await logAction(req, 'UPDATE', 'Holiday', updated._id, previous, updated.toObject(), updated.name);
      res.json({ success: true, message: 'Holiday updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/holidays/:id
// @desc    Delete holiday
// @access  Private/Admin+HR
router.delete('/:id', protect, adminOrHR, async (req, res, next) => {
  try {
    const existing = await Holiday.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }
    const previous = existing.toObject();
    await Holiday.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE', 'Holiday', existing._id, previous, null, existing.name);

    res.json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
