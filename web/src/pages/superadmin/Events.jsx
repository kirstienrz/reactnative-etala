import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Plus, RefreshCcw, User, Calendar as CalendarIcon } from "lucide-react";

export default function SuperAdminCalendarUI() {
  const [events, setEvents] = useState([
    {
      title: "Project Kickoff",
      start: "2025-11-12T09:00:00",
      end: "2025-11-12T10:30:00",
      color: "#2563eb", // blue-600
    },
    {
      title: "Program Planning",
      start: "2025-11-13T13:00:00",
      end: "2025-11-13T15:00:00",
      color: "#3b82f6", // blue-500
    },
    {
      title: "Event Coordination Meeting",
      start: "2025-11-14",
      color: "#60a5fa", // blue-400
    },
    {
      title: "Team Review",
      start: "2025-11-15T11:00:00",
      end: "2025-11-15T12:00:00",
      color: "#2563eb", // blue-600
    },
  ]);

  const handleDateClick = (info) => {
    alert(`Clicked date: ${info.dateStr}`);
  };

  const handleEventClick = (info) => {
    alert(`Event: ${info.event.title}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Superadmin Calendar
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage Programs, Projects, and Events</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
            <RefreshCcw size={18} /> Refresh
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm">
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
              <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">4</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
            </div>
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
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          // Custom styling to match profile theme
          eventBackgroundColor="#3b82f6"
          eventBorderColor="#2563eb"
          eventTextColor="#ffffff"
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

      {/* Quick Actions */}
      <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium">
            Create Event
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
            Export Calendar
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
            Share Calendar
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
            Set Reminder
          </button>
        </div>
      </div>
    </div>
  );
}