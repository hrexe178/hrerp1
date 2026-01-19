const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { protect, adminOrHR } = require('../middleware/auth');

// @route   GET /api/documents
// @desc    Get documents with filters
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { project, employee, type, tag } = req.query;
    let query = { isActive: true };

    if (project) query.project = project;
    if (employee) query.employee = employee;
    if (type) query.type = type;
    if (tag) query.tags = { $in: [tag] };

    const documents = await Document.find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('project', 'name projectId')
      .populate('employee', 'firstName lastName employeeId')
      .sort({ uploadDate: -1 });

    res.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/documents/project/:projectId
// @desc    Get documents for a project
// @access  Private
router.get('/project/:projectId', protect, async (req, res, next) => {
  try {
    const documents = await Document.find({ project: req.params.projectId, isActive: true })
      .populate('uploadedBy', 'firstName lastName email')
      .populate('project', 'name projectId')
      .sort({ uploadDate: -1 });

    res.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/documents/employee/:employeeId
// @desc    Get documents for an employee
// @access  Private
router.get('/employee/:employeeId', protect, async (req, res, next) => {
  try {
    const documents = await Document.find({ employee: req.params.employeeId, isActive: true })
      .populate('uploadedBy', 'firstName lastName email')
      .populate('employee', 'firstName lastName employeeId')
      .sort({ uploadDate: -1 });

    res.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/documents
// @desc    Create/Upload document
// @access  Private
router.post(
  '/',
  protect,
  [
    body('name', 'Document name is required').notEmpty(),
    body('type', 'Document type is required').notEmpty(),
    body('fileUrl', 'File URL is required').notEmpty(),
  ],
  async (req, res, next) => {
    console.log('📄 Document POST request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const documentData = {
        ...req.body,
        uploadedBy: req.user.id,
      };

      console.log('✅ Creating document with data:', documentData);

      const document = await Document.create(documentData);

      await document.populate('uploadedBy', 'firstName lastName email');
      await document.populate('project', 'name projectId');
      await document.populate('employee', 'firstName lastName employeeId');

      res.status(201).json({
        success: true,
        message: 'Document created successfully',
        data: document,
      });
    } catch (error) {
      console.error('❌ Error creating document:', error.message);
      next(error);
    }
  }
);

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    let document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check if user is uploader or admin
    if (document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this document' });
    }

    // Increment version if fileUrl changed
    if (req.body.fileUrl && req.body.fileUrl !== document.fileUrl) {
      req.body.version = document.version + 1;
    }

    document = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('uploadedBy', 'firstName lastName email')
      .populate('project', 'name projectId')
      .populate('employee', 'firstName lastName employeeId');

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document (soft delete)
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check if user is uploader or admin
    if (document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
    }

    // Soft delete
    await Document.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
