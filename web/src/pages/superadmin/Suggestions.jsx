import React, { useState, useEffect } from "react";
import { Archive, Eye, Filter, Search, Calendar, User, Tag, CheckCircle, Clock, ArchiveX, Download, Printer, BarChart3, MessageSquare, History, TrendingUp, PieChart, Menu, X, Check, Loader } from "lucide-react";
import { getSuggestions, updateSuggestion, toggleArchive } from "../../api/suggestion";

const AdminGADSuggestionBox = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("active");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suggestions from backend
  const [suggestions, setSuggestions] = useState([]);

  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Fetch suggestions from backend on component mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError("Failed to load suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id) => {
    try {
      await toggleArchive(id);
      await fetchSuggestions(); // Refresh data
    } catch (err) {
      console.error("Error archiving suggestion:", err);
      alert("Failed to archive suggestion. Please try again.");
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await toggleArchive(id);
      await fetchSuggestions(); // Refresh data
    } catch (err) {
      console.error("Error unarchiving suggestion:", err);
      alert("Failed to unarchive suggestion. Please try again.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const suggestion = suggestions.find(s => s.id === id);
      await updateSuggestion(id, { ...suggestion, status: newStatus });
      await fetchSuggestions(); // Refresh data
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    try {
      const suggestion = suggestions.find(s => s.id === id);
      await updateSuggestion(id, { ...suggestion, priority: newPriority });
      await fetchSuggestions(); // Refresh data
    } catch (err) {
      console.error("Error updating priority:", err);
      alert("Failed to update priority. Please try again.");
    }
  };

  const openDetailModal = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowDetailModal(true);
    
    // Add to recently viewed
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== suggestion.id);
      return [suggestion.id, ...filtered].slice(0, 5);
    });
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSuggestion(null);
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredSuggestions.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredSuggestions.map(s => s.id));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Archive ${selectedItems.length} suggestion(s)?`)) {
      try {
        await Promise.all(selectedItems.map(id => toggleArchive(id)));
        await fetchSuggestions();
        setSelectedItems([]);
      } catch (err) {
        console.error("Error bulk archiving:", err);
        alert("Failed to archive some suggestions. Please try again.");
      }
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedItems.length === 0) return;
    try {
      await Promise.all(
        selectedItems.map(id => {
          const suggestion = suggestions.find(s => s.id === id);
          return updateSuggestion(id, { ...suggestion, status });
        })
      );
      await fetchSuggestions();
      setSelectedItems([]);
    } catch (err) {
      console.error("Error bulk status change:", err);
      alert("Failed to update some suggestions. Please try again.");
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Suggestion', 'Submitted By', 'Date', 'Status', 'Priority'],
      ...filteredSuggestions.map(s => [
        s.id,
        `"${s.text.replace(/"/g, '""')}"`,
        s.submittedBy,
        s.submittedDate,
        s.status,
        s.priority
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gad-suggestions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const activeSuggestions = suggestions.filter(s => !s.archived);
  const archivedSuggestions = suggestions.filter(s => s.archived);
  
  const displayedSuggestions = viewMode === "active" ? activeSuggestions : archivedSuggestions;

  let filteredSuggestions = displayedSuggestions.filter((s) => {
    const matchesSearch = 
      s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    
    const matchesDateRange = (!dateRange.start || new Date(s.submittedDate) >= new Date(dateRange.start)) &&
                             (!dateRange.end || new Date(s.submittedDate) <= new Date(dateRange.end));
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Sorting
  filteredSuggestions.sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (sortConfig.key === 'submittedDate') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'under-review': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'implemented': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-50 text-red-700 border-red-200',
      'medium': 'bg-orange-50 text-orange-700 border-orange-200',
      'low': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[priority] || 'bg-gray-50 text-gray-700';
  };

  const stats = {
    total: activeSuggestions.length,
    pending: activeSuggestions.filter(s => s.status === 'pending').length,
    approved: activeSuggestions.filter(s => s.status === 'approved').length,
    archived: archivedSuggestions.length
  };

  // Analytics data
  const statusData = [
    { name: 'Pending', value: suggestions.filter(s => s.status === 'pending').length },
    { name: 'Under Review', value: suggestions.filter(s => s.status === 'under-review').length },
    { name: 'Approved', value: suggestions.filter(s => s.status === 'approved').length },
    { name: 'Rejected', value: suggestions.filter(s => s.status === 'rejected').length },
    { name: 'Implemented', value: suggestions.filter(s => s.status === 'implemented').length },
  ];

  const monthlyData = [
    { month: 'Sep', submissions: 2 },
    { month: 'Oct', submissions: 6 },
    { month: 'Nov', submissions: 0 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
            <Loader className="animate-spin text-blue-600" size={48} />
            <p className="text-gray-700 font-medium">Loading suggestions...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <X className="text-red-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchSuggestions}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex gap-6">

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {!showSidebar && (
                <button 
                  onClick={() => setShowSidebar(true)}
                  className="p-2 hover:bg-white rounded-lg print:hidden"
                >
                  <Menu size={20} />
                </button>
              )}
              <h1 className="text-4xl font-bold text-gray-900">
                GAD Suggestion Box
              </h1>
            </div>
            <p className="text-gray-600">Manage user-submitted suggestions for Gender and Development initiatives</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Active</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Tag className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Archived</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.archived}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Archive className="text-gray-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4 print:hidden">
            <button
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 border"
            >
              <BarChart3 size={18} /> Analytics
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 border"
            >
              <Download size={18} /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 border"
            >
              <Printer size={18} /> Print
            </button>
            {selectedItems.length > 0 && (
              <>
                <button
                  onClick={handleBulkArchive}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Archive size={18} /> Archive ({selectedItems.length})
                </button>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusChange(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <option value="">Bulk Status Change</option>
                  <option value="pending">Pending</option>
                  <option value="under-review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="implemented">Implemented</option>
                </select>
              </>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode("active")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "active"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Active Suggestions
            </button>
            <button
              onClick={() => setViewMode("archived")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "archived"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Archived
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search suggestions..."
                  className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 appearance-none bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under-review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="implemented">Implemented</option>
                </select>
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  placeholder="Start Date"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  placeholder="End Date"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 border-b">
                  <tr>
                    <th className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredSuggestions.length && filteredSuggestions.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleSort('id')}>
                      ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-4 font-semibold">Suggestion</th>
                    <th className="p-4 font-semibold">Submitted By</th>
                    <th className="p-4 font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleSort('submittedDate')}>
                      Date {sortConfig.key === 'submittedDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleSort('priority')}>
                      Priority {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleSort('status')}>
                      Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((s) => (
                      <tr key={s.id} className={`border-b hover:bg-gray-50 transition ${selectedItems.includes(s.id) ? 'bg-blue-50' : ''}`}>
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(s.id)}
                            onChange={() => handleSelectItem(s.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-4 font-medium text-gray-900">#{s.id}</td>
                        <td className="p-4 text-gray-800 max-w-xs">
                          <div className="line-clamp-2">{s.text}</div>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          <div className="flex items-center gap-2">
                            <User size={14} />
                            {s.submittedBy}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(s.submittedDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={s.priority}
                            onChange={(e) => handlePriorityChange(s.id, e.target.value)}
                            className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(s.priority)}`}
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={s.status}
                            onChange={(e) => handleStatusChange(s.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="under-review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="implemented">Implemented</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openDetailModal(s)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {!s.archived ? (
                              <button
                                onClick={() => handleArchive(s.id)}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded transition"
                                title="Archive"
                              >
                                <Archive size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnarchive(s.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                title="Unarchive"
                              >
                                <ArchiveX size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search size={48} className="text-gray-300" />
                          <p className="text-lg font-medium">No suggestions found</p>
                          <p className="text-sm">Try adjusting your filters or search query</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredSuggestions.length} of {displayedSuggestions.length} suggestions
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 size={28} className="text-blue-600" />
                Analytics Dashboard
              </h2>
              <button 
                onClick={() => setShowAnalytics(false)} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="text-blue-600" size={20} />
                    <span className="text-xs font-medium text-blue-600">TOTAL</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{suggestions.length}</p>
                  <p className="text-sm text-gray-600">All Suggestions</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-xs font-medium text-green-600">SUCCESS</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {suggestions.filter(s => s.status === 'implemented').length}
                  </p>
                  <p className="text-sm text-gray-600">Implemented</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="text-yellow-600" size={20} />
                    <span className="text-xs font-medium text-yellow-600">PENDING</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {suggestions.filter(s => s.status === 'pending' || s.status === 'under-review').length}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <PieChart className="text-purple-600" size={20} />
                    <span className="text-xs font-medium text-purple-600">RATE</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {suggestions.length > 0 ? Math.round((suggestions.filter(s => s.status === 'approved' || s.status === 'implemented').length / suggestions.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Approval Rate</p>
                </div>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 gap-6">
                {/* Status Distribution */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Suggestions by Status</h3>
                  <div className="flex items-end justify-around h-64 border-b border-l border-gray-300 p-4">
                    {statusData.map((status, idx) => {
                      const maxValue = Math.max(...statusData.map(s => s.value));
                      const height = maxValue > 0 ? (status.value / maxValue) * 100 : 0;
                      const colors = ['bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500'];
                      return (
                        <div key={status.name} className="flex flex-col items-center gap-2">
                          <div className="text-sm font-semibold">{status.value}</div>
                          <div 
                            className={`${colors[idx]} w-16 rounded-t transition-all duration-500`}
                            style={{ height: `${height}%`, minHeight: status.value > 0 ? '20px' : '0' }}
                          ></div>
                          <div className="text-xs text-center w-20 text-gray-600">{status.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Monthly Submissions Trend</h3>
                <div className="relative h-64 border-b border-l border-gray-300">
                  <div className="absolute inset-0 flex items-end justify-around p-4">
                    {monthlyData.map((month, idx) => {
                      const maxValue = Math.max(...monthlyData.map(m => m.submissions));
                      const height = maxValue > 0 ? (month.submissions / maxValue) * 100 : 0;
                      return (
                        <div key={month.month} className="flex flex-col items-center gap-2 flex-1">
                          <div className="text-sm font-semibold text-blue-600">{month.submissions}</div>
                          <div className="relative w-full max-w-[80px]">
                            <div 
                              className="bg-blue-500 w-full rounded-t transition-all duration-500"
                              style={{ height: `${height * 2}px`, minHeight: month.submissions > 0 ? '20px' : '0' }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600">{month.month}</div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span>6</span>
                    <span>4</span>
                    <span>2</span>
                    <span>0</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    Number of Submissions
                  </span>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-600">
                      {suggestions.filter(s => s.priority === 'high').length}
                    </p>
                    <p className="text-sm text-gray-600">High Priority</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">
                      {suggestions.filter(s => s.priority === 'medium').length}
                    </p>
                    <p className="text-sm text-gray-600">Medium Priority</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-600">
                      {suggestions.filter(s => s.priority === 'low').length}
                    </p>
                    <p className="text-sm text-gray-600">Low Priority</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex justify-end p-6 border-t">
              <button
                onClick={() => setShowAnalytics(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b z-10">
              <h2 className="text-2xl font-semibold text-gray-900">
                Suggestion Details
              </h2>
              <button 
                onClick={closeDetailModal} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                  {/* ID and Date */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Suggestion ID</p>
                      <p className="text-lg font-semibold text-gray-900">#{selectedSuggestion.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Submitted Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(selectedSuggestion.submittedDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status and Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedSuggestion.status)}`}>
                        {selectedSuggestion.status.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <span className={`inline-block px-4 py-2 rounded border text-sm font-medium ${getPriorityColor(selectedSuggestion.priority)}`}>
                        {selectedSuggestion.priority.charAt(0).toUpperCase() + selectedSuggestion.priority.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Category and Submitter */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Submitted By</label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <User size={16} className="text-gray-500" />
                        {selectedSuggestion.submittedBy}
                      </div>
                    </div>
                  </div>

                  {/* Suggestion Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Suggestion</label>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-800 leading-relaxed">{selectedSuggestion.text}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Log - Right Side */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sticky top-24">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="text-blue-600" size={20} />
                      <h3 className="text-sm font-semibold text-gray-900">Activity Log</h3>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedSuggestion.activityLog && selectedSuggestion.activityLog.length > 0 ? (
                        selectedSuggestion.activityLog.map((log, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                              {idx < selectedSuggestion.activityLog.length - 1 && (
                                <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                              )}
                            </div>
                            <div className="pb-4 flex-1">
                              <p className="text-sm font-medium text-gray-900">{log.action}</p>
                              <p className="text-xs text-gray-500">{log.user}</p>
                              <p className="text-xs text-gray-400">{new Date(log.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No activity recorded</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex justify-end p-6 border-t">
              <div className="flex gap-2">
                {!selectedSuggestion.archived ? (
                  <button
                    onClick={() => {
                      handleArchive(selectedSuggestion.id);
                      closeDetailModal();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
                  >
                    <Archive size={16} /> Archive
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleUnarchive(selectedSuggestion.id);
                      closeDetailModal();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    <ArchiveX size={16} /> Unarchive
                  </button>
                )}
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminGADSuggestionBox;