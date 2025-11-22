// models/Infographic.js
const mongoose = require('mongoose');

const InfographicSchema = new mongoose.Schema({
  academicYear: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  cloudinaryId: { 
    type: String, 
    required: true 
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['active', 'archived'], 
    default: 'active' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Infographic', InfographicSchema);