// models/OrganizationalChart.js
const mongoose = require("mongoose");

const orgChartImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("OrgChartImage", orgChartImageSchema);