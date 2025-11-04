const Resource = require("../models/Resource");

// Get all resources
const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resources", error });
  }
};

// Create resource
const createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ message: "Failed to create resource", error });
  }
};

// Update resource
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: "Failed to update resource", error });
  }
};

// Delete resource
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json({ message: "Resource deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete resource", error });
  }
};

module.exports = {
  getResources,
  createResource,
  updateResource,
  deleteResource,
};
