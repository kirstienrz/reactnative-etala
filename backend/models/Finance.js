const mongoose = require("mongoose");

const financeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["budget", "expense"],
    required: true
  },

  category: {
    type: String,
    required: true
  },

  title: {
    type: String,
    default: ""
  },

  amount: {
    type: Number,
    required: true
  },

  month: {
    type: String, // example: "2026-01"
    required: true
  },

  notes: {
    type: String,
    default: ""
  },

  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model("Finance", financeSchema);
