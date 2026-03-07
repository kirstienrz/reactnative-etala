
const Documentation = require("../models/Documentation");
const cloudinary = require("../config/cloudinary");

// ✅ CREATE FOLDER / DOC SET
const createDocumentation = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const doc = await Documentation.create({
      title,
      description: description || "",
      files: []
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: "Create failed", error: err.message });
  }
};

// ✅ GET ALL
const getAllDocs = async (req, res) => {
  try {
    const docs = await Documentation.find({ isArchived: false }).sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

// ✅ GET ONE
const getDoc = async (req, res) => {
  try {
    const doc = await Documentation.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

// ✅ UPLOAD FILES - FIXED VERSION
const uploadFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { captions = [] } = req.body;

    const doc = await Documentation.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const newFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caption = captions[i] || "";

      // DETERMINE CORRECT RESOURCE TYPE BASED ON FILE MIMETYPE
      const mimeType = file.mimetype;
      let resourceType = "auto";

      if (mimeType === 'application/pdf') {
        resourceType = "raw"; // PDFs should explicitly be stored as raw files
      } else if (mimeType.includes('image/')) {
        resourceType = "image";
      } else if (mimeType.includes('video/')) {
        resourceType = "video";
      } else {
        resourceType = "raw"; // Documents like docx/xlsx should be 'raw'
      }

      console.log(`Uploading file: ${file.originalname}, MIME: ${mimeType}, Resource Type: ${resourceType}`);

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `gad-portal/docs/${id}`,
            resource_type: resourceType, // <-- FIXED: Use correct resource type
            public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`
          },
          (err, result) => err ? reject(err) : resolve(result)
        );
        uploadStream.end(file.buffer);
      });

      // FIXED: Get correct file type from MIME type, not from Cloudinary
      let fileType = mimeType;
      if (mimeType === 'application/pdf') {
        fileType = 'application/pdf';
      } else if (mimeType.includes('image/')) {
        fileType = 'image';
      } else if (mimeType.includes('video/')) {
        fileType = 'video';
      } else {
        fileType = mimeType;
      }

      newFiles.push({
        fileUrl: result.secure_url,
        cloudinaryId: result.public_id,
        fileType: fileType, // <-- FIXED: Use actual MIME type, not Cloudinary's resource_type
        originalName: file.originalname,
        size: file.size,
        caption,
        uploadedAt: new Date(),
        isPrivate: true
      });
    }

    doc.files.push(...newFiles);
    await doc.save();

    res.status(201).json({ success: true, message: "Files uploaded", data: newFiles });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: "Upload failed", error: err.message });
  }
};


// ✅ DELETE FILE
const deleteFile = async (req, res) => {
  try {
    const { docId, fileId } = req.params;

    const doc = await Documentation.findById(docId);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    const file = doc.files.id(fileId);
    if (!file) {
      console.warn("File not found in document:", { docId, fileId });
      return res.status(404).json({ success: false, message: "File not found" });
    }

    console.log("Deleting file from Cloudinary:", file.cloudinaryId);
    if (file.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(file.cloudinaryId);
      } catch (cErr) {
        console.error("Cloudinary delete error:", cErr);
        // Continue even if cloudinary fails
      }
    }

    // Use pull for better compatibility with Mongoose arrays
    doc.files.pull(fileId);
    await doc.save();

    console.log("File deleted successfully from DB");
    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
};

// ✅ DELETE DOC (Whole collection)
const deleteDoc = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Documentation.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    // Delete all files from Cloudinary
    if (doc.files && doc.files.length > 0) {
      for (const file of doc.files) {
        if (file.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(file.cloudinaryId);
          } catch (cErr) {
            console.error("Cloudinary delete error:", cErr);
          }
        }
      }
    }

    await Documentation.findByIdAndDelete(id);

    res.json({ success: true, message: "Documentation deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
};

// ✅ ARCHIVE DOC
const archiveDoc = async (req, res) => {
  const doc = await Documentation.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Not found" });

  doc.isArchived = true;
  await doc.save();

  res.json({ success: true, message: "Archived" });
};

// ✅ GET ARCHIVED DOCS
const getArchivedDocs = async (req, res) => {
  try {
    const docs = await Documentation.find({ isArchived: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

// ✅ GET ALL (active only) - rename para malinaw
const getActiveDocs = async (req, res) => {
  try {
    const docs = await Documentation.find({ isArchived: false }).sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

// Update exports
module.exports = {
  createDocumentation,
  getActiveDocs,    // renamed from getAllDocs
  getArchivedDocs,  // new function
  getDoc,
  uploadFiles,
  deleteFile,
  deleteDoc,        // new function for deleting the entire collection
  archiveDoc
};
