// backend/controllers/datasetController.js
const xlsx = require("xlsx");
const Dataset = require("../models/Datasets.js");

// =======================
// UPLOAD EXCEL
// =======================
const uploadExcel = async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({ message: "Empty Excel file" });
    }

    const headers = Object.keys(rows[0]);

    const dataset = await Dataset.create({
      name: req.body.name || "Sex Disaggregated Data",
      headers,
      rows
    });

    res.json(dataset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// GET ALL DATASETS
// =======================
const getDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find().sort({ createdAt: -1 });
    res.json(datasets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// GET SINGLE DATASET
// =======================
const getDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });
    res.json(dataset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// DELETE DATASET
// =======================
const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findByIdAndDelete(req.params.id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });
    res.json({ message: "Dataset deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// EXPORT CONTROLLER
// =======================
module.exports = {
  uploadExcel,
  getDatasets,
  getDatasetById,
  deleteDataset
};
