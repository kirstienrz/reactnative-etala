const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { 
      type: String, 
      default: () => new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    content: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    publicId: { type: String, default: "" },
    link: { type: String, default: "" },
    archived: { type: Boolean, default: false }, // ✅ Added for soft delete
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);