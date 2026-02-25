const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');
const { logAction } = require('../services/auditService');
const { sendEmail } = require('../services/emailService');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

router.get('/', protect, async (req, res, next) => {
  try {
    const { project, employee, type, tag } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const query = { isActive: true };
    if (project) query.project = project;
    if (employee) query.employee = employee;
    if (type) query.type = type;
    if (tag) query.tags = { $in: [tag] };

    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('uploadedBy', 'firstName lastName email')
        .populate('project', 'name projectId')
        .populate('employee', 'firstName lastName employeeId')
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(limit),
      Document.countDocuments(query),
    ]);

    res.json({ success: true, count: documents.length, total, page, pages: Math.ceil(total / limit) || 1, data: documents });
  } catch (error) {
    next(error);
  }
});

router.get('/project/:projectId', protect, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = { project: req.params.projectId, isActive: true };
    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('uploadedBy', 'firstName lastName email')
        .populate('project', 'name projectId')
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(limit),
      Document.countDocuments(query),
    ]);
    res.json({ success: true, count: documents.length, total, page, pages: Math.ceil(total / limit) || 1, data: documents });
  } catch (error) {
    next(error);
  }
});

router.get('/employee/:employeeId', protect, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = { employee: req.params.employeeId, isActive: true };
    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('uploadedBy', 'firstName lastName email')
        .populate('employee', 'firstName lastName employeeId')
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(limit),
      Document.countDocuments(query),
    ]);
    res.json({ success: true, count: documents.length, total, page, pages: Math.ceil(total / limit) || 1, data: documents });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  protect,
  [
    body('name', 'Document name is required').notEmpty(),
    body('type', 'Document type is required').notEmpty(),
    body('fileUrl', 'File URL is required').notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const document = await Document.create({ ...req.body, uploadedBy: req.user.id });
      await document.populate('uploadedBy', 'firstName lastName email');
      await document.populate('project', 'name projectId');
      await document.populate('employee', 'firstName lastName employeeId');
      await logAction(req, 'CREATE', 'Document', document._id, null, document.toObject(), document.name);

      if (document.employee) {
        const employee = await Employee.findById(document.employee._id).populate('user', 'email');
        if (employee?.user?.email) {
          await sendEmail(employee.user.email, 'documentUploaded', [employee.firstName, document.name]);
        }
      }

      res.status(201).json({ success: true, message: 'Document created successfully', data: document });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  protect,
  [
    body('name').optional().notEmpty().withMessage('Document name cannot be empty'),
    body('type')
      .optional()
      .isIn(['Project Document', 'Employee Document', 'Contract', 'Report', 'Invoice', 'Policy', 'Other'])
      .withMessage('Invalid document type'),
    body('fileUrl').optional().notEmpty().withMessage('File URL cannot be empty'),
    body('fileType')
      .optional()
      .isIn(['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'Image', 'Video', 'Other'])
      .withMessage('Invalid file type'),
    body('accessLevel').optional().isIn(['Public', 'Private', 'Restricted']).withMessage('Invalid access level'),
    body('expiryDate').optional().isISO8601().withMessage('Expiry date must be valid'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const existing = await Document.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      if (existing.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to update this document' });
      }

      const previous = existing.toObject();
      if (req.body.fileUrl && req.body.fileUrl !== existing.fileUrl) {
        req.body.version = existing.version + 1;
      }
      const document = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('uploadedBy', 'firstName lastName email')
        .populate('project', 'name projectId')
        .populate('employee', 'firstName lastName employeeId');

      await logAction(req, 'UPDATE', 'Document', document._id, previous, document.toObject(), document.name);
      res.json({ success: true, message: 'Document updated successfully', data: document });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    if (document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
    }

    const previous = document.toObject();
    await Document.findByIdAndUpdate(req.params.id, { isActive: false });
    await logAction(req, 'DELETE', 'Document', document._id, previous, null, document.name);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
