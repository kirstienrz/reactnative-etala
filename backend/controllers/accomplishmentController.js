const Accomplishment = require("../models/Accomplishment");

/* CREATE */
exports.createAccomplishment = async (req, res) => {
  const { title, year } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "PDF file is required" });
  }

  const accomplishment = await Accomplishment.create({
    title,
    year,
    fileUrl: req.file.path,
    publicId: req.file.filename,
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
