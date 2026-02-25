const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Holiday = require('../models/Holiday');
const { protect, adminOrHR, managerOrHR } = require('../middleware/auth');
const { logAction } = require('../services/auditService');
const { getManagerScopedEmployeeIds } = require('../services/managerScopeService');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const parseTimeToMinutes = (value) => {
  if (!value || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) return null;
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
};

const calculateShiftMetrics = (shift, checkInTime, checkOutTime) => {
  const metrics = { workHours: undefined, overtimeHours: undefined, lateByMinutes: undefined };
  const inMins = parseTimeToMinutes(checkInTime);
  const outMins = parseTimeToMinutes(checkOutTime);
  if (inMins === null || outMins === null) return metrics;

  const normalizedOut = outMins >= inMins ? outMins : outMins + 24 * 60;
  const totalWorkedMins = Math.max(0, normalizedOut - inMins);
  metrics.workHours = Number((totalWorkedMins / 60).toFixed(2));

  if (!shift) return metrics;

  const shiftStart = parseTimeToMinutes(shift.startTime);
  const shiftEndRaw = parseTimeToMinutes(shift.endTime);
  if (shiftStart === null || shiftEndRaw === null) return metrics;

  const shiftEnd = shiftEndRaw >= shiftStart ? shiftEndRaw : shiftEndRaw + 24 * 60;
  const shiftWorkMins = Math.max(0, shiftEnd - shiftStart - (shift.breakDuration || 0));
  const lateBy = Math.max(0, inMins - shiftStart - (shift.allowedLateMins || 0));
  const overtime = Math.max(0, totalWorkedMins - shiftWorkMins);

  metrics.expectedCheckInTime = shift.startTime;
  metrics.expectedCheckOutTime = shift.endTime;
  metrics.lateByMinutes = lateBy;
  metrics.overtimeHours = Number((overtime / 60).toFixed(2));

  return metrics;
};

// @route   GET /api/attendance/mine
router.get('/mine', protect, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee profile not found' });

    const { page, limit, skip } = parsePagination(req.query);
    const [rows, total] = await Promise.all([
      Attendance.find({ employee: employee._id }).sort({ date: -1 }).skip(skip).limit(limit),
      Attendance.countDocuments({ employee: employee._id }),
    ]);
    res.json({ success: true, count: rows.length, total, page, pages: Math.ceil(total / limit) || 1, data: rows });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/attendance
router.get('/', protect, async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};
    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user.id }).select('_id');
      if (!employee) return res.status(404).json({ success: false, message: 'Employee profile not found' });
      query.employee = employee._id;
    }
    if (req.user.role === 'manager') {
      const scopedIds = await getManagerScopedEmployeeIds(req.user);
      if (query.employee) {
        if (!scopedIds.map((id) => id.toString()).includes(String(query.employee))) {
          return res.status(403).json({ success: false, message: 'Not authorized to view this attendance' });
        }
      } else {
        query.employee = { $in: scopedIds };
      }
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('employee', 'firstName lastName employeeId department')
        .populate('approvedBy', 'firstName lastName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query),
    ]);

    res.json({ success: true, count: attendance.length, total, page, pages: Math.ceil(total / limit) || 1, data: attendance });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/attendance/employee/:employeeId
router.get('/employee/:employeeId', protect, async (req, res, next) => {
  try {
    if (req.user.role === 'employee') {
      const currentEmployee = await Employee.findOne({ user: req.user.id }).select('_id');
      if (!currentEmployee || currentEmployee._id.toString() !== req.params.employeeId) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this attendance' });
      }
    }
    if (req.user.role === 'manager') {
      const scopedIds = await getManagerScopedEmployeeIds(req.user);
      if (!scopedIds.map((id) => id.toString()).includes(req.params.employeeId)) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this attendance' });
      }
    }
    const { page, limit, skip } = parsePagination(req.query);
    const query = { employee: req.params.employeeId };
    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('employee', 'firstName lastName employeeId')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query),
    ]);
    res.json({ success: true, count: attendance.length, total, page, pages: Math.ceil(total / limit) || 1, data: attendance });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/attendance/report/:month/:year
router.get('/report/:month/:year', protect, managerOrHR, async (req, res, next) => {
  try {
    const { month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const query = { date: { $gte: startDate, $lte: endDate } };
    if (req.user.role === 'manager') {
      const scopedIds = await getManagerScopedEmployeeIds(req.user);
      query.employee = { $in: scopedIds };
    }

    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ date: 1 });

    const stats = {};
    records.forEach((record) => {
      const empId = record.employee._id.toString();
      if (!stats[empId]) {
        stats[empId] = { employee: record.employee, present: 0, absent: 0, halfDay: 0, leave: 0, holiday: 0, weekend: 0 };
      }
      const statusKey = record.status.toLowerCase().replace('-', '');
      if (statusKey === 'halfday') stats[empId].halfDay += 1;
      else if (statusKey in stats[empId]) stats[empId][statusKey] += 1;
    });
    res.json({ success: true, month, year, statistics: Object.values(stats) });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/attendance
router.post(
  '/',
  protect,
  adminOrHR,
  [
    body('employee', 'Employee is required').notEmpty(),
    body('date', 'Date is required').notEmpty(),
    body('status', 'Status is required').isIn(['Present', 'Absent', 'Half-Day', 'Leave', 'Holiday', 'Weekend']),
    body('checkInTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid check-in time'),
    body('checkOutTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid check-out time'),
    body('location').optional().isIn(['Office', 'Remote', 'Field', 'Client Site']),
    body('remarks').optional().isString().isLength({ max: 1000 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { employee, date, status } = req.body;
      const selectedDate = new Date(date);
      const dayStart = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 0, 0, 0, 0));
      const dayEnd = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 23, 59, 59, 999));

      const duplicate = await Attendance.findOne({ employee, date: { $gte: dayStart, $lte: dayEnd } });
      if (duplicate) return res.status(400).json({ success: false, message: 'Attendance already marked for this date' });

      const holiday = await Holiday.findOne({ date: { $gte: dayStart, $lte: dayEnd } });
      if (holiday && status !== 'Holiday') {
        return res.status(400).json({
          success: false,
          message: `Holiday detected (${holiday.name}). Mark status as Holiday for this date.`,
        });
      }

      const employeeDoc = await Employee.findById(employee).populate('assignedShift');
      if (!employeeDoc) return res.status(404).json({ success: false, message: 'Employee not found' });

      const attendanceData = { ...req.body, date: dayStart };
      if (status === 'Leave') attendanceData.approvedBy = req.user.id;

      if (['Present', 'Half-Day'].includes(status)) {
        const metrics = calculateShiftMetrics(employeeDoc.assignedShift, req.body.checkInTime, req.body.checkOutTime);
        Object.assign(attendanceData, metrics);
      }

      const attendance = await Attendance.create(attendanceData);
      await attendance.populate('employee', 'firstName lastName employeeId');
      await attendance.populate('approvedBy', 'firstName lastName');
      await logAction(req, 'CREATE', 'Attendance', attendance._id, null, attendance.toObject(), attendance.employee?.employeeId || '');

      res.status(201).json({ success: true, message: 'Attendance marked successfully', data: attendance });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/attendance/bulk
// @desc    Mark attendance for multiple employees
// @access  Private/Admin+
router.post(
  '/bulk',
  protect,
  adminOrHR,
  [
    body('employees').isArray({ min: 1 }).withMessage('Employees array is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('status').isIn(['Present', 'Absent', 'Holiday', 'Weekend']).withMessage('Invalid status'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { employees, date, status, remarks } = req.body;
      const selectedDate = new Date(date);
      const dayStart = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 0, 0, 0, 0));

      const results = { success: [], fail: [] };

      for (const empId of employees) {
        try {
          // Check for existing
          const existing = await Attendance.findOne({ employee: empId, date: dayStart });
          if (existing) {
            results.fail.push({ id: empId, reason: 'Already marked' });
            continue;
          }

          const attendance = await Attendance.create({
            employee: empId,
            date: dayStart,
            status,
            remarks: remarks || 'Bulk entry',
            location: 'Office'
          });
          results.success.push(empId);
        } catch (err) {
          results.fail.push({ id: empId, reason: err.message });
        }
      }

      await logAction(req, 'BULK_CREATE', 'Attendance', null, null, results, `Count: ${results.success.length}`);
      res.json({ success: true, message: `Processed ${employees.length} entries`, results });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/attendance/:id
router.put(
  '/:id',
  protect,
  adminOrHR,
  [
    body('date').optional().isISO8601().withMessage('Date must be valid'),
    body('status').optional().isIn(['Present', 'Absent', 'Half-Day', 'Leave', 'Holiday', 'Weekend']).withMessage('Invalid attendance status'),
    body('checkInTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid check-in time'),
    body('checkOutTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid check-out time'),
    body('location').optional().isIn(['Office', 'Remote', 'Field', 'Client Site']),
    body('remarks').optional().isString().isLength({ max: 1000 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const existing = await Attendance.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Attendance not found' });
      const previous = existing.toObject();

      const merged = { ...existing.toObject(), ...req.body };
      const employeeDoc = await Employee.findById(merged.employee).populate('assignedShift');

      if (merged.date) {
        const selectedDate = new Date(merged.date);
        const dayStart = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 0, 0, 0, 0));
        const dayEnd = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 23, 59, 59, 999));

        const holiday = await Holiday.findOne({ date: { $gte: dayStart, $lte: dayEnd } });
        if (holiday && merged.status !== 'Holiday') {
          return res.status(400).json({
            success: false,
            message: `Holiday detected (${holiday.name}). Mark status as Holiday for this date.`,
          });
        }
        req.body.date = dayStart;
      }

      if (['Present', 'Half-Day'].includes(merged.status)) {
        const metrics = calculateShiftMetrics(employeeDoc?.assignedShift, merged.checkInTime, merged.checkOutTime);
        Object.assign(req.body, metrics);
      }

      const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('employee', 'firstName lastName employeeId')
        .populate('approvedBy', 'firstName lastName');

      await logAction(req, 'UPDATE', 'Attendance', attendance._id, previous, attendance.toObject(), attendance.employee?.employeeId || '');
      res.json({ success: true, message: 'Attendance updated successfully', data: attendance });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/attendance/:id
router.delete('/:id', protect, adminOrHR, async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
    const previous = attendance.toObject();

    await Attendance.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE', 'Attendance', attendance._id, previous, null, '');
    res.json({ success: true, message: 'Attendance deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
