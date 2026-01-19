const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half-Day', 'Leave', 'Holiday', 'Weekend'],
      required: true,
    },
    checkInTime: String,
    checkOutTime: String,
    workHours: Number,
    overtimeHours: Number,
    location: { type: String, enum: ['Office', 'Remote', 'Field', 'Client Site'] },

    // Leave details
    leaveType: { type: String, enum: ['Sick', 'Casual', 'Paid', 'Unpaid', 'Maternity', 'Paternity', 'Other'] },
    leaveReason: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isApproved: { type: Boolean, default: false },

    remarks: String,
  },
  { timestamps: true }
);

// Prevent duplicate attendance entries
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
