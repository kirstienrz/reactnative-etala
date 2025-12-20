// import React, { useState, useEffect } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import { Calendar as CalendarIcon, RefreshCcw } from "lucide-react";
// import { getAllCalendarEvents } from "../../api/calendar";

// export default function ProgramEventCalendarUI() {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       const response = await getAllCalendarEvents();
//       if (response.success) {
//         // Only show program_event types
//         const programEvents = response.data.filter(
//           (event) => event.extendedProps?.type === "program_event"
//         );
//         setEvents(programEvents);
//       }
//     } catch (err) {
//       console.error("Failed to fetch events:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="bg-white min-h-screen flex items-center justify-center">
//         <p className="text-slate-600">Loading program events...</p>
//       </div>
//     );
//   }

//   return (
//     <main className="bg-white min-h-screen relative">
//       {/* Hero Section */}
//       <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
//         <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
//           <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight flex items-center justify-center gap-3">
//             <CalendarIcon className="w-10 h-10 text-white" />
//             Program Events
//           </h1>
//           <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
//           <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
//             Calendar view of all program events
//           </p>
//         </div>
//       </section>

//       {/* Calendar Section */}
//       <section className="py-12 bg-slate-50">
//         <div className="max-w-6xl mx-auto px-8">
//           <div className="flex justify-end mb-4 gap-2">
//             <button
//               onClick={fetchEvents}
//               className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200 font-medium"
//             >
//               <RefreshCcw className="w-4 h-4" />
//               Refresh
//             </button>
//           </div>

//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
//             <FullCalendar
//               plugins={[dayGridPlugin]}
//               initialView="dayGridMonth"
//               events={events} // only program_event
//               headerToolbar={{
//                 left: "prev,next today",
//                 center: "title",
//                 right: "dayGridMonth,dayGridWeek,dayGridDay",
//               }}
//               height="70vh"
//               eventClick={(info) =>
//                 alert(
//                   `Event: ${info.event.title}\nType: ${info.event.extendedProps.type}`
//                 )
//               }
//             />
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }


import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { 
  Calendar as CalendarIcon, 
  RefreshCcw, 
  Filter, 
  Grid, 
  List, 
  CalendarDays,
  Search,
  ChevronDown,
  X,
  Eye,
  EyeOff,
  Download,
  Share2,
  Info
} from "lucide-react";
import { getAllCalendarEvents } from "../../api/calendar";

export default function ProgramEventCalendarUI() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("month");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [eventStats, setEventStats] = useState({ total: 0, upcoming: 0, ongoing: 0 });
  const [showPastEvents, setShowPastEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
    calculateStats();
  }, [events, searchTerm, selectedCategories, showPastEvents]);

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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.extendedProps?.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event =>
        selectedCategories.includes(event.extendedProps?.category)
      );
    }

    // Filter past events
    if (!showPastEvents) {
      const now = new Date();
      filtered = filtered.filter(event => new Date(event.end || event.start) >= now);
    }

    setFilteredEvents(filtered);
  };

  const calculateStats = () => {
    const now = new Date();
    const total = events.length;
    const upcoming = events.filter(e => new Date(e.start) > now).length;
    const ongoing = events.filter(e => 
      new Date(e.start) <= now && new Date(e.end || e.start) >= now
    ).length;

    setEventStats({ total, upcoming, ongoing });
  };

  const getEventCategories = () => {
    const categories = new Set();
    events.forEach(event => {
      if (event.extendedProps?.category) {
        categories.add(event.extendedProps.category);
      }
    });
    return Array.from(categories);
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      description: info.event.extendedProps.description,
      category: info.event.extendedProps.category,
      location: info.event.extendedProps.location,
      organizer: info.event.extendedProps.organizer
    });
  };

  const handleExport = () => {
    // Export functionality
    console.log("Exporting events...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading program events...</p>
          <p className="text-sm text-slate-400 mt-2">Fetching your calendar data</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <CalendarIcon className="w-4 h-4 text-violet-300" />
                <span className="text-sm font-medium text-violet-200">Program Calendar</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Program Events
                <span className="block text-violet-300 text-3xl md:text-4xl lg:text-5xl font-light mt-2">
                  Calendar View
                </span>
              </h1>
              
              <p className="text-lg text-violet-200/80 max-w-2xl leading-relaxed">
                Track, manage, and explore all program events in one comprehensive calendar interface
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{eventStats.total}</div>
                  <div className="text-sm text-violet-200">Total Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{eventStats.upcoming}</div>
                  <div className="text-sm text-violet-200">Upcoming</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{eventStats.ongoing}</div>
                  <div className="text-sm text-violet-200">Ongoing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Control Panel */}
      <section className="relative -mt-8 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
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
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${showFilters ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {selectedCategories.length > 0 && (
                  <span className="bg-violet-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedCategories.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowPastEvents(!showPastEvents)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${showPastEvents ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}
              >
                {showPastEvents ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showPastEvents ? 'Showing All' : 'Hiding Past'}
              </button>

              <button
                onClick={fetchEvents}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>

              <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewType("month")}
                  className={`px-4 py-3 transition-all ${viewType === "month" ? 'bg-violet-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewType("week")}
                  className={`px-4 py-3 transition-all ${viewType === "week" ? 'bg-violet-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  <CalendarDays className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`px-4 py-3 transition-all ${viewType === "list" ? 'bg-violet-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-700">Filter by Category</h3>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-sm text-violet-600 hover:text-violet-800"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {getEventCategories().map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      if (selectedCategories.includes(category)) {
                        setSelectedCategories(selectedCategories.filter(c => c !== category));
                      } else {
                        setSelectedCategories([...selectedCategories, category]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategories.includes(category)
                        ? 'bg-violet-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-300 hover:border-violet-300'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <div>
              Showing <span className="font-semibold">{filteredEvents.length}</span> of{" "}
              <span className="font-semibold">{events.length}</span> events
            </div>
            {searchTerm && (
              <div className="flex items-center gap-2">
                Search results for: <span className="font-semibold">"{searchTerm}"</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-8 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Calendar */}
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
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                nowIndicator={true}
                editable={false}
                selectable={false}
                dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Panel */}
            {selectedEvent && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Event Details</h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-xl text-slate-900 mb-2">{selectedEvent.title}</h4>
                    {selectedEvent.category && (
                      <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-sm font-medium rounded-full">
                        {selectedEvent.category}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Date & Time</p>
                        <p className="text-slate-600">
                          {new Date(selectedEvent.start).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {selectedEvent.end && (
                          <p className="text-sm text-slate-500">
                            {new Date(selectedEvent.start).toLocaleTimeString()} -{" "}
                            {new Date(selectedEvent.end).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {selectedEvent.location && (
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 text-slate-400 mt-0.5">📍</div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Location</p>
                          <p className="text-slate-600">{selectedEvent.location}</p>
                        </div>
                      </div>
                    )}

                    {selectedEvent.organizer && (
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 text-slate-400 mt-0.5">👤</div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Organizer</p>
                          <p className="text-slate-600">{selectedEvent.organizer}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedEvent.description && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Description</p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all text-slate-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Calendar</span>
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all text-slate-700"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Calendar</span>
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Calendar Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-violet-600 rounded-sm"></div>
                  <span className="text-sm text-slate-600">Program Events</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-slate-300 rounded-sm"></div>
                  <span className="text-sm text-slate-600">Today's Indicator</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                  <span className="text-sm text-slate-600">Ongoing Events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}