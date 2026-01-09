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

//   // ✅ Correct: Get role from authSlice instead of userSlice
//   const userRole = useSelector((state) => state.auth.role) || "user";

//   useEffect(() => {
//     fetchEvents();
//   }, [userRole]); // refetch if role changes

//   // 🔐 ROLE-BASED FILTER
//  // Test muna sa console kung ano ang laman ng extendedProps
// const filterByRole = (allEvents) => {
//   console.log("=== EVENT INSPECTION ===");
  
//   // Check ang structure ng consultation events
//   allEvents.forEach((event, index) => {
//     if (event.title?.includes("Consultation")) {
//       console.log(`Consultation Event ${index}:`, {
//         title: event.title,
//         extendedProps: event.extendedProps,
//         typeFromExtProps: event.extendedProps?.type,
//         fullEvent: event
//       });
//     }
//   });
  
//   if (userRole === "superadmin") return allEvents;
  
//   // Simple working filter
//   return allEvents.filter(e => e.extendedProps?.type !== "consultation");
// };

//   const fetchEvents = async () => {
//   try {
//     setLoading(true);
//     const res = await getAllCalendarEvents();

//     console.log("User role:", userRole); // ✅ Check role
//     console.log("Raw data from API:", res.data); // ✅ Check lahat ng data
    
//     if (res?.success && Array.isArray(res.data)) {
//       const now = new Date();

//       // Apply role filter
//       const roleFiltered = filterByRole(res.data);
      
//       console.log("After filtering:", roleFiltered); // ✅ Check kung filtered na

//       // Separate upcoming vs past
//       const upcoming = roleFiltered.filter((e) => new Date(e.start) >= now);
//       const past = roleFiltered.filter((e) => new Date(e.start) < now);

//       setEvents(roleFiltered);
//       setUpcomingEvents(upcoming);
//       setPastEvents(past);
//     }
//   } catch (err) {
//     console.error("Error fetching calendar events:", err);
//   } finally {
//     setLoading(false);
//   }
// };

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

//       {/* ===================== */}
//       {/* UPCOMING EVENTS */}
//       {/* ===================== */}
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
//                 key={event._id}
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

//       {/* ===================== */}
//       {/* CALENDAR VIEW */}
//       {/* ===================== */}
//       <section className="bg-white rounded-xl border shadow-sm p-6">
//         <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
//           <CalendarIcon className="w-6 h-6 text-blue-600" />
//           Calendar
//         </h2>

//         <FullCalendar
//           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//           initialView="dayGridMonth"
//           height="70vh"
//           events={events} // filtered by role
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

//       {/* ===================== */}
//       {/* PAST EVENTS */}
//       {/* ===================== */}
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
//                   <tr key={event._id} className="border-b hover:bg-gray-50">
//                     <td className="px-4 py-2">
//                       {new Date(event.start).toLocaleDateString()}
//                     </td>
//                     <td className="px-4 py-2 font-medium">{event.title}</td>
//                     <td className="px-4 py-2 capitalize">{event.type}</td>
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
                key={event.id || event._id} // ✅ ADD KEY
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

      {/* PAST EVENTS */}
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
                  <tr 
                    key={event.id || event._id} // ✅ ADD KEY
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      {new Date(event.start).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 font-medium">{event.title}</td>
                    <td className="px-4 py-2 capitalize">
                      {event.extendedProps?.type || "event"}
                    </td>
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
  );
}