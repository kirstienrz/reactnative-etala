const mongoose = require("mongoose");

const BudgetProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  file: {
    public_id: String,
    original_url: String,
    image_urls: [String],
    format: String,
    page_count: { type: Number, default: 1 },
    is_previewable: { type: Boolean, default: false } // Add this
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("BudgetProgram", BudgetProgramSchema);
