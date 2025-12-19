
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
   POLICIES & ISSUANCES (DOCUMENTS)
========================= */
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_documents",
    resource_type: "raw", // ✅ REQUIRED for PDF/DOC/DOCX
    allowed_formats: ["pdf", "doc", "docx"],
  },
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});


/* =========================
   EXPORTS
========================= */
module.exports = {
  uploadCarousel,
  uploadProject,
  uploadAccomplishment,
  uploadReport,
  uploadDocument,

};
