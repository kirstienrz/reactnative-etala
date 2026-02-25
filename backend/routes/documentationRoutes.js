const express = require("express");
const router = express.Router();
const multer = require("multer");
const ctrl = require("../controllers/documentationController");

// ------------------------------
// Multer setup (memory storage)
// ------------------------------
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20,
  }
});

// ------------------------------
// Routes - IMPORTANT: Order matters!
// ------------------------------

// SPECIFIC ROUTES MUST COME BEFORE PARAMETERIZED ROUTES

// Get archived docs (specific muna)
router.get("/archived", ctrl.getArchivedDocs);

// Get active docs
router.get("/active", ctrl.getActiveDocs);

// Create new documentation
router.post("/", ctrl.createDocumentation);

// Get all documentation (active)
router.get("/", ctrl.getActiveDocs);  // Changed from getAllDocs to getActiveDocs

// Get single documentation by ID (ito dapat ang huli sa GET routes)
router.get("/:id", ctrl.getDoc);

// Upload files to a documentation
router.post("/:id/files", upload.array("files", 20), ctrl.uploadFiles);

// Delete a single file from a documentation
router.delete("/:docId/files/:fileId", ctrl.deleteFile);

// Archive a documentation
router.patch("/:id/archive", ctrl.archiveDoc);

module.exports = router;