import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Calendar as CalendarIcon } from "lucide-react";
import { getAllCalendarEvents } from "../../api/calendar";

export default function SuperAdminCalendarRedux() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Get role from Redux
  const userRole = useSelector((state) => state.user.role) || "user";

  useEffect(() => {
    fetchEvents();
  }, []);

  // 🔐 PUBLIC CALENDAR FILTER (Show only program_events and holidays for everyone)
  const filterByRole = (allEvents) => {
    return allEvents.filter((e) => {
      const type = e.extendedProps?.type || e.type;
      return type === "program_event" || type === "holiday";
    });
  };

  // Helper for event color coding
  const getEventColor = (type) => {
    const colors = {
      consultation: "#8b5cf6",
      holiday: "#ef4444",
      not_available: "#6b7280",
      program_event: "#3b82f6"
    };
    return colors[type] || "#3b82f6";
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getAllCalendarEvents();

      if (res?.success && Array.isArray(res.data)) {
        const now = new Date();

        // Apply role filter
        const roleFiltered = filterByRole(res.data);

        // Format and map colors
        const formatted = roleFiltered.map(event => {
          const type = event.extendedProps?.type || event.type || 'program_event';
          const color = event.color || getEventColor(type);
          return {
            ...event,
            color: color,
            backgroundColor: color,
            borderColor: color,
            textColor: "#ffffff"
          };
        });

        // Separate upcoming vs past
        const upcoming = formatted.filter((e) => new Date(e.start) >= now);
        const past = formatted.filter((e) => new Date(e.start) < now);

        setEvents(formatted);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      }
    } catch (err) {
      console.error("Error fetching calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight select-none">
            Event <span className="text-violet-400">Calendar</span>
          </h1>
          <div className="w-20 h-1.5 bg-violet-500 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-violet-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Stay updated with our upcoming webinars, trainings, and gender-responsive activities.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-10 pb-20">

      {/* ===================== */}
      {/* UPCOMING EVENTS */}
      {/* ===================== */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <CalendarIcon className="w-6 h-6 text-green-600" />
          Upcoming Events
        </h2>

        {upcomingEvents.length === 0 ? (
          <p className="text-gray-500">No upcoming events.</p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event._id}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500 font-medium">
                    <span className="font-bold text-gray-700">Schedule:</span> {new Date(event.start).toLocaleString()}
                  </p>
                  {event.extendedProps?.location && (
                    <p className="text-sm text-gray-500">
                      {event.extendedProps.location}
                    </p>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                  Upcoming
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===================== */}
      {/* CALENDAR VIEW */}
      {/* ===================== */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-8">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
          Calendar Schedule
        </h2>

        <div className="modern-calendar-container overflow-hidden">
          <style>{`
             .fc { font-family: inherit; --fc-border-color: #f1f5f9; --fc-today-bg-color: #f8fafc; }
             .fc .fc-toolbar-title { font-weight: 900; font-size: 1.25rem; color: #0f172a; }
             .fc .fc-button { background: white; border: 1px solid #e2e8f0; color: #64748b; font-weight: 700; text-transform: capitalize; border-radius: 12px; padding: 8px 16px; transition: all 0.2s; }
             .fc .fc-button:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
             .fc .fc-button-primary:not(:disabled).fc-button-active { background: #4f46e5; border-color: #4f46e5; color: white; }
             .fc .fc-col-header-cell { padding: 12px 0; background: #f8fafc; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; color: #94a3b8; border: none; }
             .fc td, .fc th { border-style: solid !important; }
             .fc-daygrid-event { border-radius: 6px; padding: 2px 4px; font-weight: 600; font-size: 0.75rem; border: none !important; }
             .fc .fc-toolbar {
               display: flex;
               flex-wrap: wrap;
               gap: 0.75rem;
               justify-content: space-between;
               align-items: center;
             }
             @media (max-width: 768px) {
               .fc .fc-toolbar {
                 flex-direction: column;
                 justify-content: center;
               }
               .fc .fc-toolbar-chunk {
                 display: flex;
                 justify-content: center;
                 width: 100%;
               }
               .fc .fc-toolbar-title {
                 font-size: 1.1rem !important;
                 text-align: center;
                 margin: 0.5rem 0 !important;
               }
               .fc .fc-button {
                 padding: 0.4rem 0.6rem !important;
                 font-size: 0.8rem !important;
                 border-radius: 8px !important;
               }
             }
           `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? "dayGridMonth" : "dayGridMonth"}
            height={isMobile ? "auto" : "70vh"}
            aspectRatio={isMobile ? 0.8 : 1.35}
            events={events} // filtered by role
            headerToolbar={isMobile ? {
              left: "prev,next today",
              center: "title",
              right: "",
            } : {
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            footerToolbar={isMobile ? {
              center: "dayGridMonth,timeGridWeek,timeGridDay"
            } : null}
            nowIndicator={true}
            dayMaxEvents={isMobile ? 2 : true}
            eventDisplay="block"
          />
        </div>
      </section>

      {/* ===================== */}
      {/* PAST EVENTS */}
      {/* ===================== */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <CalendarIcon className="w-6 h-6 text-gray-600" />
          Past Events
        </h2>

        {pastEvents.length === 0 ? (
          <p className="text-gray-500">No past events.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Event Date</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Location</th>
                </tr>
              </thead>
              <tbody>
                {pastEvents.map((event) => (
                  <tr key={event._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {new Date(event.start).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 font-medium">{event.title}</td>
                    <td className="px-4 py-2 capitalize">{event.type}</td>
                    <td className="px-4 py-2">
                      {event.extendedProps?.location || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      </div>
    </main>
  );
}
