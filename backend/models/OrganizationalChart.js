import mongoose from "mongoose";

const orgChartImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("OrgChartImage", orgChartImageSchema);
