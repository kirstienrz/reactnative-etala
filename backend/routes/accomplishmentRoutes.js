const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createAccomplishment,
  getAccomplishments,
  getArchivedAccomplishments,
  archiveAccomplishment,
  restoreAccomplishment,
  deleteAccomplishment,
  uploadFiles,
  deleteFile
} = require("../controllers/accomplishmentController");

// Use memory storage for multiple file support (like documentation)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 20,
  }
});

router.get("/", getAccomplishments);
router.get("/archived", getArchivedAccomplishments);
router.post("/", createAccomplishment);
// Use upload.array for multiple files
router.post("/:id/files", upload.array("files", 20), uploadFiles);
router.delete("/:accomplishmentId/files/:fileId", deleteFile);

router.put("/:id/archive", archiveAccomplishment);
router.put("/:id/restore", restoreAccomplishment);
router.delete("/:id", deleteAccomplishment);

module.exports = router;
