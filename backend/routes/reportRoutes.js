const express = require("express");
const router = express.Router();
const { uploadReport } = require("../config/multer");
const auth = require("../middleware/auth");

const {
  createReport,
  getUserReports,
  getUserReportById,
  getAllReports,
  getReportById,
  updateReportStatus,
  addReferral,          // ✅ new controller
  archiveReport,
  getArchivedReports,
  restoreReport,
  discloseReport,      // ✅ new controller
  updateReportByUser,  // ✅ new controller
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

router.post("/:id/reveal", auth(["user"]), discloseReport);


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

// 📌 Add referral (auto-updates status to "In Progress")
router.post("/admin/:id/referral", auth(["admin", "superadmin"]), addReferral);

// 📌 Archive report
router.put("/admin/:id/archive", auth(["admin", "superadmin"]), archiveReport);

// 📌 Restore archived report
router.put("/admin/:id/restore", auth(["admin", "superadmin"]), restoreReport);



module.exports = router;
