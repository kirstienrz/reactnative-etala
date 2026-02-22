// models/Ticket.js
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    unreadCount: {
      superadmin: {
        type: Number,
        default: 0,
      },
      user: {
        type: Number,
        default: 0,
      },
    },
    closedAt: {
      type: Date,
    },
    closedReason: {
      type: String,
    },
    adminHasReplied: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual property to check if admin has unread messages
ticketSchema.virtual("hasUnreadMessages").get(function () {
  return this.unreadCount.superadmin > 0;
});

// ✅ Virtual property to check if user has unread messages
ticketSchema.virtual("hasUnreadMessagesForUser").get(function () {
  return this.unreadCount.user > 0;
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;