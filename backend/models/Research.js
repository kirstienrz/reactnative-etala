const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Research title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  authors: {
    type: String,
    required: [true, 'Authors are required'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Publication year is required'],
    validate: {
      validator: function(v) {
        return /^\d{4}$/.test(v);
      },
      message: 'Year must be a 4-digit number'
    }
  },
  abstract: {
    type: String,
    required: [true, 'Abstract is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  link: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Link must be a valid URL starting with http:// or https://'
    }
  },
  // Cloudinary fields
  thumbnail: {
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1570979137/default-research.jpg'
    },
    public_id: String,
    format: String,
    bytes: Number
  },
  researchFile: {
    url: String,
    public_id: String,
    format: String,
    bytes: Number,
    originalName: String
  },
  datePublished: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
researchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
researchSchema.index({ title: 'text', authors: 'text', abstract: 'text' });
researchSchema.index({ status: 1 });
researchSchema.index({ year: 1 });
researchSchema.index({ createdAt: -1 });

const Research = mongoose.model('Research', researchSchema);

module.exports = Research;