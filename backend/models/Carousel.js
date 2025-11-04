const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  archived: { type: Boolean, default: false }, // ✅ added for archive feature
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Carousel", carouselSchema);
