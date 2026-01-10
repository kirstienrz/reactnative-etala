// routes/datasetRoutes.js
const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/datasetController');
const multer = require('multer');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheetml')) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'), false);
        }
    }
});

// UPLOAD ROUTE - with multer middleware
router.post('/upload', upload.single('file'), datasetController.uploadExcel);

// Get all active datasets
router.get('/', datasetController.getDatasets);

// Get archived datasets
router.get('/archived', datasetController.getArchivedDatasets);

// Get specific dataset by ID
router.get('/:id', datasetController.getDatasetById);

// Archive a dataset
router.put('/:id/archive', datasetController.archiveDataset);

// Restore a dataset
router.put('/:id/restore', datasetController.restoreDataset);

// Delete a dataset
router.delete('/:id', datasetController.deleteDataset);

module.exports = router;