import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { Calendar as CalendarIcon, Search, X } from "lucide-react";
import { getAllCalendarEvents } from "../../api/calendar";

export default function ProgramEventCalendarUI() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("month");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getAllCalendarEvents();
      if (response.success) {
        const programEvents = response.data.filter(
          (event) => event.extendedProps?.type === "program_event"
        );
        setEvents(programEvents);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.extendedProps?.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEvents(filtered);
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      description: info.event.extendedProps.description,
      location: info.event.extendedProps.location,
      organizer: info.event.extendedProps.organizer
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading program events...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-2">Program Events</h1>
          <p className="text-lg text-violet-200/80 max-w-2xl mx-auto leading-relaxed">
            Track, manage, and explore all program events in one comprehensive calendar interface
          </p>
        </div>
      </section>

      {/* Search & View Controls */}
      <section className="relative -mt-8 max-w-7xl mx-auto px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          <div className="flex border border-slate-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewType("month")}
              className={`px-4 py-3 transition-all ${viewType === "month" ? 'bg-violet-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              Month
            </button>
            <button
              onClick={() => setViewType("week")}
              className={`px-4 py-3 transition-all ${viewType === "week" ? 'bg-violet-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewType("list")}
              className={`px-4 py-3 transition-all ${viewType === "list" ? 'bg-violet-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              List
            </button>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-8 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView={viewType === "month" ? "dayGridMonth" : viewType === "week" ? "timeGridWeek" : "listMonth"}
                events={filteredEvents}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,listMonth",
                }}
                height="75vh"
                eventClick={handleEventClick}
                eventColor="#7c3aed"
                eventTextColor="white"
                eventBorderColor="#6d28d9"
                dayMaxEventRows={3}
                nowIndicator={true}
                editable={false}
                selectable={false}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedEvent && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Event Details</h3>
                  <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-xl text-slate-900 mb-2">{selectedEvent.title}</h4>
                  {selectedEvent.location && <p className="text-sm text-slate-600">Location: {selectedEvent.location}</p>}
                  {selectedEvent.organizer && <p className="text-sm text-slate-600">Organizer: {selectedEvent.organizer}</p>}
                  <p className="text-sm text-slate-600">
                    Date: {new Date(selectedEvent.start).toLocaleDateString()}{" "}
                    {selectedEvent.end && `- ${new Date(selectedEvent.end).toLocaleDateString()}`}
                  </p>
                  {selectedEvent.description && <p className="text-sm text-slate-600">{selectedEvent.description}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
