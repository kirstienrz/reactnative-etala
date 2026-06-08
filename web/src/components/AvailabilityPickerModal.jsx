import React, { useState, useEffect } from 'react';
import {
  X, Info, Clock, PlusCircle, Copy, Undo2, ChevronLeft, ChevronRight, Trash2, Loader2, Calendar, Sun, Sunset
} from 'lucide-react';
import {
  addMonths, format, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, isBefore, startOfDay, isToday,
} from 'date-fns';
import { getAdminAvailability, setAdminAvailabilityBulk } from '../api/adminAvailability';
import { getAllCalendarEvents } from '../api/calendar';

const AvailabilityPickerModal = ({ isOpen, onClose, onConfirm, adminId, confirmText = 'Confirm & Send Link' }) => {
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
  const [showInfo, setShowInfo] = useState(false);

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
        const dur = configLoaded ? (parseInt(customDuration) || slotDuration) : (res.slotConfig?.slotDuration || fd);
        const ws = configLoaded ? workStart : (res.slotConfig?.workStart || '08:00');
        const we = configLoaded ? workEnd : (res.slotConfig?.workEnd || '17:00');
        const ls = configLoaded ? lunchStart : (res.slotConfig?.lunchStart || '12:00');
        const le = configLoaded ? lunchEnd : (res.slotConfig?.lunchEnd || '13:00');
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

  const formatSlotTime = (time) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const getSlotSummary = (dateStr) => {
    const slots = daySlots[dateStr];
    if (!slots) return { available: 0, booked: 0, unavailable: 0, events: 0, total: 0, custom: false };
    return {
      available: slots.filter(s => s.available && !s.booked).length,
      booked: slots.filter(s => s.booked && !s.eventTitle).length,
      unavailable: slots.filter(s => !s.available && !s.booked).length,
      events: slots.filter(s => s.booked && s.eventTitle).length,
      total: slots.length,
      custom: customizedDays.has(dateStr)
    };
  };

  const renderSlotItem = (slot, idx) => {
    let cardClass = "";
    let pillClass = "";
    let pillText = "";
    
    if (slot.booked && slot.eventTitle) {
      cardClass = "bg-white border-zinc-200 text-zinc-800 shadow-sm";
      pillClass = "bg-purple-50 text-purple-750 border-purple-100";
      pillText = "Event";
    } else if (slot.booked) {
      cardClass = "bg-white border-zinc-200 text-zinc-805 shadow-sm";
      pillClass = "bg-rose-50 text-rose-750 border-rose-100";
      pillText = "Booked";
    } else if (slot.available) {
      cardClass = "bg-white border-zinc-200 text-zinc-805 shadow-sm hover:border-zinc-350";
      pillClass = "bg-emerald-50 text-emerald-750 border-emerald-100";
      pillText = "Available";
    } else {
      cardClass = "bg-zinc-50 border-zinc-150 text-zinc-400";
      pillClass = "bg-zinc-100 text-zinc-500 border-zinc-200";
      pillText = "Blocked";
    }

    return (
      <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${cardClass}`}>
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            checked={slot.available}
            disabled={slot.booked}
            onChange={() => {
              if (!slot.booked) {
                setDaySlots(prev => {
                  const u = { ...prev };
                  const sl = [...u[selectedDay]];
                  sl[idx] = { ...sl[idx], available: !sl[idx].available };
                  u[selectedDay] = sl;
                  return u;
                });
                setCustomizedDays(prev => new Set([...prev, selectedDay]));
              }
            }}
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {editingSlot?.idx === idx && editingSlot?.field === 'start' ? (
                <input
                  type="time"
                  value={editingSlot.value}
                  onChange={e => setEditingSlot(p => ({ ...p, value: e.target.value }))}
                  onBlur={() => {
                    if (editingSlot.value) {
                      setDaySlots(prev => {
                        const u = { ...prev };
                        const sl = [...u[selectedDay]];
                        sl[idx] = { ...sl[idx], start: editingSlot.value };
                        u[selectedDay] = sortSlots(sl);
                        return u;
                      });
                      setCustomizedDays(prev => new Set([...prev, selectedDay]));
                    }
                    setEditingSlot(null);
                  }}
                  autoFocus
                  className="w-20 px-1.5 py-0.5 text-xs border border-zinc-300 rounded bg-white text-zinc-900"
                />
              ) : (
                <button
                  onClick={() => { if (!slot.booked) setEditingSlot({ idx, field: 'start', value: slot.start }); }}
                  className={`text-sm font-semibold hover:underline ${slot.booked ? 'cursor-not-allowed text-zinc-400' : 'cursor-pointer text-zinc-900'}`}
                >
                  {formatSlotTime(slot.start)}
                </button>
              )}
              <span className="text-xs text-zinc-450 font-normal">—</span>
              {editingSlot?.idx === idx && editingSlot?.field === 'end' ? (
                <input
                  type="time"
                  value={editingSlot.value}
                  onChange={e => setEditingSlot(p => ({ ...p, value: e.target.value }))}
                  onBlur={() => {
                    if (editingSlot.value) {
                      setDaySlots(prev => {
                        const u = { ...prev };
                        const sl = [...u[selectedDay]];
                        sl[idx] = { ...sl[idx], end: editingSlot.value };
                        u[selectedDay] = sortSlots(sl);
                        return u;
                      });
                      setCustomizedDays(prev => new Set([...prev, selectedDay]));
                    }
                    setEditingSlot(null);
                  }}
                  autoFocus
                  className="w-20 px-1.5 py-0.5 text-xs border border-zinc-300 rounded bg-white text-zinc-900"
                />
              ) : (
                <button
                  onClick={() => { if (!slot.booked) setEditingSlot({ idx, field: 'end', value: slot.end }); }}
                  className={`text-sm font-semibold hover:underline ${slot.booked ? 'cursor-not-allowed text-zinc-400' : 'cursor-pointer text-zinc-900'}`}
                >
                  {formatSlotTime(slot.end)}
                </button>
              )}
            </div>
            {slot.eventTitle && (
              <p className="text-[11px] font-semibold text-purple-700 mt-1 flex items-center gap-1.5 truncate max-w-[180px]" title={slot.eventTitle}>
                <Calendar className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" /> {slot.eventTitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pillClass}`}>
            {pillText}
          </span>
          <button
            onClick={() => {
              if (slot.booked && !slot.eventTitle) return;
              setDaySlots(prev => {
                const u = { ...prev };
                const sl = [...u[selectedDay]];
                sl.splice(idx, 1);
                u[selectedDay] = sl;
                return u;
              });
              setCustomizedDays(prev => new Set([...prev, selectedDay]));
            }}
            disabled={slot.booked && !slot.eventTitle}
            className={`p-1.5 rounded-lg transition-colors ${
              slot.booked && !slot.eventTitle
                ? 'text-zinc-200 cursor-not-allowed'
                : 'text-zinc-450 hover:text-red-500 hover:bg-red-50'
            }`}
            title="Delete Slot"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const selectedDaySlots = daySlots[selectedDay] || [];
  const morningSlots = selectedDaySlots.map((s, idx) => ({ ...s, idx })).filter(s => {
    const [h] = s.start.split(':').map(Number);
    return h < 12;
  });
  const afternoonSlots = selectedDaySlots.map((s, idx) => ({ ...s, idx })).filter(s => {
    const [h] = s.start.split(':').map(Number);
    return h >= 12;
  });

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl xl:max-w-7xl max-h-[92vh] flex flex-col border border-zinc-200 overflow-hidden">
        <div className="flex-shrink-0 px-6 py-4 border-b border-zinc-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Set Availability</h2>
            <button onClick={() => setShowInfo(!showInfo)} className="p-1 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400 hover:text-zinc-650" title="Instructions">
              <Info className="w-4.5 h-4.5" />
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-50 rounded-lg transition-colors text-zinc-400 hover:text-zinc-655"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="flex-1 flex min-h-0 bg-white overflow-hidden">
          {loading ? (
            <div className="flex-grow flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
          ) : (
            <>
              {/* Left Column: Calendar & Settings */}
              <div className="flex-1 min-w-0 p-6 overflow-y-auto flex flex-col gap-5">
                
                {/* Default Working & Lunch Hours */}
                <div className="w-full bg-white border border-zinc-200 rounded-xl p-4 flex flex-col gap-4 flex-shrink-0 shadow-sm animate-fadeIn">
                  {/* Row 1: Default Working & Lunch Hours */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      ['Work Start', workStart, setWorkStart],
                      ['Work End', workEnd, setWorkEnd],
                      ['Lunch Start', lunchStart, setLunchStart],
                      ['Lunch End', lunchEnd, setLunchEnd]
                    ].map(([label, val, setter]) => (
                      <div key={label} className="flex-1 min-w-[120px]">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</label>
                        <input type="time" value={val} onChange={e => setter(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:border-zinc-500 outline-none text-zinc-805 bg-white" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Row 2: Duration & Apply Button */}
                  <div className="flex flex-wrap items-end justify-between gap-4 pt-3.5 border-t border-zinc-150">
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Duration (min)</label>
                        <input type="number" value={customDuration} onChange={e => setCustomDuration(e.target.value)} min="15" max="480" step="5" className="w-24 px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:border-zinc-500 outline-none text-zinc-805 bg-white" />
                      </div>
                      <div className="flex gap-1.5">
                        {durationPresets.map(opt => (
                          <button key={opt.value} onClick={() => setCustomDuration(String(opt.value))} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${customDuration === String(opt.value) ? 'bg-zinc-950 border-zinc-950 text-white' : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-55'}`}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleRegenerate} className="px-5 py-2 bg-zinc-950 text-white text-xs font-bold rounded-lg hover:bg-zinc-850 transition-colors uppercase tracking-wider">Apply Settings</button>
                  </div>
                </div>

                {copyUndoSnapshot && (
                  <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 mb-4 shadow-sm">
                    <p className="text-xs text-zinc-650 font-medium">Copied to {copyUndoSnapshot.affectedDays.length} weekday(s).</p>
                    <button onClick={() => { setDaySlots(prev => { const u = { ...prev }; copyUndoSnapshot.affectedDays.forEach(d => { if (copyUndoSnapshot.slots[d]) u[d] = copyUndoSnapshot.slots[d]; }); return u; }); setCustomizedDays(copyUndoSnapshot.customized); setCopyUndoSnapshot(null); }} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors"><Undo2 className="w-3.5 h-3.5" /> Undo</button>
                  </div>
                )}

                {/* Minimalist Legend (Shaded boxes) */}
                <div className="flex flex-wrap items-center justify-start gap-4 pb-3 mb-4 border-b border-zinc-150 text-[11px] font-semibold text-zinc-500">
                  <span className="font-bold uppercase tracking-wider text-[9px] text-zinc-455 mr-1">Availability:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded border border-emerald-250 bg-emerald-50"></span>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded border border-rose-250 bg-rose-50"></span>
                    <span>Fully Booked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded border border-purple-250 bg-purple-50"></span>
                    <span>Calendar Event</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded border border-zinc-200 bg-zinc-100/60"></span>
                    <span>Blocked</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { setCurrentMonth(prev => addMonths(prev, -1)); setSelectedDay(null); }} className="p-2 hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-150 text-zinc-500"><ChevronLeft className="w-4 h-4" /></button>
                  <h3 className="text-base font-bold text-zinc-900 tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h3>
                  <button onClick={() => { setCurrentMonth(prev => addMonths(prev, 1)); setSelectedDay(null); }} className="p-2 hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-150 text-zinc-500"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-1">{dayNames.map(d => <div key={d} className="text-center text-[10px] font-bold text-zinc-455 uppercase tracking-wider py-1">{d}</div>)}</div>
                
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={i} />)}
                  {daysInMonth.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd'), isPast = isBefore(day, today) && !isToday(day), isSelected = selectedDay === dateStr, summary = getSlotSummary(dateStr);
                    
                    let cellClass = "";
                    let numClass = "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors";
                    let badgeEl = null;
                    
                    if (isPast) {
                      cellClass = "bg-zinc-50/50 text-zinc-300 border-zinc-100 cursor-not-allowed";
                      numClass = "text-sm font-semibold text-zinc-300 w-7 h-7 flex items-center justify-center";
                    } else if (isSelected) {
                      cellClass = "bg-zinc-950 text-white border-zinc-950 shadow-md ring-2 ring-zinc-300 ring-offset-1 animate-pulseFast";
                      numClass = "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full text-white";
                    } else if (summary.total === 0) {
                      cellClass = "bg-zinc-50/65 text-zinc-400 border-zinc-200 hover:bg-zinc-100/70";
                      numClass = "text-sm font-semibold text-zinc-400 w-7 h-7 flex items-center justify-center line-through";
                      badgeEl = <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-200/80 text-zinc-650">CLOSED</span>;
                    } else if (summary.available > 0) {
                      cellClass = "bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border-emerald-200 hover:border-emerald-300 shadow-sm";
                      badgeEl = <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-150/50 text-emerald-800">{summary.available} slots</span>;
                    } else if (summary.booked > 0 || summary.events > 0) {
                      cellClass = "bg-rose-50 hover:bg-rose-100/90 text-rose-900 border-rose-200 hover:border-rose-300 shadow-sm";
                      badgeEl = <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-150/50 text-rose-800">FULL</span>;
                    } else {
                      cellClass = "bg-zinc-100/60 hover:bg-zinc-200/80 text-zinc-500 border-zinc-205 hover:border-zinc-300 shadow-sm";
                      badgeEl = <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-600">BLOCKED</span>;
                    }

                    return (
                      <button key={dateStr} onClick={() => { if (!isPast) { setSelectedDay(isSelected ? null : dateStr); setEditingSlot(null); setShowAddSlot(false); } }} disabled={isPast}
                        className={`relative p-2 rounded-xl text-center transition-all duration-150 min-h-[72px] flex flex-col items-center justify-between border ${cellClass}`}>
                        <div className="flex items-center justify-between w-full">
                          <span className={numClass}>{format(day, 'd')}</span>
                          {summary.custom && <span className={`text-[8px] font-bold ${isSelected ? 'text-white' : 'text-blue-500'}`} title="Customized">●</span>}
                        </div>
                        <div className="mt-1 w-full flex justify-center">
                          {badgeEl}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Right Column: Slots Sidebar */}
              <div className="w-[420px] flex-shrink-0 border-l border-zinc-200 bg-zinc-50/40 flex flex-col min-h-0">
                {selectedDay ? (
                  <div className="p-6 flex flex-col flex-1 min-h-0">
                    <div className="border-b border-zinc-250 pb-3 mb-4 flex items-center justify-between flex-shrink-0">
                      <div>
                        <h4 className="font-bold text-zinc-900 text-sm tracking-tight">{format(new Date(selectedDay + 'T00:00:00'), 'eeee, MMMM d')}</h4>
                        <p className="text-[11px] text-zinc-450 mt-0.5 font-medium">Configure day slots</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4 flex-shrink-0">
                      <button onClick={() => { const slots = daySlots[selectedDay] || []; const allAvail = slots.filter(s => !s.booked).every(s => s.available); setDaySlots(prev => ({ ...prev, [selectedDay]: (prev[selectedDay] || []).map(s => s.booked ? s : { ...s, available: !allAvail }) })); }} className="text-[11px] text-zinc-700 hover:text-zinc-950 font-bold px-2.5 py-1.5 hover:bg-white border border-zinc-250 rounded-lg transition-colors bg-white shadow-sm">Toggle All</button>
                      <button onClick={() => setShowAddSlot(v => !v)} className="text-[11px] text-zinc-700 hover:text-zinc-950 font-bold px-2.5 py-1.5 hover:bg-white border border-zinc-250 rounded-lg transition-colors bg-white shadow-sm flex items-center gap-1"><PlusCircle className="w-3.5 h-3.5" /> Add Slot</button>
                      <button onClick={() => {
                        const sourceSlots = daySlots[selectedDay]; if (!sourceSlots) return;
                        const affectedDays = Object.keys(daySlots).filter(d => { if (d === selectedDay) return false; const dd = new Date(d + 'T00:00:00'); if (isBefore(dd, today) && !isToday(dd)) return false; const dow = getDay(dd); if (dow === 0 || dow === 6) return false; return !daySlots[d].some(s => s.booked && !s.eventTitle); });
                        if (!affectedDays.length) return;
                        const snapshotSlots = {}; affectedDays.forEach(d => { snapshotSlots[d] = daySlots[d].map(s => ({ ...s })); });
                        setCopyUndoSnapshot({ slots: snapshotSlots, customized: new Set(customizedDays), affectedDays });
                        setDaySlots(prev => { const u = { ...prev }; affectedDays.forEach(d => { u[d] = sortSlots(applyEventOverlaps(sourceSlots.map(s => ({ start: s.start, end: s.end, available: s.available, booked: false, custom: s.custom, eventTitle: null })), d, calendarEvents)); }); return u; });
                        setCustomizedDays(prev => { const ns = new Set(prev); affectedDays.forEach(d => ns.add(d)); return ns; });
                      }} className="text-[11px] text-zinc-700 hover:text-zinc-950 font-bold px-2.5 py-1.5 hover:bg-white border border-zinc-250 rounded-lg transition-colors bg-white shadow-sm flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy Weekdays</button>
                      {customizedDays.has(selectedDay) && (
                        <button onClick={() => {
                          const dur = parseInt(customDuration) || slotDuration;
                          const defSlots = generateSlots(dur, workStart, workEnd, lunchStart, lunchEnd);
                          setDaySlots(prev => ({ ...prev, [selectedDay]: sortSlots(applyEventOverlaps(defSlots.map(s => ({ ...s, eventTitle: null })), selectedDay, calendarEvents)) }));
                          setCustomizedDays(prev => { const ns = new Set(prev); ns.delete(selectedDay); return ns; });
                        }} className="text-[11px] text-orange-700 hover:text-orange-950 font-bold px-2.5 py-1.5 hover:bg-white border border-orange-200 rounded-lg transition-colors bg-white shadow-sm">Reset</button>
                      )}
                    </div>

                    {showAddSlot && (
                      <div className="bg-white border border-zinc-200 rounded-xl p-4 mb-4 space-y-3 shadow-sm flex-shrink-0 animate-fadeIn">
                        <p className="text-[11px] font-bold text-zinc-800 uppercase tracking-wider">Add Custom Slot</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1"><label className="block text-[9px] font-bold text-zinc-455 mb-1 uppercase">Start</label><input type="time" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border border-zinc-250 rounded-lg focus:border-zinc-500 outline-none bg-white text-zinc-950" /></div>
                          <div className="flex-1"><label className="block text-[9px] font-bold text-zinc-455 mb-1 uppercase">End</label><input type="time" value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border border-zinc-250 rounded-lg focus:border-zinc-500 outline-none bg-white text-zinc-950" /></div>
                        </div>
                        <div className="flex justify-end gap-1.5 pt-1">
                          <button onClick={() => setShowAddSlot(false)} className="px-3 py-1.5 bg-zinc-50 text-zinc-650 text-[11px] font-bold rounded-lg hover:bg-zinc-100 transition-colors">Cancel</button>
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
                          }} className="px-3 py-1.5 bg-zinc-950 text-white text-[11px] font-bold rounded-lg hover:bg-zinc-850 transition-colors">Add</button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                      {/* Morning Slots (AM) */}
                      {morningSlots.length > 0 && (
                        <div>
                          <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> Morning Slots (AM)
                          </h5>
                          <div className="space-y-2">
                            {morningSlots.map((slot) => renderSlotItem(slot, slot.idx))}
                          </div>
                        </div>
                      )}

                      {/* Afternoon Slots (PM) */}
                      {afternoonSlots.length > 0 && (
                        <div>
                          <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sunset className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" /> Afternoon Slots (PM)
                          </h5>
                          <div className="space-y-2">
                            {afternoonSlots.map((slot) => renderSlotItem(slot, slot.idx))}
                          </div>
                        </div>
                      )}

                      {selectedDaySlots.length === 0 && (
                        <div className="text-center py-8 text-zinc-400 text-sm">
                          No slots configured.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-zinc-655 bg-zinc-100/60 border border-zinc-200 px-3.5 py-2.5 rounded-xl flex-shrink-0">
                      <Clock className="w-4.5 h-4.5 text-zinc-400 flex-shrink-0" />
                      <span>Lunch Break: {formatSlotTime(lunchStart)} – {formatSlotTime(lunchEnd)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <Calendar className="w-10 h-10 text-zinc-300 mb-3" />
                    <p className="text-sm font-semibold text-zinc-700">No Date Selected</p>
                    <p className="text-xs text-zinc-450 mt-1.5 max-w-[240px]">
                      Select a date from the calendar to configure its availability slots.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex-shrink-0 border-t border-zinc-150 p-4 bg-zinc-55 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-white border border-zinc-250 text-zinc-700 rounded-xl hover:bg-zinc-50 font-semibold text-sm transition-colors">Cancel</button>
          <button onClick={handleConfirm} disabled={saving} className="px-5 py-2 bg-zinc-950 text-white rounded-xl hover:bg-zinc-900 disabled:opacity-50 font-semibold text-sm flex items-center gap-2 transition-colors">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : confirmText}
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-zinc-150 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-zinc-900" />
                <h3 className="font-bold text-zinc-900 text-base">Instructions</h3>
              </div>
              <button onClick={() => setShowInfo(false)} className="p-1 hover:bg-zinc-50 rounded-lg transition-colors text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-550 font-semibold leading-relaxed">
                Follow these guidelines to configure your schedule:
              </p>
              <ul className="text-xs text-zinc-600 space-y-3 list-disc list-inside">
                <li className="leading-relaxed"><strong className="text-zinc-900">Configure Defaults:</strong> Set your default start/end hours and slot duration, then click <strong className="text-zinc-900">Apply Settings</strong> to initialize the month.</li>
                <li className="leading-relaxed"><strong className="text-zinc-900">Toggle Availability:</strong> Check or uncheck individual slot checkboxes to mark them as available or blocked.</li>
                <li className="leading-relaxed"><strong className="text-zinc-900">Edit & Add Custom Slots:</strong> Click on slot times to edit them individually, or click <strong className="text-zinc-900">Add Slot</strong> to create custom intervals.</li>
              </ul>
            </div>
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-150 flex justify-end">
              <button onClick={() => setShowInfo(false)} className="px-5 py-2 bg-zinc-950 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold transition-colors uppercase tracking-wider">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityPickerModal;
