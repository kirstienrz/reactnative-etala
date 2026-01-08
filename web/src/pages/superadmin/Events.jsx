import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Plus, RefreshCcw, Calendar as CalendarIcon, X } from "lucide-react";
import { getAllCalendarEvents, createCalendarEvent } from "../../api/calendar"; // Your API

export default function SuperAdminCalendarUI() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    upcoming: 0,
    completed: 0
  });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");


  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getAllCalendarEvents();

      if (response.success) {
        setEvents(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
  const searchText = search.toLowerCase();

  const name = event.extendedProps?.userName?.toLowerCase() || "";
  const email = event.extendedProps?.userEmail?.toLowerCase() || "";

  const matchesSearch =
    name.includes(searchText) || email.includes(searchText);

  const matchesType =
    typeFilter === "all" || event.type === typeFilter;

  return matchesSearch && matchesType;
});


  const calculateStats = (eventData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const total = eventData.length;
    const thisMonth = eventData.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    }).length;

    const upcoming = eventData.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate > now;
    }).length;

    const completed = eventData.filter(event => {
      return event.extendedProps?.status === 'completed';
    }).length;

    setStats({ total, thisMonth, upcoming, completed });
  };

  const handleDateClick = (info) => {
    setShowModal(true);
    setFormData({
      start: info.dateStr,
      end: info.dateStr,
      allDay: true,
      type: 'consultation'
    });
  };

  const handleEventClick = (info) => {
    const event = info.event;
    alert(`
      Event: ${event.title}
      Type: ${event.extendedProps.type || 'program_event'}
      ${event.extendedProps.venue ? `Venue: ${event.extendedProps.venue}` : ''}
      ${event.extendedProps.location ? `Location: ${event.extendedProps.location}` : ''}
    `);
  };

  const handleSaveEvent = async () => {
    try {
      await createCalendarEvent(formData);
      await fetchEvents(); // Refresh events
      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Superadmin Calendar
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage Programs, Projects, Events, Holidays & Consultations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            <RefreshCcw size={18} /> Refresh
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              setFormData({
                start: new Date().toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0],
                allDay: true,
                type: 'consultation'
              });
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm"
          >
            <Plus size={18} /> New Schedule
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.thisMonth}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcoming}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Legend for Color Coding */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Types:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-600">Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500"></div>
            <span className="text-sm text-gray-600">Not Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500"></div>
            <span className="text-sm text-gray-600">Consultation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-600">Program Event</span>
          </div>
        </div>
      </div>


      {/* Calendar Container */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="75vh"
          events={events} // ⬅️ This now contains ALL events (program + calendar)
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          dayMaxEvents={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={true}
          nowIndicator={true}
          editable={true}
          selectable={true}
          dayHeaderClassNames="text-gray-700 font-semibold"
          dayCellClassNames="hover:bg-blue-50 transition-colors"
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day"
          }}
          views={{
            timeGrid: {
              dayHeaderFormat: { weekday: 'short', day: 'numeric' }
            }
          }}
        />
      </div>

      {/* Modal for Adding New Event */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Calendar Event</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <select
                  value={formData.type || 'consultation'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="holiday">Holiday</option>
                  <option value="not_available">Not Available</option>
                  <option value="consultation">Consultation</option>
                </select>

                <input
                  type="date"
                  value={formData.start || ''}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                  type="date"
                  value={formData.end || ''}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                  type="text"
                  placeholder="Location (optional)"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <textarea
                  placeholder="Description (optional)"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                />

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allDay || false}
                    onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">All Day Event</span>
                </label>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-lg w-64"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="consultation">Consultation</option>
          <option value="holiday">Holiday</option>
          <option value="program_event">Program</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Booked By</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Mode</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>

         <tbody>
  {filteredEvents.map((event) => (
    <tr key={event._id} className="hover:bg-gray-50">
      <td className="px-4 py-2">
        {new Date(event.start).toLocaleDateString()}
      </td>

      <td className="px-4 py-2 capitalize">
        {event.type}
      </td>

      <td className="px-4 py-2 font-medium">
        {event.extendedProps?.userName || "—"}
      </td>

      <td className="px-4 py-2">
        {event.extendedProps?.userEmail || "—"}
      </td>

      <td className="px-4 py-2 capitalize">
        {event.extendedProps?.mode || "—"}
      </td>

      <td className="px-4 py-2">
        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
          {event.extendedProps?.status || "upcoming"}
        </span>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

    </div>
  );
}