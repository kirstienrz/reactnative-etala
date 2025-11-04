const mongoose = require("mongoose");

const webinarSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    speaker: { type: String, required: true },
    organization: { type: String, required: true },
    date: { type: String, required: true },
    duration: { type: String },
    videoUrl: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Webinar", webinarSchema);
