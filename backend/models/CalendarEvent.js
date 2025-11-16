const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  start: {
    type: Date,
    required: [true, 'Start date is required']
  },
  end: {
    type: Date,
    required: [true, 'End date is required']
  },
  type: {
    type: String,
    enum: ['holiday', 'not_available', 'consultation', 'program_event'],
    required: [true, 'Event type is required']
  },
  allDay: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  // Link to program event if applicable
  programEventRef: {
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    projectId: mongoose.Schema.Types.ObjectId,
    eventId: mongoose.Schema.Types.ObjectId
  }
}, { timestamps: true });

calendarEventSchema.index({ start: 1, end: 1, type: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);