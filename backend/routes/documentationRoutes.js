const express = require("express");
const router = express.Router();
const multer = require("multer");
const ctrl = require("../controllers/documentationController");

// ------------------------------
// Multer setup (memory storage)
// ------------------------------
const storage = multer.memoryStorage(); // store files in memory
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 20,                  // max 20 files per upload
  }
});

// ------------------------------
// Routes
// ------------------------------

// Create new documentation
router.post("/", ctrl.createDocumentation);

// Get all documentation
router.get("/", ctrl.getAllDocs);

// Get single documentation by ID
router.get("/:id", ctrl.getDoc);

// Upload files to a documentation (max 20 files)
router.post("/:id/files", upload.array("files", 20), ctrl.uploadFiles);

// Delete a single file from a documentation
router.delete("/:docId/files/:fileId", ctrl.deleteFile);

// Archive a documentation
router.patch("/:id/archive", ctrl.archiveDoc);

module.exports = router;
