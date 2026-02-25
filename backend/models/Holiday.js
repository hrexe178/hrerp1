const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    date: { type: Date, required: true, unique: true },
    type: { type: String, enum: ['National', 'Company', 'Optional'], required: true },
    description: String,
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

holidaySchema.pre('validate', function (next) {
  if (this.date && !this.year) {
    this.year = new Date(this.date).getUTCFullYear();
  }
  next();
});

holidaySchema.index({ year: 1, date: 1 });

module.exports = mongoose.model('Holiday', holidaySchema);
