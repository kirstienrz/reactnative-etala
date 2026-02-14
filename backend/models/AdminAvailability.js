const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  start: { type: String, required: true }, // e.g. '08:00'
  end: { type: String, required: true },   // e.g. '09:00'
  booked: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
  custom: { type: Boolean, default: false }, // true if manually added by admin
});

const dayAvailabilitySchema = new mongoose.Schema({
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  slots: [timeSlotSchema],
  customSlots: { type: Boolean, default: false }, // true if admin customized slots for this day
});

// Persisted slot configuration so admins don't have to reconfigure each time
const slotConfigSchema = new mongoose.Schema({
  workStart: { type: String, default: '08:00' },
  workEnd: { type: String, default: '17:00' },
  lunchStart: { type: String, default: '12:00' },
  lunchEnd: { type: String, default: '13:00' },
  slotDuration: { type: Number, default: 60 },
});

const adminAvailabilitySchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slotDuration: { type: Number, default: 60 }, // in minutes (30, 60, 90, 120)
  slotConfig: { type: slotConfigSchema, default: () => ({}) },
  availabilities: [dayAvailabilitySchema],
}, { timestamps: true });

module.exports = mongoose.model('AdminAvailability', adminAvailabilitySchema);
