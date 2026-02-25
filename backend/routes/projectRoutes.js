const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const { protect, adminOrHR, managerOrHR } = require('../middleware/auth');
const { logAction } = require('../services/auditService');
const { sendEmail } = require('../services/emailService');
const { getManagerScopedEmployeeIds } = require('../services/managerScopeService');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// @route   GET /api/projects
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, manager, search } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    // RBAC Enforcement
    if (req.user.role === 'employee') {
      const currentEmployee = await Employee.findOne({ user: req.user.id });
      if (!currentEmployee) {
        return res.status(404).json({ success: false, message: 'Employee profile not found' });
      }
      query['teamMembers.employee'] = currentEmployee._id;
    } else if (req.user.role === 'manager') {
      const currentEmployee = await Employee.findOne({ user: req.user.id });
      if (!currentEmployee) {
        return res.status(404).json({ success: false, message: 'Employee profile not found' });
      }
      query.$or = [
        { manager: currentEmployee._id },
        { 'teamMembers.employee': currentEmployee._id }
      ];
    }

    if (status) query.status = status;
    if (manager) query.manager = manager;
    if (search) query.name = { $regex: search, $options: 'i' };

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('manager', 'firstName lastName employeeId')
        .populate('teamMembers.employee', 'firstName lastName employeeId department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    res.json({ success: true, count: projects.length, total, page, pages: Math.ceil(total / limit) || 1, data: projects });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/projects/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'firstName lastName employeeId email phone')
      .populate('teamMembers.employee', 'firstName lastName employeeId department designation');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // RBAC Enforcement
    if (req.user.role === 'employee' || req.user.role === 'manager') {
      const currentEmployee = await Employee.findOne({ user: req.user.id });
      if (!currentEmployee) {
        return res.status(404).json({ success: false, message: 'Employee profile not found' });
      }

      const isManager = project.manager && project.manager._id.toString() === currentEmployee._id.toString();
      const isTeamMember = project.teamMembers.some(tm => tm.employee && tm.employee._id.toString() === currentEmployee._id.toString());

      if (!isManager && !isTeamMember && req.user.role !== 'admin' && req.user.role !== 'hr') {
        return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
      }
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/projects
router.post(
  '/',
  protect,
  adminOrHR,
  [body('name', 'Project name is required').notEmpty(), body('startDate', 'Start date is required').notEmpty()],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const project = await Project.create(req.body);
      await project.populate('manager', 'firstName lastName employeeId');
      await project.populate('teamMembers.employee', 'firstName lastName employeeId');
      await logAction(req, 'CREATE', 'Project', project._id, null, project.toObject(), project.projectId);

      res.status(201).json({ success: true, message: 'Project created successfully', data: project });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/projects/:id
router.put(
  '/:id',
  protect,
  adminOrHR,
  [
    body('name').optional().notEmpty().withMessage('Project name cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Start date must be valid'),
    body('endDate').optional().isISO8601().withMessage('End date must be valid'),
    body('status').optional().isIn(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']).withMessage('Invalid project status'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const existing = await Project.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      const previous = existing.toObject();

      const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('manager', 'firstName lastName employeeId')
        .populate('teamMembers.employee', 'firstName lastName employeeId department');

      await logAction(req, 'UPDATE', 'Project', project._id, previous, project.toObject(), project.projectId);
      res.json({ success: true, message: 'Project updated successfully', data: project });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/projects/:id
router.delete('/:id', protect, adminOrHR, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const previous = project.toObject();
    await Project.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE', 'Project', project._id, previous, null, project.projectId);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/projects/:id/assign-employee
router.post(
  '/:id/assign-employee',
  protect,
  managerOrHR,
  [
    body('employeeId').notEmpty().withMessage('employeeId is required'),
    body('role').optional().isString().isLength({ max: 120 }),
    body('allocationPercentage').optional().isFloat({ min: 1, max: 100 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { employeeId, role, allocationPercentage } = req.body;
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      if (req.user.role === 'manager') {
        const managerEmployee = await Employee.findOne({ user: req.user.id }).select('_id');
        if (!managerEmployee || project.manager?.toString() !== managerEmployee._id.toString()) {
          return res.status(403).json({ success: false, message: 'Manager can assign only in owned projects' });
        }
        const scopedIds = await getManagerScopedEmployeeIds(req.user);
        if (!scopedIds.map((id) => id.toString()).includes(employeeId)) {
          return res.status(403).json({ success: false, message: 'Manager can assign only direct reports' });
        }
      }

      const isAssigned = project.teamMembers.some((member) => member.employee.toString() === employeeId);
      if (isAssigned) {
        return res.status(400).json({ success: false, message: 'Employee already assigned to this project' });
      }

      project.teamMembers.push({ employee: employeeId, role: role || 'Team Member', allocationPercentage: allocationPercentage || 100 });
      await project.save();
      await project.populate('teamMembers.employee', 'firstName lastName employeeId department user');

      await Employee.findByIdAndUpdate(employeeId, { $addToSet: { projects: project._id } });
      await logAction(req, 'UPDATE', 'Project', project._id, null, project.toObject(), project.projectId);

      const assigned = await Employee.findById(employeeId).populate('user', 'email firstName');
      if (assigned?.user?.email) {
        await sendEmail(assigned.user.email, 'projectAssigned', [assigned.firstName, project.name, role || 'Team Member']);
      }

      res.json({ success: true, message: 'Employee assigned successfully', data: project });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/projects/:id/remove-employee/:employeeId
router.delete('/:id/remove-employee/:employeeId', protect, managerOrHR, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (req.user.role === 'manager') {
      const managerEmployee = await Employee.findOne({ user: req.user.id }).select('_id');
      if (!managerEmployee || project.manager?.toString() !== managerEmployee._id.toString()) {
        return res.status(403).json({ success: false, message: 'Manager can remove only in owned projects' });
      }
      const scopedIds = await getManagerScopedEmployeeIds(req.user);
      if (!scopedIds.map((id) => id.toString()).includes(req.params.employeeId)) {
        return res.status(403).json({ success: false, message: 'Manager can remove only direct reports' });
      }
    }

    project.teamMembers = project.teamMembers.filter((member) => member.employee.toString() !== req.params.employeeId);
    await project.save();

    await Employee.findByIdAndUpdate(req.params.employeeId, { $pull: { projects: project._id } });
    await logAction(req, 'UPDATE', 'Project', project._id, null, project.toObject(), project.projectId);

    res.json({ success: true, message: 'Employee removed successfully', data: project });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
