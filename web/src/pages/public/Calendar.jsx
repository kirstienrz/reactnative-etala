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

  // ✅ Get role from Redux
  const userRole = useSelector((state) => state.user.role) || "user";

  useEffect(() => {
    fetchEvents();
  }, []);

  // 🔐 ROLE-BASED FILTER
  const filterByRole = (allEvents) => {
    if (userRole === "superadmin") return allEvents;
    // normal users: hide consultation
    return allEvents.filter((e) => e.type !== "consultation");
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getAllCalendarEvents();

      if (res?.success && Array.isArray(res.data)) {
        const now = new Date();

        // Apply role filter
        const roleFiltered = filterByRole(res.data);

        // Separate upcoming vs past
        const upcoming = roleFiltered.filter((e) => new Date(e.start) >= now);
        const past = roleFiltered.filter((e) => new Date(e.start) < now);

        setEvents(roleFiltered);
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

      <div className="max-w-7xl mx-auto p-6 space-y-10 pb-20">

      {/* ===================== */}
      {/* UPCOMING EVENTS */}
      {/* ===================== */}
      <section className="bg-white rounded-xl border shadow-sm p-6">
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
                  <p className="text-sm text-gray-500">
                    {new Date(event.start).toLocaleString()}
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
      <section className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          Calendar
        </h2>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="70vh"
          events={events} // filtered by role
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          nowIndicator={true}
          dayMaxEvents={true}
          eventDisplay="block"
        />
      </section>

      {/* ===================== */}
      {/* PAST EVENTS */}
      {/* ===================== */}
      <section className="bg-white rounded-xl border shadow-sm p-6">
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
                  <th className="px-4 py-3 text-left">Date</th>
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
