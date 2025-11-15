const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Event date is required']
  },
  participants: {
    type: Number,
    default: 0,
    min: [0, 'Participants cannot be negative']
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  archived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Project year is required'],
    min: [2000, 'Year must be 2000 or later'],
    max: [2100, 'Year must be 2100 or earlier']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'ongoing'
  },
  archived: {
    type: Boolean,
    default: false
  },
  events: [eventSchema]
}, { timestamps: true });

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Program description is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Program year is required'],
    min: [2000, 'Year must be 2000 or later'],
    max: [2100, 'Year must be 2100 or earlier']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'ongoing'
  },
  archived: {
    type: Boolean,
    default: false
  },
  projects: [projectSchema]
}, { timestamps: true });

// Indexes for better query performance
programSchema.index({ year: -1, status: 1 });
programSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Program', programSchema);