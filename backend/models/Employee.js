const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    // Personal Info
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    address: {
      street: String,
      city: String,
      state: String,
      pin: String,
      country: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },

    // Professional Info
    employeeId: { type: String, unique: true, sparse: true },
    position: { type: String, enum: ['HR Executive', 'Manager', 'HR', 'Employee', 'Other'] },
    department: String,
    designation: String,
    employmentType: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'] },
    joiningDate: { type: Date, required: true },
    workLocation: String,
    reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    assignedShift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    employmentStatus: { type: String, enum: ['Active', 'Inactive', 'On-Leave', 'Terminated'], default: 'Active' },

    // Compensation
    salary: Number,
    currency: { type: String, default: 'INR' },
    paymentFrequency: { type: String, enum: ['Monthly', 'Weekly', 'Bi-weekly', 'Daily'] },
    bankDetails: {
      accountNumber: String,
      ifsc: String,
      bankName: String,
      accountHolderName: String,
    },

    // Documents
    resume: String,
    documents: [
      {
        name: String,
        type: String,
        url: String,
        uploadDate: { type: Date, default: Date.now },
      },
    ],

    // Skills & Experience
    skills: [String],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        graduationYear: Number,
      },
    ],
    experience: [
      {
        company: String,
        designation: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],

    // Projects
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],

    // Performance
    performanceReviews: [
      {
        date: Date,
        rating: { type: Number, min: 1, max: 5 },
        comments: String,
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    // User Reference
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    profileImage: String,
    leaveBalance: {
      sick: { type: Number, default: 12 },
      casual: { type: Number, default: 10 },
      paid: { type: Number, default: 21 },
      unpaid: { type: Number, default: 0 },
    },

    // Lifecycle
    onboardingStatus: {
      type: String,
      enum: ['Pending', 'In-Progress', 'Completed'],
      default: 'Pending',
    },
    offboardingStatus: {
      type: String,
      enum: ['Not Started', 'Initiated', 'In-Progress', 'Completed'],
      default: 'Not Started',
    },
    exitDate: Date,
    exitReason: String,
    lifecycleNotes: [
      {
        date: { type: Date, default: Date.now },
        note: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      }
    ],
  },
  { timestamps: true }
);

// Generate Employee ID before saving if not exists
employeeSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${Date.now()}${count + 1}`;
  }
  next();
});

// Indexes for performance
employeeSchema.index({ user: 1 });
employeeSchema.index({ reportingManager: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ employmentStatus: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
