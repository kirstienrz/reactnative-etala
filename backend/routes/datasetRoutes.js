// backend/routes/datasetRoutes.js
const express = require("express");
const multer = require("multer");
const {
  uploadExcel,
  getDatasets,
  getDatasetById,
  deleteDataset
} = require("../controllers/datasetController.js");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Routes
router.post("/upload", upload.single("file"), uploadExcel);
router.get("/", getDatasets);
router.get("/:id", getDatasetById);
router.delete("/:id", deleteDataset);

module.exports = router;
