const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// ✅ Carousel storage (you already have)
const carouselStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_carousel",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const uploadCarousel = multer({ storage: carouselStorage });

// ✅ Reports storage (you already have)
const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_reports",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "mp4"],
  },
});
const uploadReport = multer({ storage: reportStorage });

// ✅ New: GAD Projects storage
const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_projects", // separate folder
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const uploadProject = multer({ storage: projectStorage });

// Export all
module.exports = {
  uploadCarousel,
  uploadReport,
  uploadProject,
};
