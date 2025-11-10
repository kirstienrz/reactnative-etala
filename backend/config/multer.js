const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const carouselStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_carousel", 
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage: carouselStorage }); 

// 🧾 New: Report uploads
const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_reports", // separate folder for reports
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "mp4"],
  },
});
const uploadReport = multer({ storage: reportStorage });

module.exports = upload;
module.exports.uploadReport = uploadReport; 
