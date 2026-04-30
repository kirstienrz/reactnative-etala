const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, default: "image" }, // image or video
  createdAt: { type: Date, default: Date.now }
});

const carouselSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  coverImage: {
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  items: [mediaSchema],
  archived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Carousel", carouselSchema);
