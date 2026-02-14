const express = require('express');
const router = express.Router();
const adminAvailabilityController = require('../controllers/adminAvailabilityController');
const auth = require('../middleware/auth');

// Public: Get available slots for booking (no auth required — user booking page)
router.get('/public/available', adminAvailabilityController.getPublicAvailability);

// Get availability for an admin (optionally for a specific date)
router.get('/:adminId', auth(), adminAvailabilityController.getAvailability);

// Set or update availability for a specific date
router.post('/:adminId', auth(), adminAvailabilityController.setAvailability);

// Bulk set availability for multiple dates
router.post('/:adminId/bulk', auth(), adminAvailabilityController.setBulkAvailability);

// Save slot config (persisted settings)
router.put('/:adminId/config', auth(), adminAvailabilityController.saveSlotConfig);

// Delete availability for a specific date
router.delete('/:adminId/:date', auth(), adminAvailabilityController.deleteAvailability);

module.exports = router;
