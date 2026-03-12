import Document from "../models/Document.js";
import cloudinary from "../config/cloudinary.js";

// ✅ GET ALL ACTIVE
export const getDocuments = async (req, res) => {
  try {
    const { type } = req.query;
    let filter = { status: { $ne: "archived" } };
    if (type && type !== 'all') filter.document_type = type;

    const docs = await Document.find(filter).sort({ title: 1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch failed", error: err.message });
  }
};

// ✅ GET ALL ARCHIVED
export const getArchivedDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ status: "archived" }).sort({ updatedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

// ✅ CREATE DOCUMENT ENTRY
export const createDocument = async (req, res) => {
  try {
    const { title, document_type, issued_by, date_issued, description } = req.body;

    if (!title || !document_type) {
      return res.status(400).json({ success: false, message: "Title and type are required" });
    }

    const doc = await Document.create({
      title,
      document_type,
      issued_by,
      date_issued,
      description,
      files: [],
      uploadedBy: req.user?.id
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: "Create failed", error: err.message });
  }
};

// ✅ UPLOAD FILES TO DOCUMENT
export const uploadFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { captions = [] } = req.body;

    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

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

      console.log(`Uploading file to Document: ${file.originalname}, MIME: ${mimeType}, Resource Type: ${resourceType}`);

      const fileNameWithoutExt = file.originalname.split('.')[0].replace(/\s+/g, "_");
      const fileExt = file.originalname.substring(file.originalname.lastIndexOf('.'));
      const finalExt = fileExt.toLowerCase() === '.pdf' ? '' : fileExt;

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `gad-portal/documents/${id}`,
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

    doc.files.push(...newFiles);
    await doc.save();

    res.status(201).json({ success: true, message: "Files uploaded", data: newFiles });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: "Upload failed", error: err.message });
  }
};

// ✅ UPDATE DOCUMENT INFO
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByIdAndUpdate(id, req.body, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed", error: err.message });
  }
};

// ✅ DELETE SINGLE FILE
export const deleteFile = async (req, res) => {
  try {
    const { documentId, fileId } = req.params;

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    const file = doc.files.id(fileId);
    if (!file) return res.status(404).json({ success: false, message: "File not found" });

    if (file.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(file.cloudinaryId, {
          resource_type: file.resourceType || 'auto'
        });
      } catch (cErr) {
        console.error("Cloudinary delete error:", cErr);
      }
    }

    doc.files.pull(fileId);
    await doc.save();

    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
};

// ✅ ARCHIVE
export const archiveDocument = async (req, res) => {
  try {
    await Document.findByIdAndUpdate(req.params.id, { status: "archived" });
    res.json({ success: true, message: "Document archived" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Archive failed" });
  }
};

// ✅ RESTORE
export const restoreDocument = async (req, res) => {
  try {
    await Document.findByIdAndUpdate(req.params.id, { status: "published" });
    res.json({ success: true, message: "Document restored" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Restore failed" });
  }
};

// ✅ DELETE ENTIRE DOCUMENT
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    // Cloudinary cleanup
    if (doc.files && doc.files.length > 0) {
      for (const file of doc.files) {
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

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Document deleted permanently" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
};
