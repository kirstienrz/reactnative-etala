// models/Message.js
const mongoose = require("mongoose");

// ✅ Explicit sub-schema for attachments (required for Mongoose 8.x)
const attachmentSchema = new mongoose.Schema({
  uri: { type: String },
  type: { type: String },
  fileName: { type: String }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true
  },

  sender: {
    type: String,
    enum: ["user", "superadmin"],
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

  attachments: [attachmentSchema],

  isRead: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Force re-compile the model (clear any cached schema)
delete mongoose.models.Message;
module.exports = mongoose.model("Message", messageSchema);