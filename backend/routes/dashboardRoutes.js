const express = require("express");
const auth = require("../middleware/auth");
const {
  superAdminDashboard,
  osaAdminDashboard,
  hrAdminDashboard,
  deptHeadDashboard,
  userHome,
} = require("../controllers/dashboardController");

const router = express.Router();

// Superadmin
router.get("/superadmin/dashboard", auth(["superadmin"]), superAdminDashboard);

// Admin OSA
router.get("/admin/osa/dashboard", auth(["admin"]), osaAdminDashboard);

// Admin HR
router.get("/admin/hr/dashboard", auth(["admin"]), hrAdminDashboard);

// Department Head
router.get("/depthead/dashboard", auth(["depthead"]), deptHeadDashboard);

// Regular User
router.get("/user/home", auth(["user"]), userHome);

module.exports = router;
