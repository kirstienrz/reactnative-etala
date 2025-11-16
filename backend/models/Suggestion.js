const mongoose = require("mongoose");

const SuggestionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // frontend uses numeric ID
  text: { type: String, required: true },
  submittedBy: { type: String, required: true },
  submittedDate: { type: Date, default: Date.now },

  status: {
    type: String,
    enum: ["pending", "under-review", "approved", "rejected", "implemented"],
    default: "pending"
  },

  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "low"
  },

  archived: { type: Boolean, default: false }
});

module.exports = mongoose.model("Suggestion", SuggestionSchema);
