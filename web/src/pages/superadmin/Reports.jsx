import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, Send, Share2, X, Eye, Archive, RefreshCw,
  Search, Filter, Calendar, FileText, AlertCircle, CheckCircle,
  Clock, XCircle, ChevronDown, Download, Users, UserCheck, ClipboardList
} from "lucide-react";

import {
  getAllReports, getArchivedReports, getReportById,
  updateReportStatus, archiveReport, restoreReport, addReferral
} from "../../api/report";

import { createOrGetChat } from "../../api/chat";

const AdminReports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [reports, setReports] = useState([]);
  const [archivedReports, setArchivedReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [caseStatusFilter, setCaseStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCaseStatusModal, setShowCaseStatusModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [newCaseStatus, setNewCaseStatus] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [caseStatusRemarks, setCaseStatusRemarks] = useState("");
  const [referralDept, setReferralDept] = useState("");
  const [referralNote, setReferralNote] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchReports();
  }, []);

  const handleMessageUser = async (user) => {
    try {
      console.log("💬 Starting chat with user:", user);
      
      // Extract user ID
      const userId = user._id || user.id;
      
      if (!userId) {
        showToast("Unable to message user: User ID not found", "error");
        return;
      }

      // Create or get existing chat
      const chat = await createOrGetChat(userId);
      console.log("✅ Chat created/retrieved:", chat);

      // Navigate to chat screen with user details
      navigate('/superadmin/chat', {
        state: {
          chatId: chat._id || chat.id,
          receiverId: userId,
          receiverName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.tupId || "User",
        }
      });
    } catch (error) {
      console.error("❌ Error creating/getting chat:", error);
      showToast(`Failed to start chat: ${error.message}`, "error");
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [activeRes, archivedRes] = await Promise.all([
        getAllReports(),
        getArchivedReports()
      ]);

      if (activeRes.success) setReports(activeRes.data || []);
      else showToast(activeRes.message || "Failed to fetch active reports", "error");

      if (archivedRes.success) setArchivedReports(archivedRes.data || []);
      else console.error("Archived reports fetch failed:", archivedRes);
    } catch (error) {
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
      const res = await getReportById(reportId);
      if (res.success) {
        setSelectedReport(res.data);
        setShowDetailsModal(true);
      } else {
        showToast(res.message || "Failed to load report details", "error");
      }
    } catch (error) {
      showToast(`Failed to load report details: ${error.message}`, "error");
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    try {
      const res = await updateReportStatus(selectedReport._id, newStatus, statusRemarks);
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
      showToast(`Failed to update status: ${error.message}`, "error");
    }
  };

  const handleUpdateCaseStatus = async () => {
    if (!newCaseStatus) return;
    try {
      const res = await updateReportStatus(selectedReport._id, selectedReport.status, caseStatusRemarks, newCaseStatus);
      if (res.success) {
        showToast("Case status updated successfully");
        setShowCaseStatusModal(false);
        setNewCaseStatus("");
        setCaseStatusRemarks("");
        fetchReports();
      } else {
        showToast(res.message || "Failed to update case status", "error");
      }
    } catch (error) {
      showToast(`Failed to update case status: ${error.message}`, "error");
    }
  };

  const handleArchive = async () => {
    try {
      const res = await archiveReport(selectedReport._id);
      if (res.success) {
        showToast("Report archived successfully");
        setShowArchiveModal(false);
        setShowDetailsModal(false);
        fetchReports();
      } else {
        showToast(res.message || "Failed to archive report", "error");
      }
    } catch (error) {
      showToast(`Failed to archive report: ${error.message}`, "error");
    }
  };

  const handleRestore = async () => {
    try {
      const res = await restoreReport(selectedReport._id);
      if (res.success) {
        showToast("Report restored successfully");
        setShowRestoreModal(false);
        setShowDetailsModal(false);
        fetchReports();
      } else {
        showToast(res.message || "Failed to restore report", "error");
      }
    } catch (error) {
      showToast(`Failed to restore report: ${error.message}`, "error");
    }
  };

  const handleAddReferral = async () => {
    if (!referralDept) return;
    try {
      const res = await addReferral(selectedReport._id, {
        department: referralDept,
        note: referralNote
      });
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
      showToast(`Failed to add referral: ${error.message}`, "error");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCaseStatusFilter("All");
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

  const getCaseStatusColor = (caseStatus) => {
    const colors = {
      "For Queuing": "bg-orange-100 text-orange-800",
      "For Interview": "bg-cyan-100 text-cyan-800",
      "For Appointment": "bg-indigo-100 text-indigo-800",
      "For Referral": "bg-pink-100 text-pink-800"
    };
    return colors[caseStatus] || "bg-gray-100 text-gray-800";
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

  const getCaseStatusIcon = (caseStatus) => {
    const icons = {
      "For Queuing": <ClipboardList size={14} />,
      "For Interview": <Users size={14} />,
      "For Appointment": <Calendar size={14} />,
      "For Referral": <Share2 size={14} />
    };
    return icons[caseStatus] || <AlertCircle size={14} />;
  };

  const allCategories = [...new Set(
    [...reports, ...archivedReports]
      .flatMap(r => r.incidentTypes || [])
      .filter(Boolean)
  )];

  const filteredReports = (activeTab === "active" ? reports : archivedReports).filter(r => {
    const matchesSearch = !searchTerm ||
      r.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.incidentDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.createdBy?.tupId || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const matchesCaseStatus = caseStatusFilter === "All" || r.caseStatus === caseStatusFilter;
    const matchesCategory = categoryFilter === "All" || r.incidentTypes?.includes(categoryFilter);

    const reportDate = new Date(r.submittedAt);
    const matchesDateFrom = !dateFrom || reportDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || reportDate <= new Date(dateTo + "T23:59:59");

    return matchesSearch && matchesStatus && matchesCaseStatus && matchesCategory && matchesDateFrom && matchesDateTo;
  });

  const activeFilterCount = [
    statusFilter !== "All",
    caseStatusFilter !== "All",
    categoryFilter !== "All",
    dateFrom,
    dateTo
  ].filter(Boolean).length;

  const InfoItem = ({ label, value }) => {
    if (!value) return null;
    return (
      <div>
        <label className="text-gray-600 text-xs">{label}</label>
        <p className="text-gray-900 text-sm">{value}</p>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg ${toast.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white`}>
          {toast.type === "error" ? <XCircle size={20} /> : <CheckCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Management</h1>
        <p className="text-gray-600">Monitor and manage incident reports</p>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${showFilters || activeFilterCount > 0
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <Filter size={20} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold min-w-6">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Case Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={caseStatusFilter}
                  onChange={(e) => setCaseStatusFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>For Queuing</option>
                  <option>For Interview</option>
                  <option>For Appointment</option>
                  <option>For Referral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option>All</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

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

      {/* Content Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs and Summary */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === "active"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
              >
                Active Reports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab("archived")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === "archived"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
              >
                Archived ({archivedReports.length})
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredReports.length}</span> of{" "}
              <span className="font-semibold">
                {activeTab === "active" ? reports.length : archivedReports.length}
              </span> reports
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin text-blue-600" size={32} />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText size={48} className="mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">No reports found</p>
              <p className="text-sm">Adjust your search criteria or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {report.ticketNumber}
                        </div>
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
                        {report.caseStatus ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCaseStatusColor(report.caseStatus)}`}>
                            {getCaseStatusIcon(report.caseStatus)}
                            {report.caseStatus}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Not Set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(report._id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded"
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
                              className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded"
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
                              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded"
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
      </div>

      {/* Enhanced Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedReport.ticketNumber}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div>
                {/* Left Column - Basic Info */}
                <div>
                  {/* Timeline */}
                  {selectedReport.timeline?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                      <div className="space-y-3">
                        {selectedReport.timeline.slice(0, 3).map((t, i) => (
                          <div key={i} className="border-l-2 border-blue-500 pl-3 py-1">
                            <p className="text-sm font-medium text-gray-900">{t.action}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(t.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-gray-600">Submitted Date</label>
                        <p className="text-gray-900 font-medium">{new Date(selectedReport.submittedAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-gray-600">Last Updated</label>
                        <p className="text-gray-900 font-medium">{new Date(selectedReport.lastUpdated).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reporter Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Reporter Information</h3>
                    {selectedReport.isAnonymous ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 font-medium mb-2">Anonymous Report</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {selectedReport.reporterRole && (
                            <div>
                              <label className="text-yellow-700">Role</label>
                              <p className="text-yellow-900">{selectedReport.reporterRole}</p>
                            </div>
                          )}
                          {selectedReport.anonymousGender && (
                            <div>
                              <label className="text-yellow-700">Gender</label>
                              <p className="text-yellow-900">{selectedReport.anonymousGender}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-gray-600">TUP ID</label>
                          <p className="text-gray-900 font-medium">{selectedReport.createdBy?.tupId || "Unknown"}</p>
                        </div>
                        {selectedReport.createdBy?.email && (
                          <div>
                            <label className="text-gray-600">Email</label>
                            <p className="text-gray-900">{selectedReport.createdBy.email}</p>
                          </div>
                        )}
                        {/* ✅ MESSAGE USER BUTTON */}
<<<<<<< HEAD
                        {selectedReport.createdBy && (
                          <div className="col-span-2 mt-3">
                            <button
                              onClick={() => handleMessageUser(selectedReport.createdBy)}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              <MessageSquare size={16} />
                              Message User
                            </button>
                          </div>
                        )}
=======
                         <div className="col-span-2 mt-3">
                          <button
                            onClick={() => handleMessageUser(selectedReport.createdBy)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            <MessageSquare size={16} />
                            Message User
                          </button>
                        </div>
>>>>>>> 77d1389feca5d1ed82944591c897c4a752e508af
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                      Victim / Reporter Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Last Name" value={selectedReport.lastName} />
                      <InfoItem label="First Name" value={selectedReport.firstName} />
                      <InfoItem label="Middle Name" value={selectedReport.middleName} />
                      <InfoItem label="Alias" value={selectedReport.alias} />
                      <InfoItem label="Sex" value={selectedReport.sex} />
                      <InfoItem label="Date of Birth" value={selectedReport.dateOfBirth} />
                      <InfoItem label="Age" value={selectedReport.age} />
                      <InfoItem label="Civil Status" value={selectedReport.civilStatus} />
                      <InfoItem label="Educational Attainment" value={selectedReport.educationalAttainment} />
                      <InfoItem label="Nationality" value={selectedReport.nationality} />
                      <InfoItem label="Occupation" value={selectedReport.occupation} />
                      <InfoItem label="Religion" value={selectedReport.religion} />
                      <InfoItem label="Region" value={selectedReport.region} />
                      <InfoItem label="Province" value={selectedReport.province} />
                      <InfoItem label="City / Municipality" value={selectedReport.cityMun} />
                      <InfoItem label="Barangay" value={selectedReport.barangay} />
                      <InfoItem label="Disability" value={selectedReport.disability} />
                      <InfoItem label="Number of Children" value={selectedReport.numberOfChildren} />
                      <InfoItem label="Ages of Children" value={selectedReport.agesOfChildren} />
                    </div>
                  </div>


                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                      Guardian Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Last Name" value={selectedReport.guardianLastName} />
                      <InfoItem label="First Name" value={selectedReport.guardianFirstName} />
                      <InfoItem label="Middle Name" value={selectedReport.guardianMiddleName} />
                      <InfoItem label="Relationship" value={selectedReport.guardianRelationship} />
                      <InfoItem label="Contact" value={selectedReport.guardianContact} />
                      <InfoItem label="Region" value={selectedReport.guardianRegion} />
                      <InfoItem label="Province" value={selectedReport.guardianProvince} />
                      <InfoItem label="City / Municipality" value={selectedReport.guardianCityMun} />
                      <InfoItem label="Barangay" value={selectedReport.guardianBarangay} />
                    </div>
                  </div>


                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                      Perpetrator Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Last Name" value={selectedReport.perpLastName} />
                      <InfoItem label="First Name" value={selectedReport.perpFirstName} />
                      <InfoItem label="Middle Name" value={selectedReport.perpMiddleName} />
                      <InfoItem label="Alias" value={selectedReport.perpAlias} />
                      <InfoItem label="Sex" value={selectedReport.perpSex} />
                      <InfoItem label="Age" value={selectedReport.perpAge} />
                      <InfoItem label="Relationship to Victim" value={selectedReport.perpRelationship} />
                      <InfoItem label="Occupation" value={selectedReport.perpOccupation} />
                      <InfoItem label="Religion" value={selectedReport.perpReligion} />
                      <InfoItem label="Region" value={selectedReport.perpRegion} />
                      <InfoItem label="Province" value={selectedReport.perpProvince} />
                      <InfoItem label="City / Municipality" value={selectedReport.perpCityMun} />
                      <InfoItem label="Barangay" value={selectedReport.perpBarangay} />
                    </div>
                  </div>


                  {/* <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                      Services & Referrals
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Crisis Intervention" value={selectedReport.crisisIntervention ? "Yes" : "No"} />
                      <InfoItem label="Protection Order" value={selectedReport.protectionOrder ? "Yes" : "No"} />
                      <InfoItem label="Refer to SWDO" value={selectedReport.referToSWDO ? "Yes" : "No"} />
                      <InfoItem label="Healthcare Referral" value={selectedReport.referToHealthcare ? "Yes" : "No"} />
                      <InfoItem label="Law Enforcement Referral" value={selectedReport.referToLawEnforcement ? "Yes" : "No"} />
                      <InfoItem label="Other Referral" value={selectedReport.referToOther ? "Yes" : "No"} />
                    </div>
                  </div> */}


                  {/* Incident Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Incident Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">Incident Type(s)</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedReport.incidentTypes?.map((type, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">Description</label>
                        <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg text-sm">
                          {selectedReport.incidentDescription || "No description provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedReport.attachments?.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Attachments</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedReport.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                          >
                            <FileText size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-900 flex-1 truncate">{att.fileName}</span>
                            <Download size={16} className="text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-6 bg-white sticky bottom-0">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* <button
                  onClick={() => {
                    setNewStatus(selectedReport.status);
                    setShowStatusModal(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Update Report Status
                </button> */}
                {/* <button
                  onClick={() => {
                    setNewCaseStatus(selectedReport.caseStatus || "");
                    setShowCaseStatusModal(true);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ClipboardList size={18} />
                  Update Case Status
                </button> */}
                {selectedReport.caseStatus === "For Interview" && (
                  <button
                    onClick={() => setShowReferralModal(true)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 size={18} />
                    Refer
                  </button>
                )}

                {!selectedReport.archived ? (
                  <button
                    onClick={() => setShowArchiveModal(true)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Archive size={18} />
                    Archive Report
                  </button>
                ) : (
                  <button
                    onClick={() => setShowRestoreModal(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Restore Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Update Report Status</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Choose a status</option>
                  <option>Pending</option>
                  <option>Reviewed</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add remarks (optional)..."
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Case Status Modal */}
      {showCaseStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Update Case Status</h2>
              <button
                onClick={() => setShowCaseStatusModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Case Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newCaseStatus}
                  onChange={(e) => setNewCaseStatus(e.target.value)}
                >
                  <option value="">Choose a case status</option>
                  <option>For Queuing</option>
                  <option>For Interview</option>
                  <option>For Appointment</option>
                  <option>For Referral</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add remarks (optional)..."
                  value={caseStatusRemarks}
                  onChange={(e) => setCaseStatusRemarks(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCaseStatusModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCaseStatus}
                disabled={!newCaseStatus}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Update Case Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Referral</h2>
              <button
                onClick={() => setShowReferralModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., OSA, HR, Legal..."
                  value={referralDept}
                  onChange={(e) => setReferralDept(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral Note</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter referral details..."
                  value={referralNote}
                  onChange={(e) => setReferralNote(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowReferralModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReferral}
                disabled={!referralDept}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Add Referral
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="text-red-600" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Archive Report</h2>
              <p className="text-gray-600 mb-2">
                Are you sure you want to archive this report?
              </p>
              <p className="text-sm text-gray-500">
                It will be moved to the archived section and can be restored later.
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Archive Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="text-green-600" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Restore Report</h2>
              <p className="text-gray-600 mb-2">
                Are you sure you want to restore this report?
              </p>
              <p className="text-sm text-gray-500">
                It will be moved back to active reports.
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Restore Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;