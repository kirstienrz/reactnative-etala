const Suggestion = require("../models/Suggestion");
const notificationController = require("./notificationController");

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

// CREATE
exports.createSuggestion = async (req, res) => {
  try {
    // JWT stores 'id', not '_id'
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "You must be logged in to submit a suggestion." });
    }

    // Rate limiting: 2 suggestions per day (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await Suggestion.countDocuments({
      user: userId,
      submittedDate: { $gte: oneDayAgo }
    });

    if (count >= 2) {
      return res.status(429).json({ 
        error: "Daily limit reached. You can only submit 2 suggestions per 24 hours." 
      });
    }

    const newId = await getNextId();

    // Set priority automatically to "low"
    let priority = "low";

    // Only allow admin to override if they pass priority
    if (req.body.isAdmin && req.body.priority) {
      priority = req.body.priority;
    }

    const suggestion = new Suggestion({
      id: newId,
      user: userId,
      text: req.body.text,
      submittedBy: req.user.name || "User",
      priority: priority
    });

    await suggestion.save();

    // 🔥 EMIT SOCKET EVENT FOR NEW SUGGESTION
    const io = req.app.get("io");
    if (io) {
      io.to("admin-room").emit("new-suggestion", {
        suggestion: suggestion
      });

      // ✅ SAVE PERSISTENT NOTIFICATION FOR ADMINS
      notificationController.createNotification({
        recipientRole: 'superadmin',
        type: 'suggestion',
        title: '💡 New Suggestion Received',
        content: `A new suggestion has been submitted: "${suggestion.text.substring(0, 50)}..."`,
        metadata: { suggestionId: suggestion.id },
        link: '/superadmin/suggestions'
      });
    }

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
