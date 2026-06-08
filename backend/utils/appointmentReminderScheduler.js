const cron = require("node-cron");
const axios = require("axios");

// ─── Appointment Reminder Scheduler ─────────────────────────────────────────
// Runs every minute to check for appointments that need reminders
// Sends reminders 1 day and 1 hour before the scheduled appointment time

const startReminderScheduler = () => {
  console.log("📅 Starting appointment reminder scheduler...");

  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
      await axios.post(`${baseUrl}/api/appointments/check-reminders`);
    } catch (error) {
      console.error("❌ Error in reminder scheduler:", error.message);
    }
  });

  console.log("✅ Appointment reminder scheduler started (runs every minute)");
};

module.exports = startReminderScheduler;
