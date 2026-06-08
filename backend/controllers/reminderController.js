const Appointment = require("../models/Appointment");
const Report = require("../models/report");
const User = require("../models/User");
const Message = require("../models/message");
const Ticket = require("../models/Ticket");
const notificationController = require("./notificationController");
const sendEmail = require("../utils/sendEmail");

// ─── Reminder email template helper ────────────────────────────────────────────

const buildReminderEmail = ({ title, icon, accentColor = "#667eea", bodyHtml, ticketNumber = null }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
    .wrapper { padding: 30px 16px; }
    .container { max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%); color: white; padding: 32px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.3px; }
    .header .icon { font-size: 36px; margin-bottom: 10px; display: block; }
    .content { background: #ffffff; padding: 32px 30px; }
    .info-box { background: #f8f9ff; padding: 16px 20px; border-left: 4px solid ${accentColor}; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .info-box p { margin: 6px 0; font-size: 14px; }
    .info-box strong { color: #374151; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6b7280; }
    .detail-value { color: #111827; font-weight: 500; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 14px; color: #92400e; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .footer a { color: #667eea; text-decoration: none; }
    p { margin: 0 0 14px; font-size: 15px; color: #374151; }
    p:last-child { margin-bottom: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="icon">${icon}</span>
        <h1>${title}</h1>
      </div>
      <div class="content">
        ${bodyHtml}
        ${ticketNumber ? `<div class="info-box"><p><strong>Reference:</strong> Ticket #${ticketNumber}</p></div>` : ""}
      </div>
      <div class="footer">
        <p>This is an automated message from <strong>GAD Portal</strong>. Please do not reply to this email.</p>
        <p>© 2026 GAD Portal. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// ─── Send reminder for a single appointment ───────────────────────────────────

const sendAppointmentReminder = async (appointment, reminderType) => {
  try {
    const report = await Report.findById(appointment.reportId);
    const user = await User.findById(appointment.userId);
    const admin = await User.findById(appointment.adminId);

    if (!user || !admin || !report) {
      console.log(`❌ Missing data for appointment ${appointment._id}, skipping reminder`);
      return;
    }

    const isOneDay = reminderType === "1day";
    const timeText = isOneDay ? "tomorrow" : "in 1 hour";
    const icon = isOneDay ? "📅" : "⏰";
    const accentColor = isOneDay ? "#667eea" : "#f59e0b";
    const title = isOneDay ? "Appointment Reminder: Tomorrow" : "Appointment Reminder: In 1 Hour";

    // ─── Send to USER ────────────────────────────────────────────────────────

    // Email
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: `${title} — GAD Portal`,
        html: buildReminderEmail({
          title,
          icon,
          accentColor,
          bodyHtml: `
            <p>Hello, ${user.firstName}!</p>
            <p>This is a friendly reminder that your consultation appointment is scheduled <strong>${timeText}</strong>.</p>
            <div class="info-box">
              <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${appointment.date}</span></div>
              <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${appointment.startTime}</span></div>
              <div class="detail-row"><span class="detail-label">Type</span><span class="detail-value">${appointment.consultationType || "Consultation"}</span></div>
            </div>
            <div class="warning">📌 Please make sure to be available at the scheduled time. If you need to reschedule, please do so as early as possible through the GAD Portal.</div>
          `,
          ticketNumber: report.ticketNumber,
        }),
      });
    }

    // Notification center
    await notificationController.createNotification({
      recipient: user._id,
      recipientRole: "user",
      type: "reminder",
      title: `Appointment ${isOneDay ? "Tomorrow" : "in 1 Hour"}`,
      content: `Your consultation is scheduled ${timeText} on ${appointment.date} at ${appointment.startTime}.`,
      metadata: { appointmentId: appointment._id, ticketNumber: report.ticketNumber },
      link: `/user/consultations?appointment=${appointment._id}`,
    });

    // Chat/inbox message
    const userMessage = await Message.create({
      ticketNumber: report.ticketNumber,
      sender: "superadmin",
      senderName: "System",
      messageType: "text",
      content: `🔔 Reminder: Your appointment is scheduled ${timeText} on ${appointment.date} at ${appointment.startTime}. Please be ready at the scheduled time.`,
      metadata: { type: "appointment_reminder", reminderType },
      isRead: false,
    });

    await Ticket.findOneAndUpdate(
      { ticketNumber: report.ticketNumber },
      { lastMessage: userMessage.content, lastMessageAt: new Date() }
    );

    // ─── Send to ADMIN ───────────────────────────────────────────────────────

    // Email
    if (admin.email) {
      await sendEmail({
        to: admin.email,
        subject: `${title} — GAD Portal`,
        html: buildReminderEmail({
          title,
          icon,
          accentColor,
          bodyHtml: `
            <p>Hello, ${admin.firstName}!</p>
            <p>This is a friendly reminder that you have a consultation appointment scheduled <strong>${timeText}</strong>.</p>
            <div class="info-box">
              <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${appointment.date}</span></div>
              <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${appointment.startTime}</span></div>
              <div class="detail-row"><span class="detail-label">Student</span><span class="detail-value">${user.firstName} ${user.lastName}</span></div>
              <div class="detail-row"><span class="detail-label">Ticket</span><span class="detail-value">${report.ticketNumber}</span></div>
            </div>
            <div class="warning">📌 Please make sure to be available at the scheduled time.</div>
          `,
          ticketNumber: report.ticketNumber,
        }),
      });
    }

    // Notification center
    await notificationController.createNotification({
      recipient: admin._id,
      recipientRole: "superadmin",
      type: "reminder",
      title: `Appointment ${isOneDay ? "Tomorrow" : "in 1 Hour"}`,
      content: `Consultation with ${user.firstName} ${user.lastName} is scheduled ${timeText} on ${appointment.date} at ${appointment.startTime}.`,
      metadata: { appointmentId: appointment._id, ticketNumber: report.ticketNumber },
      link: `/superadmin/appointment-management?appointment=${appointment._id}`,
    });

    console.log(`✅ Sent ${reminderType} reminder for appointment ${appointment._id}`);
  } catch (err) {
    console.error(`❌ Error sending ${reminderType} reminder for appointment ${appointment._id}:`, err);
  }
};

// ─── Check and send reminders for upcoming appointments ─────────────────────

exports.checkAndSendReminders = async (req, res) => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find approved appointments scheduled in the next hour or day
    const upcomingAppointments = await Appointment.find({
      status: "Approved",
      date: { $gte: now.toISOString().split("T")[0] },
    }).populate("reportId");

    for (const appointment of upcomingAppointments) {
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
      const timeDiff = appointmentDateTime - now;

      // 1 hour reminder (between 59 and 61 minutes before)
      if (timeDiff > 59 * 60 * 1000 && timeDiff <= 61 * 60 * 1000) {
        // Check if 1-hour reminder was already sent
        if (!appointment.remindersSent?.includes("1hour")) {
          await sendAppointmentReminder(appointment, "1hour");
          await Appointment.findByIdAndUpdate(appointment._id, {
            $push: { remindersSent: "1hour" },
          });
        }
      }

      // 1 day reminder (between 23 and 25 hours before)
      if (timeDiff > 23 * 60 * 60 * 1000 && timeDiff <= 25 * 60 * 60 * 1000) {
        // Check if 1-day reminder was already sent
        if (!appointment.remindersSent?.includes("1day")) {
          await sendAppointmentReminder(appointment, "1day");
          await Appointment.findByIdAndUpdate(appointment._id, {
            $push: { remindersSent: "1day" },
          });
        }
      }
    }

    res.json({ success: true, message: "Reminder check completed" });
  } catch (err) {
    console.error("❌ Error checking reminders:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Manual trigger for testing (admin only) ─────────────────────────────────

exports.triggerReminder = async (req, res) => {
  try {
    const { appointmentId, reminderType } = req.body;

    if (!appointmentId || !reminderType) {
      return res.status(400).json({ message: "appointmentId and reminderType are required" });
    }

    if (!["1hour", "1day"].includes(reminderType)) {
      return res.status(400).json({ message: "reminderType must be '1hour' or '1day'" });
    }

    const appointment = await Appointment.findById(appointmentId).populate("reportId");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await sendAppointmentReminder(appointment, reminderType);

    res.json({ success: true, message: `${reminderType} reminder sent successfully` });
  } catch (err) {
    console.error("❌ Error triggering reminder:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
