import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createCalendarEvent, getAllCalendarEvents, verifyBookingAccess } from "../../api/calendar";
import { getPublicAvailability } from "../../api/adminAvailability";
import {
  ChevronLeft, ChevronRight, Clock, Calendar, Loader2, CheckCircle, AlertCircle, X
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────
const timeToMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

const formatSlotTime = (time) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hr12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hr12}:${m} ${ampm}`;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const toDateStr = (d) => {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
};

const PH_HOLIDAYS = [
  { date: "2026-01-01", title: "New Year's Day" },
  { date: "2026-02-25", title: "EDSA Revolution Anniversary" },
  { date: "2026-04-09", title: "Araw ng Kagitingan" },
  { date: "2026-04-10", title: "Maundy Thursday" },
  { date: "2026-04-11", title: "Good Friday" },
  { date: "2026-05-01", title: "Labor Day" },
  { date: "2026-06-12", title: "Independence Day" },
  { date: "2026-08-31", title: "National Heroes Day" },
  { date: "2026-11-01", title: "All Saints Day" },
  { date: "2026-11-30", title: "Bonifacio Day" },
  { date: "2026-12-25", title: "Christmas Day" },
  { date: "2026-12-30", title: "Rizal Day" },
];

// ─── Component ──────────────────────────────────────────────────
export default function InterviewBooking() {
  const [accessVerified, setAccessVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [ticketNumber, setTicketNumber] = useState(null);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [daySlots, setDaySlots] = useState({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotConfig, setSlotConfig] = useState(null);

  // Booking state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ mode: "online" });
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?._id || user?.id;
  const location = useLocation();
  const navigate = useNavigate();

  // ─── Access Verification ─────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const uid = params.get('uid');
    const ticket = params.get('ticket');

    if (!token || !uid || !ticket) {
      setError("Invalid booking link. Missing required parameters.");
      setLoading(false);
      return;
    }

    if (!currentUserId) {
      setError("Please log in to access this page.");
      setLoading(false);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (currentUserId !== uid) {
      setError("This booking link is not for your account. Please use the link sent to your email.");
      setLoading(false);
      return;
    }

    setTicketNumber(ticket);
    verifyAccess(token, uid, ticket);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, currentUserId]);

  const verifyAccess = async (token, uid, ticket) => {
    try {
      const response = await verifyBookingAccess(token, uid, ticket);
      if (response.success) {
        setAccessVerified(true);
        setExpiresAt(new Date(response.expiresAt));
        setTicketNumber(response.ticketNumber);
      } else {
        setError(response.message || "Failed to verify booking access");
      }
    } catch (err) {
      if (err.expired) {
        setError("Your booking link has expired. Please request a new link from your case handler.");
      } else if (err.alreadyBooked) {
        setError("You have already booked your consultation for this report. You can only rebook if your previous booking was cancelled or completed.");
      } else {
        setError(err.message || "Failed to verify booking access");
      }
    } finally {
      setLoading(false);
    }
  };

  // Expiry check every minute
  useEffect(() => {
    if (!accessVerified || !expiresAt) return;
    const id = setInterval(() => {
      if (new Date() > expiresAt) {
        setError("Your booking access has expired.");
        setAccessVerified(false);
      }
    }, 60000);
    return () => clearInterval(id);
  }, [accessVerified, expiresAt]);

  // ─── Fetch Availability & Calendar Events ────────────────────
  const fetchMonthData = useCallback(async () => {
    if (!accessVerified) return;
    setSlotsLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      const startDate = `${monthStr}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${monthStr}-${String(lastDay).padStart(2, '0')}`;

      const [availRes, evtRes] = await Promise.all([
        getPublicAvailability(monthStr),
        getAllCalendarEvents({ startDate, endDate }),
      ]);

      const events = evtRes.data || [];
      if (availRes.slotConfig) setSlotConfig(availRes.slotConfig);

      // Build day-slots map
      const slotsMap = {};
      for (let d = 1; d <= lastDay; d++) {
        slotsMap[`${monthStr}-${String(d).padStart(2, '0')}`] = [];
      }

      // Fill available slots
      if (availRes.availabilities) {
        for (const day of availRes.availabilities) {
          if (day.slots?.length > 0) {
            slotsMap[day.date] = day.slots
              .map((s) => ({ start: s.start, end: s.end }))
              .sort((a, b) => timeToMin(a.start) - timeToMin(b.start));
          }
        }
      }

      // Remove slots that overlap with non-consultation calendar events
      for (const dateStr of Object.keys(slotsMap)) {
        slotsMap[dateStr] = slotsMap[dateStr].filter((slot) => {
          const sStart = timeToMin(slot.start);
          const sEnd = timeToMin(slot.end);
          for (const evt of events) {
            if (evt.type === 'consultation') continue;
            const evtStart = new Date(evt.start);
            const evtEnd = new Date(evt.end);
            const evtDs = toDateStr(evtStart);
            const evtDe = toDateStr(evtEnd);
            if (evt.allDay) {
              if (dateStr >= evtDs && dateStr <= evtDe) return false;
              continue;
            }
            if (evtDs === dateStr) {
              const eS = evtStart.getHours() * 60 + evtStart.getMinutes();
              const eE = evtEnd.getHours() * 60 + evtEnd.getMinutes();
              if (sStart < eE && sEnd > eS) return false;
            }
            if (dateStr > evtDs && dateStr < evtDe) return false;
          }
          return true;
        });
      }

      setDaySlots(slotsMap);
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setSlotsLoading(false);
    }
  }, [accessVerified, currentMonth]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  // ─── Calendar Helpers ────────────────────────────────────────
  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const days = [];
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return { days, startDayOfWeek };
  };

  const isHoliday = (ds) => PH_HOLIDAYS.find((h) => h.date === ds);
  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;
  const isPast = (d) => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d <= t;
  };
  const isTodayFn = (d) => {
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  };
  const availCount = (ds) => (daySlots[ds] || []).length;

  const handleMonthChange = (dir) => {
    setCurrentMonth((prev) => {
      const n = new Date(prev);
      n.setMonth(n.getMonth() + dir);
      return n;
    });
    setSelectedDay(null);
    setSelectedSlot(null);
  };

  // ─── Booking ─────────────────────────────────────────────────
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDay || !selectedSlot || !ticketNumber) return;
    setBooking(true);
    try {
      const dateObj = new Date(selectedDay + 'T00:00:00');
      const [sH, sM] = selectedSlot.start.split(':').map(Number);
      const [eH, eM] = selectedSlot.end.split(':').map(Number);
      const startDate = new Date(dateObj);
      startDate.setHours(sH, sM, 0, 0);
      const endDate = new Date(dateObj);
      endDate.setHours(eH, eM, 0, 0);

      const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown User';
      const userEmail = user?.email || 'N/A';

      const newEvent = {
        title: 'Consultation',
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: false,
        type: 'consultation',
        userId: currentUserId,
        reportTicketNumber: ticketNumber,
        userName,
        userEmail,
        mode: formData.mode,
        status: 'upcoming',
        extendedProps: {
          userName,
          userEmail,
          mode: formData.mode,
          status: 'upcoming',
          reportTicketNumber: ticketNumber,
          timeSlot: `${selectedSlot.start} - ${selectedSlot.end}`,
        },
      };

      const response = await createCalendarEvent(newEvent);
      if (response.success) {
        setBookingSuccess(true);
        setShowModal(false);
        setAccessVerified(false);
        setTimeout(() => navigate('/'), 4000);
      } else {
        alert(response.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const getTimeRemaining = () => {
    if (!expiresAt) return '';
    const diff = expiresAt - new Date();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  // ─── Render States ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-2">Your consultation has been booked successfully.</p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-left space-y-1.5">
            <p className="text-sm text-green-800">📅 <strong>{formatDate(selectedDay)}</strong></p>
            <p className="text-sm text-green-800">🕐 <strong>{formatSlotTime(selectedSlot.start)} – {formatSlotTime(selectedSlot.end)}</strong></p>
            <p className="text-sm text-green-800">📋 Mode: <strong>{formData.mode === 'online' ? 'Online' : 'Face-to-Face'}</strong></p>
            <p className="text-sm text-green-800">🎫 Report: <strong>{ticketNumber}</strong></p>
          </div>
          <p className="text-xs text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (!accessVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Access</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // ─── Main Calendar View ──────────────────────────────────────
  const { days: monthDays, startDayOfWeek } = getMonthDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-7 h-7 text-blue-600" />
                Book Your Consultation
              </h1>
              {ticketNumber && (
                <p className="text-sm text-gray-500 mt-1">
                  Report: <span className="font-semibold text-blue-600">{ticketNumber}</span>
                </p>
              )}
              <p className="text-gray-600 mt-2 text-sm">
                Select an available time slot to book your consultation. You can only book ONE appointment per report.
              </p>
            </div>
            {expiresAt && (
              <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl flex items-center gap-2 flex-shrink-0">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800 font-semibold text-sm">{getTimeRemaining()}</span>
              </div>
            )}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-4">
            <p className="text-sm text-blue-800">
              ℹ️ You can rebook if your previous booking for this report was <strong>cancelled or completed</strong>.
            </p>
          </div>
        </div>

        {/* ── Calendar + Slots ──────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar Grid */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => handleMonthChange(-1)} className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="text-lg font-bold text-gray-900">{monthLabel}</h3>
              <button onClick={() => handleMonthChange(1)} className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1.5">{d}</div>
              ))}
            </div>

            {slotsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`e-${i}`} className="min-h-[70px]" />
                ))}

                {monthDays.map((day) => {
                  const ds = toDateStr(day);
                  const past = isPast(day);
                  const weekend = isWeekend(day);
                  const holiday = isHoliday(ds);
                  const today = isTodayFn(day);
                  const selected = selectedDay === ds;
                  const ac = availCount(ds);
                  const disabled = past || weekend || !!holiday;

                  return (
                    <button
                      key={ds}
                      onClick={() => {
                        if (!disabled && ac > 0) {
                          setSelectedDay(selected ? null : ds);
                          setSelectedSlot(null);
                        }
                      }}
                      disabled={disabled || ac === 0}
                      className={`relative p-1.5 rounded-xl text-center transition-all min-h-[70px] flex flex-col items-center justify-start ${
                        disabled
                          ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          : selected
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-lg shadow-blue-200'
                            : ac > 0
                              ? 'bg-white hover:bg-blue-50 text-gray-700 border border-gray-200 hover:border-blue-300 cursor-pointer'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${today && !selected ? 'text-blue-600' : ''}`}>{day.getDate()}</span>

                      {holiday && (
                        <span className="text-[9px] text-red-400 mt-0.5 leading-tight truncate w-full px-0.5">
                          {holiday.title}
                        </span>
                      )}

                      {!disabled && ac > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full mt-1 font-medium ${
                          selected ? 'bg-white/30 text-white' : 'bg-green-100 text-green-700'
                        }`}>
                          {ac} slot{ac !== 1 ? 's' : ''}
                        </span>
                      )}

                      {!disabled && ac === 0 && !weekend && !holiday && (
                        <span className="text-[10px] text-gray-400 mt-1">No slots</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-100 rounded-full border border-green-300" /> Available</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-100 rounded-full border border-gray-300" /> Unavailable</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-600 rounded-full" /> Selected</div>
            </div>
          </div>

          {/* ── Slot Panel ─────────────────────────────────── */}
          <div className="lg:w-96 flex-shrink-0">
            {selectedDay ? (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 text-lg">{formatDate(selectedDay)}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {availCount(selectedDay)} available time slot{availCount(selectedDay) !== 1 ? 's' : ''}
                  </p>
                </div>

                {slotConfig && (
                  <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    {formatSlotTime(slotConfig.lunchStart)} – {formatSlotTime(slotConfig.lunchEnd)} Lunch Break
                  </div>
                )}

                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {(daySlots[selectedDay] || []).length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No available slots for this day</p>
                    </div>
                  ) : (
                    (daySlots[selectedDay] || []).map((slot, idx) => {
                      const isSelected = selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectSlot(slot)}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left group ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-green-100 text-green-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                          }`}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                              {formatSlotTime(slot.start)} – {formatSlotTime(slot.end)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {timeToMin(slot.end) - timeToMin(slot.start)} minutes
                            </p>
                          </div>
                          <div className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-green-100 text-green-700'
                          }`}>
                            {isSelected ? 'Selected' : 'Available'}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-gray-700 font-semibold">Select a Date</p>
                <p className="text-sm text-gray-400 mt-2">Click on an available date in the calendar to view time slots</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Booking Confirmation Modal ─────────────────────── */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Confirm Booking</h2>
                <button
                  onClick={() => { setShowModal(false); setSelectedSlot(null); }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 space-y-2">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{formatDate(selectedDay)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {formatSlotTime(selectedSlot.start)} – {formatSlotTime(selectedSlot.end)}
                    <span className="text-blue-600 ml-2">({timeToMin(selectedSlot.end) - timeToMin(selectedSlot.start)} min)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <span className="text-base">🎫</span>
                  <span>Report: <strong>{ticketNumber}</strong></span>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, mode: 'online' })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      formData.mode === 'online'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-xl mb-1 block">💻</span>
                    <span className="text-sm font-medium">Online</span>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, mode: 'face_to_face' })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      formData.mode === 'face_to_face'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-xl mb-1 block">🏢</span>
                    <span className="text-sm font-medium">Face-to-Face</span>
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
                <p className="text-xs text-amber-800">
                  ⚠️ You can only book ONE consultation per report. You can rebook if this booking is cancelled or completed.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowModal(false); setSelectedSlot(null); }}
                  disabled={booking}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={booking}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</>
                  ) : (
                    '✅ Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
