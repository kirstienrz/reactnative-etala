import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Users, Clock, ChevronDown, ChevronRight, Search, 
  FileText, Filter, CalendarDays, BarChart3, Target, Users2, 
  ChevronLeft, ChevronRight as ChevronRightIcon, Eye, MapPin, UserCheck 
} from 'lucide-react';
import { getAllPrograms } from '../../api/program';

const UserGADPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [expandedPrograms, setExpandedPrograms] = useState(new Set());
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    const currentYear = new Date().getFullYear().toString();
    if (programs.length > 0 && !expandedYears.size) {
      setExpandedYears(new Set([currentYear]));

      const yearPrograms = programs.filter(p => p.year === parseInt(currentYear));
      if (yearPrograms.length > 0) {
        setExpandedPrograms(new Set([yearPrograms[0]._id]));
        setSelectedProgram(yearPrograms[0]);
      }
    }
  }, [programs]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await getAllPrograms({
        year: yearFilter !== 'all' ? yearFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      if (response.success) setPrograms(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      newSet.has(year) ? newSet.delete(year) : newSet.add(year);
      return newSet;
    });
  };

  const toggleProgram = (programId, program) => {
    setSelectedProgram(program);
    setExpandedPrograms(prev => {
      const newSet = new Set(prev);
      newSet.has(programId) ? newSet.delete(programId) : newSet.add(programId);
      return newSet;
    });
  };

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      newSet.has(projectId) ? newSet.delete(projectId) : newSet.add(projectId);
      return newSet;
    });
  };

  const StatusBadge = ({ status }) => {
    const config = {
      upcoming: { color: 'bg-purple-100 text-purple-800', border: 'border-purple-200', label: 'Upcoming' },
      ongoing: { color: 'bg-green-100 text-green-800', border: 'border-green-200', label: 'Ongoing' },
      completed: { color: 'bg-blue-100 text-blue-800', border: 'border-blue-200', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', border: 'border-red-200', label: 'Cancelled' }
    };
    const conf = config[status] || config.ongoing;

    return (
      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${conf.color} ${conf.border}`}>
        {conf.label}
      </span>
    );
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === 'all' || p.year === parseInt(yearFilter);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesYear && matchesStatus;
    });
  }, [programs, searchTerm, yearFilter, statusFilter]);

  const programsByYear = useMemo(() => {
    const grouped = {};
    filteredPrograms.forEach(program => {
      const year = program.year || 'No Year';
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(program);
    });
    return grouped;
  }, [filteredPrograms]);

  const sortedYears = useMemo(() => {
    return Object.keys(programsByYear).sort((a, b) => Number(b) - Number(a));
  }, [programsByYear]);

  return (
    <main className="bg-white min-h-screen">

      {/* ===================== */}
      {/* BEAUTIFUL HERO HEADER */}
      {/* ===================== */}
      <section className="py-28 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>

        <h1 className="text-5xl font-bold text-white mb-4">GAD Programs</h1>
        <p className="text-violet-200 text-lg max-w-2xl mx-auto">
          View all institutional Gender and Development programs, activities, and accomplishments.
        </p>
      </section>

      {/* ===================== */}
      {/* FILTER + SEARCH BAR  */}
      {/* ===================== */}
      <section className="py-10 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

            {/* Search */}
            <div className="w-full lg:w-1/3 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg pl-10 px-4 py-2.5 focus:border-violet-500 focus:ring-violet-500"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 w-full lg:w-auto">

              {/* Year */}
              <select
                className="border border-slate-300 rounded-lg px-4 py-2.5 focus:border-violet-500"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="all">All Years</option>
                {sortedYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Status */}
              <select
                className="border border-slate-300 rounded-lg px-4 py-2.5 focus:border-violet-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

            </div>
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* PROGRAMS LIST (Knowledge-style Cards) */}
      {/* ===================== */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 space-y-10">

          {sortedYears.map(year => (
            <div key={year} className="space-y-4">

              {/* Year Divider */}
              <div 
                onClick={() => toggleYear(year)}
                className="flex items-center justify-between cursor-pointer bg-white border border-slate-200 px-6 py-4 rounded-xl hover:border-violet-400 transition"
              >
                <h2 className="text-2xl font-bold text-slate-900">{year}</h2>
                {expandedYears.has(year)
                  ? <ChevronDown className="text-slate-500" />
                  : <ChevronRight className="text-slate-500" />}
              </div>

              {/* Programs Inside */}
              {expandedYears.has(year) && (
                <div className="space-y-6">
                  {programsByYear[year].map(program => (
                    <article
                      key={program._id}
                      className="bg-white border border-slate-200 rounded-xl p-6 hover:border-violet-400 hover:shadow-lg transition cursor-pointer"
                      onClick={() => toggleProgram(program._id, program)}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-slate-900">{program.name}</h3>
                        <StatusBadge status={program.status} />
                      </div>

                      <p className="text-slate-600 line-clamp-2">{program.description}</p>

                      {expandedPrograms.has(program._id) && (
                        <div className="mt-6 border-t pt-4 space-y-4">

                          {/* Program Details */}
                          <div className="flex flex-wrap gap-6 text-slate-600 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar size={18} />
                              {program.date || "No Date"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users2 size={18} />
                              {program.target || "No Target"}
                            </div>
                          </div>

                          {/* Projects List */}
                          {program.projects?.map(project => (
                            <div key={project._id}>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleProject(project._id); }}
                                className="flex justify-between items-center w-full text-left text-slate-800 font-medium mt-2"
                              >
                                {project.title}
                                {expandedProjects.has(project._id)
                                  ? <ChevronDown />
                                  : <ChevronRight />}
                              </button>

                              {expandedProjects.has(project._id) && (
                                <div className="pl-4 mt-2 text-slate-600 text-sm space-y-1">
                                  <p>{project.description}</p>
                                  <p className="flex items-center gap-1"><Clock size={16} /> {project.time}</p>
                                </div>
                              )}
                            </div>
                          ))}

                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default UserGADPrograms;
