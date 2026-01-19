const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const { protect, adminOrHR } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects with filters
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, manager, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (manager) query.manager = manager;
    if (search) query.name = { $regex: search, $options: 'i' };

    const projects = await Project.find(query)
      .populate('manager', 'firstName lastName employeeId')
      .populate('teamMembers.employee', 'firstName lastName employeeId department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'firstName lastName employeeId email phone')
      .populate('teamMembers.employee', 'firstName lastName employeeId department designation')
      .populate('teamMembers.employee', 'firstName lastName employeeId department designation');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private/Admin
router.post(
  '/',
  protect,
  adminOrHR,
  [
    body('name', 'Project name is required').notEmpty(),
    body('startDate', 'Start date is required').notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const project = await Project.create(req.body);

      await project.populate('manager', 'firstName lastName employeeId');
      await project.populate('teamMembers.employee', 'firstName lastName employeeId');

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private/Admin
router.put('/:id', protect, adminOrHR, async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('manager', 'firstName lastName employeeId')
      .populate('teamMembers.employee', 'firstName lastName employeeId department');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private/Admin
router.delete('/:id', protect, adminOrHR, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/projects/:id/assign-employee
// @desc    Assign employee to project
// @access  Private/Admin
router.post('/:id/assign-employee', protect, adminOrHR, async (req, res, next) => {
  try {
    const { employeeId, role, allocationPercentage } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if employee already assigned
    const isAssigned = project.teamMembers.some((member) => member.employee.toString() === employeeId);
    if (isAssigned) {
      return res.status(400).json({ success: false, message: 'Employee already assigned to this project' });
    }

    project.teamMembers.push({
      employee: employeeId,
      role: role || 'Team Member',
      allocationPercentage: allocationPercentage || 100,
    });

    await project.save();
    await project.populate('teamMembers.employee', 'firstName lastName employeeId department');

    // Add project to employee
    await Employee.findByIdAndUpdate(employeeId, {
      $addToSet: { projects: project._id },
    });

    res.json({
      success: true,
      message: 'Employee assigned successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/projects/:id/remove-employee/:employeeId
// @desc    Remove employee from project
// @access  Private/Admin
router.delete('/:id/remove-employee/:employeeId', protect, adminOrHR, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.teamMembers = project.teamMembers.filter((member) => member.employee.toString() !== req.params.employeeId);

    await project.save();

    // Remove project from employee
    await Employee.findByIdAndUpdate(req.params.employeeId, {
      $pull: { projects: project._id },
    });

    res.json({
      success: true,
      message: 'Employee removed successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
