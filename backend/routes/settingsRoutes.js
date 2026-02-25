const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, admin } = require('../middleware/auth');
const { logAction } = require('../services/auditService');

// @route   GET /api/settings/public
// @desc    Get all public settings (accessible without auth)
// @access  Public
router.get('/public', async (req, res, next) => {
    try {
        const settings = await Setting.find({ isPublic: true });
        // Convert to a simple Key-Value object
        const config = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json({ success: true, data: config });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/settings
// @desc    Get all company settings
// @access  Private/Admin
router.get('/', protect, admin, async (req, res, next) => {
    try {
        const settings = await Setting.find().sort({ group: 1, key: 1 });
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/settings
// @desc    Update or create multiple settings at once
// @access  Private/Admin
router.put('/', protect, admin, async (req, res, next) => {
    try {
        const { settings } = req.body; // Array of { key, value, description, group, isPublic }
        if (!Array.isArray(settings)) {
            return res.status(400).json({ success: false, message: 'Expected an array of settings' });
        }

        const updatedSettings = [];
        for (const item of settings) {
            if (!item.key) continue;

            const previous = await Setting.findOne({ key: item.key });
            const record = await Setting.findOneAndUpdate(
                { key: item.key },
                {
                    value: item.value,
                    description: item.description || (previous ? previous.description : ''),
                    group: item.group || (previous ? previous.group : 'General'),
                    isPublic: item.isPublic !== undefined ? item.isPublic : (previous ? previous.isPublic : false)
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            const action = previous ? 'UPDATE' : 'CREATE';
            await logAction(req, action, 'Setting', record._id, previous ? previous.toObject() : null, record.toObject(), item.key);
            updatedSettings.push(record);
        }

        res.json({ success: true, message: 'Settings updated successfully', data: updatedSettings });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/settings/:key
// @desc    Delete a specific setting by key
// @access  Private/Admin
router.delete('/:key', protect, admin, async (req, res, next) => {
    try {
        const setting = await Setting.findOne({ key: req.params.key });
        if (!setting) {
            return res.status(404).json({ success: false, message: 'Setting not found' });
        }
        const previous = setting.toObject();
        await Setting.findByIdAndDelete(setting._id);
        await logAction(req, 'DELETE', 'Setting', setting._id, previous, null, setting.key);

        res.json({ success: true, message: 'Setting deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
