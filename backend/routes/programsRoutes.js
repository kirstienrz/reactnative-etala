const express = require('express');
const router = express.Router();
const {
  getAllPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  toggleArchiveProgram,
  addProject,
  updateProject,
  deleteProject,
  toggleArchiveProject,
  addEvent,
  updateEvent,
  deleteEvent,
  toggleArchiveEvent
} = require('../controllers/programsController');

// Program routes
router.route('/')
  .get(getAllPrograms)
  .post(createProgram);

router.route('/:id')
  .get(getProgram)
  .put(updateProgram)
  .delete(deleteProgram);

router.route('/:id/archive')
  .patch(toggleArchiveProgram);

// Project routes
router.route('/:id/projects')
  .post(addProject);

router.route('/:id/projects/:projectId')
  .put(updateProject)
  .delete(deleteProject);

router.route('/:id/projects/:projectId/archive')
  .patch(toggleArchiveProject);

// Event routes
router.route('/:id/projects/:projectId/events')
  .post(addEvent);

router.route('/:id/projects/:projectId/events/:eventId')
  .put(updateEvent)
  .delete(deleteEvent);

router.route('/:id/projects/:projectId/events/:eventId/archive')
  .patch(toggleArchiveEvent);

module.exports = router;