const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const { protect, adminOrHR } = require('../middleware/auth');
const { logAction } = require('../services/auditService');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// @route   GET /api/shifts
// @desc    Get all shifts
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};
    if (req.query.active === 'true') query.isActive = true;
    if (req.query.active === 'false') query.isActive = false;

    const [rows, total] = await Promise.all([
      Shift.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Shift.countDocuments(query),
    ]);
    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/shifts
// @desc    Create shift
// @access  Private/Admin+HR
router.post(
  '/',
  protect,
  adminOrHR,
  [
    body('name').notEmpty(),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body('workDays').optional().isArray(),
    body('breakDuration').optional().isInt({ min: 0, max: 360 }),
    body('allowedLateMins').optional().isInt({ min: 0, max: 180 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const created = await Shift.create(req.body);
      await logAction(req, 'CREATE', 'Shift', created._id, null, created.toObject(), created.name);
      res.status(201).json({ success: true, message: 'Shift created successfully', data: created });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/shifts/:id
// @desc    Update shift
// @access  Private/Admin+HR
router.put(
  '/:id',
  protect,
  adminOrHR,
  [
    body('name').optional().notEmpty(),
    body('startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body('endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body('workDays').optional().isArray(),
    body('breakDuration').optional().isInt({ min: 0, max: 360 }),
    body('allowedLateMins').optional().isInt({ min: 0, max: 180 }),
    body('isActive').optional().isBoolean(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const existing = await Shift.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Shift not found' });
      const previous = existing.toObject();

      const updated = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      await logAction(req, 'UPDATE', 'Shift', updated._id, previous, updated.toObject(), updated.name);
      res.json({ success: true, message: 'Shift updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/shifts/:id
// @desc    Deactivate shift
// @access  Private/Admin+HR
router.delete('/:id', protect, adminOrHR, async (req, res, next) => {
  try {
    const existing = await Shift.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Shift not found' });
    const previous = existing.toObject();

    existing.isActive = false;
    await existing.save();
    await logAction(req, 'DELETE', 'Shift', existing._id, previous, existing.toObject(), existing.name);
    res.json({ success: true, message: 'Shift deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/shifts/:id/assign/:employeeId
// @desc    Assign shift to employee
// @access  Private/Admin+HR
router.put('/:id/assign/:employeeId', protect, adminOrHR, async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift || !shift.isActive) {
      return res.status(404).json({ success: false, message: 'Shift not found or inactive' });
    }

    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const previous = employee.toObject();
    employee.assignedShift = shift._id;
    await employee.save();
    await employee.populate('assignedShift');
    await logAction(req, 'UPDATE', 'Employee', employee._id, previous, employee.toObject(), employee.employeeId);

    res.json({ success: true, message: 'Shift assigned successfully', data: employee });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
