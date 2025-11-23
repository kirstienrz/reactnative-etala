const Suggestion = require("../models/Suggestion");

// Auto-increment (simple)
async function getNextId() {
  const last = await Suggestion.find().sort({ id: -1 }).limit(1);
  return last.length === 0 ? 1 : last[0].id + 1;
}

// GET ALL — used for getSuggestions()
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort({ id: 1 });
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
};

// CREATE (optional)
exports.createSuggestion = async (req, res) => {
  try {
    const newId = await getNextId();

    // Set priority automatically to "low"
    let priority = "low"; 

    // Only allow admin to override if they pass priority
    if (req.body.isAdmin && req.body.priority) {
      priority = req.body.priority;
    }

    const suggestion = new Suggestion({
      id: newId,
      text: req.body.text,
      submittedBy: req.body.submittedBy,
      priority: priority
    });

    await suggestion.save();
    res.json(suggestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create suggestion", details: err.message });
  }
};


// UPDATE — used for updateSuggestion(id)
exports.updateSuggestion = async (req, res) => {
  try {
    const updated = await Suggestion.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update suggestion" });
  }
};

// ARCHIVE TOGGLE — used for toggleArchive(id)
exports.toggleArchive = async (req, res) => {
  try {
    const suggestion = await Suggestion.findOne({ id: req.params.id });

    if (!suggestion) {
      return res.status(404).json({ error: "Not found" });
    }

    suggestion.archived = !suggestion.archived;
    await suggestion.save();

    res.json({ success: true, archived: suggestion.archived });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle archive" });
  }
};
