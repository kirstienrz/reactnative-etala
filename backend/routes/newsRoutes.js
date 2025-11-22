const express = require("express");
const { uploadCarousel } = require("../config/multer"); // ✅ Using your existing multer config
const {
  createNews,
  getAllNews,
  updateNews,
  archiveNews,
  getArchivedNews,
  restoreNews,
  deleteNews,
} = require("../controllers/newsController");

const router = express.Router();

// ✅ Public routes - Get news
router.get("/", getAllNews);
router.get("/archived", getArchivedNews);

// ✅ Admin routes - Manage news
router.post("/", uploadCarousel.single("image"), createNews);
router.put("/:id", uploadCarousel.single("image"), updateNews);
router.put("/archive/:id", archiveNews);
router.put("/restore/:id", restoreNews);
router.delete("/:id", deleteNews); // Permanent delete

module.exports = router;