import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  User,
  ClipboardList,
  RefreshCw,
  X,
  Calendar as CalendarIcon,
  RotateCcw,
  CheckSquare,
  ChevronDown,
  Eye,
  MessageSquare,
  FileText,
  ChevronRight,
  Phone,
  Video,
  MapPin,
  Info,
  History,
} from "lucide-react";
import {
  getAdminAppointments,
  approveAppointment,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
} from "../../api/appointments";
import { toast } from "react-toastify";
import AvailabilityPickerModal from "../../components/AvailabilityPickerModal";

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Approved:            { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  Pending:             { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200"   },
  "Admin Rescheduled": { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200"  },
  "User Rescheduled":  { bg: "bg-sky-100",     text: "text-sky-700",     border: "border-sky-200"     },
  "Pending Rebooking": { bg: "bg-purple-100",  text: "text-purple-700",  border: "border-purple-200"  },
  Completed:           { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200"    },
  Rejected:            { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200"     },
  Cancelled:           { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200"     },
};

const getStatusClasses = (status) => {
  const cfg = STATUS_CONFIG[status];
  return cfg
    ? `${cfg.bg} ${cfg.text} ${cfg.border}`
    : "bg-gray-100 text-gray-700 border-gray-200";
};

// ─── "For Interview" is a SYSTEM-ONLY case status set automatically when an
//     appointment is approved. It is intentionally excluded from this list so
//     admins cannot set it manually. Admins use "For Scheduling" to invite the
//     user to book, then the system promotes to "For Interview" on approval.
const CASE_STATUS_OPTIONS = [
  "For Scheduling",      // admin-selectable: sends booking link to user
  "For Referral",
  "For Investigation",
  "Under Investigation",
  "Case Closed",
];

// ─── Appointment display name ────────────────────────────────────────────────

const getDisplayName = (appt) =>
  appt.isAnonymous
    ? "Anonymous User"
    : `${appt.userId?.firstName || ""} ${appt.userId?.lastName || ""}`.trim() || "Anonymous User";

// ─── Mode icon ───────────────────────────────────────────────────────────────

const ModeIcon = ({ mode, size = 14 }) => {
  switch ((mode || "").toLowerCase()) {
    case "video":        return <Video  size={size} className="text-purple-600" />;
    case "phone":        return <Phone  size={size} className="text-green-600"  />;
    case "in-person":
    case "face_to_face": return <MapPin size={size} className="text-red-600"    />;
    default:             return <Info   size={size} className="text-gray-500"   />;
  }
};

// ─── Component ───────────────────────────────────────────────────────────────

const AppointmentManagement = () => {
  const [appointments, setAppointments]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState("");
  const [statusFilter, setStatusFilter]   = useState("All");

  // Modal visibility
  const [showDetailModal,       setShowDetailModal]       = useState(false);
  const [showRescheduleModal,   setShowRescheduleModal]   = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showConfirmModal,      setShowConfirmModal]      = useState(false);
  const [showCompleteModal,     setShowCompleteModal]     = useState(false);

  // Shared selected appointment
  const [selectedAppt, setSelectedAppt]   = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [cancelReason, setCancelReason]   = useState("");

  // Reschedule form
  const [reschedData, setReschedData] = useState({ reason: "" });

  // Complete form
  const [completeData, setCompleteData] = useState({
    adminNotes: "",
    nextCaseStatus: "For Referral",
    identifyUser: false,
    selectedUserId: "",
  });

  // ─── Data fetching ─────────────────────────────────────────────────────────

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getAdminAppointments();
      setAppointments(res.data);
    } catch {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleApprove = async (id) => {
    try {
      await approveAppointment(id);
      toast.success("Appointment approved — case status set to For Interview");
      fetchAppointments();
    } catch {
      toast.error("Approval failed");
    } finally {
      closeConfirmModal();
    }
  };

  const handleCancel = async (id) => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }
    try {
      await cancelAppointment(id, { reason: cancelReason.trim() });
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch {
      toast.error("Cancellation failed");
    } finally {
      closeConfirmModal();
    }
  };

  const handleConfirmAction = () => {
    if (!selectedAppt || !confirmAction) return;
    if (confirmAction === "approve") handleApprove(selectedAppt._id);
    else if (confirmAction === "cancel") handleCancel(selectedAppt._id);
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedData.reason.trim()) {
      toast.error("Please provide a reason for rescheduling.");
      return;
    }
    try {
      await rescheduleAppointment(selectedAppt._id, reschedData);
      toast.success("Reschedule request sent");
      setShowRescheduleModal(false);
      fetchAppointments();
    } catch {
      toast.error("Reschedule failed");
    }
  };

  const handleCompleteSubmit = async () => {
    if (!completeData.adminNotes.trim()) {
      toast.error("Please enter interview notes.");
      return;
    }
    try {
      await completeAppointment(selectedAppt._id, {
        adminNotes:     completeData.adminNotes,
        nextCaseStatus: completeData.nextCaseStatus,
        identifyUser:   completeData.identifyUser,
        selectedUserId: completeData.identifyUser ? completeData.selectedUserId : undefined,
      });
      toast.success("Appointment marked as completed");
      setShowCompleteModal(false);
      fetchAppointments();
    } catch {
      toast.error("Failed to complete appointment");
    }
  };

  // ─── Modal helpers ─────────────────────────────────────────────────────────

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setSelectedAppt(null);
    setCancelReason("");
  };

  const openConfirmModal = (appt, action) => {
    setSelectedAppt(appt);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const openRescheduleModal = (appt) => {
    setSelectedAppt(appt);
    setReschedData({ reason: "" });
    setShowRescheduleModal(true);
  };

  const openCompleteModal = (appt) => {
    setSelectedAppt(appt);
    setCompleteData({
      adminNotes: appt.adminNotes || "",
      nextCaseStatus: "For Referral",
      identifyUser: false,
      selectedUserId: appt.userId?._id || "",
    });
    setShowCompleteModal(true);
  };

  const openDetailModal = (appt) => {
    setSelectedAppt(appt);
    setShowDetailModal(true);
  };

  // ─── Derived data ──────────────────────────────────────────────────────────

  const filteredAppointments = appointments.filter((appt) => {
    const nameMatch   = getDisplayName(appt).toLowerCase().includes(searchTerm.toLowerCase());
    const ticketMatch = appt.reportId?.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "All" || appt.status === statusFilter;
    return (nameMatch || ticketMatch) && statusMatch;
  });

  const canApprove    = (s) => ["Pending", "User Rescheduled"].includes(s);
  const canCancel     = (s) => !["Completed", "Cancelled", "Rejected"].includes(s);
  const canReschedule = (s) => !["Completed", "Cancelled", "Rejected"].includes(s);
  const canComplete   = (s) => s === "Approved";

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage consultations and student interviews.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAvailabilityModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Manage Availability
            </button>
            <button
              onClick={fetchAppointments}
              className="p-2 hover:bg-white rounded-lg border transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Status legend note ── */}
        <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
          <span>
            <strong>For Interview</strong> is set automatically when an appointment is approved — it cannot be set manually.
            Use <strong>For Scheduling</strong> in the report status dropdown to invite the student to book a slot.
          </span>
        </div>

        {/* ── Filters ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or ticket number..."
              className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Admin Rescheduled">Admin Rescheduled</option>
              <option value="User Rescheduled">User Rescheduled</option>
              <option value="Pending Rebooking">Pending Rebooking</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Student", "Ticket", "Date", "Time", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAppointments.map((appt) => (
                    <tr
                      key={appt._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => openDetailModal(appt)}
                    >
                      {/* Student */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 text-sm block">{getDisplayName(appt)}</span>
                            {appt.isAnonymous && (
                              <span className="text-xs text-gray-400">Anonymous</span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Ticket */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <ClipboardList className="w-3.5 h-3.5 flex-shrink-0" />
                          {appt.reportId?.ticketNumber || "N/A"}
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.date}</td>
                      {/* Time */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {appt.startTime} – {appt.endTime}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(appt.status)}`}>
                          {appt.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <ActionBtn
                            onClick={() => openDetailModal(appt)}
                            title="View Details"
                            colorClass="bg-gray-100 text-gray-600 hover:bg-gray-200"
                            icon={<Eye className="w-4 h-4" />}
                          />
                          {canApprove(appt.status) && (
                            <ActionBtn
                              onClick={() => openConfirmModal(appt, "approve")}
                              title="Approve"
                              colorClass="bg-green-100 text-green-600 hover:bg-green-200"
                              icon={<CheckCircle className="w-4 h-4" />}
                            />
                          )}
                          {canComplete(appt.status) && (
                            <ActionBtn
                              onClick={() => openCompleteModal(appt)}
                              title="Mark Complete"
                              colorClass="bg-blue-100 text-blue-600 hover:bg-blue-200"
                              icon={<CheckSquare className="w-4 h-4" />}
                            />
                          )}
                          {canReschedule(appt.status) && (
                            <ActionBtn
                              onClick={() => openRescheduleModal(appt)}
                              title="Reschedule"
                              colorClass="bg-orange-100 text-orange-600 hover:bg-orange-200"
                              icon={<RotateCcw className="w-4 h-4" />}
                            />
                          )}
                          {canCancel(appt.status) && (
                            <ActionBtn
                              onClick={() => openConfirmModal(appt, "cancel")}
                              title="Cancel"
                              colorClass="bg-red-100 text-red-600 hover:bg-red-200"
                              icon={<XCircle className="w-4 h-4" />}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          DETAIL MODAL
      ══════════════════════════════════════════════════ */}
      {showDetailModal && selectedAppt && (
        <Backdrop onClick={() => setShowDetailModal(false)}>
          <ModalCard className="max-w-2xl max-h-[90vh] flex flex-col">
            <ModalHeader
              title="Appointment Details"
              onClose={() => setShowDetailModal(false)}
              accent="blue"
            />

            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* ── Status + identifiers row ── */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(selectedAppt.status)}`}>
                  {selectedAppt.status}
                </span>
                {selectedAppt.reportId?.ticketNumber && (
                  <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border border-gray-200 flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" />
                    #{selectedAppt.reportId.ticketNumber}
                  </span>
                )}
                {selectedAppt.mode && (
                  <span className="px-2.5 py-1 text-xs bg-purple-50 text-purple-700 rounded-full border border-purple-100 flex items-center gap-1">
                    <ModeIcon mode={selectedAppt.mode} size={12} />
                    {selectedAppt.mode}
                  </span>
                )}
                {selectedAppt.isAnonymous && (
                  <span className="px-2.5 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100">
                    Anonymous
                  </span>
                )}
              </div>

              {/* ── Student info ── */}
              <DetailSection title="Student" accent="blue" icon={<User className="w-4 h-4" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <DetailField label="Name" value={getDisplayName(selectedAppt)} />
                  {!selectedAppt.isAnonymous && selectedAppt.userId?.email && (
                    <DetailField label="Email" value={selectedAppt.userId.email} />
                  )}
                  {!selectedAppt.isAnonymous && selectedAppt.userId?.studentId && (
                    <DetailField label="Student ID" value={selectedAppt.userId.studentId} />
                  )}
                  {!selectedAppt.isAnonymous && selectedAppt.userId?.course && (
                    <DetailField label="Course" value={selectedAppt.userId.course} />
                  )}
                </div>
              </DetailSection>

              {/* ── Schedule ── */}
              <DetailSection title="Schedule" accent="purple" icon={<Clock className="w-4 h-4" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <DetailField label="Date" value={selectedAppt.date || "—"} />
                  <DetailField
                    label="Time"
                    value={`${selectedAppt.startTime || "—"} – ${selectedAppt.endTime || "—"}`}
                  />
                  {selectedAppt.duration && (
                    <DetailField label="Duration" value={`${selectedAppt.duration} minutes`} />
                  )}
                  {selectedAppt.mode && (
                    <DetailField label="Mode" value={selectedAppt.mode} />
                  )}
                </div>
              </DetailSection>

              {/* ── Student's notes ── */}
              {selectedAppt.notes && (
                <DetailSection title="Student's Notes" accent="gray" icon={<FileText className="w-4 h-4" />}>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100 leading-relaxed">
                    {selectedAppt.notes}
                  </p>
                </DetailSection>
              )}

              {/* ── Cancel reason ── */}
              {selectedAppt.cancelReason && (
                <DetailSection title="Cancellation Reason" accent="red" icon={<XCircle className="w-4 h-4" />}>
                  <p className="text-sm text-gray-700 bg-red-50 rounded-lg px-4 py-3 border border-red-100 leading-relaxed">
                    {selectedAppt.cancelReason}
                  </p>
                </DetailSection>
              )}

              {/* ── Admin notes ── */}
              {selectedAppt.adminNotes && (
                <DetailSection title="Interview Summary / Admin Notes" accent="blue" icon={<MessageSquare className="w-4 h-4" />}>
                  <p className="text-sm text-gray-700 bg-blue-50 rounded-lg px-4 py-3 border border-blue-100 leading-relaxed">
                    {selectedAppt.adminNotes}
                  </p>
                </DetailSection>
              )}

              {/* ── Reschedule history ── */}
              {selectedAppt.rescheduleHistory?.length > 0 && (
                <DetailSection
                  title="Reschedule History"
                  accent="orange"
                  icon={<History className="w-4 h-4" />}
                  badge={`${selectedAppt.rescheduleHistory.length} change${selectedAppt.rescheduleHistory.length !== 1 ? "s" : ""}`}
                >
                  <div className="space-y-3">
                    {[...selectedAppt.rescheduleHistory].reverse().map((r, idx) => {
                      const byAdmin = r.rescheduledBy !== selectedAppt.userId?._id && r.rescheduledBy !== selectedAppt.userId;
                      return (
                        <div
                          key={idx}
                          className={`rounded-lg px-4 py-3 border text-sm space-y-1.5 ${
                            byAdmin
                              ? "bg-orange-50 border-orange-100"
                              : "bg-sky-50 border-sky-100"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                              byAdmin
                                ? "bg-orange-100 text-orange-800"
                                : "bg-sky-100 text-sky-800"
                            }`}>
                              {byAdmin ? "Admin rescheduled" : "Student rescheduled"}
                            </span>
                            {r.rescheduledAt && (
                              <span className="text-xs text-gray-400">
                                {new Date(r.rescheduledAt).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", year: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                            <span className="line-through">
                              {r.previousDate} {r.previousStartTime}
                              {r.previousEndTime ? ` – ${r.previousEndTime}` : ""}
                            </span>
                            <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 font-medium">
                              {selectedAppt.date} {selectedAppt.startTime}
                              {selectedAppt.endTime ? ` – ${selectedAppt.endTime}` : ""}
                            </span>
                          </div>
                          {r.reason && (
                            <div className={`flex items-start gap-2 rounded-lg px-3 py-2 border text-xs ${
                              byAdmin
                                ? "bg-orange-100/60 border-orange-200 text-orange-900"
                                : "bg-white border-sky-100 text-gray-600"
                            }`}>
                              <MessageSquare size={11} className={`mt-0.5 flex-shrink-0 ${byAdmin ? "text-orange-500" : "text-sky-400"}`} />
                              <p className="leading-relaxed">
                                <span className="font-medium">Reason: </span>{r.reason}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </DetailSection>
              )}

              {/* ── Linked report ── */}
              {selectedAppt.reportId && (
                <DetailSection title="Linked Report" accent="gray" icon={<ClipboardList className="w-4 h-4" />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <DetailField label="Ticket #" value={selectedAppt.reportId.ticketNumber || "—"} />
                    {selectedAppt.reportId.status && (
                      <DetailField label="Case Status" value={selectedAppt.reportId.status} />
                    )}
                    {selectedAppt.reportId.category && (
                      <DetailField label="Category" value={selectedAppt.reportId.category} />
                    )}
                  </div>
                </DetailSection>
              )}

            </div>

            {/* Footer with quick actions */}
            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Close
                </button>
                {canApprove(selectedAppt.status) && (
                  <button
                    onClick={() => { setShowDetailModal(false); openConfirmModal(selectedAppt, "approve"); }}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                )}
                {canComplete(selectedAppt.status) && (
                  <button
                    onClick={() => { setShowDetailModal(false); openCompleteModal(selectedAppt); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Mark Complete
                  </button>
                )}
                {canReschedule(selectedAppt.status) && (
                  <button
                    onClick={() => { setShowDetailModal(false); openRescheduleModal(selectedAppt); }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reschedule
                  </button>
                )}
                {canCancel(selectedAppt.status) && (
                  <button
                    onClick={() => { setShowDetailModal(false); openConfirmModal(selectedAppt, "cancel"); }}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </ModalCard>
        </Backdrop>
      )}

      {/* ══════════════════════════════════════════════════
          CONFIRM MODAL
      ══════════════════════════════════════════════════ */}
      {showConfirmModal && selectedAppt && (
        <Backdrop onClick={closeConfirmModal}>
          <ModalCard className="max-w-sm">
            <ModalHeader
              title={confirmAction === "approve" ? "Approve Appointment" : "Cancel Appointment"}
              onClose={closeConfirmModal}
              accent={confirmAction === "approve" ? "green" : "red"}
            />
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                {confirmAction === "approve"
                  ? "Approving this appointment will automatically set the case status to For Interview."
                  : "Are you sure you want to cancel this appointment? This action cannot be undone."}
              </p>
              <ApptSummary appt={selectedAppt} />

              {confirmAction === "cancel" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for cancellation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-xl h-20 outline-none focus:ring-2 focus:ring-red-400 resize-none text-sm"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Schedule conflict, No-show, Emergency..."
                  />
                </div>
              )}
            </div>
            <ModalFooter>
              <button onClick={closeConfirmModal} className="flex-1 px-4 py-2 border rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
                Back
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-1 px-4 py-2 text-white rounded-xl font-medium transition-colors shadow-sm text-sm ${
                  confirmAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmAction === "approve" ? "Approve" : "Cancel Appointment"}
              </button>
            </ModalFooter>
          </ModalCard>
        </Backdrop>
      )}

      {/* ══════════════════════════════════════════════════
          RESCHEDULE MODAL
      ══════════════════════════════════════════════════ */}
      {showRescheduleModal && selectedAppt && (
        <Backdrop onClick={() => setShowRescheduleModal(false)}>
          <ModalCard className="max-w-md">
            <ModalHeader title="Reschedule Appointment" onClose={() => setShowRescheduleModal(false)} accent="orange" />
            <div className="p-6 space-y-4">
              <ApptSummary appt={selectedAppt} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manage Availability <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setShowRescheduleModal(false); setShowAvailabilityModal(true); }}
                  className="w-full px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Open Availability Picker
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rescheduling <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-xl h-24 outline-none focus:ring-2 focus:ring-orange-400 resize-none text-sm"
                  value={reschedData.reason}
                  onChange={(e) => setReschedData({ ...reschedData, reason: e.target.value })}
                  placeholder="e.g. Schedule conflict, Emergency..."
                />
              </div>
              <p className="text-xs text-gray-500 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                ℹ️ The student will be notified and will need to accept the new schedule or request another time.
              </p>
            </div>
            <ModalFooter>
              <button onClick={() => setShowRescheduleModal(false)} className="flex-1 px-4 py-2 border rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors shadow-sm text-sm"
              >
                Send Reschedule
              </button>
            </ModalFooter>
          </ModalCard>
        </Backdrop>
      )}

      {/* ══════════════════════════════════════════════════
          COMPLETE MODAL
      ══════════════════════════════════════════════════ */}
      {showCompleteModal && selectedAppt && (
        <Backdrop onClick={() => setShowCompleteModal(false)}>
          <ModalCard className="max-w-lg">
            <ModalHeader title="Complete Interview" onClose={() => setShowCompleteModal(false)} accent="blue" />
            <div className="p-6 space-y-5">
              <ApptSummary appt={selectedAppt} />

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Notes / Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-xl h-28 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  value={completeData.adminNotes}
                  onChange={(e) => setCompleteData({ ...completeData, adminNotes: e.target.value })}
                  placeholder="Summarize the interview findings, observations, etc."
                />
              </div>

              {/* Next Case Status — "For Interview" intentionally excluded */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Case Status To
                </label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 border rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white pr-8"
                    value={completeData.nextCaseStatus}
                    onChange={(e) => setCompleteData({ ...completeData, nextCaseStatus: e.target.value })}
                  >
                    {CASE_STATUS_OPTIONS.filter(s => s !== "For Scheduling").map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Select the next step for this case after the interview is completed.
                </p>
              </div>

              {/* Identify Anonymous User */}
              {selectedAppt.isAnonymous && (
                <div className="border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setCompleteData({ ...completeData, identifyUser: !completeData.identifyUser })}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Identify Anonymous User</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${completeData.identifyUser ? "bg-blue-600" : "bg-gray-300"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${completeData.identifyUser ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </button>

                  {completeData.identifyUser && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      <p className="text-xs text-gray-500 mt-3 mb-2">
                        This will reveal the user's identity in the report and link it to their account.
                      </p>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={completeData.selectedUserId}
                        onChange={(e) => setCompleteData({ ...completeData, selectedUserId: e.target.value })}
                        placeholder="Enter user's MongoDB ObjectId..."
                      />
                      <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        This action is irreversible. Verify the identity carefully.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <ModalFooter>
              <button onClick={() => setShowCompleteModal(false)} className="flex-1 px-4 py-2 border rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button
                onClick={handleCompleteSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                Mark as Completed
              </button>
            </ModalFooter>
          </ModalCard>
        </Backdrop>
      )}

      {/* ── Availability Modal ── */}
      <AvailabilityPickerModal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        onConfirm={fetchAppointments}
        adminId="me"
        confirmText="Save Availability"
      />
    </div>
  );
};

export default AppointmentManagement;

// ─── Small reusable sub-components ───────────────────────────────────────────

const ActionBtn = ({ onClick, title, colorClass, icon }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-colors ${colorClass}`}
  >
    {icon}
  </button>
);

const Backdrop = ({ onClick, children }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClick} />
    {children}
  </div>
);

const ModalCard = ({ children, className = "" }) => (
  <div className={`relative bg-white w-full rounded-2xl shadow-xl overflow-hidden ${className}`} onClick={(e) => e.stopPropagation()}>
    {children}
  </div>
);

const ACCENT_COLORS = {
  green:  "from-green-600  to-emerald-600",
  red:    "from-red-600    to-rose-600",
  orange: "from-orange-500 to-amber-500",
  blue:   "from-blue-600   to-indigo-600",
  gray:   "from-gray-600   to-slate-600",
  purple: "from-purple-600 to-violet-600",
};

const ModalHeader = ({ title, onClose, accent = "blue" }) => (
  <div className={`bg-gradient-to-r ${ACCENT_COLORS[accent]} p-5 text-white flex items-center justify-between flex-shrink-0`}>
    <h2 className="text-lg font-bold">{title}</h2>
    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
      <X className="w-5 h-5" />
    </button>
  </div>
);

const ModalFooter = ({ children }) => (
  <div className="p-5 border-t flex gap-3 bg-gray-50 flex-shrink-0">{children}</div>
);

const DetailSection = ({ title, accent = "gray", icon, badge, children }) => {
  const accentBar = {
    blue:   "bg-blue-500",
    purple: "bg-purple-500",
    orange: "bg-orange-400",
    red:    "bg-red-500",
    green:  "bg-green-500",
    gray:   "bg-gray-400",
  };
  return (
    <section className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1.5 h-5 rounded-full ${accentBar[accent] || accentBar.gray}`} />
        <span className="text-gray-400">{icon}</span>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        {badge && (
          <span className="ml-auto px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
};

const DetailField = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
    <p className="text-gray-800 font-medium text-sm">{value || "—"}</p>
  </div>
);

const ApptSummary = ({ appt }) => (
  <div className="bg-gray-50 rounded-xl p-4 space-y-2 border">
    <SummaryRow icon={<User className="w-4 h-4" />}         value={getDisplayName(appt)} />
    <SummaryRow icon={<ClipboardList className="w-4 h-4" />} value={appt.reportId?.ticketNumber || "N/A"} />
    <SummaryRow icon={<Calendar className="w-4 h-4" />}      value={appt.date} />
    <SummaryRow icon={<Clock className="w-4 h-4" />}         value={`${appt.startTime} – ${appt.endTime}`} />
    <div className="pt-1">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusClasses(appt.status)}`}>
        {appt.status}
      </span>
    </div>
  </div>
);

const SummaryRow = ({ icon, value }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <span className="text-gray-400 flex-shrink-0">{icon}</span>
    <span>{value}</span>
  </div>
);