const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  submittedBy: { type: String, required: true },
  email: { type: String },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  status: { type: String, enum: ["new", "in progress", "resolved"], default: "new" },
  archived: { type: Boolean, default: false },
  notes: [{ text: String, date: { type: Date, default: Date.now } }],
  activityLog: [{ message: String, date: { type: Date, default: Date.now } }],
  submittedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Suggestion", suggestionSchema);
