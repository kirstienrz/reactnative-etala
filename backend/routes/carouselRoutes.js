const express = require("express");
const upload = require("../config/multer");
const { uploadImage, getAllImages, archiveImage, getArchivedImages, restoreImage } = require("../controllers/carouselController");

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);
router.get("/", getAllImages);
router.put("/archive/:id", archiveImage); // ✅ replaced delete with archive
router.get("/archived", getArchivedImages);
router.put("/restore/:id", restoreImage); // ✅ added restore route

module.exports = router;
