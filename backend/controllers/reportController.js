const Report = require("../models/report");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Message = require("../models/message");
const cloudinary = require("../config/cloudinary");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");
const { Readable } = require("stream"); // Use native stream
const notificationController = require("./notificationController");

// ✅ Utility: Generate unique ticket number
const generateTicketNumber = (isAnonymous) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `ETALA-${isAnonymous ? "ANON" : "ID"}-${year}${month}-${random}`;
};
/**
 * Create a new report
 * @route POST /api/reports/user/create
 * @access User, Admin
 */
const createReport = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Parse form data
    const formData = { ...req.body };

    const reporterDepartment = formData.reporterDepartment;
    console.log("📝 Reporter Department:", reporterDepartment); // Debug log

    // salaysay (formerly incidentDescription) is passed directly from formData

    // Determine if anonymous
    const isAnonymous = formData.isAnonymous === "true" || formData.isAnonymous === true;

    // Handle file attachments
    const attachments = req.files ? req.files.map(file => ({
      uri: file.path,
      type: file.mimetype,
      fileName: file.originalname,
    })) : [];

    // ✅ GENERATE TICKET NUMBER FIRST
    const ticketNumber = generateTicketNumber(isAnonymous);
    console.log(`✅ Generated ticket number: ${ticketNumber}`);

    // ✅ STEP 1: Create ticket WITH the generated ticket number
    const displayName = isAnonymous ? "Anonymous User" : `${user.firstName} ${user.lastName}`;

    const ticket = new Ticket({
      ticketNumber: ticketNumber,
      userId: userId,
      displayName: displayName,
      isAnonymous: isAnonymous,
      status: "Open",
      lastMessageAt: new Date(),
      lastMessage: formData.salaysay?.substring(0, 100) || "New report submitted",
    });

    await ticket.save();
    console.log(`✅ Ticket created: ${ticket.ticketNumber}`);

    // ✅ STEP 2: Create report WITH ticketNumber
    const report = new Report({
      ...formData,
      createdBy: userId,
      ticketNumber: ticket.ticketNumber,
      isAnonymous: isAnonymous,
      attachments: attachments,
      status: "Pending",
      caseStatus: "For Queuing",
      reporterDepartment: reporterDepartment,
      timeline: [{
        action: "Report Submitted",
        performedBy: userId,
        timestamp: new Date(),
        remarks: "Incident report successfully filed via the platform."
      }]
    });

    await report.save();
    console.log(`✅ Report created with ID: ${report._id}`);

    // ✅ STEP 3: Update ticket with reportId
    ticket.reportId = report._id;
    await ticket.save();

    // ✅ STEP 4: Create system welcome message
    const Message = require("../models/message");
    const systemMessage = new Message({
      ticketNumber: report.ticketNumber,
      sender: "superadmin",
      senderName: "System",
      messageType: "text",
      content: `Thank you for submitting your report. Your ticket number is ${report.ticketNumber}. You may reply to this message for initial inquiries or surface-level consultation. If you wish to book a face-to-face or online appointment, please send us a message here so we can assist you with the scheduling process.`,
      isRead: false
    });
    await systemMessage.save();

    // Update ticket lastMessage and lastMessageAt
    await Ticket.findOneAndUpdate(
      { ticketNumber: report.ticketNumber },
      {
        lastMessage: systemMessage.content,
        lastMessageAt: new Date()
      }
    );

    // 🔥 EMIT SOCKET EVENT FOR NEW MESSAGE (if socket.io is available)
    const io = req.app.get("io");
    if (io) {
      // Notify the specific ticket room
      io.to(`ticket-${report.ticketNumber}`).emit("new-message", {
        message: systemMessage,
        ticket: ticket
      });
      // Notify admins of the new ticket
      io.to("admin-room").emit("new-ticket", {
        ticket: ticket,
        report: report
      });

      // ✅ SAVE PERSISTENT NOTIFICATION FOR ADMINS
      notificationController.createNotification({
        recipientRole: 'superadmin',
        type: 'ticket',
        title: '🆕 New Report Submitted',
        content: `A new report has been submitted by ${displayName}. Ticket #${ticket.ticketNumber}`,
        metadata: { ticketNumber: ticket.ticketNumber },
        link: '/superadmin/reports'
      });
    }

    console.log(`✅ Report created successfully: ${ticket.ticketNumber}`);

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
      ticketNumber: ticket.ticketNumber,
    });
  } catch (error) {
    console.error("❌ Error creating report:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create report",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

    const reports = await Report.find({ createdBy: userId, archived: false })
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstName lastName email")
      .populate("timeline.performedBy", "firstName lastName role");

    res.json({
      success: true,
      data: reports,
      total: reports.length
    });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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

    let query = { archived: false };

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

    res.json({
      success: true,
      data: reports,
      message: "Active reports fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching all reports:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      data: report,
      message: "Report fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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
    const { status, remarks, caseStatus } = req.body;

    const validStatuses = ["Pending", "Reviewed", "In Progress", "Resolved", "Closed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (caseStatus) updateData.caseStatus = caseStatus;
    if (remarks) updateData.adminNotes = remarks;

    if (status === "Resolved" || status === "Closed") {
      updateData.resolvedAt = new Date();
    }

    updateData.lastUpdated = new Date();

    // Add timeline entry for status update
    const timelineEntry = {
      action: `Status Updated to ${status || caseStatus}`,
      performedBy: req.user.id,
      timestamp: new Date(),
      remarks: remarks || `Case status changed to ${status || caseStatus}`
    };

    const report = await Report.findByIdAndUpdate(
      id, 
      { 
        ...updateData, 
        $push: { timeline: timelineEntry } 
      }, 
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      data: report,
      message: "Report status updated successfully"
    });

    // 🔥 EMIT SOCKET EVENT FOR STATUS UPDATE
    const io = req.app.get("io");
    if (io && report.createdBy) {
      io.to(`user-${report.createdBy._id || report.createdBy}`).emit("report-status-updated", {
        report: report
      });

      // ✅ SAVE PERSISTENT NOTIFICATION FOR USER
      notificationController.createNotification({
        recipient: report.createdBy._id || report.createdBy,
        recipientRole: 'user',
        type: 'status_update',
        title: '🔔 Report Status Updated',
        content: `Your report #${report.ticketNumber} is now: ${report.status}`,
        metadata: { ticketNumber: report.ticketNumber },
        link: '/user/consultations'
      });
    }
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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

    console.log("📨 Received referral request for report:", id);
    console.log("📦 Body type:", body.referralType);

    // 1. Prepare base referral data
    let referralData = {
      referralType: body.referralType || "Internal",
      adminId: req.user.id,
      date: new Date(),
    };

    // 2. Handle attachments if any
    const attachments = req.files ? req.files.map(file => ({
      uri: file.path,
      type: file.mimetype,
      fileName: file.originalname,
    })) : [];

    // 3. Populate data based on type
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
        attachments: attachments,
      };

      // Handle actionsTaken (might be stringified if sent via FormData)
      if (body.actionsTaken) {
        if (typeof body.actionsTaken === "string") {
          try {
            referralData.actionsTaken = JSON.parse(body.actionsTaken);
          } catch (e) {
            referralData.actionsTaken = [body.actionsTaken];
          }
        } else {
          referralData.actionsTaken = body.actionsTaken;
        }
      }
    } else {
      // Internal Referral
      referralData.department = body.department;
      referralData.note = body.note;
    }

    // 4. Create timeline entry
    const timelineEntry = {
      action: body.referralType === "External"
        ? `External Referral to ${body.barangayName || "Barangay"}`
        : `Internal Referral to ${body.department || "Department"}`,
      performedBy: req.user.id,
      timestamp: new Date(),
      remarks: body.referralType === "External" ? body.reason : body.note
    };

    // 5. Update Report
    const updateData = {
      $push: {
        referrals: referralData,
        timeline: timelineEntry
      },
      $set: {
        lastUpdated: new Date()
      }
    };

    // ✅ NEW: If external referral, automatically archive the report as it's now handled outside
    if (body.referralType === "External") {
      updateData.$set.archived = true;
      updateData.$set.archivedAt = new Date();
      updateData.$set.status = "Closed";
      updateData.$set.caseStatus = "Case Closed";
      
      // Also add an automated timeline entry for archiving
      updateData.$push.timeline = {
        $each: [
          timelineEntry,
          {
            action: "System: Report Archived",
            performedBy: req.user.id,
            timestamp: new Date(),
            remarks: "Automatically archived due to External Referral (Barangay)."
          }
        ]
      };
    }

    const report = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    // ✅ NEW: Also close the associated ticket if external referral
    if (body.referralType === "External" && report.ticketNumber) {
      await Ticket.findOneAndUpdate(
        { ticketNumber: report.ticketNumber },
        { 
          status: "Closed", 
          closedAt: new Date(),
          closedReason: "Referred to External Agency (Barangay)"
        }
      );
      console.log(`✅ Associated ticket ${report.ticketNumber} closed due to external referral.`);
    }

    console.log(`✅ Referral (${referralData.referralType}) added to report ${id}`);

    res.json({
      success: true,
      data: report,
      message: `Successfully added ${referralData.referralType.toLowerCase()} referral`
    });
  } catch (error) {
    console.error("❌ Error adding referral:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add referral"
    });
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

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      message: "Report archived successfully",
      data: report
    });
  } catch (error) {
    console.error("Error archiving report:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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

    res.json({
      success: true,
      data: reports,
      message: "Archived reports fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching archived reports:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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
    const services = req.body; // e.g. { crisisIntervention: true, protectionOrder: true }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Track changes for timeline
    const updates = [];
    const serviceFields = [
      "crisisIntervention", "protectionOrder", "referToSWDO", 
      "referToHealthcare", "referToLawEnforcement", "referToOther"
    ];

    serviceFields.forEach(field => {
      if (services[field] !== undefined && services[field] !== report[field]) {
        report[field] = services[field];
        const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        updates.push(services[field] ? `${label} provided` : `${label} removed`);
      }
    });

    if (updates.length > 0) {
      report.timeline.push({
        action: `Services Updated: ${updates.join(", ")}`,
        performedBy: req.user.id,
        timestamp: new Date()
      });
      report.lastUpdated = new Date();
      await report.save();
    }

    res.json({
      success: true,
      data: report,
      message: "Report services updated successfully"
    });
  } catch (error) {
    console.error("Error updating report services:", error);
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

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      message: "Report restored successfully",
      data: report
    });
  } catch (error) {
    console.error("Error restoring report:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Disclose user identity (user only)
 * @route PATCH /api/reports/user/disclose/:id
 * @route POST /api/reports/:id/reveal
 * @access User, Admin
 */
const discloseReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the report and verify ownership
    const report = await Report.findOne({ _id: id, createdBy: userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or access denied"
      });
    }

    // Check if already disclosed
    if (!report.isAnonymous) {
      return res.status(400).json({
        success: false,
        message: "Report is already disclosed"
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update report to non-anonymous
    report.isAnonymous = false;
    await report.save();

    // Update associated ticket
    if (report.ticketNumber) {
      const displayName = `${user.firstName} ${user.lastName}`;
      await Ticket.findOneAndUpdate(
        { ticketNumber: report.ticketNumber },
        {
          isAnonymous: false,
          displayName: displayName
        }
      );
    }

    res.json({
      success: true,
      message: "Identity disclosed successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error disclosing report:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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

    // Find the report and verify ownership
    const report = await Report.findOne({ _id: id, createdBy: userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or access denied"
      });
    }

    // Only allow updates if report is not anonymous (identity disclosed)
    if (report.isAnonymous) {
      return res.status(403).json({
        success: false,
        message: "You must disclose your identity before updating the report"
      });
    }

    // Update allowed fields
    if (incidentDescription) report.incidentDescription = incidentDescription;
    if (additionalNotes) report.additionalNotes = additionalNotes;

    await report.save();

    res.json({
      success: true,
      message: "Report updated successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Send report PDF via email
 * @route POST /api/reports/send-pdf
 * @access User, Admin, Superadmin
 */
/**
 * Send report PDF via email
 * @route POST /api/reports/send-pdf
 * @access User, Admin, Superadmin
 */
const sendReportPDF = async (req, res) => {
  try {
    const pdfFile = req.file;
    const userId = req.user.id;
    const { ticketNumber } = req.body;

    // Validate PDF file
    if (!pdfFile) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required"
      });
    }

    if (pdfFile.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed"
      });
    }

    // 1. Convert PDF Buffer to Base64 (Skip Cloudinary to avoid corruption)
    if (!pdfFile || !pdfFile.buffer) {
      return res.status(400).json({ success: false, message: "No PDF file buffer found" });
    }
    const pdfBase64 = `data:application/pdf;base64,${pdfFile.buffer.toString('base64')}`;

    // 2. Find the Ticket
    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found for this report"
      });
    }

    // 3. Get sender info (Admin)
    const sender = await User.findById(userId);
    const senderName = sender ? `${sender.firstName} ${sender.lastName}` : "GAD Admin";

    // 4. Create Message in Chat
    const message = new Message({
      ticketNumber,
      sender: "superadmin",
      senderId: userId,
      senderName,
      messageType: "file",
      content: req.body.content || "Official Referral Report PDF",
      attachments: [{
        uri: pdfBase64,
        type: "application/pdf",
        fileName: pdfFile.originalname || `Referral_${ticketNumber}.pdf`
      }]
    });

    await message.save();

    // 5. Update Ticket last message & unread count
    await Ticket.findOneAndUpdate(
      { ticketNumber },
      {
        lastMessage: "📄 Referral Report PDF",
        lastMessageAt: new Date(),
        $inc: { "unreadCount.user": 1 },
        adminHasReplied: true
      }
    );

    // 6. Emit Socket.io event
    const io = req.app.get("io");
    if (io) {
      io.to(`ticket-${ticketNumber}`).emit("new-message", {
        message,
        ticket: ticket
      });
      // Also notify user room to update their inbox
      io.to(`user-${ticket.userId}`).emit("ticket-updated", { ticket: ticket });
    }

    console.log(`✅ Referral PDF sent to Chat for ticket ${ticketNumber}`);

    // 7. Send Email to User (Official Receipt)
    try {
      if (sender && sender.email) {
        await sendEmail({
          to: sender.email,
          subject: `Official Incident Report Copy - ${ticketNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #7e22ce;">TUP GAD Incident Report</h2>
              <p>Hello ${sender.firstName},</p>
              <p>Thank you for submitting your incident report. Your ticket number is <strong>${ticketNumber}</strong>.</p>
              <p>Attached to this email is an official copy of your submitted report in PDF format for your personal records.</p>
              <p>You can also track the status of your report and communicate with GAD administrators through the <strong>ETALA Mobile App</strong>.</p>
              <p>If you have any further questions, you may use the in-app chat system to speak with our counselors.</p>
              <br/>
              <p>Best regards,</p>
              <p><strong>TUP GAD Office</strong></p>
            </div>
          `,
          attachments: [
            {
              filename: pdfFile.originalname || `Report_${ticketNumber}.pdf`,
              content: pdfFile.buffer,
              contentType: 'application/pdf'
            }
          ]

        });
        console.log(`📧 Official PDF report sent to ${sender.email}`);
      }
    } catch (emailErr) {
      console.error("❌ Email sending failed (Report PDF):", emailErr);
      // We don't fail the whole request because chat message was already saved
    }

    res.json({
      success: true,
      message: "Referral PDF has been sent to the chat system and your registered email",
      fileUrl: pdfBase64.substring(0, 100) + "..."
    });

  } catch (error) {
    console.error("❌ SendReportPDF Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send PDF to system",
      error: error.message
    });
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

    if (!pdfFile) {
      return res.status(400).json({ success: false, message: "PDF file is required" });
    }

    // Upload PDF to Cloudinary
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "chat_referrals",
            resource_type: "auto",
            public_id: `referral_${ticketNumber || Date.now()}_${Date.now()}`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        Readable.from(pdfFile.buffer).pipe(uploadStream);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();
    console.log(`✅ PDF uploaded to Cloudinary for ticket ${ticketNumber}`);

    res.json({
      success: true,
      message: "PDF uploaded successfully",
      fileUrl: cloudinaryResult.secure_url.replace('/upload/', '/upload/fl_attachment/')
    });
  } catch (error) {
    console.error("❌ UploadPDFOnly Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload PDF",
      error: error.message
    });
  }
};

/**
 * Get report analytics for dashboard
 * @route GET /api/reports/analytics
 * @access Admin, Superadmin
 */
const getReportAnalytics = async (req, res) => {
  try {
    // Kunin ang lahat ng reports
    const reports = await Report.find()
      .populate("createdBy", "firstName lastName email")
      .lean();

    const archivedReports = await Report.find({ archived: true }).lean();

    // Severity analysis (kung may AI analysis field)
    const severityCounts = {
      'Severe': 0,
      'Moderate': 0,
      'Mild': 0,
      'Unanalyzed': 0
    };

    // Status counts
    const statusCounts = {
      'For Queuing': 0,
      'For Interview': 0,
      'Internal': 0,
      'External': 0,
      'Case Closed': 0,
      'Not Set': 0
    };

    // Incident type distribution
    const incidentTypeCounts = {};

    // Department distribution
    const departmentCounts = {};

    // Process each report
    reports.forEach(report => {
      // Severity counts - check for severity field (from AI analysis)
      if (report.severity) {
        const severity = report.severity.charAt(0).toUpperCase() + report.severity.slice(1);
        if (severityCounts.hasOwnProperty(severity)) {
          severityCounts[severity] += 1;
        } else {
          severityCounts[severity] = 1;
        }
      } else {
        severityCounts['Unanalyzed'] += 1;
      }

      // Status counts
      if (report.caseStatus) {
        const status = report.caseStatus;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      } else {
        statusCounts['Not Set'] += 1;
      }

      // Incident types analysis removed as per request

      // Department counts (reporterDepartment field)
      if (report.reporterDepartment) {
        const dept = report.reporterDepartment;
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      }
    });

    // Handle Year Filter
    const { year } = req.query;
    const currentYear = new Date().getFullYear();
    const targetYear = year ? parseInt(year) : currentYear;

    // Monthly trends (Jan to Dec of target year)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthCounts = [];
    const monthArchivedCounts = [];

    for (let i = 0; i < 12; i++) {
      const startOfMonth = new Date(targetYear, i, 1);
      const endOfMonth = new Date(targetYear, i + 1, 0, 23, 59, 59);

      // Count total reports this month
      const count = await Report.countDocuments({
        submittedAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });

      // Count archived reports this month
      const archivedCount = await Report.countDocuments({
        archived: true,
        submittedAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });

      monthCounts.push(count);
      monthArchivedCounts.push(archivedCount);
    }

    // Get top 10 most common incident types
    const topIncidentTypes = Object.entries(incidentTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Get top 10 departments with most reports
    const topDepartments = Object.entries(departmentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Calculate response times (average days from submission to last update)
    const reportsWithResponse = reports.filter(r => r.submittedAt && r.lastUpdated);
    let avgResponseDays = 0;
    if (reportsWithResponse.length > 0) {
      const totalDays = reportsWithResponse.reduce((sum, report) => {
        const submitted = new Date(report.submittedAt);
        const updated = new Date(report.lastUpdated || report.submittedAt);
        const diffTime = Math.abs(updated - submitted);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      avgResponseDays = Math.round(totalDays / reportsWithResponse.length);
    }

    // Resolution rate (percentage of closed cases)
    const totalClosed = statusCounts['Case Closed'] || 0;
    const resolutionRate = reports.length > 0
      ? Math.round((totalClosed / reports.length) * 100)
      : 0;

    const heatmapDeptMonth = {};
    const heatmapGenderRole = {};
    const heatmapReporterGenderMonth = {};
    const heatmapVictimGenderMonth = {};
    const heatmapWitnessGenderMonth = {};
    const heatmapMandatoryReporterGenderMonth = {};
    
    const allDepartments = new Set();
    const allRoles = new Set(["Victim", "Witness", "Mandatory Reporter"]); // Explicitly excluded "Other" and "Third Party"
    const allGenders = new Set(["Male", "Female", "LGBTQ+", "Prefer not to say", "Other"]);
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    reports.forEach(report => {
      // Basic info
      const dept = report.reporterDepartment || "Not Specified";
      let role = report.reporterRole || "Other";
      
      // Exclude "Third Party" and "Other" if they appear in data but not in our list
      if (role === "Third Party") return; 

      const submittedDate = new Date(report.submittedAt || report.createdAt);
      const monthName = submittedDate.toLocaleString('default', { month: 'short' });
      
      allDepartments.add(dept);
      if (allRoles.has(role)) {
        // Only process roles we want to track in the heatmap
      } else {
        // If it's a valid but new role, we might want it, but per request we focus on the specified ones
        if (role !== "Other") allRoles.add(role);
      }

      // Dept vs Month Heatmap
      if (monthsShort.includes(monthName)) {
        if (!heatmapDeptMonth[dept]) heatmapDeptMonth[dept] = {};
        heatmapDeptMonth[dept][monthName] = (heatmapDeptMonth[dept][monthName] || 0) + 1;
      }

      // 1. Gender vs Role Heatmap
      const rGender = report.reporterGender || report.anonymousGender || report.sex || "Not Specified";
      if (rGender && allRoles.has(role)) {
        if (!heatmapGenderRole[rGender]) heatmapGenderRole[rGender] = {};
        heatmapGenderRole[rGender][role] = (heatmapGenderRole[rGender][role] || 0) + 1;
      }

      // 2. Reporter Gender vs Month
      if (monthsShort.includes(monthName)) {
        if (!heatmapReporterGenderMonth[rGender]) heatmapReporterGenderMonth[rGender] = {};
        heatmapReporterGenderMonth[rGender][monthName] = (heatmapReporterGenderMonth[rGender][monthName] || 0) + 1;
      }

      // 3. Victim Gender vs Month
      const vGender = report.sex || "Not Provided";
      if (monthsShort.includes(monthName)) {
        if (!heatmapVictimGenderMonth[vGender]) heatmapVictimGenderMonth[vGender] = {};
        heatmapVictimGenderMonth[vGender][monthName] = (heatmapVictimGenderMonth[vGender][monthName] || 0) + 1;
      }

      // 4. Witness Gender vs Month
      const wGender = report.witnessGender || "Not Provided";
      if (monthsShort.includes(monthName)) {
        if (!heatmapWitnessGenderMonth[wGender]) heatmapWitnessGenderMonth[wGender] = {};
        heatmapWitnessGenderMonth[wGender][monthName] = (heatmapWitnessGenderMonth[wGender][monthName] || 0) + 1;
      }

      // 5. Mandatory Reporter Gender vs Month
      if (role === "Mandatory Reporter" && monthsShort.includes(monthName)) {
        if (!heatmapMandatoryReporterGenderMonth[rGender]) heatmapMandatoryReporterGenderMonth[rGender] = {};
        heatmapMandatoryReporterGenderMonth[rGender][monthName] = (heatmapMandatoryReporterGenderMonth[rGender][monthName] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalReports: reports.length,
          activeReports: reports.length - archivedReports.length,
          archivedReports: archivedReports.length,
          severeReports: severityCounts['Severe'],
          moderateReports: severityCounts['Moderate'],
          mildReports: severityCounts['Mild'],
          pendingAnalysis: severityCounts['Unanalyzed'],
          pendingReportsCount: await Report.countDocuments({ status: "Pending", archived: false }),
          avgResponseDays: avgResponseDays,
          resolutionRate: resolutionRate
        },
        byStatus: statusCounts,
        bySeverity: severityCounts,
        monthlyTrend: {
          months,
          counts: monthCounts,
          archived: monthArchivedCounts
        },
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
                incidentDescription: desc ? (desc.substring(0, 100) + (desc.length > 100 ? '...' : '')) : "No statement provided",
                caseStatus: report.caseStatus || 'Not Set',
                submittedAt: report.submittedAt,
                severity: report.severity || 'Unanalyzed'
              };
            }),
          todayCount: await Report.countDocuments({
            submittedAt: {
              $gte: new Date().setHours(0, 0, 0, 0),
              $lte: new Date()
            }
          }),
          weekCount: await Report.countDocuments({
            submittedAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          })
        },
        performanceMetrics: {
          avgDailyReports: monthCounts[monthCounts.length - 1] > 0
            ? Math.round(monthCounts[monthCounts.length - 1] / 30)
            : 0,
          peakMonth: months[monthCounts.indexOf(Math.max(...monthCounts))],
          peakMonthCount: Math.max(...monthCounts)
        },
        heatmaps: {
          deptVsMonth: {
            rows: Array.from(allDepartments).sort(),
            columns: months,
            data: heatmapDeptMonth
          },
          genderVsRole: {
            rows: Array.from(allGenders),
            columns: Array.from(allRoles).sort(),
            data: heatmapGenderRole
          },
          reporterGenderVsMonth: {
            rows: Array.from(allGenders),
            columns: months,
            data: heatmapReporterGenderMonth
          },
          victimGenderVsMonth: {
            rows: Array.from(allGenders),
            columns: months,
            data: heatmapVictimGenderMonth
          },
          witnessGenderVsMonth: {
            rows: Array.from(allGenders),
            columns: months,
            data: heatmapWitnessGenderMonth
          },
          mandatoryReporterGenderVsMonth: {
            rows: Array.from(allGenders),
            columns: months,
            data: heatmapMandatoryReporterGenderMonth
          }
        }
      },
      message: "Report analytics fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching report analytics:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createReport,
  getUserReports,
  getUserReportById,
  getAllReports,
  getReportById,
  updateReportStatus,
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
  updateReportServices
};