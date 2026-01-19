const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { protect, admin, adminOrHR } = require('../middleware/auth');

// @route   GET /api/employees
// @desc    Get all employees with search and filters
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { search, department, status, employmentType } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) query.department = department;
    if (status) query.employmentStatus = status;
    if (employmentType) query.employmentType = employmentType;

    const employees = await Employee.find(query)
      .populate('user', 'firstName lastName email role')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('projects')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'firstName lastName email role')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('projects')
      .populate('performanceReviews.reviewedBy', 'firstName lastName');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private/Admin
router.post(
  '/',
  protect,
  adminOrHR,
  [
    body('firstName', 'First name is required').notEmpty(),
    body('lastName', 'Last name is required').notEmpty(),
    body('email', 'Valid email is required').isEmail(),
    body('joiningDate', 'Joining date is required').notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const employeeData = req.body;
      employeeData.createdBy = req.user.id;

      // Generate unique employee ID: EMP2600 + 4 random digits
      let employeeId;
      let isUnique = false;
      while (!isUnique) {
        const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        employeeId = `EMP2600${randomNumber}`;
        const existingEmployee = await Employee.findOne({ employeeId });
        if (!existingEmployee) {
          isUnique = true;
        }
      }
      employeeData.employeeId = employeeId;

      // Auto-create user account for specific positions
      let credentials = null;
      const allowedPositions = ['HR Executive', 'Manager', 'HR'];
      if (allowedPositions.includes(employeeData.position)) {
        // Generate random password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        
        // Map position to role
        let role = 'employee';
        if (employeeData.position === 'HR Executive' || employeeData.position === 'HR') {
          role = 'hr';
        } else if (employeeData.position === 'Manager') {
          role = 'manager';
        }

        // Create user account
        const newUser = await User.create({
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email,
          password: tempPassword,
          role: role,
        });

        employeeData.user = newUser._id;
        credentials = {
          email: employeeData.email,
          tempPassword: tempPassword,
          role: role,
          position: employeeData.position,
        };
      }

      const employee = await Employee.create(employeeData);

      await employee.populate('user', 'firstName lastName email role');
      await employee.populate('reportingManager', 'firstName lastName employeeId');

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee,
        credentials: credentials,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private/Admin
router.put('/:id', protect, adminOrHR, async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'firstName lastName email role')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('projects');

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/employees/stats/summary
// @desc    Get employee statistics
// @access  Private/Admin
router.get('/stats/summary', protect, adminOrHR, async (req, res, next) => {
  try {
    const total = await Employee.countDocuments();
    const active = await Employee.countDocuments({ employmentStatus: 'Active' });
    const inactive = await Employee.countDocuments({ employmentStatus: 'Inactive' });
    const onLeave = await Employee.countDocuments({ employmentStatus: 'On-Leave' });

    const byDepartment = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    const byEmploymentType = await Employee.aggregate([
      { $group: { _id: '$employmentType', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees: total,
        activeEmployees: active,
        inactiveEmployees: inactive,
        onLeaveEmployees: onLeave,
        byDepartment,
        byEmploymentType,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
