const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: {
      type: String,
      enum: ['Sick', 'Casual', 'Paid', 'Unpaid', 'Maternity', 'Paternity', 'Compensatory'],
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, required: true, min: 0.5 },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Manager Approved', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    appliedOn: { type: Date, default: Date.now },
    managerReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    managerReviewedOn: Date,
    managerReviewRemarks: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedOn: Date,
    reviewRemarks: String,
    isHalfDay: { type: Boolean, default: false },
    halfDaySlot: { type: String, enum: ['First Half', 'Second Half'] },
  },
  { timestamps: true }
);

leaveSchema.index({ employee: 1, fromDate: 1, toDate: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
