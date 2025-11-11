const Suggestion = require("../models/Suggestion");

// 🧾 Get all suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort({ submittedDate: -1 });
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Create new suggestion
exports.createSuggestion = async (req, res) => {
  try {
    const newSuggestion = new Suggestion(req.body);
    await newSuggestion.save();

    // 🔔 Emit real-time update event via socket.io
    const io = req.app.get("io");
    io.emit("suggestionUpdated");

    res.status(201).json(newSuggestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✏️ Update suggestion
exports.updateSuggestion = async (req, res) => {
  try {
    const updated = await Suggestion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    const io = req.app.get("io");
    io.emit("suggestionUpdated");

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🗑️ Delete suggestion
exports.deleteSuggestion = async (req, res) => {
  try {
    await Suggestion.findByIdAndDelete(req.params.id);

    const io = req.app.get("io");
    io.emit("suggestionUpdated");

    res.status(200).json({ message: "Suggestion deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📦 Archive / Unarchive suggestion
exports.toggleArchive = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    suggestion.archived = !suggestion.archived;
    await suggestion.save();

    const io = req.app.get("io");
    io.emit("suggestionUpdated");

    res.status(200).json(suggestion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
