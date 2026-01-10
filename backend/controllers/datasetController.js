// controllers/datasetController.js
const Dataset = require('../models/Datasets');
const xlsx = require('xlsx');

// Get active datasets (not archived)
exports.getDatasets = async (req, res) => {
    try {
        const datasets = await Dataset.find({ 
            $or: [
                { isArchived: false },
                { isArchived: { $exists: false } }
            ]
        }).sort({ createdAt: -1 });
        
        res.status(200).json(datasets);
    } catch (error) {
        console.error('Error fetching datasets:', error);
        res.status(500).json({ error: 'Failed to fetch datasets' });
    }
};

// Get archived datasets
exports.getArchivedDatasets = async (req, res) => {
    try {
        const datasets = await Dataset.find({ isArchived: true })
            .sort({ archivedAt: -1 });
        
        res.status(200).json(datasets);
    } catch (error) {
        console.error('Error fetching archived datasets:', error);
        res.status(500).json({ error: 'Failed to fetch archived datasets' });
    }
};

// Get dataset by ID
exports.getDatasetById = async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);
        
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }
        
        res.status(200).json(dataset);
    } catch (error) {
        console.error('Error fetching dataset:', error);
        res.status(500).json({ error: 'Failed to fetch dataset' });
    }
};

// Archive a dataset
exports.archiveDataset = async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);
        
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }
        
        dataset.isArchived = true;
        dataset.archivedAt = new Date();
        await dataset.save();
        
        res.status(200).json({ 
            message: 'Dataset archived successfully',
            dataset: dataset
        });
    } catch (error) {
        console.error('Error archiving dataset:', error);
        res.status(500).json({ error: 'Failed to archive dataset' });
    }
};

// Restore a dataset
exports.restoreDataset = async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);
        
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }
        
        dataset.isArchived = false;
        dataset.restoredAt = new Date();
        await dataset.save();
        
        res.status(200).json({ 
            message: 'Dataset restored successfully',
            dataset: dataset
        });
    } catch (error) {
        console.error('Error restoring dataset:', error);
        res.status(500).json({ error: 'Failed to restore dataset' });
    }
};

// Delete a dataset
exports.deleteDataset = async (req, res) => {
    try {
        const dataset = await Dataset.findByIdAndDelete(req.params.id);
        
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }
        
        res.status(200).json({ message: 'Dataset deleted successfully' });
    } catch (error) {
        console.error('Error deleting dataset:', error);
        res.status(500).json({ error: 'Failed to delete dataset' });
    }
};

// UPLOAD EXCEL - COMPLETE FUNCTION
exports.uploadExcel = async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('File:', req.file);
        console.log('Body:', req.body);
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!req.body.name || req.body.name.trim() === '') {
            return res.status(400).json({ error: 'Dataset name is required' });
        }

        // Check file type
        const fileExt = req.file.originalname.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls'].includes(fileExt)) {
            return res.status(400).json({ error: 'Only .xlsx and .xls files are allowed' });
        }

        // Read Excel file
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const data = xlsx.utils.sheet_to_json(sheet);
        
        if (!data || data.length === 0) {
            return res.status(400).json({ error: 'Excel file is empty' });
        }
        
        // Get headers
        const headers = Object.keys(data[0]);
        
        // Process rows
        const rows = data.map(row => {
            const processedRow = {};
            headers.forEach(header => {
                processedRow[header] = row[header] !== undefined ? row[header] : '';
            });
            return processedRow;
        });

        // Create new dataset
        const newDataset = new Dataset({
            name: req.body.name.trim(),
            headers: headers,
            rows: rows,
            isArchived: false,
            archivedAt: null,
            restoredAt: null
        });

        await newDataset.save();
        
        res.status(201).json({
            message: 'Dataset uploaded successfully',
            dataset: newDataset
        });
        
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ 
            error: 'Failed to upload file',
            details: error.message 
        });
    }
};