const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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
    trim: true,
    maxlength: [300, 'Location cannot exceed 300 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Extended description fields
  extendedDescription: {
    type: String,
    trim: true,
    maxlength: [2000, 'Extended description cannot exceed 2000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  // Event-specific details
  eventDetails: {
    // For program events
    programDetails: {
      objectives: [{
        type: String,
        trim: true
      }],
      targetAudience: {
        type: String,
        trim: true
      },
      requirements: [{
        type: String,
        trim: true
      }],
      expectedOutcomes: [{
        type: String,
        trim: true
      }]
    },
    // For consultations
    consultationDetails: {
      consultationType: {
        type: String,
        trim: true
      },
      duration: {
        type: Number, // in minutes
        min: 0
      },
      preparationNotes: {
        type: String,
        trim: true
      },
      maxParticipants: {
        type: Number,
        min: 1
      }
    },
    // For holidays
    holidayDetails: {
      observance: {
        type: String,
        trim: true
      },
      recurring: {
        type: Boolean,
        default: false
      },
      significance: {
        type: String,
        trim: true
      }
    }
  },
  // Additional metadata
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // Link to program event if applicable
  programEventRef: {
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    projectId: mongoose.Schema.Types.ObjectId,
    eventId: mongoose.Schema.Types.ObjectId
  },
  // Visibility settings
  isPublic: {
    type: Boolean,
    default: true
  },
  requiresRegistration: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
calendarEventSchema.index({ start: 1, end: 1, type: 1 });
calendarEventSchema.index({ tags: 1 });
calendarEventSchema.index({ status: 1 });

// Virtual for event duration in hours
calendarEventSchema.virtual('durationInHours').get(function() {
  if (!this.start || !this.end) return 0;
  const durationMs = this.end - this.start;
  return Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
});

// Method to check if event is active
calendarEventSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.start && now <= this.end;
};

// Method to get event summary
calendarEventSchema.methods.getSummary = function() {
  return {
    title: this.title,
    description: this.description,
    type: this.type,
    location: this.location,
    start: this.start,
    end: this.end,
    status: this.status
  };
};

// Pre-save middleware to validate end date is after start date
calendarEventSchema.pre('save', function(next) {
  if (this.start && this.end && this.end <= this.start) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);