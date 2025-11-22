// routes/infographics.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const infographicController = require('../controllers/infographicController');

// Get all active infographics
router.get('/', infographicController.getInfographics);

// Get archived infographics
router.get('/archived', infographicController.getArchivedInfographics);

// Create infographics (multiple images)
router.post('/', upload.array('images', 10), infographicController.createInfographics);

// Update infographic
router.put('/:id', upload.single('image'), infographicController.updateInfographic);

// Archive/Restore infographic
router.patch('/:id/status', infographicController.changeStatus);

// Delete infographic
router.delete('/:id', infographicController.deleteInfographic);

module.exports = router;