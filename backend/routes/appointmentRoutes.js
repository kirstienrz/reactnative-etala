const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  bookAppointment,
  approveAppointment,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
  getAdminAppointments,
  getUserAppointments,
  acceptRescheduledAppointment,
  requestAnotherTime,
  checkExistingBooking,
} = require("../controllers/appointmentController");
const {
  checkAndSendReminders,
  triggerReminder,
} = require("../controllers/reminderController");

// User routes
router.post("/book", auth(["user", "admin"]), bookAppointment);
router.get("/user-list", auth(["user", "admin"]), getUserAppointments);
router.get("/check-existing", auth(["user", "admin"]), checkExistingBooking);
router.patch("/accept-reschedule/:id", auth(["user", "admin"]), acceptRescheduledAppointment);
router.patch("/request-another-time/:id", auth(["user", "admin"]), requestAnotherTime);
router.patch("/user-cancel/:id", auth(["user", "admin"]), cancelAppointment);
router.patch("/user-reschedule/:id", auth(["user", "admin"]), rescheduleAppointment);

// Admin routes
router.get("/admin-list", auth(["admin", "superadmin"]), getAdminAppointments);
router.get("/admin-list/:adminId", auth(["admin", "superadmin"]), getAdminAppointments);
router.patch("/approve/:id", auth(["admin", "superadmin"]), approveAppointment);
router.patch("/cancel/:id", auth(["admin", "superadmin"]), cancelAppointment);
router.patch("/reschedule/:id", auth(["admin"]), rescheduleAppointment);
router.patch("/complete/:id", auth(["admin"]), completeAppointment);

// Reminder routes (automated and manual)
router.post("/check-reminders", checkAndSendReminders); // Called by cron job
router.post("/trigger-reminder", auth(["admin", "superadmin"]), triggerReminder); // Manual trigger for testing

module.exports = router;
