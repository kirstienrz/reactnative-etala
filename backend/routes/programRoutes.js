const express = require("express");
const router = express.Router();
const {
  getPrograms,
  getProgramStats,
  createProgram,
  updateProgram,
  archiveProgram,
  restoreProgram,
  updateProgramStatus,
  addProject,
  updateProject,
  archiveProject,
  restoreProject,
  addEvent,
  updateEvent,
  archiveEvent,
  restoreEvent,
  deleteProgram,
  getArchivedPrograms
} = require("../controllers/programController");

// Program routes
router.get("/", getPrograms);
router.get("/stats", getProgramStats);
router.get("/archived", getArchivedPrograms); // New route for archived programs
router.post("/", createProgram);
router.put("/:id", updateProgram);
router.delete("/:id", deleteProgram);
router.patch("/:id/archive", archiveProgram);
router.patch("/:id/restore", restoreProgram);
router.patch("/:id/status", updateProgramStatus);

// Project routes
router.post("/:id/projects", addProject);
router.put("/:programId/projects/:projectId", updateProject);
router.patch("/:programId/projects/:projectId/archive", archiveProject);
router.patch("/:programId/projects/:projectId/restore", restoreProject);

// Event routes
router.post("/:programId/projects/:projectId/events", addEvent);
router.put("/:programId/projects/:projectId/events/:eventId", updateEvent);
router.patch("/:programId/projects/:projectId/events/:eventId/archive", archiveEvent);
router.patch("/:programId/projects/:projectId/events/:eventId/restore", restoreEvent);

module.exports = router;