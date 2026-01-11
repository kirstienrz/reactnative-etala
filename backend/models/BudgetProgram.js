const mongoose = require("mongoose");

const BudgetProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  year: { type: String, required: true },
  dateApproved: { type: Date },
  status: { 
    type: String, 
    enum: ['Approved', 'Pending', 'Draft', 'Rejected'],
    default: 'Pending' 
  },
  isArchived: { type: Boolean, default: false }, // NEW - archive status
  archivedAt: { type: Date }, // NEW - archive timestamp
  file: {
    public_id: String,
    original_url: String,
    image_urls: [String],
    format: String,
    page_count: { type: Number, default: 1 },
    is_previewable: { type: Boolean, default: false }
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("BudgetProgram", BudgetProgramSchema);