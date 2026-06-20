const Report = require("../models/report");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Message = require("../models/message");
const cloudinary = require("../config/cloudinary");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");
const { Readable } = require("stream");
const notificationController = require("./notificationController");

// ✅ Utility: Generate unique ticket number
const generateTicketNumber = (isAnonymous) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `ETALA-${isAnonymous ? "ANON" : "ID"}-${year}${month}-${random}`;
};

// ─── Shared booking email HTML builder ───────────────────────────────────────
const buildBookingEmail = ({ userName, ticketNumber, bookingLink, expiresAtStr }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
    .wrapper { padding: 30px 16px; }
    .container { max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .header .icon { font-size: 36px; margin-bottom: 10px; display: block; }
    .content { background: #ffffff; padding: 32px 30px; }
    .btn { display: inline-block; padding: 14px 32px; background: #667eea; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; }
    .info-box { background: #f8f9ff; padding: 16px 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .info-box p { margin: 6px 0; font-size: 14px; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 14px; color: #92400e; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    p { margin: 0 0 14px; font-size: 15px; color: #374151; }
    ul { margin: 8px 0; padding-left: 20px; font-size: 14px; color: #374151; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="icon">📅</span>
        <h1>Book Your Consultation</h1>
      </div>
      <div class="content">
        <p>Hello, <strong>${userName}</strong>!</p>
        <p>Your case is now ready for scheduling. Click the button below to access the booking calendar and choose your preferred consultation time:</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${bookingLink}" class="btn" style="color: #ffffff;">Book Your Appointment Now</a>
        </div>
        <div class="info-box">
          <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
          <p><strong>What to expect:</strong></p>
          <ul>
            <li>View available dates on the calendar</li>
            <li>Select your preferred consultation date and time</li>
            <li>Choose between Online or Face-to-Face consultation</li>
            <li>Receive instant confirmation once approved</li>
          </ul>
        </div>
        <div class="warning">
          <p style="margin:0 0 8px;"><strong>⏰ IMPORTANT — Time-Sensitive Access:</strong></p>
          <ul style="margin:0;">
            <li>This link expires in <strong>24 hours</strong></li>
            <li>You can only book <strong>one consultation per report</strong></li>
            <li>Past dates and weekends cannot be selected</li>
            <li>This link cannot be reused after booking</li>
          </ul>
          <p style="margin: 10px 0 0;"><strong>⏳ Expires at: ${expiresAtStr}</strong></p>
        </div>
        <p style="font-size:13px;color:#6b7280;">Or copy this link:</p>
        <p style="word-break:break-all;background:#f3f4f6;padding:10px;border-radius:6px;font-size:12px;color:#374151;">${bookingLink}</p>
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

/**
 * Create a new report
 * @route POST /api/reports/user/create
 * @access User, Admin
 */
const createReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const formData = { ...req.body };
    const reporterDepartment = formData.reporterDepartment;

    const isAnonymous = formData.isAnonymous === "true" || formData.isAnonymous === true;

    const attachments = req.files ? req.files.map(file => ({
      uri: file.path,
      type: file.mimetype,
      fileName: file.originalname,
    })) : [];

    const ticketNumber = generateTicketNumber(isAnonymous);

    const displayName = isAnonymous ? "Anonymous User" : `${user.firstName} ${user.lastName}`;

    const ticket = new Ticket({
      ticketNumber,
      userId,
      displayName,
      isAnonymous,
      status: "Open",
      lastMessageAt: new Date(),
      lastMessage: formData.salaysay?.substring(0, 100) || "New report submitted",
    });

    await ticket.save();

    const report = new Report({
      ...formData,
      createdBy: userId,
      ticketNumber: ticket.ticketNumber,
      isAnonymous,
      attachments,
      status: "Pending",
      caseStatus: "For Queuing",
      reporterDepartment,
      timeline: [{
        action: "Report Submitted",
        performedBy: userId,
        timestamp: new Date(),
        remarks: "Incident report successfully filed via the platform."
      }]
    });

    await report.save();

    ticket.reportId = report._id;
    await ticket.save();

    const MessageModel = require("../models/message");
    const systemMessage = new MessageModel({
      ticketNumber: report.ticketNumber,
      sender: "superadmin",
      senderName: "System",
      messageType: "text",
      content: `Thank you for submitting your report. Your ticket number is ${report.ticketNumber}. You may reply to this message for initial inquiries or surface-level consultation. If you wish to book a face-to-face or online appointment, please send us a message here so we can assist you with the scheduling process.`,
      isRead: false
    });
    await systemMessage.save();

    await Ticket.findOneAndUpdate(
      { ticketNumber: report.ticketNumber },
      { lastMessage: systemMessage.content, lastMessageAt: new Date() }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`ticket-${report.ticketNumber}`).emit("new-message", {
        message: systemMessage,
        ticket,
      });
      io.to("admin-room").emit("new-ticket", { ticket, report });

      notificationController.createNotification({
        recipientRole: "superadmin",
        type: "ticket",
        title: "🆕 New Report Submitted",
        content: `A new report has been submitted by ${displayName}. Ticket #${ticket.ticketNumber}`,
        metadata: { ticketNumber: ticket.ticketNumber },
        link: "/superadmin/reports",
      });
    }

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
      ticketNumber: ticket.ticketNumber,
    });
  } catch (error) {
    console.error("❌ Error creating report:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create report",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Get all reports created by the authenticated user
 * @route GET /api/reports/user/all
 * @access User, Admin
 */
const getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = "", status = "" } = req.query;

    let query = { createdBy: userId };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { ticketNumber: new RegExp(search, "i") },
        { incidentDescription: new RegExp(search, "i") },
        { salaysay: new RegExp(search, "i") },
        { placeOfIncident: new RegExp(search, "i") },
        { perpFirstName: new RegExp(search, "i") },
        { perpLastName: new RegExp(search, "i") }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "firstName lastName email")
      .populate("timeline.performedBy", "firstName lastName role");

    const total = await Report.countDocuments(query);

    res.json({ success: true, data: reports, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get a single report by ID (user must own the report)
 * @route GET /api/reports/user/:id
 * @access User, Admin
 */
const getUserReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({ _id: id, createdBy: userId })
      .populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all non-archived reports (admin only)
 * @route GET /api/reports/admin/all
 * @access Admin, Superadmin
 */
const getAllReports = async (req, res) => {
  try {
    const { status, incidentType, search, sortBy = "createdAt" } = req.query;

    let query = { archived: { $ne: true } };
    if (status) query.status = status;
    if (incidentType) query.incidentType = incidentType;
    if (search) {
      query.$or = [
        { ticketNumber: new RegExp(search, "i") },
        { incidentDescription: new RegExp(search, "i") },
        { placeOfIncident: new RegExp(search, "i") },
      ];
    }

    const reports = await Report.find(query)
      .sort({ [sortBy]: -1 })
      .populate("createdBy", "firstName lastName email tupId")
      .populate("timeline.performedBy", "firstName lastName role");

    res.json({ success: true, data: reports, message: "Active reports fetched successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get a single report by ID (admin only)
 * @route GET /api/reports/admin/:id
 * @access Admin, Superadmin
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate("createdBy", "firstName lastName email tupId")
      .populate("timeline.performedBy", "firstName lastName role");

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, data: report, message: "Report fetched successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update report status (admin only)
 * @route PUT /api/reports/admin/:id/status
 * @access Admin, Superadmin
 */
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, caseStatus, reporterUserId, caseClosureReason } = req.body;

    const validStatuses = ["Pending", "Reviewed", "In Progress", "Resolved", "Closed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (caseStatus) updateData.caseStatus = caseStatus;
    if (remarks) updateData.adminNotes = remarks;
    if (caseClosureReason) updateData.caseClosureReason = caseClosureReason;

    if (status === "Resolved" || status === "Closed") {
      updateData.resolvedAt = new Date();
    }

    if (caseStatus === "Case Closed" || (caseStatus && caseStatus.startsWith("External"))) {
      updateData.archived = true;
      updateData.archivedAt = new Date();
    }

    if (caseStatus === "Case Closed" && caseClosureReason === "successful" && reporterUserId) {
      const report = await Report.findById(id);
      if (report && report.isAnonymous) {
        updateData.identifiedUserId = reporterUserId;
        updateData.identifiedAt = new Date();
        updateData.identifiedBy = req.user.id;
        updateData.identificationReason = "Case Closure";
      }
    }

    updateData.lastUpdated = new Date();

    const timelineEntry = {
      action: `Status Updated to ${status || caseStatus}`,
      performedBy: req.user.id,
      timestamp: new Date(),
      remarks: remarks || `Case status changed to ${status || caseStatus}`,
    };

    const report = await Report.findByIdAndUpdate(
      id,
      { ...updateData, $push: { timeline: timelineEntry } },
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Update appointment status based on case status
    try {
      const Appointment = require("../models/Appointment");
      let appointmentStatus = null;

      if (caseStatus === "Case Closed" && caseClosureReason === "successful") {
        appointmentStatus = "Completed";
      } else if (caseStatus === "Case Closed" && caseClosureReason === "no_show") {
        appointmentStatus = "Cancelled";
      } else if (
        caseStatus &&
        (caseStatus.startsWith("Internal") ||
          caseStatus.startsWith("External") ||
          caseStatus === "Referred to Barangay")
      ) {
        appointmentStatus = "Completed";
      }

      if (appointmentStatus) {
        await Appointment.findOneAndUpdate({ reportId: id }, { status: appointmentStatus });
      }
    } catch (aptError) {
      console.error("❌ Error updating appointment status:", aptError);
    }

    // ─── "For Scheduling" → auto-send booking link ────────────────────────────
    // When admin sets caseStatus to "For Scheduling", we automatically generate
    // a booking token and send the link via email + chat + notification.
    // Admins can also re-send manually via POST /admin/:id/send-booking-link.
    if (caseStatus === "For Scheduling") {
      try {
        const user = await User.findById(report.createdBy._id || report.createdBy);
        if (user) {
          const crypto = require("crypto");
          const bookingToken = crypto.randomBytes(32).toString("hex");
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

          user.bookingAccess = {
            token: bookingToken,
            expiresAt,
            granted: true,
            used: false,
            reportTicketNumber: report.ticketNumber,
            adminId: req.user?.id || req.user?._id,
          };
          await user.save();

          const bookingLink = `${process.env.FRONTEND_URL}/user/interview?token=${bookingToken}&uid=${user._id}&ticket=${report.ticketNumber}`;
          const userName = `${user.firstName} ${user.lastName}`;
          const expiresAtStr = expiresAt.toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            dateStyle: "full",
            timeStyle: "short",
          });

          // Email
          await sendEmail({
            to: user.email,
            subject: `🔔 Consultation Booking Link - ${report.ticketNumber} (Valid for 24 Hours)`,
            html: buildBookingEmail({
              userName,
              ticketNumber: report.ticketNumber,
              bookingLink,
              expiresAtStr,
            }),
          });

          // Chat / inbox message
          const MessageModel = require("../models/message");
          const systemMessage = new MessageModel({
            ticketNumber: report.ticketNumber,
            sender: "superadmin",
            senderName: "System",
            messageType: "text",
            content: `📅 Your case is now ready for scheduling. An appointment booking link has been sent to your email (${user.email}). Please check your inbox to book your preferred consultation schedule. The link is valid for 24 hours. Once booked, it will be pending admin approval before being confirmed.`,
            metadata: { type: "appointment_link" },
            isRead: false,
          });
          await systemMessage.save();

          await Ticket.findOneAndUpdate(
            { ticketNumber: report.ticketNumber },
            { lastMessage: systemMessage.content, lastMessageAt: new Date() }
          );

          // Notification center
          await notificationController.createNotification({
            recipient: user._id,
            recipientRole: "user",
            type: "booking",
            title: "Your appointment is ready to be scheduled",
            content: `Your case (${report.ticketNumber}) is now ready for scheduling. Check your email for the booking link.`,
            metadata: { ticketNumber: report.ticketNumber },
            link: "/user/consultations",
          });

          const io = req.app.get("io");
          if (io) {
            io.to(`ticket-${report.ticketNumber}`).emit("new-message", { message: systemMessage });
            io.to(`user-${user._id}`).emit("new-notification", {});
          }
        }
      } catch (err) {
        console.error("❌ Error auto-sending booking link:", err);
      }
    }

    res.json({ success: true, data: report, message: "Report status updated successfully" });

    const io = req.app.get("io");
    if (io && report.createdBy) {
      io.to(`user-${report.createdBy._id || report.createdBy}`).emit("report-status-updated", { report });

      notificationController.createNotification({
        recipient: report.createdBy._id || report.createdBy,
        recipientRole: "user",
        type: "status_update",
        title: "🔔 Report Status Updated",
        content: `Your report #${report.ticketNumber} is now: ${report.status}`,
        metadata: { ticketNumber: report.ticketNumber },
        link: "/user/consultations",
      });
    }
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Manually send (or re-send) a booking link to the user.
 * Only available when caseStatus === "For Scheduling".
 *
 * Side-effects (all atomic, best-effort):
 *   1. Generates a fresh bookingToken and overwrites user.bookingAccess
 *   2. Sends booking link email
 *   3. Posts a system chat message to the ticket thread
 *   4. Creates a notification-center entry for the user
 *   5. Pushes a timeline entry to the report
 *   6. Updates ticket.lastMessage
 *
 * @route POST /api/reports/admin/:id/send-booking-link
 * @access Admin, Superadmin
 */
const sendBookingLink = async (req, res) => {
  try {
    const { id } = req.params;

    // ── 1. Load report ───────────────────────────────────────────────────────
    const report = await Report.findById(id).populate("createdBy", "firstName lastName email");
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // ── 2. Guard: only allowed when caseStatus is "For Scheduling" ───────────
    if (report.caseStatus !== "For Scheduling") {
      return res.status(400).json({
        success: false,
        message: `Cannot send booking link. Case status must be "For Scheduling" (current: "${report.caseStatus}").`,
      });
    }

    // ── 3. Load reporter user ────────────────────────────────────────────────
    const user = await User.findById(report.createdBy._id || report.createdBy);
    if (!user) {
      return res.status(404).json({ success: false, message: "Reporter user not found" });
    }

    // ── 4. Generate booking token (overwrites any previous one) ─────────────
    const crypto = require("crypto");
    const bookingToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.bookingAccess = {
      token: bookingToken,
      expiresAt,
      granted: true,
      used: false,
      reportTicketNumber: report.ticketNumber,
      adminId: req.user?.id || req.user?._id,
    };
    await user.save();

    const bookingLink = `${process.env.FRONTEND_URL}/user/interview?token=${bookingToken}&uid=${user._id}&ticket=${report.ticketNumber}`;
    const userName = `${user.firstName} ${user.lastName}`;
    const expiresAtStr = expiresAt.toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      dateStyle: "full",
      timeStyle: "short",
    });

    // ── 5. Send email ────────────────────────────────────────────────────────
    try {
      await sendEmail({
        to: user.email,
        subject: `🔔 Consultation Booking Link - ${report.ticketNumber} (Valid for 24 Hours)`,
        html: buildBookingEmail({
          userName,
          ticketNumber: report.ticketNumber,
          bookingLink,
          expiresAtStr,
        }),
      });
    } catch (emailErr) {
      console.error("❌ sendBookingLink — email failed:", emailErr.message);
      // Non-fatal: continue so chat + notification still fire
    }

    // ── 6. Post chat / inbox message ─────────────────────────────────────────
    const MessageModel = require("../models/message");
    const systemMessage = await MessageModel.create({
      ticketNumber: report.ticketNumber,
      sender: "superadmin",
      senderName: "System",
      messageType: "text",
      content: `📅 Your case is ready to be scheduled. A new appointment booking link has been sent to your email (${user.email}). Please check your inbox to book your preferred consultation schedule. The link is valid for 24 hours. Once booked, it will be pending admin approval before being confirmed.`,
      metadata: { type: "appointment_link" },
      isRead: false,
    });

    await Ticket.findOneAndUpdate(
      { ticketNumber: report.ticketNumber },
      { lastMessage: systemMessage.content, lastMessageAt: new Date() }
    );

    // ── 7. Notification center ───────────────────────────────────────────────
    try {
      await notificationController.createNotification({
        recipient: user._id,
        recipientRole: "user",
        type: "booking",
        title: "Your appointment is ready to be scheduled",
        content: `Your case (${report.ticketNumber}) is ready for scheduling. Check your email for the booking link.`,
        metadata: { ticketNumber: report.ticketNumber },
        link: "/user/consultations",
      });
    } catch (notifErr) {
      console.error("❌ sendBookingLink — notification failed:", notifErr.message);
    }

    // ── 8. Timeline entry ────────────────────────────────────────────────────
    await Report.findByIdAndUpdate(id, {
      $push: {
        timeline: {
          action: "Booking Link Sent",
          performedBy: req.user.id,
          timestamp: new Date(),
          remarks: `Admin manually sent a new appointment booking link to ${userName} (${user.email}).`,
        },
      },
    });

    // ── 9. Real-time socket events ───────────────────────────────────────────
    const io = req.app.get("io");
    if (io) {
      io.to(`ticket-${report.ticketNumber}`).emit("new-message", { message: systemMessage });
      io.to(`user-${user._id}`).emit("new-notification", {});
    }

    res.json({
      success: true,
      message: `Booking link sent to ${user.email} successfully`,
    });
  } catch (err) {
    console.error("❌ sendBookingLink error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to send booking link" });
  }
};

/**
 * Add referral entry to a report (Internal or External)
 * @route POST /api/reports/admin/:id/referral
 * @access Admin, Superadmin
 */
const addReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    let referralData = {
      referralType: body.referralType || "Internal",
      adminId: req.user.id,
      date: new Date(),
    };

    const attachments = req.files
      ? req.files.map(file => ({ uri: file.path, type: file.mimetype, fileName: file.originalname }))
      : [];

    if (body.referralType === "External") {
      referralData = {
        ...referralData,
        referredBy: body.referredBy,
        position: body.position,
        schoolName: body.schoolName,
        referralDate: body.referralDate || new Date(),
        reason: body.reason,
        caseSummary: body.caseSummary,
        barangayName: body.barangayName,
        barangayAddress: body.barangayAddress,
        receivingOfficer: body.receivingOfficer,
        endorsementMode: body.endorsementMode,
        attachments,
      };

      if (body.actionsTaken) {
        if (typeof body.actionsTaken === "string") {
          try { referralData.actionsTaken = JSON.parse(body.actionsTaken); }
          catch { referralData.actionsTaken = [body.actionsTaken]; }
        } else {
          referralData.actionsTaken = body.actionsTaken;
        }
      }
    } else {
      referralData.department = body.department;
      referralData.note = body.note;
    }

    const timelineEntry = {
      action:
        body.referralType === "External"
          ? `External Referral to ${body.barangayName || "Barangay"}`
          : `Internal Referral to ${body.department || "Department"}`,
      performedBy: req.user.id,
      timestamp: new Date(),
      remarks: body.referralType === "External" ? body.reason : body.note,
    };

    const updateData = {
      $push: { referrals: referralData, timeline: timelineEntry },
      $set: { lastUpdated: new Date() },
    };

    if (body.referralType === "External") {
      updateData.$set.archived = true;
      updateData.$set.archivedAt = new Date();
      updateData.$set.status = "Closed";
      updateData.$set.caseStatus = "Case Closed";

      updateData.$push.timeline = {
        $each: [
          timelineEntry,
          {
            action: "System: Report Archived",
            performedBy: req.user.id,
            timestamp: new Date(),
            remarks: "Automatically archived due to External Referral (Barangay).",
          },
        ],
      };
    }

    if (body.referralType !== "External") {
      const deptName = body.department || "Internal";
      updateData.$set.caseStatus = `Internal - ${deptName}`;
    }

    if (body.revealIdentity && report.isAnonymous) {
      updateData.$set.identifiedUserId = report.createdBy;
      updateData.$set.identifiedAt = new Date();
      updateData.$set.identifiedBy = req.user.id;
      updateData.$set.identificationReason = "Referral";
    }

    if (body.reporterUserId && report.isAnonymous) {
      updateData.$set.identifiedUserId = body.reporterUserId;
      updateData.$set.identifiedAt = new Date();
      updateData.$set.identifiedBy = req.user.id;
      updateData.$set.identificationReason = "Referral";
    }

    const updatedReport = await Report.findByIdAndUpdate(id, updateData, { new: true }).populate(
      "createdBy",
      "firstName lastName email"
    );

    if (!updatedReport) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    if (body.referralType === "External" && updatedReport.ticketNumber) {
      await Ticket.findOneAndUpdate(
        { ticketNumber: updatedReport.ticketNumber },
        { status: "Closed", closedAt: new Date(), closedReason: "Referred to External Agency (Barangay)" }
      );
    }

    res.json({
      success: true,
      data: updatedReport,
      message: `Successfully added ${referralData.referralType.toLowerCase()} referral`,
    });
  } catch (error) {
    console.error("❌ Error adding referral:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to add referral" });
  }
};

/**
 * Archive a report (admin only)
 * @route PUT /api/reports/admin/:id/archive
 * @access Admin, Superadmin
 */
const archiveReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndUpdate(
      id,
      { archived: true, archivedAt: new Date() },
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    res.json({ success: true, message: "Report archived successfully", data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all archived reports (admin only)
 * @route GET /api/reports/admin/archived
 * @access Admin, Superadmin
 */
const getArchivedReports = async (req, res) => {
  try {
    const reports = await Report.find({ archived: true })
      .sort({ archivedAt: -1 })
      .populate("createdBy", "firstName lastName email tupId");

    res.json({ success: true, data: reports, message: "Archived reports fetched successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update report services (admin only)
 * @route PUT /api/reports/admin/:id/services
 * @access Admin, Superadmin
 */
const updateReportServices = async (req, res) => {
  try {
    const { id } = req.params;
    const services = req.body;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    const updates = [];
    const serviceFields = [
      "crisisIntervention", "protectionOrder", "referToSWDO",
      "referToHealthcare", "referToLawEnforcement", "referToOther",
    ];

    serviceFields.forEach(field => {
      if (services[field] !== undefined && services[field] !== report[field]) {
        report[field] = services[field];
        const label = field.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
        updates.push(services[field] ? `${label} provided` : `${label} removed`);
      }
    });

    if (updates.length > 0) {
      report.timeline.push({
        action: `Services Updated: ${updates.join(", ")}`,
        performedBy: req.user.id,
        timestamp: new Date(),
      });
      report.lastUpdated = new Date();
      await report.save();
    }

    res.json({ success: true, data: report, message: "Report services updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Restore an archived report (admin only)
 * @route PUT /api/reports/admin/:id/restore
 * @access Admin, Superadmin
 */
const restoreReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndUpdate(
      id,
      { archived: false, $unset: { archivedAt: "" } },
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    res.json({ success: true, message: "Report restored successfully", data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Disclose user identity (user only)
 * @route PATCH /api/reports/user/disclose/:id
 * @access User, Admin
 */
const discloseReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({ _id: id, createdBy: userId });
    if (!report) return res.status(404).json({ success: false, message: "Report not found or access denied" });

    if (!report.isAnonymous) {
      return res.status(400).json({ success: false, message: "Report is already disclosed" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    report.isAnonymous = false;
    await report.save();

    if (report.ticketNumber) {
      await Ticket.findOneAndUpdate(
        { ticketNumber: report.ticketNumber },
        { isAnonymous: false, displayName: `${user.firstName} ${user.lastName}` }
      );
    }

    res.json({ success: true, message: "Identity disclosed successfully", data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update report by user (after disclosing identity)
 * @route PATCH /api/reports/user/update/:id
 * @access User, Admin
 */
const updateReportByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { incidentDescription, additionalNotes } = req.body;

    const report = await Report.findOne({ _id: id, createdBy: userId });
    if (!report) return res.status(404).json({ success: false, message: "Report not found or access denied" });

    if (report.isAnonymous) {
      return res.status(403).json({ success: false, message: "You must disclose your identity before updating the report" });
    }

    if (incidentDescription) report.incidentDescription = incidentDescription;
    if (additionalNotes) report.additionalNotes = additionalNotes;
    await report.save();

    res.json({ success: true, message: "Report updated successfully", data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send report PDF via email
 * @route POST /api/reports/send-pdf
 * @access User, Admin, Superadmin
 */
const sendReportPDF = async (req, res) => {
  try {
    const pdfFile = req.file;
    const { ticketNumber } = req.body;
    const userId = req.user.id || req.user._id;

    if (!pdfFile?.buffer) return res.status(400).json({ success: false, message: "PDF file is required" });
    if (pdfFile.mimetype !== "application/pdf") return res.status(400).json({ success: false, message: "Only PDF files are allowed" });

    const pdfBase64 = `data:application/pdf;base64,${pdfFile.buffer.toString("base64")}`;

    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    const reporter = await User.findById(userId);
    if (!reporter) return res.status(404).json({ success: false, message: `User not found for id: ${userId}` });

    const message = new Message({
      ticketNumber,
      sender: "user",
      senderId: userId,
      senderName: `${reporter.firstName} ${reporter.lastName}`,
      messageType: "file",
      content: "Official Incident Report PDF",
      attachments: [{
        uri: pdfBase64,
        type: "application/pdf",
        fileName: pdfFile.originalname || `Report_${ticketNumber}.pdf`,
      }],
    });
    await message.save();

    await Ticket.findOneAndUpdate(
      { ticketNumber },
      { lastMessage: "📄 Incident Report PDF submitted", lastMessageAt: new Date(), $inc: { "unreadCount.superadmin": 1 } }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`ticket-${ticketNumber}`).emit("new-message", { message, ticket });
      io.to("admin-room").emit("ticket-updated", { ticket });
    }

    try {
      await sendEmail({
        to: reporter.email,
        subject: `Official Incident Report Copy - ${ticketNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #7e22ce;">TUPT GAD Incident Report</h2>
            <p>Hello ${reporter.firstName},</p>
            <p>Thank you for submitting your incident report. Your ticket number is <strong>${ticketNumber}</strong>.</p>
            <p>Attached is an official copy of your submitted report in PDF format for your personal records.</p>
            <p>You can track your report status through the <strong>ETALA Portal</strong>.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>TUPT GAD Office</strong></p>
          </div>
        `,
        attachments: [{ filename: `Report_${ticketNumber}.pdf`, content: pdfFile.buffer, contentType: "application/pdf" }],
      });
    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr.message);
    }

    return res.json({ success: true, message: "Report PDF saved and emailed successfully", emailSentTo: reporter.email });
  } catch (error) {
    console.error("❌ sendReportPDF error:", error);
    return res.status(500).json({ success: false, message: "Failed to process report PDF", error: error.message });
  }
};

/**
 * Upload PDF to Cloudinary only (no chat message created)
 * @route POST /api/reports/upload-pdf
 * @access Admin, Superadmin
 */
const uploadPDFOnly = async (req, res) => {
  try {
    const pdfFile = req.file;
    const { ticketNumber } = req.body;

    if (!pdfFile) return res.status(400).json({ success: false, message: "PDF file is required" });

    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "chat_referrals", resource_type: "auto", public_id: `referral_${ticketNumber || Date.now()}_${Date.now()}` },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        Readable.from(pdfFile.buffer).pipe(uploadStream);
      });

    const cloudinaryResult = await uploadToCloudinary();

    res.json({
      success: true,
      message: "PDF uploaded successfully",
      fileUrl: cloudinaryResult.secure_url.replace("/upload/", "/upload/fl_attachment/"),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upload PDF", error: error.message });
  }
};

/**
 * Get report analytics for dashboard
 * @route GET /api/reports/analytics
 * @access Admin, Superadmin
 */
const getReportAnalytics = async (req, res) => {
  try {
    const reports = await Report.find().populate("createdBy", "firstName lastName email").lean();
    const archivedReports = await Report.find({ archived: true }).lean();

    const severityCounts = { Severe: 0, Moderate: 0, Mild: 0, Unanalyzed: 0 };
    const statusCounts = {
      "For Queuing": 0, "For Scheduling": 0, "For Interview": 0,
      Internal: 0, External: 0, "Case Closed": 0, "Not Set": 0,
    };
    const incidentTypeCounts = {};
    const departmentCounts = {};

    reports.forEach(report => {
      if (report.severity) {
        const severity = report.severity.charAt(0).toUpperCase() + report.severity.slice(1);
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;
      } else {
        severityCounts["Unanalyzed"] += 1;
      }

      if (report.caseStatus) {
        statusCounts[report.caseStatus] = (statusCounts[report.caseStatus] || 0) + 1;
      } else {
        statusCounts["Not Set"] += 1;
      }

      if (report.reporterDepartment) {
        departmentCounts[report.reporterDepartment] = (departmentCounts[report.reporterDepartment] || 0) + 1;
      }
    });

    const { year } = req.query;
    const currentYear = new Date().getFullYear();
    const targetYear = year ? parseInt(year) : currentYear;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthCounts = [];
    const monthArchivedCounts = [];

    for (let i = 0; i < 12; i++) {
      const startOfMonth = new Date(targetYear, i, 1);
      const endOfMonth = new Date(targetYear, i + 1, 0, 23, 59, 59);
      monthCounts.push(await Report.countDocuments({ submittedAt: { $gte: startOfMonth, $lte: endOfMonth } }));
      monthArchivedCounts.push(await Report.countDocuments({ archived: true, submittedAt: { $gte: startOfMonth, $lte: endOfMonth } }));
    }

    const topIncidentTypes = Object.entries(incidentTypeCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
    const topDepartments = Object.entries(departmentCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));

    const reportsWithResponse = reports.filter(r => r.submittedAt && r.lastUpdated);
    let avgResponseDays = 0;
    if (reportsWithResponse.length > 0) {
      const totalDays = reportsWithResponse.reduce((sum, report) => {
        const diffTime = Math.abs(new Date(report.lastUpdated) - new Date(report.submittedAt));
        return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }, 0);
      avgResponseDays = Math.round(totalDays / reportsWithResponse.length);
    }

    const totalClosed = statusCounts["Case Closed"] || 0;
    const resolutionRate = reports.length > 0 ? Math.round((totalClosed / reports.length) * 100) : 0;

    const heatmapDeptMonth = {};
    const heatmapGenderRole = {};
    const heatmapReporterGenderMonth = {};
    const heatmapVictimGenderMonth = {};
    const heatmapWitnessGenderMonth = {};
    const heatmapMandatoryReporterGenderMonth = {};

    const allDepartments = new Set();
    const allRoles = new Set(["Victim", "Witness", "Mandatory Reporter"]);
    const allGenders = new Set(["Male", "Female", "LGBTQ+", "Prefer not to say", "Other"]);
    const monthsShort = months;

    reports.forEach(report => {
      const dept = report.reporterDepartment || "Not Specified";
      const role = report.reporterRole || "Other";
      if (role === "Third Party") return;

      const submittedDate = new Date(report.submittedAt || report.createdAt);
      const monthName = submittedDate.toLocaleString("default", { month: "short" });
      allDepartments.add(dept);

      if (monthsShort.includes(monthName)) {
        if (!heatmapDeptMonth[dept]) heatmapDeptMonth[dept] = {};
        heatmapDeptMonth[dept][monthName] = (heatmapDeptMonth[dept][monthName] || 0) + 1;
      }

      const rGender = report.reporterGender || report.anonymousGender || report.sex || "Not Specified";
      if (rGender && allRoles.has(role)) {
        if (!heatmapGenderRole[rGender]) heatmapGenderRole[rGender] = {};
        heatmapGenderRole[rGender][role] = (heatmapGenderRole[rGender][role] || 0) + 1;
      }

      if (monthsShort.includes(monthName)) {
        if (!heatmapReporterGenderMonth[rGender]) heatmapReporterGenderMonth[rGender] = {};
        heatmapReporterGenderMonth[rGender][monthName] = (heatmapReporterGenderMonth[rGender][monthName] || 0) + 1;

        const vGender = report.sex || "Not Provided";
        if (!heatmapVictimGenderMonth[vGender]) heatmapVictimGenderMonth[vGender] = {};
        heatmapVictimGenderMonth[vGender][monthName] = (heatmapVictimGenderMonth[vGender][monthName] || 0) + 1;

        const wGender = report.witnessGender || "Not Provided";
        if (!heatmapWitnessGenderMonth[wGender]) heatmapWitnessGenderMonth[wGender] = {};
        heatmapWitnessGenderMonth[wGender][monthName] = (heatmapWitnessGenderMonth[wGender][monthName] || 0) + 1;

        if (role === "Mandatory Reporter") {
          if (!heatmapMandatoryReporterGenderMonth[rGender]) heatmapMandatoryReporterGenderMonth[rGender] = {};
          heatmapMandatoryReporterGenderMonth[rGender][monthName] = (heatmapMandatoryReporterGenderMonth[rGender][monthName] || 0) + 1;
        }
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalReports: reports.length,
          activeReports: reports.length - archivedReports.length,
          archivedReports: archivedReports.length,
          severeReports: severityCounts.Severe,
          moderateReports: severityCounts.Moderate,
          mildReports: severityCounts.Mild,
          pendingAnalysis: severityCounts.Unanalyzed,
          pendingReportsCount: await Report.countDocuments({ status: "Pending", archived: false }),
          avgResponseDays,
          resolutionRate,
        },
        byStatus: statusCounts,
        bySeverity: severityCounts,
        monthlyTrend: { months, counts: monthCounts, archived: monthArchivedCounts },
        topIncidentTypes,
        topDepartments,
        recentActivity: {
          recentReports: reports
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5)
            .map(report => {
              const desc = report.incidentDescription || report.incidentStatement || report.salaysay || "";
              return {
                _id: report._id,
                ticketNumber: report.ticketNumber,
                incidentDescription: desc ? desc.substring(0, 100) + (desc.length > 100 ? "..." : "") : "No statement provided",
                caseStatus: report.caseStatus || "Not Set",
                submittedAt: report.submittedAt,
                severity: report.severity || "Unanalyzed",
              };
            }),
          todayCount: await Report.countDocuments({ submittedAt: { $gte: new Date().setHours(0, 0, 0, 0), $lte: new Date() } }),
          weekCount: await Report.countDocuments({ submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
        },
        performanceMetrics: {
          avgDailyReports: monthCounts[monthCounts.length - 1] > 0 ? Math.round(monthCounts[monthCounts.length - 1] / 30) : 0,
          peakMonth: months[monthCounts.indexOf(Math.max(...monthCounts))],
          peakMonthCount: Math.max(...monthCounts),
        },
        heatmaps: {
          deptVsMonth: { rows: Array.from(allDepartments).sort(), columns: months, data: heatmapDeptMonth },
          genderVsRole: { rows: Array.from(allGenders), columns: Array.from(allRoles).sort(), data: heatmapGenderRole },
          reporterGenderVsMonth: { rows: Array.from(allGenders), columns: months, data: heatmapReporterGenderMonth },
          victimGenderVsMonth: { rows: Array.from(allGenders), columns: months, data: heatmapVictimGenderMonth },
          witnessGenderVsMonth: { rows: Array.from(allGenders), columns: months, data: heatmapWitnessGenderMonth },
          mandatoryReporterGenderVsMonth: { rows: Array.from(allGenders), columns: months, data: heatmapMandatoryReporterGenderMonth },
        },
      },
      message: "Report analytics fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Search reporters (admin only)
 * @route GET /api/reports/admin/search-reporters
 * @access Admin, Superadmin
 */
const searchReporters = async (req, res) => {
  try {
    const { term } = req.query;
    if (!term || term.length < 2) {
      return res.status(400).json({ success: false, message: "Search term must be at least 2 characters" });
    }

    const users = await User.find({
      $or: [
        { firstName: new RegExp(term, "i") },
        { lastName: new RegExp(term, "i") },
        { email: new RegExp(term, "i") },
        { tupId: new RegExp(term, "i") },
      ],
    })
      .select("firstName lastName email tupId")
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReport,
  getUserReports,
  getUserReportById,
  getAllReports,
  getReportById,
  updateReportStatus,
  sendBookingLink,       // ← NEW
  addReferral,
  archiveReport,
  getArchivedReports,
  restoreReport,
  discloseReport,
  updateReportByUser,
  sendReportPDF,
  uploadPDFOnly,
  generateTicketNumber,
  getReportAnalytics,
  updateReportServices,
  searchReporters,
};