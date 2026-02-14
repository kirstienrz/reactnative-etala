// routes/calendar.js
const express = require('express');
const router = express.Router();
const {
  getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  sendInterviewBookingLink,
  verifyBookingAccess
} = require('../controllers/calendarController');
const { uploadCalendarEvent } = require('../config/multer');

// ✅ FIXED: Both POST and PUT now have file upload middleware
router.route('/events')
  .get(getAllCalendarEvents)
  .post(uploadCalendarEvent.array('attachments', 10), createCalendarEvent);

router.route('/events/:id')
  .put(uploadCalendarEvent.array('attachments', 10), updateCalendarEvent)  // ✅ ADDED
  .delete(deleteCalendarEvent);

router.post('/send-booking-link', sendInterviewBookingLink);
router.get('/verify-booking-access', verifyBookingAccess);

module.exports = router;