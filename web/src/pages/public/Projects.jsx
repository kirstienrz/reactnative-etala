import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  ChevronRight,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Download,
  Eye,
  X,
  Folder,
  FolderOpen,
  Grid,
  List,
  HardDrive,
  Music,
  Archive,
  Code,
  Table,
  Presentation,
  MapPin,
  Layers,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ExternalLink
} from "lucide-react";
import { getAllCalendarEvents } from "../../api/calendar";
import { toast } from "react-toastify";

export default function SuperAdminCalendarRedux() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // File preview states
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // ============= FILE HANDLING FUNCTIONS (copied from SuperAdminCalendarUI) =============

  // Get file icon based on file type
  const getFileIcon = (filename, fileType, mimeType, size = 'default') => {
    const iconSize = size === 'large' ? 'w-8 h-8' : 'w-5 h-5';
    
    // Check mimeType first
    if (mimeType) {
      if (mimeType.startsWith('image/')) {
        return <ImageIcon className={`${iconSize} text-blue-500`} />;
      } else if (mimeType.startsWith('video/')) {
        return <Video className={`${iconSize} text-red-500`} />;
      } else if (mimeType === 'application/pdf') {
        return <FileText className={`${iconSize} text-red-600`} />;
      }
    }
    
    // Check fileType from database
    if (fileType === 'image') {
      return <ImageIcon className={`${iconSize} text-blue-500`} />;
    } else if (fileType === 'video') {
      return <Video className={`${iconSize} text-red-500`} />;
    }
    
    // Fallback to extension check
    if (!filename) return <File className={`${iconSize} text-gray-500`} />;
    const ext = filename.split('.').pop().toLowerCase();
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
      return <ImageIcon className={`${iconSize} text-blue-500`} />;
    }
    // Videos
    if (['mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv', 'flv'].includes(ext)) {
      return <Video className={`${iconSize} text-red-500`} />;
    }
    // PDF
    if (ext === 'pdf') {
      return <FileText className={`${iconSize} text-red-600`} />;
    }
    // Documents
    if (['doc', 'docx', 'odt', 'txt', 'rtf'].includes(ext)) {
      return <FileText className={`${iconSize} text-blue-600`} />;
    }
    // Spreadsheets
    if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
      return <Table className={`${iconSize} text-green-600`} />;
    }
    // Presentations
    if (['ppt', 'pptx', 'odp'].includes(ext)) {
      return <Presentation className={`${iconSize} text-orange-500`} />;
    }
    // Audio
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
      return <Music className={`${iconSize} text-purple-500`} />;
    }
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Archive className={`${iconSize} text-gray-600`} />;
    }
    // Code
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'html', 'css', 'php', 'rb'].includes(ext)) {
      return <Code className={`${iconSize} text-indigo-500`} />;
    }
    
    return <File className={`${iconSize} text-gray-500`} />;
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
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
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
    return ['mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv', 'flv'].includes(ext);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle file preview
  const handleFilePreview = (file, files = []) => {
    setPreviewFiles(files.length > 0 ? files : [file]);
    setCurrentPreviewIndex(0);
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  // Handle next preview
  const handleNextPreview = () => {
    if (previewFiles.length > 0) {
      const nextIndex = (currentPreviewIndex + 1) % previewFiles.length;
      setCurrentPreviewIndex(nextIndex);
      setSelectedFile(previewFiles[nextIndex]);
    }
  };

  // Handle previous preview
  const handlePrevPreview = () => {
    if (previewFiles.length > 0) {
      const prevIndex = (currentPreviewIndex - 1 + previewFiles.length) % previewFiles.length;
      setCurrentPreviewIndex(prevIndex);
      setSelectedFile(previewFiles[prevIndex]);
    }
  };

  // Handle file download
  const handleFileDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalname || file.filename || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ============= FILE CATEGORIZATION =============

  // File type categorization
  const getFileCategory = (file) => {
    const filename = file.originalname || file.filename || file.name || '';
    const mimetype = file.mimetype || file.type || '';
    
    // Images
    if (mimetype.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(filename)) {
      return 'images';
    }
    // Videos
    if (mimetype.startsWith('video/') || /\.(mp4|avi|mov|wmv|webm|mkv|flv)$/i.test(filename)) {
      return 'videos';
    }
    // PDF Documents
    if (mimetype.includes('pdf') || /\.pdf$/i.test(filename)) {
      return 'pdf';
    }
    // Spreadsheets
    if (mimetype.includes('spreadsheet') || /\.(xls|xlsx|csv|ods)$/i.test(filename)) {
      return 'spreadsheets';
    }
    // Presentations
    if (mimetype.includes('presentation') || /\.(ppt|pptx|odp)$/i.test(filename)) {
      return 'presentations';
    }
    // Word Documents
    if (mimetype.includes('word') || /\.(doc|docx|odt)$/i.test(filename)) {
      return 'documents';
    }
    // Audio
    if (mimetype.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a)$/i.test(filename)) {
      return 'audio';
    }
    // Archives
    if (/\.(zip|rar|7z|tar|gz)$/i.test(filename)) {
      return 'archives';
    }
    // Code
    if (/\.(js|jsx|ts|tsx|py|java|cpp|html|css|php|rb)$/i.test(filename)) {
      return 'code';
    }
    // Others
    return 'others';
  };

  // Get category display name
  const getCategoryDisplay = (category) => {
    const categories = {
      images: { name: 'Images', icon: ImageIcon, color: 'blue' },
      videos: { name: 'Videos', icon: Video, color: 'red' },
      pdf: { name: 'PDF Documents', icon: FileText, color: 'red' },
      documents: { name: 'Documents', icon: FileText, color: 'blue' },
      spreadsheets: { name: 'Spreadsheets', icon: Table, color: 'green' },
      presentations: { name: 'Presentations', icon: Presentation, color: 'orange' },
      audio: { name: 'Audio', icon: Music, color: 'purple' },
      archives: { name: 'Archives', icon: Archive, color: 'gray' },
      code: { name: 'Code', icon: Code, color: 'indigo' },
      others: { name: 'Other Files', icon: File, color: 'gray' }
    };
    return categories[category] || categories.others;
  };

  // Group attachments by category
  const groupAttachmentsByCategory = (attachments) => {
    if (!attachments || attachments.length === 0) return {};
    
    const groups = {};

    attachments.forEach(file => {
      const category = getFileCategory(file);
      if (!groups[category]) {
        groups[category] = {
          ...getCategoryDisplay(category),
          files: []
        };
      }
      groups[category].files.push(file);
    });

    // Sort categories by file count (most files first)
    return Object.fromEntries(
      Object.entries(groups).sort((a, b) => b[1].files.length - a[1].files.length)
    );
  };

  // Get all unique categories from past events
  const allCategories = useMemo(() => {
    const categories = new Set();
    pastEvents.forEach(event => {
      if (event.attachments) {
        event.attachments.forEach(file => {
          categories.add(getFileCategory(file));
        });
      }
    });
    return Array.from(categories).map(cat => ({
      value: cat,
      ...getCategoryDisplay(cat)
    }));
  }, [pastEvents]);

  // ============= EVENT ORGANIZATION =============

  // Organize past events by year and month
  const organizedPastEvents = useMemo(() => {
    const organized = {};
    
    pastEvents.forEach((event) => {
      const date = new Date(event.start);
      const year = date.getFullYear();
      const month = date.getMonth();
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
    
    // Sort years in descending order
    const sortedYears = Object.values(organized).sort((a, b) => b.year - a.year);
    
    // Sort months in descending order within each year
    sortedYears.forEach(year => {
      const sortedMonths = Object.values(year.months).sort((a, b) => b.monthIndex - a.monthIndex);
      year.months = sortedMonths;
    });
    
    return sortedYears;
  }, [pastEvents]);

  // Get total attachments count and stats
  const attachmentStats = useMemo(() => {
    const stats = {
      total: 0,
      byType: {}
    };

    pastEvents.forEach(event => {
      if (event.attachments && event.attachments.length > 0) {
        event.attachments.forEach(file => {
          stats.total++;
          const category = getFileCategory(file);
          stats.byType[category] = (stats.byType[category] || 0) + 1;
        });
      }
    });

    return stats;
  }, [pastEvents]);

  // Filter events by selected category
  const getFilteredEvents = (events) => {
    if (selectedCategory === 'all') return events;
    
    return events.filter(event => 
      event.attachments?.some(file => 
        getFileCategory(file) === selectedCategory
      )
    );
  };

  // ============= FETCH EVENTS =============

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getAllCalendarEvents();

      if (res?.success && Array.isArray(res.data)) {
        const now = new Date();

        // Format events properly
        const formattedEvents = formatEvents(res.data);

        // Apply role filter
        const roleFiltered = filterByRole(formattedEvents);

        // Separate upcoming vs past
        const upcoming = roleFiltered.filter((e) => new Date(e.start) >= now);
        const past = roleFiltered.filter((e) => new Date(e.start) < now);

        setEvents(roleFiltered);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        
        // Auto-expand current year
        const currentYear = new Date().getFullYear();
        setExpandedYears({ [currentYear]: true });

        toast.success(`Loaded ${roleFiltered.length} events`);
      }
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Format events to ensure attachments are properly structured
  const formatEvents = (apiEvents) => {
    return apiEvents.map(event => {
      // Get attachments - check multiple possible locations
      let attachments = [];
      
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
          type: event.extendedProps?.type || event.type || 'consultation',
          description: event.description || event.extendedProps?.description || "",
          location: event.location || event.extendedProps?.location || "",
          notes: event.notes || event.extendedProps?.notes || "",
          status: event.extendedProps?.status || "upcoming",
          userName: event.extendedProps?.userName || event.userName || "Super Admin",
          userEmail: event.extendedProps?.userEmail || event.userEmail || event.email || "admin@example.com",
          mode: event.extendedProps?.mode || event.mode || "N/A",
          userId: event.userId || event.extendedProps?.userId,
        },
        attachments: formattedAttachments
      };
    });
  };

  // Toggle functions
  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const toggleMonth = (year, monthIndex) => {
    const key = `${year}-${monthIndex}`;
    setExpandedMonths(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
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
                key={event.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.start).toLocaleString()}
                    </p>
                    {event.extendedProps?.location && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {event.extendedProps.location}
                      </p>
                    )}
                    
                    {/* Attachments preview */}
                    {event.attachments && event.attachments.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <HardDrive size={16} className="text-gray-400" />
                          <span className="text-xs font-medium text-gray-600">
                            {event.attachments.length} file(s)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {event.attachments.slice(0, 5).map((file, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleFilePreview(file, event.attachments)}
                              className="relative group"
                            >
                              {isImageFile(file.originalname, file.type, file.mimetype) ? (
                                <div className="w-10 h-10 rounded border overflow-hidden">
                                  <img 
                                    src={file.url} 
                                    alt={file.originalname}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                                  {getFileIcon(file.originalname, file.type, file.mimetype, 'large')}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded transition-all flex items-center justify-center">
                                <Eye size={16} className="text-white opacity-0 group-hover:opacity-100" />
                              </div>
                            </button>
                          ))}
                          {event.attachments.length > 5 && (
                            <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center text-xs font-medium text-gray-600">
                              +{event.attachments.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 whitespace-nowrap">
                      Upcoming
                    </span>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1 whitespace-nowrap"
                      onClick={() => {
                        setSelectedProject(event);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </div>
                </div>
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

      {/* PAST EVENTS - GOOGLE DRIVE STYLE */}
      <section className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold">Project Archive</h2>
          </div>
          
          {/* Storage stats */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <HardDrive size={16} />
              <span>{pastEvents.length} projects</span>
            </div>
            <div className="text-sm text-gray-600">
              {attachmentStats.total} files
            </div>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                title="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Category filter chips */}
        {allCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by file type:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Files ({attachmentStats.total})
              </button>
              {allCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : `bg-${category.color}-50 text-${category.color}-700 hover:bg-${category.color}-100`
                  }`}
                >
                  <category.icon size={14} />
                  {category.name} ({attachmentStats.byType[category.value] || 0})
                </button>
              ))}
            </div>
          </div>
        )}

        {pastEvents.length === 0 ? (
          <p className="text-gray-500">No past events.</p>
        ) : (
          <div className="space-y-4">
            {organizedPastEvents.map((yearData) => {
              // Filter events in this year by selected category
              const filteredMonths = yearData.months
                .map(month => ({
                  ...month,
                  events: getFilteredEvents(month.events)
                }))
                .filter(month => month.events.length > 0);

              if (filteredMonths.length === 0) return null;

              return (
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
                      <Folder className={`w-5 h-5 ${expandedYears[yearData.year] ? 'text-blue-500' : 'text-gray-400'}`} />
                      <h3 className="text-xl font-bold text-gray-800">
                        {yearData.year}
                      </h3>
                      <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {filteredMonths.reduce((acc, month) => acc + month.events.length, 0)} projects
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {expandedYears[yearData.year] ? 'Hide' : 'Show'} months
                    </span>
                  </button>

                  {/* MONTHS */}
                  {expandedYears[yearData.year] && (
                    <div className="border-t">
                      {filteredMonths.map((monthData) => (
                        <div key={`${yearData.year}-${monthData.monthIndex}`} className="border-b last:border-b-0">
                          {/* MONTH HEADER */}
                          <button
                            onClick={() => toggleMonth(yearData.year, monthData.monthIndex)}
                            className="w-full flex items-center justify-between p-3 bg-gray-25 hover:bg-gray-50 text-left pl-12"
                          >
                            <div className="flex items-center gap-3">
                              {expandedMonths[`${yearData.year}-${monthData.monthIndex}`] ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                              <FolderOpen className="w-4 h-4 text-yellow-500" />
                              <h4 className="text-lg font-semibold text-gray-700">
                                {monthData.monthName}
                              </h4>
                              <span className="text-sm font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {monthData.events.length} projects
                              </span>
                            </div>
                          </button>

                          {/* PROJECTS */}
                          {expandedMonths[`${yearData.year}-${monthData.monthIndex}`] && (
                            <div className="pl-16 pr-4 pb-4">
                              <div className="space-y-3">
                                {monthData.events.map((event) => {
                                  const attachmentsByType = groupAttachmentsByCategory(event.attachments);
                                  const hasAttachments = Object.keys(attachmentsByType).length > 0;
                                  const isExpanded = expandedProjects[event.id];

                                  return (
                                    <div key={event.id} className="border rounded-lg bg-white">
                                      {/* Project Header */}
                                      <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                          <button
                                            onClick={() => toggleProject(event.id)}
                                            className="text-gray-400 hover:text-gray-600"
                                          >
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                          </button>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-gray-900">{event.title}</span>
                                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                event.extendedProps?.type === 'holiday' ? 'bg-red-100 text-red-700' :
                                                event.extendedProps?.type === 'consultation' ? 'bg-purple-100 text-purple-700' :
                                                event.extendedProps?.type === 'program_event' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                              }`}>
                                                {event.extendedProps?.type || "event"}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                              <span>{new Date(event.start).toLocaleDateString()}</span>
                                              {event.extendedProps?.location && (
                                                <span className="flex items-center gap-1">
                                                  <MapPin size={12} /> {event.extendedProps.location}
                                                </span>
                                              )}
                                              {event.attachments?.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                  <HardDrive size={12} /> {event.attachments.length} files
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setSelectedProject(event);
                                            setShowDetailsModal(true);
                                          }}
                                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                        >
                                          <Eye size={16} /> View
                                        </button>
                                      </div>

                                      {/* Attachments Grid (Google Drive Style) */}
                                      {isExpanded && hasAttachments && (
                                        <div className="p-3 border-t bg-gray-50">
                                          {viewMode === 'grid' ? (
                                            // GRID VIEW
                                            <div className="space-y-4">
                                              {Object.entries(attachmentsByType).map(([category, group]) => (
                                                <div key={category}>
                                                  <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <group.icon className={`w-4 h-4 text-${group.color}-500`} />
                                                    {group.name} ({group.files.length})
                                                  </h5>
                                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                    {group.files.map((file, idx) => (
                                                      <div
                                                        key={idx}
                                                        className="bg-white border rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer group"
                                                        onClick={() => handleFilePreview(file, event.attachments)}
                                                      >
                                                        {category === 'images' ? (
                                                          <div className="aspect-square rounded bg-gray-100 overflow-hidden mb-2">
                                                            <img 
                                                              src={file.url} 
                                                              alt={file.originalname}
                                                              className="w-full h-full object-cover"
                                                              onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                              }}
                                                            />
                                                          </div>
                                                        ) : (
                                                          <div className="aspect-square rounded bg-gray-100 mb-2 flex items-center justify-center">
                                                            {getFileIcon(file.originalname, file.type, file.mimetype, 'large')}
                                                          </div>
                                                        )}
                                                        <p className="text-xs truncate font-medium" title={file.originalname}>
                                                          {file.originalname || 'Untitled'}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-1">
                                                          <span className="text-xs text-gray-400">
                                                            {formatFileSize(file.size)}
                                                          </span>
                                                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                            <button
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleFileDownload(file);
                                                              }}
                                                              className="p-1 hover:bg-gray-200 rounded"
                                                              title="Download"
                                                            >
                                                              <Download size={14} />
                                                            </button>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            // LIST VIEW
                                            <div className="space-y-4">
                                              {Object.entries(attachmentsByType).map(([category, group]) => (
                                                <div key={category}>
                                                  <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <group.icon className={`w-4 h-4 text-${group.color}-500`} />
                                                    {group.name} ({group.files.length})
                                                  </h5>
                                                  <div className="bg-white rounded-lg border divide-y">
                                                    {group.files.map((file, idx) => (
                                                      <div
                                                        key={idx}
                                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => handleFilePreview(file, event.attachments)}
                                                      >
                                                        {getFileIcon(file.originalname, file.type, file.mimetype)}
                                                        <div className="flex-1 min-w-0">
                                                          <p className="text-sm font-medium text-gray-900 truncate">
                                                            {file.originalname || 'Untitled'}
                                                          </p>
                                                          <p className="text-xs text-gray-500">
                                                            {formatFileSize(file.size)}
                                                          </p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleFileDownload(file);
                                                            }}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                            title="Download"
                                                          >
                                                            <Download size={16} />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                Project Details
              </h3>
              <button 
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProject(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedProject.title}</h4>
                <p className="text-sm text-gray-700 mb-2">{selectedProject.extendedProps?.description || "No description."}</p>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="text-xs text-gray-500">Start:</span>
                    <div className="text-sm text-gray-900">{selectedProject.start ? new Date(selectedProject.start).toLocaleString() : "N/A"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">End:</span>
                    <div className="text-sm text-gray-900">{selectedProject.end ? new Date(selectedProject.end).toLocaleString() : "N/A"}</div>
                  </div>
                </div>
                {selectedProject.extendedProps?.location && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Location:</span>
                    <div className="text-sm text-gray-900">{selectedProject.extendedProps.location}</div>
                  </div>
                )}
                
                {/* Attachments in modal */}
                {selectedProject.attachments && selectedProject.attachments.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" /> 
                      Attachments ({selectedProject.attachments.length})
                    </h5>
                    
                    {/* Group by type in modal */}
                    {Object.entries(groupAttachmentsByCategory(selectedProject.attachments)).map(([category, group]) => (
                      <div key={category} className="mb-4">
                        <h6 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                          <group.icon className={`w-4 h-4 text-${group.color}-500`} />
                          {group.name} ({group.files.length})
                        </h6>
                        <div className="space-y-2">
                          {group.files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              {getFileIcon(file.originalname, file.type, file.mimetype)}
                              <span className="flex-1 text-sm truncate">{file.originalname || 'File'}</span>
                              <div className="flex gap-1">
                                <button
                                  className="p-1 text-gray-500 hover:text-blue-600 rounded"
                                  title="Preview"
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setShowFilePreview(true);
                                  }}
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="p-1 text-gray-500 hover:text-green-600 rounded"
                                  title="Download"
                                  onClick={() => handleFileDownload(file)}
                                >
                                  <Download size={16} />
                                </button>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                                  title="Open in new tab"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal - Copied from SuperAdminCalendarUI */}
      {showFilePreview && selectedFile && (
        <div className={`fixed inset-0 bg-black ${isFullscreen ? 'bg-black' : 'bg-opacity-90'} flex items-center justify-center z-[9999] p-4 transition-all`}> {/* z-[9999] for topmost, p-4 for spacing */}
          {/* Action buttons and file info bar OUTSIDE viewer, aligned */}
          <div className="absolute top-8 left-0 w-full flex items-center justify-between z-30">
            {/* File info bar for PDF */}
            {selectedFile.mimetype === 'application/pdf' && (
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
          <div className={`relative ${isFullscreen ? 'w-screen h-screen' : 'max-w-[1200px] w-full max-h-[95vh]'} mt-8 md:mt-16`}>
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
              {isImageFile(selectedFile.originalname, selectedFile.type, selectedFile.mimetype) && (
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

              {isVideoFile(selectedFile.originalname, selectedFile.type, selectedFile.mimetype) && (
                <video
                  controls
                  autoPlay
                  className={`${isFullscreen ? 'w-full h-full' : 'max-w-full max-h-[85vh]'} rounded-lg`}
                >
                  <source src={selectedFile.url} type={selectedFile.mimetype} />
                  Your browser does not support the video tag.
                </video>
              )}

              {/* PDF Preview */}
              {selectedFile.mimetype === 'application/pdf' && (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedFile.url)}&embedded=true`}
                    title={selectedFile.originalname}
                    className={`${isFullscreen ? 'w-full h-full' : 'max-w-full max-h-[90vh]'} rounded-lg bg-white`}
                    style={{ minHeight: '70vh', width: '100%', border: 'none', background: 'white' }}
                  >
                  </iframe>
                </div>
              )}

              {/* Other file types */}
              {!isImageFile(selectedFile.originalname, selectedFile.type, selectedFile.mimetype) && 
               !isVideoFile(selectedFile.originalname, selectedFile.type, selectedFile.mimetype) &&
               selectedFile.mimetype !== 'application/pdf' && (
                <>
                  <div className="flex items-center justify-center h-full">
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
                  </div>
                  {/* File info bar at bottom for other types */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg max-w-2xl w-full">
                    <div className="flex items-center justify-between">
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
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}