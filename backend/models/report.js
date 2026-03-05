const mongoose = require("mongoose");

// ✅ Attachment schema
const attachmentSchema = new mongoose.Schema({
  uri: { type: String, required: true },
  type: { type: String, required: true },
  fileName: { type: String, required: true },
}, { _id: false });

// ✅ Referral schema (tracks referral history - both internal and external)
const referralSchema = new mongoose.Schema({
  referralType: { type: String, enum: ["Internal", "External"], default: "Internal" },

  // Internal Referral Fields
  department: String,
  note: String,

  // External Referral Fields
  referredBy: String,
  position: String,
  schoolName: String,
  referralDate: Date,
  reason: String,
  actionsTaken: [String],
  caseSummary: String,
  barangayName: String,
  barangayAddress: String,
  receivingOfficer: String,
  endorsementMode: String,
  attachments: [attachmentSchema],

  // Metadata
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
}, { _id: false });

// ✅ Timeline schema (for audit trail)
const timelineSchema = new mongoose.Schema({
  action: String, // e.g. "Report Created", "Referred to OSA", "Marked Resolved"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  remarks: String,
}, { _id: false });

// ✅ Main Report schema
const reportSchema = new mongoose.Schema({
  // 🔗 Reference to the user who created this report
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  ticketNumber: { type: String, required: true, unique: true },
  isAnonymous: { type: Boolean, required: true },

  // Victim / Reporter Info
  lastName: String,
  firstName: String,
  middleName: String,
  alias: String,
  sex: { type: String, enum: ["Male", "Female", "Other"] },
  dateOfBirth: String,
  age: Number,
  civilStatus: String,
  educationalAttainment: String,
  nationality: String,
  passportNo: String,
  occupation: String,
  religion: String,
  region: String,
  province: String,
  cityMun: String,
  barangay: String,
  disability: String,
  numberOfChildren: String,
  agesOfChildren: String,
  guardianLastName: String,
  guardianFirstName: String,
  guardianMiddleName: String,
  guardianRelationship: String,
  guardianRegion: String,
  guardianProvince: String,
  guardianCityMun: String,
  guardianBarangay: String,
  guardianContact: String,

  // Reporter Context (both anonymous and identified)
  reporterRole: String,
  tupRole: String,
  reporterGender: String,  // ✅ ADDED: Used for both anonymous and identified reporters
  reporterDepartment: String,

  // Legacy fields (keeping for backward compatibility)
  anonymousGender: String,
  anonymousDepartment: String,

  // Perpetrator Info
  perpLastName: String,
  perpFirstName: String,
  perpMiddleName: String,
  perpAlias: String,
  perpSex: { type: String, enum: ["Male", "Female", "Other"] },
  perpDateOfBirth: String,
  perpAge: Number,
  perpCivilStatus: String,
  perpEducation: String,
  perpNationality: String,
  perpPassport: String,
  perpOccupation: String,
  perpReligion: String,
  perpRegion: String,
  perpProvince: String,
  perpCityMun: String,
  perpBarangay: String,
  perpRelationship: String,

  // Perpetrator Guardian
  perpGuardianLastName: String,
  perpGuardianFirstName: String,
  perpGuardianMiddleName: String,
  perpGuardianRelationship: String,
  perpGuardianRegion: String,
  perpGuardianProvince: String,
  perpGuardianCityMun: String,
  perpGuardianBarangay: String,
  perpGuardianContact: String,

  // Incident Info
  incidentTypes: [String],
  otherIncidentType: String,  // ✅ ADDED: For "Other" incident type details
  incidentDescription: String,
  latestIncidentDate: String,
  incidentRegion: String,
  incidentProvince: String,
  incidentCityMun: String,
  incidentBarangay: String,
  placeOfIncident: String,
  witnessName: String,
  witnessAddress: String,
  witnessContact: String,
  witnessAccount: String,
  witnessDate: String,

  // Services & Referrals
  crisisIntervention: { type: Boolean, default: false },
  protectionOrder: { type: Boolean, default: false },
  referToSWDO: { type: Boolean, default: false },
  swdoDate: String,
  swdoServices: [String],
  referToHealthcare: { type: Boolean, default: false },
  healthcareDate: String,
  healthcareProvider: String,
  healthcareServices: [String],
  referToLawEnforcement: { type: Boolean, default: false },
  lawDate: String,
  lawAgency: String,
  referToOther: { type: Boolean, default: false },
  otherDate: String,
  otherProvider: String,
  otherService: String,

  // ✅ Dynamic referrals (for audit & tracking)
  referrals: {
    type: [referralSchema],
    default: []
  },

  // ✅ Attachments
  attachments: {
    type: [attachmentSchema],
    default: []
  },

  // Notes
  additionalNotes: String,

  // ✅ Timeline of actions (audit log)
  timeline: {
    type: [timelineSchema],
    default: []
  },

  // Confirmation
  confirmAccuracy: { type: Boolean, default: false },
  confirmConfidentiality: { type: Boolean, default: false },

  // Metadata
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "In Progress", "Resolved", "Closed"],
    default: "Pending"
  },
  caseStatus: {
    type: String,
    enum: ["For Queuing", "For Interview", "For Appointment", "For Referral", "Case Closed"],
    default: "For Queuing"
  },

  submittedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
});

module.exports = mongoose.model("Report", reportSchema);