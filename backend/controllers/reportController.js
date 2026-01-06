const Report = require("../models/report");
const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ✅ Utility: Generate unique ticket number
const generateTicketNumber = (isAnonymous) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `ETALA-${isAnonymous ? "ANON" : "ID"}-${year}${month}-${random}`;
};

// ✅ Create a new report
const createReport = async (req, res) => {
  try {
    const { attachments: _, ...reportData } = req.body;

    const isAnonymous = reportData.isAnonymous === "true" || reportData.isAnonymous === true;
    const ticketNumber = generateTicketNumber(isAnonymous);

    // ✅ Build attachments (from Cloudinary or upload middleware)
    const attachmentObjects = req.files?.map((file) => ({
      uri: file.path,
      type: file.mimetype.startsWith("video") ? "video" : "image",
      fileName: file.originalname,
    })) || [];

    // ✅ Convert "field[]" formatted arrays
    const processedData = { ...reportData };
    Object.keys(processedData).forEach((key) => {
      if (key.endsWith("[]")) {
        const cleanKey = key.slice(0, -2);
        processedData[cleanKey] = Array.isArray(processedData[key])
          ? processedData[key]
          : [processedData[key]];
        delete processedData[key];
      }
    });

    const newReport = new Report({
      ...processedData,
      isAnonymous,
      createdBy: req.user.id,
      ticketNumber,
      attachments: attachmentObjects,
      timeline: [
        {
          action: "Report Created",
          performedBy: req.user.id,
          remarks: "Initial submission by user",
        },
      ],
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "Report submitted successfully.",
      ticketNumber: newReport.ticketNumber,
      data: newReport,
    });
  } catch (error) {
    console.error("Create Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create report.",
      error: error.message,
    });
  }
};

// ✅ USER: Get all their reports
const getUserReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "", search = "" } = req.query;

    const query = {
      createdBy: req.user.id,
      archived: { $ne: true },
    };

    if (status) query.status = status; // <- this is the missing piece

    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    const reports = await Report.find(query)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      total,
    });
  } catch (error) {
    console.error("Get User Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports.",
      error: error.message,
    });
  }
};


// ✅ USER: Get single report
const getUserReportById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid report ID format." 
      });
    }

    const report = await Report.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!report)
      return res.status(404).json({ success: false, message: "Report not found." });

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Get User Report Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch report.",
      error: error.message 
    });
  }
};

// ✅ ADMIN: Get all reports
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({ archived: { $ne: true } })
      .populate({
        path: "createdBy",
        select: "tupId firstName lastName email role",
        options: { strictPopulate: false }
      })
      .sort({ submittedAt: 1 });

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Get All Reports Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch reports.",
      error: error.message 
    });
  }
};

// ✅ ADMIN: Get single report
const getReportById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid report ID format." 
      });
    }

    const report = await Report.findById(req.params.id)
      .populate({
        path: "createdBy",
        select: "tupId firstName lastName email role",
        options: { strictPopulate: false }
      });

    if (!report)
      return res.status(404).json({ success: false, message: "Report not found." });

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Get Report By ID Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch report.",
      error: error.message 
    });
  }
};

// ✅ ADMIN: Update report status + add timeline
const updateReportStatus = async (req, res) => {
  try {
    const { status, remarks, caseStatus } = req.body;

    const validStatuses = ["Pending", "Reviewed", "In Progress", "Resolved", "Closed"];
    const validCaseStatuses = ["For Queuing", "For Interview", "For Appointment", "For Referral"];

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid report ID format." });
    }

    const report = await Report.findById(req.params.id);
    if (!report)
      return res.status(404).json({ success: false, message: "Report not found." });

    // Update main status if provided
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status." });
      }

      report.status = status;
      report.timeline.push({
        action: `Status updated to ${status}`,
        performedBy: req.user.id,
        remarks: remarks || "",
      });
    }

    // Update caseStatus if provided
    if (caseStatus) {
      if (!validCaseStatuses.includes(caseStatus)) {
        return res.status(400).json({ success: false, message: "Invalid case status." });
      }

      report.caseStatus = caseStatus;
      report.timeline.push({
        action: `Case status updated to ${caseStatus}`,
        performedBy: req.user.id,
        remarks: remarks || "",
        caseStatus
      });
    }

    report.lastUpdated = new Date();
    await report.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      data: report,
    });
  } catch (error) {
    console.error("Update Report Status Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update status.",
      error: error.message 
    });
  }
};


// ✅ ADMIN: Add referral record
const addReferral = async (req, res) => {
  try {
    const { department, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid report ID format." });
    }

    const report = await Report.findById(req.params.id);
    if (!report)
      return res.status(404).json({ success: false, message: "Report not found." });

    report.referrals.push({
      department,
      note,
      referredBy: req.user.id,
      date: new Date(),
    });

    report.timeline.push({
      action: `Referred to ${department}`,
      performedBy: req.user.id,
      remarks: note || "",
    });

    report.lastUpdated = new Date();
    report.status = "In Progress";

    await report.save();

    res.status(200).json({
      success: true,
      message: `Report referred to ${department}.`,
      data: report,
    });
  } catch (error) {
    console.error("Add Referral Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add referral.",
      error: error.message 
    });
  }
};

// ✅ ADMIN: Archive report
const archiveReport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid report ID format." });
    }

    const report = await Report.findById(req.params.id);
    if (!report)
      return res.status(404).json({ success: false, message: "Report not found." });

    report.archived = true;
    report.timeline.push({ action: "Report Archived", performedBy: req.user.id });
    await report.save();

    res.status(200).json({ success: true, message: "Report archived successfully." });
  } catch (error) {
    console.error("Archive Report Error:", error);
    res.status(500).json({ success: false, message: "Failed to archive report.", error: error.message });
  }
};

// ✅ ADMIN: Get archived reports
const getArchivedReports = async (req, res) => {
  try {
    const archived = await Report.find({ archived: true })
      .populate({
        path: "createdBy",
        select: "tupId firstName lastName email role",
        options: { strictPopulate: false }
      })
      .sort({ submittedAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: archived });
  } catch (error) {
    console.error("Get Archived Reports Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch archived reports.", error: error.message });
  }
};

// ✅ ADMIN: Restore archived report
const restoreReport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid report ID format." });
    }

    const report = await Report.findById(req.params.id);
    if (!report)
      return res.status(404).json({ success: false, message: "Report not found." });

    report.archived = false;
    report.timeline.push({ action: "Report Restored", performedBy: req.user.id });
    await report.save();

    res.status(200).json({ success: true, message: "Report restored successfully." });
  } catch (error) {
    console.error("Restore Report Error:", error);
    res.status(500).json({ success: false, message: "Failed to restore report.", error: error.message });
  }
};
 const discloseReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id; // from auth middleware
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Password is required" });

    // Check user role
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can disclose their own report" });
    }

    // Verify user password
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    // Fetch report
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Ensure ownership
    if (report.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You can only disclose your own report" });
    }

    // Update isAnonymous
    report.isAnonymous = false;
    await report.save();

    res.json({ message: "Identity revealed", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateReportByUser = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user._id;
    const updates = req.body;

    const report = await Report.findOne({ _id: reportId, createdBy: userId });
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.isAnonymous)
      return res.status(400).json({ message: "Disclose identity first before editing" });

    if (report.hasEdited)
      return res.status(400).json({ message: "You can only edit once" });

    // ✅ Allowed fields for editing (everything except incidentDescription & incidentTypes)
    const editableFields = [
      "lastName","firstName","middleName","alias","sex","dateOfBirth","age","civilStatus",
      "educationalAttainment","nationality","passportNo","occupation","religion",
      "region","province","cityMun","barangay","disability","numberOfChildren","agesOfChildren",
      "guardianLastName","guardianFirstName","guardianMiddleName","guardianRelationship",
      "guardianRegion","guardianProvince","guardianCityMun","guardianBarangay","guardianContact",
      "perpLastName","perpFirstName","perpMiddleName","perpAlias","perpSex","perpDateOfBirth","perpAge",
      "perpCivilStatus","perpEducation","perpNationality","perpPassport","perpOccupation","perpReligion",
      "perpRegion","perpProvince","perpCityMun","perpBarangay","perpRelationship",
      "perpGuardianLastName","perpGuardianFirstName","perpGuardianMiddleName","perpGuardianRelationship",
      "perpGuardianRegion","perpGuardianProvince","perpGuardianCityMun","perpGuardianBarangay","perpGuardianContact",
      "crisisIntervention","protectionOrder","referToSWDO","swdoDate","swdoServices",
      "referToHealthcare","healthcareDate","healthcareProvider","healthcareServices",
      "referToLawEnforcement","lawDate","lawAgency","referToOther","otherDate","otherProvider","otherService",
      "attachments","additionalNotes"
    ];

    // Only apply allowed fields
    editableFields.forEach(field => {
      if (updates[field] !== undefined) {
        report[field] = updates[field];
      }
    });

    report.hasEdited = true; // mark as edited
    report.lastUpdated = new Date();

    await report.save();

    return res.json({ message: "Report updated successfully", report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
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
};
