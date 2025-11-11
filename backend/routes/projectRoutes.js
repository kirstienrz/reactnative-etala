const express = require("express");
const router = express.Router();
const { uploadProject } = require("../config/multer");
const {
  uploadProjectFile,
  getAllProjects,
  archiveProject,
  getArchivedProjects,
  restoreProject,
} = require("../controllers/projectController");

router.post("/upload", uploadProject.single("image"), uploadProjectFile);
router.get("/", getAllProjects);
router.get("/archived", getArchivedProjects);
router.patch("/:id/archive", archiveProject);
router.patch("/:id/restore", restoreProject);

module.exports = router;
