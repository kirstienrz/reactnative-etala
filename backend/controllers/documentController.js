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
    if (!file_url) return res.status(400).json({ message: "File is required." });

    const doc = await Document.create({
      ...req.body,
      file_url,
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
      // optional: remove old file from Cloudinary
      doc.file_url = req.file.path;
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

    if (doc.file_url) await cloudinary.uploader.destroy(doc.file_url, { resource_type: "raw" });
    await doc.remove();

    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
