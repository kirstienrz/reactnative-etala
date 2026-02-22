// routes/calendar.js
const express = require('express');
const router = express.Router();
const {
  getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  sendInterviewBookingLink,
  verifyBookingAccess,
  getMyConsultations,
  getUserConsultationsForReport
} = require('../controllers/calendarController');
const { uploadCalendarEvent } = require('../config/multer');
const auth = require('../middleware/auth');

// ✅ FIXED: Both POST and PUT now have file upload middleware
router.route('/events')
  .get(getAllCalendarEvents)
  .post(uploadCalendarEvent.array('attachments', 10), createCalendarEvent);

router.route('/events/:id')
  .put(uploadCalendarEvent.array('attachments', 10), updateCalendarEvent)  // ✅ ADDED
  .delete(deleteCalendarEvent);

router.post('/send-booking-link', sendInterviewBookingLink);
router.get('/verify-booking-access', verifyBookingAccess);

// Secure: Get only the authenticated user's consultations
router.get('/my-consultations', auth(), getMyConsultations);

// Get consultations for a specific user and report ticket
router.get('/user-consultations-for-report', getUserConsultationsForReport);

module.exports = router;