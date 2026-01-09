const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const { uploadResearchWithFiles } = require('../config/multer'); // ✅ Use the new middleware

// Middleware for handling multiple file uploads with error handling
const handleFileUpload = (req, res, next) => {
  uploadResearchWithFiles(req, res, function (err) {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false, 
            error: `File size is too large. Thumbnail: 5MB max, Research File: 10MB max.` 
          });
        }
        return res.status(400).json({ 
          success: false, 
          error: err.message 
        });
      } else if (err) {
        // Handle custom errors from fileFilter
        return res.status(400).json({ 
          success: false, 
          error: err.message 
        });
      }
    }
    next();
  });
};

// GET all research with filters
router.get('/', researchController.getAllResearch);

// GET research statistics
router.get('/stats', researchController.getStats);

// GET single research
router.get('/:id', researchController.getResearchById);

// CREATE new research (with file uploads)
router.post(
  '/',
  handleFileUpload, // ✅ Use the new middleware
  researchController.createResearch
);

// UPDATE research (with optional file uploads)
router.put(
  '/:id',
  handleFileUpload, // ✅ Use the new middleware
  researchController.updateResearch
);

// ARCHIVE research
router.patch('/:id/archive', researchController.archiveResearch);

// RESTORE research
router.patch('/:id/restore', researchController.restoreResearch);

// DELETE research
router.delete('/:id', researchController.deleteResearch);

// BULK operations
router.post('/bulk/archive', researchController.bulkArchive);
router.post('/bulk/restore', researchController.bulkRestore);
router.post('/bulk/delete', researchController.bulkDelete);

module.exports = router;