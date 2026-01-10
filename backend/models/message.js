// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true
  },

  sender: {
    type: String,
    enum: ["user", "admin"],
    required: true
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  senderName: {
    type: String,
    required: true
  },

  messageType: {
    type: String,
    enum: ["text", "file"],
    default: "text"
  },

  content: {
    type: String,
    required: true
  },

  attachments: [{
    uri: String,
    type: String,
    fileName: String
  }],

  isRead: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Check if model exists before creating
module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);