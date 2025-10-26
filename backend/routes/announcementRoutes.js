const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement"); // no .js needed

// ✅ GET all announcements
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Error fetching announcements" });
  }
});

// ✅ POST new announcement (for admin panel)
router.post("/", async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const newAnnouncement = new Announcement({ title, message });
    await newAnnouncement.save();

    res.status(201).json({ message: "Announcement created successfully" });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Error creating announcement" });
  }
});

module.exports = router;
