const Webinar = require("../models/Webinar");

// Get all webinars
const getWebinars = async (req, res) => {
  try {
    const webinars = await Webinar.find().sort({ createdAt: -1 });
    res.json(webinars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch webinars", error });
  }
};

// Create webinar
const createWebinar = async (req, res) => {
  try {
    const webinar = await Webinar.create(req.body);
    res.status(201).json(webinar);
  } catch (error) {
    res.status(400).json({ message: "Failed to create webinar", error });
  }
};

// Update webinar
const updateWebinar = async (req, res) => {
  try {
    const webinar = await Webinar.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!webinar) return res.status(404).json({ message: "Webinar not found" });
    res.json(webinar);
  } catch (error) {
    res.status(400).json({ message: "Failed to update webinar", error });
  }
};

// Delete webinar
const deleteWebinar = async (req, res) => {
  try {
    const webinar = await Webinar.findByIdAndDelete(req.params.id);
    if (!webinar) return res.status(404).json({ message: "Webinar not found" });
    res.json({ message: "Webinar deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete webinar", error });
  }
};

module.exports = {
  getWebinars,
  createWebinar,
  updateWebinar,
  deleteWebinar,
};
