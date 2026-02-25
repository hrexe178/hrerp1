const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, required: true },
    basicSalary: { type: Number, default: 0 },
    allowances: {
      hra: { type: Number, default: 0 },
      ta: { type: Number, default: 0 },
      da: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      pf: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
      tds: { type: Number, default: 0 },
      loans: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    grossSalary: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    workingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Processed', 'Released'], default: 'Draft' },
    paymentDate: Date,
    paymentMethod: { type: String, enum: ['Bank Transfer', 'Cheque', 'Cash'] },
    payslipUrl: String,
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
