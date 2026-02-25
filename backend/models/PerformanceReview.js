const mongoose = require('mongoose');

const performanceReviewSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    reviewCycle: { type: String, required: true, trim: true },
    reviewPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    selfAssessment: { type: String, default: '' },
    managerAssessment: { type: String, default: '' },
    finalRating: { type: Number, min: 1, max: 5 },
    kpis: [
      {
        name: String,
        target: String,
        achieved: String,
        score: { type: Number, min: 0, max: 5 },
      },
    ],
    goals: [
      {
        title: String,
        description: String,
        status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
      },
    ],
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Completed'],
      default: 'Draft',
    },
    overallRating: { type: Number, min: 1, max: 5 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

performanceReviewSchema.index({ employee: 1, reviewCycle: 1 }, { unique: true });

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);
