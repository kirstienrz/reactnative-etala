const Accomplishment = require("../models/Accomplishment");
const cloudinary = require("../config/cloudinary");

// ✅ CREATE ACCOMPLISHMENT SET
exports.createAccomplishment = async (req, res) => {
  try {
    const { title, year, description } = req.body;

    if (!title || !year) {
      return res.status(400).json({ success: false, message: "Title and year are required" });
    }

    const accomplishment = await Accomplishment.create({
      title,
      year,
      description: description || "",
      files: [],
      uploadedBy: req.user?.id,
    });

    res.status(201).json({ success: true, data: accomplishment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Create failed", error: err.message });
  }
};

// ✅ GET ALL ACTIVE
exports.getAccomplishments = async (req, res) => {
  try {
    const data = await Accomplishment.find({ isArchived: false }).sort({ year: -1, createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

// ✅ GET ALL ARCHIVED
exports.getArchivedAccomplishments = async (req, res) => {
  try {
    const data = await Accomplishment.find({ isArchived: true }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

// ✅ UPLOAD FILES
exports.uploadFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { captions = [] } = req.body;

    const accomplishment = await Accomplishment.findById(id);
    if (!accomplishment) return res.status(404).json({ success: false, message: "Not found" });

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const newFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caption = captions[i] || "";

      const mimeType = file.mimetype;
      let resourceType = "auto";

      if (mimeType === 'application/pdf') {
        resourceType = "raw";
      } else if (mimeType.includes('image/')) {
        resourceType = "image";
      } else if (mimeType.includes('video/')) {
        resourceType = "video";
      } else {
        resourceType = "raw";
      }

      console.log(`Uploading file to Accomplishment: ${file.originalname}, MIME: ${mimeType}, Resource Type: ${resourceType}`);

      const fileNameWithoutExt = file.originalname.split('.')[0].replace(/\s+/g, "_");
      const fileExt = file.originalname.substring(file.originalname.lastIndexOf('.'));
      const finalExt = fileExt.toLowerCase() === '.pdf' ? '' : fileExt;

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `gad-portal/accomplishments/${id}`,
            resource_type: resourceType,
            public_id: `${Date.now()}_${fileNameWithoutExt}${finalExt}`
          },
          (err, result) => err ? reject(err) : resolve(result)
        );
        uploadStream.end(file.buffer);
      });

      // Categorize for DB
      let fileType = 'document';
      if (mimeType.startsWith('image/')) fileType = 'image';
      else if (mimeType.startsWith('video/')) fileType = 'video';
      else if (mimeType === 'application/pdf') fileType = 'pdf';

      newFiles.push({
        fileUrl: result.secure_url,
        cloudinaryId: result.public_id,
        fileType: fileType,
        resourceType: resourceType,
        originalName: file.originalname,
        size: file.size,
        caption,
        uploadedAt: new Date()
      });
    }

    accomplishment.files.push(...newFiles);
    await accomplishment.save();

    res.status(201).json({ success: true, message: "Files uploaded", data: newFiles });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: "Upload failed", error: err.message });
  }
};

// ✅ DELETE SINGLE FILE
exports.deleteFile = async (req, res) => {
  try {
    const { accomplishmentId, fileId } = req.params;

    const accomplishment = await Accomplishment.findById(accomplishmentId);
    if (!accomplishment) return res.status(404).json({ success: false, message: "Not found" });

    const file = accomplishment.files.id(fileId);
    if (!file) return res.status(404).json({ success: false, message: "File not found" });

    if (file.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(file.cloudinaryId, {
          resource_type: file.resourceType || (file.fileUrl.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|csv|txt)$/) ? 'raw' : 'image')
        });
      } catch (cErr) {
        console.error("Cloudinary delete error:", cErr);
      }
    }

    accomplishment.files.pull(fileId);
    await accomplishment.save();

    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
};

// ✅ ARCHIVE
exports.archiveAccomplishment = async (req, res) => {
  try {
    await Accomplishment.findByIdAndUpdate(req.params.id, { isArchived: true });
    res.json({ success: true, message: "Accomplishment archived" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Archive failed" });
  }
};

// ✅ RESTORE
exports.restoreAccomplishment = async (req, res) => {
  try {
    await Accomplishment.findByIdAndUpdate(req.params.id, { isArchived: false });
    res.json({ success: true, message: "Accomplishment restored" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Restore failed" });
  }
};

// ✅ DELETE ENTIRE SET
exports.deleteAccomplishment = async (req, res) => {
  try {
    const accomplishment = await Accomplishment.findById(req.params.id);
    if (!accomplishment) {
      return res.status(404).json({ success: false, message: "Accomplishment not found" });
    }

    // Delete all files from Cloudinary
    if (accomplishment.files && accomplishment.files.length > 0) {
      for (const file of accomplishment.files) {
        if (file.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(file.cloudinaryId, {
              resource_type: file.resourceType || 'auto'
            });
          } catch (cErr) {
            console.error("Cloudinary delete error:", cErr);
          }
        }
      }
    }

    await Accomplishment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Accomplishment deleted permanently" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
};
