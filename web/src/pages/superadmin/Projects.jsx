// import React, { useState, useEffect, useMemo } from 'react';
// import { ChevronDown, ChevronRight, Calendar, Users, Target, Plus, Edit2, Archive, X, Save, CheckCircle, Clock, Play, Search, BarChart3, Filter, Menu, Kanban, List, Trash2, Loader2 } from 'lucide-react';
// import {
//   getAllPrograms,
//   createProgram,
//   updateProgram,
//   deleteProgram,
//   addProject,
//   updateProject,
//   deleteProject,
//   addEvent,
//   updateEvent,
//   deleteEvent
// } from '../../api/program';

// const GADProgramsHybrid = () => {
//   // All state declarations first
//   const [programs, setPrograms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedProgram, setSelectedProgram] = useState(null);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [yearFilter, setYearFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [viewMode, setViewMode] = useState('cards');
//   const [expandedProjects, setExpandedProjects] = useState({});
//   const [expandedYears, setExpandedYears] = useState({});
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState('');
//   const [formData, setFormData] = useState({});

//   // Fetch on mount
//   useEffect(() => {
//     fetchPrograms();
//   }, []);

//   // ✅ FIXED: Fetch programs with optional filters
//   const fetchPrograms = async (applyFilters = true) => {
//     try {
//       setLoading(true);
//       const response = await getAllPrograms(applyFilters ? {
//         year: yearFilter !== 'all' ? yearFilter : undefined,
//         status: statusFilter !== 'all' ? statusFilter : undefined,
//         search: searchTerm || undefined
//       } : {});

//       if (response.success) {
//         setPrograms(response.data);
//         if (response.data.length > 0 && !selectedProgram) {
//           setSelectedProgram(response.data[0]);
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching programs:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ FIXED: handleSave now fetches without filters
//   const handleSave = async () => {
//     try {
//       let savedProgramId = selectedProgram?._id;

//       if (modalType === 'program') {
//         if (formData._id) {
//           await updateProgram(formData._id, formData);
//           savedProgramId = formData._id;
//         } else {
//           const response = await createProgram(formData);
//           if (response.success) {
//             savedProgramId = response.data._id;
//           }
//         }
//       } else if (modalType === 'project') {
//         if (formData._id) {
//           await updateProject(selectedProgram._id, formData._id, formData);
//         } else {
//           await addProject(selectedProgram._id, formData);
//         }
//       } else if (modalType === 'event') {
//         const projectId = formData.projectId;
//         if (formData._id) {
//           await updateEvent(selectedProgram._id, projectId, formData._id, formData);
//         } else {
//           await addEvent(selectedProgram._id, projectId, formData);
//         }
//       }

//       // ✅ Refresh WITHOUT applying filters so we don't lose the updated program
//       const response = await getAllPrograms({});
//       if (response.success) {
//         setPrograms(response.data);

//         // Find and set the updated program as selected
//         const updatedProgram = response.data.find(p => p._id === savedProgramId);
//         if (updatedProgram) {
//           setSelectedProgram(updatedProgram);
//         }
//       }

//       setShowModal(false);
//       setFormData({});
//     } catch (err) {
//       console.error('Error saving:', err);
//     }
//   };

//   // Get unique years
//   const availableYears = useMemo(() => {
//     return [...new Set(programs.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
//   }, [programs]);

//   // Filter programs for sidebar
//   const filteredPrograms = useMemo(() => {
//     return programs.filter(p => {
//       const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesYear = yearFilter === 'all' || p.year === parseInt(yearFilter);
//       const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
//       return matchesSearch && matchesYear && matchesStatus;
//     });
//   }, [programs, searchTerm, yearFilter, statusFilter]);

//   // Group by year for sidebar
//   const programsByYear = useMemo(() => {
//     return filteredPrograms.reduce((acc, program) => {
//       const year = program.year || 'Uncategorized';
//       if (!acc[year]) acc[year] = [];
//       acc[year].push(program);
//       return acc;
//     }, {});
//   }, [filteredPrograms]);

//   const sortedYears = useMemo(() => {
//     return Object.keys(programsByYear).sort((a, b) => {
//       if (a === 'Uncategorized') return 1;
//       if (b === 'Uncategorized') return -1;
//       return parseInt(b) - parseInt(a);
//     });
//   }, [programsByYear]);

//   // Auto-expand the first year
//   useEffect(() => {
//     if (sortedYears.length > 0 && Object.keys(expandedYears).length === 0) {
//       setExpandedYears({ [sortedYears[0]]: true });
//     }
//   }, [sortedYears, expandedYears]);

//   const toggleProject = (projectId) => {
//     setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
//   };

//   const toggleYear = (year) => {
//     setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
//   };

//   const getStats = (program) => {
//     if (!program) return { totalProjects: 0, completedProjects: 0, totalEvents: 0, completedEvents: 0 };

//     const projects = program.projects || [];
//     const totalProjects = projects.length;
//     const completedProjects = projects.filter(p => p.status === 'completed').length;

//     const events = projects.flatMap(p => p.events || []);
//     const totalEvents = events.length;
//     const completedEvents = events.filter(e => e.status === 'completed').length;

//     return { totalProjects, completedProjects, totalEvents, completedEvents };
//   };

//   const StatusBadge = ({ status }) => {
//     const config = {
//       upcoming: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, label: 'Upcoming' },
//       ongoing: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Play, label: 'Ongoing' },
//       completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Completed' },
//       cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: X, label: 'Cancelled' }
//     };
//     const conf = config[status] || config.ongoing;
//     const Icon = conf.icon;
//     return (
//       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${conf.color}`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {conf.label}
//       </span>
//     );
//   };

//   const ProgressBar = ({ completed, total }) => {
//     const percentage = total > 0 ? (completed / total) * 100 : 0;
//     return (
//       <div className="flex items-center space-x-2">
//         <div className="flex-1 bg-gray-200 rounded-full h-2">
//           <div
//             className="h-2 rounded-full bg-blue-600 transition-all duration-300"
//             style={{ width: `${percentage}%` }}
//           />
//         </div>
//         <span className="text-xs text-gray-600 font-medium min-w-[50px]">
//           {completed}/{total}
//         </span>
//       </div>
//     );
//   };

//   const stats = selectedProgram ? getStats(selectedProgram) : null;

//   if (loading) {
//     return (
//       <div className="h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading programs...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen bg-gray-50 flex overflow-hidden">
//       {/* Sidebar */}
//       <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-0' : 'w-80'}`}>
//         {/* Sidebar Header */}
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-2">
//               <Target className="w-6 h-6 text-blue-600" />
//               <h2 className="font-bold text-gray-900">Programs</h2>
//             </div>
//             <button
//               onClick={() => setSidebarCollapsed(true)}
//               className="p-1 hover:bg-gray-100 rounded"
//             >
//               <X className="w-5 h-5 text-gray-500" />
//             </button>
//           </div>

//           {/* Search */}
//           <div className="relative mb-3">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Search programs..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//             />
//           </div>

//           {/* Filters */}
//           <div className="space-y-2">
//             <select
//               value={yearFilter}
//               onChange={(e) => setYearFilter(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//             >
//               <option value="all">All Years</option>
//               {availableYears.map(year => (
//                 <option key={year} value={year}>{year}</option>
//               ))}
//             </select>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//             >
//               <option value="all">All Status</option>
//               <option value="upcoming">Upcoming</option>
//               <option value="ongoing">Ongoing</option>
//               <option value="completed">Completed</option>
//             </select>
//           </div>

//           <button
//             onClick={() => {
//               setShowModal(true);
//               setModalType('program');
//               setFormData({ status: 'ongoing', year: new Date().getFullYear() });
//             }}
//             className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             <span>Add Program</span>
//           </button>
//         </div>

//         {/* Programs List */}
//         <div className="flex-1 overflow-y-auto">
//           {sortedYears.map(year => (
//             <div key={year} className="border-b border-gray-100">
//               <button
//                 onClick={() => toggleYear(year)}
//                 className="w-full px-4 py-3 bg-gray-50 font-semibold text-sm text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-colors"
//               >
//                 <div className="flex items-center space-x-2">
//                   {expandedYears[year] ?
//                     <ChevronDown className="w-4 h-4" /> :
//                     <ChevronRight className="w-4 h-4" />
//                   }
//                   <span>{year}</span>
//                 </div>
//                 <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{programsByYear[year].length}</span>
//               </button>

//               {expandedYears[year] && (
//                 <div>
//                   {programsByYear[year].map(program => (
//                     <button
//                       key={program._id}
//                       onClick={() => setSelectedProgram(program)}
//                       className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedProgram?._id === program._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
//                         }`}
//                     >
//                       <div className="flex items-start justify-between mb-1">
//                         <h3 className="font-medium text-gray-900 text-sm">{program.name}</h3>
//                       </div>
//                       <p className="text-xs text-gray-500 mb-2 line-clamp-2">{program.description}</p>
//                       <div className="flex items-center space-x-3 text-xs text-gray-600">
//                         <span className="flex items-center">
//                           <Target className="w-3 h-3 mr-1" />
//                           {program.projects?.length || 0} projects
//                         </span>
//                         <span className="flex items-center">
//                           <Calendar className="w-3 h-3 mr-1" />
//                           {program.projects?.flatMap(p => p.events || []).length || 0} events
//                         </span>
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top Bar */}
//         <div className="bg-white border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               {sidebarCollapsed && (
//                 <button
//                   onClick={() => setSidebarCollapsed(false)}
//                   className="p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <Menu className="w-5 h-5 text-gray-600" />
//                 </button>
//               )}
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   {selectedProgram?.name || 'Select a Program'}
//                 </h1>
//                 {selectedProgram && (
//                   <p className="text-sm text-gray-500">{selectedProgram.description}</p>
//                 )}
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => setViewMode('cards')}
//                 className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
//                 title="Card View"
//               >
//                 <BarChart3 className="w-5 h-5" />
//               </button>
//               <button
//                 onClick={() => setViewMode('timeline')}
//                 className={`p-2 rounded-lg transition-colors ${viewMode === 'timeline' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
//                 title="Timeline View"
//               >
//                 <List className="w-5 h-5" />
//               </button>
//               <button
//                 onClick={() => setViewMode('kanban')}
//                 className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
//                 title="Kanban View"
//               >
//                 <Kanban className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Content Area */}
//         <div className="flex-1 overflow-y-auto p-6">
//           {!selectedProgram ? (
//             <div className="h-full flex items-center justify-center text-gray-500">
//               <div className="text-center">
//                 <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                 <h3 className="text-lg font-semibold mb-2">No Program Selected</h3>
//                 <p>Select a program from the sidebar to view details</p>
//               </div>
//             </div>
//           ) : (
//             <>
//               {/* Stats Cards */}
//               {stats && (
//                 <div className="grid grid-cols-4 gap-4 mb-6">
//                   <div className="bg-white p-4 rounded-lg border border-gray-200">
//                     <div className="text-sm text-gray-500 mb-1">Year</div>
//                     <div className="text-2xl font-bold text-gray-900">{selectedProgram.year}</div>
//                   </div>
//                   <div className="bg-white p-4 rounded-lg border border-gray-200">
//                     <div className="text-sm text-gray-500 mb-1">Projects</div>
//                     <div className="text-2xl font-bold text-gray-900 mb-2">
//                       {stats.completedProjects}/{stats.totalProjects}
//                     </div>
//                     <ProgressBar completed={stats.completedProjects} total={stats.totalProjects} />
//                   </div>
//                   <div className="bg-white p-4 rounded-lg border border-gray-200">
//                     <div className="text-sm text-gray-500 mb-1">Events</div>
//                     <div className="text-2xl font-bold text-gray-900 mb-2">
//                       {stats.completedEvents}/{stats.totalEvents}
//                     </div>
//                     <ProgressBar completed={stats.completedEvents} total={stats.totalEvents} />
//                   </div>
//                   <div className="bg-white p-4 rounded-lg border border-gray-200">
//                     <div className="text-sm text-gray-500 mb-1">Overall Progress</div>
//                     <div className="text-2xl font-bold text-gray-900">
//                       {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Projects Section */}
//               <div className="bg-white rounded-lg border border-gray-200 p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-xl font-bold text-gray-900">Projects</h2>
//                   <button
//                     onClick={() => {
//                       setShowModal(true);
//                       setModalType('project');
//                       setFormData({ status: 'ongoing', year: selectedProgram?.year || new Date().getFullYear() });
//                     }}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-colors"
//                   >
//                     <Plus className="w-4 h-4" />
//                     <span>Add Project</span>
//                   </button>
//                 </div>

//                 {!selectedProgram.projects || selectedProgram.projects.length === 0 ? (
//                   <div className="text-center py-12 text-gray-500">
//                     <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
//                     <p>No projects yet. Add your first project to get started.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {selectedProgram.projects.map(project => (
//                       <div key={project._id} className="border border-gray-200 rounded-lg overflow-hidden">
//                         <div
//                           className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
//                           onClick={() => toggleProject(project._id)}
//                         >
//                           <div className="flex items-start justify-between">
//                             <div className="flex items-start space-x-3 flex-1">
//                               {expandedProjects[project._id] ?
//                                 <ChevronDown className="w-5 h-5 text-gray-600 mt-0.5" /> :
//                                 <ChevronRight className="w-5 h-5 text-gray-600 mt-0.5" />
//                               }
//                               <div className="flex-1">
//                                 <div className="flex items-center space-x-3 mb-2">
//                                   <h3 className="font-semibold text-gray-900">{project.name}</h3>
//                                   <span className="text-xs text-gray-500">{project.year}</span>
//                                 </div>
//                                 <div className="flex items-center space-x-4 text-sm text-gray-600">
//                                   <span>{project.events?.length || 0} events</span>
//                                   <span>{project.events?.filter(e => e.status === 'completed').length || 0} completed</span>
//                                 </div>
//                               </div>
//                             </div>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setShowModal(true);
//                                 setModalType('project');
//                                 setFormData({ ...project });
//                               }}
//                               className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
//                             >
//                               <Edit2 className="w-4 h-4 text-gray-600" />
//                             </button>
//                           </div>
//                         </div>

//                         {expandedProjects[project._id] && (
//                           <div className="p-4 bg-white border-t border-gray-200">
//                             <div className="flex items-center justify-between mb-3">
//                               <h4 className="font-semibold text-gray-900">Events</h4>
//                               <button
//                                 onClick={() => {
//                                   setShowModal(true);
//                                   setModalType('event');
//                                   setFormData({ status: 'upcoming', projectId: project._id });
//                                 }}
//                                 className="text-blue-600 text-sm font-medium flex items-center space-x-1 hover:text-blue-700"
//                               >
//                                 <Plus className="w-4 h-4" />
//                                 <span>Add Event</span>
//                               </button>
//                             </div>

//                             {!project.events || project.events.length === 0 ? (
//                               <div className="text-center py-6 text-gray-500 text-sm">
//                                 <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
//                                 <p>No events scheduled</p>
//                               </div>
//                             ) : (
//                               <div className="space-y-2">
//                                 {project.events.map(event => (
//                                   <div key={event._id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                                     <div className="flex-1">
//                                       <div className="flex items-center space-x-2 mb-2">
//                                         <h5 className="font-medium text-gray-900">{event.title}</h5>
//                                       </div>
//                                       <div className="text-sm text-gray-600 space-y-1">
//                                         <p className="flex items-center">
//                                           <Calendar className="w-4 h-4 mr-2 text-blue-600" />
//                                           {event.date}
//                                         </p>
//                                         <p className="flex items-center">
//                                           <Users className="w-4 h-4 mr-2 text-blue-600" />
//                                           {event.participants} participants
//                                         </p>
//                                         <p className="text-gray-600">📍 {event.venue}</p>
//                                       </div>
//                                     </div>
//                                     <button
//                                       onClick={() => {
//                                         setShowModal(true);
//                                         setModalType('event');
//                                         setFormData({ ...event, projectId: project._id });
//                                       }}
//                                       className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
//                                     >
//                                       <Edit2 className="w-4 h-4 text-gray-600" />
//                                     </button>
//                                   </div>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-bold text-gray-900">
//                   {formData._id ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
//                 </h3>
//                 <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//               <div className="space-y-4">
//                 {modalType === 'program' && (
//                   <>
//                     <input
//                       type="text"
//                       placeholder="Program Name"
//                       value={formData.name || ''}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     />
//                     <textarea
//                       placeholder="Description"
//                       value={formData.description || ''}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                       rows="3"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Year"
//                       value={formData.year || ''}
//                       onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     />
//                   </>
//                 )}

//                 {modalType === 'project' && (
//                   <>
//                     <input
//                       type="text"
//                       placeholder="Project Name"
//                       value={formData.name || ''}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     />
//                   </>
//                 )}

//                 {modalType === 'event' && (
//                   <>
//                     <input
//                       type="text"
//                       placeholder="Event Title"
//                       value={formData.title || ''}
//                       onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     />
//                     <input
//                       type="date"
//                       value={formData.date || ''}
//                       onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Participants"
//                       value={formData.participants || ''}
//                       onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     />
//                     <input
//                       type="text"
//                       placeholder="Venue"
//                       value={formData.venue || ''}
//                       onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     />
//                   </>
//                 )}

//                 <div className="flex space-x-3 pt-4">
//                   <button
//                     onClick={() => setShowModal(false)}
//                     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSave}
//                     className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
//                   >
//                     <Save className="w-4 h-4" />
//                     <span>Save</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default GADProgramsHybrid;



import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Calendar, Users, Target, Plus, Edit2, Archive, X, Save, CheckCircle, Clock, Play, Search, BarChart3, Filter, Menu, Kanban, List, Trash2, Loader2 } from 'lucide-react';
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  addProject,
  updateProject,
  deleteProject,
  addEvent,
  updateEvent,
  deleteEvent
} from '../../api/program';
import { getAllCalendarEvents, deleteCalendarEvent } from '../../api/calendar';

const GADProgramsHybrid = () => {
  const navigate = useNavigate();
  // All state declarations first
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedYears, setExpandedYears] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [deleting, setDeleting] = useState({});
  const [dateError, setDateError] = useState('');
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Fetch on mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  // ✅ FIXED: Fetch programs with optional filters
  const fetchPrograms = async (applyFilters = true) => {
    try {
      const [response, calendarRes] = await Promise.all([
        getAllPrograms(applyFilters ? {
          year: yearFilter !== 'all' ? yearFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined
        } : {}),
        getAllCalendarEvents()
      ]);
      
      if (calendarRes.success) {
        setCalendarEvents(calendarRes.data);
      }

      if (response.success) {
        setPrograms(response.data);
        if (response.data.length > 0) {
          // If we have a selected program, update it from the new data
          if (selectedProgram) {
            const updated = response.data.find(p => p._id === selectedProgram._id);
            if (updated) setSelectedProgram(updated);
          } else {
            setSelectedProgram(response.data[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: handleSave now fetches without filters
  const handleSave = async () => {
    try {
      let savedProgramId = selectedProgram?._id;

      if (modalType === 'program') {
        if (formData._id) {
          await updateProgram(formData._id, formData);
          savedProgramId = formData._id;
        } else {
          const response = await createProgram(formData);
          if (response.success) {
            savedProgramId = response.data._id;
          }
        }
      } else if (modalType === 'project') {
        if (formData._id) {
          await updateProject(selectedProgram._id, formData._id, formData);
        } else {
          await addProject(selectedProgram._id, formData);
        }
      } else if (modalType === 'event') {
        const projectId = formData.projectId;

        // Get the project to get its year
        const project = selectedProgram.projects.find(p => p._id === projectId);
        const eventYear = project?.year || selectedProgram?.year || new Date().getFullYear();

        // Combine year, month, day into date format
        const eventData = {
          ...formData,
          date: `${eventYear}-${formData.month}-${formData.day.toString().padStart(2, '0')}`
        };

        // ✅ Validate: event date must not be in the past
        const eventDate = new Date(`${eventYear}-${formData.month}-${formData.day.toString().padStart(2, '0')}`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate < today) {
          setDateError('Event date cannot be in the past. Please select a future date.');
          return;
        }
        setDateError('');

        // Remove month and day fields as they're now in date
        delete eventData.month;
        delete eventData.day;

        if (formData._id) {
          await updateEvent(selectedProgram._id, projectId, formData._id, eventData);
        } else {
          await addEvent(selectedProgram._id, projectId, eventData);
        }
      }

      // ✅ Refresh WITHOUT applying filters so we don't lose the updated program
      const response = await getAllPrograms({});
      if (response.success) {
        setPrograms(response.data);

        // Find and set the updated program as selected
        const updatedProgram = response.data.find(p => p._id === savedProgramId);
        if (updatedProgram) {
          setSelectedProgram(updatedProgram);
        }
      }

      setShowModal(false);
      setFormData({});
      setDateError('');
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const handleDeleteProgram = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this program? This action cannot be undone.")) return;
    try {
      setDeleting(prev => ({ ...prev, [id]: true }));
      await deleteProgram(id);
      const response = await getAllPrograms({});
      if (response.success) {
        setPrograms(response.data);
        if (selectedProgram?._id === id) {
          setSelectedProgram(response.data.length > 0 ? response.data[0] : null);
        }
      }
    } catch (err) {
      console.error('Error deleting program:', err);
    } finally {
      setDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to permanently delete this project? This action cannot be undone.")) return;
    try {
      setDeleting(prev => ({ ...prev, [projectId]: true }));
      await deleteProject(selectedProgram._id, projectId);

      const response = await getAllPrograms({});
      if (response.success) {
        setPrograms(response.data);
        const updatedProgram = response.data.find(p => p._id === selectedProgram._id);
        if (updatedProgram) {
          setSelectedProgram(updatedProgram);
        }
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    } finally {
      setDeleting(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleDeleteEvent = async (projectId, eventId, source = 'program') => {
    if (!window.confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) return;
    try {
      setDeleting(prev => ({ ...prev, [eventId]: true }));
      
      if (source === 'calendar') {
        await deleteCalendarEvent(eventId);
      } else {
        await deleteEvent(selectedProgram._id, projectId, eventId);
      }

      await fetchPrograms(); // Refresh everything
    } catch (err) {
      console.error('Error deleting event:', err);
    } finally {
      setDeleting(prev => ({ ...prev, [eventId]: false }));
    }
  };

  // Get unique years
  const availableYears = useMemo(() => {
    return [...new Set(programs.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
  }, [programs]);

  // Filter programs for sidebar
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === 'all' || p.year === parseInt(yearFilter);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesYear && matchesStatus;
    });
  }, [programs, searchTerm, yearFilter, statusFilter]);

  // Group by year for sidebar
  const programsByYear = useMemo(() => {
    return filteredPrograms.reduce((acc, program) => {
      const year = program.year || 'Uncategorized';
      if (!acc[year]) acc[year] = [];
      acc[year].push(program);
      return acc;
    }, {});
  }, [filteredPrograms]);

  const sortedYears = useMemo(() => {
    return Object.keys(programsByYear).sort((a, b) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return parseInt(b) - parseInt(a);
    });
  }, [programsByYear]);

  // Auto-expand the first year
  useEffect(() => {
    if (sortedYears.length > 0 && Object.keys(expandedYears).length === 0) {
      setExpandedYears({ [sortedYears[0]]: true });
    }
  }, [sortedYears, expandedYears]);

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const getStats = (program) => {
    if (!program) return { totalProjects: 0, completedProjects: 0, totalEvents: 0, completedEvents: 0 };

    const projects = program.projects || [];
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    const events = projects.flatMap(p => p.events || []);
    
    // Add linked calendar events
    const linkedCalendarEvents = calendarEvents.filter(e => e.extendedProps?.programId === program._id);
    const totalEvents = events.length + linkedCalendarEvents.length;
    const completedEvents = events.filter(e => e.status === 'completed').length + 
                            linkedCalendarEvents.filter(e => e.extendedProps?.status === 'completed').length;

    return { totalProjects, completedProjects, totalEvents, completedEvents };
  };

  const StatusBadge = ({ status }) => {
    const config = {
      upcoming: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, label: 'Upcoming' },
      ongoing: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Play, label: 'Ongoing' },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: X, label: 'Cancelled' }
    };
    const conf = config[status] || config.ongoing;
    const Icon = conf.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${conf.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {conf.label}
      </span>
    );
  };

  const ProgressBar = ({ completed, total }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return (
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 font-medium min-w-[50px]">
          {completed}/{total}
        </span>
      </div>
    );
  };

  const stats = selectedProgram ? getStats(selectedProgram) : null;

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 md:relative md:z-auto
        bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-xl md:shadow-none
        ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-0' : 'translate-x-0 w-80'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="font-bold text-gray-900">Programs</h2>
            </div>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setModalType('program');
              setFormData({ status: 'ongoing', year: new Date().getFullYear() });
            }}
            className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Program</span>
          </button>
        </div>

        {/* Programs List */}
        <div className="flex-1 overflow-y-auto">
          {sortedYears.map(year => (
            <div key={year} className="border-b border-gray-100">
              <button
                onClick={() => toggleYear(year)}
                className="w-full px-4 py-3 bg-gray-50 font-semibold text-sm text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {expandedYears[year] ?
                    <ChevronDown className="w-4 h-4" /> :
                    <ChevronRight className="w-4 h-4" />
                  }
                  <span>{year}</span>
                </div>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{programsByYear[year].length}</span>
              </button>

              {expandedYears[year] && (
                <div>
                  {programsByYear[year].map(program => (
                    <button
                      key={program._id}
                      onClick={() => setSelectedProgram(program)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedProgram?._id === program._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-gray-900 text-sm">{program.name}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProgram(program._id);
                          }}
                          disabled={deleting[program._id]}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                          title="Delete Program"
                        >
                          {deleting[program._id] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{program.description}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-600">
                        <span className="flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          {program.projects?.length || 0} projects
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {program.projects?.flatMap(p => p.events || []).length || 0} events
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                {(sidebarCollapsed || true) && (
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${!sidebarCollapsed ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                )}
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                    {selectedProgram?.name || 'Select a Program'}
                  </h1>
                  {selectedProgram && (
                    <p className="text-xs md:text-sm text-gray-500 truncate">{selectedProgram.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
            {!selectedProgram ? (
              <div className="h-full flex items-center justify-center p-6 text-gray-500">
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Program Selected</h3>
                  <p className="text-sm">Explore and manage your programs by selecting one from the catalog sidebar.</p>
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm md:hidden"
                  >
                    Open Catalog
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                {stats && (
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Year</div>
                      <div className="text-2xl font-bold text-gray-900">{selectedProgram.year}</div>
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Projects</h2>
                    <button
                      onClick={() => {
                        setShowModal(true);
                        setModalType('project');
                        setFormData({ status: 'ongoing', year: selectedProgram?.year || new Date().getFullYear() });
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  {!selectedProgram.projects || selectedProgram.projects.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No projects yet. Add your first project to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedProgram.projects.map(project => (
                        <div key={project._id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div
                            className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleProject(project._id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                {expandedProjects[project._id] ?
                                  <ChevronDown className="w-5 h-5 text-gray-600 mt-0.5" /> :
                                  <ChevronRight className="w-5 h-5 text-gray-600 mt-0.5" />
                                }
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                    <span className="text-xs text-gray-500">{project.year}</span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>{project.events?.length || 0} events</span>
                                    <span>{project.events?.filter(e => e.status === 'completed').length || 0} completed</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowModal(true);
                                    setModalType('project');
                                    setFormData({ ...project });
                                  }}
                                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project._id);
                                  }}
                                  disabled={deleting[project._id]}
                                  className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                  title="Delete Project"
                                >
                                  {deleting[project._id] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {expandedProjects[project._id] && (
                            <div className="p-4 bg-white border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900">Events</h4>
                                <button
                                  onClick={() => {
                                    setShowModal(true);
                                    setModalType('event');
                                    const today = new Date();
                                    const currentYear = today.getFullYear();
                                    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
                                    const currentDay = today.getDate().toString();

                                    // Use current month/day only if project year is current or future
                                    const projectYear = project?.year || selectedProgram?.year || currentYear;
                                    const isCurrentOrFutureYear = parseInt(projectYear) >= currentYear;

                                    setFormData({
                                      status: 'upcoming',
                                      projectId: project._id,
                                      month: isCurrentOrFutureYear ? currentMonth : '01',
                                      day: isCurrentOrFutureYear ? currentDay : '1'
                                    });
                                  }}
                                  className="text-blue-600 text-sm font-medium flex items-center space-x-1 hover:text-blue-700"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Add Event</span>
                                </button>
                              </div>

                              {(() => {
                                const projectCalendarEvents = calendarEvents.filter(e => e.extendedProps?.projectId === project._id);
                                const allProjectEvents = [
                                  ...(project.events || []).map(e => ({ ...e, source: 'program' })),
                                  ...projectCalendarEvents.map(e => ({
                                    _id: e.id,
                                    title: e.title,
                                    date: (e.start || "").split('T')[0],
                                    participants: 'N/A',
                                    venue: e.extendedProps?.location || 'N/A',
                                    status: e.extendedProps?.status || 'upcoming',
                                    source: 'calendar',
                                    originalEvent: e
                                  }))
                                ].sort((a, b) => new Date(b.date) - new Date(a.date));

                                if (allProjectEvents.length === 0) {
                                  return (
                                    <div className="text-center py-6 text-gray-500 text-sm">
                                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                      <p>No events scheduled</p>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="space-y-2">
                                    {allProjectEvents.map(event => (
                                      <div key={event._id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <h5 className="font-medium text-gray-900">{event.title}</h5>
                                            {event.source === 'calendar' && (
                                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                Calendar
                                              </span>
                                            )}
                                          </div>
                                        <div className="text-sm text-gray-600 space-y-1">
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
                                        <div className="flex items-center space-x-1">
                                          {event.source === 'program' ? (
                                            <button
                                              onClick={() => {
                                                setShowModal(true);
                                                setModalType('event');

                                                // Parse existing date (YYYY-MM-DD) into month and day
                                                let eventData = { ...event, projectId: project._id };
                                                if (event.date) {
                                                  const dateParts = event.date.split('-');
                                                  if (dateParts.length === 3) {
                                                    eventData.month = dateParts[1];
                                                    eventData.day = dateParts[2];
                                                  }
                                                }

                                                setFormData(eventData);
                                              }}
                                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                              title="Edit Event"
                                            >
                                              <Edit2 className="w-4 h-4 text-gray-600" />
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => navigate('/superadmin/events')}
                                              className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                                              title="Manage in Calendar"
                                            >
                                              <Calendar className="w-4 h-4" />
                                            </button>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteEvent(project._id, event._id, event.source);
                                            }}
                                            disabled={deleting[event._id]}
                                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                            title="Delete Event"
                                          >
                                            {deleting[event._id] ? (
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <Trash2 className="w-4 h-4" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {formData._id ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  {modalType === 'program' && (
                    <>
                      <input
                        type="text"
                        placeholder="Program Name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <textarea
                        placeholder="Description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="3"
                      />
                      <input
                        type="number"
                        placeholder="Year"
                        value={formData.year || ''}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </>
                  )}

                  {modalType === 'project' && (
                    <>
                      <input
                        type="text"
                        placeholder="Project Name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </>
                  )}

                  {modalType === 'event' && (
                    <>
                      <input
                        type="text"
                        placeholder="Event Title"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={formData.month || ''}
                          onChange={(e) => {
                            const newMonth = e.target.value;
                            const today = new Date();
                            const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
                            const currentDay = today.getDate().toString();
                            const project = selectedProgram?.projects?.find(p => p._id === formData.projectId);
                            const eventYear = project?.year || selectedProgram?.year || today.getFullYear();

                            let newDay = formData.day;
                            // If switching to current month/year, ensure day isn't in the past
                            if (parseInt(eventYear) === today.getFullYear() && newMonth === currentMonth) {
                              if (!formData.day || parseInt(formData.day) < today.getDate()) {
                                newDay = currentDay;
                              }
                            }

                            setFormData({ ...formData, month: newMonth, day: newDay });
                            setDateError('');
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Month</option>
                          {(() => {
                            const project = selectedProgram?.projects?.find(p => p._id === formData.projectId);
                            const eventYear = project?.year || selectedProgram?.year || new Date().getFullYear();
                            const today = new Date();
                            const currentYear = today.getFullYear();
                            const currentMonth = today.getMonth() + 1; // 1-based
                            const months = [
                              { value: '01', label: 'January' },
                              { value: '02', label: 'February' },
                              { value: '03', label: 'March' },
                              { value: '04', label: 'April' },
                              { value: '05', label: 'May' },
                              { value: '06', label: 'June' },
                              { value: '07', label: 'July' },
                              { value: '08', label: 'August' },
                              { value: '09', label: 'September' },
                              { value: '10', label: 'October' },
                              { value: '11', label: 'November' },
                              { value: '12', label: 'December' },
                            ];
                            return months.map(m => {
                              const isPast = parseInt(eventYear) < currentYear ||
                                (parseInt(eventYear) === currentYear && parseInt(m.value) < currentMonth);
                              return (
                                <option key={m.value} value={m.value} disabled={isPast}>
                                  {m.label}{isPast ? ' (past)' : ''}
                                </option>
                              );
                            });
                          })()}
                        </select>
                        <input
                          type="number"
                          placeholder="Day"
                          min={(() => {
                            const project = selectedProgram?.projects?.find(p => p._id === formData.projectId);
                            const eventYear = project?.year || selectedProgram?.year || new Date().getFullYear();
                            const today = new Date();
                            if (
                              parseInt(eventYear) === today.getFullYear() &&
                              parseInt(formData.month) === today.getMonth() + 1
                            ) {
                              return today.getDate();
                            }
                            return 1;
                          })()}
                          max={(() => {
                            const project = selectedProgram?.projects?.find(p => p._id === formData.projectId);
                            const eventYear = project?.year || selectedProgram?.year || new Date().getFullYear();
                            return new Date(parseInt(eventYear), parseInt(formData.month), 0).getDate() || 31;
                          })()}
                          value={formData.day || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, day: val });

                            const project = selectedProgram?.projects?.find(p => p._id === formData.projectId);
                            const eventYear = project?.year || selectedProgram?.year || new Date().getFullYear();
                            const today = new Date();
                            const minDay = (
                              parseInt(eventYear) === today.getFullYear() &&
                              parseInt(formData.month) === today.getMonth() + 1
                            ) ? today.getDate() : 1;

                            // Calculate max days in selected month
                            const maxDays = new Date(parseInt(eventYear), parseInt(formData.month), 0).getDate();

                            if (val && parseInt(val) < minDay) {
                              setDateError(`Day cannot be earlier than ${minDay} for this month.`);
                            } else if (val && parseInt(val) > maxDays) {
                              setDateError(`Day cannot be greater than ${maxDays} for this month.`);
                            } else {
                              setDateError('');
                            }
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${dateError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        />
                      </div>
                      {dateError && (
                        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          {dateError}
                        </p>
                      )}
                      <input
                        type="number"
                        placeholder="Participants"
                        value={formData.participants || ''}
                        onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Venue"
                        value={formData.venue || ''}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default GADProgramsHybrid;