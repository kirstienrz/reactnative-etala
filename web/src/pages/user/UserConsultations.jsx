import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon, List, Loader, Clock, Info, Video, Phone, MapPin, CheckCircle, XCircle, Clock3, ChevronRight, CalendarDays, Filter, Search, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { getUserConsultations } from "../../api/calendar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Custom calendar CSS to match Reports style
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
  .custom-calendar .react-calendar__navigation button:hover {
    background: #F3F4F6 !important;
  }
  .custom-calendar .react-calendar__navigation button:disabled {
    opacity: 0.5 !important;
  }
  .custom-calendar .react-calendar__month-view__weekdays {
    font-weight: 500 !important;
    color: #6B7280 !important;
    text-transform: uppercase !important;
    font-size: 12px !important;
  }
  .custom-calendar .react-calendar__month-view__weekdays__weekday {
    padding: 8px 4px !important;
  }
  .custom-calendar .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none !important;
  }
  .custom-calendar .react-calendar__tile {
    padding: 10px 4px !important;
    font-size: 14px !important;
    font-weight: 400 !important;
    color: #374151 !important;
    border-radius: 6px !important;
    transition: all 0.15s !important;
  }
  .custom-calendar .react-calendar__tile:hover {
    background: #F3F4F6 !important;
  }
  .custom-calendar .react-calendar__tile--active {
    background: #8B5CF6 !important;
    color: white !important;
  }
  .custom-calendar .react-calendar__tile--active:hover {
    background: #7C3AED !important;
  }
  .custom-calendar .has-consultation {
    background: #EDE9FE !important;
    color: #6D28D9 !important;
    font-weight: 500 !important;
    position: relative !important;
  }
  .custom-calendar .has-consultation::after {
    content: "" !important;
    position: absolute !important;
    bottom: 4px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: 4px !important;
    height: 4px !important;
    background: #6D28D9 !important;
    border-radius: 50% !important;
  }
  .custom-calendar .has-consultation.react-calendar__tile--active::after {
    background: white !important;
  }
  .custom-calendar .react-calendar__tile--now {
    background: #FEF3C7 !important;
    color: #92400E !important;
  }
`;

// Status badge component matching Reports style
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch(status?.toLowerCase()) {
      case 'scheduled':
      case 'upcoming':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Upcoming' };
      case 'ongoing':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Pending' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`px-3 py-1 text-sm rounded-full font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Mode icon component
const ModeIcon = ({ mode }) => {
  switch(mode?.toLowerCase()) {
    case 'video':
      return <Video size={16} className="text-purple-600" />;
    case 'phone':
      return <Phone size={16} className="text-green-600" />;
    case 'in-person':
      return <MapPin size={16} className="text-red-600" />;
    default:
      return <Info size={16} className="text-gray-500" />;
  }
};

// Replace dummy API with real API call
async function fetchUserConsultations() {
  const res = await getUserConsultations();
  if (res.success) return res.data;
  return [];
}

export default function UserConsultations() {
  const { user } = useSelector((state) => state.auth);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("calendar");
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchUserConsultations().then((data) => {
      setConsultations(data);
      setLoading(false);
    });
  }, [user]);

  // Helper: open modal by reportTicketNumber from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openReport = params.get('open');
    if (openReport && consultations.length > 0) {
      const found = consultations.find(
        c => c.reportTicketNumber === openReport ||
             c.extendedProps?.reportTicketNumber === openReport
      );
      if (found) {
        setSelectedConsultation(found);
        setModalOpen(true);
      }
    }
  }, [consultations]);

  // Filter consultations
  const filteredConsultations = consultations.filter((c) => {
    // Status filter
    if (filterStatus) {
      const status = (c.status || c.extendedProps?.status || "").toLowerCase();
      if (status !== filterStatus.toLowerCase()) return false;
    }
    
    // Search filter
    if (searchTerm) {
      const title = (c.title || "").toLowerCase();
      const reportId = (c.reportTicketNumber || c.extendedProps?.reportTicketNumber || "").toLowerCase();
      const term = searchTerm.toLowerCase();
      if (!title.includes(term) && !reportId.includes(term)) return false;
    }
    
    return true;
  });

  // Helper: get consultations for selected date
  const consultationsForDate = filteredConsultations.filter((c) => {
    if (!c.start) return false;
    const d = new Date(c.start);
    return d.toDateString() === selectedDate.toDateString();
  });

  // Helper: get all consultation dates
  const consultationDates = filteredConsultations
    .filter(c => c.start)
    .map(c => new Date(c.start).toDateString());

  // Helper: check if date has consultations
  const tileClassName = ({ date }) => {
    if (consultationDates.includes(date.toDateString())) {
      return 'has-consultation';
    }
    return null;
  };

  // Handle modal scroll lock
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen]);

  return (
    <>
      <style>{calendarStyles}</style>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Consultations</h1>
            <p className="text-gray-600 mt-2">
              View and manage your scheduled consultations.
            </p>
          </div>

          {/* Filters and View Toggle */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Consultations
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by title or report ID..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white transition-all"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="w-full sm:w-auto flex items-end">
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setView("calendar")}
                    className={`flex-1 sm:flex-none px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      view === "calendar" 
                        ? "bg-purple-600 text-white" 
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <CalendarIcon size={18} />
                    <span className="hidden sm:inline">Calendar</span>
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`flex-1 sm:flex-none px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      view === "list" 
                        ? "bg-purple-600 text-white" 
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <List size={18} />
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
              </div>
            </div>
          ) : consultations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <CalendarIcon size={96} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations booked yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Your scheduled consultations will appear here once booked. You can schedule a consultation from the reports page.
              </p>
            </div>
          ) : view === "calendar" ? (
            // Calendar View
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Calendar */}
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

                {/* Selected Date Header */}
                <div className="mt-8 mb-4 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {consultationsForDate.length} session{consultationsForDate.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Consultations for selected date */}
                {consultationsForDate.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">No consultations scheduled for this date.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {consultationsForDate.map((c, idx) => (
                      <div
                        key={c._id || idx}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => { setSelectedConsultation(c); setModalOpen(true); }}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <ModeIcon mode={c.extendedProps?.mode} />
                              </div>
                              <span className="font-semibold text-gray-900">
                                {c.title || "Consultation"}
                              </span>
                              <StatusBadge status={c.status || c.extendedProps?.status} />
                              {c.reportTicketNumber && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  #{c.reportTicketNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-600 text-sm flex items-center gap-2">
                              <Clock size={14} />
                              {c.start ? new Date(c.start).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) : 'Time TBA'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-purple-600 font-medium">
                            <span>View Details</span>
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {filteredConsultations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConsultations.map((c, idx) => {
                    const dateStr = c.start ? new Date(c.start).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : "No date";

                    return (
                      <div
                        key={c._id || idx}
                        className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => { setSelectedConsultation(c); setModalOpen(true); }}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="font-semibold text-gray-900 text-lg">
                                {c.title || "Consultation"}
                              </span>
                              <StatusBadge status={c.status || c.extendedProps?.status} />
                              {c.reportTicketNumber && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  #{c.reportTicketNumber}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-gray-600 text-sm">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {dateStr}
                              </span>
                              <span className="flex items-center gap-1">
                                <ModeIcon mode={c.extendedProps?.mode} />
                                {c.extendedProps?.mode || 'Not specified'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-purple-600 font-medium">
                            <span>View Details</span>
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Summary Footer */}
          {!loading && consultations.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-right">
              Showing {filteredConsultations.length} of {consultations.length} consultations
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedConsultation && (
        <div className="fixed inset-0 z-[9999] modal-container">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModalOpen(false)}
          ></div>

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900 truncate">
                        {selectedConsultation.title || "Consultation Details"}
                      </h2>
                      <StatusBadge status={selectedConsultation.status || selectedConsultation.extendedProps?.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {selectedConsultation.extendedProps?.mode && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                          <ModeIcon mode={selectedConsultation.extendedProps?.mode} />
                          {selectedConsultation.extendedProps?.mode}
                        </span>
                      )}
                      {selectedConsultation.reportTicketNumber && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Report #{selectedConsultation.reportTicketNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => setModalOpen(false)}
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Date & Time Section */}
                  <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
                      <h3 className="text-xl font-semibold text-gray-900">Schedule</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-2">Date & Time</label>
                        <p className="text-gray-900">
                          {selectedConsultation.start ? new Date(selectedConsultation.start).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : "No date set"}
                        </p>
                      </div>
                      {selectedConsultation.extendedProps?.duration && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 block mb-2">Duration</label>
                          <p className="text-gray-900">{selectedConsultation.extendedProps?.duration} minutes</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Description Section */}
                  <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                      <h3 className="text-xl font-semibold text-gray-900">Description</h3>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-line">
                        {selectedConsultation.description || selectedConsultation.extendedProps?.description || "No description provided"}
                      </p>
                    </div>
                  </section>

                  {/* User Information Section */}
                  {(selectedConsultation.extendedProps?.userName || selectedConsultation.extendedProps?.userEmail) && (
                    <section className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-green-600 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-900">User Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedConsultation.extendedProps?.userName && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Name</label>
                            <p className="text-gray-900">{selectedConsultation.extendedProps?.userName}</p>
                          </div>
                        )}
                        {selectedConsultation.extendedProps?.userEmail && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Email</label>
                            <p className="text-gray-900">{selectedConsultation.extendedProps?.userEmail}</p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-5">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                  {selectedConsultation.reportTicketNumber && (
                    <button
                      onClick={() => {
                        window.location.href = `/user/reports?open=${encodeURIComponent(selectedConsultation.reportTicketNumber)}`;
                      }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      View in My Reports
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}