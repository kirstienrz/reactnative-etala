import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Updated icons for severity analysis
import {
  MessageSquare, Send, Share2, X, Eye, Archive, RefreshCw,
  Search, Filter, Calendar, FileText, AlertCircle, CheckCircle,
  Clock, XCircle, ChevronDown, Download, Users, UserCheck, ClipboardList, Edit,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Mail, MoreVertical,
  Brain, BarChart2, TrendingUp, AlertTriangle, Activity, Shield
} from "lucide-react";
import {
  getAllReports, getArchivedReports, getReportById,
  updateReportStatus, archiveReport, restoreReport, addReferral,
  analyzeReportSeverity,
  batchAnalyzeSeverity, batchReanalyzeStaleReports, reanalyzeAllReports
} from "../../api/report";

const AdminReports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [reports, setReports] = useState([]);
  const [archivedReports, setArchivedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [readStatusFilter, setReadStatusFilter] = useState("All");
  const [caseStatusFilter, setCaseStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All"); // Changed from sentimentFilter
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
  const [showSeverityAnalysis, setShowSeverityAnalysis] = useState(false); // Changed from showSentimentAnalysis

  const [newStatus, setNewStatus] = useState("");
  const [newCaseStatus, setNewCaseStatus] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [referralDept, setReferralDept] = useState("");
  const [referralNote, setReferralNote] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const dropdownRefs = useRef({});

  const [readReports, setReadReports] = useState(() => {
    const stored = localStorage.getItem('adminReadReports');
    return stored ? JSON.parse(stored) : [];
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

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

  // ✅ Navigate to messaging with selected ticket
  const handleMessageUser = async (report) => {
    navigate('/superadmin/messages', {
      state: {
        selectedTicketNumber: report.ticketNumber,
        reportId: report._id
      }
    });
  };

  // Analyze severity for a report
  const handleAnalyzeSeverity = async (reportId) => {
    setAnalyzing(prev => ({ ...prev, [reportId]: true }));
    try {
      const res = await analyzeReportSeverity(reportId);
      if (res.success) {
        showToast("Severity analysis completed!", "success");
        fetchReports();
        if (selectedReport && selectedReport._id === reportId) {
          const updated = await getReportById(reportId);
          if (updated.success) {
            setSelectedReport(updated.data);
          }
        }
      } else {
        showToast(res.message || "Failed to analyze severity", "error");
      }
    } catch (error) {
      console.error("Severity analysis error:", error);
      showToast(`Failed to analyze severity: ${error.message}`, "error");
    } finally {
      setAnalyzing(prev => ({ ...prev, [reportId]: false }));
    }
  };

  // Batch severity analysis
  const handleBatchSeverityAnalysis = async () => {
    const reportsToAnalyze = activeTab === "active" ? reports : archivedReports;
    if (reportsToAnalyze.length === 0) {
      showToast("No reports to analyze", "error");
      return;
    }

    setAnalyzing(prev => ({ ...prev, 'batch': true }));
    let successCount = 0;
    let errorCount = 0;

    for (const report of reportsToAnalyze) {
      try {
        const res = await analyzeReportSeverity(report._id);
        if (res.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setAnalyzing(prev => ({ ...prev, 'batch': false }));
    showToast(`Analysis complete: ${successCount} successful, ${errorCount} failed`, "success");
    fetchReports();
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
    try {
      const res = await updateReportStatus(
        selectedReport._id,
        selectedReport.status,
        "",
        newCaseStatus
      );
      if (res.success) {
        showToast("Case status updated successfully");
        setShowCaseStatusModal(false);
        setNewCaseStatus("");
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


  const handleReanalyzeAllReports = async () => {
    // Get ALL reports (active + archived)
    const allReports = [...reports, ...archivedReports];

    // Get reports that HAVE severity analysis
    const analyzedReports = allReports.filter(r => r.severityAnalysis);

    if (analyzedReports.length === 0) {
      showToast("No analyzed reports found", "error");
      return;
    }

    const shouldProceed = window.confirm(
      `RE-ANALYZE ALL REPORTS?\n\n` +
      `This will re-analyze ${analyzedReports.length} reports with existing severity analysis.\n` +
      `This may take ${Math.ceil(analyzedReports.length / 10)} minutes.\n\n` +
      `⚠️  THIS WILL REFRESH ALL SEVERITY RATINGS!`
    );

    if (!shouldProceed) return;

    setAnalyzing(prev => ({ ...prev, 'reanalyzeAll': true }));

    try {
      // Option A: Use batch function with ALL report IDs
      const reportIds = analyzedReports.map(r => r._id);
      const res = await batchAnalyzeSeverity(reportIds);

      if (res.success) {
        const { successful, failed } = res.data || {};

        showToast(
          `✅ Re-analyzed ${successful || 0} reports\n` +
          `${failed ? `❌ ${failed} failed` : ''}`,
          successful > 0 ? "success" : "warning"
        );

        // Refresh data
        await fetchReports();

        // Show changes summary
        if (res.data?.details) {
          const severityChanges = res.data.details.filter(d =>
            d.oldSeverity && d.newSeverity && d.oldSeverity !== d.newSeverity
          );

          if (severityChanges.length > 0) {
            setTimeout(() => {
              showToast(
                `🔄 ${severityChanges.length} reports changed severity`,
                "info"
              );

              // Optional: Show breakdown
              const changesBySeverity = {};
              severityChanges.forEach(change => {
                const key = `${change.oldSeverity} → ${change.newSeverity}`;
                changesBySeverity[key] = (changesBySeverity[key] || 0) + 1;
              });

              console.log("Severity changes:", changesBySeverity);
            }, 1000);
          }
        }
      } else {
        showToast(res.message || "Failed to re-analyze", "error");
      }

    } catch (error) {
      console.error("Re-analyze all error:", error);
      showToast(`Failed to re-analyze: ${error.message}`, "error");
    } finally {
      setAnalyzing(prev => ({ ...prev, 'reanalyzeAll': false }));
    }
  };


  // Add this function with your other handle functions
  const handleReanalyzeSeverity = async (reportId) => {
    setAnalyzing(prev => ({ ...prev, [`reanalyze-${reportId}`]: true }));
    try {
      // Add forceRefresh parameter
      const res = await analyzeReportSeverity(reportId, true); // true = force refresh
      if (res.success) {
        showToast("Report re-analyzed successfully!", "success");
        fetchReports();
        // Update selected report if open
        if (selectedReport && selectedReport._id === reportId) {
          const updated = await getReportById(reportId);
          if (updated.success) {
            setSelectedReport(updated.data);
          }
        }
      } else {
        showToast(res.message || "Failed to re-analyze", "error");
      }
    } catch (error) {
      console.error("Re-analyze error:", error);
      showToast(`Failed to re-analyze: ${error.message}`, "error");
    } finally {
      setAnalyzing(prev => ({ ...prev, [`reanalyze-${reportId}`]: false }));
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
    setSeverityFilter("All"); // Changed from sentimentFilter
    setDateFrom("");
    setDateTo("");
    setSortOrder("latest");
    setCurrentPage(1);
  };

  const getCaseStatusColor = (caseStatus) => {
    const colors = {
      "For Queuing": "bg-orange-100 text-orange-800",
      "For Interview": "bg-cyan-100 text-cyan-800",
      "For Appointment": "bg-indigo-100 text-indigo-800",
      "For Referral": "bg-pink-100 text-pink-800",
      "Case Closed": "bg-gray-100 text-gray-800"
    };
    return colors[caseStatus] || "bg-gray-100 text-gray-800";
  };

  const getCaseStatusIcon = (caseStatus) => {
    const icons = {
      "For Queuing": <ClipboardList size={14} />,
      "For Interview": <Users size={14} />,
      "For Appointment": <Calendar size={14} />,
      "For Referral": <Share2 size={14} />,
      "Case Closed": <XCircle size={14} />
    };
    return icons[caseStatus] || <AlertCircle size={14} />;
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      "SEVERE": "bg-red-100 text-red-800 border-red-200",
      "MODERATE": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "MILD": "bg-green-100 text-green-800 border-green-200"
    };
    return colors[severity] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    const icons = {
      "SEVERE": <AlertTriangle size={14} className="text-red-600" />,
      "MODERATE": <AlertCircle size={14} className="text-yellow-600" />,
      "MILD": <CheckCircle size={14} className="text-green-600" />
    };
    return icons[severity] || <Activity size={14} className="text-gray-600" />;
  };

  // Get severity label
  const getSeverityLabel = (severity) => {
    const labels = {
      "SEVERE": "Severe",
      "MODERATE": "Moderate",
      "MILD": "Mild"
    };
    return labels[severity] || "Not Analyzed";
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

    // Severity filter
    const matchesSeverity = severityFilter === "All" ||
      (severityFilter === "Not Analyzed" && !r.severityAnalysis) ||
      (r.severityAnalysis?.severity === severityFilter);

    const reportDate = new Date(r.submittedAt);
    const matchesDateFrom = !dateFrom || reportDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || reportDate <= new Date(dateTo + "T23:59:59");

    return matchesSearch && matchesReadStatus && matchesCaseStatus &&
      matchesCategory && matchesSeverity && matchesDateFrom && matchesDateTo;
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
    severityFilter !== "All", // Changed from sentimentFilter
    dateFrom,
    dateTo,
    sortOrder !== "latest"
  ].filter(Boolean).length;

  // Add this function with your other handle functions
  const handleBatchReanalyzeStale = async () => {
    // Get reports based on active tab
    const reportsToReanalyze = activeTab === "active" ? reports : archivedReports;

    // Get only analyzed reports (those with severityAnalysis)
    const analyzedReports = reportsToReanalyze.filter(r => r.severityAnalysis);

    if (analyzedReports.length === 0) {
      showToast("No analyzed reports to re-analyze", "error");
      return;
    }

    // Optional: Show confirmation with stats
    const shouldProceed = window.confirm(
      `Re-analyze ${analyzedReports.length} reports?\n\n` +
      `This will update severity analysis for reports analyzed more than 7 days ago.\n` +
      `Note: This may take a few minutes and will refresh your data.`
    );

    if (!shouldProceed) return;

    setAnalyzing(prev => ({ ...prev, 'batchReanalyze': true }));

    try {
      // Option 1: Use the new dedicated stale reports function (RECOMMENDED)
      const res = await batchReanalyzeStaleReports(7, 50);

      // Option 2: Or use the existing batchAnalyzeSeverity with all IDs
      // const reportIds = analyzedReports.map(r => r._id);
      // const res = await batchAnalyzeSeverity(reportIds);

      if (res.success) {
        const { successful, failed } = res.data || res.summary || {};

        // Show detailed toast
        showToast(
          `✅ Re-analyzed ${successful || 0} reports\n` +
          `${failed ? `❌ ${failed} failed` : ''}`,
          successful > 0 ? "success" : "warning"
        );

        // Refresh data
        await fetchReports();

        // Show detailed results if available
        if (res.data?.details) {
          const severityChanges = res.data.details.filter(d => d.severityChanged);
          if (severityChanges.length > 0) {
            setTimeout(() => {
              showToast(
                `${severityChanges.length} reports had severity changes`,
                "info"
              );
            }, 1000);
          }
        }
      } else {
        showToast(res.message || "Failed to re-analyze", "error");
      }

    } catch (error) {
      console.error("Batch re-analyze error:", error);
      showToast(`Failed to re-analyze: ${error.message}`, "error");
    } finally {
      setAnalyzing(prev => ({ ...prev, 'batchReanalyze': false }));
    }
  };



  // OR create a dedicated API function:
  // export const batchReanalyzeStaleReports = async (days = 7, limit = 50) => {
  //   try {
  //     const res = await API.post('/reports/admin/batch-reanalyze-stale', { days, limit });
  //     return res.data;
  //   } catch (err) {
  //     console.error("Batch Reanalyze API Error:", err);
  //     return { success: false, message: err.response?.data?.message || "Failed to re-analyze stale reports" };
  //   }
  // };

  // Calculate severity statistics
  const severityStats = () => {
    const allReports = activeTab === "active" ? reports : archivedReports;
    const stats = {
      total: allReports.length,
      analyzed: allReports.filter(r => r.severityAnalysis).length,
      SEVERE: allReports.filter(r => r.severityAnalysis?.severity === "SEVERE").length,
      MODERATE: allReports.filter(r => r.severityAnalysis?.severity === "MODERATE").length,
      MILD: allReports.filter(r => r.severityAnalysis?.severity === "MILD").length
    };

    stats.SEVEREPercent = stats.analyzed > 0 ? (stats.SEVERE / stats.analyzed * 100).toFixed(1) : 0;
    stats.MODERATEPercent = stats.analyzed > 0 ? (stats.MODERATE / stats.analyzed * 100).toFixed(1) : 0;
    stats.MILDPercent = stats.analyzed > 0 ? (stats.MILD / stats.analyzed * 100).toFixed(1) : 0;

    return stats;
  };

  const stats = severityStats();

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Management</h1>
            <p className="text-gray-600">Monitor and manage incident reports with severity analysis</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* RE-ANALYZE STALE REPORTS BUTTON */}
            <button
              onClick={handleBatchReanalyzeStale}
              disabled={analyzing['batchReanalyze'] || stats.analyzed === 0}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {analyzing['batchReanalyze'] ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Re-analyze Stale Reports
            </button>
            {/* RE-ANALYZE ALL BUTTON */}
            <button
              onClick={handleReanalyzeAllReports}
              disabled={analyzing['reanalyzeAll'] || stats.analyzed === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {analyzing['reanalyzeAll'] ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )} 
              {/* re analyze button */}
              Analyze All Reports
            </button>
          </div>
        </div>
      </div>


      {/* Severity Analysis Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={20} className="text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Severity Analysis Summary</h2>
          </div>
          <div className="text-sm text-gray-600">
            {stats.analyzed} of {stats.total} reports analyzed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* SEVERE Card */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">SEVERE</p>
                <p className="text-2xl font-bold text-red-900">{stats.SEVERE}</p>
                <p className="text-xs text-red-700 mt-1">{stats.SEVEREPercent}% of analyzed</p>
              </div>
              <AlertTriangle size={24} className="text-red-500" />
            </div>
          </div>

          {/* MODERATE Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">MODERATE</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.MODERATE}</p>
                <p className="text-xs text-yellow-700 mt-1">{stats.MODERATEPercent}% of analyzed</p>
              </div>
              <AlertCircle size={24} className="text-yellow-500" />
            </div>
          </div>

          {/* MILD Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">MILD</p>
                <p className="text-2xl font-bold text-green-900">{stats.MILD}</p>
                <p className="text-xs text-green-700 mt-1">{stats.MILDPercent}% of analyzed</p>
              </div>
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </div>

          {/* Pending Analysis Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Analysis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total - stats.analyzed}</p>
                <p className="text-xs text-gray-700 mt-1">Not analyzed yet</p>
              </div>
              <Clock size={24} className="text-gray-500" />
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
                  <option>For Appointment</option>
                  <option>For Referral</option>
                  <option>Case Closed</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={severityFilter}
                  onChange={(e) => {
                    setSeverityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option>All</option>
                  <option>Not Analyzed</option>
                  <option value="SEVERE">SEVERE</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="MILD">MILD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
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
                        Status
                      </th>
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
                    {paginatedReports.map((report) => (
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
                        {/* Severity Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {report.severityAnalysis ? (
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severityAnalysis.severity)}`}>
                                {getSeverityIcon(report.severityAnalysis.severity)}
                                {getSeverityLabel(report.severityAnalysis.severity)}
                                {report.severityAnalysis.confidence && (
                                  <span className="text-xs opacity-75 ml-1">
                                    ({Math.round(report.severityAnalysis.confidence * 100)}%)
                                  </span>
                                )}
                                {/* Spam indicator */}
                                {report.severityAnalysis.is_spam && (
                                  <span className="ml-1 px-1 bg-gray-300 text-gray-700 text-xs rounded">
                                    SPAM
                                  </span>
                                )}
                              </span>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setShowSeverityAnalysis(true);
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  View Analysis
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAnalyzeSeverity(report._id)}
                              disabled={analyzing[report._id]}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {analyzing[report._id] ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <Shield size={12} />
                              )}
                              Analyze Severity
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
                          <div className="relative">
                            <button
                              ref={(el) => (dropdownRefs.current[report._id] = el)}
                              onClick={() => setOpenDropdown(openDropdown === report._id ? null : report._id)}
                              className="dropdown-trigger flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              Actions
                              <ChevronDown size={16} />
                            </button>

                            {openDropdown === report._id && (
                              <div
                                className="dropdown-menu absolute z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                                style={{
                                  top: dropdownPosition.top,
                                  left: dropdownPosition.left
                                }}
                              >
                                <button
                                  onClick={() => {
                                    handleViewDetails(report._id);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye size={16} />
                                  View Details
                                </button>

                                <button
                                  onClick={() => {
                                    handleMessageUser(report);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <MessageSquare size={16} />
                                  Message User
                                </button>

                                {!report.severityAnalysis && (
                                  <button
                                    onClick={() => {
                                      handleAnalyzeSeverity(report._id);
                                      setOpenDropdown(null);
                                    }}
                                    disabled={analyzing[report._id]}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                  >
                                    {analyzing[report._id] ? (
                                      <RefreshCw size={16} className="animate-spin" />
                                    ) : (
                                      <Shield size={16} />
                                    )}
                                    Analyze Severity
                                  </button>
                                )}

                                <div className="border-t border-gray-200 my-1"></div>

                                <button
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setShowCaseStatusModal(true);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit size={16} />
                                  Update Case Status
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setShowReferralModal(true);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Share2 size={16} />
                                  Add Referral
                                </button>

                                <div className="border-t border-gray-200 my-1"></div>

                                {activeTab === "active" ? (
                                  <button
                                    onClick={() => {
                                      setSelectedReport(report);
                                      setShowArchiveModal(true);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Archive size={16} />
                                    Archive Report
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedReport(report);
                                      setShowRestoreModal(true);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                  >
                                    <RefreshCw size={16} />
                                    Restore Report
                                  </button>
                                )}

                                <div className="border-t border-gray-200 my-1"></div>

                                {isReportRead(report._id) ? (
                                  <button
                                    onClick={() => {
                                      markAsUnread(report._id);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Eye size={16} />
                                    Mark as Unread
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      markAsRead(report._id);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <CheckCircle size={16} />
                                    Mark as Read
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Show</span>
                    <select
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
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
                    </select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsLeft size={20} />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2">...</span>
                        <button
                          onClick={() => goToPage(totalPages)}
                          className={`w-10 h-10 rounded-lg font-medium border border-gray-300 hover:bg-gray-100`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsRight size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Report #{selectedReport.ticketNumber}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Submitted on {new Date(selectedReport.submittedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{selectedReport.isAnonymous ? "Anonymous Report" : "Reported by " + (selectedReport.createdBy?.tupId || "Unknown User")}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Incident Information</h3>
                  <div className="space-y-3">
                    <InfoItem label="Incident Types" value={selectedReport.incidentTypes?.join(", ")} />
                    <InfoItem label="Date of Incident" value={selectedReport.incidentDate && new Date(selectedReport.incidentDate).toLocaleDateString()} />
                    <InfoItem label="Time of Incident" value={selectedReport.incidentTime} />
                    <InfoItem label="Location" value={selectedReport.incidentLocation} />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Reporter Information</h3>
                  <div className="space-y-3">
                    <InfoItem label="TUP ID" value={selectedReport.isAnonymous ? "Anonymous" : selectedReport.createdBy?.tupId} />
                    <InfoItem label="Email" value={selectedReport.isAnonymous ? "Hidden" : selectedReport.createdBy?.email} />
                    <InfoItem label="College" value={selectedReport.isAnonymous ? "Hidden" : selectedReport.createdBy?.college} />
                    <InfoItem label="Department" value={selectedReport.isAnonymous ? "Hidden" : selectedReport.createdBy?.department} />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Incident Description</h3>
                <p className="text-gray-900 whitespace-pre-line">{selectedReport.incidentDescription}</p>
              </div>

              {selectedReport.evidenceFiles && selectedReport.evidenceFiles.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Evidence Files</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedReport.evidenceFiles.map((file, index) => (
                      <div key={index} className="border border-gray-300 rounded-lg p-3">
                        <FileText size={24} className="text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                        <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Severity Analysis Section in Modal */}
              {selectedReport.severityAnalysis && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield size={20} className="text-red-600" />
                      <h3 className="font-semibold text-gray-900">Severity Analysis</h3>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedReport.severityAnalysis.severity)}`}>
                      {getSeverityIcon(selectedReport.severityAnalysis.severity)}
                      {getSeverityLabel(selectedReport.severityAnalysis.severity)}
                      {selectedReport.severityAnalysis.confidence && (
                        <span className="text-xs opacity-75 ml-1">
                          ({Math.round(selectedReport.severityAnalysis.confidence * 100)}% confidence)
                        </span>
                      )}
                    </span>
                  </div>

                  {selectedReport.severityAnalysis.keywords && selectedReport.severityAnalysis.keywords.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Indicators</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.severityAnalysis.keywords.map((keyword, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedReport.severityAnalysis.summary && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis Summary</h4>
                      <p className="text-gray-900 text-sm">{selectedReport.severityAnalysis.summary}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Current Status</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Case Status:</span>
                    {selectedReport.caseStatus ? (
                      <span className={`ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getCaseStatusColor(selectedReport.caseStatus)}`}>
                        {getCaseStatusIcon(selectedReport.caseStatus)}
                        {selectedReport.caseStatus}
                      </span>
                    ) : (
                      <span className="ml-2 text-gray-500 text-sm">Not Set</span>
                    )}
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Archived:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${selectedReport.isArchived ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"}`}>
                      {selectedReport.isArchived ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMessageUser(selectedReport)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <MessageSquare size={18} />
                    Message User
                  </button>

                  {!selectedReport.severityAnalysis && (
                    <button
                      onClick={() => handleAnalyzeSeverity(selectedReport._id)}
                      disabled={analyzing[selectedReport._id]}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                    >
                      {analyzing[selectedReport._id] ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <Shield size={18} />
                      )}
                      Analyze Severity
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowCaseStatusModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    <Edit size={18} />
                    Update Case Status
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedReport(null);
                      setShowDetailsModal(false);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Close
                  </button>

                  {selectedReport.isArchived ? (
                    <button
                      onClick={() => setShowRestoreModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      <RefreshCw size={18} />
                      Restore Report
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowArchiveModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      <Archive size={18} />
                      Archive Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Severity Analysis Modal */}
      {showSeverityAnalysis && selectedReport && selectedReport.severityAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Shield size={24} className="text-red-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Severity Analysis Details</h2>
                    <p className="text-sm text-gray-600">Report #{selectedReport.ticketNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSeverityAnalysis(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-4xl font-bold ${getSeverityColor(selectedReport.severityAnalysis.severity).split(' ')[1].replace('text-', 'text-')}`}>
                      {Math.round(selectedReport.severityAnalysis.confidence * 100)}%
                    </div>
                  </div>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="84"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="84"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${selectedReport.severityAnalysis.confidence * 528} 528`}
                      strokeLinecap="round"
                      className={getSeverityColor(selectedReport.severityAnalysis.severity).split(' ')[1].replace('text-', 'text-')}
                    />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${getSeverityColor(selectedReport.severityAnalysis.severity)}`}>
                    {getSeverityIcon(selectedReport.severityAnalysis.severity)}
                    {getSeverityLabel(selectedReport.severityAnalysis.severity)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Severity Level</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(selectedReport.severityAnalysis.confidence * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Confidence Score</p>
                </div>
              </div>

              {selectedReport.severityAnalysis.keywords && selectedReport.severityAnalysis.keywords.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Severity Indicators</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.severityAnalysis.keywords.map((keyword, idx) => (
                      <span key={idx} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm transition-colors">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.severityAnalysis.summary && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Analysis Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{selectedReport.severityAnalysis.summary}</p>
                  </div>
                </div>
              )}

              {selectedReport.severityAnalysis.factors && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Severity Factors</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedReport.severityAnalysis.factors).map(([factor, score]) => (
                      <div key={factor}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-gray-700">{factor}</span>
                          <span className="font-medium text-gray-900">{Math.round(score * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${factor === 'urgency' ? 'bg-red-500' :
                              factor === 'impact' ? 'bg-orange-500' :
                                factor === 'sensitivity' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                            style={{ width: `${score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSeverityAnalysis(false)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Status Update Modal */}
      {showCaseStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Update Case Status</h2>
              <p className="text-gray-600 text-sm mt-1">Report #{selectedReport?.ticketNumber}</p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newCaseStatus}
                onChange={(e) => setNewCaseStatus(e.target.value)}
              >
                <option value="">Choose a status</option>
                <option value="For Queuing">For Queuing</option>
                <option value="For Interview">For Interview</option>
                <option value="For Appointment">For Appointment</option>
                <option value="For Referral">For Referral</option>
                <option value="Case Closed">Case Closed</option>
              </select>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCaseStatusModal(false);
                    setNewCaseStatus("");
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCaseStatus}
                  disabled={!newCaseStatus}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Archive Report</h2>
              <p className="text-gray-600 text-sm mt-1">Report #{selectedReport?.ticketNumber}</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <AlertTriangle size={24} className="text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Are you sure you want to archive this report?</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Archived reports will be moved to the archived section and removed from active reports.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchive}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Archive Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Restore Report</h2>
              <p className="text-gray-600 text-sm mt-1">Report #{selectedReport?.ticketNumber}</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <RefreshCw size={24} className="text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Restore this report to active reports?</p>
                  <p className="text-sm text-green-700 mt-1">
                    This report will be moved back to the active reports section.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Restore Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Referral</h2>
              <p className="text-gray-600 text-sm mt-1">Report #{selectedReport?.ticketNumber}</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department to Refer
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={referralDept}
                    onChange={(e) => setReferralDept(e.target.value)}
                  >
                    <option value="">Select department</option>
                    <option value="Guidance and Counseling">Guidance and Counseling</option>
                    <option value="Student Affairs">Student Affairs</option>
                    <option value="Security Office">Security Office</option>
                    <option value="College Dean's Office">College Dean's Office</option>
                    <option value="Medical Clinic">Medical Clinic</option>
                    <option value="Legal Office">Legal Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Add any additional notes or instructions for the referral..."
                    value={referralNote}
                    onChange={(e) => setReferralNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReferralModal(false);
                    setReferralDept("");
                    setReferralNote("");
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReferral}
                  disabled={!referralDept}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Referral
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;