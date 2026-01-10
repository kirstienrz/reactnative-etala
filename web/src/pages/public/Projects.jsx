
// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import { Calendar as CalendarIcon } from "lucide-react";
// import { getAllCalendarEvents } from "../../api/calendar";

// export default function SuperAdminCalendarRedux() {
//   const [loading, setLoading] = useState(true);
//   const [events, setEvents] = useState([]);
//   const [upcomingEvents, setUpcomingEvents] = useState([]);
//   const [pastEvents, setPastEvents] = useState([]);

//   // ✅ Get role from auth
//   const userRole = useSelector((state) => state.auth.role) || "user";

//   useEffect(() => {
//     fetchEvents();
//   }, [userRole]);

//   // 🔐 SIMPLE & CORRECT ROLE-BASED FILTER
//   const filterByRole = (allEvents) => {
//     if (userRole === "superadmin") return allEvents;
    
//     // Hide consultation events for non-superadmin
//     return allEvents.filter((e) => e.extendedProps?.type !== "consultation");
//   };

//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       const res = await getAllCalendarEvents();

//       if (res?.success && Array.isArray(res.data)) {
//         const now = new Date();

//         // Apply role filter
//         const roleFiltered = filterByRole(res.data);

//         // Separate upcoming vs past
//         const upcoming = roleFiltered.filter((e) => new Date(e.start) >= now);
//         const past = roleFiltered.filter((e) => new Date(e.start) < now);

//         setEvents(roleFiltered);
//         setUpcomingEvents(upcoming);
//         setPastEvents(past);
//       }
//     } catch (err) {
//       console.error("Error fetching calendar events:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading calendar data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 space-y-10">

//       {/* UPCOMING EVENTS */}
//       <section className="bg-white rounded-xl border shadow-sm p-6">
//         <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
//           <CalendarIcon className="w-6 h-6 text-green-600" />
//           Upcoming Events
//         </h2>

//         {upcomingEvents.length === 0 ? (
//           <p className="text-gray-500">No upcoming events.</p>
//         ) : (
//           <div className="space-y-4">
//             {upcomingEvents.map((event) => (
//               <div
//                 key={event.id || event._id} // ✅ ADD KEY
//                 className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
//               >
//                 <div>
//                   <p className="font-semibold text-gray-900">{event.title}</p>
//                   <p className="text-sm text-gray-500">
//                     {new Date(event.start).toLocaleString()}
//                   </p>
//                   {event.extendedProps?.location && (
//                     <p className="text-sm text-gray-500">
//                       {event.extendedProps.location}
//                     </p>
//                   )}
//                 </div>
//                 <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
//                   Upcoming
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* CALENDAR VIEW */}
//       <section className="bg-white rounded-xl border shadow-sm p-6">
//         <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
//           <CalendarIcon className="w-6 h-6 text-blue-600" />
//           Calendar
//         </h2>

//         <FullCalendar
//           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//           initialView="dayGridMonth"
//           height="70vh"
//           events={events}
//           headerToolbar={{
//             left: "prev,next today",
//             center: "title",
//             right: "dayGridMonth,timeGridWeek,timeGridDay",
//           }}
//           nowIndicator={true}
//           dayMaxEvents={true}
//           eventDisplay="block"
//         />
//       </section>

//       {/* PAST EVENTS */}
//       <section className="bg-white rounded-xl border shadow-sm p-6">
//         <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
//           <CalendarIcon className="w-6 h-6 text-gray-600" />
//           Past Events
//         </h2>

//         {pastEvents.length === 0 ? (
//           <p className="text-gray-500">No past events.</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead className="bg-gray-50 border-b">
//                 <tr>
//                   <th className="px-4 py-3 text-left">Date</th>
//                   <th className="px-4 py-3 text-left">Title</th>
//                   <th className="px-4 py-3 text-left">Type</th>
//                   <th className="px-4 py-3 text-left">Location</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pastEvents.map((event) => (
//                   <tr 
//                     key={event.id || event._id} // ✅ ADD KEY
//                     className="border-b hover:bg-gray-50"
//                   >
//                     <td className="px-4 py-2">
//                       {new Date(event.start).toLocaleDateString()}
//                     </td>
//                     <td className="px-4 py-2 font-medium">{event.title}</td>
//                     <td className="px-4 py-2 capitalize">
//                       {event.extendedProps?.type || "event"}
//                     </td>
//                     <td className="px-4 py-2">
//                       {event.extendedProps?.location || "—"}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }


import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Calendar as CalendarIcon, ChevronDown, ChevronRight } from "lucide-react";
import { getAllCalendarEvents } from "../../api/calendar";

export default function SuperAdminCalendarRedux() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});

  // ✅ Get role from auth
  const userRole = useSelector((state) => state.auth.role) || "user";

  useEffect(() => {
    fetchEvents();
  }, [userRole]);

  // 🔐 SIMPLE & CORRECT ROLE-BASED FILTER
  const filterByRole = (allEvents) => {
    if (userRole === "superadmin") return allEvents;
    
    // Hide consultation events for non-superadmin
    return allEvents.filter((e) => e.extendedProps?.type !== "consultation");
  };

  // Organize past events by year and month
  const organizedPastEvents = useMemo(() => {
    const organized = {};
    
    pastEvents.forEach((event) => {
      const date = new Date(event.start);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const monthName = date.toLocaleString('default', { month: 'long' });
      
      if (!organized[year]) {
        organized[year] = {
          year,
          months: {},
          eventCount: 0
        };
      }
      
      if (!organized[year].months[month]) {
        organized[year].months[month] = {
          monthIndex: month,
          monthName,
          events: [],
          eventCount: 0
        };
      }
      
      organized[year].months[month].events.push(event);
      organized[year].months[month].eventCount++;
      organized[year].eventCount++;
    });
    
    // Sort years in descending order (newest first)
    const sortedYears = Object.values(organized).sort((a, b) => b.year - a.year);
    
    // Sort months in descending order within each year
    sortedYears.forEach(year => {
      const sortedMonths = Object.values(year.months).sort((a, b) => b.monthIndex - a.monthIndex);
      year.months = sortedMonths;
    });
    
    return sortedYears;
  }, [pastEvents]);

  // Toggle year expansion
  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  // Toggle month expansion
  const toggleMonth = (year, monthIndex) => {
    const key = `${year}-${monthIndex}`;
    setExpandedMonths(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
        
        // Auto-expand current year
        const currentYear = new Date().getFullYear();
        setExpandedYears({ [currentYear]: true });
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
    <div className="min-h-screen bg-gray-50 p-6 space-y-10">

      {/* UPCOMING EVENTS */}
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
                key={event.id || event._id}
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

      {/* CALENDAR VIEW */}
      <section className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          Calendar
        </h2>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="70vh"
          events={events}
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

      {/* PAST EVENTS - ORGANIZED BY YEAR & MONTH */}
      <section className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <CalendarIcon className="w-6 h-6 text-gray-600" />
          Past Events
          <span className="ml-2 text-sm font-normal bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {pastEvents.length} total events
          </span>
        </h2>

        {pastEvents.length === 0 ? (
          <p className="text-gray-500">No past events.</p>
        ) : (
          <div className="space-y-6">
            {organizedPastEvents.map((yearData) => (
              <div key={yearData.year} className="border rounded-lg overflow-hidden">
                {/* YEAR HEADER */}
                <button
                  onClick={() => toggleYear(yearData.year)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left"
                >
                  <div className="flex items-center gap-3">
                    {expandedYears[yearData.year] ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <h3 className="text-xl font-bold text-gray-800">
                      {yearData.year}
                    </h3>
                    <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {yearData.eventCount} events
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {expandedYears[yearData.year] ? 'Hide' : 'Show'} months
                  </span>
                </button>

                {/* MONTHS LIST */}
                {expandedYears[yearData.year] && (
                  <div className="border-t">
                    {yearData.months.map((monthData) => (
                      <div key={`${yearData.year}-${monthData.monthIndex}`} className="border-b last:border-b-0">
                        {/* MONTH HEADER */}
                        <button
                          onClick={() => toggleMonth(yearData.year, monthData.monthIndex)}
                          className="w-full flex items-center justify-between p-4 bg-gray-25 hover:bg-gray-50 text-left"
                        >
                          <div className="flex items-center gap-3 ml-8">
                            {expandedMonths[`${yearData.year}-${monthData.monthIndex}`] ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <h4 className="text-lg font-semibold text-gray-700">
                              {monthData.monthName}
                            </h4>
                            <span className="text-sm font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {monthData.eventCount} events
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {expandedMonths[`${yearData.year}-${monthData.monthIndex}`] ? 'Hide' : 'Show'} events
                          </span>
                        </button>

                        {/* EVENTS TABLE */}
                        {expandedMonths[`${yearData.year}-${monthData.monthIndex}`] && (
                          <div className="ml-12 p-4 bg-white">
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
                                  {monthData.events.map((event) => (
                                    <tr 
                                      key={event.id || event._id}
                                      className="border-b hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-2">
                                        {new Date(event.start).toLocaleDateString('en-US', {
                                          weekday: 'short',
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </td>
                                      <td className="px-4 py-2 font-medium">{event.title}</td>
                                      <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          event.extendedProps?.type === 'holiday' ? 'bg-red-100 text-red-700' :
                                          event.extendedProps?.type === 'consultation' ? 'bg-purple-100 text-purple-700' :
                                          event.extendedProps?.type === 'program_event' ? 'bg-blue-100 text-blue-700' :
                                          'bg-gray-100 text-gray-700'
                                        }`}>
                                          {event.extendedProps?.type || "event"}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2">
                                        {event.extendedProps?.location || "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}