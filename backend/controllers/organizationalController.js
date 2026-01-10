// controllers/organizationalController.js
const OrgChartImage = require("../models/OrganizationalChart");
const cloudinary = require("../config/cloudinary");

// ✅ GET ALL ACTIVE IMAGES
const getAllImages = async (req, res) => {
  try {
    const images = await OrgChartImage.find({ isArchived: false }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error("Error fetching org chart images:", err);
    res.status(500).json({ message: "Failed to fetch images" });
  }
};

// ✅ GET ARCHIVED IMAGES
const getArchivedImages = async (req, res) => {
  try {
    const images = await OrgChartImage.find({ isArchived: true }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error("Error fetching archived org chart images:", err);
    res.status(500).json({ message: "Failed to fetch archived images" });
  }
};

// ✅ UPLOAD IMAGE (Single image like infographics)
const uploadImage = async (req, res) => {
  try {
    console.log('Upload request received');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
    }

    // Upload to Cloudinary using the same pattern as infographics
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "gad-portal/org-charts",
          resource_type: 'image' 
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    // Save to database
    const newImage = await OrgChartImage.create({
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      isArchived: false
    });

    // 🔔 Real-time update (if you have socket.io)
    const io = req.app.get("io");
    if (io) {
      io.emit("orgChartUpdated");
    }

    res.status(201).json({
      success: true,
      data: newImage
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to upload image",
      error: err.message 
    });
  }
};

// ✅ ARCHIVE IMAGE
const archiveImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await OrgChartImage.findById(id);
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Image not found" 
      });
    }

    image.isArchived = true;
    await image.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("orgChartUpdated");
    }

    res.status(200).json({ 
      success: true, 
      message: "Image archived successfully" 
    });
  } catch (err) {
    console.error("Error archiving image:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to archive image" 
    });
  }
};

// ✅ RESTORE IMAGE
const restoreImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await OrgChartImage.findById(id);
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Image not found" 
      });
    }

    image.isArchived = false;
    await image.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("orgChartUpdated");
    }

    res.status(200).json({ 
      success: true, 
      message: "Image restored successfully" 
    });
  } catch (err) {
    console.error("Error restoring image:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to restore image" 
    });
  }
};

// ✅ DELETE IMAGE PERMANENTLY (Optional - like infographics delete)
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await OrgChartImage.findById(id);
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Image not found" 
      });
    }

    // Delete from Cloudinary
    if (image.cloudinaryId) {
      await cloudinary.uploader.destroy(image.cloudinaryId);
    }

    await OrgChartImage.findByIdAndDelete(id);

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("orgChartUpdated");
    }

    res.status(200).json({ 
      success: true, 
      message: "Image deleted permanently" 
    });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete image" 
    });
  }
};

module.exports = {
  getAllImages,
  getArchivedImages,
  uploadImage,
  archiveImage,
  restoreImage,
  deleteImage  // Optional: Add if you want permanent delete
};