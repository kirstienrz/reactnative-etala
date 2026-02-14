const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
const path = require("path");
const fs = require("fs");

// Ensure temp folder exists
const TMP_UPLOAD_DIR = path.join(__dirname, "../tmp/uploads");
if (!fs.existsSync(TMP_UPLOAD_DIR)) fs.mkdirSync(TMP_UPLOAD_DIR, { recursive: true });

// =========================
// Helper: Disk storage for big files (PDF/DOC/DOCX)
// =========================
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/\s+/g, "-");
    cb(null, `${timestamp}-${sanitized}`);
  }
});

// =========================
// Reports storage (images, videos, PDFs)
// =========================
const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_reports",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "mp4"],
    resource_type: (req, file) => {
      if (file.mimetype.startsWith("image/")) return "image";
      if (file.mimetype.startsWith("video/")) return "video";
      return "raw";
    }
  },
});
const uploadReport = multer({ storage: reportStorage, limits: { fileSize: 50 * 1024 * 1024 } });

// =========================
// Carousel (images only)
// =========================
const carouselStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "gadportal_carousel", allowed_formats: ["jpg", "png", "jpeg"] }
});
const uploadCarousel = multer({ storage: carouselStorage });

// =========================
// Projects (images only)
// =========================
const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "gadportal_projects", allowed_formats: ["jpg", "png", "jpeg"] }
});
const uploadProject = multer({ storage: projectStorage });

// =========================
// Accomplishments (PDF only, raw)
// =========================
const accomplishmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_accomplishments",
    resource_type: "raw",
    allowed_formats: ["pdf"]
  }
});
const uploadAccomplishment = multer({ storage: accomplishmentStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// =========================
// Documents (PDF / DOC / DOCX, raw)
// =========================
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "gadportal_documents", resource_type: "raw", allowed_formats: ["pdf", "doc", "docx"] }
});
const uploadDocument = multer({ storage: documentStorage, limits: { fileSize: 15 * 1024 * 1024 } });

// =========================
// Research thumbnails (images only)
// =========================
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'research/thumbnails',
    allowed_formats: ['jpg','jpeg','png','webp','gif'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
    public_id: (req, file) => `research-thumb-${file.originalname.split('.')[0]}-${Date.now()}`,
    resource_type: 'image'
  }
});
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Not an image! Only thumbnails allowed."), false);
};
const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: imageFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }
}).single("thumbnail");

// =========================
// Research files (PDF/DOC/DOCX)
// =========================
const researchFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'research/files',
    allowed_formats: ['pdf','doc','docx'],
    resource_type: 'raw',
    public_id: (req, file) => `research-file-${file.originalname.split('.')[0]}-${Date.now()}`
  }
});
const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Invalid file type for research file."), false);
};
const uploadResearchFile = multer({
  storage: researchFileStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single("researchFile");

// =========================
// Research combined (thumbnail + file)
// =========================
const uploadResearchWithFiles = multer({
  storage: {
    _handleFile: function (req, file, cb) {
      if (file.fieldname === "thumbnail") thumbnailStorage._handleFile(req, file, cb);
      else if (file.fieldname === "researchFile") researchFileStorage._handleFile(req, file, cb);
      else cb(new Error("Invalid field name"));
    },
    _removeFile: function (req, file, cb) {
      if (file.fieldname === "thumbnail") thumbnailStorage._removeFile(req, file, cb);
      else if (file.fieldname === "researchFile") researchFileStorage._removeFile(req, file, cb);
      else cb(new Error("Invalid field name"));
    }
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail") imageFilter(req, file, cb);
    else if (file.fieldname === "researchFile") documentFilter(req, file, cb);
    else cb(new Error("Invalid field name"));
  },
  limits: {
    fileSize: (req, file) => (file.fieldname === "thumbnail" ? parseInt(process.env.MAX_FILE_SIZE) || 5*1024*1024 : 10*1024*1024)
  }
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "researchFile", maxCount: 1 }
]);

// =========================
// Universal uploads (PDF/images) → disk storage to prevent OOM
// =========================
const uploadUniversal = multer({
  storage: diskStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["application/pdf","image/jpeg","image/png","image/jpg"];
    allowedMimes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid file type. Only PDF and images allowed."));
  }
});

// =========================
// Calendar Events (images, videos, docs) → Cloudinary
// =========================
const calendarEventStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gadportal_calendar_events",
    allowed_formats: ["jpg","png","jpeg","pdf","mp4","doc","docx","xlsx","ppt","pptx"],
    resource_type: (req, file) => {
      if (file.mimetype.startsWith("image/")) return "image";
      if (file.mimetype.startsWith("video/")) return "video";
      return "raw";
    }
  }
});
const uploadCalendarEvent = multer({ storage: calendarEventStorage, limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = {
  uploadCarousel,
  uploadProject,
  uploadAccomplishment,
  uploadReport,
  uploadDocument,
  uploadUniversal,
  uploadThumbnail,
  uploadResearchFile,
  uploadResearchWithFiles,
  uploadCalendarEvent
};
