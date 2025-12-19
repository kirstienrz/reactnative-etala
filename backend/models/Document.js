import mongoose from "mongoose";

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
    file_url: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
