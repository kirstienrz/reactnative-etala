import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calendar, Users, Target, Plus, Edit2, Archive, X, Save, CheckCircle, Clock, Play, Filter, Search, BarChart3, Download, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import * as ProgramAPI from "../../api/program";

const GADProgramsViewer = () => {
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({});
  const [gadData, setGadData] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('all');
  const [showStats, setShowStats] = useState(true);
  const [yearFilter, setYearFilter] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showYearModal, setShowYearModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await ProgramAPI.getPrograms();
      // Access the data property from the response
      const programs = response.data || response;
      setGadData(Array.isArray(programs) ? programs : []);
      
      // Extract unique years from programs
      const years = [...new Set(programs
        .map(program => program.year)
        .filter(year => year)
        .sort((a, b) => b - a)
      )];
      setAvailableYears(years);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setGadData([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract year from date string (for events)
  const extractYearFromDate = (dateString) => {
    if (!dateString) return null;
    const yearMatch = dateString.match(/\d{4}/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  };

  // Filter functions with year filtering
  const filteredPrograms = gadData.filter(program => {
    const matchesSearch = program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    
    const matchesView = viewMode === 'all' || 
                       (viewMode === 'active' && !program.archived) ||
                       (viewMode === 'archived' && program.archived);

    // Year filtering - match program year or any project/event year
    const matchesYear = yearFilter === 'all' || 
                       program.year === parseInt(yearFilter) ||
                       program.projects?.some(project => 
                         project.year === parseInt(yearFilter) ||
                         project.events?.some(event => 
                           extractYearFromDate(event.date) === parseInt(yearFilter)
                         )
                       );

    return matchesSearch && matchesStatus && matchesView && matchesYear;
  });

  // Group programs by year
  const programsByYear = filteredPrograms.reduce((acc, program) => {
    const programYear = program.year || 'Uncategorized';
    
    if (!acc[programYear]) {
      acc[programYear] = [];
    }
    acc[programYear].push(program);
    
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(programsByYear).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return parseInt(b) - parseInt(a);
  });

  // Open year modal
  const openYearModal = (year) => {
    setSelectedYear(year);
    setShowYearModal(true);
  };

  // Close year modal
  const closeYearModal = () => {
    setSelectedYear(null);
    setShowYearModal(false);
    setExpandedPrograms({});
    setExpandedProjects({});
  };

  const toggleProgram = (programId) => {
    setExpandedPrograms(prev => ({ ...prev, [programId]: !prev[programId] }));
  };

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const openModal = (type, action, program = null, project = null, event = null) => {
    setModalType(type);
    setModalAction(action);
    setSelectedProgram(program);
    setSelectedProject(project);
    setFormErrors({});

    if (action === 'edit') {
      if (type === 'program') setFormData({ 
        name: program.name, 
        description: program.description,
        status: program.status || 'ongoing',
        year: program.year || new Date().getFullYear()
      });
      else if (type === 'project') setFormData({ 
        name: project.name,
        status: project.status || 'ongoing',
        year: project.year || new Date().getFullYear()
      });
      else if (type === 'event') setFormData({
        ...event,
        status: event.status || 'upcoming'
      });
    } else {
      const currentYear = new Date().getFullYear();
      if (type === 'program') setFormData({ status: 'ongoing', year: currentYear });
      else if (type === 'project') setFormData({ status: 'ongoing', year: currentYear });
      else if (type === 'event') setFormData({ status: 'upcoming' });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setSelectedProgram(null);
    setSelectedProject(null);
    setFormErrors({});
    setShowCalendar(false);
  };

  const validateForm = () => {
    const errors = {};

    if (modalType === 'program') {
      if (!formData.name || formData.name.trim() === '') {
        errors.name = 'Program name is required';
      } else if (formData.name.length < 3) {
        errors.name = 'Program name must be at least 3 characters long';
      }

      if (!formData.description || formData.description.trim() === '') {
        errors.description = 'Program description is required';
      } else if (formData.description.length < 10) {
        errors.description = 'Description must be at least 10 characters long';
      }

      if (!formData.year || formData.year < 2000 || formData.year > 2100) {
        errors.year = 'Please enter a valid year (2000-2100)';
      }
    }

    if (modalType === 'project') {
      if (!formData.name || formData.name.trim() === '') {
        errors.name = 'Project name is required';
      } else if (formData.name.length < 3) {
        errors.name = 'Project name must be at least 3 characters long';
      }

      if (!formData.year || formData.year < 2000 || formData.year > 2100) {
        errors.year = 'Please enter a valid year (2000-2100)';
      }
    }

    if (modalType === 'event') {
      if (!formData.title || formData.title.trim() === '') {
        errors.title = 'Event title is required';
      } else if (formData.title.length < 3) {
        errors.title = 'Event title must be at least 3 characters long';
      }

      if (!formData.date || formData.date.trim() === '') {
        errors.date = 'Event date is required';
      } else if (!isValidDate(formData.date)) {
        errors.date = 'Please enter a valid date (e.g., March 15, 2025)';
      }

      if (!formData.participants || formData.participants === '') {
        errors.participants = 'Number of participants is required';
      } else if (formData.participants < 1) {
        errors.participants = 'Participants must be at least 1';
      } else if (formData.participants > 10000) {
        errors.participants = 'Participants cannot exceed 10,000';
      }

      if (!formData.venue || formData.venue.trim() === '') {
        errors.venue = 'Venue is required';
      } else if (formData.venue.length < 3) {
        errors.venue = 'Venue must be at least 3 characters long';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidDate = (dateString) => {
    const datePattern = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$/;
    return datePattern.test(dateString);
  };

  const StatusBadge = ({ status, type }) => {
    const statusConfig = {
      upcoming: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, label: 'Upcoming' },
      ongoing: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Play, label: 'Ongoing' },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: X, label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.ongoing;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const ProgressBar = ({ completed, total, color = 'bg-blue-600' }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 font-medium min-w-[50px]">
          {completed}/{total}
        </span>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (modalType === 'program') {
        if (modalAction === 'add') {
          await ProgramAPI.createProgram(formData);
        } else if (modalAction === 'edit') {
          await ProgramAPI.updateProgram(selectedProgram._id, formData);
        }
      } else if (modalType === 'project') {
        if (modalAction === 'add') {
          await ProgramAPI.addProject(selectedProgram._id, formData);
        } else if (modalAction === 'edit') {
          await ProgramAPI.updateProject(selectedProgram._id, selectedProject._id, formData);
        }
      } else if (modalType === 'event') {
        if (modalAction === 'add') {
          await ProgramAPI.addEvent(selectedProgram._id, selectedProject._id, formData);
        } else if (modalAction === 'edit') {
          await ProgramAPI.updateEvent(selectedProgram._id, selectedProject._id, selectedProject.eventId || formData._id, formData);
        }
      }

      await fetchPrograms();
      closeModal();
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const handleArchive = async (type, programId, projectId = null, eventId = null) => {
    try {
      console.log('Archive action:', { type, programId, projectId, eventId });

      if (type === 'program') {
        const program = gadData.find(p => p._id === programId);
        if (!program) {
          console.error('Program not found');
          return;
        }
        if (program.archived) {
          await ProgramAPI.restoreProgram(programId);
        } else {
          await ProgramAPI.archiveProgram(programId);
        }
      } else if (type === 'project') {
        const program = gadData.find(p => p._id === programId);
        if (!program) {
          console.error('Program not found');
          return;
        }
        const project = program.projects.find(p => p._id === projectId);
        if (!project) {
          console.error('Project not found');
          return;
        }
        if (project.archived) {
          await ProgramAPI.restoreProject(programId, projectId);
        } else {
          await ProgramAPI.archiveProject(programId, projectId);
        }
      } else if (type === 'event') {
        const program = gadData.find(p => p._id === programId);
        if (!program) {
          console.error('Program not found');
          return;
        }
        const project = program.projects.find(p => p._id === projectId);
        if (!project) {
          console.error('Project not found');
          return;
        }
        const event = project.events.find(e => e._id === eventId);
        if (!event) {
          console.error('Event not found');
          return;
        }
        if (event.archived) {
          await ProgramAPI.restoreEvent(programId, projectId, eventId);
        } else {
          await ProgramAPI.archiveEvent(programId, projectId, eventId);
        }
      }

      await fetchPrograms();
    } catch (err) {
      console.error("Error archiving/unarchiving:", err);
    }
  };

  const handleStatusUpdate = async (type, programId, projectId = null, eventId = null, newStatus) => {
    try {
      console.log('Status update:', { type, programId, projectId, eventId, newStatus });
      
      if (!programId) {
        console.error('Invalid program ID');
        return;
      }

      if (type === 'program') {
        await ProgramAPI.updateProgramStatus(programId, newStatus);
      } else if (type === 'project') {
        if (!projectId) {
          console.error('Invalid project ID');
          return;
        }
        await ProgramAPI.updateProject(programId, projectId, { status: newStatus });
      } else if (type === 'event') {
        if (!projectId || !eventId) {
          console.error('Invalid project or event ID');
          return;
        }
        await ProgramAPI.updateEvent(programId, projectId, eventId, { status: newStatus });
      }

      await fetchPrograms();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const getStats = () => {
    const totalPrograms = gadData.length;
    const activePrograms = gadData.filter(prog => !prog.archived && prog.status !== 'completed').length;
    const completedPrograms = gadData.filter(prog => prog.status === 'completed').length;
    
    const allProjects = gadData.flatMap(prog => prog.projects || []);
    const activeProjects = allProjects.filter(proj => !proj.archived && proj.status !== 'completed').length;
    const completedProjects = allProjects.filter(proj => proj.status === 'completed').length;
    
    const allEvents = gadData.flatMap(prog => 
      (prog.projects || []).flatMap(proj => proj.events || [])
    );
    const upcomingEvents = allEvents.filter(evt => evt.status === 'upcoming').length;
    const ongoingEvents = allEvents.filter(evt => evt.status === 'ongoing').length;
    const completedEvents = allEvents.filter(evt => evt.status === 'completed').length;

    return {
      totalPrograms,
      activePrograms,
      completedPrograms,
      activeProjects,
      completedProjects,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalEvents: upcomingEvents + ongoingEvents + completedEvents
    };
  };

  const stats = getStats();

  // Get programs for selected year
  const yearPrograms = selectedYear ? (programsByYear[selectedYear] || []) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-8 h-8 text-blue-600" />
                GAD Programs at Proyekto
              </h1>
              <p className="text-gray-500 text-sm">
                Gender and Development Programs Management (SuperAdmin)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showStats ? 'Hide Stats' : 'Show Stats'}</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => openModal('program', 'add')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Add Program</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search programs, projects, events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="all">All Items</option>
                <option value="active">Active Only</option>
                <option value="archived">Archived Only</option>
              </select>
            </div>
            <div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Showing {filteredPrograms.length} of {gadData.length} programs</span>
              {yearFilter !== 'all' && <span>Year: {yearFilter}</span>}
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{stats.completedPrograms} completed</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>{stats.activePrograms} ongoing</span>
              </span>
            </div>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setViewMode('all');
                setYearFilter('all');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Programs Progress</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedPrograms}/{stats.totalPrograms}</p>
                  <div className="mt-2">
                    <ProgressBar completed={stats.completedPrograms} total={stats.totalPrograms} color="bg-blue-600" />
                  </div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Projects Progress</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedProjects}/{stats.activeProjects + stats.completedProjects}</p>
                  <div className="mt-2">
                    <ProgressBar completed={stats.completedProjects} total={stats.activeProjects + stats.completedProjects} color="bg-green-600" />
                  </div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Events Status</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEvents}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-600">{stats.upcomingEvents} upcoming</span>
                      <span className="text-orange-600">{stats.ongoingEvents} ongoing</span>
                      <span className="text-green-600">{stats.completedEvents} done</span>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round((stats.completedPrograms + stats.completedProjects) / (stats.totalPrograms + stats.activeProjects + stats.completedProjects) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Overall progress</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Year Cards Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Programs by Year</h2>
          {filteredPrograms.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || viewMode !== 'all' || yearFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first program'
                }
              </p>
              <button
                onClick={() => openModal('program', 'add')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold inline-flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Add Program</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedYears.map(year => {
                const programs = programsByYear[year];
                const completedCount = programs.filter(p => p.status === 'completed').length;
                const ongoingCount = programs.filter(p => p.status === 'ongoing').length;
                const upcomingCount = programs.filter(p => p.status === 'upcoming').length;
                
                return (
                  <YearCard 
                    key={year}
                    year={year}
                    programCount={programs.length}
                    completedCount={completedCount}
                    ongoingCount={ongoingCount}
                    upcomingCount={upcomingCount}
                    onClick={() => openYearModal(year)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Year Modal */}
        {showYearModal && (
          <YearModal
            year={selectedYear}
            programs={yearPrograms}
            expandedPrograms={expandedPrograms}
            expandedProjects={expandedProjects}
            toggleProgram={toggleProgram}
            toggleProject={toggleProject}
            openModal={openModal}
            handleArchive={handleArchive}
            handleStatusUpdate={handleStatusUpdate}
            onClose={closeYearModal}
            StatusBadge={StatusBadge}
            ProgressBar={ProgressBar}
          />
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <Modal 
            modalType={modalType}
            modalAction={modalAction}
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            closeModal={closeModal}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

// Year Card Component
const YearCard = ({ year, programCount, completedCount, ongoingCount, upcomingCount, onClick }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-300 group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {year}
            </h3>
            <p className="text-gray-500 text-sm">{programCount} program{programCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{completedCount}/{programCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${programCount > 0 ? (completedCount / programCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
          {completedCount} Done
        </div>
        <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded-lg text-xs font-medium">
          {ongoingCount} Ongoing
        </div>
        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
          {upcomingCount} Upcoming
        </div>
      </div>
    </div>
  );
};

// Year Modal Component
const YearModal = ({ 
  year, 
  programs, 
  expandedPrograms,
  expandedProjects,
  toggleProgram,
  toggleProject,
  openModal,
  handleArchive,
  handleStatusUpdate,
  onClose,
  StatusBadge,
  ProgressBar
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">{year} Programs</h2>
                  <p className="text-blue-100">{programs.length} program{programs.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Year Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{programs.filter(p => p.status === 'completed').length}</div>
              <div className="text-blue-100 text-sm">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{programs.filter(p => p.status === 'ongoing').length}</div>
              <div className="text-blue-100 text-sm">Ongoing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{programs.filter(p => p.status === 'upcoming').length}</div>
              <div className="text-blue-100 text-sm">Upcoming</div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {programs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No programs for {year}</h3>
                <p>Start by adding a new program for this year</p>
              </div>
            ) : (
              programs.map((program) => (
                <ProgramCard 
                  key={program._id}
                  program={program}
                  expandedPrograms={expandedPrograms}
                  expandedProjects={expandedProjects}
                  toggleProgram={toggleProgram}
                  toggleProject={toggleProject}
                  openModal={openModal}
                  handleArchive={handleArchive}
                  handleStatusUpdate={handleStatusUpdate}
                  StatusBadge={StatusBadge}
                  ProgressBar={ProgressBar}
                />
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Program Card Component
const ProgramCard = ({ 
  program, 
  expandedPrograms, 
  expandedProjects, 
  toggleProgram, 
  toggleProject, 
  openModal, 
  handleArchive, 
  handleStatusUpdate,
  StatusBadge,
  ProgressBar 
}) => {
  const completedProjects = program.projects?.filter(p => p.status === 'completed').length || 0;
  const totalProjects = program.projects?.length || 0;

  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all duration-300 ${
      program.archived ? 'opacity-60 border-gray-300' : 
      program.status === 'completed' ? 'border-green-200 bg-green-50' :
      program.status === 'cancelled' ? 'border-red-200 bg-red-50' :
      'border-gray-200 hover:shadow-md'
    }`}>
      {/* Program Header */}
      <div className={`p-6 bg-gradient-to-r text-white ${
        program.status === 'completed' ? 'from-green-600 to-green-700' :
        program.status === 'cancelled' ? 'from-red-600 to-red-700' :
        'from-blue-600 to-blue-700'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1 cursor-pointer" onClick={() => toggleProgram(program._id)}>
            {expandedPrograms[program._id] ? 
              <ChevronDown className="w-6 h-6 mt-1 flex-shrink-0" /> : 
              <ChevronRight className="w-6 h-6 mt-1 flex-shrink-0" />
            }
            <Target className="w-5 h-5 mt-1.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold">
                  {program.name} {program.archived && '(Archived)'}
                </h2>
                <StatusBadge status={program.status} type="program" />
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">{program.description}</p>
              
              {/* Program Progress */}
              <div className="mt-3 bg-white bg-opacity-20 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Project Progress</span>
                  <span className="text-sm font-bold">{completedProjects}/{totalProjects}</span>
                </div>
                <ProgressBar completed={completedProjects} total={totalProjects} color="bg-white" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
              {totalProjects} Projects
            </span>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                openModal('program', 'edit', program); 
              }}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
              title="Edit Program"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                handleArchive('program', program._id); 
              }}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
              title={program.archived ? "Unarchive" : "Archive"}
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Status Actions */}
        <div className="flex items-center space-x-2 mb-3">
          {program.status !== 'completed' && (
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                handleStatusUpdate('program', program._id, null, null, 'completed'); 
              }}
              className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center space-x-1 hover:bg-opacity-30 transition-all duration-200"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark as Completed</span>
            </button>
          )}
          {program.status !== 'ongoing' && program.status !== 'completed' && (
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                handleStatusUpdate('program', program._id, null, null, 'ongoing'); 
              }}
              className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center space-x-1 hover:bg-opacity-30 transition-all duration-200"
            >
              <Play className="w-4 h-4" />
              <span>Mark as Ongoing</span>
            </button>
          )}
        </div>
        
        {expandedPrograms[program._id] && !program.archived && (
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              openModal('project', 'add', program); 
            }}
            className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 hover:bg-opacity-30 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Projects List */}
      {expandedPrograms[program._id] && (
        <div className="p-6 bg-gray-50">
          {!program.projects || program.projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No projects yet</p>
              <button
                onClick={() => openModal('project', 'add', program)}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first project
              </button>
            </div>
          ) : (
            program.projects.map((project) => (
              <ProjectCard 
                key={project._id}
                program={program}
                project={project}
                expandedProjects={expandedProjects}
                toggleProject={toggleProject}
                openModal={openModal}
                handleArchive={handleArchive}
                handleStatusUpdate={handleStatusUpdate}
                StatusBadge={StatusBadge}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ 
  program, 
  project, 
  expandedProjects, 
  toggleProject, 
  openModal, 
  handleArchive, 
  handleStatusUpdate,
  StatusBadge 
}) => {
  const completedEvents = project.events?.filter(e => e.status === 'completed').length || 0;
  const totalEvents = project.events?.length || 0;

  return (
    <div className={`mb-4 last:mb-0 ${project.archived ? 'opacity-60' : ''} ${
      project.status === 'completed' ? 'border-green-200 bg-green-50' : ''
    }`}>
      <div className={`bg-white rounded-lg border shadow-sm transition-all duration-300 ${
        project.status === 'completed' ? 'border-green-200 hover:shadow-md' : 'border-gray-200 hover:shadow-md'
      }`}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-2 flex-1 cursor-pointer" onClick={() => toggleProject(project._id)}>
              {expandedProjects[project._id] ? 
                <ChevronDown className="w-5 h-5 mt-1 text-blue-600 flex-shrink-0" /> : 
                <ChevronRight className="w-5 h-5 mt-1 text-blue-600 flex-shrink-0" />
              }
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">
                    {project.name} {project.archived && '(Archived)'}
                  </h3>
                  <StatusBadge status={project.status} type="project" />
                  {project.year && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      {project.year}
                    </span>
                  )}
                </div>
                {/* Project Events Progress */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                  <span>{totalEvents} Events</span>
                  {totalEvents > 0 && (
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{completedEvents} completed</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => { e.stopPropagation(); openModal('project', 'edit', program, project); }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="Edit Project"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleArchive('project', program._id, project._id); }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title={project.archived ? "Unarchive" : "Archive"}
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Project Status Actions */}
          <div className="flex items-center space-x-2 mb-3">
            {project.status !== 'completed' && (
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusUpdate('project', program._id, project._id, null, 'completed'); }}
                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center space-x-1 hover:bg-green-700 transition-all duration-200"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark as Completed</span>
              </button>
            )}
            {project.status !== 'ongoing' && project.status !== 'completed' && (
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusUpdate('project', program._id, project._id, null, 'ongoing'); }}
                className="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center space-x-1 hover:bg-orange-700 transition-all duration-200"
              >
                <Play className="w-4 h-4" />
                <span>Mark as Ongoing</span>
              </button>
            )}
          </div>

          {expandedProjects[project._id] && !project.archived && (
            <button
              onClick={(e) => { e.stopPropagation(); openModal('event', 'add', program, project); }}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 mb-3 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          )}

          {expandedProjects[project._id] && (
            <div className="border-t border-gray-200 pt-3 space-y-2">
              {!project.events || project.events.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p>No events scheduled</p>
                </div>
              ) : (
                project.events.map((event) => (
                  <EventCard 
                    key={event._id}
                    program={program}
                    project={project}
                    event={event}
                    openModal={openModal}
                    handleArchive={handleArchive}
                    handleStatusUpdate={handleStatusUpdate}
                    StatusBadge={StatusBadge}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ 
  program, 
  project, 
  event, 
  openModal, 
  handleArchive, 
  handleStatusUpdate,
  StatusBadge 
}) => {
  return (
    <div className={`bg-gray-50 p-3 rounded-lg border transition-all duration-300 ${
      event.status === 'completed' ? 'border-green-200 bg-green-50' :
      event.status === 'upcoming' ? 'border-blue-200 bg-blue-50' :
      event.status === 'ongoing' ? 'border-orange-200 bg-orange-50' :
      'border-gray-200'
    } ${event.archived ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-gray-900">
              {event.title} {event.archived && '(Archived)'}
            </h4>
            <StatusBadge status={event.status} type="event" />
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              {event.date}
            </p>
            <p className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              {event.participants} participants
            </p>
            <p className="text-gray-600">📍 {event.venue}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Event Status Actions */}
          <div className="flex flex-col space-y-1 mr-2">
            {event.status !== 'completed' && (
              <button
                onClick={() => handleStatusUpdate('event', program._id, project._id, event._id, 'completed')}
                className="p-1 text-green-600 hover:bg-green-100 rounded transition-all duration-200"
                title="Mark as Completed"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            {event.status !== 'ongoing' && event.status !== 'completed' && (
              <button
                onClick={() => handleStatusUpdate('event', program._id, project._id, event._id, 'ongoing')}
                className="p-1 text-orange-600 hover:bg-orange-100 rounded transition-all duration-200"
                title="Mark as Ongoing"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            {event.status !== 'upcoming' && event.status !== 'completed' && (
              <button
                onClick={() => handleStatusUpdate('event', program._id, project._id, event._id, 'upcoming')}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-all duration-200"
                title="Mark as Upcoming"
              >
                <Clock className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => openModal('event', 'edit', program, project, event)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Edit Event"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleArchive('event', program._id, project._id, event._id)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title={event.archived ? "Unarchive" : "Archive"}
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Component (Simplified - removed CalendarPicker for now)
const Modal = ({ 
  modalType, 
  modalAction, 
  formData, 
  setFormData, 
  formErrors, 
  closeModal, 
  handleSubmit
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {modalAction === 'add' ? 'Add' : 'Edit'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h3>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {modalType === 'program' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter program name"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    rows="3"
                    placeholder="Enter program description"
                  />
                  {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="2024"
                    min="2000"
                    max="2100"
                  />
                  {formErrors.year && <p className="text-red-500 text-sm mt-1">{formErrors.year}</p>}
                </div>
              </>
            )}

            {modalType === 'project' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter project name"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="2024"
                    min="2000"
                    max="2100"
                  />
                  {formErrors.year && <p className="text-red-500 text-sm mt-1">{formErrors.year}</p>}
                </div>
              </>
            )}

            {modalType === 'event' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter event title"
                  />
                  {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="text"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="March 15, 2025"
                  />
                  {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participants
                  </label>
                  <input
                    type="number"
                    value={formData.participants || ''}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="50"
                  />
                  {formErrors.participants && <p className="text-red-500 text-sm mt-1">{formErrors.participants}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue || ''}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter venue"
                  />
                  {formErrors.venue && <p className="text-red-500 text-sm mt-1">{formErrors.venue}</p>}
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};   

export default GADProgramsViewer;