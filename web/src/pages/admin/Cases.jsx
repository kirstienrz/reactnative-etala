import React, { useState } from "react";
import { Eye, FileText, Users, Clock, CheckCircle, MoreVertical, Search, Filter, Download, X, User, Calendar, Building, Tag, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

const sampleCases = [
  {
    ticketNumber: "CASE-2025-001",
    reporter: "Juan Dela Cruz",
    department: "Student",
    perpetrator: "Mark Santos",
    incidentType: ["Harassment", "Verbal Abuse"],
    status: "In Progress",
    submittedAt: "2025-12-18",
    lastUpdated: "2025-12-19",
    assignedAdmin: "Admin OSA",
    priority: "High",
    description: "Student reported verbal harassment during class hours. Multiple witnesses available.",
  },
  {
    ticketNumber: "CASE-2025-002",
    reporter: "Maria Santos",
    department: "Faculty",
    perpetrator: "John Reyes",
    incidentType: ["Discrimination"],
    status: "Pending",
    submittedAt: "2025-12-17",
    lastUpdated: "2025-12-18",
    assignedAdmin: "Admin OSA",
    priority: "Medium",
    description: "Faculty member reported discrimination in promotion process.",
  },
  {
    ticketNumber: "CASE-2025-003",
    reporter: "Robert Lim",
    department: "Staff",
    perpetrator: "Alex Garcia",
    incidentType: ["Physical Altercation"],
    status: "Resolved",
    submittedAt: "2025-12-15",
    lastUpdated: "2025-12-16",
    assignedAdmin: "Admin HR",
    priority: "High",
    description: "Physical altercation between staff members in cafeteria.",
  },
  {
    ticketNumber: "CASE-2025-004",
    reporter: "Sarah Johnson",
    department: "Student",
    perpetrator: "Unknown",
    incidentType: ["Bullying", "Cyber Harassment"],
    status: "In Progress",
    submittedAt: "2025-12-19",
    lastUpdated: "2025-12-19",
    assignedAdmin: "Admin OSA",
    priority: "Critical",
    description: "Cyber bullying incident reported through online platform.",
  },
];

const statusColors = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Closed: "bg-gray-100 text-gray-700 border-gray-300",
  Escalated: "bg-red-50 text-red-700 border-red-200",
  "Under Review": "bg-purple-50 text-purple-700 border-purple-200",
};

const priorityColors = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-blue-50 text-blue-700 border-blue-200",
};

const AdminCases = () => {
  const [cases, setCases] = useState(sampleCases);
  const [search, setSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingCase, setUpdatingCase] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    department: [],
    priority: [],
    assignedAdmin: [],
  });

  const allDepartments = [...new Set(cases.map(c => c.department))];
  const allAdmins = [...new Set(cases.map(c => c.assignedAdmin))];
  const allStatuses = Object.keys(statusColors);
  const allPriorities = Object.keys(priorityColors);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [filterType]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [filterType]: [...currentValues, value]
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      department: [],
      priority: [],
      assignedAdmin: [],
    });
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = search === "" || 
      Object.values(caseItem).some(value =>
        String(value).toLowerCase().includes(search.toLowerCase())
      );

    const matchesStatus = filters.status.length === 0 || filters.status.includes(caseItem.status);
    const matchesDepartment = filters.department.length === 0 || filters.department.includes(caseItem.department);
    const matchesPriority = filters.priority.length === 0 || filters.priority.includes(caseItem.priority);
    const matchesAdmin = filters.assignedAdmin.length === 0 || filters.assignedAdmin.includes(caseItem.assignedAdmin);

    return matchesSearch && matchesStatus && matchesDepartment && matchesPriority && matchesAdmin;
  });

  const handleViewDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setShowViewModal(true);
  };

  const handleOpenUpdateModal = (caseItem) => {
    setUpdatingCase(caseItem);
    setNewStatus(caseItem.status);
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = () => {
    if (!updatingCase || !newStatus) return;

    setCases(prevCases =>
      prevCases.map(c =>
        c.ticketNumber === updatingCase.ticketNumber
          ? { ...c, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] }
          : c
      )
    );

    setShowUpdateModal(false);
    setUpdatingCase(null);
    setNewStatus("");
  };

  const FilterSection = ({ title, icon: Icon, options, filterType }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-gray-500" />
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters[filterType].includes(option)}
              onChange={() => handleFilterChange(filterType, option)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* View Case Details Modal */}
      {showViewModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Case Details</h3>
                <p className="text-sm text-gray-600">{selectedCase.ticketNumber}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Case Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Reporter</h4>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedCase.reporter}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {selectedCase.department}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Perpetrator</h4>
                    <p className="text-gray-900">{selectedCase.perpetrator}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selectedCase.status]}`}>
                        {selectedCase.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Priority</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[selectedCase.priority]}`}>
                        {selectedCase.priority}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Assigned Admin</h4>
                    <p className="text-gray-900">{selectedCase.assignedAdmin}</p>
                  </div>
                </div>
              </div>

              {/* Incident Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Incident Type</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.incidentType.map((type, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-200"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {selectedCase.description}
                </p>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Submitted</p>
                        <p className="text-xs text-gray-500">{selectedCase.submittedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Last Updated</p>
                        <p className="text-xs text-gray-500">{selectedCase.lastUpdated}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleOpenUpdateModal(selectedCase);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && updatingCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Update Case Status</h3>
                <p className="text-sm text-gray-600">{updatingCase.ticketNumber}</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Current Status</h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[updatingCase.status]}`}>
                    {updatingCase.status}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[newStatus]}`}>
                    {newStatus}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Select New Status</h4>
                <div className="grid grid-cols-2 gap-3">
                  {allStatuses.map(status => (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        newStatus === status
                          ? `${statusColors[status].split(' ')[0].replace('bg-', 'bg-')} border-current`
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || newStatus === updatingCase.status}
                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end p-4 z-40">
          <div className="bg-white rounded-xl w-full max-w-md mt-16">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
              <FilterSection
                title="Status"
                icon={Tag}
                options={allStatuses}
                filterType="status"
              />
              
              <FilterSection
                title="Department"
                icon={Building}
                options={allDepartments}
                filterType="department"
              />
              
              <FilterSection
                title="Priority"
                icon={AlertCircle}
                options={allPriorities}
                filterType="priority"
              />
              
              <FilterSection
                title="Assigned Admin"
                icon={User}
                options={allAdmins}
                filterType="assignedAdmin"
              />
              
              <div className="pt-4">
                <button
                  onClick={() => setShowFilter(false)}
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters ({Object.values(filters).flat().length} selected)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Case Management</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and track all reported cases</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilter(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
              {Object.values(filters).flat().length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {Object.values(filters).flat().length}
                </span>
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cases by ticket number, reporter, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cases</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredCases.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {Object.values(filters).flat().length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Active filters:</span>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 ml-2"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([filterType, values]) =>
                values.map(value => (
                  <div
                    key={`${filterType}-${value}`}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    <span>{value}</span>
                    <button
                      onClick={() => handleFilterChange(filterType, value)}
                      className="hover:bg-blue-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ticket Details
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Incident Type
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCases.map((caseItem) => (
                <tr key={caseItem.ticketNumber} className="hover:bg-gray-50 transition-colors">
                  <td className="py-5 px-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{caseItem.ticketNumber}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[caseItem.priority]} border`}>
                              {caseItem.priority}
                            </span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{caseItem.reporter}</span>
                          <span className="text-gray-500 text-xs px-2 py-0.5 bg-gray-100 rounded">
                            {caseItem.department}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">vs</span>
                          <span className="text-gray-700">{caseItem.perpetrator}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex flex-wrap gap-1">
                      {caseItem.incidentType.map((type, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded border border-gray-200"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Assigned to: {caseItem.assignedAdmin}</p>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusColors[caseItem.status]}`}>
                        {caseItem.status}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-900 font-medium">Submitted</p>
                          <p className="text-gray-500 text-xs">{caseItem.submittedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-900 font-medium">Updated</p>
                          <p className="text-gray-500 text-xs">{caseItem.lastUpdated}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleViewDetails(caseItem)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleOpenUpdateModal(caseItem)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Update Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredCases.length}</span> of <span className="font-medium">{cases.length}</span> cases
            </p>
            <div className="flex items-center gap-4">
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
                Previous
              </button>
              <span className="text-sm text-gray-600">Page 1 of 1</span>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCases;