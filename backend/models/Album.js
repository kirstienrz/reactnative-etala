const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ""
  },
  order: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: "",
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  coverImage: {
    imageUrl: {
      type: String,
      required: true
    },
    cloudinaryId: {
      type: String,
      required: true
    }
  },
  images: [imageSchema],
  isArchived: {
    type: Boolean,
    default: false
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

// Update timestamp on save
albumSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total photos count
albumSchema.virtual('totalPhotos').get(function() {
  return this.images.length;
});

// Add index for better performance
albumSchema.index({ isArchived: 1, date: -1 });

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;