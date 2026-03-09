const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  fileType: { type: String }, // image | video | pdf | document
  resourceType: { type: String }, // image | video | raw
  format: { type: String },
  originalName: { type: String },
  size: { type: Number },
  caption: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now }
});

const accomplishmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    year: { type: Number, required: true },
    files: [fileSchema],
    isArchived: { type: Boolean, default: false },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accomplishment", accomplishmentSchema);
