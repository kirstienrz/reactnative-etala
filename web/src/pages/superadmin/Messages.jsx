import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, Paperclip, Clock, X, ChevronLeft, ChevronRight, Calendar, AlertCircle, CheckCircle, Mail, Search, Trash2, PlusCircle, Copy, Undo2 } from 'lucide-react';
import {
  getAllTickets,
  getTicketMessages,
  sendTicketMessage,
  markMessagesAsRead,
  markTicketAsUnread,
} from '../../api/tickets';
import socketService from '../../api/socket';
import { sendBookingLinkEmail } from '../../api/calendar';
import { getAdminAvailability, setAdminAvailabilityBulk } from '../../api/adminAvailability';
import { getAllCalendarEvents } from '../../api/calendar';
import {
  addMonths, format, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, isBefore, startOfDay, isToday,
} from 'date-fns';
import { useDispatch } from 'react-redux';
import { setUnreadMessageCount } from '../../store/uiSlice';

// ─── Confirmation Modal ───────────────────────────────────────────────────────
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'Confirm', cancelText = 'Cancel', isLoading = false }) => {
  if (!isOpen) return null;
  const icons = {
    info: <AlertCircle className="w-12 h-12 text-blue-500" />,
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    warning: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    error: <AlertCircle className="w-12 h-12 text-red-500" />,
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            {icons[type]}
            <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{title}</h3>
            <p className="text-gray-600 whitespace-pre-line">{message}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium">
              {cancelText}
            </button>
            <button onClick={onConfirm} disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Identity Disclosure Modal ────────────────────────────────────────────────
const IdentityDisclosureModal = ({ isOpen, onClose, ticketNumber }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-fadeIn">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">User Must Disclose Identity First</h3>
            <p className="text-gray-600 mb-4">This user is currently anonymous and cannot book appointments until they disclose their identity.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left w-full">
              <p className="text-sm text-gray-700 mb-2"><strong>User needs to:</strong></p>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Go to <strong>My Reports</strong> page</li>
                <li>Find ticket: <strong>{ticketNumber}</strong></li>
                <li>Click <strong>View Details</strong></li>
                <li>Click <strong>Disclose Identity</strong></li>
                <li>Fill in their personal information</li>
              </ol>
            </div>
          </div>
          <button onClick={onClose} className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">Got it</button>
        </div>
      </div>
    </div>
  );
};

// ─── Calendar Reminder Modal ──────────────────────────────────────────────────
const CalendarReminderModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-fadeIn">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-yellow-100 rounded-full p-4 mb-4">
              <Calendar className="w-12 h-12 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Update Your Calendar First</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left w-full">
              <p className="text-sm font-semibold text-gray-900 mb-2">⚠️ Important Reminder:</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Check if there are any new events or meetings</li>
                <li>• Update your calendar with blocked time slots</li>
                <li>• Mark any unavailable dates or times</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">Cancel</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">Calendar is Updated, Proceed</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Availability Picker Modal ────────────────────────────────────────────────
const AvailabilityPickerModal = ({ isOpen, onClose, onConfirm, adminId }) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [slotDuration, setSlotDuration] = useState(60);
  const [customDuration, setCustomDuration] = useState('60');
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('17:00');
  const [lunchStart, setLunchStart] = useState('12:00');
  const [lunchEnd, setLunchEnd] = useState('13:00');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [daySlots, setDaySlots] = useState({});
  const [customizedDays, setCustomizedDays] = useState(new Set());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');
  const [copyUndoSnapshot, setCopyUndoSnapshot] = useState(null);

  const durationPresets = [{ label: '30m', value: 30 }, { label: '1h', value: 60 }, { label: '1.5h', value: 90 }, { label: '2h', value: 120 }];
  const timeToMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
  const minToTime = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const sortSlots = (slots) => [...slots].sort((a, b) => timeToMin(a.start) - timeToMin(b.start));

  const generateSlots = (duration, wStart, wEnd, lStart, lEnd) => {
    const slots = [];
    let current = timeToMin(wStart);
    const endMin = timeToMin(wEnd), ls = timeToMin(lStart), le = timeToMin(lEnd);
    while (current + duration <= endMin) {
      const slotEnd = current + duration;
      if (current < le && slotEnd > ls) { current = current < ls ? le : le; continue; }
      slots.push({ start: minToTime(current), end: minToTime(slotEnd), available: true, booked: false, custom: false });
      current = slotEnd;
    }
    return slots;
  };

  const getOverlappingEvent = (dateStr, slotStart, slotEnd, events) => {
    const ss = timeToMin(slotStart), se = timeToMin(slotEnd);
    for (const evt of events) {
      if (evt.type === 'consultation') continue;
      const evtStart = new Date(evt.start), evtEnd = new Date(evt.end);
      const evtDateStr = format(evtStart, 'yyyy-MM-dd'), evtEndDateStr = format(evtEnd, 'yyyy-MM-dd');
      if (evt.allDay) { if (dateStr >= evtDateStr && dateStr <= evtEndDateStr) return evt; continue; }
      if (evtDateStr === dateStr) {
        const esm = evtStart.getHours() * 60 + evtStart.getMinutes(), eem = evtEnd.getHours() * 60 + evtEnd.getMinutes();
        if (ss < eem && se > esm) return evt;
      }
      if (dateStr > evtDateStr && dateStr < evtEndDateStr) return evt;
    }
    return null;
  };

  const applyEventOverlaps = (slots, dateStr, events) => slots.map(s => {
    const ov = getOverlappingEvent(dateStr, s.start, s.end, events);
    return ov ? { ...s, available: false, booked: true, eventTitle: ov.title || ov.type } : { ...s, eventTitle: s.eventTitle || null };
  });

  useEffect(() => { if (isOpen) { setConfigLoaded(false); setCopyUndoSnapshot(null); } }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchMonth = async () => {
      setLoading(true);
      const monthStr = format(currentMonth, 'yyyy-MM');
      const start = startOfMonth(currentMonth), end = endOfMonth(currentMonth);
      const daysArr = eachDayOfInterval({ start, end });
      let events = [];
      try { const evtRes = await getAllCalendarEvents({ startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') }); events = evtRes.data || []; setCalendarEvents(events); } catch { setCalendarEvents([]); }
      try {
        const res = await getAdminAvailability(adminId, monthStr);
        const fd = res.slotDuration || 60;
        if (res.slotConfig && !configLoaded) {
          setWorkStart(res.slotConfig.workStart || '08:00'); setWorkEnd(res.slotConfig.workEnd || '17:00');
          setLunchStart(res.slotConfig.lunchStart || '12:00'); setLunchEnd(res.slotConfig.lunchEnd || '13:00');
          setSlotDuration(res.slotConfig.slotDuration || fd); setCustomDuration(String(res.slotConfig.slotDuration || fd));
          setConfigLoaded(true);
        } else if (!configLoaded) { setSlotDuration(fd); setCustomDuration(String(fd)); setConfigLoaded(true); }
        const dur = res.slotConfig?.slotDuration || fd, ws = res.slotConfig?.workStart || workStart, we = res.slotConfig?.workEnd || workEnd, ls = res.slotConfig?.lunchStart || lunchStart, le = res.slotConfig?.lunchEnd || lunchEnd;
        const defSlots = generateSlots(dur, ws, we, ls, le);
        const slotsMap = {}, customDaysSet = new Set();
        daysArr.forEach(d => {
          const dateStr = format(d, 'yyyy-MM-dd'), found = res.availabilities?.find(a => a.date === dateStr);
          let slots = found?.slots?.length > 0
            ? found.slots.map(s => ({ start: s.start, end: s.end, available: !s.booked ? (s.available ?? true) : false, booked: !!s.booked, custom: !!s.custom, eventTitle: null }))
            : defSlots.map(s => ({ ...s, eventTitle: null }));
          if (found?.customSlots) customDaysSet.add(dateStr);
          slots = applyEventOverlaps(slots, dateStr, events);
          slotsMap[dateStr] = sortSlots(slots);
        });
        setDaySlots(slotsMap); setCustomizedDays(customDaysSet);
      } catch {
        const defSlots = generateSlots(slotDuration, workStart, workEnd, lunchStart, lunchEnd), slotsMap = {};
        daysArr.forEach(d => { const dateStr = format(d, 'yyyy-MM-dd'); slotsMap[dateStr] = sortSlots(applyEventOverlaps(defSlots.map(s => ({ ...s, eventTitle: null })), dateStr, events)); });
        setDaySlots(slotsMap);
      } finally { setLoading(false); }
    };
    fetchMonth();
  }, [isOpen, currentMonth, adminId]);

  const handleRegenerate = () => {
    const dur = parseInt(customDuration) || 60; setSlotDuration(dur);
    const newSlots = generateSlots(dur, workStart, workEnd, lunchStart, lunchEnd);
    setDaySlots(prev => {
      const updated = { ...prev };
      for (const dateStr of Object.keys(updated)) {
        if (customizedDays.has(dateStr) || updated[dateStr].some(s => s.booked && !s.eventTitle)) continue;
        updated[dateStr] = sortSlots(applyEventOverlaps(newSlots.map(s => ({ ...s, eventTitle: null })), dateStr, calendarEvents));
      }
      return updated;
    });
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const slotConfig = { workStart, workEnd, lunchStart, lunchEnd, slotDuration: parseInt(customDuration) || slotDuration };
      const days = Object.entries(daySlots).map(([date, slots]) => ({ date, customSlots: customizedDays.has(date), slots: slots.map(s => ({ start: s.start, end: s.end, booked: s.booked && !s.eventTitle, available: s.available, custom: !!s.custom })) }));
      await setAdminAvailabilityBulk(adminId, days, slotDuration, slotConfig);
      onConfirm(days, format(currentMonth, 'yyyy-MM')); onClose();
    } catch { alert('Failed to save availability. Please try again.'); } finally { setSaving(false); }
  };

  if (!isOpen) return null;
  const monthStart = startOfMonth(currentMonth), monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart), dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = startOfDay(new Date());
  const formatSlotTime = (time) => { const [h, m] = time.split(':'); const hour = parseInt(h); return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`; };
  const getSlotSummary = (dateStr) => {
    const slots = daySlots[dateStr];
    if (!slots) return { available: 0, booked: 0, unavailable: 0, events: 0, custom: false };
    return { available: slots.filter(s => s.available && !s.booked).length, booked: slots.filter(s => s.booked && !s.eventTitle).length, unavailable: slots.filter(s => !s.available && !s.booked).length, events: slots.filter(s => s.booked && s.eventTitle).length, custom: customizedDays.has(dateStr) };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col animate-fadeIn">
        <div className="flex-shrink-0 p-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">Set Your Availability</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          <div className="flex flex-wrap items-end gap-3 bg-gray-50 rounded-lg p-3">
            {[['Work Start', workStart, setWorkStart], ['Work End', workEnd, setWorkEnd], ['Lunch Start', lunchStart, setLunchStart], ['Lunch End', lunchEnd, setLunchEnd]].map(([label, val, setter]) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type="time" value={val} onChange={e => setter(e.target.value)} className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 w-28" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
              <input type="number" value={customDuration} onChange={e => setCustomDuration(e.target.value)} min="15" max="480" step="5" className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 w-20" />
            </div>
            <div className="flex gap-1">
              {durationPresets.map(opt => (
                <button key={opt.value} onClick={() => setCustomDuration(String(opt.value))} className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${customDuration === String(opt.value) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{opt.label}</button>
              ))}
            </div>
            <button onClick={handleRegenerate} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 font-medium">Apply</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> : (
            <div className="flex flex-col lg:flex-row gap-5">
              <div className="flex-1 min-w-0">
                {copyUndoSnapshot && (
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs text-indigo-700"><span className="font-medium">Copied to {copyUndoSnapshot.affectedDays.length} weekday(s).</span></p>
                    <button onClick={() => { setDaySlots(prev => { const u = { ...prev }; copyUndoSnapshot.affectedDays.forEach(d => { if (copyUndoSnapshot.slots[d]) u[d] = copyUndoSnapshot.slots[d]; }); return u; }); setCustomizedDays(copyUndoSnapshot.customized); setCopyUndoSnapshot(null); }} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 font-medium"><Undo2 className="w-3 h-3" /> Undo All</button>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { setCurrentMonth(prev => addMonths(prev, -1)); setSelectedDay(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                  <h3 className="text-lg font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h3>
                  <button onClick={() => { setCurrentMonth(prev => addMonths(prev, 1)); setSelectedDay(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-1">{dayNames.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={i} />)}
                  {daysInMonth.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd'), isPast = isBefore(day, today) && !isToday(day), isSelected = selectedDay === dateStr, summary = getSlotSummary(dateStr), isWeekend = getDay(day) === 0 || getDay(day) === 6;
                    return (
                      <button key={dateStr} onClick={() => { if (!isPast) { setSelectedDay(isSelected ? null : dateStr); setEditingSlot(null); setShowAddSlot(false); } }} disabled={isPast}
                        className={`relative p-1.5 rounded-lg text-center transition-all min-h-[64px] flex flex-col items-center justify-start ${isPast ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : isSelected ? 'bg-blue-500 text-white ring-2 ring-blue-300' : isWeekend ? 'bg-orange-50 hover:bg-orange-100 text-gray-700' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'}`}>
                        <span className={`text-sm font-semibold ${isToday(day) && !isSelected ? 'text-blue-600' : ''}`}>{format(day, 'd')}</span>
                        {!isPast && (
                          <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                            {summary.custom && <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-600'}`}>✏️</span>}
                            {summary.available > 0 && <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/30 text-white' : 'bg-green-100 text-green-700'}`}>{summary.available}</span>}
                            {summary.booked > 0 && <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/30 text-white' : 'bg-red-100 text-red-600'}`}>{summary.booked}</span>}
                            {summary.events > 0 && <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/30 text-white' : 'bg-purple-100 text-purple-600'}`}>{summary.events}📅</span>}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              {selectedDay && (
                <div className="lg:w-96 flex-shrink-0">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">{format(new Date(selectedDay + 'T00:00:00'), 'EEE, MMM d, yyyy')}</h4>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <button onClick={() => { const slots = daySlots[selectedDay]; const allAvail = slots.filter(s => !s.booked).every(s => s.available); setDaySlots(prev => ({ ...prev, [selectedDay]: prev[selectedDay].map(s => s.booked ? s : { ...s, available: !allAvail }) })); }} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded">Toggle All</button>
                      <button onClick={() => setShowAddSlot(v => !v)} className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 hover:bg-green-50 rounded flex items-center gap-0.5"><PlusCircle className="w-3 h-3" /> Add Slot</button>
                      <button onClick={() => {
                        const sourceSlots = daySlots[selectedDay]; if (!sourceSlots) return;
                        const affectedDays = Object.keys(daySlots).filter(d => { if (d === selectedDay) return false; const dd = new Date(d + 'T00:00:00'); if (isBefore(dd, today) && !isToday(dd)) return false; const dow = getDay(dd); if (dow === 0 || dow === 6) return false; return !daySlots[d].some(s => s.booked && !s.eventTitle); });
                        if (!affectedDays.length) return;
                        const snapshotSlots = {}; affectedDays.forEach(d => { snapshotSlots[d] = daySlots[d].map(s => ({ ...s })); });
                        setCopyUndoSnapshot({ slots: snapshotSlots, customized: new Set(customizedDays), affectedDays });
                        setDaySlots(prev => { const u = { ...prev }; affectedDays.forEach(d => { u[d] = sortSlots(applyEventOverlaps(sourceSlots.map(s => ({ start: s.start, end: s.end, available: s.available, booked: false, custom: s.custom, eventTitle: null })), d, calendarEvents)); }); return u; });
                        setCustomizedDays(prev => { const ns = new Set(prev); affectedDays.forEach(d => ns.add(d)); return ns; });
                      }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 hover:bg-indigo-50 rounded flex items-center gap-0.5"><Copy className="w-3 h-3" /> Copy to Weekdays</button>
                      {customizedDays.has(selectedDay) && (
                        <button onClick={() => {
                          const dur = parseInt(customDuration) || slotDuration;
                          const defSlots = generateSlots(dur, workStart, workEnd, lunchStart, lunchEnd);
                          setDaySlots(prev => ({ ...prev, [selectedDay]: sortSlots(applyEventOverlaps(defSlots.map(s => ({ ...s, eventTitle: null })), selectedDay, calendarEvents)) }));
                          setCustomizedDays(prev => { const ns = new Set(prev); ns.delete(selectedDay); return ns; });
                        }} className="text-xs text-orange-600 hover:text-orange-800 font-medium px-2 py-1 hover:bg-orange-50 rounded">Reset</button>
                      )}
                    </div>
                    {showAddSlot && (
                      <div className="bg-white border border-green-200 rounded-lg p-3 mb-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700">Add Custom Slot</p>
                        <div className="flex items-center gap-2">
                          <div><label className="block text-[10px] text-gray-500">Start</label><input type="time" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)} className="px-2 py-1 text-sm border border-gray-300 rounded w-28" /></div>
                          <div><label className="block text-[10px] text-gray-500">End</label><input type="time" value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)} className="px-2 py-1 text-sm border border-gray-300 rounded w-28" /></div>
                          <button onClick={() => {
                            if (!newSlotStart || !newSlotEnd || timeToMin(newSlotStart) >= timeToMin(newSlotEnd)) { alert('Invalid time range.'); return; }
                            const existing = daySlots[selectedDay] || [];
                            if (existing.some(s => timeToMin(newSlotStart) < timeToMin(s.end) && timeToMin(newSlotEnd) > timeToMin(s.start))) { alert('Overlaps with existing slot.'); return; }
                            const newSlot = { start: newSlotStart, end: newSlotEnd, available: true, booked: false, custom: true, eventTitle: null };
                            const ov = getOverlappingEvent(selectedDay, newSlotStart, newSlotEnd, calendarEvents);
                            if (ov) { newSlot.available = false; newSlot.booked = true; newSlot.eventTitle = ov.title || ov.type; }
                            setDaySlots(prev => ({ ...prev, [selectedDay]: sortSlots([...(prev[selectedDay] || []), newSlot]) }));
                            setCustomizedDays(prev => new Set([...prev, selectedDay]));
                            setNewSlotStart(''); setNewSlotEnd(''); setShowAddSlot(false);
                          }} className="mt-3 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 font-medium">Add</button>
                          <button onClick={() => setShowAddSlot(false)} className="mt-3 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300">Cancel</button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1">
                      {(daySlots[selectedDay] || []).map((slot, idx) => (
                        <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg ${slot.booked && slot.eventTitle ? 'bg-purple-50 border border-purple-200' : slot.booked ? 'bg-red-50 border border-red-200' : slot.available ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'}`}>
                          <input type="checkbox" checked={slot.available} onChange={() => { if (!slot.booked) setDaySlots(prev => { const u = { ...prev }, sl = [...u[selectedDay]]; sl[idx] = { ...sl[idx], available: !sl[idx].available }; u[selectedDay] = sl; return u; }); }} disabled={slot.booked} className="w-4 h-4 rounded border-gray-300 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              {editingSlot?.idx === idx && editingSlot?.field === 'start'
                                ? <input type="time" value={editingSlot.value} onChange={e => setEditingSlot(p => ({ ...p, value: e.target.value }))} onBlur={() => setEditingSlot(null)} autoFocus className="w-24 px-1 py-0.5 text-xs border border-blue-400 rounded" />
                                : <button onClick={() => { if (!(slot.booked && !slot.eventTitle)) setEditingSlot({ idx, field: 'start', value: slot.start }); }} className={`text-sm font-medium ${slot.booked && !slot.eventTitle ? 'cursor-not-allowed text-red-600' : 'cursor-pointer hover:underline text-gray-900'}`}>{formatSlotTime(slot.start)}</button>}
                              <span className="text-xs text-gray-400">–</span>
                              {editingSlot?.idx === idx && editingSlot?.field === 'end'
                                ? <input type="time" value={editingSlot.value} onChange={e => setEditingSlot(p => ({ ...p, value: e.target.value }))} onBlur={() => setEditingSlot(null)} autoFocus className="w-24 px-1 py-0.5 text-xs border border-blue-400 rounded" />
                                : <button onClick={() => { if (!(slot.booked && !slot.eventTitle)) setEditingSlot({ idx, field: 'end', value: slot.end }); }} className={`text-sm font-medium ${slot.booked && !slot.eventTitle ? 'cursor-not-allowed text-red-600' : 'cursor-pointer hover:underline text-gray-900'}`}>{formatSlotTime(slot.end)}</button>}
                            </div>
                            {slot.eventTitle && <p className="text-xs text-purple-600 mt-0.5 truncate">📅 {slot.eventTitle}</p>}
                          </div>
                          <button onClick={() => { if (slot.booked && !slot.eventTitle) return; setDaySlots(prev => { const u = { ...prev }, sl = [...u[selectedDay]]; sl.splice(idx, 1); u[selectedDay] = sl; return u; }); setCustomizedDays(prev => new Set([...prev, selectedDay])); }} disabled={slot.booked && !slot.eventTitle} className={`p-1 rounded flex-shrink-0 ${slot.booked && !slot.eventTitle ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />{formatSlotTime(lunchStart)} – {formatSlotTime(lunchEnd)} Lunch Break
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 border-t border-gray-200 p-4 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm">Cancel</button>
          <button onClick={handleConfirm} disabled={saving} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium text-sm flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Confirm & Send Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TicketMessagingSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showTicketList, setShowTicketList] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showCalendarReminder, setShowCalendarReminder] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info', onConfirm: () => {} });

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedTicketRef = useRef(null);

  const [unreadTickets, setUnreadTickets] = useState(new Set());
  const manuallyUnreadRef = useRef(new Set());
  const openingTicketRef = useRef(new Set());

  const dispatch = useDispatch();

  const addUnread = useCallback((ticketNumber) => {
    setUnreadTickets(prev => {
      if (prev.has(ticketNumber)) return prev;
      const next = new Set(prev);
      next.add(ticketNumber);
      return next;
    });
  }, []);

  const removeUnread = useCallback((ticketNumber) => {
    setUnreadTickets(prev => {
      if (!prev.has(ticketNumber)) return prev;
      const next = new Set(prev);
      next.delete(ticketNumber);
      return next;
    });
  }, []);

  const addUnreadRef = useRef(addUnread);
  const removeUnreadRef = useRef(removeUnread);
  useEffect(() => { addUnreadRef.current = addUnread; }, [addUnread]);
  useEffect(() => { removeUnreadRef.current = removeUnread; }, [removeUnread]);

  const isUnread = useCallback((ticketNumber) => unreadTickets.has(ticketNumber), [unreadTickets]);
  const unreadCount = unreadTickets.size;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { selectedTicketRef.current = selectedTicket; }, [selectedTicket]);

  useEffect(() => {
    socketService.connect();
    setTimeout(() => socketService.joinAdminRoom(), 100);

    socketService.onNewMessage(({ message, ticket }) => {
      const current = selectedTicketRef.current;
      const isViewingThisChat = current?.ticketNumber === message.ticketNumber;

      if (isViewingThisChat) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        if (message.sender === 'user') {
          markMessagesAsRead(message.ticketNumber).catch(() => {});
          removeUnreadRef.current(message.ticketNumber);
          manuallyUnreadRef.current.delete(message.ticketNumber);
        }
      } else if (message.sender === 'user') {
        addUnreadRef.current(ticket.ticketNumber);
      }

      setTickets(prev =>
        [...prev.map(t => t.ticketNumber === ticket.ticketNumber ? { ...t, ...ticket } : t)]
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    socketService.onMessagesRead(({ ticketNumber, readBy }) => {
      if (readBy === 'user') {
        if (selectedTicketRef.current?.ticketNumber === ticketNumber) {
          setMessages(prev => prev.map(msg =>
            msg.sender === 'superadmin' ? { ...msg, isRead: true } : msg
          ));
        }
        return;
      }

      if (readBy === 'superadmin') {
        if (selectedTicketRef.current?.ticketNumber === ticketNumber) {
          setMessages(prev => prev.map(msg =>
            msg.sender === 'user' ? { ...msg, isRead: true } : msg
          ));
        }
        if (!manuallyUnreadRef.current.has(ticketNumber)) {
          removeUnreadRef.current(ticketNumber);
        }
      }
    });

    socketService.onTicketUpdated((updatedTicket) => {
      setTickets(prev =>
        [...prev.map(t => t.ticketNumber === updatedTicket.ticketNumber ? updatedTicket : t)]
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
      if (selectedTicketRef.current?.ticketNumber === updatedTicket.ticketNumber) {
        setSelectedTicket(updatedTicket);
      }

      const serverSaysUnread =
        updatedTicket.hasUnreadMessages === true ||
        (updatedTicket.unreadCount?.superadmin > 0);

      if (serverSaysUnread) {
        if (
          selectedTicketRef.current?.ticketNumber !== updatedTicket.ticketNumber &&
          !openingTicketRef.current.has(updatedTicket.ticketNumber)
        ) {
          addUnreadRef.current(updatedTicket.ticketNumber);
        }
      } else {
        if (!manuallyUnreadRef.current.has(updatedTicket.ticketNumber)) {
          removeUnreadRef.current(updatedTicket.ticketNumber);
        }
      }
    });

    socketService.onTicketClosed(({ ticket, message }) => {
      if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
        setSelectedTicket(ticket);
        setMessages(prev => [...prev, message]);
      }
      setTickets(prev => prev.map(t => t.ticketNumber === ticket.ticketNumber ? ticket : t));
    });

    socketService.onTicketReopened(({ ticket, message }) => {
      if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
        setSelectedTicket(ticket);
        setMessages(prev => [...prev, message]);
      }
      setTickets(prev => prev.map(t => t.ticketNumber === ticket.ticketNumber ? ticket : t));
    });

    socketService.onUserTyping(({ userName, isTyping }) => {
      if (isTyping) {
        setTypingUser(userName);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketService.off('new-message');
      socketService.off('messages-read');
      socketService.off('ticket-updated');
      socketService.off('ticket-closed');
      socketService.off('ticket-reopened');
      socketService.off('user-typing');
    };
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      socketService.joinTicket(selectedTicket.ticketNumber);
      return () => socketService.leaveTicket(selectedTicket.ticketNumber);
    }
  }, [selectedTicket]);

  useEffect(() => { loadTickets(); }, []);

  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.selectedTicketNumber && tickets.length > 0) {
      const t = tickets.find(t => t.ticketNumber === state.selectedTicketNumber);
      if (t) handleSelectTicket(t);
      window.history.replaceState({}, document.title);
    }
  }, [tickets]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getAllTickets({ sortBy: 'lastMessageAt' });
      setTickets(data);
      const serverUnreadSet = new Set();
      data.forEach(t => {
        const serverSaysUnread = t.hasUnreadMessages === true || (t.unreadCount?.superadmin > 0);
        if (serverSaysUnread) serverUnreadSet.add(t.ticketNumber);
      });
      setUnreadTickets(serverUnreadSet);
      manuallyUnreadRef.current = new Set();
    } catch {
      showModal({ title: 'Error', message: 'Failed to load tickets. Please try again.', type: 'error', onConfirm: () => setShowConfirmModal(false) });
    } finally { setLoading(false); }
  };

  const loadMessages = async (ticketNumber) => {
    setLoading(true);
    try { const data = await getTicketMessages(ticketNumber, { limit: 50 }); setMessages(data); }
    catch { console.error('Error loading messages'); }
    finally { setLoading(false); }
  };

  const handleSelectTicket = async (ticket) => {
    openingTicketRef.current.add(ticket.ticketNumber);
    selectedTicketRef.current = ticket;

    setSelectedTicket(ticket);
    setShowTicketList(false);

    removeUnread(ticket.ticketNumber);
    setTickets(prev => prev.map(t =>
      t.ticketNumber === ticket.ticketNumber
        ? { ...t, hasUnreadMessages: false, unreadCount: { ...t.unreadCount, superadmin: 0 } }
        : t
    ));

    markMessagesAsRead(ticket.ticketNumber).catch(() => {});

    setTimeout(() => {
      openingTicketRef.current.delete(ticket.ticketNumber);
    }, 3000);

    await loadMessages(ticket.ticketNumber);
  };

  const handleMarkAsUnread = async (ticketNumber) => {
    manuallyUnreadRef.current.add(ticketNumber);

    addUnread(ticketNumber);
    setTickets(prev => prev.map(t =>
      t.ticketNumber === ticketNumber
        ? { ...t, hasUnreadMessages: true, unreadCount: { ...t.unreadCount, superadmin: 1 } }
        : t
    ));

    setSelectedTicket(null);
    setShowTicketList(true);

    try {
      await markTicketAsUnread(ticketNumber);
    } catch {
      console.error('Error marking unread');
    }

    setTimeout(() => {
      manuallyUnreadRef.current.delete(ticketNumber);
    }, 5000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSending(true);
    try {
      await sendTicketMessage(selectedTicket.ticketNumber, { content: newMessage.trim(), attachments: [] });
      setNewMessage('');
      socketService.sendTyping(selectedTicket.ticketNumber, 'superadmin', false);
    } catch {
      showModal({ title: 'Error', message: 'Failed to send message. Please try again.', type: 'error', onConfirm: () => setShowConfirmModal(false) });
    } finally { setSending(false); }
  };

  const showModal = (config) => { setModalConfig(config); setShowConfirmModal(true); };

  const handleSendAppointmentLink = () => {
    const report = selectedTicket.reportId;
    // Check kung anonymous at hindi pa nag-disclose
    const isAnonymous = report?.isAnonymous === true;
    const hasDisclosed = report?.personalInfo?.firstName &&
                         report?.personalInfo?.lastName &&
                         report?.personalInfo?.email;
    if (isAnonymous && !hasDisclosed) {
      setShowIdentityModal(true);
      return;
    }
    setShowAvailabilityModal(true);
  };

  const handleCalendarConfirmed = () => {
    setShowCalendarReminder(false);
    const userEmail = selectedTicket.reportId?.personalInfo?.email || 'the user';
    const userName = selectedTicket.displayName || 'User';
    showModal({
      title: 'Send Appointment Booking Link?',
      message: `An email will be sent to the user with a link to book an appointment.\n\nThe user will be able to:\n• View your available time slots\n• Choose their preferred date and time\n• Book the appointment`,
      type: 'info', confirmText: 'Send Link', onConfirm: handleConfirmSendLink,
    });
  };

  const handleConfirmSendLink = async () => {
    try {
      setIsSending(true);
      const ticket = selectedTicket;
      if (!ticket) { alert("❌ No ticket selected"); return; }
      const userId = ticket.userId?._id || ticket.userId;
      const userEmail = ticket.userId?.email || ticket.reportId?.email || ticket.email;
      const userName = ticket.displayName && ticket.displayName !== "Anonymous User" ? ticket.displayName
        : ticket.userId?.firstName ? `${ticket.userId.firstName} ${ticket.userId.lastName}`
        : ticket.reportId?.firstName ? `${ticket.reportId.firstName} ${ticket.reportId.lastName}` : "User";
      const ticketNumber = ticket.reportId?.ticketNumber || ticket.ticketNumber;
      if (!userId || !userEmail || !ticketNumber) { alert("❌ Missing required info."); return; }
      const response = await sendBookingLinkEmail({ userId, userEmail, userName, ticketNumber });
      if (response.success) {
        alert(`✅ Booking link sent!\nLink expires in 24 hours.`);
        setShowConfirmModal(false);
        try { await sendTicketMessage(ticket.ticketNumber, { content: `📅 An appointment booking link has been sent to your email.\n\nPlease check your inbox and book your preferred consultation date.\n\n⏰ Important: The link is valid for 24 hours only.\n\n✅ Once booked, you will receive a confirmation.`, metadata: { type: 'appointment_link' } }); }
        catch { console.error("⚠️ Failed to send chat message"); }
      } else { alert(`❌ ${response.message || "Failed to send booking link"}`); }
    } catch (error) { alert(`❌ Error: ${error.message || "Failed to send booking link"}`); }
    finally { setIsSending(false); }
  };

  useEffect(() => {
    dispatch(setUnreadMessageCount(unreadCount));
  }, [unreadCount]);

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedTicket && e.target.value.trim()) {
      socketService.sendTyping(selectedTicket.ticketNumber, 'superadmin', true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => socketService.sendTyping(selectedTicket.ticketNumber, 'superadmin', false), 2000);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date), now = new Date(), diff = now - d;
    const mins = Math.floor(diff / 60000), hrs = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };
  const formatTime = (ts) => new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const lastAdminIdx = (() => { for (let i = messages.length - 1; i >= 0; i--) { if (messages[i].sender === 'superadmin') return i; } return -1; })();

  const filteredTickets = tickets.filter(ticket => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || ticket.displayName?.toLowerCase().includes(q) || ticket.ticketNumber?.toLowerCase().includes(q) || ticket.reportId?.ticketNumber?.toLowerCase().includes(q);
    const matchFilter = filterStatus === 'all' ? true
      : filterStatus === 'open' ? ticket.status === 'Open'
      : filterStatus === 'closed' ? ticket.status === 'Closed'
      : filterStatus === 'unread' ? isUnread(ticket.ticketNumber)
      : true;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <ConfirmationModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} confirmText={modalConfig.confirmText} cancelText={modalConfig.cancelText} isLoading={sending} />
      <IdentityDisclosureModal isOpen={showIdentityModal} onClose={() => setShowIdentityModal(false)} ticketNumber={selectedTicket?.reportId?.ticketNumber || selectedTicket?.ticketNumber} />
      <CalendarReminderModal isOpen={showCalendarReminder} onClose={() => setShowCalendarReminder(false)} onConfirm={handleCalendarConfirmed} />
      <AvailabilityPickerModal isOpen={showAvailabilityModal} onClose={() => setShowAvailabilityModal(false)} onConfirm={handleCalendarConfirmed} adminId={selectedTicket?.adminId || 'me'} />

      <div className="flex bg-white" style={{ height: '100%', overflow: 'hidden' }}>

        {/* ── Sidebar ── */}
        <div className={`${showTicketList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-96 border-r border-gray-200 bg-white`} style={{ height: '100%', minHeight: 0 }}>
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              {/* ── Header: pulsing badge REMOVED, plain unread count text lang ── */}
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              </div>
              <button onClick={() => setShowTicketList(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {['all', 'unread', 'open', 'closed'].map(filter => (
                <button key={filter} onClick={() => setFilterStatus(filter)}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === filter ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  {filter === 'unread' && unreadCount > 0 && (
                    <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${filterStatus === 'unread' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {loading ? (
              <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">{searchQuery || filterStatus !== 'all' ? 'No tickets match your search' : 'No tickets found'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTickets.map(ticket => {
                  const ticketUnread = isUnread(ticket.ticketNumber);
                  const isSelected = selectedTicket?.ticketNumber === ticket.ticketNumber;

                  return (
                    <button key={ticket._id} onClick={() => handleSelectTicket(ticket)}
                      className={`w-full p-4 text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : ticketUnread
                          ? 'bg-red-50/40 hover:bg-red-50/70 border-l-4 border-red-400'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}>
                      <div className="flex items-start gap-3">
                        {/* ── Avatar: UnreadDot REMOVED, color change lang ang indicator ── */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg transition-colors duration-200 ${ticketUnread ? 'bg-blue-500' : 'bg-gray-400'}`}>
                            {ticket.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-sm truncate transition-all duration-150 ${ticketUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {ticket.displayName || 'Anonymous User'}
                            </span>
                            <span className={`text-xs ml-2 flex-shrink-0 transition-colors duration-150 ${ticketUnread ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                              {formatDate(ticket.lastMessageAt)}
                            </span>
                          </div>
                          <p className={`text-xs mb-1.5 transition-colors duration-150 ${ticketUnread ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                            {ticket.reportId?.ticketNumber || ticket.ticketNumber}
                          </p>
                          <div className="flex items-center justify-between">
                            {ticket.reportId?.caseStatus && (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {ticket.reportId.caseStatus}
                              </span>
                            )}
                            {ticketUnread && !isSelected && (
                              <span className="ml-auto flex items-center gap-1 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping inline-block" />
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className={`${showTicketList ? 'hidden md:flex' : 'flex'} flex-col flex-1`} style={{ height: '100%', minHeight: 0 }}>
          {selectedTicket ? (
            <>
              <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowTicketList(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {selectedTicket.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedTicket.displayName || 'Anonymous User'}</h3>
                      <p className="text-xs text-gray-500">{selectedTicket.reportId?.ticketNumber || selectedTicket.ticketNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleSendAppointmentLink} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all text-sm font-medium">
                      <Calendar className="w-4 h-4" />Book Appointment
                    </button>
                    <button onClick={() => handleMarkAsUnread(selectedTicket.ticketNumber)} title="Mark as unread"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700">
                      <Mail className="w-4 h-4" />
                    </button>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedTicket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ minHeight: 0 }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4"><Mail className="w-8 h-8 text-gray-400" /></div>
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((msg, idx) => {
                      const isAdmin = msg.sender === 'superadmin', isLast = isAdmin && idx === lastAdminIdx, isAppt = msg.metadata?.type === 'appointment_link';
                      return (
                        <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md rounded-2xl p-3 ${isAppt ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg' : isAdmin ? 'bg-blue-500' : 'bg-white shadow-sm'}`}>
                            {isAppt && <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/30"><Calendar className="w-4 h-4 text-white" /><span className="text-xs font-semibold text-white">Appointment Booking</span></div>}
                            <p className={`text-sm whitespace-pre-line ${isAppt || isAdmin ? 'text-white' : 'text-gray-900'}`}>{msg.content}</p>
                            {msg.attachments?.length > 0 && <div className="mt-2 flex items-center gap-1 text-xs opacity-80 text-white"><Paperclip className="w-3 h-3" />{msg.attachments.length} attachment(s)</div>}
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className={`text-xs ${isAppt || isAdmin ? 'text-white/70' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</span>
                              {isAdmin && isLast && msg.isRead && <span className="text-xs text-blue-200">✓ Read</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {typingUser && (
                      <div className="flex justify-start">
                        <div className="bg-white shadow-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 0.2, 0.4].map(d => <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />)}
                          </div>
                          <span className="text-xs text-gray-500">{typingUser} is typing</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {selectedTicket.status === 'Open' && (
                <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
                  <button onClick={handleSendAppointmentLink} className="sm:hidden w-full mb-3 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4" />Send Booking Link
                  </button>
                  <div className="flex gap-3 items-end max-w-4xl mx-auto">
                    <div className="flex-1">
                      <textarea value={newMessage} onChange={handleTyping} onKeyPress={handleKeyPress} placeholder="Type a message..." rows="1" disabled={sending}
                        className="w-full px-4 py-3 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        style={{ minHeight: '44px', maxHeight: '120px', overflowY: 'auto' }} />
                    </div>
                    <button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}
                      className="flex-shrink-0 w-11 h-11 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center">
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6"><Mail className="w-12 h-12 text-gray-400" /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Conversation Selected</h3>
              <p className="text-sm text-gray-500 mb-6">Choose a ticket to start messaging</p>
              <button onClick={() => setShowTicketList(true)} className="md:hidden px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">View Tickets</button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default TicketMessagingSystem;