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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GADProjectsArchive() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Modern UI Styles
  const customStyles = `
    @keyframes mesh-gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-mesh {
      background: linear-gradient(-45deg, #1e1b4b, #312e81, #4c1d95, #1e293b);
      background-size: 400% 400%;
      animation: mesh-gradient 15s ease infinite;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .glass-card-light {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .text-glow {
      text-shadow: 0 0 20px rgba(167, 139, 250, 0.5);
    }
    .timeline-line::before {
      content: '';
      position: absolute;
      left: 23px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, #e2e8f0, #94a3b8, transparent);
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `;

  // File preview states
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const [viewMode, setViewMode] = useState('grid');

  // ✅ Get role from auth
  const userRole = useSelector((state) => state.auth?.role) || "user";

  useEffect(() => {
    fetchEvents();
  }, [userRole]);

  // 🔐 SIMPLE & CORRECT ROLE-BASED FILTER
  const filterByRole = (allEvents) => {
    if (userRole === "superadmin") return allEvents;
    // Public view: only show program_event types
    return allEvents.filter((e) => e.extendedProps?.type === "program_event");
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getAllCalendarEvents();

      if (res?.success && Array.isArray(res.data)) {
        const now = new Date();
        const formattedEvents = formatEvents(res.data);
        const roleFiltered = filterByRole(formattedEvents);

        // Separate upcoming vs past (include today's events in upcoming)
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const upcoming = roleFiltered.filter((e) => new Date(e.start) >= todayStart);
        const past = roleFiltered.filter((e) => new Date(e.start) < todayStart);

        setEvents(roleFiltered);
        setUpcomingEvents(upcoming.sort((a, b) => new Date(a.start) - new Date(b.start)));
        setPastEvents(past.sort((a, b) => new Date(b.start) - new Date(a.start)));

        // Auto-expand current year
        const currentYear = new Date().getFullYear();
        setExpandedYears({ [currentYear]: true });
      }
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const formatEvents = (apiEvents) => {
    return apiEvents.map(event => {
      let attachments = [];
      if (event.attachments && Array.isArray(event.attachments)) {
        attachments = event.attachments;
      } else if (event.extendedProps?.attachments && Array.isArray(event.extendedProps.attachments)) {
        attachments = event.extendedProps.attachments;
      } else if (event.files && Array.isArray(event.files)) {
        attachments = event.files;
      }

      const formattedAttachments = attachments.map(attachment => ({
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
      }));

      return {
        id: event._id || event.id,
        title: event.title || "Untitled Event",
        start: event.start,
        end: event.end || event.start,
        allDay: event.allDay || false,
        extendedProps: {
          type: event.extendedProps?.type || event.type || 'program_event',
          description: event.description || event.extendedProps?.description || "",
          location: event.location || event.extendedProps?.location || "",
          notes: event.notes || event.extendedProps?.notes || "",
          status: event.extendedProps?.status || "upcoming",
          userName: event.extendedProps?.userName || event.userName || "Super Admin",
          userEmail: event.extendedProps?.userEmail || event.userEmail || event.email || "admin@example.com",
          mode: event.extendedProps?.mode || event.mode || "N/A",
          userId: event.userId || event.extendedProps?.userId,
          attachments: formattedAttachments,
          source: event.extendedProps?.source || 'calendar'
        }
      };
    });
  };

  const archiveTree = useMemo(() => {
    const tree = {};
    pastEvents.forEach((event) => {
      const date = new Date(event.start);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if (!tree[year]) tree[year] = {};
      if (!tree[year][month]) tree[year][month] = [];
      tree[year][month].push(event);
    });
    return tree;
  }, [pastEvents]);

  const getFileIcon = (filename, fileType, mimeType, size = 'default') => {
    const iconSize = size === 'large' ? 'w-8 h-8' : 'w-5 h-5';
    if (mimeType?.startsWith('image/') || fileType === 'image') return <ImageIcon className={`${iconSize} text-blue-500`} />;
    if (mimeType?.startsWith('video/') || fileType === 'video') return <Video className={`${iconSize} text-red-500`} />;
    if (mimeType === 'application/pdf') return <FileText className={`${iconSize} text-red-600`} />;
    return <File className={`${iconSize} text-gray-500`} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (filename, fileType, mimeType) => mimeType?.startsWith('image/') || fileType === 'image';
  const isVideoFile = (filename, fileType, mimeType) => mimeType?.startsWith('video/') || fileType === 'video';

  const handleFilePreview = (file, files = []) => {
    setPreviewFiles(files.length > 0 ? files : [file]);
    setCurrentPreviewIndex(files.findIndex(f => f.url === file.url) || 0);
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleNextPreview = () => {
    const nextIndex = (currentPreviewIndex + 1) % previewFiles.length;
    setCurrentPreviewIndex(nextIndex);
    setSelectedFile(previewFiles[nextIndex]);
  };

  const handlePrevPreview = () => {
    const prevIndex = (currentPreviewIndex - 1 + previewFiles.length) % previewFiles.length;
    setCurrentPreviewIndex(prevIndex);
    setSelectedFile(previewFiles[prevIndex]);
  };

  const handleFileDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalname || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading projects archive...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] selection:bg-violet-100 selection:text-violet-900">
      <style>{customStyles}</style>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Hero Section */}
      <section className="relative py-24 animate-mesh overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              Official Projects & Events
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight text-glow">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Impact</span> & Journey
            </h1>
            <p className="text-xl text-violet-100/70 mb-2 leading-relaxed font-medium">
              Explore the history of gender-responsive initiatives, upcoming activities, and the milestone projects that shape our community.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">

            {/* CALENDAR SECTION */}
            <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <Grid size={24} />
                  </div>
                  Interactive Calendar
                </h2>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-100">
                  Live Schedule
                </div>
              </div>
              <div className="modern-calendar-container">
                <style>{`
                   .fc { font-family: inherit; --fc-border-color: #f1f5f9; --fc-today-bg-color: #f8fafc; }
                   .fc .fc-toolbar-title { font-weight: 900; font-size: 1.25rem; color: #0f172a; }
                   .fc .fc-button { background: white; border: 1px solid #e2e8f0; color: #64748b; font-weight: 700; text-transform: capitalize; border-radius: 12px; padding: 8px 16px; transition: all 0.2s; }
                   .fc .fc-button:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
                   .fc .fc-button-primary:not(:disabled).fc-button-active { background: #4f46e5; border-color: #4f46e5; color: white; }
                   .fc .fc-col-header-cell { padding: 12px 0; background: #f8fafc; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; color: #94a3b8; border: none; }
                   .fc td, .fc th { border-style: solid !important; }
                   .fc-daygrid-event { border-radius: 6px; padding: 2px 4px; font-weight: 600; font-size: 0.75rem; border: none !important; }
                 `}</style>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  height="75vh"
                  events={events}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek",
                  }}
                  nowIndicator={true}
                  dayMaxEvents={true}
                  eventDisplay="block"
                  eventClick={(info) => {
                    const event = events.find(e => (e.id || e._id) === info.event.id);
                    if (event) {
                      setSelectedProject(event);
                      setShowDetailsModal(true);
                    }
                  }}
                />
              </div>
            </section>

            {/* UPCOMING EVENTS SECTION */}
            <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl text-green-600">
                      <CalendarIcon size={24} />
                    </div>
                    Upcoming Initiatives
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Stay updated with our future activities</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-100">
                    Live Updates
                  </div>
                </div>
              </div>

              <div className="p-8">
                {upcomingEvents.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-400 font-medium italic">No upcoming events scheduled at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-6 relative timeline-line">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="relative pl-14 group cursor-pointer"
                        onClick={() => {
                          setSelectedProject(event);
                          setShowDetailsModal(true);
                        }}
                      >
                        {/* Timeline Point */}
                        <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center z-10 group-hover:border-violet-500 group-hover:scale-110 transition-all duration-300">
                          <div className="text-center">
                            <span className="block text-[10px] font-black text-slate-400 uppercase leading-none">
                              {new Date(event.start).toLocaleString('en-US', { month: 'short' })}
                            </span>
                            <span className="block text-lg font-black text-slate-900 leading-none mt-0.5">
                              {new Date(event.start).getDate()}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50/50 hover:bg-white p-6 rounded-2xl border border-transparent hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${event.extendedProps?.type === 'program_event' ? 'bg-blue-100 text-blue-700' :
                                    event.extendedProps?.type === 'training' ? 'bg-purple-100 text-purple-700' :
                                      'bg-amber-100 text-amber-700'
                                  }`}>
                                  {event.extendedProps?.type?.replace('_', ' ') || 'Event'}
                                </span>
                                {event.extendedProps?.location && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                    <MapPin size={10} /> {event.extendedProps.location}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors mb-2">
                                {event.title}
                              </h3>
                              <p className="text-slate-500 text-sm line-clamp-2 font-medium">
                                {event.extendedProps?.description || "Join us for this gender-responsive initiative designed to empower and educate."}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className="text-xs font-black text-slate-400">
                                {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-violet-600 hover:border-violet-200 transition-all">
                                <ChevronRight size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area - Archive Tree */}
          <div className="lg:col-span-4">
            <aside className="sticky top-24 space-y-8">
              <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Archive className="text-violet-500" size={20} />
                    Project Archive
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Historical data and accomplishments</p>
                </div>
                <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {Object.keys(archiveTree).length === 0 ? (
                    <p className="text-center py-10 text-slate-400 italic text-sm">No archived projects found.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.keys(archiveTree)
                        .sort((a, b) => b - a)
                        .map((year) => (
                          <div key={year} className="space-y-1">
                            <button
                              onClick={() => setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }))}
                              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 ${expandedYears[year] ? 'bg-violet-50 text-violet-700' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${expandedYears[year] ? 'bg-violet-500 text-white shadow-lg shadow-violet-200' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                  <Folder size={16} />
                                </div>
                                <span className="font-bold">{year}</span>
                              </div>
                              {expandedYears[year] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>

                            {expandedYears[year] && (
                              <div className="ml-6 pl-4 border-l-2 border-slate-100 space-y-1 mt-1">
                                {Object.keys(archiveTree[year])
                                  .sort((a, b) => b - a)
                                  .map((month) => (
                                    <div key={`${year}-${month}`} className="space-y-1">
                                      <button
                                        onClick={() => setExpandedMonths((prev) => ({ ...prev, [`${year}-${month}`]: !prev[`${year}-${month}`] }))}
                                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${expandedMonths[`${year}-${month}`] ? 'text-violet-600 bg-violet-50/50' : 'text-slate-600 hover:bg-slate-50'
                                          }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`w-1.5 h-1.5 rounded-full ${expandedMonths[`${year}-${month}`] ? 'bg-violet-500' : 'bg-slate-300'}`}></div>
                                          <span className="text-sm font-bold">
                                            {new Date(year, month - 1).toLocaleString('default', { month: 'long' })}
                                          </span>
                                        </div>
                                        {expandedMonths[`${year}-${month}`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                      </button>

                                      {expandedMonths[`${year}-${month}`] && (
                                        <div className="space-y-1 ml-3 mt-1">
                                          {archiveTree[year][month].map((project) => (
                                            <button
                                              key={project.id}
                                              onClick={() => {
                                                setSelectedProject(project);
                                                setShowDetailsModal(true);
                                              }}
                                              className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-white hover:text-violet-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all flex items-center gap-2 group"
                                            >
                                              <FileText size={14} className="text-slate-300 group-hover:text-violet-400" />
                                              <span className="truncate">{project.title}</span>
                                            </button>
                                          ))}
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
                </div>
              </section>

              {/* STATS PREVIEW */}
              <section className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-violet-200">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                  <Layers size={20} />
                  Archive Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <span className="block text-2xl font-black">{events.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">Total Projects</span>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <span className="block text-2xl font-black">{Object.keys(archiveTree).length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">Active Years</span>
                  </div>
                </div>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-full mt-6 py-3 bg-white text-violet-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-50 transition-colors"
                >
                  Back to Top
                </button>
              </section>
            </aside>
          </div>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowDetailsModal(false)}
          ></div>

          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="relative h-64 shrink-0 overflow-hidden">
              <div className="absolute inset-0 animate-mesh opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
                    {selectedProject.extendedProps?.type?.replace('_', ' ') || 'Project'}
                  </span>
                  <span className="flex items-center gap-1 text-white/80 text-xs font-bold">
                    <CalendarIcon size={12} /> {new Date(selectedProject.start).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white text-glow leading-tight line-clamp-2">
                  {selectedProject.title}
                </h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8 space-y-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FileText size={14} className="text-violet-500" /> Description
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {selectedProject.extendedProps?.description || "No detailed description provided for this project."}
                    </p>
                  </div>

                  {selectedProject.extendedProps?.notes && (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Key Notes</h3>
                      <p className="text-slate-600 text-sm font-medium italic">
                        "{selectedProject.extendedProps.notes}"
                      </p>
                    </div>
                  )}

                  {/* Attachments Section */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-violet-500" /> Project Assets
                      </div>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                        {selectedProject.extendedProps?.attachments?.length || 0} Files
                      </span>
                    </h3>

                    {selectedProject.extendedProps?.attachments?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedProject.extendedProps.attachments.map((file, i) => (
                          <div key={i} className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-violet-200 hover:shadow-lg hover:shadow-slate-100 transition-all flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-violet-50 transition-colors">
                              {getFileIcon(file.originalname, file.type, file.mimetype)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{file.originalname}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                              onClick={() => handleFilePreview(file, selectedProject.extendedProps.attachments)}
                              className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleFileDownload(file)}
                              className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <ImageIcon className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-slate-400 text-sm italic">No digital assets attached to this project.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-4 space-y-6">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Project Details</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <MapPin size={14} className="text-violet-500" />
                        </div>
                        <div>
                          <span className="block text-[10px] font-black text-slate-400 uppercase">Location</span>
                          <span className="text-sm font-bold text-slate-700">{selectedProject.extendedProps?.location || "TUPT Main"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <HardDrive size={14} className="text-violet-500" />
                        </div>
                        <div>
                          <span className="block text-[10px] font-black text-slate-400 uppercase">System Source</span>
                          <span className="text-sm font-bold text-slate-700 capitalize">{selectedProject.extendedProps?.source || "Calendar"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Maximize2 size={14} className="text-violet-500" />
                        </div>
                        <div>
                          <span className="block text-[10px] font-black text-slate-400 uppercase">Reference ID</span>
                          <span className="text-xs font-mono font-bold text-slate-500 truncate block w-32">{selectedProject.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-violet-100">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Timeline Status</p>
                    <p className="text-lg font-black mb-4">
                      {new Date(selectedProject.start) > new Date() ? 'Scheduled' : 'Historical Record'}
                    </p>
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className={`h-full bg-white transition-all duration-1000 ${new Date(selectedProject.start) > new Date() ? 'w-1/3' : 'w-full'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILE PREVIEW MODAL */}
      {showFilePreview && selectedFile && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <button
            onClick={() => setShowFilePreview(false)}
            className="absolute top-8 right-8 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <X size={24} />
          </button>

          <div className="w-full h-full flex flex-col items-center justify-center p-12">
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
              {isImageFile(selectedFile.originalname, selectedFile.type, selectedFile.mimetype) ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.originalname}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-500"
                />
              ) : isVideoFile(selectedFile.originalname, selectedFile.type, selectedFile.mimetype) ? (
                <video
                  src={selectedFile.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg shadow-2xl"
                />
              ) : (
                <div className="bg-white/5 p-16 rounded-[3rem] border border-white/10 text-center animate-in slide-in-from-bottom-10 duration-500">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    {getFileIcon(selectedFile.originalname, selectedFile.type, selectedFile.mimetype, 'large')}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">{selectedFile.originalname}</h3>
                  <p className="text-white/40 mb-8 font-medium">This file type cannot be previewed in the browser.</p>
                  <button
                    onClick={() => handleFileDownload(selectedFile)}
                    className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-violet-400 hover:text-white transition-all"
                  >
                    Download to View
                  </button>
                </div>
              )}

              {/* Navigation Arrows for Preview */}
              {previewFiles.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPreview}
                    className="absolute left-[-4rem] top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={handleNextPreview}
                    className="absolute right-[-4rem] top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>

            <div className="mt-8 px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <p className="text-white font-bold text-sm">
                Asset <span className="text-violet-400">{currentPreviewIndex + 1}</span> of <span className="text-violet-400">{previewFiles.length}</span> — {selectedFile.originalname}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}