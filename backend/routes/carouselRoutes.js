const express = require("express");
const { uploadCarousel } = require("../config/multer"); // ✅ FIXED
const {
  uploadMedia,
  getAllImages,
  archiveImage,
  getArchivedImages,
  restoreImage,
  deleteImage,
} = require("../controllers/carouselController");

const router = express.Router();

// ✅ Use uploadCarousel.array instead of single
router.post("/upload", uploadCarousel.array("media", 10), uploadMedia);
router.get("/", getAllImages);
router.put("/archive/:id", archiveImage);
router.get("/archived", getArchivedImages);
router.put("/restore/:id", restoreImage);
router.delete("/delete/:id", deleteImage);

module.exports = router;
