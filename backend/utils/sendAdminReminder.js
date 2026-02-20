const cron = require("node-cron");
const User = require("../models/User");
const sendEmail = require("./sendEmail"); // your email util

// Run every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  console.log("🔔 Checking admins for inactivity...");

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find admins who haven't logged in for 7 days
    const inactiveAdmins = await User.find({
      role: "superadmin",
      lastLogin: { $lt: oneWeekAgo },
    });

    for (const admin of inactiveAdmins) {
      await sendEmail({
        to: admin.email,
        subject: "We miss you at Etala! Login Reminder",
        html: `
          <p>Hello ${admin.firstName},</p>
          <p>We noticed you haven't logged into Etala for a week.</p>
          <p>Please log in to check your notifications and tasks.</p>
          <a href="https://etala.vercel.app/login">Login Here</a>
        `,
      });
      console.log(`✅ Reminder sent to ${admin.email}`);
    }
  } catch (err) {
    console.error("❌ Error sending admin reminders:", err);
  }
});
