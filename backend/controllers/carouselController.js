const Carousel = require("../models/Carousel");
const cloudinary = require("../config/cloudinary");

// ✅ Upload media (multiple images/videos)
const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided" });
    }

    const newMediaArr = req.files.map(file => {
      const isVideo = file.mimetype && file.mimetype.startsWith('video/');
      return {
        imageUrl: file.path,
        publicId: file.filename,
        type: isVideo ? 'video' : 'image',
        archived: false,
      };
    });

    const insertedMedia = await Carousel.insertMany(newMediaArr);

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) io.emit("carouselUpdated");

    res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      data: insertedMedia,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Media upload failed", error: error.message || error.toString() });
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

// ✅ Permanently delete image (and from Cloudinary)
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Carousel.findById(id);

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // ☁️ Remove from Cloudinary if publicId exists
    if (image.publicId) {
      const resourceType = image.type === 'video' ? 'video' : 'image';
      await cloudinary.uploader.destroy(image.publicId, { resource_type: resourceType });
    }

    await Carousel.findByIdAndDelete(id);

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) io.emit("carouselUpdated");

    res.status(200).json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete image", error: error.message });
  }
};

module.exports = {
  uploadMedia,
  getAllImages,
  archiveImage,
  getArchivedImages,
  restoreImage,
  deleteImage,
};
