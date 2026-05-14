const express = require("express");
const router = express.Router();
const controller = require("../controllers/suggestionController");

const auth = require("../middleware/auth");
// GET ALL
router.get("/", controller.getSuggestions);

// CREATE
router.post("/", auth(), controller.createSuggestion);

// UPDATE
router.put("/:id", controller.updateSuggestion);

// ARCHIVE / UNARCHIVE
router.patch("/:id/archive", controller.toggleArchive);

module.exports = router;
