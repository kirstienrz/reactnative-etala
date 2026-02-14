import React, { useState, useEffect } from 'react';
import axios from 'axios';

const defaultSlots = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  // lunch break 12-1
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
];

const AdminAvailability = ({ adminId }) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState(defaultSlots.map(s => ({ ...s, available: true })));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/admin-availability/${adminId}?date=${date}`);
        if (res.data && res.data.availabilities) {
          const day = res.data.availabilities.find(a => a.date === date);
          if (day) {
            setSlots(day.slots.map(s => ({ ...s, available: !s.booked })));
          } else {
            setSlots(defaultSlots.map(s => ({ ...s, available: true })));
          }
        }
      } catch (e) {
        setSlots(defaultSlots.map(s => ({ ...s, available: true })));
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [adminId, date]);

  const handleToggle = idx => {
    setSlots(slots => slots.map((s, i) => i === idx ? { ...s, available: !s.available } : s));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      const toSave = slots.map(({ start, end, available }) => ({ start, end, booked: !available }));
      await axios.post(`/api/admin-availability/${adminId}`, { date, slots: toSave });
      setMessage('Availability saved!');
    } catch (e) {
      setMessage('Error saving availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-lg mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Set Your Available Time Slots</h2>
      <label className="block mb-2 font-medium">Date:</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mb-4 p-2 border rounded" />
      <div className="mb-4">
        {slots.map((slot, idx) => (
          <div key={idx} className="flex items-center gap-3 mb-2">
            <input type="checkbox" checked={slot.available} onChange={() => handleToggle(idx)} id={`slot${idx}`} />
            <label htmlFor={`slot${idx}`}>{slot.start} - {slot.end}</label>
            {slot.start === '12:00' && <span className="text-xs text-gray-400">Lunch Break</span>}
          </div>
        ))}
      </div>
      <button onClick={handleSave} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Availability'}
      </button>
      {message && <div className="mt-2 text-sm">{message}</div>}
    </div>
  );
};

export default AdminAvailability;
