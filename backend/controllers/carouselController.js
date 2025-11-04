const Carousel = require("../models/Carousel");
const cloudinary = require("../config/cloudinary");

// ✅ Upload an image
const uploadImage = async (req, res) => {
  try {
    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    const newImage = new Carousel({ imageUrl, publicId });
    await newImage.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    io.emit("carouselUpdated");

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: newImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
};

// ✅ Get all non-archived images
const getAllImages = async (req, res) => {
  try {
    const images = await Carousel.find({ archived: false }).sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
};

// ✅ Archive image (soft delete)
const archiveImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Carousel.findById(id);

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    image.archived = true;
    await image.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    io.emit("carouselUpdated");

    res.status(200).json({ success: true, message: "Image archived successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to archive image" });
  }
};

// ✅ Get all archived images
const getArchivedImages = async (req, res) => {
  try {
    const images = await Carousel.find({ archived: true }).sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch archived images" });
  }
};

// ✅ Restore an archived image
const restoreImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Carousel.findById(id);

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    image.archived = false;
    await image.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    io.emit("carouselUpdated");

    res.status(200).json({ success: true, message: "Image restored successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to restore image" });
  }
};

module.exports = {
  uploadImage,
  getAllImages,
  archiveImage,
  getArchivedImages,
  restoreImage,
};
