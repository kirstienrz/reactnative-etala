const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String },
    size: { type: String, required: true },
    date: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
