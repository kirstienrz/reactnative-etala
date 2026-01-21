const mongoose = require("mongoose");


const fileSchema = new mongoose.Schema({
fileUrl: { type: String, required: true },
cloudinaryId: { type: String, required: true },
fileType: { type: String }, // image | video | raw
format: { type: String }, // jpg | mp4 | pdf | docx
originalName: { type: String },
caption: { type: String, default: "" },
uploadedAt: { type: Date, default: Date.now },
isPrivate: { type: Boolean, default: true }
});


const documentationSchema = new mongoose.Schema({
title: { type: String, required: true },
description: { type: String, default: "" },
files: [fileSchema],
isArchived: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = mongoose.model("Documentation", documentationSchema);