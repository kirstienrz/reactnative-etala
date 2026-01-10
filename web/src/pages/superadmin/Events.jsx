import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { 
  Plus, 
  RefreshCcw, 
  Calendar as CalendarIcon, 
  X,
  Edit,
  Trash2,
  Search,
  Filter,
  User,
  Mail,
  MapPin,
  Clock
} from "lucide-react";
import { 
  getAllCalendarEvents, 
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getEventTypes
} from "../../api/calendar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SuperAdminCalendarUI() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "consultation",
    start: "",
    end: "",
    location: "",
    description: "",
    notes: "", // ✅ ADDED
    allDay: true,
    color: "",
    status: "upcoming"
  });
  
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    upcoming: 0,
    completed: 0
  });
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const eventTypes = getEventTypes();
  
  // Get event color based on type
  const getEventColor = (type) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType?.color || "#3b82f6";
  };

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getAllCalendarEvents();
      
      if (response.success) {
        const formattedEvents = formatEventsForCalendar(response.data);
        setEvents(formattedEvents);
        calculateStats(formattedEvents);
        
        console.log("📊 Events loaded:", {
          total: formattedEvents.length,
          types: [...new Set(formattedEvents.map(e => e.extendedProps?.type))]
        });
        
        toast.success(`Loaded ${formattedEvents.length} events`);
      } else {
        toast.error(response.message || "Failed to load events");
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Network error. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Format events for FullCalendar
  const formatEventsForCalendar = (apiEvents) => {
    return apiEvents.map(event => {
      const eventType = event.extendedProps?.type || event.type || 'consultation';
      const color = event.color || getEventColor(eventType);
      
      return {
        id: event._id || event.id,
        title: event.title || "Untitled Event",
        start: event.start,
        end: event.end || event.start,
        allDay: event.allDay || false,
        extendedProps: {
          ...event.extendedProps,
          type: eventType,
          description: event.description || event.extendedProps?.description || "",
          location: event.location || event.extendedProps?.location || "",
          notes: event.notes || event.extendedProps?.notes || "",
          status: event.status || event.extendedProps?.status || "upcoming",
          userName: event.extendedProps?.userName || "Super Admin",
          userEmail: event.extendedProps?.userEmail || "admin@example.com"
        },
        backgroundColor: color,
        borderColor: color,
        textColor: "#ffffff",
        editable: true,
        display: "block"
      };
    });
  };

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
      return eventDate >= now;
    }).length;

    const completed = eventData.filter(event => {
      const eventDate = new Date(event.end || event.start);
      return eventDate < now;
    }).length;

    setStats({ total, thisMonth, upcoming, completed });
  };

  // Filter events for table
  const filteredEvents = events.filter((event) => {
    const searchText = search.toLowerCase();
    const name = event.extendedProps?.userName?.toLowerCase() || "";
    const email = event.extendedProps?.userEmail?.toLowerCase() || "";
    const title = event.title?.toLowerCase() || "";
    const location = event.extendedProps?.location?.toLowerCase() || "";

    const matchesSearch = 
      name.includes(searchText) || 
      email.includes(searchText) || 
      title.includes(searchText) ||
      location.includes(searchText);

    const matchesType = 
      typeFilter === "all" || 
      event.extendedProps?.type === typeFilter;

    const matchesStatus = 
      statusFilter === "all" || 
      event.extendedProps?.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Event Handlers
  const handleDateClick = (info) => {
    setModalMode("create");
    setSelectedEvent(null);
    setFormData({
      title: "",
      type: "consultation",
      start: info.dateStr,
      end: info.dateStr,
      location: "",
      description: "",
      notes: "",
      allDay: true,
      color: getEventColor("consultation"),
      status: "upcoming"
    });
    setShowModal(true);
  };

  const handleEventClick = (info) => {
    const event = info.event;
    const extendedProps = event.extendedProps;
    
    setSelectedEvent({
      id: event.id,
      title: event.title,
      ...extendedProps,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay
    });
    
    // Show detailed modal instead of alert
    alert(`
      📅 ${event.title}
      📍 Type: ${extendedProps.type || 'N/A'}
      📍 Status: ${extendedProps.status || 'upcoming'}
      🕐 Date: ${new Date(event.startStr).toLocaleDateString()}
      ${extendedProps.location ? `📍 Location: ${extendedProps.location}` : ''}
      ${extendedProps.description ? `📝 Description: ${extendedProps.description}` : ''}
      ${extendedProps.notes ? `📋 Notes: ${extendedProps.notes}` : ''}
      👤 Booked by: ${extendedProps.userName || 'Super Admin'}
      ✉️ Email: ${extendedProps.userEmail || 'N/A'}
    `);
  };

  const handleEditEvent = (event) => {
    setModalMode("edit");
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      type: event.type || "consultation",
      start: event.start.split('T')[0],
      end: event.end ? event.end.split('T')[0] : event.start.split('T')[0],
      location: event.location || "",
      description: event.description || "",
      notes: event.notes || "",
      allDay: event.allDay !== undefined ? event.allDay : true,
      color: event.color || getEventColor(event.type),
      status: event.status || "upcoming"
    });
    setShowModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const response = await deleteCalendarEvent(eventId);
      if (response.success) {
        toast.success(response.message || "Event deleted successfully");
        fetchEvents(); // Refresh events
      } else {
        toast.error(response.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleSaveEvent = async () => {
    // Validate form
    if (!formData.title.trim()) {
      toast.error("Please enter event title");
      return;
    }
    
    if (!formData.start) {
      toast.error("Please select start date");
      return;
    }

    // Prepare event data for API
    const eventData = {
      title: formData.title.trim(),
      type: formData.type,
      start: formData.allDay ? formData.start : `${formData.start}T09:00:00`,
      end: formData.allDay ? (formData.end || formData.start) : `${formData.end || formData.start}T17:00:00`,
      location: formData.location.trim() || undefined,
      description: formData.description.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      allDay: formData.allDay,
      color: formData.color || getEventColor(formData.type),
      status: formData.status
    };

    console.log("📤 Saving event data:", eventData);

    try {
      let response;
      
      if (modalMode === "edit" && selectedEvent) {
        response = await updateCalendarEvent(selectedEvent.id, eventData);
      } else {
        response = await createCalendarEvent(eventData);
      }

      if (response.success) {
        toast.success(response.message || "Event saved successfully");
        await fetchEvents(); // Refresh events
        setShowModal(false);
        resetForm();
        setSelectedEvent(null);
      } else {
        // Show validation errors if any
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(err => toast.error(err));
        } else {
          toast.error(response.message || "Failed to save event");
        }
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event. Please try again.");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      type: "consultation",
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      location: "",
      description: "",
      notes: "",
      allDay: true,
      color: getEventColor("consultation"),
      status: "upcoming"
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Loading State
  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            Superadmin Calendar
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage Programs, Projects, Events, Holidays & Consultations
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          
          <button
            onClick={() => {
              setModalMode("create");
              setSelectedEvent(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm"
          >
            <Plus size={18} /> New Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {value}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                key === 'total' ? 'bg-blue-100' :
                key === 'thisMonth' ? 'bg-green-100' :
                key === 'upcoming' ? 'bg-orange-100' :
                'bg-gray-100'
              }`}>
                <CalendarIcon className={`h-5 w-5 ${
                  key === 'total' ? 'text-blue-600' :
                  key === 'thisMonth' ? 'text-green-600' :
                  key === 'upcoming' ? 'text-orange-600' :
                  'text-gray-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend for Color Coding */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Types:</h3>
        <div className="flex flex-wrap gap-4">
          {eventTypes.map((type) => (
            <div key={type.value} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: type.color }}
              ></div>
              <span className="text-sm text-gray-600 capitalize">
                {type.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Calendar Container */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="70vh"
          events={events}
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
          eventClassNames="cursor-pointer hover:opacity-90"
        />
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Events ({filteredEvents.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium">No events found</p>
                    <p className="text-sm mt-1">
                      {search || typeFilter !== "all" || statusFilter !== "all" 
                        ? "Try changing your filters" 
                        : "Create your first event by clicking 'New Event'"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-3 flex-shrink-0"
                          style={{ 
                            backgroundColor: event.backgroundColor || getEventColor('default') 
                          }}
                        ></div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </div>
                          {event.extendedProps?.description && (
                            <div className="text-sm text-gray-500 truncate">
                              {event.extendedProps.description}
                            </div>
                          )}
                          {event.extendedProps?.location && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <MapPin size={12} />
                              {event.extendedProps.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900">
                          {formatDate(event.start)}
                        </div>
                        {!event.allDay && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock size={12} />
                            {new Date(event.start).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: getEventColor(event.extendedProps?.type) }}
                        ></div>
                        <span className="text-sm text-gray-900 capitalize">
                          {event.extendedProps?.type?.replace('_', ' ') || 'event'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.extendedProps?.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : event.extendedProps?.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.extendedProps?.status || 'upcoming'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditEvent({
                            id: event.id,
                            title: event.title,
                            type: event.extendedProps?.type,
                            start: event.start,
                            end: event.end,
                            allDay: event.allDay,
                            location: event.extendedProps?.location,
                            description: event.extendedProps?.description,
                            notes: event.extendedProps?.notes,
                            status: event.extendedProps?.status,
                            color: event.backgroundColor
                          })}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit event"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Adding/Editing Event */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalMode === "edit" ? "Edit Event" : "Create New Event"}
                </h3>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Event Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>
                
                {/* Event Type and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setFormData({
                          ...formData, 
                          type: newType,
                          color: getEventColor(newType)
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    >
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                {/* Date Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.start}
                      onChange={(e) => setFormData({...formData, start: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.end}
                      onChange={(e) => setFormData({...formData, end: e.target.value})}
                      min={formData.start}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location (optional)"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    rows="3"
                  />
                </div>
                
                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    placeholder="Enter notes (optional)"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    rows="2"
                  />
                </div>
                
                {/* All Day Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={formData.allDay}
                    onChange={(e) => setFormData({...formData, allDay: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="allDay" className="text-sm text-gray-700">
                    All Day Event
                  </label>
                </div>
                
                {/* Color Selection */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Color:</span>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: formData.color || getEventColor(formData.type) }}
                  ></div>
                  <select
                    value={formData.color || getEventColor(formData.type)}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="#8b5cf6">Purple (Consultation)</option>
                    <option value="#ef4444">Red (Holiday)</option>
                    <option value="#3b82f6">Blue (Program)</option>
                    <option value="#6b7280">Gray (Not Available)</option>
                    <option value="#10b981">Green (Default)</option>
                  </select>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedEvent(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!formData.title.trim() || !formData.start}
                  >
                    {modalMode === "edit" ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}