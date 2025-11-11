const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);
