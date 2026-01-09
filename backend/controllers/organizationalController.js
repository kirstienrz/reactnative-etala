const OrgChartImage = require("../models/OrganizationalChart");
const cloudinary = require("../config/cloudinary"); // Cloudinary setup
const fs = require("fs");

// UPLOAD IMAGE
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "org-chart",
    });

    // Save URL to DB
    const newImage = await OrgChartImage.create({
      imageUrl: result.secure_url,
    });

    // Remove temp file
    fs.unlinkSync(req.file.path);

    res.status(201).json(newImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

// GET ACTIVE IMAGES
exports.getAllImages = async (req, res) => {
  try {
    const images = await OrgChartImage.find({ isArchived: false }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch images" });
  }
};

// GET ARCHIVED IMAGES
exports.getArchivedImages = async (req, res) => {
  try {
    const images = await OrgChartImage.find({ isArchived: true }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch archived images" });
  }
};

// ARCHIVE IMAGE
exports.archiveImage = async (req, res) => {
  try {
    await OrgChartImage.findByIdAndUpdate(req.params.id, { isArchived: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: "Failed to archive image" });
  }
};

// RESTORE IMAGE
exports.restoreImage = async (req, res) => {
  try {
    await OrgChartImage.findByIdAndUpdate(req.params.id, { isArchived: false });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: "Failed to restore image" });
  }
};
