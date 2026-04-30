const Carousel = require("../models/Carousel");
const cloudinary = require("../config/cloudinary");

// ✅ Upload media (multiple images/videos)
const uploadMedia = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided" });
    }

    const items = req.files.map(file => {
      const isVideo = file.mimetype && file.mimetype.startsWith('video/');
      return {
        imageUrl: file.path,
        publicId: file.filename,
        type: isVideo ? 'video' : 'image',
      };
    });

    // Use the first file as the cover image
    const coverImage = {
      imageUrl: items[0].imageUrl,
      publicId: items[0].publicId,
      type: items[0].type,
    };

    const newHighlight = new Carousel({
      title,
      description,
      coverImage,
      items,
      archived: false,
    });

    await newHighlight.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) io.emit("carouselUpdated");

    res.status(201).json({
      success: true,
      message: "Highlight created successfully",
      data: newHighlight,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Highlight creation failed", error: error.message || error.toString() });
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
    const highlight = await Carousel.findById(id);

    if (!highlight) {
      return res.status(404).json({ success: false, message: "Highlight not found" });
    }

    // ☁️ Remove ALL items from Cloudinary
    if (highlight.items && highlight.items.length > 0) {
      const deletePromises = highlight.items.map(item => {
        const resourceType = item.type === 'video' ? 'video' : 'image';
        return cloudinary.uploader.destroy(item.publicId, { resource_type: resourceType });
      });
      await Promise.all(deletePromises);
    }

    await Carousel.findByIdAndDelete(id);

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) io.emit("carouselUpdated");

    res.status(200).json({ success: true, message: "Highlight deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete highlight", error: error.message });
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
