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

// CREATE MANUAL DATASET — from form input (no Excel file)
exports.createManualDataset = async (req, res) => {
    try {
        const { name, headers, rows, yearLevelField, programField } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Dataset name is required' });
        }

        if (!headers || !Array.isArray(headers) || headers.length === 0) {
            return res.status(400).json({ error: 'Headers are required' });
        }

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({ error: 'At least one row of data is required' });
        }

        // Validate that all rows have the same number of columns as headers
        const invalidRows = rows.filter(row => Object.keys(row).length !== headers.length);
        if (invalidRows.length > 0) {
            return res.status(400).json({ 
                error: 'All rows must have the same number of columns as headers',
                details: `${invalidRows.length} rows have incorrect column count`
            });
        }

        const newDataset = new Dataset({
            name: name.trim(),
            headers,
            rows,
            isArchived: false,
            archivedAt: null,
            restoredAt: null,
            sourceSheet: 'Manual Entry',
            yearLevelField: yearLevelField || null,
            programField: programField || null
        });

        await newDataset.save();

        res.status(201).json({
            message: 'Dataset created successfully',
            dataset: newDataset
        });
    } catch (error) {
        console.error('Error creating manual dataset:', error);
        res.status(500).json({ 
            error: 'Failed to create dataset',
            details: error.message
        });
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

// Update a dataset (Name and/or Rows)
exports.updateDataset = async (req, res) => {
    try {
        const { name, rows } = req.body;
        const dataset = await Dataset.findById(req.params.id);

        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }

        if (name) dataset.name = name;
        if (rows) dataset.rows = rows;

        await dataset.save();

        res.status(200).json({
            message: 'Dataset updated successfully',
            dataset: dataset
        });
    } catch (error) {
        console.error('Error updating dataset:', error);
        res.status(500).json({ error: 'Failed to update dataset' });
    }
};

// INSPECT EXCEL — returns sheet names + preview of each sheet (first 5 rows)
exports.inspectExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileExt = req.file.originalname.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls'].includes(fileExt)) {
            return res.status(400).json({ error: 'Only .xlsx and .xls files are allowed' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetNames = workbook.SheetNames;

        const sheets = sheetNames.map(name => {
            const sheet = workbook.Sheets[name];
            const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
            const headers = data.length > 0 ? Object.keys(data[0]) : [];
            const preview = data.slice(0, 5);

            // Auto-detect Year Level and Program columns
            const YEAR_LEVEL_KEYWORDS = ['year', 'year level', 'yearlevel', 'level'];
            const PROGRAM_KEYWORDS = ['program', 'course', 'department', 'dept', 'program/course'];

            const detectedYearLevel = headers.find(h =>
                YEAR_LEVEL_KEYWORDS.some(kw => h.toLowerCase().includes(kw))
            ) || null;

            const detectedProgram = headers.find(h =>
                PROGRAM_KEYWORDS.some(kw => h.toLowerCase().includes(kw))
            ) || null;

            return {
                name,
                rowCount: data.length,
                headers,
                preview,
                detectedYearLevel,
                detectedProgram,
                isEmpty: data.length === 0
            };
        });

        res.status(200).json({ sheets });
    } catch (error) {
        console.error('Error inspecting Excel file:', error);
        res.status(500).json({ error: 'Failed to inspect file', details: error.message });
    }
};

// UPLOAD EXCEL — imports a specific sheet
exports.uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!req.body.name || req.body.name.trim() === '') {
            return res.status(400).json({ error: 'Dataset name is required' });
        }

        const fileExt = req.file.originalname.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls'].includes(fileExt)) {
            return res.status(400).json({ error: 'Only .xlsx and .xls files are allowed' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

        // Use the requested sheet name; fall back to first sheet
        const requestedSheet = req.body.sheetName;
        const sheetName = requestedSheet && workbook.SheetNames.includes(requestedSheet)
            ? requestedSheet
            : workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

        if (!data || data.length === 0) {
            return res.status(400).json({ error: `Sheet "${sheetName}" is empty` });
        }

        const headers = Object.keys(data[0]);

        const rows = data.map(row => {
            const processedRow = {};
            headers.forEach(header => {
                processedRow[header] = row[header] !== undefined ? row[header] : '';
            });
            return processedRow;
        });

        // Auto-detect Year Level and Program columns for classification
        const YEAR_LEVEL_KEYWORDS = ['year', 'year level', 'yearlevel', 'level'];
        const PROGRAM_KEYWORDS = ['program', 'course', 'department', 'dept', 'program/course'];

        const yearLevelField = headers.find(h =>
            YEAR_LEVEL_KEYWORDS.some(kw => h.toLowerCase().includes(kw))
        ) || null;

        const programField = headers.find(h =>
            PROGRAM_KEYWORDS.some(kw => h.toLowerCase().includes(kw))
        ) || null;

        const newDataset = new Dataset({
            name: req.body.name.trim(),
            headers,
            rows,
            isArchived: false,
            archivedAt: null,
            restoredAt: null,
            sourceSheet: sheetName,
            yearLevelField,
            programField
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

// DOWNLOAD TEMPLATE — sends a sample Excel template
exports.downloadTemplate = async (req, res) => {
    try {
        const wb = xlsx.utils.book_new();

        // --- Instructions sheet ---
        const instructions = [
            ['SEX DISAGGREGATED DATA — IMPORT TEMPLATE'],
            [''],
            ['INSTRUCTIONS:'],
            ['1. Fill in your data starting from row 2 of the "Data" sheet.'],
            ['2. Do NOT remove or rename the column headers in row 1.'],
            ['3. The "Sex" column must contain only: Male, Female, or Total.'],
            ['4. "Year Level" must be a number (1–5) or text like "1st Year".'],
            ['5. Leave a cell blank if data is not available — do not write "N/A".'],
            ['6. Numeric columns (e.g., Count, Total) must contain numbers only.'],
            ['7. Save the file as .xlsx before uploading.'],
            [''],
            ['SUPPORTED DATA TYPES:'],
            ['Text     — Names, programs, categories (e.g., BSIT, Male)'],
            ['Number   — Counts, totals, percentages (e.g., 42, 3.5)'],
            [''],
            ['COLUMN DESCRIPTIONS:'],
            ['Department/Program  — Name of the academic program or department'],
            ['Year Level          — Student year level (1, 2, 3, 4, or 5)'],
            ['Sex                 — Male / Female / Total'],
            ['Count               — Number of students'],
            ['Academic Year       — e.g., 2024-2025'],
        ];

        const wsInstructions = xlsx.utils.aoa_to_sheet(instructions);
        wsInstructions['!cols'] = [{ wch: 60 }];
        xlsx.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

        // --- Data sheet ---
        const sampleData = [
            {
                'Department/Program': 'BS in Information Technology',
                'Year Level': '1',
                'Sex': 'Male',
                'Count': 85,
                'Academic Year': '2024-2025'
            },
            {
                'Department/Program': 'BS in Information Technology',
                'Year Level': '1',
                'Sex': 'Female',
                'Count': 62,
                'Academic Year': '2024-2025'
            },
            {
                'Department/Program': 'BS in Civil Engineering',
                'Year Level': '2',
                'Sex': 'Male',
                'Count': 120,
                'Academic Year': '2024-2025'
            },
            {
                'Department/Program': 'BS in Civil Engineering',
                'Year Level': '2',
                'Sex': 'Female',
                'Count': 74,
                'Academic Year': '2024-2025'
            },
            {
                'Department/Program': 'BS in Electrical Engineering',
                'Year Level': '3',
                'Sex': 'Male',
                'Count': 98,
                'Academic Year': '2024-2025'
            },
        ];

        const wsData = xlsx.utils.json_to_sheet(sampleData);
        wsData['!cols'] = [
            { wch: 40 }, // Department/Program
            { wch: 12 }, // Year Level
            { wch: 10 }, // Sex
            { wch: 10 }, // Count
            { wch: 15 }, // Academic Year
        ];
        xlsx.utils.book_append_sheet(wb, wsData, 'Data');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="sex_disaggregated_data_template.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({ error: 'Failed to generate template' });
    }
};