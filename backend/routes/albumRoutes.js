const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllAlbums,
  getArchivedAlbums,
  getAlbum,
  createAlbum,
  uploadImages,
  updateAlbum,
  updateImageCaption,
  deleteImage,
  archiveAlbum,
  restoreAlbum,
  deleteAlbum,
  bulkArchiveAlbums,
  bulkRestoreAlbums
} = require('../controllers/albumController');

// Use memory storage like infographics
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 50 // Max 50 files
  }
});

// Public routes
router.get('/', getAllAlbums);
router.get('/archived', getArchivedAlbums);
router.get('/:id', getAlbum);

// Album CRUD operations
router.post('/', upload.single('coverImage'), createAlbum); // 'coverImage' field name
router.put('/:id', upload.single('coverImage'), updateAlbum); // Optional cover image update
router.delete('/:id', deleteAlbum);

// Album status
router.put('/:id/archive', archiveAlbum);
router.put('/:id/restore', restoreAlbum);

// Bulk operations
router.post('/bulk-archive', bulkArchiveAlbums);
router.post('/bulk-restore', bulkRestoreAlbums);

// Image operations within album
router.post('/:id/images', upload.array('images', 50), uploadImages); // 'images' field name, max 50 files
router.put('/:albumId/images/:imageIndex', updateImageCaption); // Update image caption
router.delete('/:albumId/images/:imageIndex', deleteImage); // Delete single image

module.exports = router;