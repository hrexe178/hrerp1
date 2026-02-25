const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/audit-logs
// @desc    Get all audit logs
// @access  Private/Admin
router.get('/', protect, admin, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.module) query.module = req.query.module;
        if (req.query.action) query.action = req.query.action;
        if (req.query.search) {
            query.targetName = { $regex: req.query.search, $options: 'i' };
        }

        const logs = await AuditLog.find(query)
            .populate('performedBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            count: logs.length,
            total,
            page,
            pages: Math.ceil(total / limit) || 1,
            data: logs,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
