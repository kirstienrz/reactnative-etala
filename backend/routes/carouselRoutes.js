const express = require("express");
const { uploadCarousel } = require("../config/multer"); // ✅ FIXED
const {
  uploadImage,
  getAllImages,
  archiveImage,
  getArchivedImages,
  restoreImage,
} = require("../controllers/carouselController");

const router = express.Router();

// ✅ Use uploadCarousel instead of upload
router.post("/upload", uploadCarousel.single("image"), uploadImage);
router.get("/", getAllImages);
router.put("/archive/:id", archiveImage);
router.get("/archived", getArchivedImages);
router.put("/restore/:id", restoreImage);

module.exports = router;
