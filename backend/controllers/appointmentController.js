const Appointment = require("../models/Appointment");
const Report = require("../models/report");
const User = require("../models/User");
const Message = require("../models/message");
const AdminAvailability = require("../models/AdminAvailability");
const notificationController = require("./notificationController");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// ─── Shared email template helper ────────────────────────────────────────────

const buildEmail = ({ title, icon, accentColor = "#667eea", bodyHtml, ticketNumber = null }) => `
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

// ─── Shared booking-link email builder (used by requestAnotherTime) ──────────

const buildBookingEmail = ({ userName, ticketNumber, bookingLink, expiresAtStr }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
    .wrapper { padding: 30px 16px; }
    .container { max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.3px; }
    .header .icon { font-size: 36px; margin-bottom: 10px; display: block; }
    .content { background: #ffffff; padding: 32px 30px; }
    .btn { display: inline-block; padding: 14px 32px; background: #667eea; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; }
    .info-box { background: #f8f9ff; padding: 16px 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .info-box p { margin: 6px 0; font-size: 14px; }
    .info-box strong { color: #374151; }
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
        <span class="icon">📅</span>
        <h1>Select a New Time Slot</h1>
      </div>
      <div class="content">
        <p>Hello, <strong>${userName}</strong>!</p>
        <p>The admin has given you the opportunity to select a new consultation time slot that works better for your schedule.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${bookingLink}" class="btn" style="color: #ffffff;">Select a New Time Slot</a>
        </div>
        <div class="info-box">
          <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        </div>
        <div class="warning">
          <p style="margin:0 0 8px;"><strong>⏰ This link expires in 24 hours.</strong></p>
          <p style="margin:0;">Expires at: ${expiresAtStr}</p>
          <p style="word-break:break-all;font-size:12px;margin-top:8px;">Or copy this link: ${bookingLink}</p>
        </div>
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

// ─── Controllers ──────────────────────────────────────────────────────────────

exports.checkExistingBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const existing = await Appointment.findOne({
      userId,
      status: { $in: ["Pending", "Approved", "Admin Rescheduled", "User Rescheduled"] },
    });

    if (existing) {
      return res.json({
        hasActiveBooking: true,
        existingBooking: {
          status: existing.status,
          date: existing.date,
          startTime: existing.startTime,
          reportId: existing.reportId,
        },
      });
    }

    res.json({ hasActiveBooking: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reportId, adminId, date, startTime, endTime, notes } = req.body;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const appointment = new Appointment({
      reportId,
      userId,
      adminId,
      date,
      startTime,
      endTime,
      notes,
      status: "Pending",
      isAnonymous: report.isAnonymous,
    });
    await appointment.save();

    await AdminAvailability.updateOne(
      { adminId, "availabilities.date": date, "availabilities.slots.start": startTime },
      { $set: { "availabilities.$[day].slots.$[slot].booked": true } },
      { arrayFilters: [{ "day.date": date }, { "slot.start": startTime }] }
    );

    await Report.findByIdAndUpdate(reportId, {
      caseStatus: "For Scheduling",
      $push: {
        timeline: {
          action: "Interview Scheduled",
          performedBy: userId,
          remarks: `Consultation booked for ${date} from ${startTime} to ${endTime} (Pending Approval).`,
        },
      },
    });

    const user = await User.findById(userId);
    const senderName = user ? `${user.firstName} ${user.lastName}` : "User";

    await notificationController.createNotification({
      recipient: adminId,
      recipientRole: "superadmin",
      title: "New Consultation Booking",
      content: `A student has booked a consultation for ${date} at ${startTime} (Pending Approval).`,
      type: "booking",
      link: `/superadmin/appointment-management?appointment=${appointment._id}`,
    });

    const admin = await User.findById(adminId);
    if (admin?.email) {
      await sendEmail({
        to: admin.email,
        subject: "New Consultation Booking — GAD Portal",
        html: buildEmail({
          title: "New Consultation Booking",
          icon: "📅",
          bodyHtml: `
            <p>Hello,</p>
            <p>A student has submitted a consultation booking that is pending your approval.</p>
            <div class="info-box">
              <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${date}</span></div>
              <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${startTime} – ${endTime}</span></div>
              <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">Pending Approval</span></div>
            </div>
            <p>Please log in to the GAD Portal to review and approve or decline this booking.</p>
          `,
        }),
      });
    }

    await notificationController.createNotification({
      recipient: userId,
      recipientRole: "user",
      title: "Consultation Booked",
      content: `Your consultation on ${date} at ${startTime} is pending approval.`,
      type: "booking",
      link: `/user/consultations?appointment=${appointment._id}`,
    });

    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: "Consultation Booked — GAD Portal",
        html: buildEmail({
          title: "Consultation Booked",
          icon: "🗓️",
          bodyHtml: `
            <p>Hello, ${user.firstName}!</p>
            <p>Your consultation has been successfully submitted and is now pending approval from our team.</p>
            <div class="info-box">
              <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${date}</span></div>
              <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${startTime} – ${endTime}</span></div>
              <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">Pending Approval</span></div>
            </div>
            <div class="warning">⏳ You will receive another notification once your appointment is approved.</div>
          `,
          ticketNumber: report?.ticketNumber,
        }),
      });
    }

    await Message.create({
      ticketNumber: report?.ticketNumber || "Unknown",
      sender: "superadmin",
      senderId: adminId, // System messages act as if from admin
      senderName: "System",
      messageType: "text",
      content: `System: A consultation has been booked for ${date} at ${startTime} (Pending Approval).`,
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).populate("reportId");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "Approved";
    await appointment.save();

    // ─── Auto-set caseStatus to "For Interview" on approval ──────────────────
    await Report.findByIdAndUpdate(appointment.reportId, {
      caseStatus: "For Interview",
      $push: {
        timeline: {
          action: "Appointment Approved",
          performedBy: req.user.id,
          remarks: `Appointment scheduled for ${appointment.date} at ${appointment.startTime}. Case status automatically set to For Interview.`,
        },
      },
    });

    try {
      if (appointment.userId) {
        await notificationController.createNotification({
          recipient: appointment.userId,
          recipientRole: "user",
          title: "Appointment Approved",
          content: `Your appointment on ${appointment.date} at ${appointment.startTime} has been approved.`,
          type: "booking",
          link: `/user/consultations?appointment=${appointment._id}`,
        });
      }
    } catch (notifErr) {
      console.error("❌ Error creating notification:", notifErr);
    }

    try {
      const user = await User.findById(appointment.userId);
      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: "Appointment Approved — GAD Portal",
          html: buildEmail({
            title: "Appointment Approved",
            icon: "✅",
            accentColor: "#059669",
            bodyHtml: `
              <p>Hello, ${user.firstName}!</p>
              <p>Great news! Your consultation appointment has been <strong>approved</strong>. Please make sure to be available at the scheduled time.</p>
              <div class="info-box">
                <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${appointment.date}</span></div>
                <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${appointment.startTime}</span></div>
                <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">Approved ✓</span></div>
              </div>
              <div class="warning">📌 If you need to reschedule or cancel, please do so as early as possible through the GAD Portal.</div>
            `,
            ticketNumber: appointment.reportId?.ticketNumber,
          }),
        }).catch((emailErr) => {
          console.error("❌ Error sending email:", emailErr);
        });
      }
    } catch (emailErr) {
      console.error("❌ Error finding user for email:", emailErr);
    }

    try {
      if (appointment.reportId) {
        await Message.create({
          ticketNumber: appointment.reportId.ticketNumber || "Unknown",
          sender: "superadmin",
          senderId: req.user.id,
          senderName: "System",
          messageType: "text",
          content: `System: Your appointment on ${appointment.date} at ${appointment.startTime} has been approved.`,
        });
      }
    } catch (msgErr) {
      console.error("❌ Error posting system message:", msgErr);
    }

    res.json(appointment);
  } catch (err) {
    console.error("❌ Error approving appointment:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id).populate("reportId");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (req.user.role !== "superadmin" && req.user.role !== "admin") {
      if (appointment.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    try {
      await AdminAvailability.updateOne(
        { adminId: appointment.adminId, "availabilities.date": appointment.date, "availabilities.slots.start": appointment.startTime },
        { $set: { "availabilities.$[day].slots.$[slot].booked": false } },
        { arrayFilters: [{ "day.date": appointment.date }, { "slot.start": appointment.startTime }] }
      );
    } catch (slotErr) {
      console.error("❌ Error freeing slot:", slotErr);
    }

    appointment.status = "Cancelled";
    appointment.cancelReason =
      reason ||
      (req.user.role === "admin" || req.user.role === "superadmin"
        ? "Cancelled by admin"
        : "Cancelled by user");
    await appointment.save();

    try {
      // Revert caseStatus to "For Queuing" and status to "Pending"
      await Report.findByIdAndUpdate(appointment.reportId, {
        status: "Pending",
        caseStatus: "For Queuing",
        $push: {
          timeline: {
            action: "Appointment Cancelled",
            performedBy: req.user.id,
            remarks: `Appointment on ${appointment.date} at ${appointment.startTime} was cancelled. ${reason ? `Reason: ${reason}` : ""} Case status reverted to Pending/For Queuing.`,
          },
        },
      });
    } catch (reportErr) {
      console.error("❌ Error updating report:", reportErr);
    }

    try {
      if (appointment.userId) {
        await notificationController.createNotification({
          recipient: appointment.userId,
          recipientRole: "user",
          title: "Appointment Cancelled",
          content: `Your appointment on ${appointment.date} at ${appointment.startTime} has been cancelled. ${reason ? `Reason: ${reason}` : ""}`,
          type: "booking",
          link: `/user/consultations?appointment=${appointment._id}`,
        });
      }
    } catch (notifErr) {
      console.error("❌ Error creating notification:", notifErr);
    }

    try {
      const user = await User.findById(appointment.userId);
      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: "Appointment Cancelled — GAD Portal",
          html: buildEmail({
            title: "Appointment Cancelled",
            icon: "❌",
            accentColor: "#dc2626",
            bodyHtml: `
              <p>Hello, ${user.firstName}!</p>
              <p>Your consultation appointment has been <strong>cancelled</strong>.</p>
              <div class="info-box">
                <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${appointment.date}</span></div>
                <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${appointment.startTime}</span></div>
                <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">Cancelled</span></div>
                ${reason ? `<div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${reason}</span></div>` : ""}
              </div>
              <div class="warning">📌 If you wish to book a new appointment, please visit the GAD Portal and schedule a new consultation.</div>
            `,
            ticketNumber: appointment.reportId?.ticketNumber,
          }),
        }).catch((emailErr) => {
          console.error("❌ Error sending email:", emailErr);
        });
      }
    } catch (emailErr) {
      console.error("❌ Error finding user for email:", emailErr);
    }

    try {
      if (appointment.reportId) {
        await Message.create({
          ticketNumber: appointment.reportId.ticketNumber || "Unknown",
          sender: req.user.role === "superadmin" ? "superadmin" : "user",
          senderId: req.user.id,
          senderName: "System",
          messageType: "text",
          content: `System: Your appointment on ${appointment.date} at ${appointment.startTime} has been cancelled. ${reason ? `Reason: ${reason}` : ""}`,
        });
      }
    } catch (msgErr) {
      console.error("❌ Error posting system message:", msgErr);
    }

    res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime, newEndTime, reason } = req.body;

    const appointment = await Appointment.findById(id).populate("reportId");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (req.user.role !== "superadmin" && req.user.role !== "admin") {
      if (appointment.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    appointment.rescheduleHistory.push({
      previousDate: appointment.date,
      previousStartTime: appointment.startTime,
      previousEndTime: appointment.endTime,
      rescheduledBy: req.user.id,
      reason,
    });

    appointment.date = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.status =
      req.user.role === "admin" || req.user.role === "superadmin"
        ? "Admin Rescheduled"
        : "User Rescheduled";
    await appointment.save();

    await Report.findByIdAndUpdate(appointment.reportId, {
      caseStatus: "For Scheduling",
      $push: {
        timeline: {
          action: "Appointment Rescheduled",
          performedBy: req.user.id,
          remarks: `Appointment rescheduled to ${newDate} at ${newStartTime}. Reason: ${reason}`,
        },
      },
    });

    if (req.user.role === "admin" || req.user.role === "superadmin") {
      if (appointment.userId) {
        await notificationController.createNotification({
          recipient: appointment.userId,
          recipientRole: "user",
          title: "Appointment Rescheduled",
          content: `Admin has rescheduled your appointment to ${newDate} at ${newStartTime}. Reason: ${reason}`,
          type: "booking",
          link: `/user/consultations?appointment=${appointment._id}`,
        });
      }
      const user = await User.findById(appointment.userId);
      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: "Appointment Rescheduled — GAD Portal",
          html: buildEmail({
            title: "Appointment Rescheduled",
            icon: "🔄",
            accentColor: "#d97706",
            bodyHtml: `
              <p>Hello, ${user.firstName}!</p>
              <p>Your consultation appointment has been <strong>rescheduled</strong> by the admin. Please review the new details below.</p>
              <div class="info-box">
                <div class="detail-row"><span class="detail-label">New Date</span><span class="detail-value">${newDate}</span></div>
                <div class="detail-row"><span class="detail-label">New Time</span><span class="detail-value">${newStartTime} – ${newEndTime}</span></div>
                <div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${reason}</span></div>
              </div>
              <div class="warning">⚠️ Please log in to the GAD Portal to <strong>accept</strong> the new schedule or <strong>request another time</strong>.</div>
            `,
            ticketNumber: appointment.reportId?.ticketNumber,
          }),
        }).catch((emailErr) => {
          console.error("❌ Error sending reschedule email to user:", emailErr);
        });
      }
    } else {
      await notificationController.createNotification({
        recipient: appointment.adminId,
        recipientRole: "superadmin",
        title: "Appointment Rescheduled",
        content: `User has rescheduled their appointment to ${newDate} at ${newStartTime}. Reason: ${reason}`,
        type: "booking",
        link: `/superadmin/appointment-management?appointment=${appointment._id}`,
      });
      const admin = await User.findById(appointment.adminId);
      if (admin?.email) {
        sendEmail({
          to: admin.email,
          subject: "Appointment Rescheduled by Student — GAD Portal",
          html: buildEmail({
            title: "Appointment Rescheduled by Student",
            icon: "🔄",
            accentColor: "#d97706",
            bodyHtml: `
              <p>Hello,</p>
              <p>A student has rescheduled their consultation appointment. Please review the updated details below.</p>
              <div class="info-box">
                <div class="detail-row"><span class="detail-label">New Date</span><span class="detail-value">${newDate}</span></div>
                <div class="detail-row"><span class="detail-label">New Time</span><span class="detail-value">${newStartTime} – ${newEndTime}</span></div>
                <div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${reason}</span></div>
              </div>
              <p>Please log in to the GAD Portal to review this change.</p>
            `,
          }),
        }).catch((emailErr) => {
          console.error("❌ Error sending reschedule email to admin:", emailErr);
        });
      }
    }

    try {
      if (appointment.reportId) {
        await Message.create({
          ticketNumber: appointment.reportId.ticketNumber || "Unknown",
          sender: req.user.role === "superadmin" ? "superadmin" : "user",
          senderId: req.user.id,
          senderName: "System",
          messageType: "text",
          content: `System: Appointment has been rescheduled to ${newDate} at ${newStartTime}. Reason: ${reason}`,
        });
      }
    } catch (msgErr) {
      console.error("❌ Error posting system message:", msgErr);
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, nextCaseStatus, identifyUser, selectedUserId } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "Completed";
    appointment.adminNotes = adminNotes;
    await appointment.save();

    const reportUpdate = {
      caseStatus: nextCaseStatus || "For Referral",
      $push: {
        timeline: {
          action: "Interview Completed",
          performedBy: req.user.id,
          remarks: adminNotes,
        },
      },
    };

    if (identifyUser && selectedUserId) {
      const user = await User.findById(selectedUserId);
      if (user) {
        reportUpdate.isAnonymous = false;
        reportUpdate.lastName = user.lastName;
        reportUpdate.firstName = user.firstName;
        reportUpdate.middleName = user.middleName;
      }
    }

    await Report.findByIdAndUpdate(appointment.reportId, reportUpdate);

    res.json({ message: "Appointment completed and report updated", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminAppointments = async (req, res) => {
  try {
    const filter =
      req.user.role === "superadmin" && !req.params.adminId
        ? {}
        : { adminId: req.params.adminId || req.user.id };

    const appointments = await Appointment.find(filter)
      .populate("userId", "firstName lastName email")
      .populate("reportId", "ticketNumber isAnonymous")
      .sort({ createdAt: -1 });

    const sanitized = appointments.map(apt => {
      const obj = apt.toObject();
      if (obj.isAnonymous) {
        obj.userId = { _id: obj.userId?._id, firstName: "Anonymous", lastName: "User", email: null };
      }
      return obj;
    });

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate("adminId", "firstName lastName")
      .populate("reportId", "ticketNumber isAnonymous")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.acceptRescheduledAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (appointment.status !== "Admin Rescheduled") {
      return res.status(400).json({ message: "Appointment is not in rescheduled state" });
    }

    appointment.status = "Approved";
    await appointment.save();

    await Report.findByIdAndUpdate(appointment.reportId, {
      caseStatus: "For Interview",
      $push: {
        timeline: {
          action: "Rescheduled Time Accepted",
          performedBy: userId,
          remarks: `Student accepted the rescheduled appointment for ${appointment.date} from ${appointment.startTime} to ${appointment.endTime}.`,
        },
      },
    });

    await notificationController.createNotification({
      recipient: appointment.adminId,
      recipientRole: "superadmin",
      title: "Reschedule Accepted",
      content: `Student accepted the rescheduled appointment for ${appointment.date} at ${appointment.startTime}.`,
      type: "booking",
      link: `/superadmin/appointment-management?appointment=${appointment._id}`,
    });

    res.json({ message: "Rescheduled time accepted", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.requestAnotherTime = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findById(id).populate("reportId");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (appointment.status !== "Admin Rescheduled") {
      return res.status(400).json({ message: "Appointment is not in rescheduled state" });
    }

    await AdminAvailability.updateOne(
      { adminId: appointment.adminId, "availabilities.date": appointment.date, "availabilities.slots.start": appointment.startTime },
      { $set: { "availabilities.$[day].slots.$[slot].booked": false } },
      { arrayFilters: [{ "day.date": appointment.date }, { "slot.start": appointment.startTime }] }
    );

    appointment.status = "Pending Rebooking";
    await appointment.save();

    await Report.findByIdAndUpdate(appointment.reportId, {
      caseStatus: "For Scheduling",
      $push: {
        timeline: {
          action: "Requested Another Time",
          performedBy: userId,
          remarks: `Student requested another time slot. Previous slot (${appointment.date} ${appointment.startTime}) has been freed. Case status reverted to For Scheduling.`,
        },
      },
    });

    await notificationController.createNotification({
      recipient: appointment.adminId,
      recipientRole: "superadmin",
      title: "Student Requested Another Time",
      content: `Student requested to reschedule again. Previous slot (${appointment.date} ${appointment.startTime}) is now available.`,
      type: "booking",
      link: `/superadmin/appointment-management?appointment=${appointment._id}`,
    });

    const user = await User.findById(userId);
    if (user) {
      const bookingToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.bookingAccess = {
        token: bookingToken,
        expiresAt,
        granted: true,
        used: false,
        reportTicketNumber: appointment.reportId?.ticketNumber || "Unknown",
        adminId: appointment.adminId,
      };
      await user.save();

      const ticketNumber = appointment.reportId?.ticketNumber || "Unknown";
      const bookingLink = `${process.env.FRONTEND_URL}/user/interview?token=${bookingToken}&uid=${user._id}&ticket=${ticketNumber}`;
      const userName = `${user.firstName} ${user.lastName}`;
      const expiresAtStr = expiresAt.toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        dateStyle: "full",
        timeStyle: "short",
      });

      sendEmail({
        to: user.email,
        subject: `Select a New Consultation Time — Ticket #${ticketNumber}`,
        html: buildBookingEmail({ userName, ticketNumber, bookingLink, expiresAtStr }),
      }).catch((emailErr) => {
        console.error("❌ Error sending booking email to user:", emailErr);
      });
    }

    res.json({ message: "Another time requested. Check your email for new booking link." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};