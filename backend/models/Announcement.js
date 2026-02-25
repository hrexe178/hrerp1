const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetAudience: {
      type: String,
      enum: ['All', 'Department', 'Specific'],
      default: 'All',
    },
    targetDept: String,
    targetEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    publishDate: { type: Date, default: Date.now },
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

announcementSchema.index({ isActive: 1, publishDate: -1 });
announcementSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
