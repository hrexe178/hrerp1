const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ['Project Document', 'Employee Document', 'Contract', 'Report', 'Invoice', 'Policy', 'Other'],
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'Image', 'Video', 'Other'] },
    fileSize: Number,

    // Links
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

    // Metadata
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadDate: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    tags: [String],
    accessLevel: {
      type: String,
      enum: ['Public', 'Private', 'Restricted'],
      default: 'Private',
    },
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
