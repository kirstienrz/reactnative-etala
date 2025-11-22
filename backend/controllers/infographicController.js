// controllers/infographicController.js
const Infographic = require("../models/Infographic");
const cloudinary = require("../config/cloudinary");

// ✅ Get all infographics (with filtering)
const getInfographics = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    if (status === 'archived') {
      filter.status = 'archived';
    } else {
      filter.status = 'active'; // Default to active
    }

    const infographics = await Infographic.find(filter).sort({ uploadDate: -1 });
    res.status(200).json(infographics);
  } catch (error) {
    console.error("Error fetching infographics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch infographics" });
  }
};

// ✅ Get archived infographics
const getArchivedInfographics = async (req, res) => {
  try {
    const infographics = await Infographic.find({ status: 'archived' }).sort({ uploadDate: -1 });
    res.status(200).json(infographics);
  } catch (error) {
    console.error("Error fetching archived infographics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch archived infographics" });
  }
};

// ✅ Create infographics (multiple images)
const createInfographics = async (req, res) => {
  try {
    const { academicYear, title } = req.body;
    const files = req.files;

    if (!academicYear) {
      return res.status(400).json({ success: false, message: "Academic year is required" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one image is required" });
    }

    const uploadResults = [];

    // Upload each image to Cloudinary
    for (const file of files) {
      try {
        const result = await cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          async (error, result) => {
            if (error) throw error;
            
            const infographicTitle = title || `Infographic ${uploadResults.length + 1}`;
            
            const newInfographic = new Infographic({
              academicYear,
              title: infographicTitle,
              imageUrl: result.secure_url,
              cloudinaryId: result.public_id,
              uploadDate: new Date(),
              status: 'active'
            });

            await newInfographic.save();
            uploadResults.push(newInfographic);
          }
        );

        result.end(file.buffer);
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        continue; // Continue with next file even if one fails
      }
    }

    // Wait for all uploads to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 🔔 Real-time update
    const io = req.app.get("io");
    io?.emit("infographicsUpdated");

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadResults.length} infographic(s)`,
      data: uploadResults,
    });
  } catch (error) {
    console.error("Error creating infographics:", error);
    res.status(500).json({ success: false, message: "Failed to create infographics" });
  }
};

// ✅ Update infographic
const updateInfographic = async (req, res) => {
  try {
    const { id } = req.params;
    const { academicYear, title } = req.body;
    
    const infographic = await Infographic.findById(id);
    if (!infographic) {
      return res.status(404).json({ success: false, message: "Infographic not found" });
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (infographic.cloudinaryId) {
        await cloudinary.uploader.destroy(infographic.cloudinaryId);
      }

      // Upload new image
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      infographic.imageUrl = result.secure_url;
      infographic.cloudinaryId = result.public_id;
    }

    // Update other fields
    if (academicYear) infographic.academicYear = academicYear;
    if (title) infographic.title = title;

    await infographic.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    io?.emit("infographicsUpdated");

    res.status(200).json({ 
      success: true, 
      message: "Infographic updated successfully",
      data: infographic 
    });
  } catch (error) {
    console.error("Error updating infographic:", error);
    res.status(500).json({ success: false, message: "Failed to update infographic" });
  }
};

// ✅ Change status (Archive/Restore)
const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const infographic = await Infographic.findById(id);
    if (!infographic) {
      return res.status(404).json({ success: false, message: "Infographic not found" });
    }

    infographic.status = status;
    await infographic.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    io?.emit("infographicsUpdated");

    res.status(200).json({ 
      success: true, 
      message: `Infographic ${status === 'archived' ? 'archived' : 'restored'} successfully` 
    });
  } catch (error) {
    console.error("Error changing infographic status:", error);
    res.status(500).json({ success: false, message: "Failed to change infographic status" });
  }
};

// ✅ Delete infographic
const deleteInfographic = async (req, res) => {
  try {
    const { id } = req.params;
    const infographic = await Infographic.findById(id);

    if (!infographic) {
      return res.status(404).json({ success: false, message: "Infographic not found" });
    }

    // Delete image from Cloudinary
    if (infographic.cloudinaryId) {
      await cloudinary.uploader.destroy(infographic.cloudinaryId);
    }

    await Infographic.findByIdAndDelete(id);

    // 🔔 Real-time update
    const io = req.app.get("io");
    io?.emit("infographicsUpdated");

    res.status(200).json({ 
      success: true, 
      message: "Infographic deleted permanently" 
    });
  } catch (error) {
    console.error("Error deleting infographic:", error);
    res.status(500).json({ success: false, message: "Failed to delete infographic" });
  }
};

module.exports = {
  getInfographics,
  getArchivedInfographics,
  createInfographics,
  updateInfographic,
  changeStatus,
  deleteInfographic,
};