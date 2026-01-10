const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true }, // Link to report
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
