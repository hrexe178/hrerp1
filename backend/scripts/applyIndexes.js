const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const applyIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB to apply indexes...');

        // Employee Indexes
        await Employee.collection.createIndex({ employeeId: 1 }, { unique: true });
        await Employee.collection.createIndex({ email: 1 });
        await Employee.collection.createIndex({ department: 1 });
        await Employee.collection.createIndex({ employmentStatus: 1 });

        // Attendance Indexes
        await Attendance.collection.createIndex({ employee: 1, date: -1 });
        await Attendance.collection.createIndex({ date: -1 });

        // AuditLog Indexes
        await AuditLog.collection.createIndex({ module: 1 });
        await AuditLog.collection.createIndex({ createdAt: -1 });
        await AuditLog.collection.createIndex({ performedBy: 1 });

        console.log('✅ MongoDB Indexes applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error applying indexes:', error.message);
        process.exit(1);
    }
};

applyIndexes();
