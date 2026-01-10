// routes/organizationalRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllImages,
  getArchivedImages,
  uploadImage,
  archiveImage,
  restoreImage,
  deleteImage  // Optional
} = require('../controllers/organizationalController');

// Use memory storage like infographics
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get('/images', getAllImages);
router.get('/archived', getArchivedImages);
router.post('/upload', upload.single('image'), uploadImage); // 'image' matches frontend
router.put('/archive/:id', archiveImage);
router.put('/restore/:id', restoreImage);
router.delete('/delete/:id', deleteImage); // Optional

module.exports = router;