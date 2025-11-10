import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Share2, 
  X, 
  Eye, 
  Archive, 
  RefreshCw,
  Search,
  Filter,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  Download
} from "lucide-react";

// Import all API functions
import { 
  getAllReports, 
  getArchivedReports, 
  getReportById, 
  updateReportStatus, 
  archiveReport, 
  restoreReport, 
  addReferral 
} from "../../api/report";

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [reports, setReports] = useState([]);
  const [archivedReports, setArchivedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Modals
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  
  // Form states
  const [newStatus, setNewStatus] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [referralDept, setReferralDept] = useState("");
  const [referralNote, setReferralNote] = useState("");
  
  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      console.log("Fetching reports...");
      
      const [activeRes, archivedRes] = await Promise.all([
        getAllReports(),
        getArchivedReports()
      ]);
      
      console.log("Active reports response:", activeRes);
      console.log("Archived reports response:", archivedRes);
      
      if (activeRes.success) {
        setReports(activeRes.data || []);
        console.log("Set active reports:", activeRes.data?.length || 0);
      } else {
        console.error("Active reports fetch failed:", activeRes);
        showToast(activeRes.message || "Failed to fetch active reports", "error");
      }
      
      if (archivedRes.success) {
        setArchivedReports(archivedRes.data || []);
        console.log("Set archived reports:", archivedRes.data?.length || 0);
      } else {
        console.error("Archived reports fetch failed:", archivedRes);
      }
    } catch (error) {
      console.error("Fetch reports error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      showToast(`Failed to fetch reports: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleViewDetails = async (reportId) => {
    try {
      console.log("Fetching report details for:", reportId);
      const res = await getReportById(reportId);
      console.log("Report details response:", res);
      
      if (res.success) {
        setSelectedReport(res.data);
        setShowDetailsModal(true);
      } else {
        showToast(res.message || "Failed to load report details", "error");
      }
    } catch (error) {
      console.error("View details error:", error);
      showToast(`Failed to load report details: ${error.message}`, "error");
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    
    try {
      console.log("Updating status:", { id: selectedReport._id, status: newStatus, remarks: statusRemarks });
      const res = await updateReportStatus(selectedReport._id, newStatus, statusRemarks);
      console.log("Update status response:", res);
      
      if (res.success) {
        showToast("Status updated successfully");
        setShowStatusModal(false);
        setNewStatus("");
        setStatusRemarks("");
        fetchReports();
      } else {
        showToast(res.message || "Failed to update status", "error");
      }
    } catch (error) {
      console.error("Update status error:", error);
      showToast(`Failed to update status: ${error.message}`, "error");
    }
  };

  const handleArchive = async () => {
    try {
      console.log("Archiving report:", selectedReport._id);
      const res = await archiveReport(selectedReport._id);
      console.log("Archive response:", res);
      
      if (res.success) {
        showToast("Report archived successfully");
        setShowArchiveModal(false);
        setShowDetailsModal(false);
        fetchReports();
      } else {
        showToast(res.message || "Failed to archive report", "error");
      }
    } catch (error) {
      console.error("Archive error:", error);
      showToast(`Failed to archive report: ${error.message}`, "error");
    }
  };

  const handleRestore = async () => {
    try {
      console.log("Restoring report:", selectedReport._id);
      const res = await restoreReport(selectedReport._id);
      console.log("Restore response:", res);
      
      if (res.success) {
        showToast("Report restored successfully");
        setShowRestoreModal(false);
        setShowDetailsModal(false);
        fetchReports();
      } else {
        showToast(res.message || "Failed to restore report", "error");
      }
    } catch (error) {
      console.error("Restore error:", error);
      showToast(`Failed to restore report: ${error.message}`, "error");
    }
  };

  const handleAddReferral = async () => {
    if (!referralDept) return;
    
    try {
      console.log("Adding referral:", { id: selectedReport._id, department: referralDept, note: referralNote });
      const res = await addReferral(selectedReport._id, {
        department: referralDept,
        note: referralNote
      });
      console.log("Add referral response:", res);
      
      if (res.success) {
        showToast("Referral added successfully");
        setShowReferralModal(false);
        setReferralDept("");
        setReferralNote("");
        fetchReports();
      } else {
        showToast(res.message || "Failed to add referral", "error");
      }
    } catch (error) {
      console.error("Add referral error:", error);
      showToast(`Failed to add referral: ${error.message}`, "error");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setDateFrom("");
    setDateTo("");
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Reviewed: "bg-blue-100 text-blue-800",
      "In Progress": "bg-purple-100 text-purple-800",
      Resolved: "bg-green-100 text-green-800",
      Closed: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: <Clock size={14} />,
      Reviewed: <Eye size={14} />,
      "In Progress": <RefreshCw size={14} />,
      Resolved: <CheckCircle size={14} />,
      Closed: <XCircle size={14} />
    };
    return icons[status] || <AlertCircle size={14} />;
  };

  // Get unique categories from reports
  const allCategories = [...new Set(
    [...reports, ...archivedReports]
      .flatMap(r => r.incidentTypes || [])
      .filter(Boolean)
  )];

  // Advanced filtering logic
  const filteredReports = (activeTab === "active" ? reports : archivedReports).filter(r => {
    // Search filter
    const matchesSearch = !searchTerm || 
      r.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.incidentDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.createdBy?.tupId || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    
    // Category filter
    const matchesCategory = categoryFilter === "All" || 
      r.incidentTypes?.includes(categoryFilter);
    
    // Date range filter
    const reportDate = new Date(r.submittedAt);
    const matchesDateFrom = !dateFrom || reportDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || reportDate <= new Date(dateTo + "T23:59:59");
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDateFrom && matchesDateTo;
  });

  const activeFilterCount = [
    statusFilter !== "All",
    categoryFilter !== "All",
    dateFrom,
    dateTo
  ].filter(Boolean).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === "error" ? "bg-red-500" : "bg-green-500"
        } text-white flex items-center gap-2`}>
          {toast.type === "error" ? <XCircle size={20} /> : <CheckCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Report Management</h1>
        <p className="text-gray-600">View and manage all incident reports</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by ticket number, description, or TUP ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter size={20} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Reviewed</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option>All</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {activeFilterCount > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "active"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Active Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "archived"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Archived ({archivedReports.length})
        </button>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing <span className="font-semibold">{filteredReports.length}</span> of{" "}
        <span className="font-semibold">
          {activeTab === "active" ? reports.length : archivedReports.length}
        </span>{" "}
        reports
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText size={48} className="mb-3 text-gray-300" />
            <p className="text-lg font-medium">No reports found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.ticketNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.isAnonymous ? (
                          <span className="text-gray-500 italic">Anonymous</span>
                        ) : (
                          report.createdBy?.tupId || "Unknown User"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {report.incidentTypes?.slice(0, 2).join(", ") || "N/A"}
                        {report.incidentTypes?.length > 2 && (
                          <span className="text-gray-500"> +{report.incidentTypes.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(report._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {activeTab === "active" ? (
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowArchiveModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="Archive"
                          >
                            <Archive size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowRestoreModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Restore"
                          >
                            <RefreshCw size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Report Details</h2>
              <X
                className="cursor-pointer hover:text-red-500"
                onClick={() => setShowDetailsModal(false)}
              />
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ticket Number</label>
                    <p className="text-gray-900 font-mono">{selectedReport.ticketNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                        {getStatusIcon(selectedReport.status)}
                        {selectedReport.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Submitted Date</label>
                    <p className="text-gray-900">{new Date(selectedReport.submittedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-gray-900">{new Date(selectedReport.lastUpdated).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Reporter Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Reporter Information</h3>
                {selectedReport.isAnonymous ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 font-medium mb-2">Anonymous Report</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedReport.reporterRole && (
                        <div>
                          <label className="text-gray-600">Role</label>
                          <p className="text-gray-900">{selectedReport.reporterRole}</p>
                        </div>
                      )}
                      {selectedReport.tupRole && (
                        <div>
                          <label className="text-gray-600">TUP Role</label>
                          <p className="text-gray-900">{selectedReport.tupRole}</p>
                        </div>
                      )}
                      {selectedReport.anonymousGender && (
                        <div>
                          <label className="text-gray-600">Gender</label>
                          <p className="text-gray-900">{selectedReport.anonymousGender}</p>
                        </div>
                      )}
                      {selectedReport.anonymousDepartment && (
                        <div>
                          <label className="text-gray-600">Department</label>
                          <p className="text-gray-900">{selectedReport.anonymousDepartment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 font-medium mb-2">
                      {selectedReport.createdBy?.tupId || "Unknown User"}
                    </p>
                    {selectedReport.createdBy?.email && (
                      <p className="text-sm text-gray-600">{selectedReport.createdBy.email}</p>
                    )}
                    {selectedReport.createdBy?.firstName && selectedReport.createdBy?.lastName && (
                      <p className="text-sm text-gray-600">
                        {selectedReport.createdBy.firstName} {selectedReport.createdBy.lastName}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Victim Information */}
              {!selectedReport.isAnonymous && (selectedReport.lastName || selectedReport.firstName) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Victim Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Full Name</label>
                      <p className="text-gray-900">
                        {[selectedReport.firstName, selectedReport.middleName, selectedReport.lastName].filter(Boolean).join(" ") || "N/A"}
                      </p>
                    </div>
                    {selectedReport.alias && (
                      <div>
                        <label className="text-gray-600">Alias</label>
                        <p className="text-gray-900">{selectedReport.alias}</p>
                      </div>
                    )}
                    {selectedReport.sex && (
                      <div>
                        <label className="text-gray-600">Sex</label>
                        <p className="text-gray-900">{selectedReport.sex}</p>
                      </div>
                    )}
                    {selectedReport.age && (
                      <div>
                        <label className="text-gray-600">Age</label>
                        <p className="text-gray-900">{selectedReport.age}</p>
                      </div>
                    )}
                    {selectedReport.dateOfBirth && (
                      <div>
                        <label className="text-gray-600">Date of Birth</label>
                        <p className="text-gray-900">{selectedReport.dateOfBirth}</p>
                      </div>
                    )}
                    {selectedReport.civilStatus && (
                      <div>
                        <label className="text-gray-600">Civil Status</label>
                        <p className="text-gray-900">{selectedReport.civilStatus}</p>
                      </div>
                    )}
                    {selectedReport.nationality && (
                      <div>
                        <label className="text-gray-600">Nationality</label>
                        <p className="text-gray-900">{selectedReport.nationality}</p>
                      </div>
                    )}
                    {selectedReport.occupation && (
                      <div>
                        <label className="text-gray-600">Occupation</label>
                        <p className="text-gray-900">{selectedReport.occupation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Perpetrator Information */}
              {(selectedReport.perpFirstName || selectedReport.perpLastName) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Perpetrator Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Full Name</label>
                      <p className="text-gray-900">
                        {[selectedReport.perpFirstName, selectedReport.perpMiddleName, selectedReport.perpLastName].filter(Boolean).join(" ") || "N/A"}
                      </p>
                    </div>
                    {selectedReport.perpAlias && (
                      <div>
                        <label className="text-gray-600">Alias</label>
                        <p className="text-gray-900">{selectedReport.perpAlias}</p>
                      </div>
                    )}
                    {selectedReport.perpSex && (
                      <div>
                        <label className="text-gray-600">Sex</label>
                        <p className="text-gray-900">{selectedReport.perpSex}</p>
                      </div>
                    )}
                    {selectedReport.perpAge && (
                      <div>
                        <label className="text-gray-600">Age</label>
                        <p className="text-gray-900">{selectedReport.perpAge}</p>
                      </div>
                    )}
                    {selectedReport.perpRelationship && (
                      <div>
                        <label className="text-gray-600">Relationship to Victim</label>
                        <p className="text-gray-900">{selectedReport.perpRelationship}</p>
                      </div>
                    )}
                    {selectedReport.perpOccupation && (
                      <div>
                        <label className="text-gray-600">Occupation</label>
                        <p className="text-gray-900">{selectedReport.perpOccupation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Incident Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Incident Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Incident Type(s)</label>
                    <p className="text-gray-900">{selectedReport.incidentTypes?.join(", ") || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.incidentDescription || "No description provided"}</p>
                  </div>
                  {selectedReport.latestIncidentDate && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-gray-600">Latest Incident Date</label>
                        <p className="text-gray-900">{selectedReport.latestIncidentDate}</p>
                      </div>
                    </div>
                  )}
                  {selectedReport.placeOfIncident && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Place of Incident</label>
                      <p className="text-gray-900">{selectedReport.placeOfIncident}</p>
                    </div>
                  )}
                  {(selectedReport.incidentRegion || selectedReport.incidentProvince || selectedReport.incidentCityMun || selectedReport.incidentBarangay) && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Incident Location</label>
                      <p className="text-gray-900">
                        {[selectedReport.incidentBarangay, selectedReport.incidentCityMun, selectedReport.incidentProvince, selectedReport.incidentRegion].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Witness Information */}
              {selectedReport.witnessName && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Witness Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Name</label>
                      <p className="text-gray-900">{selectedReport.witnessName}</p>
                    </div>
                    {selectedReport.witnessContact && (
                      <div>
                        <label className="text-gray-600">Contact</label>
                        <p className="text-gray-900">{selectedReport.witnessContact}</p>
                      </div>
                    )}
                    {selectedReport.witnessAddress && (
                      <div className="col-span-2">
                        <label className="text-gray-600">Address</label>
                        <p className="text-gray-900">{selectedReport.witnessAddress}</p>
                      </div>
                    )}
                    {selectedReport.witnessAccount && (
                      <div className="col-span-2">
                        <label className="text-gray-600">Account</label>
                        <p className="text-gray-900">{selectedReport.witnessAccount}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Services & Referrals */}
              {(selectedReport.crisisIntervention || selectedReport.protectionOrder || selectedReport.referToSWDO || selectedReport.referToHealthcare || selectedReport.referToLawEnforcement || selectedReport.referToOther) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Services & Referrals</h3>
                  <div className="space-y-2 text-sm">
                    {selectedReport.crisisIntervention && (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-gray-900">Crisis Intervention</span>
                      </div>
                    )}
                    {selectedReport.protectionOrder && (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-gray-900">Protection Order</span>
                      </div>
                    )}
                    {selectedReport.referToSWDO && (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-gray-900">Referred to SWDO - {selectedReport.swdoServices?.join(", ")}</span>
                      </div>
                    )}
                    {selectedReport.referToHealthcare && (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-gray-900">Referred to Healthcare - {selectedReport.healthcareProvider}</span>
                      </div>
                    )}
                    {selectedReport.referToLawEnforcement && (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-gray-900">Referred to Law Enforcement - {selectedReport.lawAgency}</span>
                      </div>
                    )}
                    {selectedReport.referToOther && (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-gray-900">Referred to {selectedReport.otherProvider} - {selectedReport.otherService}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedReport.attachments?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Attachments</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm"
                      >
                        <Download size={16} />
                        {att.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {selectedReport.additionalNotes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Additional Notes</h3>
                  <p className="text-gray-900 whitespace-pre-wrap text-sm">{selectedReport.additionalNotes}</p>
                </div>
              )}

              {/* Referrals */}
              {selectedReport.referrals?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Referral History</h3>
                  <div className="space-y-3">
                    {selectedReport.referrals.map((ref, i) => (
                      <div key={i} className="bg-purple-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-900">{ref.department}</p>
                        {ref.note && <p className="text-sm text-gray-600 mt-1">{ref.note}</p>}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(ref.date).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {selectedReport.timeline?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Timeline</h3>
                  <div className="space-y-2">
                    {selectedReport.timeline.map((t, i) => (
                      <div key={i} className="border-l-2 border-blue-500 pl-4 py-2">
                        <p className="font-medium text-gray-900">{t.action}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(t.timestamp).toLocaleString()}
                          {t.remarks && ` • ${t.remarks}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setNewStatus(selectedReport.status);
                  setShowStatusModal(true);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowReferralModal(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
              >
                Add Referral
              </button>
              {!selectedReport.archived && (
                <button
                  onClick={() => setShowArchiveModal(true)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Update Status</h2>
              <X
                className="cursor-pointer hover:text-red-500"
                onClick={() => setShowStatusModal(false)}
              />
            </div>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              <option>Pending</option>
              <option>Reviewed</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
              rows="3"
              placeholder="Add remarks (optional)..."
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
            />
            <button
              onClick={handleUpdateStatus}
              disabled={!newStatus}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded-lg"
            >
              Update Status
            </button>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Referral</h2>
              <X
                className="cursor-pointer hover:text-red-500"
                onClick={() => setShowReferralModal(false)}
              />
            </div>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3"
              placeholder="Department (e.g., OSA, HR, Legal)"
              value={referralDept}
              onChange={(e) => setReferralDept(e.target.value)}
            />
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
              rows="3"
              placeholder="Referral note..."
              value={referralNote}
              onChange={(e) => setReferralNote(e.target.value)}
            />
            <button
              onClick={handleAddReferral}
              disabled={!referralDept}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-2 rounded-lg"
            >
              Add Referral
            </button>
          </div>
        </div>
      )}

      {/* Archive Confirmation */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Archive Report</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to archive this report? It will be moved to the archived section.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Restore Report</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to restore this report? It will be moved back to active reports.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;