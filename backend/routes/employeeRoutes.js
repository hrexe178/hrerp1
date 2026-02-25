const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, admin, adminOrHR } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { employeeSchema } = require('../schemas/employeeSchema');
const employeeService = require('../services/employeeService');
const Employee = require('../models/Employee');
const { logAction } = require('../services/auditService');

// @route   GET /api/employees
// @desc    Get all employees with filters
// @access  Private/Admin/HR
router.get('/', protect, adminOrHR, asyncHandler(async (req, res) => {
  const { page = 1, limit = 100, status, department } = req.query;
  const filter = {};
  if (status) filter.employmentStatus = status;
  if (department) filter.department = department;

  const result = await employeeService.getAllEmployees(filter, { page, limit });
  res.json({ success: true, ...result });
}));

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private/Admin/HR
router.post(
  '/',
  protect,
  adminOrHR,
  validate(employeeSchema),
  asyncHandler(async (req, res) => {
    const { employee, credentials } = await employeeService.createEmployee(req.body, req);
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
      credentials,
    });
  })
);

// @route   GET /api/employees/stats/summary
// @desc    Get summary stats
// @access  Private/Admin/HR
router.get('/stats/summary', protect, adminOrHR, asyncHandler(async (req, res) => {
  const total = await Employee.countDocuments();
  const active = await Employee.countDocuments({ employmentStatus: 'Active' });
  const inactive = await Employee.countDocuments({ employmentStatus: 'Inactive' });
  const onLeave = await Employee.countDocuments({ employmentStatus: 'On-Leave' });

  const byDepartment = await Employee.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    data: {
      totalEmployees: total,
      activeEmployees: active,
      inactiveEmployees: inactive,
      onLeaveEmployees: onLeave,
      byDepartment
    },
  });
}));

// @route   GET /api/employees/:id
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('user', 'firstName lastName email role')
    .populate('reportingManager', 'firstName lastName employeeId');

  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  res.json({ success: true, data: employee });
}));

// @route   PUT /api/employees/:id
router.put('/:id', protect, adminOrHR, asyncHandler(async (req, res) => {
  const existing = await Employee.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  const previous = existing.toObject();
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('user', 'firstName lastName email role');

  await logAction(req, 'UPDATE', 'Employee', employee._id, previous, employee.toObject(), employee.employeeId);
  res.json({ success: true, message: 'Employee updated successfully', data: employee });
}));

// @route   DELETE /api/employees/:id
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  const previous = employee.toObject();
  await Employee.findByIdAndDelete(req.params.id);
  await logAction(req, 'DELETE', 'Employee', employee._id, previous, null, employee.employeeId);
  res.json({ success: true, message: 'Employee deleted successfully' });
}));

module.exports = router;
