const express = require("express");
const { uploadDocument } = require("../config/multer");
const {
  createDocument,
  getDocuments,
  getArchivedDocuments,
  updateDocument,
  archiveDocument,
  restoreDocument,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

// ✅ Create new document (file upload)
router.post("/", uploadDocument.single("file"), createDocument);

// ✅ Get all active documents
router.get("/", getDocuments);

// ✅ Get all archived documents
router.get("/archived", getArchivedDocuments);

// ✅ Update document (optional file replacement)
router.put("/:id", uploadDocument.single("file"), updateDocument);

// ✅ Archive document (soft delete)
router.patch("/:id/archive", archiveDocument);

// ✅ Restore archived document
router.patch("/:id/restore", restoreDocument);

// ✅ Permanent delete
router.delete("/:id", deleteDocument);

module.exports = router;
