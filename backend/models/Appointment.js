const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Admin Rescheduled", "User Rescheduled", "Completed", "Cancelled", "Pending Rebooking"],
      default: "Pending",
    },
    // ✅ Snapshot of anonymity at booking time — never changes even if other tickets are revealed
    isAnonymous: { type: Boolean, default: true },
    notes: { type: String },
    adminNotes: { type: String },
    cancelReason: { type: String },
    rescheduleHistory: [
      {
        previousDate: String,
        previousStartTime: String,
        previousEndTime: String,
        rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    remindersSent: [{ type: String }], // Track which reminders have been sent: "1day", "1hour"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);