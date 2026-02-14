import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Loader2, Paperclip, Clock, X, ChevronLeft, ChevronRight, MoreVertical, Calendar, AlertCircle, CheckCircle, Mail, Search, Filter, Trash2, PlusCircle, Copy, Undo2 } from 'lucide-react';
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
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay, isToday, parseISO } from 'date-fns';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'Confirm', cancelText = 'Cancel', isLoading = false }) => {
  if (!isOpen) return null;

  const icons = {
    info: <AlertCircle className="w-12 h-12 text-blue-500" />,
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    warning: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    error: <AlertCircle className="w-12 h-12 text-red-500" />
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
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Identity Disclosure Modal
const IdentityDisclosureModal = ({ isOpen, onClose, ticketNumber }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-fadeIn">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">User Must Disclose Identity First</h3>
            <p className="text-gray-600 mb-4">
              This user is currently anonymous and cannot book appointments until they disclose their identity.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left w-full">
              <p className="text-sm text-gray-700 mb-2"><strong>User needs to:</strong></p>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Go to <strong>My Reports</strong> page</li>
                <li>Find ticket: <strong>{ticketNumber}</strong></li>
                <li>Click <strong>View Details</strong></li>
                <li>Click <strong>Disclose Identity</strong></li>
                <li>Fill in their personal information</li>
              </ol>
              <p className="text-sm text-gray-700 mt-3">
                Once identity is disclosed, you can send them the appointment booking link.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// Calendar Reminder Modal
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
            <p className="text-gray-600 mb-4">
              Before sending the appointment booking link, please make sure your calendar is up to date.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left w-full">
              <p className="text-sm font-semibold text-gray-900 mb-2">⚠️ Important Reminder:</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Check if there are any new events or meetings</li>
                <li>• Update your calendar with blocked time slots</li>
                <li>• Mark any unavailable dates or times</li>
                <li>• This prevents double-booking conflicts</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              The user will see your available time slots and choose their preferred appointment time.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Calendar is Updated, Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced Availability Picker Modal — Calendar View with editable duration & connected to Events
const AvailabilityPickerModal = ({ isOpen, onClose, onConfirm, adminId }) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null); // 'YYYY-MM-DD'
  const [slotDuration, setSlotDuration] = useState(60); // minutes
  const [customDuration, setCustomDuration] = useState('60');
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('17:00');
  const [lunchStart, setLunchStart] = useState('12:00');
  const [lunchEnd, setLunchEnd] = useState('13:00');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  // daySlots: { 'YYYY-MM-DD': [{start, end, available, booked, eventTitle?, custom?}] }
  const [daySlots, setDaySlots] = useState({});
  // Track which days have been customized (so regenerate won't overwrite them)
  const [customizedDays, setCustomizedDays] = useState(new Set());
  // Calendar events from Events page
  const [calendarEvents, setCalendarEvents] = useState([]);
  // Editing state for individual slot time editing
  const [editingSlot, setEditingSlot] = useState(null); // { idx, field: 'start'|'end', value }
  // Add slot form state
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');
  // Undo state for "Copy to Weekdays"
  const [copyUndoSnapshot, setCopyUndoSnapshot] = useState(null); // { slots: {...}, customized: Set, affectedDays: [] }

  const durationPresets = [
    { label: '30m', value: 30 },
    { label: '1h', value: 60 },
    { label: '1.5h', value: 90 },
    { label: '2h', value: 120 },
  ];

  // Parse HH:MM to minutes from midnight
  const timeToMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  // Minutes from midnight to HH:MM
  const minToTime = (m) => {
    const h = String(Math.floor(m / 60)).padStart(2, '0');
    const min = String(m % 60).padStart(2, '0');
    return `${h}:${min}`;
  };

  // Generate time slots based on duration and work hours
  const generateSlots = (duration, wStart, wEnd, lStart, lEnd) => {
    const slots = [];
    let current = timeToMin(wStart);
    const endMin = timeToMin(wEnd);
    const lunchStartMin = timeToMin(lStart);
    const lunchEndMin = timeToMin(lEnd);
    while (current + duration <= endMin) {
      const slotEnd = current + duration;
      // Skip if slot overlaps with lunch break
      if (current < lunchEndMin && slotEnd > lunchStartMin) {
        if (current < lunchStartMin && slotEnd > lunchStartMin) {
          current = lunchEndMin;
          continue;
        }
        if (current >= lunchStartMin && current < lunchEndMin) {
          current = lunchEndMin;
          continue;
        }
      }
      slots.push({ start: minToTime(current), end: minToTime(slotEnd), available: true, booked: false, custom: false });
      current = slotEnd;
    }
    return slots;
  };

  // Check if a calendar event overlaps with a slot on a specific date
  const getOverlappingEvent = (dateStr, slotStart, slotEnd, events) => {
    const slotStartMin = timeToMin(slotStart);
    const slotEndMin = timeToMin(slotEnd);
    for (const evt of events) {
      if (evt.type === 'consultation') continue;
      const evtStart = new Date(evt.start);
      const evtEnd = new Date(evt.end);
      const evtDateStr = format(evtStart, 'yyyy-MM-dd');
      const evtEndDateStr = format(evtEnd, 'yyyy-MM-dd');
      if (evt.allDay) {
        if (dateStr >= evtDateStr && dateStr <= evtEndDateStr) return evt;
        continue;
      }
      if (evtDateStr === dateStr) {
        const evtStartMin = evtStart.getHours() * 60 + evtStart.getMinutes();
        const evtEndMin = evtEnd.getHours() * 60 + evtEnd.getMinutes();
        if (slotStartMin < evtEndMin && slotEndMin > evtStartMin) return evt;
      }
      if (dateStr > evtDateStr && dateStr < evtEndDateStr) return evt;
    }
    return null;
  };

  // Apply event overlaps to slots for a given date
  const applyEventOverlaps = (slots, dateStr, events) => {
    return slots.map(s => {
      const overlapping = getOverlappingEvent(dateStr, s.start, s.end, events);
      if (overlapping) {
        return { ...s, available: false, booked: true, eventTitle: overlapping.title || overlapping.type };
      }
      return { ...s, eventTitle: s.eventTitle || null };
    });
  };

  // Sort slots by start time
  const sortSlots = (slots) => {
    return [...slots].sort((a, b) => timeToMin(a.start) - timeToMin(b.start));
  };

  // Reset configLoaded when modal reopens so config is re-fetched fresh
  useEffect(() => {
    if (isOpen) {
      setConfigLoaded(false);
      setCopyUndoSnapshot(null);
    }
  }, [isOpen]);

  // Fetch month data + calendar events + persisted config
  useEffect(() => {
    if (!isOpen) return;
    const fetchMonth = async () => {
      setLoading(true);
      const monthStr = format(currentMonth, 'yyyy-MM');
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const daysArr = eachDayOfInterval({ start, end });

      // Fetch calendar events for this month
      let events = [];
      try {
        const evtRes = await getAllCalendarEvents({
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
        });
        events = evtRes.data || [];
        setCalendarEvents(events);
      } catch { setCalendarEvents([]); }

      try {
        const res = await getAdminAvailability(adminId, monthStr);
        const fetchedDuration = res.slotDuration || 60;

        // Load persisted config if available and not yet loaded
        if (res.slotConfig && !configLoaded) {
          setWorkStart(res.slotConfig.workStart || '08:00');
          setWorkEnd(res.slotConfig.workEnd || '17:00');
          setLunchStart(res.slotConfig.lunchStart || '12:00');
          setLunchEnd(res.slotConfig.lunchEnd || '13:00');
          setSlotDuration(res.slotConfig.slotDuration || fetchedDuration);
          setCustomDuration(String(res.slotConfig.slotDuration || fetchedDuration));
          setConfigLoaded(true);
        } else if (!configLoaded) {
          setSlotDuration(fetchedDuration);
          setCustomDuration(String(fetchedDuration));
          setConfigLoaded(true);
        }

        const dur = res.slotConfig?.slotDuration || fetchedDuration;
        const ws = res.slotConfig?.workStart || workStart;
        const we = res.slotConfig?.workEnd || workEnd;
        const ls = res.slotConfig?.lunchStart || lunchStart;
        const le = res.slotConfig?.lunchEnd || lunchEnd;
        const defaultSlotsForDay = generateSlots(dur, ws, we, ls, le);

        const slotsMap = {};
        const customDaysSet = new Set();
        daysArr.forEach(d => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const found = res.availabilities?.find(a => a.date === dateStr);
          let slots;
          if (found && found.slots?.length > 0) {
            slots = found.slots.map(s => ({
              start: s.start,
              end: s.end,
              available: !s.booked ? (s.available !== undefined ? s.available : true) : false,
              booked: !!s.booked,
              custom: !!s.custom,
              eventTitle: null
            }));
            if (found.customSlots) customDaysSet.add(dateStr);
          } else {
            slots = defaultSlotsForDay.map(s => ({ ...s, eventTitle: null }));
          }
          slots = applyEventOverlaps(slots, dateStr, events);
          slotsMap[dateStr] = sortSlots(slots);
        });
        setDaySlots(slotsMap);
        setCustomizedDays(customDaysSet);
      } catch {
        const defaultSlotsForDay = generateSlots(slotDuration, workStart, workEnd, lunchStart, lunchEnd);
        const slotsMap = {};
        daysArr.forEach(d => {
          const dateStr = format(d, 'yyyy-MM-dd');
          let slots = defaultSlotsForDay.map(s => ({ ...s, eventTitle: null }));
          slots = applyEventOverlaps(slots, dateStr, events);
          slotsMap[dateStr] = sortSlots(slots);
        });
        setDaySlots(slotsMap);
      } finally {
        setLoading(false);
      }
    };
    fetchMonth();
  }, [isOpen, currentMonth, adminId]);

  // Regenerate slots when Apply is clicked (only for non-customized, non-booked days)
  const handleRegenerate = () => {
    const dur = parseInt(customDuration) || 60;
    setSlotDuration(dur);
    const newSlots = generateSlots(dur, workStart, workEnd, lunchStart, lunchEnd);
    setDaySlots(prev => {
      const updated = { ...prev };
      for (const dateStr of Object.keys(updated)) {
        // Skip days that have been customized or have bookings
        if (customizedDays.has(dateStr)) continue;
        const hasBooked = updated[dateStr].some(s => s.booked && !s.eventTitle);
        if (!hasBooked) {
          let slots = newSlots.map(s => ({ ...s, eventTitle: null }));
          slots = applyEventOverlaps(slots, dateStr, calendarEvents);
          updated[dateStr] = sortSlots(slots);
        }
      }
      return updated;
    });
  };

  // Toggle a slot's availability for a specific day
  const toggleSlot = (dateStr, idx) => {
    setDaySlots(prev => {
      const updated = { ...prev };
      const slots = [...updated[dateStr]];
      if (slots[idx].booked) return prev;
      slots[idx] = { ...slots[idx], available: !slots[idx].available };
      updated[dateStr] = slots;
      return updated;
    });
  };

  // Toggle all slots for a day
  const toggleAllDay = (dateStr) => {
    setDaySlots(prev => {
      const updated = { ...prev };
      const slots = updated[dateStr];
      const nonBookedSlots = slots.filter(s => !s.booked);
      const allAvail = nonBookedSlots.every(s => s.available);
      updated[dateStr] = slots.map(s => s.booked ? s : { ...s, available: !allAvail });
      return updated;
    });
  };

  // Remove a slot from a specific day
  const removeSlot = (dateStr, idx) => {
    setDaySlots(prev => {
      const updated = { ...prev };
      const slots = [...updated[dateStr]];
      if (slots[idx].booked && !slots[idx].eventTitle) return prev; // Can't remove booked consultation slots
      slots.splice(idx, 1);
      updated[dateStr] = slots;
      return updated;
    });
    setCustomizedDays(prev => new Set([...prev, dateStr]));
  };

  // Add a custom slot to a specific day
  const addSlot = (dateStr) => {
    if (!newSlotStart || !newSlotEnd) return;
    if (timeToMin(newSlotStart) >= timeToMin(newSlotEnd)) {
      alert('Start time must be before end time.');
      return;
    }
    // Check for overlap with existing slots
    const existingSlots = daySlots[dateStr] || [];
    const newStartMin = timeToMin(newSlotStart);
    const newEndMin = timeToMin(newSlotEnd);
    const hasOverlap = existingSlots.some(s => {
      const sStart = timeToMin(s.start);
      const sEnd = timeToMin(s.end);
      return newStartMin < sEnd && newEndMin > sStart;
    });
    if (hasOverlap) {
      alert('This slot overlaps with an existing slot. Please choose a different time.');
      return;
    }

    const newSlot = {
      start: newSlotStart,
      end: newSlotEnd,
      available: true,
      booked: false,
      custom: true,
      eventTitle: null,
    };
    // Check for event overlap on the new slot
    const overlapping = getOverlappingEvent(dateStr, newSlotStart, newSlotEnd, calendarEvents);
    if (overlapping) {
      newSlot.available = false;
      newSlot.booked = true;
      newSlot.eventTitle = overlapping.title || overlapping.type;
    }

    setDaySlots(prev => {
      const updated = { ...prev };
      const slots = [...(updated[dateStr] || []), newSlot];
      updated[dateStr] = sortSlots(slots);
      return updated;
    });
    setCustomizedDays(prev => new Set([...prev, dateStr]));
    setNewSlotStart('');
    setNewSlotEnd('');
    setShowAddSlot(false);
  };

  // Edit a slot's start or end time
  const startEditSlot = (idx, field) => {
    const slot = daySlots[selectedDay]?.[idx];
    if (!slot || (slot.booked && !slot.eventTitle)) return; // Can't edit booked consultation slots
    setEditingSlot({ idx, field, value: slot[field] });
  };

  const saveEditSlot = (dateStr) => {
    if (!editingSlot) return;
    const { idx, field, value } = editingSlot;
    const slots = [...(daySlots[dateStr] || [])];
    const slot = { ...slots[idx] };

    const newStart = field === 'start' ? value : slot.start;
    const newEnd = field === 'end' ? value : slot.end;

    if (timeToMin(newStart) >= timeToMin(newEnd)) {
      alert('Start time must be before end time.');
      return;
    }

    // Check for overlap with other slots (excluding current)
    const hasOverlap = slots.some((s, i) => {
      if (i === idx) return false;
      const sStart = timeToMin(s.start);
      const sEnd = timeToMin(s.end);
      return timeToMin(newStart) < sEnd && timeToMin(newEnd) > sStart;
    });
    if (hasOverlap) {
      alert('This time overlaps with another slot.');
      return;
    }

    slot[field] = value;
    slot.custom = true;
    // Re-check event overlap
    const overlapping = getOverlappingEvent(dateStr, slot.start, slot.end, calendarEvents);
    if (overlapping) {
      slot.available = false;
      slot.booked = true;
      slot.eventTitle = overlapping.title || overlapping.type;
    } else if (slot.eventTitle) {
      // Was event-occupied but no longer
      slot.available = true;
      slot.booked = false;
      slot.eventTitle = null;
    }

    slots[idx] = slot;
    setDaySlots(prev => ({
      ...prev,
      [dateStr]: sortSlots(slots),
    }));
    setCustomizedDays(prev => new Set([...prev, dateStr]));
    setEditingSlot(null);
  };

  const cancelEditSlot = () => setEditingSlot(null);

  // Copy slots from selected day to other weekdays in the month (with undo support)
  const copyToAllWeekdays = (dateStr) => {
    const sourceSlots = daySlots[dateStr];
    if (!sourceSlots) return;
    const today = startOfDay(new Date());

    // Determine which days will be affected
    const affectedDays = [];
    for (const d of Object.keys(daySlots)) {
      if (d === dateStr) continue;
      const dayDate = new Date(d + 'T00:00:00');
      if (isBefore(dayDate, today) && !isToday(dayDate)) continue;
      const dayOfWeek = getDay(dayDate);
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      const hasBooked = daySlots[d].some(s => s.booked && !s.eventTitle);
      if (hasBooked) continue;
      affectedDays.push(d);
    }

    if (affectedDays.length === 0) return;

    // Save snapshot of current state for undo
    const snapshotSlots = {};
    const snapshotCustomized = new Set(customizedDays);
    affectedDays.forEach(d => {
      snapshotSlots[d] = daySlots[d].map(s => ({ ...s }));
    });
    setCopyUndoSnapshot({ slots: snapshotSlots, customized: snapshotCustomized, affectedDays });

    setDaySlots(prev => {
      const updated = { ...prev };
      for (const d of affectedDays) {
        let slots = sourceSlots.map(s => ({
          start: s.start,
          end: s.end,
          available: s.available,
          booked: false,
          custom: s.custom,
          eventTitle: null,
        }));
        slots = applyEventOverlaps(slots, d, calendarEvents);
        updated[d] = sortSlots(slots);
      }
      return updated;
    });
    setCustomizedDays(prev => {
      const newSet = new Set(prev);
      affectedDays.forEach(d => newSet.add(d));
      return newSet;
    });
  };

  // Undo the last "Copy to Weekdays" action
  const undoCopyToWeekdays = () => {
    if (!copyUndoSnapshot) return;
    const { slots, customized, affectedDays } = copyUndoSnapshot;
    setDaySlots(prev => {
      const updated = { ...prev };
      affectedDays.forEach(d => {
        if (slots[d]) {
          updated[d] = slots[d];
        }
      });
      return updated;
    });
    setCustomizedDays(customized);
    setCopyUndoSnapshot(null);
  };

  // Reset a day to default generated slots
  const resetDayToDefault = (dateStr) => {
    const dur = parseInt(customDuration) || slotDuration;
    const defaultSlots = generateSlots(dur, workStart, workEnd, lunchStart, lunchEnd);
    let slots = defaultSlots.map(s => ({ ...s, eventTitle: null }));
    slots = applyEventOverlaps(slots, dateStr, calendarEvents);
    setDaySlots(prev => ({
      ...prev,
      [dateStr]: sortSlots(slots),
    }));
    setCustomizedDays(prev => {
      const newSet = new Set(prev);
      newSet.delete(dateStr);
      return newSet;
    });
  };

  const handleMonthChange = (dir) => {
    setCurrentMonth(prev => addMonths(prev, dir));
    setSelectedDay(null);
    setEditingSlot(null);
    setShowAddSlot(false);
    setCopyUndoSnapshot(null);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const slotConfig = {
        workStart,
        workEnd,
        lunchStart,
        lunchEnd,
        slotDuration: parseInt(customDuration) || slotDuration,
      };
      const days = Object.entries(daySlots).map(([date, slots]) => ({
        date,
        customSlots: customizedDays.has(date),
        slots: slots.map(s => ({
          start: s.start,
          end: s.end,
          booked: s.booked && !s.eventTitle,
          available: s.available,
          custom: !!s.custom,
        }))
      }));
      await setAdminAvailabilityBulk(adminId, days, slotDuration, slotConfig);
      onConfirm(days, format(currentMonth, 'yyyy-MM'));
      onClose();
    } catch (err) {
      alert('Failed to save availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Calendar grid helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = startOfDay(new Date());

  const getSlotSummary = (dateStr) => {
    const slots = daySlots[dateStr];
    if (!slots) return { available: 0, booked: 0, unavailable: 0, events: 0, custom: false };
    return {
      available: slots.filter(s => s.available && !s.booked).length,
      booked: slots.filter(s => s.booked && !s.eventTitle).length,
      unavailable: slots.filter(s => !s.available && !s.booked).length,
      events: slots.filter(s => s.booked && s.eventTitle).length,
      custom: customizedDays.has(dateStr),
    };
  };

  const formatSlotTime = (time) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hr12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hr12}:${m} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex-shrink-0 p-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">Set Your Availability</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Customize your time slots — add, remove, or edit each slot's time. Click a slot's time to edit it directly. Your settings are saved for future use.
          </p>

          {/* Editable time settings */}
          <div className="flex flex-wrap items-end gap-3 bg-gray-50 rounded-lg p-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Work Start</label>
              <input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 w-28" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Work End</label>
              <input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 w-28" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Lunch Start</label>
              <input type="time" value={lunchStart} onChange={e => setLunchStart(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 w-28" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Lunch End</label>
              <input type="time" value={lunchEnd} onChange={e => setLunchEnd(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 w-28" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
              <input type="number" value={customDuration} onChange={e => setCustomDuration(e.target.value)} min="15" max="480" step="5"
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 w-20" />
            </div>
            <div className="flex gap-1">
              {durationPresets.map(opt => (
                <button key={opt.value} onClick={() => { setCustomDuration(String(opt.value)); }}
                  className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                    customDuration === String(opt.value) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}>{opt.label}</button>
              ))}
            </div>
            <button onClick={handleRegenerate}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 font-medium">
              Apply
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-5">
              {/* Calendar Grid */}
              <div className="flex-1 min-w-0">
                {/* Undo banner for Copy to Weekdays */}
                {copyUndoSnapshot && (
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 mb-3 animate-fadeIn">
                    <p className="text-xs text-indigo-700">
                      <span className="font-medium">Copied to {copyUndoSnapshot.affectedDays.length} weekday{copyUndoSnapshot.affectedDays.length !== 1 ? 's' : ''}.</span>
                      {' '}You can undo this action or reset individual days.
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <button onClick={undoCopyToWeekdays}
                        className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 font-medium transition-colors">
                        <Undo2 className="w-3 h-3" /> Undo All
                      </button>
                      <button onClick={() => setCopyUndoSnapshot(null)}
                        className="p-1 text-indigo-400 hover:text-indigo-600 rounded hover:bg-indigo-100 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h3>
                  <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {dayNames.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
                  {daysInMonth.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isPast = isBefore(day, today) && !isToday(day);
                    const isSelected = selectedDay === dateStr;
                    const summary = getSlotSummary(dateStr);
                    const isWeekend = getDay(day) === 0 || getDay(day) === 6;

                    return (
                      <button key={dateStr}
                        onClick={() => {
                          if (!isPast) {
                            setSelectedDay(isSelected ? null : dateStr);
                            setEditingSlot(null);
                            setShowAddSlot(false);
                          }
                        }}
                        disabled={isPast}
                        className={`relative p-1.5 rounded-lg text-center transition-all min-h-[64px] flex flex-col items-center justify-start ${
                          isPast ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : isSelected ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                            : isWeekend ? 'bg-orange-50 hover:bg-orange-100 text-gray-700'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                        <span className={`text-sm font-semibold ${isToday(day) && !isSelected ? 'text-blue-600' : ''}`}>
                          {format(day, 'd')}
                        </span>
                        {!isPast && (
                          <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                            {summary.custom && (
                              <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-600'}`}>✏️</span>
                            )}
                            {summary.available > 0 && (
                              <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/30 text-white' : 'bg-green-100 text-green-700'}`}>{summary.available}</span>
                            )}
                            {summary.booked > 0 && (
                              <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/30 text-white' : 'bg-red-100 text-red-600'}`}>{summary.booked}</span>
                            )}
                            {summary.events > 0 && (
                              <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/30 text-white' : 'bg-purple-100 text-purple-600'}`}>{summary.events}📅</span>
                            )}
                            {summary.unavailable > 0 && (
                              <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-500'}`}>{summary.unavailable}</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded" /> Available</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded" /> Booked</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-100 rounded" /> Event</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 rounded" /> Unavailable</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 rounded" /> ✏️ Customized</div>
                </div>
              </div>

              {/* Slot panel (right side) */}
              <div className="lg:w-96 flex-shrink-0">
                {selectedDay ? (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {format(new Date(selectedDay + 'T00:00:00'), 'EEE, MMM d, yyyy')}
                      </h4>
                      {customizedDays.has(selectedDay) && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">Customized</span>
                      )}
                    </div>

                    {/* Action buttons row */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <button onClick={() => toggleAllDay(selectedDay)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded">
                        Toggle All
                      </button>
                      <button onClick={() => setShowAddSlot(v => !v)}
                        className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 hover:bg-green-50 rounded flex items-center gap-0.5">
                        <PlusCircle className="w-3 h-3" /> Add Slot
                      </button>
                      <button onClick={() => copyToAllWeekdays(selectedDay)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 hover:bg-indigo-50 rounded flex items-center gap-0.5"
                        title="Copy this day's slots to all weekdays in the month">
                        <Copy className="w-3 h-3" /> Copy to Weekdays
                      </button>
                      {/* Undo single day — only if this day was part of a copy action */}
                      {copyUndoSnapshot && copyUndoSnapshot.affectedDays.includes(selectedDay) && (
                        <button onClick={() => {
                          // Undo just this single day
                          const { slots, affectedDays } = copyUndoSnapshot;
                          if (slots[selectedDay]) {
                            setDaySlots(prev => ({
                              ...prev,
                              [selectedDay]: slots[selectedDay],
                            }));
                            // Restore customized state for this day
                            setCustomizedDays(prev => {
                              const newSet = new Set(prev);
                              if (copyUndoSnapshot.customized.has(selectedDay)) {
                                newSet.add(selectedDay);
                              } else {
                                newSet.delete(selectedDay);
                              }
                              return newSet;
                            });
                          }
                          // Remove this day from affected list
                          const remaining = affectedDays.filter(d => d !== selectedDay);
                          if (remaining.length === 0) {
                            setCopyUndoSnapshot(null);
                          } else {
                            setCopyUndoSnapshot(prev => ({ ...prev, affectedDays: remaining }));
                          }
                        }}
                          className="text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 hover:bg-amber-50 rounded flex items-center gap-0.5"
                          title="Undo the copy for this day only">
                          <Undo2 className="w-3 h-3" /> Undo Copy
                        </button>
                      )}
                      {customizedDays.has(selectedDay) && (
                        <button onClick={() => resetDayToDefault(selectedDay)}
                          className="text-xs text-orange-600 hover:text-orange-800 font-medium px-2 py-1 hover:bg-orange-50 rounded"
                          title="Reset to auto-generated slots">
                          Reset
                        </button>
                      )}
                    </div>

                    {/* Add Slot Form */}
                    {showAddSlot && (
                      <div className="bg-white border border-green-200 rounded-lg p-3 mb-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700">Add Custom Slot</p>
                        <div className="flex items-center gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-500">Start</label>
                            <input type="time" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 w-28" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500">End</label>
                            <input type="time" value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 w-28" />
                          </div>
                          <button onClick={() => addSlot(selectedDay)}
                            className="mt-3 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 font-medium">
                            Add
                          </button>
                          <button onClick={() => setShowAddSlot(false)}
                            className="mt-3 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1">
                      {(daySlots[selectedDay] || []).length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">No slots. Click "Add Slot" to create one.</p>
                      )}
                      {(daySlots[selectedDay] || []).map((slot, idx) => (
                        <div key={idx}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                            slot.booked && slot.eventTitle
                              ? 'bg-purple-50 border border-purple-200'
                              : slot.booked
                              ? 'bg-red-50 border border-red-200'
                              : slot.available
                              ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                              : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                          }`}>
                          {/* Availability checkbox */}
                          <input type="checkbox"
                            checked={slot.available}
                            onChange={() => toggleSlot(selectedDay, idx)}
                            disabled={slot.booked}
                            className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500 flex-shrink-0" />

                          {/* Time display / edit */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              {editingSlot && editingSlot.idx === idx && editingSlot.field === 'start' ? (
                                <input type="time" value={editingSlot.value}
                                  onChange={e => setEditingSlot(prev => ({ ...prev, value: e.target.value }))}
                                  onBlur={() => saveEditSlot(selectedDay)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') saveEditSlot(selectedDay);
                                    if (e.key === 'Escape') cancelEditSlot();
                                  }}
                                  autoFocus
                                  className="w-24 px-1 py-0.5 text-xs border border-blue-400 rounded focus:ring-1 focus:ring-blue-500" />
                              ) : (
                                <button
                                  onClick={() => startEditSlot(idx, 'start')}
                                  disabled={slot.booked && !slot.eventTitle}
                                  className={`text-sm font-medium hover:underline ${
                                    slot.booked ? 'text-red-600 cursor-not-allowed' : slot.available ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-pointer'
                                  }`}
                                  title="Click to edit start time">
                                  {formatSlotTime(slot.start)}
                                </button>
                              )}
                              <span className="text-xs text-gray-400">–</span>
                              {editingSlot && editingSlot.idx === idx && editingSlot.field === 'end' ? (
                                <input type="time" value={editingSlot.value}
                                  onChange={e => setEditingSlot(prev => ({ ...prev, value: e.target.value }))}
                                  onBlur={() => saveEditSlot(selectedDay)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') saveEditSlot(selectedDay);
                                    if (e.key === 'Escape') cancelEditSlot();
                                  }}
                                  autoFocus
                                  className="w-24 px-1 py-0.5 text-xs border border-blue-400 rounded focus:ring-1 focus:ring-blue-500" />
                              ) : (
                                <button
                                  onClick={() => startEditSlot(idx, 'end')}
                                  disabled={slot.booked && !slot.eventTitle}
                                  className={`text-sm font-medium hover:underline ${
                                    slot.booked ? 'text-red-600 cursor-not-allowed' : slot.available ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-pointer'
                                  }`}
                                  title="Click to edit end time">
                                  {formatSlotTime(slot.end)}
                                </button>
                              )}
                              {slot.custom && (
                                <span className="text-[9px] bg-blue-100 text-blue-500 px-1 rounded ml-1" title="Custom slot">custom</span>
                              )}
                            </div>
                            {slot.eventTitle && (
                              <p className="text-xs text-purple-600 mt-0.5 truncate" title={slot.eventTitle}>
                                📅 {slot.eventTitle}
                              </p>
                            )}
                          </div>

                          {/* Status badge */}
                          {slot.booked && slot.eventTitle && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                              Event
                            </span>
                          )}
                          {slot.booked && !slot.eventTitle && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                              Booked
                            </span>
                          )}
                          {!slot.booked && slot.available && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                              Open
                            </span>
                          )}
                          {!slot.booked && !slot.available && (
                            <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                              Off
                            </span>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={() => removeSlot(selectedDay, idx)}
                            disabled={slot.booked && !slot.eventTitle}
                            className={`p-1 rounded transition-colors flex-shrink-0 ${
                              slot.booked && !slot.eventTitle
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                            title="Remove slot">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Lunch break indicator */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      {formatSlotTime(lunchStart)} – {formatSlotTime(lunchEnd)} Lunch Break
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Select a day</p>
                    <p className="text-xs text-gray-400 mt-1">Click on a date to view and edit time slots</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Your slot configuration will be saved and reused for future bookings.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={saving}
              className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium text-sm flex items-center gap-2">
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
              ) : 'Confirm & Send Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketMessagingSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showTicketList, setShowTicketList] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'open', 'closed', 'unread'
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showCalendarReminder, setShowCalendarReminder] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [pendingSendLink, setPendingSendLink] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  });
  
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedTicketRef = useRef(null);

  const [readTickets, setReadTickets] = useState(() => {
    const stored = localStorage.getItem('adminReadTickets');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('adminReadTickets', JSON.stringify(readTickets));
  }, [readTickets]);

  const isTicketRead = (ticketNumber) => {
    return readTickets.includes(ticketNumber);
  };

  const markTicketAsReadLocally = (ticketNumber) => {
    if (!readTickets.includes(ticketNumber)) {
      setReadTickets([...readTickets, ticketNumber]);
    }
  };

  const markTicketAsUnreadLocally = (ticketNumber) => {
    setReadTickets(readTickets.filter(t => t !== ticketNumber));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

  // Socket initialization
  useEffect(() => {
    console.log('🔌 Initializing socket connection...');
    socketService.connect();
    
    setTimeout(() => {
      console.log('👑 Attempting to join admin room...');
      socketService.joinAdminRoom();
    }, 100);

    socketService.onNewMessage(({ message, ticket }) => {
      console.log('🔥 New message received:', message);
      
      if (selectedTicketRef.current?.ticketNumber === message.ticketNumber) {
        console.log('✅ Ticket match! Adding to messages...');
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      } else {
        if (message.sender === 'user') {
          markTicketAsUnreadLocally(ticket.ticketNumber);
        }
      }

      setTickets(prev => {
        const updatedTickets = prev.map(t => 
          t.ticketNumber === ticket.ticketNumber ? ticket : t
        );
        return [...updatedTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA;
        });
      });
    });

    socketService.onTicketUpdated((updatedTicket) => {
      setTickets(prev => {
        const newTickets = prev.map(t => 
          t.ticketNumber === updatedTicket.ticketNumber ? updatedTicket : t
        );
        const sortedTickets = [...newTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA;
        });
        return sortedTickets;
      });
      
      if (selectedTicketRef.current?.ticketNumber === updatedTicket.ticketNumber) {
        setSelectedTicket(updatedTicket);
      }
    });

    socketService.onTicketClosed(({ ticket, message }) => {
      if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
        setSelectedTicket(ticket);
        setMessages(prev => [...prev, message]);
      }
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    });

    socketService.onTicketReopened(({ ticket, message }) => {
      if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
        setSelectedTicket(ticket);
        setMessages(prev => [...prev, message]);
      }
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    });

    socketService.onUserTyping(({ userName, isTyping }) => {
      if (isTyping) {
        setTypingUser(userName);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      } else {
        setTypingUser(null);
      }
    });

    socketService.onMessagesRead(({ ticketNumber, readBy }) => {
      if (selectedTicketRef.current?.ticketNumber === ticketNumber) {
        setMessages(prev => prev.map(msg => ({
          ...msg,
          isRead: msg.sender === 'admin' && readBy === 'user' ? true : msg.isRead
        })));
      }
      
      if (readBy === 'user') {
        setTickets(prev => prev.map(t => 
          t.ticketNumber === ticketNumber 
            ? { ...t, unreadCount: { ...t.unreadCount, admin: 0 }, hasUnreadMessages: false } 
            : t
        ));
      }
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      socketService.joinTicket(selectedTicket.ticketNumber);
      return () => {
        socketService.leaveTicket(selectedTicket.ticketNumber);
      };
    }
  }, [selectedTicket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const handleNavigationState = async () => {
      const state = window.history.state?.usr;
      
      if (state?.selectedTicketNumber && tickets.length > 0) {
        const ticketToSelect = tickets.find(t => t.ticketNumber === state.selectedTicketNumber);
        
        if (ticketToSelect) {
          await handleSelectTicket(ticketToSelect);
        }
        
        window.history.replaceState({}, document.title);
      }
    };
    
    handleNavigationState();
  }, [tickets]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getAllTickets({ sortBy: 'lastMessageAt' });
      setTickets(data);
    } catch (error) {
      console.error('❌ Error loading tickets:', error);
      showModal({
        title: 'Error',
        message: 'Failed to load tickets. Please try again.',
        type: 'error',
        onConfirm: () => setShowConfirmModal(false)
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketNumber) => {
    setLoading(true);
    try {
      const data = await getTicketMessages(ticketNumber, { limit: 50 });
      setMessages(data);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markTicketAsRead = async (ticketNumber) => {
    try {
      await markMessagesAsRead(ticketNumber);
      markTicketAsReadLocally(ticketNumber);
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticketNumber 
          ? { ...t, hasUnreadMessages: false } 
          : t
      ));
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  const handleMarkAsUnread = async (ticketNumber) => {
    try {
      await markTicketAsUnread(ticketNumber);
      markTicketAsUnreadLocally(ticketNumber);
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticketNumber 
          ? { ...t, hasUnreadMessages: true, unreadCount: { ...t.unreadCount, admin: 1 } } 
          : t
      ));
    } catch (error) {
      console.error('❌ Error marking as unread:', error);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketList(false);
    await markTicketAsRead(ticket.ticketNumber);
    await loadMessages(ticket.ticketNumber);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const message = await sendTicketMessage(selectedTicket.ticketNumber, {
        content: newMessage.trim(),
        attachments: []
      });
      
      setMessages(prev => {
        const exists = prev.some(m => m._id === message._id);
        if (!exists) {
          return [...prev, message];
        }
        return prev;
      });
      
      setNewMessage('');
      socketService.sendTyping(selectedTicket.ticketNumber, 'Admin', false);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      showModal({
        title: 'Error',
        message: 'Failed to send message. Please try again.',
        type: 'error',
        onConfirm: () => setShowConfirmModal(false)
      });
    } finally {
      setSending(false);
    }
  };

  const showModal = (config) => {
    setModalConfig(config);
    setShowConfirmModal(true);
  };

  const handleSendAppointmentLink = () => {
    const user = selectedTicket.userId;
    const report = selectedTicket.reportId;
    
    const isAnonymous = !user?.firstName || 
                       !user?.lastName ||
                       !user?.email;
    
    if (isAnonymous) {
      setShowIdentityModal(true);
      return;
    }

    setShowAvailabilityModal(true);
  };

  const handleAvailabilityConfirm = async (days, selectedMonth) => {
    // Availability already saved by the modal, proceed to send link
    handleCalendarConfirmed();
  };

  const handleCalendarConfirmed = () => {
    setShowCalendarReminder(false);
    
    const userEmail = selectedTicket.reportId?.personalInfo?.email || 'the user';
    const userName = selectedTicket.displayName || 'User';
    
    showModal({
      title: 'Send Appointment Booking Link?',
      message: `An email will be sent to ${userEmail} with a link to book an appointment.\n\nThe user (${userName}) will be able to:\n• View your available time slots\n• Choose their preferred date and time\n• Book the appointment`,
      type: 'info',
      confirmText: 'Send Link',
      onConfirm: handleConfirmSendLink
    });
  };

  const handleConfirmSendLink = async () => {
    try {
      setIsSending(true);
      
      const ticket = selectedTicket;
      
      if (!ticket) {
        alert("❌ No ticket selected");
        return;
      }

      const userId = ticket.userId?._id || ticket.userId;
      const userEmail = ticket.userId?.email || 
                       ticket.reportId?.email ||
                       ticket.email;
      
      let userName = "";
      
      if (ticket.displayName && ticket.displayName !== "Anonymous User") {
        userName = ticket.displayName;
      }
      else if (ticket.userId?.firstName && ticket.userId?.lastName) {
        userName = `${ticket.userId.firstName} ${ticket.userId.lastName}`;
      }
      else if (ticket.reportId?.firstName && ticket.reportId?.lastName) {
        userName = `${ticket.reportId.firstName} ${ticket.reportId.lastName}`;
      }
      else {
        userName = "User";
      }

      const ticketNumber = ticket.reportId?.ticketNumber || ticket.ticketNumber;

      if (!userId) {
        alert("❌ Error: User ID not found. Cannot send booking link.");
        return;
      }
      
      if (!userEmail) {
        alert("❌ Error: User email not found. Cannot send booking link.");
        return;
      }

      if (!ticketNumber) {
        alert("❌ Error: Ticket number not found.");
        return;
      }

      const response = await sendBookingLinkEmail({
        userId,           
        userEmail,        
        userName,         
        ticketNumber
      });

      if (response.success) {
        alert(`✅ Booking link sent successfully to ${userEmail}!\nLink expires in 24 hours.`);
        setShowConfirmModal(false);
        
        try {
          await sendTicketMessage(ticket.ticketNumber, {
            content: `📅 An appointment booking link has been sent to your email (${userEmail}).\n\nPlease check your inbox and book your preferred consultation date.\n\n⏰ Important: The link is valid for 24 hours only.\n\n✅ Once booked, you will receive a confirmation.`,
            metadata: { type: 'appointment_link' }
          });
        } catch (msgError) {
          console.error("⚠️ Failed to send chat message:", msgError);
        }
      } else {
        alert(`❌ ${response.message || "Failed to send booking link"}`);
      }

    } catch (error) {
      console.error("❌ Error sending appointment link:", error);
      alert(`❌ Error: ${error.message || "Failed to send booking link"}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedTicket && e.target.value.trim()) {
      socketService.sendTyping(selectedTicket.ticketNumber, 'Admin', true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(selectedTicket.ticketNumber, 'Admin', false);
      }, 2000);
    }
  };

  const toggleMenu = (e, ticketNumber) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === ticketNumber ? null : ticketNumber);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getLastAdminMessageIndex = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'admin') {
        return i;
      }
    }
    return -1;
  };

  const lastAdminMessageIndex = getLastAdminMessageIndex();

  // Filter tickets based on search and filter
  const filteredTickets = tickets.filter(ticket => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      ticket.displayName?.toLowerCase().includes(searchLower) ||
      ticket.ticketNumber?.toLowerCase().includes(searchLower) ||
      ticket.reportId?.ticketNumber?.toLowerCase().includes(searchLower);

    // Status filter
    let matchesFilter = true;
    if (filterStatus === 'open') {
      matchesFilter = ticket.status === 'Open';
    } else if (filterStatus === 'closed') {
      matchesFilter = ticket.status === 'Closed';
    } else if (filterStatus === 'unread') {
      matchesFilter = !isTicketRead(ticket.ticketNumber);
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        isLoading={sending}
      />

      <IdentityDisclosureModal
        isOpen={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        ticketNumber={selectedTicket?.reportId?.ticketNumber || selectedTicket?.ticketNumber}
      />

      <CalendarReminderModal
        isOpen={showCalendarReminder}
        onClose={() => setShowCalendarReminder(false)}
        onConfirm={handleCalendarConfirmed}
      />

      <AvailabilityPickerModal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        onConfirm={handleAvailabilityConfirm}
        adminId={selectedTicket?.adminId || 'me'}
      />

      {/* Main Container - Messenger-style Layout */}
      <div className="flex bg-white" style={{ height: '100%', overflow: 'hidden' }}>
        {/* Sidebar - Always visible on desktop, toggleable on mobile */}
        <div 
          className={`${
            showTicketList ? 'flex' : 'hidden'
          } md:flex flex-col w-full md:w-96 border-r border-gray-200 bg-white`}
          style={{ 
            height: '100%',
            minHeight: 0
          }}
        >
          {/* Sidebar Header - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <button
                onClick={() => setShowTicketList(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'unread', 'open', 'closed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterStatus === filter
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto"
            style={{ minHeight: 0 }}
          >
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'No tickets match your search' 
                    : 'No tickets found'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTickets.map((ticket) => {
                  const hasUnread = !isTicketRead(ticket.ticketNumber);
                  const isSelected = selectedTicket?.ticketNumber === ticket.ticketNumber;
                  
                  return (
                    <button
                      key={ticket._id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`w-full p-4 text-left transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : hasUnread 
                          ? 'bg-gray-50 hover:bg-gray-100' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          hasUnread ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          {ticket.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                              {ticket.displayName || 'Anonymous User'}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatDate(ticket.lastMessageAt)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-1">
                            {ticket.reportId?.ticketNumber || ticket.ticketNumber}
                          </p>

                          {ticket.reportId?.caseStatus && (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                              ticket.status === 'Open'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {ticket.reportId.caseStatus}
                            </span>
                          )}
                        </div>

                        {/* Unread indicator */}
                        {hasUnread && (
                          <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div 
          className={`${showTicketList ? 'hidden md:flex' : 'flex'} flex-col flex-1`} 
          style={{ 
            height: '100%',
            minHeight: 0
          }}
        >
          {selectedTicket ? (
            <>
              {/* Chat Header - Fixed */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowTicketList(true)}
                      className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {selectedTicket.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedTicket.displayName || 'Anonymous User'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedTicket.reportId?.ticketNumber || selectedTicket.ticketNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSendAppointmentLink}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all text-sm font-medium"
                      title="Send appointment booking link"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Appointment
                    </button>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedTicket.status === 'Open' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages - Scrollable */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-50"
                style={{ minHeight: 0 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start the conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((msg, idx) => {
                      const isCurrentUser = msg.sender === 'admin';
                      const isLastAdminMessage = isCurrentUser && idx === lastAdminMessageIndex;
                      const isAppointmentLink = msg.metadata?.type === 'appointment_link';
                      
                      return (
                        <div
                          key={idx}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-md ${
                            isAppointmentLink 
                              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg' 
                              : isCurrentUser 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white shadow-sm'
                          } rounded-2xl p-3`}>
                            {isAppointmentLink && (
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/30">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-semibold">Appointment Booking</span>
                              </div>
                            )}
                            <p className={`text-sm whitespace-pre-line ${
                              isAppointmentLink || isCurrentUser ? 'text-white' : 'text-gray-900'
                            }`}>
                              {msg.content}
                            </p>
                            {msg.attachments?.length > 0 && (
                              <div className="mt-2 flex items-center gap-1 text-xs opacity-80">
                                <Paperclip className="w-3 h-3" />
                                {msg.attachments.length} attachment(s)
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className={`text-xs ${
                                isAppointmentLink || isCurrentUser ? 'text-white/70' : 'text-gray-400'
                              }`}>
                                {formatTime(msg.createdAt)}
                              </span>
                              {isCurrentUser && isLastAdminMessage && msg.isRead && (
                                <span className={`text-xs ${isAppointmentLink ? 'text-white/70' : 'text-blue-200'}`}>
                                  ✓ Read
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {typingUser && (
                      <div className="flex justify-start">
                        <div className="bg-white shadow-sm rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                            <span className="text-xs text-gray-500">{typingUser} is typing</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input - Fixed */}
              {selectedTicket.status === 'Open' && (
                <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
                  {/* Mobile Calendar Button */}
                  <button
                    onClick={handleSendAppointmentLink}
                    className="sm:hidden w-full mb-3 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Calendar className="w-4 h-4" />
                    Send Booking Link
                  </button>

                  <div className="flex gap-3 items-end max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows="1"
                        className="w-full px-4 py-3 pr-12 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        style={{ 
                          minHeight: '44px',
                          maxHeight: '120px',
                          overflowY: 'auto'
                        }}
                        disabled={sending}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="flex-shrink-0 w-11 h-11 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Conversation Selected</h3>
              <p className="text-sm text-gray-500 mb-6">Choose a ticket to start messaging</p>
              <button
                onClick={() => setShowTicketList(true)}
                className="md:hidden px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Tickets
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default TicketMessagingSystem;