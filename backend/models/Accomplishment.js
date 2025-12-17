const mongoose = require("mongoose");

const accomplishmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    year: { type: Number, required: true },

    fileUrl: { type: String, required: true }, // Cloudinary URL
    publicId: { type: String, required: true }, // Cloudinary ID

    isArchived: { type: Boolean, default: false },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accomplishment", accomplishmentSchema);
