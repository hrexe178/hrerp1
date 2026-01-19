const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { protect, adminOrHR } = require('../middleware/auth');

// @route   GET /api/attendance
// @desc    Get attendance records with filters
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    let query = {};

    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('approvedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/attendance/employee/:employeeId
// @desc    Get attendance for specific employee
// @access  Private
router.get('/employee/:employeeId', protect, async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ employee: req.params.employeeId })
      .populate('employee', 'firstName lastName employeeId')
      .sort({ date: -1 });

    res.json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/attendance/report/:month/:year
// @desc    Get monthly attendance report
// @access  Private/Admin
router.get('/report/:month/:year', protect, adminOrHR, async (req, res, next) => {
  try {
    const { month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ date: 1 });

    // Calculate statistics
    const stats = {};
    records.forEach((record) => {
      const empId = record.employee._id.toString();
      if (!stats[empId]) {
        stats[empId] = {
          employee: record.employee,
          present: 0,
          absent: 0,
          halfDay: 0,
          leave: 0,
          holiday: 0,
          weekend: 0,
        };
      }

      const statusKey = record.status.toLowerCase().replace('-', '');
      if (statusKey === 'halfday') stats[empId].halfDay++;
      else if (statusKey in stats[empId]) stats[empId][statusKey]++;
    });

    res.json({
      success: true,
      month,
      year,
      statistics: Object.values(stats),
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/attendance
// @desc    Mark or create attendance
// @access  Private/Admin
router.post(
  '/',
  protect,
  adminOrHR,
  [
    body('employee', 'Employee is required').notEmpty(),
    body('date', 'Date is required').notEmpty(),
    body('status', 'Status is required').isIn(['Present', 'Absent', 'Half-Day', 'Leave', 'Holiday', 'Weekend']),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { employee, date, status } = req.body;

      // Check if attendance already exists for this date
      let attendance = await Attendance.findOne({
        employee,
        date: new Date(date).toDateString(),
      });

      if (attendance) {
        return res.status(400).json({
          success: false,
          message: 'Attendance already marked for this date',
        });
      }

      const attendanceData = {
        ...req.body,
        date: new Date(date),
      };

      if (status === 'Leave') {
        attendanceData.approvedBy = req.user.id;
      }

      attendance = await Attendance.create(attendanceData);

      await attendance.populate('employee', 'firstName lastName employeeId');
      await attendance.populate('approvedBy', 'firstName lastName');

      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/attendance/:id
// @desc    Update attendance
// @access  Private/Admin
router.put('/:id', protect, adminOrHR, async (req, res, next) => {
  try {
    let attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    }

    attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('employee', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private/Admin
router.delete('/:id', protect, adminOrHR, async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Attendance deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
