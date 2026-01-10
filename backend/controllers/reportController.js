const Report = require("../models/report");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");

/**
 * Create a new report
 * @route POST /api/reports/user/create
 * @access User, Admin
 */
const createReport = async (req, res) => {
  try {
    const {
      incidentType,
      incidentDate,
      incidentTime,
      incidentLocation,
      description,
      involvedParties,
      witnesses,
      desiredOutcome,
      isAnonymous,
    } = req.body;

    // Get user ID from authenticated user
    const userId = req.user.id;

    // Handle file attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    // Create report
    const report = new Report({
      incidentType,
      incidentDate,
      incidentTime,
      incidentLocation,
      description,
      involvedParties: involvedParties ? JSON.parse(involvedParties) : [],
      witnesses: witnesses ? JSON.parse(witnesses) : [],
      desiredOutcome,
      isAnonymous: isAnonymous === "true" || isAnonymous === true,
      attachments,
      createdBy: userId,
      status: "Pending",
    });

    await report.save();

    // Get user info for ticket creation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine display name for ticket
    let displayName;
    if (report.isAnonymous) {
      displayName = "Anonymous User";
    } else {
      displayName = `${user.firstName} ${user.lastName}`;
    }

    // Create associated ticket
    const ticket = new Ticket({
      reportId: report._id,
      userId: userId,
      displayName: displayName,
      isAnonymous: report.isAnonymous,
      status: "Open",
      lastMessageAt: new Date(),
      lastMessage: description.substring(0, 100),
    });

    await ticket.save();

    // Update report with ticket number
    report.ticketNumber = ticket.ticketNumber;
    await report.save();

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report,
      ticketNumber: ticket.ticketNumber,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: error.message });
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

    const reports = await Report.find({ createdBy: userId, isArchived: false })
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstName lastName email");

    res.json(reports);
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: error.message });
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

    let query = { isArchived: false };

    if (status) query.status = status;
    if (incidentType) query.incidentType = incidentType;
    if (search) {
      query.$or = [
        { reportNumber: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { incidentLocation: new RegExp(search, "i") },
      ];
    }

    const reports = await Report.find(query)
      .sort({ [sortBy]: -1 })
      .populate("createdBy", "firstName lastName email tupId");

    res.json(reports);
  } catch (error) {
    console.error("Error fetching all reports:", error);
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: error.message });
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
    const { status, adminNotes } = req.body;

    const validStatuses = ["Pending", "Under Review", "Resolved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (status === "Resolved" || status === "Rejected") {
      updateData.resolvedAt = new Date();
    }

    const report = await Report.findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ message: error.message });
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
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report archived successfully", report });
  } catch (error) {
    console.error("Error archiving report:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all archived reports (admin only)
 * @route GET /api/reports/admin/archived
 * @access Admin, Superadmin
 */
const getArchivedReports = async (req, res) => {
  try {
    const reports = await Report.find({ isArchived: true })
      .sort({ archivedAt: -1 })
      .populate("createdBy", "firstName lastName email tupId");

    res.json(reports);
  } catch (error) {
    console.error("Error fetching archived reports:", error);
    res.status(500).json({ message: error.message });
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
      { isArchived: false, $unset: { archivedAt: "" } },
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report restored successfully", report });
  } catch (error) {
    console.error("Error restoring report:", error);
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: "Report not found or access denied" });
    }

    // Check if already disclosed
    if (!report.isAnonymous) {
      return res.status(400).json({ message: "Report is already disclosed" });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
      report,
    });
  } catch (error) {
    console.error("Error disclosing report:", error);
    res.status(500).json({ message: error.message });
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
    const { description, desiredOutcome } = req.body;

    // Find the report and verify ownership
    const report = await Report.findOne({ _id: id, createdBy: userId });

    if (!report) {
      return res.status(404).json({ message: "Report not found or access denied" });
    }

    // Only allow updates if report is not anonymous (identity disclosed)
    if (report.isAnonymous) {
      return res.status(403).json({ 
        message: "You must disclose your identity before updating the report" 
      });
    }

    // Update allowed fields
    if (description) report.description = description;
    if (desiredOutcome) report.desiredOutcome = desiredOutcome;

    await report.save();

    res.json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Send report PDF via email
 * @route POST /api/reports/send-pdf
 * @access User, Admin, Superadmin
 */
const sendReportPDF = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    const pdfFile = req.file;

    // Validate inputs
    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    if (!pdfFile) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Validate file type
    if (pdfFile.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    // Prepare email content
    const emailSubject = subject || "Report Document";
    const emailMessage = message || "Please find the attached report document.";

    // Send email with PDF attachment
    await sendEmail({
      to: email,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Report Document</h2>
          <p>${emailMessage}</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Please find the report document attached to this email.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: pdfFile.originalname || "report.pdf",
          content: pdfFile.buffer,
          contentType: "application/pdf"
        }
      ]
    });

    console.log(`✉️ Report PDF sent to ${email}`);

    res.json({ 
      success: true, 
      message: "Report sent successfully",
      recipient: email
    });

  } catch (error) {
    console.error("❌ Failed to send report PDF:", error);
    res.status(500).json({ 
      message: "Failed to send report", 
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
  archiveReport,
  getArchivedReports,
  restoreReport,
  discloseReport,
  updateReportByUser,
  sendReportPDF,
};