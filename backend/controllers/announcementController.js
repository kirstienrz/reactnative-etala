const Announcement = require("../models/Announcement");

// ✅ Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create announcement
// ✅ Create announcement (auto-date)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Automatically use today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    const newAnnouncement = new Announcement({
      title,
      content,
      date: today,
    });

    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ✅ Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
