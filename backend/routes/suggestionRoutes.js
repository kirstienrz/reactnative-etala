const express = require("express");
const router = express.Router();
const controller = require("../controllers/suggestionController");
const auth = require("../middleware/auth");

// GET ALL
router.get("/", controller.getSuggestions);

// CREATE — login required (frontend shows login overlay if not logged in)
router.post("/", auth(), controller.createSuggestion);

// UPDATE
router.put("/:id", controller.updateSuggestion);

// ARCHIVE / UNARCHIVE
router.patch("/:id/archive", controller.toggleArchive);

// DELETE
router.delete("/:id", controller.deleteSuggestion);

module.exports = router;
