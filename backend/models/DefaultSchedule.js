const mongoose = require('mongoose');

const recurringPatternSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true }, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: { type: String, required: true }, // e.g., '09:00'
  endTime: { type: String, required: true }, // e.g., '12:00'
  slotDuration: { type: Number, default: 60 }, // in minutes
});

const exceptionSchema = new mongoose.Schema({
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  reason: { type: String },
  type: { type: String, enum: ['unavailable', 'custom_slots'], default: 'unavailable' },
  customSlots: [{
    start: { type: String },
    end: { type: String },
  }],
});

const defaultScheduleSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  recurringPatterns: [recurringPatternSchema],
  exceptions: [exceptionSchema],
  isActive: { type: Boolean, default: true },
  generatedSlots: { type: Boolean, default: false }, // Track if slots have been generated
}, { timestamps: true });

// Index for efficient queries
defaultScheduleSchema.index({ adminId: 1, month: 1, year: 1 });

module.exports = mongoose.model('DefaultSchedule', defaultScheduleSchema);
