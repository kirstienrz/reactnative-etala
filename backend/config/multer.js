const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// =========================
// Reports storage
// =========================
const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_reports",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "mp4"],
  },
});
const uploadReport = multer({ storage: reportStorage });

// =========================
// Carousel (images)
// =========================
const carouselStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_carousel",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const uploadCarousel = multer({ storage: carouselStorage });

// =========================
// Projects (images)
// =========================
const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_projects",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const uploadProject = multer({ storage: projectStorage });

// =========================
// Accomplishments (PDF only)
// =========================
const accomplishmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_accomplishments",
    resource_type: "raw",
    allowed_formats: ["pdf"],
  },
});
const uploadAccomplishment = multer({
  storage: accomplishmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// =========================
// Documents (PDF / DOC / DOCX)
// =========================
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_documents",
    resource_type: "raw",
    allowed_formats: ["pdf", "doc", "docx"],
  },
});
const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

// =========================
// Budget storage - PDF & Images ONLY
// =========================
const uploadUniversal = multer({
  storage: multer.memoryStorage(), // Store in memory for manual upload
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only PDF and images (JPG, PNG) are allowed.`));
    }
  }
});

module.exports = {
  uploadCarousel,
  uploadProject,
  uploadAccomplishment,
  uploadReport,
  uploadDocument,
  uploadUniversal,
};