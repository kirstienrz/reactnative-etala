const express = require('express');
const router = express.Router();
const defaultScheduleController = require('../controllers/defaultScheduleController');
const auth = require('../middleware/auth');

// Create or update a default schedule for a specific month
router.post('/', auth(), defaultScheduleController.createDefaultSchedule);

// Get default schedule for a specific month
router.get('/:month/:year', auth(), defaultScheduleController.getDefaultSchedule);

// Get all default schedules for the current admin
router.get('/', auth(), defaultScheduleController.getAllDefaultSchedules);

// Delete a default schedule
router.delete('/:id', auth(), defaultScheduleController.deleteDefaultSchedule);

// Add an exception to a default schedule
router.post('/:id/exception', auth(), defaultScheduleController.addException);

// Generate AdminAvailability slots from default schedule
router.post('/:id/generate-slots', auth(), defaultScheduleController.generateSlotsFromSchedule);

module.exports = router;
