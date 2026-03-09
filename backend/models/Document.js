import mongoose from "mongoose";

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

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    document_type: {
      type: String,
      enum: ["policy", "circular", "resolution", "memorandum", "office_order"],
      required: true,
    },
    description: { type: String },
    issued_by: { type: String },
    date_issued: { type: Date },
    files: [fileSchema],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
