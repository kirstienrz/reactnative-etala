const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadReport } = require("../config/multer");
const auth = require("../middleware/auth");

// ✅ Create multer for PDF upload (in-memory storage)
const pdfUpload = multer({ storage: multer.memoryStorage() });

const {
  createReport,
  getUserReports,
  getUserReportById,
  getAllReports,
  getReportById,
  updateReportStatus,
  archiveReport,
  getArchivedReports,
  restoreReport,
  discloseReport,
  updateReportByUser, 
  sendReportPDF,
  analyzeReportSeverity,          // PINALITAN: analyzeReportSentiment -> analyzeReportSeverity
  batchAnalyzeSeverity,          // PINALITAN: batchAnalyzeSentiment -> batchAnalyzeSeverity
  getSeverityStats,
  batchReanalyzeStaleReports,
  getReanalysisStats,
  reanalyzeAllReports,              // PINALITAN: getSentimentStats -> getSeverityStats
} = require("../controllers/reportController");

// ===================================================================
// 🧍 USER ROUTES
// ===================================================================

// 📌 Create a new report
router.post(
  "/user/create",
  auth(["user", "admin"]),
  uploadReport.array("attachments", 10),
  createReport
);

// 📌 Get all user reports
router.get("/user/all", auth(["user", "admin"]), getUserReports);

// 📌 Get single report (owned by user)
router.get("/user/:id", auth(["user", "admin"]), getUserReportById);

// 📌 Disclose identity (user only)
router.patch("/user/disclose/:id", auth(["user", "admin"]), discloseReport);

// 📌 Update report (after disclosing, editable fields only)
router.patch("/user/update/:id", auth(["user", "admin"]), updateReportByUser);

// 📌 Alternative disclose route
router.post("/:id/reveal", auth(["user"]), discloseReport);

// ✅ Send PDF via email (user or admin)
router.post(
  "/send-pdf", 
  auth(["user", "admin", "superadmin"]), 
  pdfUpload.single('pdf'), 
  sendReportPDF
);


// ===================================================================
// 🧑‍💼 ADMIN ROUTES
// ===================================================================

// 📌 Get all non-archived reports (specific route)
router.get("/admin/all", auth(["admin", "superadmin"]), getAllReports);

// 📌 Get archived reports (specific route - MUST come before /:id)
router.get("/admin/archived", auth(["admin", "superadmin"]), getArchivedReports);

// 📌 Get single report (parameterized route - comes AFTER specific routes)
router.get("/admin/:id", auth(["admin", "superadmin"]), getReportById);

// 📌 Update status
router.put("/admin/:id/status", auth(["admin", "superadmin"]), updateReportStatus);

// 📌 Archive report
router.put("/admin/:id/archive", auth(["admin", "superadmin"]), archiveReport);

// 📌 Restore archived report
router.put("/admin/:id/restore", auth(["admin", "superadmin"]), restoreReport);


// ===================================================================
// 🔍 SEVERITY ANALYSIS ROUTES (PINALITAN: Sentiment -> Severity)
// ===================================================================

// Analyze severity for a specific report
router.post('/admin/:id/analyze-severity', auth(["admin", "superadmin"]), analyzeReportSeverity);

// Batch analyze severity for multiple reports
router.post('/admin/batch-analyze-severity', auth(["admin", "superadmin"]), batchAnalyzeSeverity);

// Get severity statistics
router.get('/admin/severity-stats', auth(["admin", "superadmin"]), getSeverityStats);

// routes/reportRoutes.js
// ... (existing code continues)

// ===================================================================
// 🔄 STALE REPORTS RE-ANALYSIS ROUTES
// ===================================================================

// Batch re-analyze stale reports (older than X days)
router.post('/admin/batch-reanalyze-stale', auth(["admin", "superadmin"]), batchReanalyzeStaleReports);

// Get re-analysis statistics
router.get('/admin/reanalysis-stats', auth(["admin", "superadmin"]), getReanalysisStats);

// routes/reportRoutes.js - ADD THIS ROUTE
router.post('/admin/reanalyze-all', auth(["admin", "superadmin"]), reanalyzeAllReports);

module.exports = router;