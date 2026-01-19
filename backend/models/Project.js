const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    description: String,

    // Client Details
    client: {
      name: String,
      email: String,
      phone: String,
      company: String,
    },

    // Project Management
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    teamMembers: [
      {
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        role: String,
        assignedDate: { type: Date, default: Date.now },
        allocationPercentage: { type: Number, default: 100 },
      },
    ],

    // Dates
    startDate: { type: Date, required: true },
    endDate: Date,
    actualEndDate: Date,

    // Status & Priority
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },

    // Budget
    budget: {
      estimated: Number,
      actual: Number,
      currency: { type: String, default: 'INR' },
    },

    // Technology & Progress
    technologyStack: [String],
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },

    // Milestones
    milestones: [
      {
        name: String,
        description: String,
        dueDate: Date,
        status: { type: String, enum: ['Pending', 'In Progress', 'Completed'] },
        completionDate: Date,
      },
    ],

    // Risks
    risks: [
      {
        description: String,
        severity: { type: String, enum: ['Low', 'Medium', 'High'] },
        mitigation: String,
        identifiedDate: { type: Date, default: Date.now },
      },
    ],

    // Additional
    notes: String,
    tags: [String],
  },
  { timestamps: true }
);

// Generate Project ID before saving if not exists
projectSchema.pre('save', async function (next) {
  if (!this.projectId) {
    const count = await mongoose.model('Project').countDocuments();
    this.projectId = `PRJ${Date.now()}${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
