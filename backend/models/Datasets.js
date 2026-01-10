// backend/models/Dataset.js
const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema(
  {
    name: String,
    headers: [String],
    rows: [mongoose.Schema.Types.Mixed]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dataset", datasetSchema);
