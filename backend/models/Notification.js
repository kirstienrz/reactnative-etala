const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null means it's for all admins if recipientRole is 'superadmin'
  },
  recipientRole: {
    type: String,
    enum: ['user', 'superadmin'],
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'ticket', 'suggestion', 'booking', 'status_update', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    ticketNumber: String,
    suggestionId: String,
    eventId: String,
  },
  link: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
