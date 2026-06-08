/**
 * AdminReports.jsx
 *
 * Report Management dashboard.
 *
 * This component is intentionally thin — business logic lives in:
 *   services/reportStatusService.js   — status constants, colours, icons, rules
 *   services/appointmentWorkflowService.js — appointment→status side-effects
 *   services/notificationService.js   — chat & email notifications
 *   services/pdfService.js            — referral PDF generation
 *   services/reportUIHelpers.jsx      — InfoItem, severity helpers, filtering
 *
 * STATUS WORKFLOW (v2):
 *   "For Queuing"    — initial, manually set by admin
 *   "For Scheduling" — manually set by admin OR auto-set when user submits an appointment request
 *   "For Interview"  — AUTO-SET when admin approves the appointment
 *   "For Referral"   — manually set by admin (after interview)
 *   "Case Closed"    — manually set by admin (terminal)
 *   "Internal - X"   — set automatically when an internal referral is added
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MessageSquare, Send, Share2, X, Eye, Archive, RefreshCw,
  Search, Filter, Calendar, FileText, AlertCircle, CheckCircle,
  Clock, XCircle, ChevronDown, Download, Users, UserCheck, ClipboardList,
  Edit, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Brain, Activity, AlertTriangle, Shield, BarChart, ExternalLink,
  FileDown, RotateCcw, Mail,
} from "lucide-react";

// ── Service imports ────────────────────────────────────────────────────────────
import {
  isStatusDisabled,
  CASE_STATUS_FILTER_OPTIONS,
  getCaseStatusColor,
} from "../../services/reportStatusService.js";
import {
  getCaseStatusIcon,
  getSeverityColor,
  getSeverityIcon,
  getSeverityStats,
  InfoItem,
  applyFilters,
  countActiveFilters,
} from "../../services/reportUIHelpers.jsx";
import {
  notifyStatusChange,
  sendReferralNotification,
  toastSuccess, toastError, toastInfo,
} from "../../services/notificationService.js";
import { generateReferralPDFDoc } from "../../services/pdfService.js";

// ── API imports ────────────────────────────────────────────────────────────────
import {
  getAllReports, getArchivedReports, getReportById,
  updateReportStatus, archiveReport, restoreReport, addReferral,
  updateReportServices, searchReporters, sendBookingLink,
} from "../../api/report.js";
import { analyzeReportSeverity, saveReportSeverity } from "../../api/ai.js";

// ─── Main component ───────────────────────────────────────────────────────────
const AdminReports = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── Data ──
  const [activeTab,       setActiveTab]       = useState("active");
  const [reports,         setReports]         = useState([]);
  const [archivedReports, setArchivedReports] = useState([]);
  const [loading,         setLoading]         = useState(false);

  // ── AI analysis ──
  const [analyzing,              setAnalyzing]              = useState(false);
  const [sentimentResults,       setSentimentResults]       = useState({});
  const [selectedReportForAI,    setSelectedReportForAI]    = useState(null);
  const [showAnalysisConfirm,    setShowAnalysisConfirm]    = useState(false);
  const [pendingAnalysis,        setPendingAnalysis]        = useState(null);

  // ── Selection ──
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [sentimentFilter,   setSentimentFilter]   = useState("All");

  // ── Filters ──
  const defaultFilters = {
    searchTerm:               "",
    readStatusFilter:         "All",
    caseStatusFilter:         "All",
    internalDepartmentFilter: "All",
    categoryFilter:           "All",
    dateFrom:                 "",
    dateTo:                   "",
    sortOrder:                "latest",
    sentimentFilter:          "All",
  };
  const [filters,     setFilters]     = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage,setItemsPerPage]= useState(10);

  // ── Modals ──
  const [selectedReport,          setSelectedReport]          = useState(null);
  const [showDetailsModal,        setShowDetailsModal]        = useState(false);
  const [showCaseStatusModal,     setShowCaseStatusModal]     = useState(false);
  const [showArchiveModal,        setShowArchiveModal]        = useState(false);
  const [showRestoreModal,        setShowRestoreModal]        = useState(false);
  const [showReferralModal,       setShowReferralModal]       = useState(false);
  const [showViewReferralModal,   setShowViewReferralModal]   = useState(false);
  const [selectedReferral,        setSelectedReferral]        = useState(null);
  const [showReporterConfirm,     setShowReporterConfirm]     = useState(false);
  const [modalTab,                setModalTab]                = useState("details");

  // ── Case status form ──
  const [newCaseStatus,           setNewCaseStatus]           = useState("");
  const [newReferralType,         setNewReferralType]         = useState("");
  const [referralDept,            setReferralDept]            = useState("");
  const [referralNote,            setReferralNote]            = useState("");
  const [referralRevealIdentity,  setReferralRevealIdentity]  = useState(false);
  const [caseClosureReason,       setCaseClosureReason]       = useState("");
  const [showExternalForm,        setShowExternalForm]        = useState(false);
  const [isSubmittingReferral,    setIsSubmittingReferral]    = useState(false);
  const [isDownloadingPDF,        setIsDownloadingPDF]        = useState(false);

  // ── Booking link ──
  const [isSendingBookingLink, setIsSendingBookingLink] = useState(false);

  // ── Reporter search ──
  const [reporterSearch,        setReporterSearch]        = useState("");
  const [reporterSearchResults, setReporterSearchResults] = useState([]);
  const [selectedReporter,      setSelectedReporter]      = useState(null);
  const [reporterInputRef,      setReporterInputRef]      = useState(null);
  const [dropdownPosition,      setDropdownPosition]      = useState({ top: 0, left: 0 });

  // ── External referral form ──
  const [externalData, setExternalData] = useState({
    referredBy: "", position: "", schoolName: "", referralDate: "",
    reason: "", actionsTaken: [], caseSummary: "",
    barangayName: "", barangayAddress: "", receivingOfficer: "",
    endorsementMode: "", attachments: [],
  });
  const [isDragging, setIsDragging] = useState(false);

  // ── Read tracking ──
  const [readReports, setReadReports] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("adminReadReports")) || []); }
    catch { return new Set(); }
  });

  // ── Misc ──
  const [toast,                setToast]                = useState({ show: false, message: "", type: "" });
  const [autoOpenTicket,       setAutoOpenTicket]       = useState(null);
  const [openDropdown,         setOpenDropdown]         = useState(null);
  const dropdownRefs = useRef({});

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  }, []);

  // ── Read helpers ───────────────────────────────────────────────────────────
  const markAsRead   = useCallback((id) => setReadReports(p => { const n = new Set(p); n.add(id);    return n; }), []);
  const markAsUnread = useCallback((id) => setReadReports(p => { const n = new Set(p); n.delete(id); return n; }), []);
  const isRead       = useCallback((id) => readReports.has(id), [readReports]);

  // ── Persist read state ─────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("adminReadReports", JSON.stringify([...readReports]));
  }, [readReports]);

  // ── Persist sentiment cache ────────────────────────────────────────────────
  useEffect(() => {
    if (Object.keys(sentimentResults).length) {
      localStorage.setItem("reportSentiments", JSON.stringify(sentimentResults));
    }
  }, [sentimentResults]);

  // ── Load cached sentiments on mount ───────────────────────────────────────
  useEffect(() => {
    try {
      const s = localStorage.getItem("reportSentiments");
      if (s) setSentimentResults(JSON.parse(s));
    } catch {}
  }, []);

  // ── Reset selection when switching tabs ───────────────────────────────────
  useEffect(() => { setSelectedReportIds([]); }, [activeTab]);

  // ── Auto-open report from URL ?ticket= ────────────────────────────────────
  useEffect(() => {
    const t = new URLSearchParams(location.search).get("ticket");
    if (t) setAutoOpenTicket(t);
  }, [location.search]);

  useEffect(() => {
    if (!autoOpenTicket || loading) return;
    const match = [...reports, ...archivedReports].find(
      (r) => r.ticketNumber === autoOpenTicket || r._id === autoOpenTicket
    );
    if (match) { handleViewDetails(match._id); setAutoOpenTicket(null); }
  }, [autoOpenTicket, reports, archivedReports, loading]);

  // ── Show external form when "For Referral" + "External" chosen ────────────
  useEffect(() => {
    setShowExternalForm(newCaseStatus === "For Referral" && newReferralType === "External");
  }, [newCaseStatus, newReferralType]);

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (openDropdown && !e.target.closest(".dropdown-trigger") && !e.target.closest(".dropdown-menu")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdown]);

  // ── Data fetch ─────────────────────────────────────────────────────────────
  const fetchReports = async () => {
    setLoading(true);
    try {
      const [activeRes, archRes] = await Promise.all([getAllReports(), getArchivedReports()]);
      const activeList = activeRes.data   || [];
      const archList   = archRes.data     || [];

      if (activeRes.success) setReports(activeList);
      else showToast(activeRes.message || "Failed to fetch active reports", "error");

      if (archRes.success) setArchivedReports(archList);

      // Merge DB severity with local cache
      let local = {};
      try { local = JSON.parse(localStorage.getItem("reportSentiments")) || {}; } catch {}
      const merged = { ...local };
      [...activeList, ...archList].forEach((r) => {
        if (r.severity && r.severity !== "Unanalyzed") {
          merged[r._id] = local[r._id] || {
            severity:    r.severity.toUpperCase(),
            confidence:  0.85,
            explanation: "Loaded from database.",
          };
        }
      });
      setSentimentResults(merged);

      // Background sync: push any locally-cached severities up to DB
      [...activeList, ...archList].forEach(async (r) => {
        if ((!r.severity || r.severity === "Unanalyzed") && local[r._id]?.severity) {
          try { await saveReportSeverity(r._id, local[r._id].severity); } catch {}
        }
      });
    } catch (err) {
      showToast(`Failed to fetch reports: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  // ── AI analysis ────────────────────────────────────────────────────────────
  const triggerAnalysis = (type, reportId = null, reportData = null) => {
    setPendingAnalysis({ type, reportId, reportData });
    setShowAnalysisConfirm(true);
  };

  const runSingleAnalysis = async (reportId, reportData) => {
    setAnalyzing(true);
    setSelectedReportForAI(reportId);
    const full = [...reports, ...archivedReports].find((r) => r._id === reportId);
    const description =
      reportData?.incidentDescription ||
      reportData?.salaysay ||
      full?.salaysay ||
      full?.incidentDescription || "";
    try {
      const res = await analyzeReportSeverity({
        incidentDescription: description,
        reportId,
        additionalContext: {
          timestamp: reportData?.timestamp,
          location:  reportData?.location || "Not specified",
        },
      });
      if (res.success) {
        const entry = { ...res.data, analyzedAt: new Date().toISOString() };
        setSentimentResults((p) => ({ ...p, [reportId]: entry }));
        showToast(`Severity analysis complete: ${res.data.severity}`, "success");
        try {
          await saveReportSeverity(reportId, res.data.severity);
          const sev = res.data.severity.charAt(0).toUpperCase() + res.data.severity.slice(1).toLowerCase();
          setReports((p) => p.map((r) => r._id === reportId ? { ...r, severity: sev } : r));
          setArchivedReports((p) => p.map((r) => r._id === reportId ? { ...r, severity: sev } : r));
        } catch {}
      } else {
        showToast(res.message || "Failed to analyze severity", "error");
      }
    } catch (err) {
      showToast(`Analysis failed: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setAnalyzing(false);
      setSelectedReportForAI(null);
    }
  };

  const runBulkAnalysis = async (ids) => {
    setAnalyzing(true);
    const combined = [...reports, ...archivedReports];
    const targets  = combined.filter((r) => ids.includes(r._id));
    let ok = 0;
    for (const report of targets) {
      const description = report.salaysay || report.incidentDescription || "No description.";
      try {
        const res = await analyzeReportSeverity({
          incidentDescription: description,
          reportId: report._id,
          additionalContext: {
            timestamp: report.submittedAt,
            location:  report.placeOfIncident || "Not specified",
          },
        });
        if (res.success) {
          ok++;
          const entry = { ...res.data, analyzedAt: new Date().toISOString() };
          setSentimentResults((prev) => ({ ...prev, [report._id]: entry }));
          await saveReportSeverity(report._id, res.data.severity);
          const sev = res.data.severity.charAt(0).toUpperCase() + res.data.severity.slice(1).toLowerCase();
          setReports((p) => p.map((r) => r._id === report._id ? { ...r, severity: sev } : r));
          setArchivedReports((p) => p.map((r) => r._id === report._id ? { ...r, severity: sev } : r));
        }
      } catch {}
    }
    setAnalyzing(false);
    return { ok, total: targets.length };
  };

  const handleBulkAnalyze = async () => {
    if (!selectedReportIds.length) return;
    showToast(`Starting bulk analysis for ${selectedReportIds.length} reports...`, "info");
    const { ok, total } = await runBulkAnalysis(selectedReportIds);
    setSelectedReportIds([]);
    showToast(`Bulk analysis complete: ${ok}/${total} reports analyzed.`, "success");
  };

  // ── View details ───────────────────────────────────────────────────────────
  const handleViewDetails = async (reportId) => {
    try {
      const res = await getReportById(reportId);
      if (res.success) {
        setSelectedReport(res.data);
        setShowDetailsModal(true);
        markAsRead(reportId);
      } else {
        showToast(res.message || "Failed to load report", "error");
      }
    } catch (err) {
      showToast(`Failed to load report: ${err.message}`, "error");
    }
  };

  const handleMessageUser = (report) => {
    navigate("/superadmin/messages", {
      state: { selectedTicketNumber: report.ticketNumber, reportId: report._id },
    });
  };

  // ── Send booking link ──────────────────────────────────────────────────────
  const handleSendBookingLink = async (reportId) => {
    setIsSendingBookingLink(true);
    try {
      const res = await sendBookingLink(reportId);
      if (res.success) {
        showToast("Booking link sent successfully");
      } else {
        showToast(res.message || "Failed to send booking link", "error");
      }
    } catch (err) {
      showToast(
        `Failed to send booking link: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setIsSendingBookingLink(false);
    }
  };

  // ── Case status update ─────────────────────────────────────────────────────
  const handleUpdateCaseStatus = async () => {
    if (!newCaseStatus) return;
    if (newCaseStatus === "For Referral" && newReferralType === "External") {
      setShowExternalForm(true);
      return;
    }
    const finalStatus = newCaseStatus === "For Referral" && newReferralType
      ? newReferralType
      : newCaseStatus;

    try {
      const res = await updateReportStatus(
        selectedReport._id,
        selectedReport.status,
        "",
        finalStatus,
        caseClosureReason
      );
      if (res.success) {
        showToast("Case status updated successfully");
        resetStatusModal();
        fetchReports();
        try {
          await notifyStatusChange(selectedReport.ticketNumber, finalStatus);
        } catch (e) {
          showToast("Chat notification failed: " + (e.message || ""), "error");
        }
      } else {
        showToast(res.message || "Failed to update case status", "error");
      }
    } catch (err) {
      showToast(`Failed to update case status: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  // ── Internal referral ──────────────────────────────────────────────────────
  const handleAddReferral = async () => {
    if (!referralDept) return;
    try {
      const payload = {
        department:     referralDept,
        note:           referralNote,
        referralType:   "Internal",
        revealIdentity: referralRevealIdentity,
      };
      const res = await addReferral(selectedReport._id, payload);
      if (res.success) {
        showToast("Referral added successfully");
        resetStatusModal();
        fetchReports();
        try {
          await sendReferralNotification(selectedReport, {
            ...payload,
            referralTimestamp: new Date().toISOString(),
          });
        } catch (e) {
          showToast("Failed to send referral notification: " + (e.message || ""), "error");
        }
      } else {
        showToast(res.message || "Failed to add referral", "error");
      }
    } catch (err) {
      showToast(`Failed to add referral: ${err.message}`, "error");
    }
  };

  // ── External referral ──────────────────────────────────────────────────────
  const handleExternalReferral = async () => {
    setIsSubmittingReferral(true);
    const payload = {
      ...externalData,
      referralType:      "External",
      referralTimestamp: new Date().toISOString(),
      reportId:          selectedReport._id,
    };
    try {
      const res = await addReferral(selectedReport._id, payload);
      if (res.success) {
        showToast("External referral submitted successfully");
        await updateReportStatus(selectedReport._id, selectedReport.status, "", "Referred to Barangay");
        fetchReports();
        try {
          await sendReferralNotification(selectedReport, payload);
        } catch (e) {
          showToast("Failed to send referral notification: " + (e.message || ""), "error");
        }
        resetStatusModal();
        resetExternalData();
      } else {
        showToast(res.message || "Failed to submit external referral", "error");
      }
    } catch (err) {
      showToast(err.message || "Error submitting external referral", "error");
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  // ── Reporter confirm ───────────────────────────────────────────────────────
  const handleConfirmReporter = async () => {
    if (!selectedReporter) return;
    try {
      const res = await addReferral(selectedReport._id, {
        department:     referralDept,
        note:           referralNote,
        referralType:   "Internal",
        reporterUserId: selectedReporter._id,
      });
      if (res.success) {
        showToast("Referral added with reporter identification");
        resetStatusModal();
        setShowReporterConfirm(false);
        setSelectedReporter(null);
        fetchReports();
      } else {
        showToast(res.message || "Failed to add referral", "error");
      }
    } catch {
      showToast("Failed to add referral", "error");
    }
  };

  // ── Archive / Restore ──────────────────────────────────────────────────────
  const handleArchive = async () => {
    try {
      const res = await archiveReport(selectedReport._id);
      if (res.success) {
        showToast("Report archived successfully");
        setShowArchiveModal(false);
        setShowDetailsModal(false);
        fetchReports();
      } else {
        showToast(res.message || "Failed to archive", "error");
      }
    } catch (err) {
      showToast(`Failed to archive: ${err.message}`, "error");
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
        showToast(res.message || "Failed to restore", "error");
      }
    } catch (err) {
      showToast(`Failed to restore: ${err.message}`, "error");
    }
  };

  // ── Services update ────────────────────────────────────────────────────────
  const handleUpdateServices = async (field, value) => {
    try {
      setLoading(true);
      const res = await updateReportServices(selectedReport._id, { [field]: value });
      if (res.success) {
        showToast("Service status updated successfully");
        const updated = { ...selectedReport, ...res.data };
        setSelectedReport(updated);
        setReports((p) => p.map((r) => r._id === selectedReport._id ? { ...r, ...res.data } : r));
      } else {
        showToast(res.message || "Failed to update services", "error");
      }
    } catch (err) {
      showToast(`Failed to update services: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Referral PDF download ──────────────────────────────────────────────────
  const handleDownloadReferralPDF = async () => {
    if (!selectedReferral || !selectedReport) return;
    setIsDownloadingPDF(true);
    try {
      const doc = await generateReferralPDFDoc(selectedReport, selectedReferral);
      doc.save(`${selectedReferral.referralType ?? "Internal"}_Referral_${selectedReport.ticketNumber}.pdf`);
      showToast("Referral report downloaded successfully");
    } catch {
      showToast("Failed to generate PDF report", "error");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // ── Reporter search ────────────────────────────────────────────────────────
  const handleReporterSearch = async (term) => {
    setReporterSearch(term);
    if (term.length >= 2) {
      try {
        const results = await searchReporters(term);
        setReporterSearchResults(results);
        if (reporterInputRef) {
          const r = reporterInputRef.getBoundingClientRect();
          setDropdownPosition({ top: r.bottom + 4, left: r.left, width: r.width });
        }
      } catch (err) {
        if (err.response?.status === 403) showToast("Admin access required to search reporters.", "error");
        else showToast("Failed to search reporters.", "error");
        setReporterSearchResults([]);
      }
    } else {
      setReporterSearchResults([]);
    }
  };

  const handleSelectReporter = (reporter) => {
    setSelectedReporter(reporter);
    setReporterSearchResults([]);
    setReporterSearch("");
    setShowReporterConfirm(true);
  };

  // ── Drag-drop for external form ────────────────────────────────────────────
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true);  };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop      = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) setExternalData((p) => ({ ...p, attachments: [...p.attachments, ...files] }));
  };

  // ── Resets ─────────────────────────────────────────────────────────────────
  const resetStatusModal = () => {
    setShowCaseStatusModal(false);
    setShowReferralModal(false);
    setShowExternalForm(false);
    setNewCaseStatus("");
    setNewReferralType("");
    setReferralDept("");
    setReferralNote("");
    setReferralRevealIdentity(false);
    setCaseClosureReason("");
  };

  const resetExternalData = () =>
    setExternalData({
      referredBy: "", position: "", schoolName: "", referralDate: "",
      reason: "", actionsTaken: [], caseSummary: "",
      barangayName: "", barangayAddress: "", receivingOfficer: "",
      endorsementMode: "", attachments: [],
    });

  const clearFilters = () => { setFilters(defaultFilters); setCurrentPage(1); };

  const updateFilter = (key, value) =>
    setFilters((p) => ({ ...p, [key]: value }));

  // ── Derived data ───────────────────────────────────────────────────────────
  const currentList      = activeTab === "active" ? reports : archivedReports;
  const filteredReports  = applyFilters(currentList, sentimentResults, filters, readReports);
  const totalPages       = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex       = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);
  const goToPage         = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));
  const activeFilterCount= countActiveFilters(filters);
  const sevStats         = getSeverityStats(reports, sentimentResults);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 overflow-x-hidden max-w-[100vw]">

        {/* ── Toast ──────────────────────────────────────────────────────────── */}
        {toast.show && (
          <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl border ${toast.type === "error" ? "bg-red-600 border-red-500" : "bg-emerald-600 border-emerald-500"} text-white`}>
            {toast.type === "error" ? <XCircle size={22} /> : <CheckCircle size={22} />}
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Report Management</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Monitor and manage incident reports with AI-powered severity analysis
              </p>
            </div>
          </div>

          {/* Severity stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Severe Reports",   count: sevStats.severe,    color: "red",    Icon: AlertTriangle },
              { label: "Moderate Reports", count: sevStats.moderate,  color: "yellow", Icon: Activity },
              { label: "Mild Reports",     count: sevStats.mild,      color: "green",  Icon: Shield },
              { label: "Unanalyzed",       count: sevStats.unanalyzed,color: "gray",   Icon: Brain },
            ].map(({ label, count, color, Icon }) => (
              <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
                  </div>
                  <div className={`p-3 bg-${color}-50 rounded-full`}>
                    <Icon className={`text-${color}-600`} size={24} />
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${color}-500 rounded-full`}
                    style={{ width: `${(count / (reports.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search + Filters ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${showFilters || activeFilterCount > 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <Filter size={20} /> Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By Date</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.sortOrder} onChange={(e) => { updateFilter("sortOrder", e.target.value); setCurrentPage(1); }}>
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Read Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.readStatusFilter} onChange={(e) => { updateFilter("readStatusFilter", e.target.value); setCurrentPage(1); }}>
                    <option>All</option><option>Unread</option><option>Read</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Case Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.caseStatusFilter}
                    onChange={(e) => {
                      updateFilter("caseStatusFilter", e.target.value);
                      if (e.target.value !== "Internal") updateFilter("internalDepartmentFilter", "All");
                      setCurrentPage(1);
                    }}>
                    {CASE_STATUS_FILTER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                {filters.caseStatusFilter === "Internal" && (
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Internal Department</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={filters.internalDepartmentFilter}
                      onChange={(e) => { updateFilter("internalDepartmentFilter", e.target.value); setCurrentPage(1); }}>
                      <option>All</option>
                      {["Legal Clinic","Guidance and Counseling","Medical Health Services",
                        "Gender and Development","Director's Office",
                        "Human Resources (for Employees)","Student Affairs"].map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.sentimentFilter}
                    onChange={(e) => { updateFilter("sentimentFilter", e.target.value); setCurrentPage(1); }}>
                    <option>All</option><option>Severe</option><option>Moderate</option>
                    <option>Mild</option><option>Unanalyzed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.dateFrom}
                    onChange={(e) => { updateFilter("dateFrom", e.target.value); setCurrentPage(1); }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.dateTo}
                    onChange={(e) => { updateFilter("dateTo", e.target.value); setCurrentPage(1); }} />
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Reports table card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 md:p-6 gap-4">
              <div className="flex gap-2 w-full lg:w-auto">
                {["active", "archived"].map((tab) => (
                  <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                    className={`flex-1 lg:flex-none whitespace-nowrap px-3 sm:px-6 py-2.5 rounded-xl font-bold transition-all duration-200 ${activeTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}>
                    {tab === "active" ? `Active Reports (${reports.length})` : `Archived (${archivedReports.length})`}
                  </button>
                ))}
              </div>
              <div className="text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                Showing <span className="text-gray-900 font-bold">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredReports.length)}</span>
                {" "}of{" "}
                <span className="text-gray-900 font-bold">{filteredReports.length}</span>
              </div>
            </div>
          </div>

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
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 w-10">
                          <input type="checkbox"
                            checked={paginatedReports.length > 0 && paginatedReports.every((r) => selectedReportIds.includes(r._id))}
                            onChange={() => {
                              const ids = paginatedReports.map((r) => r._id);
                              const allChecked = ids.every((id) => selectedReportIds.includes(id));
                              setSelectedReportIds(allChecked
                                ? selectedReportIds.filter((id) => !ids.includes(id))
                                : [...new Set([...selectedReportIds, ...ids])]);
                            }}
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 cursor-pointer"
                          />
                        </th>
                        <th className="px-6 py-3 w-6" />
                        {["Ticket", "Severity", "Case Status", "Date", "Actions"].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedReports.map((report) => {
                        const sentiment = sentimentResults[report._id];
                        const unread    = !isRead(report._id);
                        return (
                          <tr key={report._id} className={`hover:bg-gray-50 transition-colors ${unread ? "bg-blue-50" : ""}`}>
                            <td className="px-6 py-4 w-10">
                              <input type="checkbox" checked={selectedReportIds.includes(report._id)}
                                onChange={() => setSelectedReportIds((p) =>
                                  p.includes(report._id) ? p.filter((id) => id !== report._id) : [...p, report._id])}
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4">
                              {unread && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-mono font-medium ${unread ? "text-blue-900 font-bold" : "text-gray-900"}`}>
                                {report.ticketNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {sentiment ? (
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(sentiment.severity)}`}>
                                    {getSeverityIcon(sentiment.severity)} {sentiment.severity}
                                    <span className="opacity-75">({Math.round(sentiment.confidence * 100)}%)</span>
                                  </span>
                                  {sentiment.keywords?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {sentiment.keywords.slice(0, 2).map((k, i) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{k}</span>
                                      ))}
                                      {sentiment.keywords.length > 2 && (
                                        <span className="text-xs text-gray-400">+{sentiment.keywords.length - 2}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => triggerAnalysis("single", report._id, { salaysay: report.salaysay || report.incidentDescription, timestamp: report.submittedAt })}
                                  disabled={analyzing}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium disabled:opacity-50"
                                >
                                  {analyzing && selectedReportForAI === report._id
                                    ? <RefreshCw size={12} className="animate-spin text-purple-600" />
                                    : <Brain size={12} />}
                                  {analyzing && selectedReportForAI === report._id ? "Analyzing..." : "Analyze"}
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {report.caseStatus ? (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCaseStatusColor(report.caseStatus)}`}>
                                  {getCaseStatusIcon(report.caseStatus)} {report.caseStatus}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">Not Set</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(report.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleViewDetails(report._id)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded" title="View Details"><Eye size={16} /></button>
                                <button onClick={() => handleMessageUser(report)} className="p-1.5 hover:bg-green-50 text-green-600 rounded" title="Message User"><MessageSquare size={16} /></button>
                                {isRead(report._id)
                                  ? <button onClick={() => markAsUnread(report._id)} className="p-1.5 hover:bg-gray-100 text-gray-600 rounded" title="Mark Unread"><Mail size={16} /></button>
                                  : <button onClick={() => markAsRead(report._id)} className="p-1.5 hover:bg-green-50 text-green-600 rounded" title="Mark Read"><CheckCircle size={16} /></button>}
                                <button
                                  onClick={() => { setSelectedReport(report); setNewCaseStatus(report.caseStatus || ""); setShowCaseStatusModal(true); }}
                                  className="p-1.5 hover:bg-purple-50 text-purple-600 rounded" title="Edit Case Status"
                                ><Edit size={16} /></button>
                                {/* Send Booking Link — only visible when caseStatus is "For Scheduling" */}
                                {report.caseStatus === "For Scheduling" && (
                                  <button
                                    onClick={() => handleSendBookingLink(report._id)}
                                    disabled={isSendingBookingLink}
                                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded disabled:opacity-50"
                                    title="Send Booking Link"
                                  >
                                    <Send size={16} />
                                  </button>
                                )}
                                {activeTab === "active"
                                  ? <button onClick={() => { setSelectedReport(report); setShowArchiveModal(true); }} className="p-1.5 hover:bg-red-50 text-red-600 rounded" title="Archive"><Archive size={16} /></button>
                                  : <button onClick={() => { setSelectedReport(report); setShowRestoreModal(true); }} className="p-1.5 hover:bg-green-50 text-green-600 rounded" title="Restore"><RefreshCw size={16} /></button>}
                                {!sentiment && (
                                  <button
                                    onClick={() => triggerAnalysis("single", report._id, { salaysay: report.salaysay || report.incidentDescription, timestamp: report.submittedAt })}
                                    disabled={analyzing}
                                    className="p-1.5 hover:bg-purple-50 text-purple-600 rounded disabled:opacity-50" title="Analyze Severity"
                                  >
                                    {analyzing && selectedReportForAI === report._id
                                      ? <RefreshCw size={16} className="animate-spin" />
                                      : <Brain size={16} />}
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

                {/* Mobile cards */}
                <div className="md:hidden flex flex-col gap-4">
                  {paginatedReports.map((report) => {
                    const sentiment = sentimentResults[report._id];
                    const unread    = !isRead(report._id);
                    return (
                      <div key={report._id} className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-3 ${unread ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={selectedReportIds.includes(report._id)}
                              onChange={() => setSelectedReportIds((p) =>
                                p.includes(report._id) ? p.filter((id) => id !== report._id) : [...p, report._id])}
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300 cursor-pointer"
                            />
                            {unread && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                            <span className={`text-sm font-mono font-medium ${unread ? "text-blue-900 font-bold" : "text-gray-900"}`}>
                              {report.ticketNumber}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            {new Date(report.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {sentiment ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(sentiment.severity)}`}>
                              {getSeverityIcon(sentiment.severity)} {sentiment.severity}
                            </span>
                          ) : (
                            <button
                              onClick={() => triggerAnalysis("single", report._id, { salaysay: report.salaysay || report.incidentDescription, timestamp: report.submittedAt })}
                              disabled={analyzing}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium disabled:opacity-50"
                            >
                              {analyzing && selectedReportForAI === report._id ? <RefreshCw size={12} className="animate-spin text-purple-600" /> : <Brain size={12} />}
                              {analyzing && selectedReportForAI === report._id ? "Analyzing..." : "Analyze"}
                            </button>
                          )}
                          {report.caseStatus ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getCaseStatusColor(report.caseStatus)}`}>
                              {getCaseStatusIcon(report.caseStatus)} {report.caseStatus}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">No Status</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                          <div className="flex gap-1">
                            <button onClick={() => handleViewDetails(report._id)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><Eye size={18} /></button>
                            <button onClick={() => handleMessageUser(report)} className="p-2 hover:bg-green-50 text-green-600 rounded-lg"><MessageSquare size={18} /></button>
                            {isRead(report._id)
                              ? <button onClick={() => markAsUnread(report._id)} className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg"><Mail size={18} /></button>
                              : <button onClick={() => markAsRead(report._id)} className="p-2 hover:bg-green-50 text-green-600 rounded-lg"><CheckCircle size={18} /></button>}
                            <button onClick={() => { setSelectedReport(report); setNewCaseStatus(report.caseStatus || ""); setShowCaseStatusModal(true); }} className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg"><Edit size={18} /></button>
                            {/* Send Booking Link (mobile) — only when caseStatus is "For Scheduling" */}
                            {report.caseStatus === "For Scheduling" && (
                              <button
                                onClick={() => handleSendBookingLink(report._id)}
                                disabled={isSendingBookingLink}
                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg disabled:opacity-50"
                                title="Send Booking Link"
                              >
                                <Send size={18} />
                              </button>
                            )}
                          </div>
                          <div className="pl-2 border-l border-gray-100">
                            {activeTab === "active"
                              ? <button onClick={() => { setSelectedReport(report); setShowArchiveModal(true); }} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center gap-1 text-xs font-bold"><Archive size={14} /> Archive</button>
                              : <button onClick={() => { setSelectedReport(report); setShowRestoreModal(true); }} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center gap-1 text-xs font-bold"><RotateCcw size={14} /> Restore</button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Items per page:</label>
                      <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                        {[5, 10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft size={16} /></button>
                      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const p = i + 1;
                          if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                            return (
                              <button key={p} onClick={() => goToPage(p)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === p ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-100"}`}>
                                {p}
                              </button>
                            );
                          }
                          if (p === currentPage - 2 || p === currentPage + 2) {
                            return <span key={p} className="px-2 text-gray-400">...</span>;
                          }
                          return null;
                        })}
                      </div>
                      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
                      <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"><ChevronsRight size={16} /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── AI Analysis Confirm Modal ───────────────────────────────────────── */}
        {showAnalysisConfirm && pendingAnalysis && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Brain size={24} className="text-purple-600 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">AI Severity Analysis</h2>
                    <p className="text-xs text-gray-500">Review before proceeding</p>
                  </div>
                </div>
                <button onClick={() => { setShowAnalysisConfirm(false); setPendingAnalysis(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">How It Works</h3>
                  {[
                    ["AI analyzes incident descriptions", "Uses OpenAI to understand context and severity"],
                    ["Classifies severity level", "Categorizes as Severe, Moderate, or Mild"],
                    ["Extracts key insights", "Identifies keywords and provides confidence scores"],
                  ].map(([title, sub], i) => (
                    <div key={i} className={`flex items-start gap-4 ${i > 0 ? "border-t border-gray-100 pt-4" : ""}`}>
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm border border-blue-100">{i + 1}</div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    This will request OpenAI to analyze{" "}
                    {pendingAnalysis.type === "bulk" ? `${selectedReportIds.length} reports` : "1 report"}.
                    Results will be saved and visible to all administrators.
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-100 p-6 bg-gray-50 flex items-center justify-end gap-3">
                <button onClick={() => { setShowAnalysisConfirm(false); setPendingAnalysis(null); }}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAnalysisConfirm(false);
                    if (pendingAnalysis.type === "single") runSingleAnalysis(pendingAnalysis.reportId, pendingAnalysis.reportData);
                    else handleBulkAnalyze();
                    setPendingAnalysis(null);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-1.5"
                >
                  <Brain size={16} /> Confirm & Analyze{" "}
                  {pendingAnalysis.type === "bulk" ? `(${selectedReportIds.length})` : "(1)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Details Modal ───────────────────────────────────────────────────── */}
        {showDetailsModal && selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedReport.ticketNumber}</p>
                  {sentimentResults[selectedReport._id] && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(sentimentResults[selectedReport._id].severity)}`}>
                        {getSeverityIcon(sentimentResults[selectedReport._id].severity)}
                        AI Analysis: {sentimentResults[selectedReport._id].severity}
                        {" "}({Math.round(sentimentResults[selectedReport._id].confidence * 100)}% confidence)
                      </span>
                    </div>
                  )}
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 bg-gray-50 px-6">
                {["details", "history"].map((tab) => (
                  <button key={tab} onClick={() => setModalTab(tab)}
                    className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${modalTab === tab ? "border-indigo-600 text-indigo-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    {tab === "details" ? "Incident Details" : "Case History & Referrals"}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                {modalTab === "details" ? (
                  <div className="space-y-6">
                    {sentimentResults[selectedReport._id] && (
                      <div className={`border rounded-2xl p-5 ${getSeverityColor(sentimentResults[selectedReport._id].severity)}`}>
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center shadow-sm">
                            {getSeverityIcon(sentimentResults[selectedReport._id].severity)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">AI Severity Analysis</h3>
                            <p className="text-sm mt-1 opacity-90">{sentimentResults[selectedReport._id].explanation}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {sentimentResults[selectedReport._id].keywords?.map((k, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white/40 rounded-md text-[10px] font-bold uppercase tracking-wider">{k}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Reporter */}
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <UserCheck size={14} /> Reporter Information
                        </h3>
                        {selectedReport.isAnonymous && !selectedReport.identifiedUserId ? (
                          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                            <p className="text-sm font-bold text-indigo-900 mb-2">Anonymous Submission</p>
                            <div className="grid grid-cols-2 gap-y-3">
                              <InfoItem label="Role"        value={selectedReport.reporterRole} />
                              <InfoItem label="Gender"      value={selectedReport.anonymousGender} />
                              <InfoItem label="Affiliation" value={selectedReport.tupRole} />
                              <InfoItem label="Dept"        value={selectedReport.reporterDepartment} />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                {(selectedReport.identifiedUserId?.firstName || selectedReport.createdBy?.firstName || "U").charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {selectedReport.identifiedUserId
                                    ? `${selectedReport.identifiedUserId.firstName ?? ""} ${selectedReport.identifiedUserId.lastName ?? ""}`.trim() || "Anonymous User"
                                    : `${selectedReport.createdBy?.firstName ?? ""} ${selectedReport.createdBy?.lastName ?? ""}`.trim() || "Anonymous User"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {selectedReport.identifiedUserId?.tupId || selectedReport.createdBy?.tupId}
                                </p>
                              </div>
                            </div>
                            <button onClick={() => handleMessageUser(selectedReport)}
                              className="w-full py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2">
                              <MessageSquare size={14} /> Message Reporter
                            </button>
                          </div>
                        )}
                      </section>

                      {/* Case overview */}
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <ClipboardList size={14} /> Case Overview
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <InfoItem label="Status"    value={selectedReport.caseStatus} />
                          <InfoItem label="Category"  value={selectedReport.incidentTypes?.join(", ") || "General"} />
                          <InfoItem label="Submitted" value={new Date(selectedReport.submittedAt).toLocaleDateString()} />
                          <InfoItem label="Time"      value={new Date(selectedReport.submittedAt).toLocaleTimeString()} />
                        </div>
                      </section>
                    </div>

                    {/* Location */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Shield size={14} /> Location Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem label="Place of Incident" value={selectedReport.placeOfIncident} />
                        <InfoItem label="Address Details"   value={`${selectedReport.incidentBarangay ?? ""} ${selectedReport.incidentCityMun ?? ""} ${selectedReport.incidentProvince ?? ""}`} />
                      </div>
                    </section>

                    {/* Statement */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Incident Statement</h3>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {selectedReport.salaysay || selectedReport.incidentDescription || selectedReport.incidentStatement || "No statement provided"}
                        </p>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Victim Details</h3>
                        <div className="grid grid-cols-2 gap-y-4">
                          <InfoItem label="Full Name"   value={selectedReport.isAnonymous && !selectedReport.identifiedUserId ? "Anonymous Reporter" : (selectedReport.identifiedUserId ? `${selectedReport.identifiedUserId.firstName ?? ""} ${selectedReport.identifiedUserId.lastName ?? ""}`.trim() : `${selectedReport.firstName ?? ""} ${selectedReport.lastName ?? ""}`.trim())} />
                          <InfoItem label="Gender"      value={selectedReport.isAnonymous && !selectedReport.identifiedUserId ? (selectedReport.reporterGender || selectedReport.anonymousGender) : selectedReport.sex} />
                          <InfoItem label="Address"     value={`${selectedReport.barangay ?? ""} ${selectedReport.cityMun ?? ""}`} />
                          <InfoItem label="Occupation"  value={selectedReport.occupation} />
                        </div>
                      </section>
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Perpetrator Details</h3>
                        <div className="grid grid-cols-2 gap-y-4">
                          <InfoItem label="Name"         value={`${selectedReport.perpFirstName ?? ""} ${selectedReport.perpLastName ?? ""}`} fallback="Not provided" />
                          <InfoItem label="Gender"       value={selectedReport.perpSex} fallback="Not provided" />
                          <InfoItem label="Relationship" value={selectedReport.perpRelationship} fallback="Not provided" />
                          <InfoItem label="Occupation"   value={selectedReport.perpOccupation} fallback="Not provided" />
                          <InfoItem label="Address"      value={selectedReport.perpBarangay} fallback="Not provided" />
                        </div>
                      </section>
                    </div>

                    {/* Witnesses */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Users size={14} /> Witness Information
                      </h3>
                      {selectedReport.witnessName ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <InfoItem label="Witness Name"  value={selectedReport.witnessName}    fallback="Not provided" />
                            <InfoItem label="Gender"        value={selectedReport.witnessGender}  fallback="Not provided" />
                            <InfoItem label="Contact Info"  value={selectedReport.witnessContact} fallback="Not provided" />
                            <InfoItem label="Address"       value={selectedReport.witnessAddress} fallback="Not provided" />
                          </div>
                          {selectedReport.witnessAccount && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Witness Statement</label>
                              <p className="text-sm text-gray-800 leading-relaxed italic">"{selectedReport.witnessAccount}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No witnesses provided</p>
                      )}
                    </section>

                    {selectedReport.attachments?.length > 0 && (
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Evidence & Attachments</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedReport.attachments.map((att, i) => (
                            <a key={i} href={att.uri} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all group">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm"><FileText size={16} /></div>
                              <span className="text-[11px] font-bold text-gray-700 truncate flex-1">{att.fileName}</span>
                              <Download size={14} className="text-gray-400" />
                            </a>
                          ))}
                        </div>
                      </section>
                    )}

                    {selectedReport.additionalNotes && (
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Additional Notes</h3>
                        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">{selectedReport.additionalNotes}</p>
                        </div>
                      </section>
                    )}
                  </div>
                ) : (
                  /* History tab */
                  <div className="space-y-6">
                    {selectedReport.referrals?.length > 0 && (
                      <section className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <Share2 size={18} /> Formal Referrals Issued
                          </h3>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold">
                            {selectedReport.referrals.length} Referral{selectedReport.referrals.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedReport.referrals.map((ref, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    {ref.referralType === "External" ? <Shield size={20} /> : <Users size={20} />}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold leading-tight">
                                      {ref.referralType === "External" ? ref.barangayName : ref.department}
                                    </p>
                                    <p className="text-[10px] opacity-70 uppercase font-bold tracking-tighter">{ref.referralType} Referral</p>
                                  </div>
                                </div>
                                <button onClick={() => { setSelectedReferral(ref); setShowViewReferralModal(true); }}
                                  className="w-8 h-8 bg-white text-indigo-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                                  <Eye size={16} />
                                </button>
                              </div>
                              <div className="text-[10px] opacity-80 flex items-center gap-1">
                                <Clock size={10} /> Issued on {new Date(ref.date).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Clock size={16} /> Activity Log & Audit Trail
                      </h3>
                      <div className="space-y-6">
                        {selectedReport.timeline?.map((t, i) => (
                          <div key={i} className="relative pl-8 border-l-2 border-gray-100 pb-2">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${t.action.includes("Referral") ? "bg-indigo-600" : t.action.includes("Closed") ? "bg-gray-800" : "bg-blue-500"}`} />
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                              <p className="text-sm font-bold text-gray-900">{t.action}</p>
                              <time className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                {new Date(t.timestamp).toLocaleString()}
                              </time>
                            </div>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                              <span className="font-bold text-gray-700">
                                {selectedReport.isAnonymous &&
                                  ((t.performedBy?._id || t.performedBy) === (selectedReport.createdBy?._id || selectedReport.createdBy))
                                  ? (selectedReport.identifiedUserId
                                      ? `${selectedReport.identifiedUserId.firstName ?? ""} ${selectedReport.identifiedUserId.lastName ?? ""}`.trim() || "Reporter"
                                      : "Anonymous Reporter")
                                  : (t.performedBy && typeof t.performedBy === "object"
                                      ? `${t.performedBy.firstName ?? ""} ${t.performedBy.lastName ?? ""}`.trim() || "System"
                                      : (t.performedBy || "System"))}
                              </span>
                            </p>
                            {t.remarks && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-[11px] text-gray-600 italic">"{t.remarks}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-white sticky bottom-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  {!sentimentResults[selectedReport._id] && (
                    <button
                      onClick={() => triggerAnalysis("single", selectedReport._id, { salaysay: selectedReport.salaysay || selectedReport.incidentDescription, timestamp: selectedReport.submittedAt })}
                      disabled={analyzing}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {analyzing && selectedReportForAI === selectedReport._id
                        ? <RefreshCw size={18} className="animate-spin" />
                        : <Brain size={18} />}
                      {analyzing && selectedReportForAI === selectedReport._id ? "Analyzing..." : "AI Analyze Severity"}
                    </button>
                  )}

                  {/* Send Booking Link — only shown when caseStatus is "For Scheduling" */}
                  {selectedReport.caseStatus === "For Scheduling" && (
                    <button
                      onClick={() => handleSendBookingLink(selectedReport._id)}
                      disabled={isSendingBookingLink}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      {isSendingBookingLink
                        ? <RefreshCw size={18} className="animate-spin" />
                        : <Send size={18} />}
                      {isSendingBookingLink ? "Sending..." : "Send Booking Link"}
                    </button>
                  )}

                  {selectedReport.caseStatus === "For Interview" && (
                    <button onClick={() => setShowReferralModal(true)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
                      <Share2 size={18} /> Refer
                    </button>
                  )}
                  {!selectedReport.archived
                    ? <button onClick={() => setShowArchiveModal(true)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"><Archive size={18} /> Archive Report</button>
                    : <button onClick={() => setShowRestoreModal(true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"><RefreshCw size={18} /> Restore Report</button>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Case Status Modal ───────────────────────────────────────────────── */}
        {showCaseStatusModal && selectedReport && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"><Edit size={15} className="text-indigo-600" /></div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Update Case Status</h2>
                    <p className="text-xs text-gray-400">Select a status to apply to this case</p>
                  </div>
                </div>
                <button onClick={resetStatusModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Status picker */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Case Status</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-400 bg-white"
                    value={newCaseStatus}
                    onChange={(e) => { setNewCaseStatus(e.target.value); setShowExternalForm(false); }}
                  >
                    <option value="">Choose a case status</option>
                    <option value="For Queuing"    disabled={isStatusDisabled("For Queuing",    selectedReport?.caseStatus)}>For Queuing</option>
                    <option value="For Scheduling" disabled={isStatusDisabled("For Scheduling", selectedReport?.caseStatus)}>For Scheduling</option>
                    <option value="For Interview"  disabled>For Interview (auto — set when booking approved)</option>
                    <option value="For Referral"   disabled={isStatusDisabled("For Referral",   selectedReport?.caseStatus)}>For Referral</option>
                    <option value="Case Closed"    disabled={isStatusDisabled("Case Closed",    selectedReport?.caseStatus)}>Case Closed</option>
                  </select>

                  {newCaseStatus === "For Queuing" && (
                    <p className="mt-2 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 flex items-start gap-2">
                      <ClipboardList size={14} className="flex-shrink-0 mt-0.5" />
                      This places the case in the queue for admin review.
                    </p>
                  )}
                </div>

                {/* Referral type (For Referral only) */}
                {newCaseStatus === "For Referral" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Referral Type</label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-400 bg-white"
                        value={newReferralType} onChange={(e) => { setNewReferralType(e.target.value); setShowExternalForm(false); }}>
                        <option value="">Select type</option>
                        <option value="Internal">Internal</option>
                        <option value="External">External</option>
                      </select>
                    </div>

                    {newReferralType === "Internal" && (
                      <div className="space-y-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-700 mb-1 uppercase tracking-wider">Target Department</label>
                          <select value={referralDept} onChange={(e) => setReferralDept(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="">Select a department</option>
                            {["Legal Clinic","Guidance and Counseling","Medical Health Services","Gender and Development",
                              "Director's Office","Human Resources","Student Affairs"].map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-700 mb-1 uppercase tracking-wider">Internal Note</label>
                          <textarea placeholder="Instructions for the target department..." value={referralNote}
                            onChange={(e) => setReferralNote(e.target.value)}
                            className="w-full h-24 px-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                        </div>
                        {selectedReport.isAnonymous && (
                          <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" checked={referralRevealIdentity}
                                onChange={(e) => setReferralRevealIdentity(e.target.checked)}
                                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                              <span className="text-sm font-semibold text-gray-700">Reveal User Identity in System</span>
                            </label>
                            <div>
                              <label className="block text-[10px] font-bold text-indigo-700 mb-1 uppercase tracking-wider">Link Reporter to User Account</label>
                              <div className="relative">
                                <input type="text" placeholder="Search by User ID, Name, or Email..."
                                  value={reporterSearch} onChange={(e) => handleReporterSearch(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                {reporterSearchResults.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-white border border-indigo-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {reporterSearchResults.map((u) => (
                                      <button key={u._id} onClick={() => handleSelectReporter(u)}
                                        className="w-full px-3 py-2 text-left hover:bg-indigo-50 border-b border-indigo-100 last:border-b-0">
                                        <div className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                                        <div className="text-xs text-gray-500">{u.tupId} • {u.email}</div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Case Closed */}
                {newCaseStatus === "Case Closed" && (
                  <div className="space-y-4">
                    {selectedReport.isAnonymous && selectedReport.identifiedUserId ? (
                      <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><UserCheck size={16} className="text-green-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-green-900 mb-1">Identity Revealed</p>
                          <p className="text-xs text-green-700">
                            {selectedReport.identifiedUserId.firstName} {selectedReport.identifiedUserId.lastName}
                          </p>
                        </div>
                      </div>
                    ) : selectedReport.isAnonymous && (
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Case Closure Reason</label>
                        {[["successful", "Successful / Case Completed"], ["no_show", "User Did Not Come Through (No-Show)"]].map(([val, lbl]) => (
                          <label key={val} className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="caseClosureReason" value={val}
                              checked={caseClosureReason === val} onChange={(e) => setCaseClosureReason(e.target.value)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                            <span className="text-sm font-medium text-gray-700">{lbl}</span>
                          </label>
                        ))}
                        {caseClosureReason === "successful" && (
                          <div>
                            <label className="block text-[10px] font-bold text-indigo-700 mb-1 uppercase tracking-wider">Link Reporter to User Account (Required)</label>
                            <div className="relative">
                              <input ref={(el) => setReporterInputRef(el)} type="text"
                                placeholder="Search by User ID, Name, or Email..."
                                value={reporterSearch} onChange={(e) => handleReporterSearch(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                              {reporterSearchResults.length > 0 && (
                                <div className="fixed z-[9999] bg-white border border-indigo-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                                  style={{ top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}>
                                  {reporterSearchResults.map((u) => (
                                    <button key={u._id} onClick={() => handleSelectReporter(u)}
                                      className="w-full px-3 py-2 text-left hover:bg-indigo-50 border-b border-indigo-100 last:border-b-0">
                                      <div className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                                      <div className="text-xs text-gray-500">{u.tupId} • {u.email}</div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* External referral form */}
                {showExternalForm && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">School Info</span><div className="flex-1 h-px bg-gray-100" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        {[["referredBy","REFERRED BY"], ["position","POSITION"]].map(([k, lbl]) => (
                          <div key={k}>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">{lbl}</label>
                            <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
                              value={externalData[k]} onChange={(e) => setExternalData((p) => ({ ...p, [k]: e.target.value }))} />
                          </div>
                        ))}
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">SCHOOL NAME</label>
                          <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
                            value={externalData.schoolName} onChange={(e) => setExternalData((p) => ({ ...p, schoolName: e.target.value }))} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">DATE OF REFERRAL</label>
                          <input type="datetime-local" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
                            value={externalData.referralDate} onChange={(e) => setExternalData((p) => ({ ...p, referralDate: e.target.value }))} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">REASON FOR REFERRAL <span className="text-red-500">*</span></label>
                          <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 resize-none"
                            value={externalData.reason} onChange={(e) => setExternalData((p) => ({ ...p, reason: e.target.value }))} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">ACTIONS TAKEN BY SCHOOL</label>
                          <div className="flex flex-wrap gap-2">
                            {["Counseling","Parent Conference","Mediation","Incident Report Filed"].map((action) => (
                              <button key={action} type="button"
                                onClick={() => setExternalData((p) => ({ ...p, actionsTaken: p.actionsTaken.includes(action) ? p.actionsTaken.filter((a) => a !== action) : [...p.actionsTaken, action] }))}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${externalData.actionsTaken.includes(action) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-500"}`}>
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Case Context</span><div className="flex-1 h-px bg-gray-100" /></div>
                      <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 resize-none"
                        placeholder="Brief case summary..." value={externalData.caseSummary}
                        onChange={(e) => setExternalData((p) => ({ ...p, caseSummary: e.target.value }))} />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Barangay Details</span><div className="flex-1 h-px bg-gray-100" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        {[["barangayName","TARGET BARANGAY","col-span-2",true], ["barangayAddress","BARANGAY ADDRESS","col-span-2",false], ["receivingOfficer","RECEIVING OFFICER","",false]].map(([k, lbl, cls, req]) => (
                          <div key={k} className={cls}>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">{lbl}{req && <span className="text-red-500"> *</span>}</label>
                            <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
                              value={externalData[k]} onChange={(e) => setExternalData((p) => ({ ...p, [k]: e.target.value }))} />
                          </div>
                        ))}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">MODE</label>
                          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 bg-white"
                            value={externalData.endorsementMode} onChange={(e) => setExternalData((p) => ({ ...p, endorsementMode: e.target.value }))}>
                            <option value="">Select mode</option>
                            <option>Official Letter</option><option>Email</option><option>Walk-in</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Attachments</span><div className="flex-1 h-px bg-gray-100" /></div>
                      <div onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                        className={`relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl py-6 cursor-pointer transition-all ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50"}`}>
                        <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                          onChange={(e) => setExternalData((p) => ({ ...p, attachments: [...p.attachments, ...Array.from(e.target.files)] }))} />
                        <FileText className={`w-8 h-8 mb-2 ${isDragging ? "text-indigo-600" : "text-gray-300"}`} />
                        <p className={`text-xs font-bold pointer-events-none ${isDragging ? "text-indigo-700" : "text-gray-500"}`}>
                          {isDragging ? "Drop files now" : "Click or drag to upload"}
                        </p>
                      </div>
                      {externalData.attachments?.length > 0 && (
                        <div className="grid grid-cols-1 gap-2">
                          {externalData.attachments.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="flex items-center gap-2 truncate">
                                <FileText size={14} className="text-gray-400 flex-shrink-0" />
                                <span className="text-[11px] font-medium text-gray-700 truncate">{f.name}</span>
                              </div>
                              <button type="button"
                                onClick={() => setExternalData((p) => ({ ...p, attachments: p.attachments.filter((_, j) => j !== i) }))}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white text-gray-400 hover:text-red-500">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={resetStatusModal} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold">Cancel</button>
                {showExternalForm
                  ? <button onClick={handleExternalReferral}
                      disabled={!externalData.reason || !externalData.barangayName || isSubmittingReferral}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                      {isSubmittingReferral ? <><RefreshCw size={16} className="animate-spin" /> Submitting...</> : "Submit Referral"}
                    </button>
                  : <button
                      onClick={newReferralType === "Internal" ? handleAddReferral : handleUpdateCaseStatus}
                      disabled={!newCaseStatus || (newCaseStatus === "For Referral" && !newReferralType) || (newReferralType === "Internal" && !referralDept) || loading}
                      className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold">
                      {newReferralType === "Internal" ? "Submit Internal Referral" : "Update Status"}
                    </button>}
              </div>
            </div>
          </div>
        )}

        {/* ── Reporter Confirm Modal ──────────────────────────────────────────── */}
        {showReporterConfirm && selectedReporter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center"><UserCheck size={20} className="text-indigo-600" /></div>
                <h3 className="text-lg font-bold text-gray-900">Confirm Reporter Identification</h3>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4 space-y-1">
                <p className="text-sm font-semibold text-indigo-900 mb-2">Selected Reporter:</p>
                {[["Name", `${selectedReporter.firstName} ${selectedReporter.lastName}`],["TUPT ID", selectedReporter.tupId],["Email", selectedReporter.email]].map(([k, v]) => (
                  <p key={k} className="text-sm text-gray-700"><span className="font-medium">{k}:</span> {v}</p>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-6">This user will be linked as the reporter for case {selectedReport?.ticketNumber}.</p>
              <div className="flex gap-3">
                <button onClick={() => { setShowReporterConfirm(false); setSelectedReporter(null); }} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
                <button onClick={handleConfirmReporter} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Confirm & Link</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Internal Referral Modal ─────────────────────────────────────────── */}
        {showReferralModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
                  <div>
                    <h3 className="text-xl font-bold">Internal Referral</h3>
                    <p className="text-indigo-100 text-sm">Case #{selectedReport?.ticketNumber}</p>
                  </div>
                </div>
                <button onClick={() => setShowReferralModal(false)} className="p-2 hover:bg-white/20 rounded-xl"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0"><AlertCircle size={20} /></div>
                  <p className="text-xs text-blue-600 leading-relaxed">A PDF report will be automatically generated and sent to the reporter via chat.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><Users size={16} className="text-indigo-500" /> Target Department</label>
                    <select value={referralDept} onChange={(e) => setReferralDept(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="">Select a department</option>
                      {["Legal Clinic","Guidance and Counseling","Medical Health Services","Gender and Development","Director's Office","Human Resources","Student Affairs"].map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><FileText size={16} className="text-indigo-500" /> Referral Note</label>
                    <textarea placeholder="Provide specific details or instructions..." value={referralNote}
                      onChange={(e) => setReferralNote(e.target.value)}
                      className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                  </div>
                  {selectedReport?.isAnonymous && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={referralRevealIdentity} onChange={(e) => setReferralRevealIdentity(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                      <span className="text-sm font-semibold text-gray-700">Reveal User Identity</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button onClick={() => setShowReferralModal(false)} className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100">Cancel</button>
                <button onClick={handleAddReferral} disabled={!referralDept}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send size={18} /> Submit Referral
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── View Referral Modal ─────────────────────────────────────────────── */}
        {showViewReferralModal && selectedReferral && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl overflow-hidden border border-gray-100">
              <div className={`px-8 py-6 flex items-center justify-between text-white ${selectedReferral.referralType === "External" ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-indigo-600 to-blue-600"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    {selectedReferral.referralType === "External" ? <Shield size={24} /> : <Users size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Referral Details</h2>
                    <p className="text-white/80 text-sm font-medium uppercase tracking-wider">{selectedReferral.referralType} Referral</p>
                  </div>
                </div>
                <button onClick={() => setShowViewReferralModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {selectedReferral.referralType === "External" ? (
                  <>
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-4 bg-emerald-500 rounded-full" /><h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Barangay Information</h3></div>
                      <div className="grid grid-cols-1 gap-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                        {[["Target Barangay", selectedReferral.barangayName], ["Address", selectedReferral.barangayAddress || "N/A"]].map(([l, v]) => (
                          <div key={l}><span className="text-[10px] font-bold text-emerald-700 uppercase">{l}</span><p className="text-sm font-medium text-gray-900 mt-1">{v}</p></div>
                        ))}
                        <div className="grid grid-cols-2 gap-4">
                          {[["Receiving Officer", selectedReferral.receivingOfficer || "N/A"],["Endorsement Mode", selectedReferral.endorsementMode || "N/A"]].map(([l, v]) => (
                            <div key={l}><span className="text-[10px] font-bold text-emerald-700 uppercase">{l}</span><p className="text-sm font-medium text-gray-900 mt-1">{v}</p></div>
                          ))}
                        </div>
                      </div>
                    </section>
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-4 bg-teal-500 rounded-full" /><h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Reason & Actions</h3></div>
                      <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <div><span className="text-[10px] font-bold text-gray-400 uppercase">Reason</span><p className="text-sm text-gray-800 leading-relaxed mt-2">{selectedReferral.reason}</p></div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Actions Taken</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedReferral.actionsTaken?.map((a, i) => (
                              <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg shadow-sm">{a}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                    {selectedReferral.attachments?.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-4 bg-indigo-500 rounded-full" /><h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Attachments ({selectedReferral.attachments.length})</h3></div>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedReferral.attachments.map((f, i) => (
                            <a key={i} href={f.uri} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-colors group">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"><FileText size={18} /></div>
                                <div><p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{f.fileName}</p><p className="text-[10px] text-gray-500">Click to view</p></div>
                              </div>
                              <ExternalLink size={14} className="text-gray-400" />
                            </a>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                ) : (
                  <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4">
                    <div><span className="text-[10px] font-bold text-indigo-700 uppercase">Target Department</span><p className="text-lg font-bold text-gray-900 mt-2">{selectedReferral.department}</p></div>
                    <div><span className="text-[10px] font-bold text-indigo-700 uppercase">Internal Note</span><p className="text-sm text-gray-800 leading-relaxed mt-2 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">{selectedReferral.note || "No notes provided"}</p></div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Submission Date</span>
                  <span className="text-sm font-bold text-gray-900">{new Date(selectedReferral.date).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button onClick={handleDownloadReferralPDF} disabled={isDownloadingPDF}
                    className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50">
                    {isDownloadingPDF ? <RefreshCw size={16} className="animate-spin" /> : <FileDown size={18} className="text-gray-400" />} Report PDF
                  </button>
                  <button onClick={() => setShowViewReferralModal(false)} className="flex-1 sm:flex-none px-8 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Archive Modal ───────────────────────────────────────────────────── */}
        {showArchiveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm text-center overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Archive className="text-red-600" size={32} /></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Archive Report</h2>
                <p className="text-sm text-gray-500">This will move the report to the archived section.</p>
              </div>
              <div className="flex p-4 border-t border-gray-100 gap-3">
                <button onClick={() => setShowArchiveModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm">Cancel</button>
                <button onClick={handleArchive} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700">Archive</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Restore Modal ───────────────────────────────────────────────────── */}
        {showRestoreModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm text-center overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><RefreshCw className="text-green-600" size={32} /></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Restore Report</h2>
                <p className="text-sm text-gray-500">This will move the report back to active status.</p>
              </div>
              <div className="flex p-4 border-t border-gray-100 gap-3">
                <button onClick={() => setShowRestoreModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm">Cancel</button>
                <button onClick={handleRestore} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">Restore</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Bulk Analysis Bar ───────────────────────────────────────────────── */}
        {selectedReportIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] p-4 bg-white/95 backdrop-blur-md border border-indigo-100 rounded-2xl shadow-2xl flex items-center justify-between gap-6 w-[90%] max-w-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">{selectedReportIds.length}</div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-none mb-1">
                  {selectedReportIds.length === 1 ? "1 Report Selected" : `${selectedReportIds.length} Reports Selected`}
                </h3>
                <p className="text-xs text-gray-500">Analyze severity in bulk with AI.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerAnalysis("bulk")}
                disabled={analyzing}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <Brain size={14} className={analyzing ? "animate-pulse" : ""} />
                {analyzing ? "Analyzing..." : "Bulk Analyze"}
              </button>
              <button onClick={() => setSelectedReportIds([])} className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminReports;