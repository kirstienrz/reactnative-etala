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

//research
// Configuration for thumbnail upload (IMAGES ONLY)
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'research/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const originalname = file.originalname.split('.')[0];
      return `research-thumb-${originalname}-${timestamp}`;
    },
    resource_type: 'image' // Explicitly set to image
  }
});

// Configuration for research file upload (PDF, DOC, DOCX)
const researchFileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'research/files',
    allowed_formats: ['pdf', 'doc', 'docx'],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const originalname = file.originalname.split('.')[0];
      return `research-file-${originalname}-${timestamp}`;
    },
    resource_type: 'raw' // ✅ THIS IS THE FIX - set to 'raw' for documents
  }
});

// File filter for images (thumbnails)
const imageFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images for thumbnails.'), false);
  }
};

// File filter for research documents
const documentFilter = (req, file, cb) => {
  // Accept PDF, DOC, DOCX
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed for research files.'), false);
  }
};

// Multer upload instances
const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  }
}).single('thumbnail'); // Only one thumbnail

const uploadResearchFile = multer({
  storage: researchFileStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB for documents
  }
}).single('researchFile'); // Only one research file

// For handling both files at once
const uploadResearchWithFiles = multer({
  storage: {
    _handleFile: function (req, file, cb) {
      // Determine which storage to use based on field name
      if (file.fieldname === 'thumbnail') {
        thumbnailStorage._handleFile(req, file, cb);
      } else if (file.fieldname === 'researchFile') {
        researchFileStorage._handleFile(req, file, cb);
      } else {
        cb(new Error('Invalid field name'));
      }
    },
    _removeFile: function (req, file, cb) {
      if (file.fieldname === 'thumbnail') {
        thumbnailStorage._removeFile(req, file, cb);
      } else if (file.fieldname === 'researchFile') {
        researchFileStorage._removeFile(req, file, cb);
      } else {
        cb(new Error('Invalid field name'));
      }
    }
  },
  fileFilter: function (req, file, cb) {
    // Apply different filters based on field name
    if (file.fieldname === 'thumbnail') {
      imageFilter(req, file, cb);
    } else if (file.fieldname === 'researchFile') {
      documentFilter(req, file, cb);
    } else {
      cb(new Error('Invalid field name'));
    }
  },
  limits: {
    fileSize: function (req, file) {
      if (file.fieldname === 'thumbnail') {
        return parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
      } else if (file.fieldname === 'researchFile') {
        return 10 * 1024 * 1024; // 10MB
      }
      return 0;
    }
  }
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'researchFile', maxCount: 1 }
]);


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
  uploadThumbnail,
  uploadResearchFile,
  uploadResearchWithFiles

};