// routes/calendar.js
const express = require('express');
const router = express.Router();
const {
  getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  sendInterviewBookingLink,
  verifyBookingAccess  // ✅ NEW
} = require('../controllers/calendarController');

router.route('/events')
  .get(getAllCalendarEvents)
  .post(createCalendarEvent);

router.route('/events/:id')
  .put(updateCalendarEvent)
  .delete(deleteCalendarEvent);

router.post('/send-booking-link', sendInterviewBookingLink);
router.get('/verify-booking-access', verifyBookingAccess);  // ✅ NEW

module.exports = router;