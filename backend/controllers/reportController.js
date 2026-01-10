const Report = require("../models/report");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");

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
    
    // Parse arrays if they're strings
    if (typeof formData.incidentTypes === 'string') {
      try {
        formData.incidentTypes = JSON.parse(formData.incidentTypes);
      } catch (e) {
        console.error("Error parsing incidentTypes:", e);
        formData.incidentTypes = [];
      }
    }
    
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
      lastMessage: formData.incidentDescription?.substring(0, 100) || "New report submitted",
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
      sender: "admin",
      senderName: "System",
      messageType: "text",
      content: `Thank you for submitting your report. Your ticket number is ${report.ticketNumber}. Our team will review your case shortly.`,
      isRead: false
    });
    
    await systemMessage.save();
    console.log(`✅ System message created for ticket: ${report.ticketNumber}`);
    
    // 🔥 EMIT SOCKET EVENT FOR NEW MESSAGE (if socket.io is available)
    const io = req.app.get("io");
    if (io) {
      io.to(`ticket-${report.ticketNumber}`).emit("new-message", {
        message: systemMessage,
        ticket: ticket
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
      .populate("createdBy", "firstName lastName email");

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
      .populate("createdBy", "firstName lastName email tupId");

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
      .populate("createdBy", "firstName lastName email tupId");

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

    const report = await Report.findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdBy", "firstName lastName email");

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
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Add referral entry to a report
 * @route POST /api/reports/admin/:id/referral
 * @access Admin, Superadmin
 */
const addReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, note } = req.body;

    if (!department) {
      return res.status(400).json({ 
        success: false,
        message: "Department is required" 
      });
    }

    const referral = {
      department,
      note,
      referredBy: req.user.id,
      date: new Date()
    };

    const report = await Report.findByIdAndUpdate(
      id,
      { 
        $push: { referrals: referral },
        $set: { lastUpdated: new Date() }
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
      message: "Referral added successfully"
    });
  } catch (error) {
    console.error("Error adding referral:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
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

    // Get user's email
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return res.status(404).json({ 
        success: false,
        message: "User email not found" 
      });
    }

    const userEmail = user.email;
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    // Send email with PDF attachment using the updated sendEmail format
    await sendEmail({
      to: userEmail,
      subject: "Your TUP GAD Report Copy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">TUP GAD Office</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Gender and Development Office</p>
          </div>

          <!-- Main Content -->
          <div style="background: white; padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Report Submitted Successfully</h2>
            
            <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for submitting your incident report. Your report has been received and will be reviewed by our team.
            </p>

            <!-- Ticket Info Box -->
            <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Ticket Number:</p>
              <p style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 700;">${ticketNumber || 'N/A'}</p>
              <p style="margin: 10px 0 0 0; color: #64748b; font-size: 13px;">Date Submitted: ${currentDate}</p>
            </div>

            <p style="color: #475569; line-height: 1.6; margin: 20px 0;">
              Please find attached a PDF copy of your submitted report. Keep this for your records.
            </p>

            <!-- What's Next Section -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0;">What happens next?</h3>
              <ul style="color: #475569; line-height: 1.8; padding-left: 20px; margin: 0;">
                <li>Your report will be reviewed by our team within 24-48 hours</li>
                <li>You can track your report status using your ticket number</li>
                <li>We will contact you if we need additional information</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <p style="color: #475569; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
              If you have any questions or concerns, please contact us at 
              <a href="mailto:gad@tup.edu.ph" style="color: #2563eb; text-decoration: none;">gad@tup.edu.ph</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">
              This is an automated message from TUP GAD Office.
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              Please do not reply to this email.
            </p>
            <p style="color: #94a3b8; font-size: 11px; margin: 15px 0 0 0;">
              Technological University of the Philippines<br>
              Ayala Blvd, Ermita, Manila, Metro Manila
            </p>
          </div>
        </div>
      `,
      pdfBuffer: pdfFile.buffer,
      pdfFilename: pdfFile.originalname || `TUP_GAD_Report_${ticketNumber || Date.now()}.pdf`
    });

    console.log(`✅ Report PDF sent to ${userEmail}`);

    res.json({ 
      success: true, 
      message: "Report sent to your email successfully",
      emailSentTo: userEmail
    });

  } catch (error) {
    console.error("❌ Failed to send report PDF:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send report email", 
      error: error.message 
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
  generateTicketNumber,
};