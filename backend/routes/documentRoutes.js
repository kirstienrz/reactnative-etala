const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createDocument,
  getDocuments,
  getArchivedDocuments,
  updateDocument,
  archiveDocument,
  restoreDocument,
  deleteDocument,
  uploadFiles,
  deleteFile
} = require("../controllers/documentController");

// Use memory storage for multiple file support
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 20,
  }
});

router.get("/", getDocuments);
router.get("/archived", getArchivedDocuments);
router.post("/", createDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

// File management
router.post("/:id/files", upload.array("files", 20), uploadFiles);
router.delete("/:documentId/files/:fileId", deleteFile);

// Status changes
router.patch("/:id/archive", archiveDocument);
router.patch("/:id/restore", restoreDocument);

module.exports = router;
