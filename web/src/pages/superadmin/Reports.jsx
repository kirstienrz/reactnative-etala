import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, Send, Share2, X, Eye, Archive, RefreshCw,
  Search, Filter, Calendar, FileText, AlertCircle, CheckCircle,
  Clock, XCircle, ChevronDown, Download, Users, UserCheck, ClipboardList, Edit,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Mail, MoreVertical,
  Brain, Activity, AlertTriangle, Shield, BarChart
} from "lucide-react";

import {
  getAllReports, getArchivedReports, getReportById,
  updateReportStatus, archiveReport, restoreReport, addReferral
} from "../../api/report";

// Add this API function for sentiment analysis
import { analyzeReportSeverity } from "../../api/ai";

const AdminReports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [reports, setReports] = useState([]);
  const [archivedReports, setArchivedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sentimentResults, setSentimentResults] = useState({});
  const [showSentimentModal, setShowSentimentModal] = useState(false);
  const [selectedReportForAnalysis, setSelectedReportForAnalysis] = useState(null);
  const [sentimentFilter, setSentimentFilter] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");
  const [readStatusFilter, setReadStatusFilter] = useState("All");
  const [caseStatusFilter, setCaseStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("latest");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
  const [referralDept, setReferralDept] = useState("");
  const [referralNote, setReferralNote] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const [newReferralType, setNewReferralType] = useState("");

  const dropdownRefs = useRef({});

  const [readReports, setReadReports] = useState(() => {
    const stored = localStorage.getItem('adminReadReports');
    return stored ? JSON.parse(stored) : [];
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Load sentiment results from localStorage
  useEffect(() => {
    const savedSentiments = localStorage.getItem('reportSentiments');
    if (savedSentiments) {
      setSentimentResults(JSON.parse(savedSentiments));
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-trigger') && !event.target.closest('.dropdown-menu')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  useEffect(() => {
    localStorage.setItem('adminReadReports', JSON.stringify(readReports));
  }, [readReports]);

  // Save sentiment results to localStorage
  useEffect(() => {
    if (Object.keys(sentimentResults).length > 0) {
      localStorage.setItem('reportSentiments', JSON.stringify(sentimentResults));
    }
  }, [sentimentResults]);

  // Update dropdown position when it opens
  useEffect(() => {
    if (openDropdown && dropdownRefs.current[openDropdown]) {
      const buttonRect = dropdownRefs.current[openDropdown].getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + 4,
        left: buttonRect.right - 192 // 192px = w-48 width
      });
    }
  }, [openDropdown]);

  const markAsRead = (reportId) => {
    if (!readReports.includes(reportId)) {
      setReadReports([...readReports, reportId]);
    }
  };

  const markAsUnread = (reportId) => {
    setReadReports(readReports.filter(id => id !== reportId));
  };

  const isReportRead = (reportId) => {
    return readReports.includes(reportId);
  };

  // Sentiment Analysis Function
  const analyzeSentiment = async (reportId, reportData) => {
    setAnalyzing(true);
    setSelectedReportForAnalysis(reportId);

    try {
      const res = await analyzeReportSeverity({
        incidentDescription: reportData.incidentDescription,
        incidentTypes: reportData.incidentTypes,
        reportId: reportId, // Send actual report ID
        additionalContext: {
          timestamp: reportData.timestamp,
          location: reportData.location || 'Not specified',
          peopleInvolved: reportData.peopleInvolved || 'Not specified'
        }
      });

      if (res.success) {
        const newSentimentResults = {
          ...sentimentResults,
          [reportId]: {
            ...res.data,
            analyzedAt: new Date().toISOString()
          }
        };
        setSentimentResults(newSentimentResults);
        showToast(`Severity analysis complete: ${res.data.severity}`, "success");
        localStorage.setItem('reportSentiments', JSON.stringify(newSentimentResults));
      } else {
        showToast(res.message || "Failed to analyze severity", "error");
      }
    } catch (error) {
      console.error('Analysis error:', error);
      showToast(`Analysis failed: ${error.response?.data?.message || error.message}`, "error");
    } finally {
      setAnalyzing(false);
      setSelectedReportForAnalysis(null);
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return <AlertTriangle size={14} className="text-red-600" />;
      case 'moderate':
        return <Activity size={14} className="text-yellow-600" />;
      case 'mild':
        return <Shield size={14} className="text-green-600" />;
      default:
        return <Brain size={14} className="text-gray-400" />;
    }
  };

  // ✅ Navigate to messaging with selected ticket
  const handleMessageUser = async (report) => {
    // Navigate to messages page with the ticket number as state
    navigate('/superadmin/messages', {
      state: {
        selectedTicketNumber: report.ticketNumber,
        reportId: report._id
      }
    });
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
        markAsRead(reportId);
      } else {
        showToast(res.message || "Failed to load report details", "error");
      }
    } catch (error) {
      showToast(`Failed to load report details: ${error.message}`, "error");
    }
  };

  const handleUpdateCaseStatus = async () => {
    if (!newCaseStatus) return;

    // Determine final status
    let finalStatus = newCaseStatus;
    if (newCaseStatus === "For Referral") {
      finalStatus = newReferralType || "For Referral"; // Internal/External or fallback
    }

    try {
      const res = await updateReportStatus(
        selectedReport._id,
        selectedReport.status, // assuming this is current status
        "", // if you need some other param, keep it
        finalStatus // send the updated status
      );

      if (res.success) {
        showToast("Case status updated successfully");
        setShowCaseStatusModal(false);
        setNewCaseStatus("");
        setNewReferralType(""); // reset referral type
        fetchReports();
      } else {
        showToast(res.message || "Failed to update case status", "error");
      }
    } catch (error) {
      console.error("Update case status error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      showToast(`Failed to update case status: ${errorMessage}`, "error");
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
    setReadStatusFilter("All");
    setCaseStatusFilter("All");
    setCategoryFilter("All");
    setDateFrom("");
    setDateTo("");
    setSortOrder("latest");
    setSentimentFilter("All");
    setCurrentPage(1);
  };

  const getCaseStatusColor = (caseStatus) => {
    const colors = {
      "For Queuing": "bg-orange-100 text-orange-800",
      "For Interview": "bg-cyan-100 text-cyan-800",
      "For Referral": "bg-pink-100 text-pink-800",
      "Case Closed": "bg-gray-100 text-gray-800"
    };
    return colors[caseStatus] || "bg-gray-100 text-gray-800";
  };

  const getCaseStatusIcon = (caseStatus) => {
    const icons = {
      "For Queuing": <ClipboardList size={14} />,
      "For Interview": <Users size={14} />,
      "For Referral": <Share2 size={14} />,
      "Case Closed": <XCircle size={14} />
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

    const matchesReadStatus = readStatusFilter === "All" ||
      (readStatusFilter === "Read" && isReportRead(r._id)) ||
      (readStatusFilter === "Unread" && !isReportRead(r._id));

    const matchesCaseStatus = caseStatusFilter === "All" || r.caseStatus === caseStatusFilter;
    const matchesCategory = categoryFilter === "All" || r.incidentTypes?.includes(categoryFilter);

    const matchesSentiment = sentimentFilter === "All" ||
      (sentimentResults[r._id]?.severity?.toLowerCase() === sentimentFilter.toLowerCase());

    const reportDate = new Date(r.submittedAt);
    const matchesDateFrom = !dateFrom || reportDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || reportDate <= new Date(dateTo + "T23:59:59");

    return matchesSearch && matchesReadStatus && matchesCaseStatus && matchesCategory && matchesSentiment && matchesDateFrom && matchesDateTo;
  }).sort((a, b) => {
    const dateA = new Date(a.submittedAt);
    const dateB = new Date(b.submittedAt);
    return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const activeFilterCount = [
    readStatusFilter !== "All",
    caseStatusFilter !== "All",
    categoryFilter !== "All",
    dateFrom,
    dateTo,
    sortOrder !== "latest",
    sentimentFilter !== "All"
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

  // Get severity distribution for stats
  const getSeverityStats = () => {
    const stats = { severe: 0, moderate: 0, mild: 0, unanalyzed: 0 };
    reports.forEach(report => {
      const sentiment = sentimentResults[report._id];
      if (sentiment?.severity) {
        const severity = sentiment.severity.toLowerCase();
        if (stats.hasOwnProperty(severity)) {
          stats[severity]++;
        }
      } else {
        stats.unanalyzed++;
      }
    });
    return stats;
  };

  const severityStats = getSeverityStats();

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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Management</h1>
            <p className="text-gray-600">Monitor and manage incident reports with AI-powered severity analysis</p>
          </div>
          <button
            onClick={() => setShowSentimentModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
          >
            <Brain size={20} />
            Severity Analysis
            <BarChart size={20} />
          </button>
        </div>

        {/* Severity Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Severe Reports</p>
                <p className="text-2xl font-bold text-red-600">{severityStats.severe}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${(severityStats.severe / reports.length) * 100 || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Moderate Reports</p>
                <p className="text-2xl font-bold text-yellow-600">{severityStats.moderate}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Activity className="text-yellow-600" size={24} />
              </div>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${(severityStats.moderate / reports.length) * 100 || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mild Reports</p>
                <p className="text-2xl font-bold text-green-600">{severityStats.mild}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Shield className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(severityStats.mild / reports.length) * 100 || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unanalyzed</p>
                <p className="text-2xl font-bold text-gray-600">{severityStats.unanalyzed}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-full">
                <Brain className="text-gray-600" size={24} />
              </div>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-500 rounded-full"
                style={{ width: `${(severityStats.unanalyzed / reports.length) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By Date</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Read Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={readStatusFilter}
                  onChange={(e) => {
                    setReadStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option>All</option>
                  <option>Unread</option>
                  <option>Read</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Case Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={caseStatusFilter}
                  onChange={(e) => {
                    setCaseStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option>All</option>
                  <option>For Queuing</option>
                  <option>For Interview</option>
                  <option>Internal</option>
                  <option>External</option>
                  <option>Case Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={sentimentFilter}
                  onChange={(e) => {
                    setSentimentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option>All</option>
                  <option>Severe</option>
                  <option>Moderate</option>
                  <option>Mild</option>
                  <option>Unanalyzed</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
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
                onClick={() => {
                  setActiveTab("active");
                  setCurrentPage(1);
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === "active"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
              >
                Active Reports ({reports.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("archived");
                  setCurrentPage(1);
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === "archived"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
              >
                Archived ({archivedReports.length})
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredReports.length)}</span> of{" "}
              <span className="font-semibold">{filteredReports.length}</span> reports
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
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
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
            {paginatedReports.map((report) => {
              const sentiment = sentimentResults[report._id];
              return (
                <tr
                  key={report._id}
                  className={`hover:bg-gray-50 transition-colors ${!isReportRead(report._id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!isReportRead(report._id) && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium font-mono ${!isReportRead(report._id) ? 'text-blue-900 font-bold' : 'text-gray-900'}`}>
                      {report.ticketNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sentiment ? (
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(sentiment.severity)}`}>
                          {getSeverityIcon(sentiment.severity)}
                          {sentiment.severity}
                          <span className="text-xs opacity-75">({Math.round(sentiment.confidence * 100)}%)</span>
                        </span>
                        {sentiment.keywords && sentiment.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sentiment.keywords.slice(0, 2).map((keyword, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {keyword}
                              </span>
                            ))}
                            {sentiment.keywords.length > 2 && (
                              <span className="text-xs text-gray-400">+{sentiment.keywords.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedReportForAnalysis(report);
                          analyzeSentiment(report._id, {
                            incidentDescription: report.incidentDescription,
                            incidentTypes: report.incidentTypes,
                            timestamp: report.submittedAt
                          });
                        }}
                        disabled={analyzing}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Brain size={12} />
                        {analyzing && selectedReportForAnalysis?._id === report._id ? "Analyzing..." : "Analyze"}
                      </button>
                    )}
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
                    {/* INLINE ACTIONS - Lahat ng actions ay DIRECT NA MAKIKITA */}
                    <div className="flex items-center gap-1">
                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDetails(report._id)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {/* Message Button */}
                      <button
                        onClick={() => handleMessageUser(report)}
                        className="p-1.5 hover:bg-green-50 text-green-600 rounded transition-colors"
                        title="Message User"
                      >
                        <MessageSquare size={16} />
                      </button>
                      
                      {/* Mark as Read/Unread Button */}
                      {isReportRead(report._id) ? (
                        <button
                          onClick={() => markAsUnread(report._id)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded transition-colors"
                          title="Mark as Unread"
                        >
                          <Mail size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsRead(report._id)}
                          className="p-1.5 hover:bg-green-50 text-green-600 rounded transition-colors"
                          title="Mark as Read"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      {/* Edit Case Status Button */}
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setNewCaseStatus(report.caseStatus || "");
                          setShowCaseStatusModal(true);
                        }}
                        className="p-1.5 hover:bg-purple-50 text-purple-600 rounded transition-colors"
                        title="Edit Case Status"
                      >
                        <Edit size={16} />
                      </button>
                      
                      {/* Archive/Restore Button */}
                      {activeTab === "active" ? (
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowArchiveModal(true);
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                          title="Archive Report"
                        >
                          <Archive size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowRestoreModal(true);
                          }}
                          className="p-1.5 hover:bg-green-50 text-green-600 rounded transition-colors"
                          title="Restore Report"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                      
                      {/* Sentiment Analysis Button (if not analyzed) */}
                      {!sentimentResults[report._id] && (
                        <button
                          onClick={() => {
                            setSelectedReportForAnalysis(report);
                            analyzeSentiment(report._id, {
                              incidentDescription: report.incidentDescription,
                              incidentTypes: report.incidentTypes,
                              timestamp: report.submittedAt
                            });
                          }}
                          disabled={analyzing}
                          className="p-1.5 hover:bg-purple-50 text-purple-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Analyze Severity"
                        >
                          <Brain size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Items per page:</label>
                    <select
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="First page"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, idx) => {
                        const page = idx + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2 text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Last page"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sentiment Analysis Modal */}
      {showSentimentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="text-purple-600" size={24} />
                  AI Severity Analysis Dashboard
                </h2>
                <p className="text-sm text-gray-600 mt-1">Analyze report severity using OpenAI</p>
              </div>
              <button
                onClick={() => setShowSentimentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart size={20} className="text-purple-600" />
                    Analysis Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{severityStats.severe}</div>
                      <div className="text-sm text-gray-600">Severe</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{severityStats.moderate}</div>
                      <div className="text-sm text-gray-600">Moderate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{severityStats.mild}</div>
                      <div className="text-sm text-gray-600">Mild</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-600">{severityStats.unanalyzed}</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">AI analyzes incident descriptions</p>
                        <p className="text-sm text-gray-600">Uses OpenAI to understand context and severity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Classifies severity level</p>
                        <p className="text-sm text-gray-600">Categorizes as Severe, Moderate, or Mild</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Extracts key insights</p>
                        <p className="text-sm text-gray-600">Identifies keywords and provides confidence scores</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Controls */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        // Analyze all unanalyzed reports
                        const unanalyzed = reports.filter(r => !sentimentResults[r._id]);
                        if (unanalyzed.length > 0) {
                          showToast(`Analyzing ${unanalyzed.length} reports...`, "success");
                          unanalyzed.slice(0, 5).forEach(report => {
                            analyzeSentiment(report._id, {
                              incidentDescription: report.incidentDescription,
                              incidentTypes: report.incidentTypes,
                              timestamp: report.submittedAt
                            });
                          });
                        } else {
                          showToast("All reports have been analyzed", "success");
                        }
                      }}
                      disabled={analyzing || reports.filter(r => !sentimentResults[r._id]).length === 0}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Brain size={20} />
                      {analyzing ? "Analyzing..." : "Analyze All Pending"}
                      <span className="bg-white/20 px-2 py-1 rounded text-xs">
                        {reports.filter(r => !sentimentResults[r._id]).length}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setSentimentResults({});
                        localStorage.removeItem('reportSentiments');
                        showToast("Analysis results cleared", "success");
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <RefreshCw size={20} />
                      Clear All Analysis
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Severity Legend</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${getSeverityColor('Severe')}`}>
                      <AlertTriangle size={24} className="text-red-600" />
                      <div>
                        <p className="font-semibold">Severe</p>
                        <p className="text-sm opacity-80">Requires immediate attention</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${getSeverityColor('Moderate')}`}>
                      <Activity size={24} className="text-yellow-600" />
                      <div>
                        <p className="font-semibold">Moderate</p>
                        <p className="text-sm opacity-80">Needs prompt follow-up</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${getSeverityColor('Mild')}`}>
                      <Shield size={24} className="text-green-600" />
                      <div>
                        <p className="font-semibold">Mild</p>
                        <p className="text-sm opacity-80">Standard procedure required</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-white">
              <p className="text-sm text-gray-600 text-center">
                Powered by OpenAI • Analysis helps prioritize reports based on severity
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Menu Portal - Fixed Position Overlay */}
      {openDropdown && (
        <div
          className="dropdown-menu fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 1000
          }}
        >
          <button
            onClick={() => {
              handleViewDetails(openDropdown);
              setOpenDropdown(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye size={16} />
            View Details
          </button>

          <button
            onClick={() => {
              const report = paginatedReports.find(r => r._id === openDropdown);
              if (report) handleMessageUser(report);
              setOpenDropdown(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <MessageSquare size={16} />
            Message User
          </button>

          {!sentimentResults[openDropdown] && (
            <button
              onClick={() => {
                const report = paginatedReports.find(r => r._id === openDropdown);
                if (report) {
                  analyzeSentiment(report._id, {
                    incidentDescription: report.incidentDescription,
                    incidentTypes: report.incidentTypes,
                    timestamp: report.submittedAt
                  });
                }
                setOpenDropdown(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-2"
              disabled={analyzing}
            >
              <Brain size={16} />
              {analyzing && selectedReportForAnalysis?._id === openDropdown ? "Analyzing..." : "Analyze Severity"}
            </button>
          )}

          {isReportRead(openDropdown) ? (
            <button
              onClick={() => {
                markAsUnread(openDropdown);
                showToast("Marked as unread", "success");
                setOpenDropdown(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Mail size={16} />
              Mark as Unread
            </button>
          ) : (
            <button
              onClick={() => {
                markAsRead(openDropdown);
                showToast("Marked as read", "success");
                setOpenDropdown(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Mark as Read
            </button>
          )}

          <button
            onClick={() => {
              const report = paginatedReports.find(r => r._id === openDropdown);
              if (report) {
                setSelectedReport(report);
                setNewCaseStatus(report.caseStatus || "");
                setShowCaseStatusModal(true);
              }
              setOpenDropdown(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Case Status
          </button>

          <div className="border-t border-gray-200 my-1"></div>

          {activeTab === "active" ? (
            <button
              onClick={() => {
                const report = paginatedReports.find(r => r._id === openDropdown);
                if (report) {
                  setSelectedReport(report);
                  setShowArchiveModal(true);
                }
                setOpenDropdown(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Archive size={16} />
              Archive
            </button>
          ) : (
            <button
              onClick={() => {
                const report = paginatedReports.find(r => r._id === openDropdown);
                if (report) {
                  setSelectedReport(report);
                  setShowRestoreModal(true);
                }
                setOpenDropdown(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Restore
            </button>
          )}
        </div>
      )}

      {/* Enhanced Details Modal with Sentiment Analysis */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedReport.ticketNumber}</p>
                {sentimentResults[selectedReport._id] && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(sentimentResults[selectedReport._id].severity)}`}>
                      {getSeverityIcon(sentimentResults[selectedReport._id].severity)}
                      AI Analysis: {sentimentResults[selectedReport._id].severity}
                      ({Math.round(sentimentResults[selectedReport._id].confidence * 100)}% confidence)
                    </span>
                  </div>
                )}
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
                {/* Sentiment Analysis Section */}
                {!sentimentResults[selectedReport._id] ? (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Brain size={20} className="text-purple-600" />
                          AI Severity Analysis
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Analyze this report's severity level using OpenAI
                        </p>
                      </div>
                      <button
                        onClick={() => analyzeSentiment(selectedReport._id, {
                          incidentDescription: selectedReport.incidentDescription,
                          incidentTypes: selectedReport.incidentTypes,
                          timestamp: selectedReport.submittedAt
                        })}
                        disabled={analyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                      >
                        <Brain size={16} />
                        {analyzing ? "Analyzing..." : "Analyze Severity"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`border rounded-lg p-4 mb-6 ${getSeverityColor(sentimentResults[selectedReport._id].severity)}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          {getSeverityIcon(sentimentResults[selectedReport._id].severity)}
                          AI Analysis Results
                        </h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Severity:</span> {sentimentResults[selectedReport._id].severity}
                            <span className="ml-2 text-xs opacity-75">
                              ({Math.round(sentimentResults[selectedReport._id].confidence * 100)}% confidence)
                            </span>
                          </p>
                          {sentimentResults[selectedReport._id].explanation && (
                            <p className="text-sm">
                              <span className="font-medium">Analysis:</span> {sentimentResults[selectedReport._id].explanation}
                            </p>
                          )}
                          {sentimentResults[selectedReport._id].keywords && sentimentResults[selectedReport._id].keywords.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-1">Key Indicators:</p>
                              <div className="flex flex-wrap gap-1">
                                {sentimentResults[selectedReport._id].keywords.map((keyword, idx) => (
                                  <span key={idx} className="text-xs bg-white/50 px-2 py-1 rounded">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Analyzed on {new Date(sentimentResults[selectedReport._id].analyzedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newResults = { ...sentimentResults };
                          delete newResults[selectedReport._id];
                          setSentimentResults(newResults);
                          localStorage.setItem('reportSentiments', JSON.stringify(newResults));
                          showToast("Analysis removed", "success");
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="Remove analysis"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {selectedReport.timeline?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
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

                {/* Rest of the details modal content remains the same */}
                <div className="space-y-6">
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
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
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
                          <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">Department</label>
                            <p className="text-gray-900 font-medium">
                              {selectedReport.reporterDepartment || "Not specified"}
                            </p>
                          </div>
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
                        <div className="col-span-2 mt-3">
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                            onClick={() => handleMessageUser(selectedReport)}
                          >
                            <MessageSquare size={16} />
                            Message User
                          </button>
                        </div>
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
                {!sentimentResults[selectedReport._id] && (
                  <button
                    onClick={() => analyzeSentiment(selectedReport._id, {
                      incidentDescription: selectedReport.incidentDescription,
                      incidentTypes: selectedReport.incidentTypes,
                      timestamp: selectedReport.submittedAt
                    })}
                    disabled={analyzing}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Brain size={18} />
                    {analyzing ? "Analyzing..." : "AI Analyze Severity"}
                  </button>
                )}

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

      {/* All other modals remain unchanged */}
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
                  <option>For Referral</option>
                  <option>Case Closed</option>
                </select>
                {/* Secondary dropdown for Internal/External if For Referral */}
                {newCaseStatus === "For Referral" && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Referral Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newReferralType}
                      onChange={(e) => setNewReferralType(e.target.value)}
                    >
                      <option value="">Select type</option>
                      <option>Internal</option>
                      <option>External</option>
                    </select>
                  </div>
                )}
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
                disabled={!newCaseStatus || (newCaseStatus === "For Referral" && !newReferralType)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Update Case Status
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