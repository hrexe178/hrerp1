const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    category: {
      type: String,
      enum: ['Travel', 'Meals', 'Supplies', 'Medical', 'Internet', 'Training', 'Other'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    receiptUrl: String,
    submittedOn: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Pending', 'Manager Approved', 'Approved', 'Rejected', 'Paid'],
      default: 'Pending',
    },
    managerReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    managerReviewedOn: Date,
    managerReviewRemarks: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedOn: Date,
    reviewRemarks: String,
    paymentDate: Date,
  },
  { timestamps: true }
);

expenseSchema.index({ employee: 1, submittedOn: -1 });
expenseSchema.index({ status: 1, submittedOn: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
