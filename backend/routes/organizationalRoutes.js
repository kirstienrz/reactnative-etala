const express = require("express");
const { uploadCarousel } = require("../config/multer"); // Multer setup for single file
const {
  uploadImage,
  getAllImages,
  archiveImage,
  getArchivedImages,
  restoreImage,
} = require("../controllers/organizationalController");

const router = express.Router();

router.post("/upload", uploadCarousel.single("image"), uploadImage);
router.get("/", getAllImages);
router.put("/archive/:id", archiveImage);
router.get("/archived", getArchivedImages);
router.put("/restore/:id", restoreImage);

module.exports = router;
