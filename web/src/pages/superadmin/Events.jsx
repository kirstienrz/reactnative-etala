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
  Clock,
  FileText,
  Download,
  Eye,
  Image as ImageIcon,
  Video,
  File,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from "lucide-react";
import { 
  getAllCalendarEvents, 
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getEventTypes
} from "../../api/calendar";
import API from '../../api/config';
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
    notes: "",
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [eventFiles, setEventFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const eventTypes = getEventTypes();
  
  // Get event color based on type
  const getEventColor = (type) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType?.color || "#3b82f6";
  };

  // Get file icon based on file type
  const getFileIcon = (filename, fileType, mimeType) => {
    // Check mimeType first
    if (mimeType) {
      if (mimeType.startsWith('image/')) {
        return <ImageIcon className="w-5 h-5" />;
      } else if (mimeType.startsWith('video/')) {
        return <Video className="w-5 h-5" />;
      } else if (mimeType === 'application/pdf') {
        return <FileText className="w-5 h-5" />;
      }
    }
    
    // Check fileType from database
    if (fileType === 'image') {
      return <ImageIcon className="w-5 h-5" />;
    } else if (fileType === 'video') {
      return <Video className="w-5 h-5" />;
    }
    
    // Fallback to extension check
    if (!filename) return <File className="w-5 h-5" />;
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon className="w-5 h-5" />;
    } else if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(ext)) {
      return <Video className="w-5 h-5" />;
    } else if (['pdf'].includes(ext)) {
      return <FileText className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  // Check if file is an image
  const isImageFile = (filename, fileType, mimeType) => {
    // Check mimeType first
    if (mimeType && mimeType.startsWith('image/')) return true;
    
    // Check fileType from database
    if (fileType === 'image') return true;
    
    // Fallback to extension check
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  // Check if file is a video
  const isVideoFile = (filename, fileType, mimeType) => {
    // Check mimeType first
    if (mimeType && mimeType.startsWith('video/')) return true;
    
    // Check fileType from database
    if (fileType === 'video') return true;
    
    // Fallback to extension check
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    return ['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(ext);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

  // Format events for calendar
  const formatEventsForCalendar = (apiEvents) => {
    return apiEvents.map(event => {
      const eventType = event.extendedProps?.type || event.type || 'consultation';
      const color = event.color || getEventColor(eventType);
      
      // Map 'scheduled' to 'upcoming' for display consistency
      const displayStatus = event.extendedProps?.status === 'scheduled' ? 'upcoming' : event.extendedProps?.status;
      
      // Get attachments - check multiple possible locations
      let attachments = [];
      
      // Try to get attachments from various possible locations in the data structure
      if (event.attachments && Array.isArray(event.attachments)) {
        attachments = event.attachments;
      } else if (event.extendedProps?.attachments && Array.isArray(event.extendedProps.attachments)) {
        attachments = event.extendedProps.attachments;
      } else if (event.files && Array.isArray(event.files)) {
        attachments = event.files;
      }
      
      // Format attachments
      const formattedAttachments = attachments.map(attachment => {
        return {
          url: attachment.url || attachment.secure_url || '',
          originalname: attachment.originalName || attachment.originalname || attachment.name || 'File',
          filename: attachment.filename || attachment.name || 'File',
          mimetype: attachment.mimeType || attachment.mimetype || attachment.format || 'application/octet-stream',
          size: attachment.size || attachment.bytes || 0,
          type: attachment.type || (attachment.mimetype?.startsWith('image/') ? 'image' : 
                 attachment.mimetype?.startsWith('video/') ? 'video' : 'other'),
          public_id: attachment.public_id,
          uploadedAt: attachment.uploadedAt || attachment.createdAt,
          _id: attachment._id
        };
      });
      
      return {
        id: event._id || event.id,
        title: event.title || "Untitled Event",
        start: event.start,
        end: event.end || event.start,
        allDay: event.allDay || false,
        extendedProps: {
          type: eventType,
          description: event.description || event.extendedProps?.description || "",
          location: event.location || event.extendedProps?.location || "",
          notes: event.notes || event.extendedProps?.notes || "",
          status: displayStatus || "upcoming",
          userName: event.extendedProps?.userName || event.userName || "Super Admin",
          userEmail: event.extendedProps?.userEmail || event.userEmail || event.email || "admin@example.com",
          mode: event.extendedProps?.mode || event.mode || "N/A",
          userId: event.userId || event.extendedProps?.userId,
          attachments: formattedAttachments
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
      allDay: event.allDay,
      backgroundColor: event.backgroundColor
    });
    
    setShowDetailsModal(true);
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
    setShowDetailsModal(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const response = await deleteCalendarEvent(eventId);
      if (response.success) {
        toast.success(response.message || "Event deleted successfully");
        setShowDetailsModal(false);
        fetchEvents();
      } else {
        toast.error(response.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleSaveEvent = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter event title");
      return;
    }
    if (!formData.start) {
      toast.error("Please select start date");
      return;
    }
    if (!formData.type || !formData.type.trim()) {
      toast.error("Please select event type");
      return;
    }

    // Get current user for userId
    const userStr = localStorage.getItem('user');
    let userId = null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user._id || user.id || null;
      } catch (e) {
        userId = null;
      }
    }

    // Use FormData for file uploads
    const form = new FormData();
    Object.entries({
      title: formData.title.trim(),
      type: formData.type.trim(),
      start: formData.allDay ? formData.start : `${formData.start}T09:00:00`,
      end: formData.allDay ? (formData.end || formData.start) : `${formData.end || formData.start}T17:00:00`,
      location: formData.location.trim() || undefined,
      description: formData.description.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      allDay: formData.allDay,
      color: formData.color || getEventColor(formData.type),
      status: formData.status,
      userId: userId
    }).forEach(([key, value]) => {
      if (value !== undefined) form.append(key, value);
    });
    eventFiles.forEach(file => form.append('attachments', file));

    try {
      let response;
      if (modalMode === "edit" && selectedEvent) {
        response = await updateCalendarEvent(selectedEvent.id, form);
      } else {
        response = await createCalendarEvent(form);
      }

      if (response.success) {
        toast.success(response.message || "Event saved successfully");
        await fetchEvents();
        setShowModal(false);
        resetForm();
        setSelectedEvent(null);
        setEventFiles([]);
      } else {
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(err => toast.error(err));
        } else {
          toast.error(response.message || "Failed to save event");
        }
      }
    } catch (error) {
      console.error("Error saving event:", error);
      if (error.response && error.response.data) {
        const errData = error.response.data;
        if (errData.errors && errData.errors.length > 0) {
          errData.errors.forEach(err => toast.error(err));
        } else {
          toast.error(errData.message || errData.error || "Failed to save event. Please try again.");
        }
      } else {
        toast.error(error.message || "Failed to save event. Please try again.");
      }
    }
  };

  const handleFilePreview = (file, files = []) => {
    setPreviewFiles(files.length > 0 ? files : [file]);
    setCurrentPreviewIndex(0);
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleNextPreview = () => {
    if (previewFiles.length > 0) {
      const nextIndex = (currentPreviewIndex + 1) % previewFiles.length;
      setCurrentPreviewIndex(nextIndex);
      setSelectedFile(previewFiles[nextIndex]);
    }
  };

  const handlePrevPreview = () => {
    if (previewFiles.length > 0) {
      const prevIndex = (currentPreviewIndex - 1 + previewFiles.length) % previewFiles.length;
      setCurrentPreviewIndex(prevIndex);
      setSelectedFile(previewFiles[prevIndex]);
    }
  };

  const handleFileDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalname || file.filename || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-items-center gap-2">
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
                  Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
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
                currentItems.map((event) => (
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
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.extendedProps?.attachments?.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {event.extendedProps.attachments.slice(0, 3).map((file, idx) => {
                              const isImage = isImageFile(
                                file.originalname || file.filename, 
                                file.type, 
                                file.mimetype
                              );
                              
                              return isImage ? (
                                <div 
                                  key={idx}
                                  className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden cursor-pointer hover:z-10 transition-transform hover:scale-110"
                                  onClick={() => handleFilePreview(file, event.extendedProps.attachments)}
                                >
                                  <img 
                                    src={file.url} 
                                    alt={file.originalname}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/32?text=Image';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div 
                                  key={idx}
                                  className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center cursor-pointer hover:z-10 transition-transform hover:scale-110"
                                  onClick={() => handleFilePreview(file, event.extendedProps.attachments)}
                                >
                                  {getFileIcon(file.originalname || file.filename, file.type, file.mimetype)}
                                </div>
                              );
                            })}
                          </div>
                          {event.extendedProps.attachments.length > 3 && (
                            <span className="text-xs text-gray-500 ml-1">
                              +{event.extendedProps.attachments.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const eventData = {
                              id: event.id,
                              title: event.title,
                              ...event.extendedProps,
                              start: event.start,
                              end: event.end,
                              allDay: event.allDay,
                              backgroundColor: event.backgroundColor
                            };
                            setSelectedEvent(eventData);
                            setShowDetailsModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
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

        {/* Pagination */}
        {filteredEvents.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEvents.length)} of {filteredEvents.length} events
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`px-3 py-1 border rounded-lg text-sm font-medium ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Event Details Modal */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-8">
            {/* Sticky header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                Event Details
              </h3>
              <button 
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Event Title */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedEvent.backgroundColor || '#3b82f6' }}
                  ></div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {selectedEvent.title}
                  </h4>
                </div>
              </div>

              {/* Type and Status */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {selectedEvent.type?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedEvent.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedEvent.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedEvent.status || 'upcoming'}
                  </span>
                </div>
              </div>

              {/* Date and Time */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedEvent.start)}
                  </p>
                  {!selectedEvent.allDay && (
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(selectedEvent.start).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {selectedEvent.end && ` - ${new Date(selectedEvent.end).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}`}
                    </p>
                  )}
                  {selectedEvent.allDay && (
                    <p className="text-sm text-gray-600 mt-1">All Day Event</p>
                  )}
                </div>
              </div>

              {/* Location */}
              {selectedEvent.location && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="text-sm text-gray-900">{selectedEvent.location}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedEvent.description && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Description</p>
                  <p className="text-sm text-gray-900 break-words whitespace-pre-line">{selectedEvent.description}</p>
                </div>
              )}

              {/* Notes */}
              {selectedEvent.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Notes</p>
                  <p className="text-sm text-gray-900 break-words whitespace-pre-line">{selectedEvent.notes}</p>
                </div>
              )}

              {/* Enhanced Attachments Section */}
              {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="text-sm font-semibold text-gray-900">
                        Attachments ({selectedEvent.attachments.length})
                      </h4>
                    </div>
                  </div>
                  
                  {/* Image Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedEvent.attachments.map((file, idx) => {
                      const isImage = isImageFile(
                        file.originalname || file.filename, 
                        file.type, 
                        file.mimetype
                      );
                      const isVideo = isVideoFile(
                        file.originalname || file.filename, 
                        file.type, 
                        file.mimetype
                      );
                      
                      return (
                        <div 
                          key={idx}
                          className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                          onClick={() => handleFilePreview(file, selectedEvent.attachments)}
                        >
                          {isImage ? (
                            <div className="aspect-square">
                              <img 
                                src={file.url} 
                                alt={file.originalname}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                                }}
                              />
                            </div>
                          ) : isVideo ? (
                            <div className="aspect-square bg-gray-900 flex items-center justify-center">
                              <Video className="w-8 h-8 text-white opacity-50" />
                            </div>
                          ) : (
                            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                              {getFileIcon(file.originalname || file.filename, file.type, file.mimetype)}
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                          
                          {/* File type badge */}
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {isImage ? 'Image' : isVideo ? 'Video' : 'File'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* User Info */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Booked by</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedEvent.userName || 'Super Admin'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedEvent.userEmail || 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedEvent.mode && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Mode</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedEvent.mode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Sticky footer for actions */}
            <div className="border-t border-gray-200 p-4 flex space-x-3 sticky bottom-0 bg-white z-10">
              <button
                onClick={() => handleEditEvent(selectedEvent)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} />
                Edit Event
              </button>
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced File Preview Modal */}
      {showFilePreview && selectedFile && (
        <div className={`fixed inset-0 bg-black ${isFullscreen ? 'bg-black' : 'bg-opacity-90'} flex items-center justify-center z-[60] p-4 transition-all`}>
          {/* Action buttons and file info bar OUTSIDE viewer, aligned */}
          <div className="absolute top-8 left-0 w-full flex items-center justify-between z-30">
            {/* File info bar for non-image/video files */}
            {!isImageFile(selectedFile.originalname || selectedFile.filename, selectedFile.type, selectedFile.mimetype) &&
             !isVideoFile(selectedFile.originalname || selectedFile.filename, selectedFile.type, selectedFile.mimetype) && (
              <div className="flex-1 flex items-center bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg max-w-2xl ml-8">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.originalname || selectedFile.filename || 'File'}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-300">
                    {selectedFile.size && selectedFile.size > 0 && (
                      <span>{formatFileSize(selectedFile.size)}</span>
                    )}
                    {selectedFile.mimetype && (
                      <span className="uppercase bg-gray-700 px-2 py-0.5 rounded">
                        {selectedFile.mimetype.includes('/') ? selectedFile.mimetype.split('/')[1] : selectedFile.mimetype}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleFileDownload(selectedFile)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm ml-4 whitespace-nowrap"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            )}
            {/* Action buttons */}
            <div className="flex gap-2 mr-8">
              <button
                onClick={() => {
                  setShowFilePreview(false);
                  setSelectedFile(null);
                  setPreviewFiles([]);
                  setIsFullscreen(false);
                }}
                className="pointer-events-auto text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                style={{ position: 'relative' }}
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="pointer-events-auto text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                style={{ position: 'relative' }}
              >
                {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <div className={`relative ${isFullscreen ? 'w-screen h-screen' : 'max-w-6xl w-full max-h-[90vh]'}`}>
            {/* Navigation buttons */}
            {previewFiles.length > 1 && (
              <>
                <button
                  onClick={handlePrevPreview}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextPreview}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* File counter */}
            {previewFiles.length > 1 && (
              <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm z-10">
                {currentPreviewIndex + 1} / {previewFiles.length}
              </div>
            )}

            {/* Media display */}
            <div className="flex items-center justify-center h-full">
              {isImageFile(selectedFile.originalname || selectedFile.filename, selectedFile.type, selectedFile.mimetype) && (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.originalname}
                  className={`${isFullscreen ? 'w-full h-full object-contain' : 'max-w-full max-h-[85vh] object-contain'} rounded-lg`}
                  onError={(e) => {
                    console.error('Image preview error:', selectedFile.url);
                    e.target.onerror = null;
                    e.target.parentElement.innerHTML = '<p class="text-white">Failed to load image</p>';
                  }}
                />
              )}

              {isVideoFile(selectedFile.originalname || selectedFile.filename, selectedFile.type, selectedFile.mimetype) && (
                <video
                  controls
                  autoPlay
                  className={`${isFullscreen ? 'w-full h-full' : 'max-w-full max-h-[85vh]'} rounded-lg`}
                >
                  <source src={selectedFile.url} type={selectedFile.mimetype} />
                  Your browser does not support the video tag.
                </video>
              )}

              {/* Other file types */}
              {!isImageFile(selectedFile.originalname || selectedFile.filename, selectedFile.type, selectedFile.mimetype) &&
               !isVideoFile(selectedFile.originalname || selectedFile.filename, selectedFile.type, selectedFile.mimetype) && (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  {/* PDF preview - check both mimetype and type */}
                  {['application/pdf', 'pdf'].includes(selectedFile.mimetype) || ['application/pdf', 'pdf'].includes(selectedFile.type) ? (
                    <iframe
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedFile.url)}&embedded=true`}
                      title={selectedFile.originalname}
                      className={`${isFullscreen ? 'w-full h-full' : 'max-w-full max-h-[90vh]'} rounded-lg bg-white`}
                      style={{ minHeight: '70vh', width: '100%', border: 'none', background: 'white' }}
                    />
                  ) : (
                    <div className="text-center text-white">
                      <File className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <p>Preview not available for this file type</p>
                      <button
                        onClick={() => handleFileDownload(selectedFile)}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
                      >
                        <Download size={18} />
                        Download File
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                    setEventFiles([]);
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
                      <option value="consultation">Consultation</option>
                      <option value="program_event">Program Event</option>
                      <option value="holiday">Holiday</option>
                      <option value="not_available">Not Available</option>
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

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attach Files (photos, videos, documents)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={e => setEventFiles(Array.from(e.target.files))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                  {eventFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-gray-600">Selected files:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {eventFiles.map((file, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            {getFileIcon(file.name, null)}
                            <span className="truncate">{file.name}</span>
                            <span className="text-gray-400">({formatFileSize(file.size)})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedEvent(null);
                      setEventFiles([]);
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