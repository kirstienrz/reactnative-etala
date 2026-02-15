import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon, List, Loader, Clock, Info, Video, Phone, MapPin, CheckCircle, XCircle, Clock3 } from "lucide-react";
import { useSelector } from "react-redux";
import { getUserConsultations } from "../../api/calendar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Custom calendar CSS to make it larger
const calendarStyles = `
  .custom-calendar {
    width: 100% !important;
    border: none !important;
    border-radius: 16px !important;
    background: white !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
    padding: 20px !important;
  }
  .custom-calendar .react-calendar__navigation {
    margin-bottom: 16px !important;
  }
  .custom-calendar .react-calendar__navigation button {
    font-size: 18px !important;
    color: #1E293B !important;
    background: none !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    font-weight: 600 !important;
  }
  .custom-calendar .react-calendar__navigation button:hover {
    background: #F1F5F9 !important;
  }
  .custom-calendar .react-calendar__month-view__weekdays {
    font-weight: 600 !important;
    color: #64748B !important;
    text-transform: uppercase !important;
    font-size: 14px !important;
  }
  .custom-calendar .react-calendar__month-view__weekdays__weekday {
    padding: 12px !important;
  }
  .custom-calendar .react-calendar__tile {
    padding: 16px 8px !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    color: #1E293B !important;
    border-radius: 12px !important;
    transition: all 0.2s !important;
  }
  .custom-calendar .react-calendar__tile:hover {
    background: #F1F5F9 !important;
  }
  .custom-calendar .react-calendar__tile--active {
    background: #1E40AF !important;
    color: white !important;
  }
  .custom-calendar .react-calendar__tile--active:hover {
    background: #1E3A8A !important;
  }
  .custom-calendar .has-consultation {
    background: #EFF6FF !important;
    color: #1E40AF !important;
    font-weight: 600 !important;
    position: relative !important;
  }
  .custom-calendar .has-consultation::after {
    content: "•" !important;
    position: absolute !important;
    bottom: 4px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    color: #1E40AF !important;
    font-size: 20px !important;
  }
  .custom-calendar .react-calendar__tile--now {
    background: #FEF3C7 !important;
    color: #92400E !important;
  }
`;

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch(status?.toLowerCase()) {
      case 'scheduled':
      case 'upcoming':
        return { bg: '#EFF6FF', color: '#1E40AF', icon: Clock3, text: 'Upcoming' };
      case 'ongoing':
        return { bg: '#FEF3C7', color: '#92400E', icon: Video, text: 'Ongoing' };
      case 'completed':
        return { bg: '#ECFDF3', color: '#067647', icon: CheckCircle, text: 'Completed' };
      case 'cancelled':
        return { bg: '#FEF3F2', color: '#B42318', icon: XCircle, text: 'Cancelled' };
      default:
        return { bg: '#F2F4F7', color: '#344054', icon: Clock, text: status || 'Pending' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      background: config.bg,
      color: config.color,
      borderRadius: 100,
      fontSize: 13,
      fontWeight: 500,
      width: 'fit-content'
    }}>
      <Icon size={14} />
      {config.text}
    </span>
  );
};

// Mode icon component
const ModeIcon = ({ mode }) => {
  switch(mode?.toLowerCase()) {
    case 'video':
      return <Video size={16} color="#2563EB" />;
    case 'phone':
      return <Phone size={16} color="#16A34A" />;
    case 'in-person':
      return <MapPin size={16} color="#DC2626" />;
    default:
      return <Info size={16} color="#64748B" />;
  }
};

// Replace dummy API with real API call
async function fetchUserConsultations(userId) {
  const res = await getUserConsultations(userId);
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

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    fetchUserConsultations(user._id).then((data) => {
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

  // Helper: get consultations for selected date
  const consultationsForDate = consultations.filter((c) => {
    if (!c.start) return false;
    const d = new Date(c.start);
    return d.toDateString() === selectedDate.toDateString();
  });

  // Helper: get all consultation dates
  const consultationDates = consultations
    .filter(c => c.start)
    .map(c => new Date(c.start).toDateString());

  // Helper: check if date has consultations
  const tileClassName = ({ date }) => {
    if (consultationDates.includes(date.toDateString())) {
      return 'has-consultation';
    }
    return null;
  };

  return (
    <>
      <style>{calendarStyles}</style>
      <div style={{ 
        background: "#F8FAFC", 
        borderRadius: 24, 
        padding: 32, 
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        marginTop: 32,
        minHeight: 'calc(100vh - 200px)'
      }}>
        {/* Header */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              color: "#0F172A", 
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              My Consultations
            </h2>
            <p style={{ color: "#64748B", margin: '8px 0 0 0', fontSize: 15 }}>
              {consultations.length} consultation{consultations.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setView("calendar")}
              style={{
                background: view === "calendar" ? "#0F172A" : "white",
                color: view === "calendar" ? "#fff" : "#1E293B",
                border: view === "calendar" ? "none" : "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "10px 20px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: view === "calendar" ? '0 4px 12px rgba(15,23,42,0.1)' : 'none'
              }}
            >
              <CalendarIcon size={18} />
              Calendar
            </button>
            <button
              onClick={() => setView("list")}
              style={{
                background: view === "list" ? "#0F172A" : "white",
                color: view === "list" ? "#fff" : "#1E293B",
                border: view === "list" ? "none" : "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "10px 20px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: view === "list" ? '0 4px 12px rgba(15,23,42,0.1)' : 'none'
              }}
            >
              <List size={18} />
              List
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: "center", 
            color: "#64748B", 
            padding: 64,
            background: 'white',
            borderRadius: 24
          }}>
            <Loader size={40} className="animate-spin" style={{ margin: '0 auto 16px', color: '#0F172A' }} />
            <p style={{ fontSize: 16, fontWeight: 500 }}>Loading your consultations...</p>
          </div>
        ) : consultations.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            color: "#64748B", 
            padding: 64,
            background: 'white',
            borderRadius: 24
          }}>
            <CalendarIcon size={48} style={{ margin: '0 auto 16px', color: '#94A3B8' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>No consultations booked yet</h3>
            <p style={{ fontSize: 15 }}>Your scheduled consultations will appear here once booked.</p>
          </div>
        ) : view === "calendar" ? (
          <div style={{ 
            background: "white", 
            borderRadius: 24, 
            padding: 32,
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            {/* Large Calendar */}
            <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
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

            {/* Selected Date Consultations */}
            <div style={{ marginTop: 32 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 20
              }}>
                <h4 style={{ 
                  margin: 0, 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: "#0F172A"
                }}>
                  <CalendarIcon size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <span style={{ 
                  background: '#F1F5F9', 
                  padding: '4px 12px', 
                  borderRadius: 100, 
                  fontSize: 13,
                  color: '#475569',
                  fontWeight: 500
                }}>
                  {consultationsForDate.length} consultation{consultationsForDate.length !== 1 ? 's' : ''}
                </span>
              </div>

              {consultationsForDate.length === 0 ? (
                <div style={{ 
                  background: "#F8FAFC", 
                  borderRadius: 16, 
                  padding: 40, 
                  textAlign: "center",
                  border: '1px dashed #E2E8F0'
                }}>
                  <Clock size={32} style={{ margin: '0 auto 12px', color: '#94A3B8' }} />
                  <p style={{ color: "#64748B", fontSize: 15, margin: 0 }}>
                    No consultations scheduled for this date.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {consultationsForDate.map((c, idx) => (
                    <div
                      key={c._id || idx}
                      style={{
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 16,
                        padding: 20,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: 'wrap',
                        gap: 16,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        ':hover': {
                          borderColor: '#94A3B8',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }
                      }}
                      onClick={() => { setSelectedConsultation(c); setModalOpen(true); }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          background: '#EFF6FF',
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ModeIcon mode={c.extendedProps?.mode} />
                        </div>
                        <div>
                          <h5 style={{ 
                            margin: 0, 
                            fontSize: 16, 
                            fontWeight: 600, 
                            color: "#0F172A",
                            marginBottom: 6
                          }}>
                            {c.title || "Consultation"}
                          </h5>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, color: '#475569' }}>
                              {c.start ? new Date(c.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBA'}
                            </span>
                            <span style={{ color: '#E2E8F0' }}>•</span>
                            <StatusBadge status={c.status || c.extendedProps?.status} />
                          </div>
                        </div>
                      </div>
                      <button
                        style={{
                          background: "white",
                          color: "#0F172A",
                          border: "1px solid #E2E8F0",
                          borderRadius: 12,
                          padding: "10px 20px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: 'all 0.2s',
                          ':hover': {
                            background: '#F8FAFC',
                            borderColor: '#94A3B8'
                          }
                        }}
                        onClick={(e) => { e.stopPropagation(); setSelectedConsultation(c); setModalOpen(true); }}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* List View */
          <div style={{ 
            background: "white", 
            borderRadius: 24, 
            padding: 32,
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#0F172A" }}>
                All Consultations
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {consultations.map((c, idx) => {
                const hasId = Boolean(c._id);
                const dateStr = c.start ? new Date(c.start).toLocaleString(undefined, { 
                  dateStyle: "medium", 
                  timeStyle: "short" 
                }) : "No date";

                return (
                  <div
                    key={c._id || idx}
                    style={{
                      background: hasId ? "white" : "#FFFBEB",
                      border: hasId ? "1px solid #E2E8F0" : "1px solid #FCD34D",
                      borderRadius: 16,
                      padding: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: 'wrap',
                      gap: 16,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        background: hasId ? '#EFF6FF' : '#FEF3C7',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ModeIcon mode={c.extendedProps?.mode} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                          <h5 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0F172A" }}>
                            {c.title || "Consultation"}
                          </h5>
                          {!hasId && (
                            <span style={{
                              background: '#FEF3C7',
                              color: '#92400E',
                              fontSize: 12,
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 100
                            }}>
                              ID Missing
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={14} />
                            {dateStr}
                          </span>
                          <StatusBadge status={c.status || c.extendedProps?.status} />
                        </div>
                      </div>
                    </div>
                    
                    {hasId ? (
                      <button
                        style={{
                          background: "#0F172A",
                          color: "#fff",
                          border: "none",
                          borderRadius: 12,
                          padding: "10px 24px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: 'all 0.2s',
                          ':hover': {
                            background: '#1E293B'
                          }
                        }}
                        onClick={() => { setSelectedConsultation(c); setModalOpen(true); }}
                      >
                        View Details
                      </button>
                    ) : (
                      <button
                        style={{
                          background: "#E2E8F0",
                          color: "#64748B",
                          border: "none",
                          borderRadius: 12,
                          padding: "10px 24px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "not-allowed",
                          opacity: 0.7
                        }}
                        disabled
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedConsultation && (
        <>
          {console.log('Selected Consultation:', JSON.parse(JSON.stringify(selectedConsultation)))}
        </>
      )}
      {modalOpen && selectedConsultation && (
        (() => {
          // Support both root and extendedProps for reportTicketNumber
          const reportTicketNumber = selectedConsultation.reportTicketNumber || selectedConsultation.extendedProps?.reportTicketNumber;
          return (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}>
              <div style={{
                background: "#fff",
                borderRadius: 24,
                padding: 32,
                width: '100%',
                maxWidth: 500,
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                position: "relative",
                zIndex: 10000
              }}>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 24,
                    background: "#F1F5F9",
                    border: "none",
                    borderRadius: 10,
                    width: 32,
                    height: 32,
                    fontSize: 20,
                    color: "#475569",
                    cursor: "pointer",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    ':hover': {
                      background: '#E2E8F0'
                    }
                  }}
                >
                  ×
                </button>

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#0F172A",
                    letterSpacing: '-0.01em'
                  }}>
                    {selectedConsultation.title || "Consultation Details"}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Status and Mode */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <StatusBadge status={selectedConsultation.status || selectedConsultation.extendedProps?.status} />
                    {selectedConsultation.extendedProps?.mode && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 12px',
                        background: '#F1F5F9',
                        color: '#475569',
                        borderRadius: 100,
                        fontSize: 13,
                        fontWeight: 500
                      }}>
                        <ModeIcon mode={selectedConsultation.extendedProps?.mode} />
                        {selectedConsultation.extendedProps?.mode}
                      </span>
                    )}
                  </div>

                  {/* Report ID Row - always show if available */}
                  {reportTicketNumber && (
                    <DetailRow
                      icon={<Info size={18} color="#64748B" />}
                      label="Report ID"
                      value={reportTicketNumber}
                    />
                  )}

                  {/* Details Grid */}
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: 16,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                  }}>
                    <DetailRow
                      icon={<Clock size={18} color="#64748B" />}
                      label="Date & Time"
                      value={selectedConsultation.start ? new Date(selectedConsultation.start).toLocaleString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "No date set"}
                    />

                    <DetailRow
                      icon={<Info size={18} color="#64748B" />}
                      label="Description"
                      value={selectedConsultation.description || selectedConsultation.extendedProps?.description || "No description provided"}
                    />

                    {selectedConsultation.extendedProps?.userName && (
                      <DetailRow
                        icon={<Info size={18} color="#64748B" />}
                        label="User"
                        value={selectedConsultation.extendedProps?.userName}
                      />
                    )}

                    {selectedConsultation.extendedProps?.userEmail && (
                      <DetailRow
                        icon={<Info size={18} color="#64748B" />}
                        label="Email"
                        value={selectedConsultation.extendedProps?.userEmail}
                      />
                    )}

                    {selectedConsultation.extendedProps?.duration && (
                      <DetailRow
                        icon={<Clock size={18} color="#64748B" />}
                        label="Duration"
                        value={`${selectedConsultation.extendedProps?.duration} minutes`}
                      />
                    )}
                  </div>

                  {/* View in My Reports Button - always show if reportTicketNumber exists */}
                  {reportTicketNumber && (
                    <button
                      onClick={() => {
                        window.location.href = `/user/reports?open=${encodeURIComponent(reportTicketNumber)}`;
                      }}
                      style={{
                        background: '#2563EB',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        padding: '12px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        width: '100%',
                        marginTop: 8,
                        marginBottom: 8,
                        transition: 'all 0.2s',
                        letterSpacing: 0.2
                      }}
                    >
                      View in My Reports
                    </button>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{
                      background: "#0F172A",
                      color: "#fff",
                      border: "none",
                      borderRadius: 12,
                      padding: "14px",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      width: '100%',
                      marginTop: 8,
                      transition: 'all 0.2s',
                      ':hover': {
                        background: '#1E293B'
                      }
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </>
  );
}

// Helper component for detail rows
function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ minWidth: 24 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 15, color: '#0F172A', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}