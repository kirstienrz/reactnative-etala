const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  participants: {
    type: Number,
    required: true,
    min: 1
  },
  venue: {
    type: String,
    required: true,
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
}, {
  timestamps: true
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
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
}, {
  timestamps: true
});

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
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
}, {
  timestamps: true
});

module.exports = mongoose.model('Program', programSchema);