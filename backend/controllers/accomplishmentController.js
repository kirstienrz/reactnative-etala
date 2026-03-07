const Accomplishment = require("../models/Accomplishment");
const cloudinary = require("../config/cloudinary");

/* CREATE */
exports.createAccomplishment = async (req, res) => {
  const { title, year } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "A file (PDF, Video, or Image) is required" });
  }

  let fileType = "pdf";
  if (req.file.mimetype && req.file.mimetype.startsWith("video/")) {
    fileType = "video";
  } else if (req.file.mimetype && req.file.mimetype.startsWith("image/")) {
    fileType = "image";
  }

  const accomplishment = await Accomplishment.create({
    title,
    year,
    fileUrl: req.file.path,
    publicId: req.file.filename,
    type: fileType,
    uploadedBy: req.user?.id,
  });

  res.status(201).json(accomplishment);
};

/* GET ACTIVE */
exports.getAccomplishments = async (req, res) => {
  const data = await Accomplishment.find({ isArchived: false }).sort({ createdAt: -1 });
  res.json(data);
};

/* GET ARCHIVED */
exports.getArchivedAccomplishments = async (req, res) => {
  const data = await Accomplishment.find({ isArchived: true }).sort({ createdAt: -1 });
  res.json(data);
};

/* ARCHIVE */
exports.archiveAccomplishment = async (req, res) => {
  await Accomplishment.findByIdAndUpdate(req.params.id, { isArchived: true });
  res.json({ message: "Accomplishment archived" });
};

/* RESTORE */
exports.restoreAccomplishment = async (req, res) => {
  await Accomplishment.findByIdAndUpdate(req.params.id, { isArchived: false });
  res.json({ message: "Accomplishment restored" });
};

/* DELETE PERMANENTLY */
exports.deleteAccomplishment = async (req, res) => {
  try {
    const accomplishment = await Accomplishment.findById(req.params.id);
    if (!accomplishment) {
      return res.status(404).json({ message: "Accomplishment not found" });
    }

    // Delete from Cloudinary
    if (accomplishment.publicId) {
      let resourceType = "image"; // Default for PDF and images
      if (accomplishment.type === "video") {
        resourceType = "video";
      }

      await cloudinary.uploader.destroy(accomplishment.publicId, {
        resource_type: resourceType,
        invalidate: true
      });
    }

    await Accomplishment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Accomplishment deleted permanently" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete accomplishment", error: err.message });
  }
};
