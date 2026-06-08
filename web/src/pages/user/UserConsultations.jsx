import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon, List, Clock, Info, Video, Phone, MapPin,
  CheckCircle, XCircle, Clock3, ChevronRight, Filter, Search,
  AlertCircle, Plus, RotateCcw, X, Loader2, FileText, MessageSquare,
} from "lucide-react";
import { useSelector } from "react-redux";
import {
  userCancelAppointment,
  acceptRescheduledAppointment,
  requestAnotherTime,
  getUserAppointments,
} from "../../api/appointments";
import { getUserConsultations } from "../../api/calendar";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// ─── Calendar CSS ────────────────────────────────────────────────────────────

const calendarStyles = `
  .custom-calendar {
    width: 100% !important;
    border: 1px solid #E5E7EB !important;
    border-radius: 12px !important;
    background: white !important;
    padding: 16px !important;
    font-family: inherit !important;
  }
  .custom-calendar .react-calendar__navigation {
    margin-bottom: 12px !important;
  }
  .custom-calendar .react-calendar__navigation button {
    font-size: 14px !important;
    color: #374151 !important;
    background: none !important;
    border-radius: 6px !important;
    padding: 6px 12px !important;
    font-weight: 500 !important;
  }
  .custom-calendar .react-calendar__navigation button:hover { background: #F3F4F6 !important; }
  .custom-calendar .react-calendar__navigation button:disabled { opacity: 0.5 !important; }
  .custom-calendar .react-calendar__month-view__weekdays {
    font-weight: 500 !important; color: #6B7280 !important;
    text-transform: uppercase !important; font-size: 12px !important;
  }
  .custom-calendar .react-calendar__month-view__weekdays__weekday { padding: 8px 4px !important; }
  .custom-calendar .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none !important; }
  .custom-calendar .react-calendar__tile {
    padding: 10px 4px !important; font-size: 14px !important;
    font-weight: 400 !important; color: #374151 !important;
    border-radius: 6px !important; transition: all 0.15s !important;
  }
  .custom-calendar .react-calendar__tile:hover { background: #F3F4F6 !important; }
  .custom-calendar .react-calendar__tile--active { background: #8B5CF6 !important; color: white !important; }
  .custom-calendar .react-calendar__tile--active:hover { background: #7C3AED !important; }
  .custom-calendar .has-consultation {
    background: #EDE9FE !important; color: #6D28D9 !important;
    font-weight: 500 !important; position: relative !important;
  }
  .custom-calendar .has-consultation::after {
    content: "" !important; position: absolute !important;
    bottom: 4px !important; left: 50% !important;
    transform: translateX(-50%) !important;
    width: 4px !important; height: 4px !important;
    background: #6D28D9 !important; border-radius: 50% !important;
  }
  .custom-calendar .has-consultation.react-calendar__tile--active::after { background: white !important; }
  .custom-calendar .react-calendar__tile--now { background: #FEF3C7 !important; color: #92400E !important; }
`;

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_MAP = {
  scheduled:           { bg: "bg-yellow-100",  text: "text-yellow-800",  label: "Upcoming"          },
  upcoming:            { bg: "bg-yellow-100",  text: "text-yellow-800",  label: "Upcoming"          },
  ongoing:             { bg: "bg-blue-100",    text: "text-blue-800",    label: "In Progress"       },
  completed:           { bg: "bg-green-100",   text: "text-green-800",   label: "Completed"         },
  cancelled:           { bg: "bg-red-100",     text: "text-red-800",     label: "Cancelled"         },
  rejected:            { bg: "bg-red-100",     text: "text-red-800",     label: "Rejected"          },
  rescheduled:         { bg: "bg-orange-100",  text: "text-orange-800",  label: "Rescheduled"       },
  "admin rescheduled": { bg: "bg-orange-100",  text: "text-orange-800",  label: "Admin Rescheduled" },
  "user rescheduled":  { bg: "bg-sky-100",     text: "text-sky-800",     label: "You Rescheduled"   },
  "pending rebooking": { bg: "bg-purple-100",  text: "text-purple-800",  label: "Pending Rebooking" },
  pending:             { bg: "bg-gray-100",    text: "text-gray-800",    label: "Pending"           },
  approved:            { bg: "bg-emerald-100", text: "text-emerald-800", label: "Approved"          },
};

const getStatusCfg = (status) =>
  STATUS_MAP[(status || "").toLowerCase()] || { bg: "bg-gray-100", text: "text-gray-800", label: status || "Unknown" };

const StatusBadge = ({ status }) => {
  const cfg = getStatusCfg(status);
  return (
    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};

const ModeIcon = ({ mode }) => {
  switch ((mode || "").toLowerCase()) {
    case "video":        return <Video  size={15} className="text-purple-600" />;
    case "phone":        return <Phone  size={15} className="text-green-600"  />;
    case "in-person":
    case "face_to_face": return <MapPin size={15} className="text-red-600"    />;
    default:             return <Info   size={15} className="text-gray-500"   />;
  }
};

// ─── Derived helpers ──────────────────────────────────────────────────────────

const canUserCancel = (s) =>
  ["pending", "approved"].includes((s || "").toLowerCase());

const canUserReschedule = (s) =>
  ["pending", "approved"].includes((s || "").toLowerCase());

const isAdminRescheduled = (s) =>
  (s || "").toLowerCase() === "admin rescheduled";

// ─── InfoRow helper ───────────────────────────────────────────────────────────

const InfoRow = ({ label, children, labelColor = "text-gray-400" }) => (
  <div>
    <p className={`text-xs font-medium mb-0.5 ${labelColor}`}>{label}</p>
    {children}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserConsultations() {
  const { user } = useSelector((s) => s.auth);
  const navigate  = useNavigate();
  const location  = useLocation();

  const [consultations, setConsultations] = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [view,           setView]          = useState("calendar");
  const [selectedDate,   setSelectedDate]  = useState(new Date());
  const [filterStatus,   setFilterStatus]  = useState("");
  const [searchTerm,     setSearchTerm]    = useState("");

  // Modal / action states
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [modalOpen,             setModalOpen]            = useState(false);
  const [showCancelModal,       setShowCancelModal]      = useState(false);
  const [cancelReason,          setCancelReason]         = useState("");
  const [actionLoading,         setActionLoading]        = useState(false);

  // Notification banner from router state
  const [notificationBanner, setNotificationBanner] = useState(null);

  // ─── Data ──────────────────────────────────────────────────────────────────

  const loadConsultations = async () => {
    setLoading(true);
    try {
      // Fetch both: calendar events (for display shape) and raw appointments (for full fields)
      const [calRes, apptRes] = await Promise.all([
        getUserConsultations(),
        getUserAppointments(),
      ]);

      if (calRes.success) {
        const calEvents = calRes.data || [];
        const rawAppts = Array.isArray(apptRes?.data) ? apptRes.data : [];

        // Build a lookup map from appointment _id → raw appointment doc
        const apptMap = {};
        for (const appt of rawAppts) {
          apptMap[appt._id] = appt;
        }

        // Merge: overlay raw appointment fields onto each calendar event
        const merged = calEvents.map((evt) => {
          const id = evt._id || evt.extendedProps?._id;
          const raw = id ? apptMap[id] : null;
          if (!raw) return evt;
          return {
            ...evt,
            // Promote key fields to top-level so they're easy to access
            cancelReason:       raw.cancelReason       ?? evt.cancelReason,
            adminNotes:         raw.adminNotes         ?? evt.adminNotes,
            rescheduleHistory:  raw.rescheduleHistory  ?? evt.rescheduleHistory,
            notes:              raw.notes              ?? evt.notes,
            status:             raw.status             ?? evt.status,
            date:               raw.date               ?? evt.date,
            startTime:          raw.startTime          ?? evt.startTime,
            endTime:            raw.endTime            ?? evt.endTime,
            userId:             raw.userId             ?? evt.userId,
          };
        });

        setConsultations(merged);
      }
    } catch {
      toast.error("Failed to load consultations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConsultations(); }, [user]);

  // ─── URL param effects ─────────────────────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookReportId = params.get("book");
    if (bookReportId) navigate(`/user/interview?reportId=${bookReportId}`, { replace: true });
  }, [location, navigate]);

  useEffect(() => {
    const state = location.state;
    if (state?.action && state?.actionData) setNotificationBanner({ type: state.action, data: state.actionData });
  }, [location.state]);

  useEffect(() => {
    if (!consultations.length) return;
    const params = new URLSearchParams(window.location.search);
    const apptId     = params.get("appointment");
    const openTicket = params.get("open");
    if (apptId) {
      const found = consultations.find((c) => c._id === apptId);
      if (found) { setSelectedConsultation(found); setModalOpen(true); }
    } else if (openTicket) {
      const found = consultations.find(
        (c) => c.reportTicketNumber === openTicket || c.extendedProps?.reportTicketNumber === openTicket
      );
      if (found) { setSelectedConsultation(found); setModalOpen(true); }
    }
  }, [consultations]);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [modalOpen]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleCancelAppointment = async () => {
    if (!selectedConsultation) return;
    setActionLoading(true);
    try {
      await userCancelAppointment(selectedConsultation._id, { reason: cancelReason });
      toast.success("Appointment cancelled.");
      setShowCancelModal(false);
      setModalOpen(false);
      setCancelReason("");
      await loadConsultations();
    } catch {
      toast.error("Failed to cancel appointment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGoToReschedule = () => {
    if (!selectedConsultation) return;
    const apptId = selectedConsultation._id;
    const rId    = selectedConsultation.reportId || selectedConsultation.extendedProps?.reportId || "";
    setModalOpen(false);
    navigate(`/user/interview?rescheduleId=${apptId}${rId ? `&reportId=${rId}` : ""}`);
  };

  const handleAcceptReschedule = async () => {
    if (!selectedConsultation) return;
    setActionLoading(true);
    try {
      await acceptRescheduledAppointment(selectedConsultation._id);
      toast.success("New schedule accepted!");
      setModalOpen(false);
      await loadConsultations();
    } catch {
      toast.error("Failed to accept reschedule.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestAnotherTime = async () => {
    if (!selectedConsultation) return;
    setActionLoading(true);
    try {
      await requestAnotherTime(selectedConsultation._id);
      toast.success("Request sent. Check your email for a new booking link.");
      setModalOpen(false);
      await loadConsultations();
    } catch {
      toast.error("Failed to request another time.");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Derived ───────────────────────────────────────────────────────────────

  const getConsultationStatus = (c) => c.status || c.extendedProps?.status || "";

  const filteredConsultations = consultations.filter((c) => {
    if (filterStatus) {
      const s = getConsultationStatus(c).toLowerCase();
      if (s !== filterStatus.toLowerCase()) return false;
    }
    if (searchTerm) {
      const title  = (c.title || "").toLowerCase();
      const ticket = (c.reportTicketNumber || c.extendedProps?.reportTicketNumber || "").toLowerCase();
      const term   = searchTerm.toLowerCase();
      if (!title.includes(term) && !ticket.includes(term)) return false;
    }
    return true;
  });

  const consultationsForDate = filteredConsultations.filter((c) => {
    if (!c.start) return false;
    return new Date(c.start).toDateString() === selectedDate.toDateString();
  });

  const consultationDates = filteredConsultations
    .filter((c) => c.start)
    .map((c) => new Date(c.start).toDateString());

  const tileClassName = ({ date }) =>
    consultationDates.includes(date.toDateString()) ? "has-consultation" : null;

  const pendingResponseCount = consultations.filter(
    (c) => isAdminRescheduled(getConsultationStatus(c))
  ).length;

  // ─── Render helpers ────────────────────────────────────────────────────────

  const ConsultationCard = ({ c, onClick }) => {
    const status = getConsultationStatus(c);
    const needsResponse = isAdminRescheduled(status);
    return (
      <div
        onClick={onClick}
        className={`p-5 cursor-pointer transition-colors duration-150 hover:bg-gray-50 ${
          needsResponse ? "border-l-4 border-orange-400 bg-orange-50/30" : ""
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-semibold text-gray-900 truncate">{c.title || "Consultation"}</span>
              <StatusBadge status={status} />
              {c.reportTicketNumber && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  #{c.reportTicketNumber}
                </span>
              )}
              {needsResponse && (
                <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-semibold animate-pulse">
                  ⚡ Action Required
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1.5">
              <Clock size={13} />
              {c.start
                ? new Date(c.start).toLocaleString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })
                : "Date TBA"}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-purple-600 font-medium text-sm flex-shrink-0">
            <span>Details</span>
            <ChevronRight size={15} />
          </div>
        </div>
      </div>
    );
  };

  // ─── Selected consultation derived values ──────────────────────────────────

  const sc = selectedConsultation;
  const scStatus = sc ? getConsultationStatus(sc) : "";

  // Latest reschedule entry from rescheduleHistory (admin-initiated only)
  const latestAdminReschedule = sc?.rescheduleHistory
    ?.filter((r) => r.rescheduledBy !== sc.userId)
    ?.slice(-1)[0] || null;

  // All reschedule history entries to show (newest first)
  const rescheduleHistory = sc?.rescheduleHistory
    ? [...sc.rescheduleHistory].reverse()
    : [];

  const hasAdminNotes        = !!sc?.adminNotes;
  const cancelReasonText     = sc?.cancelReason || sc?.extendedProps?.cancelReason || "";
  const hasCancelReason      = !!cancelReasonText;
  const hasNotes             = sc?.notes;
  const hasRescheduleHistory = rescheduleHistory.length > 0;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{calendarStyles}</style>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Consultations</h1>
              <p className="text-gray-500 mt-1 text-sm">View and manage your scheduled consultations.</p>
            </div>
            <div className="flex items-center gap-3">
              {pendingResponseCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 border border-orange-200 text-orange-800 rounded-lg text-sm font-medium">
                  <AlertCircle size={15} />
                  {pendingResponseCount} pending response{pendingResponseCount > 1 ? "s" : ""}
                </div>
              )}
              <button
                onClick={() => navigate("/user/interview")}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-sm text-sm"
              >
                <Plus size={16} />
                Book New
              </button>
            </div>
          </div>

          {/* ── Notification Banner ── */}
          {notificationBanner && (
            <NotificationBanner
              banner={notificationBanner}
              onClose={() => setNotificationBanner(null)}
              onRequestTime={() => { setNotificationBanner(null); navigate("/user/interview"); }}
            />
          )}

          {/* ── Admin-Rescheduled Alert ── */}
          {pendingResponseCount > 0 && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-orange-900 text-sm">Admin rescheduled your appointment(s)</p>
                <p className="text-orange-700 text-sm mt-0.5">
                  Please review and either accept the new time or request a different slot. Find them highlighted below.
                </p>
              </div>
            </div>
          )}

          {/* ── Filters + View Toggle ── */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by title or report ID..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-full sm:w-52">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <select
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="admin rescheduled">Admin Rescheduled</option>
                  <option value="user rescheduled">You Rescheduled</option>
                  <option value="pending rebooking">Pending Rebooking</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex gap-2 sm:w-auto">
                {["calendar", "list"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm ${
                      view === v
                        ? "bg-purple-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {v === "calendar" ? <CalendarIcon size={16} /> : <List size={16} />}
                    <span className="hidden sm:inline capitalize">{v}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-20 flex items-center justify-center">
              <Loader2 className="w-9 h-9 animate-spin text-purple-500" />
            </div>
          ) : consultations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
              <CalendarIcon size={56} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No consultations yet</h3>
              <p className="text-sm text-gray-500">Your scheduled consultations will appear here.</p>
            </div>
          ) : view === "calendar" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
              <div className="max-w-full overflow-x-auto">
                <Calendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  tileClassName={tileClassName}
                  className="custom-calendar"
                  minDetail="month"
                  maxDetail="month"
                  showNeighboringMonth={false}
                />
              </div>
              <div className="mt-8 mb-4 flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </h4>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                  {consultationsForDate.length} session{consultationsForDate.length !== 1 ? "s" : ""}
                </span>
              </div>
              {consultationsForDate.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <Clock className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400">No consultations scheduled for this date.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
                  {consultationsForDate.map((c, idx) => (
                    <ConsultationCard
                      key={c._id || idx}
                      c={c}
                      onClick={() => { setSelectedConsultation(c); setModalOpen(true); }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {filteredConsultations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <AlertCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No consultations match your filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConsultations.map((c, idx) => (
                    <ConsultationCard
                      key={c._id || idx}
                      c={c}
                      onClick={() => { setSelectedConsultation(c); setModalOpen(true); }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && consultations.length > 0 && (
            <p className="mt-3 text-xs text-gray-400 text-right">
              Showing {filteredConsultations.length} of {consultations.length} consultations
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          DETAIL MODAL
      ══════════════════════════════════════════════════ */}
      {modalOpen && sc && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-900 truncate">
                        {sc.title || "Consultation Details"}
                      </h2>
                      <StatusBadge status={scStatus} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sc.extendedProps?.mode && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                          <ModeIcon mode={sc.extendedProps?.mode} />
                          {sc.extendedProps?.mode}
                        </span>
                      )}
                      {(sc.reportTicketNumber || sc.extendedProps?.reportTicketNumber) && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Report #{sc.reportTicketNumber || sc.extendedProps?.reportTicketNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* ── Admin Rescheduled Action Banner ── */}
                {isAdminRescheduled(scStatus) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <RotateCcw className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-orange-900 text-sm">Admin rescheduled your appointment</p>
                        <p className="text-orange-700 text-sm mt-0.5">
                          Please accept the new time or request a different slot.
                        </p>
                        {latestAdminReschedule?.reason && (
                          <p className="text-orange-800 text-sm mt-1.5 bg-orange-100 rounded-lg px-3 py-2">
                            <span className="font-medium">Reason: </span>{latestAdminReschedule.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAcceptReschedule}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-60"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={15} />}
                        Accept New Time
                      </button>
                      <button
                        onClick={handleRequestAnotherTime}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold disabled:opacity-60"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw size={15} />}
                        Request Another Time
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Schedule ── */}
                <section className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                    <h3 className="font-semibold text-gray-900">Schedule</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <InfoRow label="Date & Time">
                      <p className="text-gray-800">
                        {sc.start
                          ? new Date(sc.start).toLocaleString("en-US", {
                              weekday: "long", year: "numeric", month: "long",
                              day: "numeric", hour: "2-digit", minute: "2-digit",
                            })
                          : "Not set"}
                      </p>
                    </InfoRow>
                    {sc.extendedProps?.duration && (
                      <InfoRow label="Duration">
                        <p className="text-gray-800">{sc.extendedProps?.duration} minutes</p>
                      </InfoRow>
                    )}
                    {hasNotes && (
                      <InfoRow label="Your Notes">
                        <p className="text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{sc.notes}</p>
                      </InfoRow>
                    )}
                  </div>
                </section>

                {/* ── Admin Notes (Interview Summary) ── */}
                {hasAdminNotes && (
                  <section className="border border-blue-100 rounded-xl p-5 bg-blue-50/40">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                      <h3 className="font-semibold text-gray-900">Interview Summary</h3>
                      <span className="ml-auto px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                        From Admin
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 bg-white rounded-lg px-4 py-3 border border-blue-100 leading-relaxed">
                      {sc.adminNotes}
                    </p>
                  </section>
                )}

                {/* ── Cancellation Reason ── */}
                {hasCancelReason && (
                  <section className="border border-red-100 rounded-xl p-5 bg-red-50/40">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                      <h3 className="font-semibold text-gray-900">Cancellation Reason</h3>
                      <span className="ml-auto px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                        From Admin
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 bg-white rounded-lg px-4 py-3 border border-red-100 leading-relaxed">
                      {cancelReasonText}
                    </p>
                  </section>
                )}

                {/* ── Reschedule History ── */}
                {hasRescheduleHistory && (
                  <section className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-6 bg-orange-400 rounded-full" />
                      <h3 className="font-semibold text-gray-900">Reschedule History</h3>
                      <span className="ml-auto px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">
                        {rescheduleHistory.length} change{rescheduleHistory.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {rescheduleHistory.map((r, idx) => {
                        const byAdmin = r.rescheduledBy !== sc.userId;
                        return (
                          <div
                            key={idx}
                            className={`rounded-lg px-4 py-3 border text-sm space-y-1.5 ${
                              byAdmin
                                ? "bg-orange-50/60 border-orange-100"
                                : "bg-gray-50 border-gray-100"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-medium ${byAdmin ? "text-orange-800" : "text-gray-700"}`}>
                                  {byAdmin ? "Admin rescheduled" : "You rescheduled"}
                                </span>
                                {byAdmin && (
                                  <span className="px-1.5 py-0.5 text-[10px] bg-orange-100 text-orange-700 rounded-full font-semibold">
                                    Admin
                                  </span>
                                )}
                              </div>
                              {r.rescheduledAt && (
                                <span className="text-xs text-gray-400">
                                  {new Date(r.rescheduledAt).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", year: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-xs flex-wrap">
                              <span className="line-through">
                                {r.previousDate} {r.previousStartTime}
                                {r.previousEndTime ? ` – ${r.previousEndTime}` : ""}
                              </span>
                              <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 font-medium">
                                {sc.date} {sc.startTime}
                                {sc.endTime ? ` – ${sc.endTime}` : ""}
                              </span>
                            </div>
                            {/* ── Reason from admin or user ── */}
                            {r.reason && (
                              <div className={`flex items-start gap-2 rounded-lg px-3 py-2 mt-1 border ${
                                byAdmin
                                  ? "bg-orange-100/60 border-orange-200 text-orange-900"
                                  : "bg-white border-gray-100 text-gray-600"
                              }`}>
                                <MessageSquare size={13} className={`mt-0.5 flex-shrink-0 ${byAdmin ? "text-orange-500" : "text-gray-400"}`} />
                                <p className="text-xs leading-relaxed">
                                  <span className="font-medium">Reason: </span>{r.reason}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Close
                  </button>
                  {(sc.reportTicketNumber || sc.extendedProps?.reportTicketNumber) && (
                    <button
                      onClick={() => navigate(`/user/reports?open=${encodeURIComponent(sc.reportTicketNumber || sc.extendedProps?.reportTicketNumber)}`)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                    >
                      View Report
                    </button>
                  )}
                  {canUserReschedule(scStatus) && (
                    <button
                      onClick={handleGoToReschedule}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      <RotateCcw size={14} />
                      Reschedule
                    </button>
                  )}
                  {canUserCancel(scStatus) && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          CANCEL MODAL
      ══════════════════════════════════════════════════ */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[10000]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCancelModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-red-600 to-rose-600 px-5 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Cancel Appointment</h3>
                <button onClick={() => setShowCancelModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <X size={17} className="text-white" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600">Are you sure you want to cancel this appointment? This cannot be undone.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-xl h-20 outline-none focus:ring-2 focus:ring-red-400 resize-none text-sm"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Why do you want to cancel?"
                  />
                </div>
              </div>
              <div className="px-5 pb-5 flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Keep It
                </button>
                <button
                  onClick={handleCancelAppointment}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Notification Banner sub-component ───────────────────────────────────────

function NotificationBanner({ banner, onClose, onRequestTime }) {
  const configs = {
    reschedule: {
      bg: "bg-orange-50", border: "border-orange-200",
      textH: "text-orange-900", textB: "text-orange-700",
      icon: <RotateCcw size={16} className="text-orange-600" />,
      iconBg: "bg-orange-100", title: "Appointment Rescheduled",
    },
    cancel: {
      bg: "bg-red-50", border: "border-red-200",
      textH: "text-red-900", textB: "text-red-700",
      icon: <XCircle size={16} className="text-red-600" />,
      iconBg: "bg-red-100", title: "Appointment Cancelled",
    },
    approve: {
      bg: "bg-green-50", border: "border-green-200",
      textH: "text-green-900", textB: "text-green-700",
      icon: <CheckCircle size={16} className="text-green-600" />,
      iconBg: "bg-green-100", title: "Appointment Approved",
    },
  };
  const cfg = configs[banner.type] || configs.approve;
  return (
    <div className={`mb-6 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
          {cfg.icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold text-sm ${cfg.textH}`}>{cfg.title}</h4>
          {banner.type === "reschedule" && banner.data && (
            <>
              <p className={`text-sm mt-0.5 ${cfg.textB}`}>
                Rescheduled from{" "}
                <strong>{banner.data.previousDate} {banner.data.previousStartTime}</strong>
                {" "}to{" "}
                <strong>{banner.data.newDate} {banner.data.newStartTime}</strong>.
                {banner.data.reason && (
                  <span className="block mt-0.5 text-gray-600">Reason: {banner.data.reason}</span>
                )}
              </p>
              <button
                onClick={onRequestTime}
                className="mt-2 text-sm font-semibold text-purple-600 hover:text-purple-700 underline"
              >
                Request a different time
              </button>
            </>
          )}
          {banner.type === "cancel" && banner.data?.reason && (
            <p className={`text-sm mt-0.5 ${cfg.textB}`}>Reason: {banner.data.reason}</p>
          )}
          {banner.type === "approve" && (
            <p className={`text-sm mt-0.5 ${cfg.textB}`}>Your appointment has been approved.</p>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}