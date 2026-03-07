import Document from "../models/Document.js";
import cloudinary from "../config/cloudinary.js";

// CREATE


export const getDocuments = async (req, res) => {
  const { type, status } = req.query;

  let filter = { status: { $ne: "archived" } }; // Kunin lang ang hindi archived
  if (type) filter.document_type = type;

  // Note: Tinanggal ang status filter dito para active lang talaga
  const docs = await Document.find(filter).sort({ createdAt: -1 });
  res.json(docs);
};

export const getArchivedDocuments = async (req, res) => {
  const docs = await Document.find({ status: "archived" }).sort({ createdAt: -1 });
  res.json(docs);
};

export const archiveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const restoreDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByIdAndUpdate(
      id,
      { $unset: { status: 1 } }, // Tanggalin ang status field o pwede rin { status: "active" }
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const file_url = req.file ? req.file.path : req.body.file_url;
    const public_id = req.file ? req.file.filename : null;
    if (!file_url) return res.status(400).json({ message: "File is required." });

    const doc = await Document.create({
      ...req.body,
      file_url,
      public_id
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (req.file) {
      // 🛡️ Remove old file from Cloudinary (if public_id exists)
      if (doc.public_id) {
        const resourceType = doc.file_url.toLowerCase().endsWith('.pdf') ? 'image' : 'raw';
        await cloudinary.uploader.destroy(doc.public_id, { resource_type: resourceType });
      }
      doc.file_url = req.file.path;
      doc.public_id = req.file.filename;
    } else if (req.body.file_url) {
      doc.file_url = req.body.file_url;
    }

    Object.assign(doc, req.body);
    await doc.save();

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE (PERMANENT)
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // 🛡️ Permanent Cloudinary cleanup
    if (doc.public_id) {
      const resourceType = doc.file_url.toLowerCase().endsWith('.pdf') ? 'image' : 'raw';
      await cloudinary.uploader.destroy(doc.public_id, { resource_type: resourceType });
    }

    await Document.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: "Document deleted permanently from Cloudinary & Database" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Failed to delete document", error: err.message });
  }
};
