const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT'],
      required: true,
    },
    module: {
      type: String,
      enum: ['Employee', 'Attendance', 'Project', 'Document', 'Leave', 'Payroll', 'User', 'Announcement', 'Holiday', 'Expense', 'Shift', 'PerformanceReview'],
      required: true,
    },
    targetId: mongoose.Schema.Types.ObjectId,
    targetName: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
