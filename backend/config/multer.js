// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("./cloudinary");

// // ✅ Carousel storage (you already have)
// const carouselStorage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "gadportal_carousel",
//     allowed_formats: ["jpg", "png", "jpeg"],
//   },
// });
// const uploadCarousel = multer({ storage: carouselStorage });

// // ✅ Reports storage (you already have)
// const reportStorage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "gadportal_reports",
//     allowed_formats: ["jpg", "png", "jpeg", "pdf", "mp4"],
//   },
// });
// const uploadReport = multer({ storage: reportStorage });

// // ✅ New: GAD Projects storage
// const projectStorage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "gadportal_projects", // separate folder
//     allowed_formats: ["jpg", "png", "jpeg"],
//   },
// });
// const uploadProject = multer({ storage: projectStorage });

// // Export all
// module.exports = {
//   uploadCarousel,
//   uploadReport,
//   uploadProject,
// };


const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
// ✅ Reports storage (you already have)

const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_reports",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "mp4"],
  },
});
const uploadReport = multer({ storage: reportStorage });

/* =========================
   CAROUSEL (IMAGES)
========================= */
const carouselStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_carousel",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const uploadCarousel = multer({ storage: carouselStorage });

/* =========================
   PROJECTS (IMAGES)
========================= */
const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_projects",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const uploadProject = multer({ storage: projectStorage });

/* =========================
   ACCOMPLISHMENTS (PDF ONLY)
========================= */
const accomplishmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_accomplishments",
    resource_type: "raw",          // ✅ REQUIRED
    allowed_formats: ["pdf"],      // ✅ PDF only
  },
});
const uploadAccomplishment = multer({
  storage: accomplishmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* =========================
   EXPORTS
========================= */
module.exports = {
  uploadCarousel,
  uploadProject,
  uploadAccomplishment,
  uploadReport,

};
