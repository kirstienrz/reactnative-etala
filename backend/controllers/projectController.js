const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary"); // your cloudinary config

exports.uploadProjectFile = async (req, res) => {
  try {
    let attachments = [];

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path); // upload to cloudinary
      attachments.push({
        imageUrl: result.secure_url, // full URL
        publicId: result.public_id,
      });
    }

    const newProject = new Project({
      title: req.body.title,
      description: req.body.description,
      year: req.body.year,
      attachments, // ✅ store in attachments array
    });

    await newProject.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    console.error("❌ Error uploading project:", error);
    res.status(500).json({ success: false, message: "Failed to upload project" });
  }
};


// ✅ Get all (non-archived)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ archived: false }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

// ✅ Archive
exports.archiveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.archived = true;
    await project.save();
    res.json({ message: "Project archived", project });
  } catch (error) {
    res.status(500).json({ message: "Error archiving project", error });
  }
};

// ✅ Restore
exports.restoreProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.archived = false;
    await project.save();
    res.json({ message: "Project restored", project });
  } catch (error) {
    res.status(500).json({ message: "Error restoring project", error });
  }
};

// ✅ Get archived
exports.getArchivedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ archived: true }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching archived projects", error });
  }
};
