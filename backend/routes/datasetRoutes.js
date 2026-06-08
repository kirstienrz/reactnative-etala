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

// INSPECT EXCEL — returns sheet names + previews (no DB write)
router.post('/inspect', upload.single('file'), datasetController.inspectExcel);

// DOWNLOAD TEMPLATE
router.get('/template', datasetController.downloadTemplate);

// UPLOAD ROUTE — imports a specific sheet into DB
router.post('/upload', upload.single('file'), datasetController.uploadExcel);

// CREATE MANUAL DATASET — from form input (no Excel file)
router.post('/manual', datasetController.createManualDataset);

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

// Update a dataset
router.put('/:id', datasetController.updateDataset);

// Delete a dataset
router.delete('/:id', datasetController.deleteDataset);

module.exports = router;