const express = require("express");
const router = express.Router();
const {
  getSuggestions,
  createSuggestion,
  updateSuggestion,
  deleteSuggestion,
  toggleArchive,
} = require("../controllers/suggestionController");

// Base route: /api/suggestions
router.get("/", getSuggestions);
router.post("/", createSuggestion);
router.put("/:id", updateSuggestion);
router.delete("/:id", deleteSuggestion);
router.patch("/:id/archive", toggleArchive);

module.exports = router;
