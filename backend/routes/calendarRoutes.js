const express = require('express');
const router = express.Router();
const {
  getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} = require('../controllers/calendarController');

router.route('/events')
  .get(getAllCalendarEvents)
  .post(createCalendarEvent);

router.route('/events/:id')
  .put(updateCalendarEvent)
  .delete(deleteCalendarEvent);

module.exports = router;