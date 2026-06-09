import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';
import { getUserAnalytics } from '../../api/user';
import { getReportAnalytics } from '../../api/report';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';
import {
  Users, UserCheck, FileText, AlertTriangle, Shield,
  MessageSquare, Activity, TrendingUp, Clock, CheckCircle,
  AlertCircle, Bell, PieChart as PieChartIcon, Archive,
  Target, TrendingDown, BarChart3, Calendar, X, ChevronRight,
  Menu, LogOut, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import HeatmapTable from '../../components/HeatmapTable';
import NotificationCenter from '../../components/NotificationCenter';
import { getAllCalendarEvents } from '../../api/calendar';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [userData, setUserData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('userDept');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reports', 'comparison', 'heatmap'
  const [showNotification, setShowNotification] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [heatmapView, setHeatmapView] = useState('department');
  const [heatmapSubView, setHeatmapSubView] = useState('reporter'); // 'reporter', 'victim', 'witness'
  const [pendingCompletionEvents, setPendingCompletionEvents] = useState([]);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Detect native app (Capacitor APK)
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setTimeout(async () => {
      try {
        const sections = document.querySelectorAll('.pdf-section');
        if (!sections || sections.length === 0) return;

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        let isFirstPage = true;

        for (const section of sections) {
          const canvas = await html2canvas(section, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
          });
          const imgData = canvas.toDataURL('image/png');
          // Scale image to fit page width, preserve aspect ratio
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;

          if (!isFirstPage) pdf.addPage();
          isFirstPage = false;

          // If section is taller than one page, let it span Ã¢â‚¬â€ but each section
          // starts fresh on a new page so the cut never happens mid-table
          if (imgHeight <= pdfPageHeight) {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
          } else {
            // Very tall section: tile it down multiple pages
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfPageHeight;
            while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pdfPageHeight;
            }
          }
        }

        pdf.save(`ETALA_Overall_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsGeneratingPDF(false);
      }
    }, 2000); // Allow time for charts and heatmap tables to render
  };

  useEffect(() => {
    try {
      const platform = Capacitor.getPlatform();
      setIsNativeApp(platform === 'android' || platform === 'ios');
    } catch (e) {
      setIsNativeApp(false);
    }
  }, []);

  useEffect(() => {
    const checkPendingEvents = async () => {
      try {
        const res = await getAllCalendarEvents();
        if (res.success && Array.isArray(res.data)) {
          const now = new Date();

          const pending = res.data.filter(event => {
            const eventDate = new Date(event.start);
            const isPastOrToday = eventDate <= now || eventDate.toDateString() === now.toDateString();
            const isApplicableType = event.extendedProps?.type === 'program_event' || event.extendedProps?.type === 'consultation';
            const isNotCompleted = event.extendedProps?.status !== 'completed' && event.extendedProps?.status !== 'cancelled';
            return isPastOrToday && isApplicableType && isNotCompleted;
          });

          if (pending.length > 0) {
            setPendingCompletionEvents(pending);
            const hasBeenDismissed = sessionStorage.getItem('dismissed_completion_popup');
            if (!hasBeenDismissed) {
              setShowCompletionPopup(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking pending events:", error);
      }
    };
    checkPendingEvents();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userRes, reportRes] = await Promise.all([
          getUserAnalytics(),
          getReportAnalytics(selectedYear)
        ]);

        setUserData(userRes);
        setReportData(reportRes);

        // Show notification for new reports if they exist and we haven't notified yet this session
        const pendingCount = reportRes?.data?.overview?.pendingReportsCount || 0;
        const hasBeenNotified = sessionStorage.getItem('sa_notified');

        if (pendingCount > 0 && !hasBeenNotified) {
          setShowNotification(true);
          sessionStorage.setItem('sa_notified', 'true');
        }

      } catch (err) {
        console.error('Ã¢ÂÅ’ Error fetching analytics:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 text-center mb-2">Failed to Load Data</h3>
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract data from API response with fallbacks
  const reportAnalytics = reportData?.data || {};
  const reportOverview = reportAnalytics?.overview || {};
  const userAnalytics = userData?.data || userData || {};

  // User statistics
  const userOverview = userAnalytics?.overview || {};
  const userTypeData = userAnalytics?.userType
    ? Object.entries(userAnalytics.userType).map(([name, value]) => ({ name, value }))
    : [];
  const userDeptData = userAnalytics?.department
    ? Object.entries(userAnalytics.department).map(([name, value]) => ({ name, value }))
    : [];
  const userTrendData = userAnalytics?.trend?.months?.map((month, i) => ({
    month,
    users: userAnalytics?.trend?.counts?.[i] || 0
  })) || [];

  // Report statistics
  const totalReports = reportOverview.totalReports || 0;
  const activeReports = reportOverview.activeReports || 0;
  const archivedReports = reportOverview.archivedReports || 0;
  const severeReports = reportOverview.severeReports || 0;
  const moderateReports = reportOverview.moderateReports || 0;
  const mildReports = reportOverview.mildReports || 0;
  const pendingAnalysis = reportOverview.pendingAnalysis || 0;
  const avgResponseDays = reportOverview.avgResponseDays || 0;
  const resolutionRate = reportOverview.resolutionRate || 0;

  // Status data
  const statusData = reportAnalytics?.byStatus
    ? Object.entries(reportAnalytics.byStatus).map(([name, value]) => ({
      name,
      value,
      color: name === 'Case Closed' ? '#10b981' :
        name === 'For Interview' ? '#3b82f6' :
          name === 'For Appointment' ? '#8b5cf6' :
            name === 'For Referral' ? '#ec4899' :
              name === 'For Queuing' ? '#f59e0b' :
                name === 'Internal' ? '#8b5cf6' :
                  name === 'External' ? '#f97316' :
                    '#94a3b8'
    })).filter(item => item.value > 0)
    : [];

  // Severity data
  const severityData = reportAnalytics?.bySeverity
    ? Object.entries(reportAnalytics.bySeverity).map(([name, value]) => ({
      name,
      value,
      color: name === 'Severe' ? '#ef4444' :
        name === 'Moderate' ? '#f59e0b' :
          name === 'Mild' ? '#10b981' :
            '#94a3b8'
    })).filter(item => item.value > 0)
    : [];

  // Monthly trend data
  const monthlyTrendData = reportAnalytics?.monthlyTrend?.months?.map((month, i) => ({
    month,
    reports: reportAnalytics?.monthlyTrend?.counts?.[i] || 0,
    archived: reportAnalytics?.monthlyTrend?.archived?.[i] || 0
  })) || [];

  // Top departments
  const topDeptData = reportAnalytics?.topDepartments?.map((dept, index) => ({
    name: dept.name || `Department ${index + 1}`,
    value: dept.value || 0,
    fill: '#8b5cf6'
  })) || [];

  // Top incident types
  const topIncidentData = reportAnalytics?.topIncidentTypes?.map((type, index) => ({
    name: type.name || `Incident ${index + 1}`,
    value: type.value || 0,
    fill: '#3b82f6'
  })) || [];

  // Recent activity
  const recentReports = reportAnalytics?.recentActivity?.recentReports || [];
  const todayCount = reportAnalytics?.recentActivity?.todayCount || 0;
  const weekCount = reportAnalytics?.recentActivity?.weekCount || 0;

  // Performance metrics
  const performance = reportAnalytics?.performanceMetrics || {};
  const avgDailyReports = performance.avgDailyReports || 0;
  const peakMonth = performance.peakMonth || "N/A";
  const peakMonthCount = performance.peakMonthCount || 0;
  const agileTestData = [
    { name: 'Passed', value: 75, color: '#10b981' },
    { name: 'In Progress', value: 15, color: '#3b82f6' },
    { name: 'Pending Review', value: 8, color: '#f59e0b' },
    { name: 'Failed / Bugs', value: 2, color: '#ef4444' }
  ];

  // Formal Agile Dashboard Data
  const burndownData = [
    { day: 'Day 1', ideal: 120, actual: 120 },
    { day: 'Day 2', ideal: 108, actual: 115 },
    { day: 'Day 3', ideal: 96, actual: 100 },
    { day: 'Day 4', ideal: 84, actual: 80 },
    { day: 'Day 5', ideal: 72, actual: 75 },
    { day: 'Day 6', ideal: 60, actual: 50 },
    { day: 'Day 7', ideal: 48, actual: 45 },
    { day: 'Day 8', ideal: 36, actual: 30 },
    { day: 'Day 9', ideal: 24, actual: 20 },
    { day: 'Day 10', ideal: 12, actual: 5 },
    { day: 'Day 11', ideal: 0, actual: 0 },
  ];

  const coverageData = [
    { module: 'Authentication', coverage: 98, target: 95 },
    { module: 'Incident Reports', coverage: 95, target: 90 },
    { module: 'Data Heatmaps', coverage: 85, target: 90 },
    { module: 'Live Chat', coverage: 92, target: 85 },
    { module: 'Responsive UI', coverage: 78, target: 85 },
    { module: 'PDF Generation', coverage: 65, target: 80 },
  ];

  // =============================================
  // NATIVE MOBILE APP LAYOUT (Capacitor APK)
  // =============================================
  if (isNativeApp) {
    const displayName = user?.name || user?.firstName || 'Admin';
    const nativeTabs = [
      { id: 'overview', label: 'Overview', icon: Activity },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'comparison', label: 'Compare', icon: BarChart3 },
      { id: 'heatmap', label: 'Heatmap', icon: Target },
    ];

    return (
      <div className="bg-gray-50 min-h-screen native-admin-content relative">
        {/* Dark matching header background stripe behind stats cards for overlapping layout */}
        <div className="bg-gray-900 h-16 w-full absolute top-0 left-0 border-b border-gray-800 z-10 flex justify-end items-start pt-3 px-4">
           <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md"
            >
              <Download size={14} />
              {isGeneratingPDF ? 'Wait...' : 'Export PDF'}
            </button>
        </div>

        {/* ===== NATIVE STAT CARDS (Horizontal Scroll) ===== */}
        <div className="px-4 pt-3 relative z-20">
          <div className="flex gap-3 overflow-x-auto native-scroll-hide pb-2">
            {[
              { label: 'Total Reports', value: totalReports, sub: `${activeReports} active`, color: 'from-blue-500 to-blue-600', icon: FileText },
              { label: 'Active', value: activeReports, sub: `${todayCount} today`, color: 'from-emerald-500 to-emerald-600', icon: Activity },
              { label: 'Resolution', value: `${resolutionRate}%`, sub: `${avgResponseDays}d avg`, color: 'from-purple-500 to-purple-600', icon: Target },
              { label: 'Daily Avg', value: avgDailyReports, sub: `Peak: ${peakMonth}`, color: 'from-cyan-500 to-cyan-600', icon: TrendingUp },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`flex-shrink-0 w-36 bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white shadow-lg`}>
                  <Icon size={18} className="opacity-60 mb-2" />
                  <p className="text-2xl font-extrabold leading-none">{stat.value}</p>
                  <p className="text-xs font-medium opacity-90 mt-1">{stat.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{stat.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== NATIVE TAB CONTENT ===== */}
        <div className="px-4 mt-5 space-y-4">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Report Trends</h3>
                <div className="h-48">
                  {monthlyTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <AreaChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} width={30} />
                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                        <Area type="monotone" dataKey="reports" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} name="Reports" />
                        <Area type="monotone" dataKey="archived" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} name="Archived" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No trend data</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Case Status</h3>
                <div className="h-52">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" outerRadius={65} innerRadius={35} dataKey="value" paddingAngle={2}>
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No status data</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-800">Recent Reports</h3>
                  <div className="flex gap-2 text-[10px]">
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">{todayCount} today</span>
                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">{weekCount} this week</span>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentReports.length > 0 ? recentReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl native-press">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{report.ticketNumber}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            report.caseStatus === 'Case Closed' ? 'bg-green-100 text-green-700' :
                            report.caseStatus === 'For Interview' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>{report.caseStatus || 'Pending'}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{new Date(report.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  )) : (
                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No recent reports</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Top Departments</h3>
                <div className="h-56">
                  {topDeptData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={topDeptData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                        <Bar dataKey="value" fill="#7c3aed" radius={[0, 6, 6, 0]} name="Reports" barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No department data</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Severity Levels</h3>
                <div className="h-52">
                  {severityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie data={severityData} cx="50%" cy="50%" outerRadius={65} innerRadius={35} dataKey="value" paddingAngle={2}>
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No severity data</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50 rounded-2xl p-3 border border-red-100 text-center">
                  <p className="text-xl font-extrabold text-red-600">{severeReports}</p>
                  <p className="text-[10px] font-bold text-red-500 uppercase mt-1">Severe</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 text-center">
                  <p className="text-xl font-extrabold text-amber-600">{moderateReports}</p>
                  <p className="text-[10px] font-bold text-amber-500 uppercase mt-1">Moderate</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 text-center">
                  <p className="text-xl font-extrabold text-emerald-600">{mildReports}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Mild</p>
                </div>
              </div>
            </div>
          )}

          {/* COMPARISON TAB */}
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3">User Registration</h3>
                <div className="h-48">
                  {userTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <LineChart data={userTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} width={30} />
                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                        <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Users" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No user trend data</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3">User Types</h3>
                <div className="h-48">
                  {userTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={userTypeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} width={30} />
                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Users" barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No user type data</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <Users size={18} className="text-blue-400 mb-1" />
                  <p className="text-xl font-extrabold text-blue-700">{userOverview.totalUsers || 0}</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase mt-0.5">Total Users</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                  <UserCheck size={18} className="text-green-400 mb-1" />
                  <p className="text-xl font-extrabold text-green-700">{userOverview.activeUsers || 0}</p>
                  <p className="text-[10px] font-bold text-green-500 uppercase mt-0.5">Active Users</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                  <TrendingUp size={18} className="text-purple-400 mb-1" />
                  <p className="text-xl font-extrabold text-purple-700">
                    {monthlyTrendData.length > 1
                      ? `${(((monthlyTrendData[monthlyTrendData.length - 1]?.reports || 0) - (monthlyTrendData[0]?.reports || 0)) / (monthlyTrendData[0]?.reports || 1) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                  <p className="text-[10px] font-bold text-purple-500 uppercase mt-0.5">Report Growth</p>
                </div>
                <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100">
                  <BarChart3 size={18} className="text-cyan-400 mb-1" />
                  <p className="text-xl font-extrabold text-cyan-700">{avgDailyReports}</p>
                  <p className="text-[10px] font-bold text-cyan-500 uppercase mt-0.5">Avg Daily</p>
                </div>
              </div>
            </div>
          )}

          {/* HEATMAP TAB */}
          {activeTab === 'heatmap' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">View</label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    {[
                      { id: 'department', label: 'Dept' },
                      { id: 'gender_role', label: 'Gender/Role' },
                      { id: 'gender_month', label: 'Gender/Month' },
                    ].map(v => (
                      <button
                        key={v.id}
                        onClick={() => setHeatmapView(v.id)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                          heatmapView === v.id ? 'bg-violet-600 text-white shadow-md' : 'text-gray-500'
                        }`}
                      >{v.label}</button>
                    ))}
                  </div>
                </div>

                {heatmapView === 'gender_month' && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Whose Gender?</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      {['reporter', 'victim', 'witness', 'mandatory'].map(r => (
                        <button
                          key={r}
                          onClick={() => setHeatmapSubView(r)}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all duration-200 capitalize ${
                            heatmapSubView === r ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-500'
                          }`}
                        >{r}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full bg-gray-100 border-0 text-gray-900 text-sm font-bold rounded-xl p-3 focus:ring-2 focus:ring-violet-500"
                  >
                    {[0, 1, 2, 3].map(offset => {
                      const year = new Date().getFullYear() - offset;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 overflow-x-auto">
                {heatmapView === 'department' && reportAnalytics?.heatmaps?.deptVsMonth && (
                  <HeatmapTable title="Dept \u00d7 Month" subtitle={`${selectedYear}`} rows={reportAnalytics.heatmaps.deptVsMonth.rows} columns={reportAnalytics.heatmaps.deptVsMonth.columns} data={reportAnalytics.heatmaps.deptVsMonth.data} rowLabel="Department" columnLabel="Month" colorScheme="teal" />
                )}
                {heatmapView === 'gender_role' && reportAnalytics?.heatmaps?.genderVsRole && (
                  <HeatmapTable title="Gender \u00d7 Role" subtitle={`${selectedYear}`} rows={reportAnalytics.heatmaps.genderVsRole.rows} columns={reportAnalytics.heatmaps.genderVsRole.columns} data={reportAnalytics.heatmaps.genderVsRole.data} rowLabel="Gender" columnLabel="Role" colorScheme="vibrant" />
                )}
                {heatmapView === 'gender_month' && (
                  <>
                    {heatmapSubView === 'reporter' && reportAnalytics?.heatmaps?.reporterGenderVsMonth && (
                      <HeatmapTable title="Reporter Gender \u00d7 Month" subtitle={`${selectedYear}`} rows={reportAnalytics.heatmaps.reporterGenderVsMonth.rows} columns={reportAnalytics.heatmaps.reporterGenderVsMonth.columns} data={reportAnalytics.heatmaps.reporterGenderVsMonth.data} rowLabel="Gender" columnLabel="Month" colorScheme="indigo" />
                    )}
                    {heatmapSubView === 'victim' && reportAnalytics?.heatmaps?.victimGenderVsMonth && (
                      <HeatmapTable title="Victim Gender \u00d7 Month" subtitle={`${selectedYear}`} rows={reportAnalytics.heatmaps.victimGenderVsMonth.rows} columns={reportAnalytics.heatmaps.victimGenderVsMonth.columns} data={reportAnalytics.heatmaps.victimGenderVsMonth.data} rowLabel="Gender" columnLabel="Month" colorScheme="rose" />
                    )}
                    {heatmapSubView === 'witness' && reportAnalytics?.heatmaps?.witnessGenderVsMonth && (
                      <HeatmapTable title="Witness Gender \u00d7 Month" subtitle={`${selectedYear}`} rows={reportAnalytics.heatmaps.witnessGenderVsMonth.rows} columns={reportAnalytics.heatmaps.witnessGenderVsMonth.columns} data={reportAnalytics.heatmaps.witnessGenderVsMonth.data} rowLabel="Gender" columnLabel="Month" colorScheme="amber" />
                    )}
                    {heatmapSubView === 'mandatory' && reportAnalytics?.heatmaps?.mandatoryReporterGenderVsMonth && (
                      <HeatmapTable title="Mandatory Reporter Gender \u00d7 Month" subtitle={`${selectedYear}`} rows={reportAnalytics.heatmaps.mandatoryReporterGenderVsMonth.rows} columns={reportAnalytics.heatmaps.mandatoryReporterGenderVsMonth.columns} data={reportAnalytics.heatmaps.mandatoryReporterGenderVsMonth.data} rowLabel="Gender" columnLabel="Month" colorScheme="teal" />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== NATIVE BOTTOM TAB BAR ===== */}
        <div className="native-admin-tab-bar">
          <div className="flex items-center justify-around px-2 pt-2 pb-1">
            {nativeTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-200 ${
                    isActive ? 'bg-violet-100 text-violet-700' : 'text-gray-400'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] font-bold ${isActive ? 'text-violet-700' : 'text-gray-400'}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Modal (native) */}
        {showNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white text-center relative">
                <div className="absolute top-4 right-4 text-white/50" onClick={() => setShowNotification(false)}><X className="w-6 h-6" /></div>
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 animate-bounce" />
                </div>
                <h2 className="text-xl font-bold">New Reports!</h2>
                <p className="text-red-100 text-sm">Reports need your review.</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-5 text-sm">
                  <span className="font-bold text-red-600 text-lg">{reportAnalytics?.overview?.pendingReportsCount || 0}</span> pending report{(reportAnalytics?.overview?.pendingReportsCount || 0) > 1 ? 's' : ''}
                </p>
                <button onClick={() => { setShowNotification(false); navigate('/superadmin/reports'); }} className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold active:bg-red-700 mb-2">Review Now</button>
                <button onClick={() => setShowNotification(false)} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium active:bg-gray-200">Later</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =============================================
  // WEB LAYOUT (unchanged below)
  // =============================================
  return (
    <div className="content-container py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
            <p className="text-blue-100 text-sm">Comprehensive analytics and insights</p>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50"
            >
              <Download size={18} />
              {isGeneratingPDF ? 'Generating...' : 'Download Report'}
            </button>
            <Calendar className="w-6 h-6" />
            <span className="text-sm">{new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div className="sm:hidden text-right">
            <p className="text-sm font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            <p className="text-xs text-blue-200">{new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm ${activeTab === 'overview'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm ${activeTab === 'reports'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm ${activeTab === 'comparison'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Comparison
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm ${activeTab === 'heatmap'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Heatmap
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Reports */}
            <div className="bg-white rounded-lg shadow border p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalReports}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeReports} active Ã¢â‚¬Â¢ {archivedReports} archived
                  </p>
                </div>
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 opacity-20" />
              </div>
            </div>

            {/* Active Reports */}
            <div className="bg-white rounded-lg shadow border p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active Reports</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{activeReports}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {todayCount} today Ã¢â‚¬Â¢ {weekCount} this week
                  </p>
                </div>
                <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 opacity-20" />
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="bg-white rounded-lg shadow border p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Resolution Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">{resolutionRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg response: {avgResponseDays} days
                  </p>
                </div>
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 opacity-20" />
              </div>
            </div>

            {/* Daily Average */}
            <div className="bg-white rounded-lg shadow border p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Daily Average</p>
                  <p className="text-2xl sm:text-3xl font-bold text-cyan-600">{avgDailyReports}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Peak: {peakMonthCount} in {peakMonth}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Monthly Trend */}
            <div className="bg-white rounded-lg shadow border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Report Trends (Last 6 Months)</h3>
              <div className="h-48 sm:h-64">
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="reports"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        name="Total Reports"
                      />
                      <Area
                        type="monotone"
                        dataKey="archived"
                        stroke="#94a3b8"
                        fill="#94a3b8"
                        fillOpacity={0.2}
                        name="Archived Reports"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No trend data available
                  </div>
                )}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Case Status Distribution</h3>
              <div className="h-48 sm:h-64">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No status data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Recent Reports Activity</h3>
              <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                <span className="text-gray-600">
                  <Bell className="inline w-4 h-4 mr-1" />
                  Today: {todayCount} reports
                </span>
                <span className="text-gray-600">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  This week: {weekCount} reports
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentReports.length > 0 ? (
                recentReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{report.ticketNumber}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${report.caseStatus === 'Case Closed' ? 'bg-green-100 text-green-800' :
                            report.caseStatus === 'For Interview' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {report.caseStatus || 'Pending'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Submitted: {new Date(report.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  No recent reports found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Department Analysis */}
          <div className="grid grid-cols-1 gap-6">
            {/* Top Departments */}
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Top Reporting Departments</h3>
                <BarChart3 className="w-5 h-5 text-gray-500" />
              </div>
              <div className="h-80">
                {topDeptData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={topDeptData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        name="Reports"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No department data available
                  </div>
                )}
              </div>
            </div>


          </div>

          {/* Severity Analysis */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-4">Severity Level Analysis</h3>
            <div className="h-64">
              {severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No severity data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* User vs Report Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Registration Trend */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold mb-4">User Registration Trend</h3>
              <div className="h-64">
                {userTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={userTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="New Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No user trend data available
                  </div>
                )}
              </div>
            </div>

            {/* User Type Distribution */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold mb-4">User Type Distribution</h3>
              <div className="h-64">
                {userTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={userTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        name="Users"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No user type data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-blue-700">{userOverview.totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-30" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-green-700">{userOverview.activeUsers || 0}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500 opacity-30" />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Report Growth</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {monthlyTrendData.length > 1
                      ? `${(((monthlyTrendData[monthlyTrendData.length - 1]?.reports || 0) - (monthlyTrendData[0]?.reports || 0)) / (monthlyTrendData[0]?.reports || 1) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500 opacity-30" />
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-700 font-medium">Avg. Daily Reports</p>
                  <p className="text-2xl font-bold text-cyan-700">{avgDailyReports}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-cyan-500 opacity-30" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'heatmap' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-3 md:p-8 rounded-xl md:rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 mb-6 md:mb-10">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Heatmap Analysis</h2>
                <p className="text-gray-500 text-lg leading-relaxed">
                  Visualize the concentration of incident reports across departments, roles, and time periods.
                  <span className="font-semibold text-violet-600 ml-1">Darker cells represent higher activity.</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">View Perspective</label>
                  <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                    <button
                      onClick={() => setHeatmapView('department')}
                      className={`py-2 px-4 rounded-xl text-[10px] font-black transition-all duration-300 ${heatmapView === 'department' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                      DEPT
                    </button>
                    <button
                      onClick={() => setHeatmapView('gender_role')}
                      className={`py-2 px-4 rounded-xl text-[10px] font-black transition-all duration-300 ${heatmapView === 'gender_role' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                      GENDER/ROLE
                    </button>
                    <button
                      onClick={() => setHeatmapView('gender_month')}
                      className={`py-2 px-4 rounded-xl text-[10px] font-black transition-all duration-300 ${heatmapView === 'gender_month' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                      GENDER/MONTH
                    </button>
                  </div>
                </div>

                {heatmapView === 'gender_month' && (
                  <div className="flex flex-col gap-1.5 animate-in slide-in-from-left-2 duration-300">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Whose Gender?</label>
                    <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                      {[
                        { id: 'reporter', label: 'Reporter' },
                        { id: 'victim', label: 'Victim' },
                        { id: 'witness', label: 'Witness' },
                        { id: 'mandatory', label: 'Mandatory' }
                      ].map((role) => (
                        <button
                          key={role.id}
                          onClick={() => setHeatmapSubView(role.id)}
                          className={`py-2 px-4 rounded-xl text-[10px] font-black transition-all duration-300 uppercase ${heatmapSubView === role.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="w-px h-10 bg-gray-200 hidden sm:block" />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 shadow-sm hover:border-violet-300 transition-all cursor-pointer min-w-[120px]"
                  >
                    {[0, 1, 2, 3].map(offset => {
                      const year = new Date().getFullYear() - offset;
                      return <option key={year} value={year}>{year}</option>
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              {heatmapView === 'department' && reportAnalytics?.heatmaps?.deptVsMonth && (
                <HeatmapTable
                  title="Monthly Report Volume by Department"
                  subtitle={`Tracking incident distribution across campus departments for ${selectedYear}`}
                  rows={reportAnalytics.heatmaps.deptVsMonth.rows}
                  columns={reportAnalytics.heatmaps.deptVsMonth.columns}
                  data={reportAnalytics.heatmaps.deptVsMonth.data}
                  rowLabel="Department"
                  columnLabel="Month"
                  colorScheme="teal"
                />
              )}

              {heatmapView === 'gender_role' && reportAnalytics?.heatmaps?.genderVsRole && (
                <HeatmapTable
                  title="Incident Distribution by Gender & Role"
                  subtitle={`Analyzing reporter perspectives across different gender identities for ${selectedYear}`}
                  rows={reportAnalytics.heatmaps.genderVsRole.rows}
                  columns={reportAnalytics.heatmaps.genderVsRole.columns}
                  data={reportAnalytics.heatmaps.genderVsRole.data}
                  rowLabel="Gender"
                  columnLabel="Role"
                  colorScheme="vibrant"
                />
              )}

              {heatmapView === 'gender_month' && (
                <>
                  {heatmapSubView === 'reporter' && reportAnalytics?.heatmaps?.reporterGenderVsMonth && (
                    <HeatmapTable
                      title="General Reporter Gender Distribution by Month"
                      subtitle={`Monthly breakdown of all reporters' gender identities for ${selectedYear}`}
                      rows={reportAnalytics.heatmaps.reporterGenderVsMonth.rows}
                      columns={reportAnalytics.heatmaps.reporterGenderVsMonth.columns}
                      data={reportAnalytics.heatmaps.reporterGenderVsMonth.data}
                      rowLabel="Gender"
                      columnLabel="Month"
                      colorScheme="indigo"
                    />
                  )}
                  {heatmapSubView === 'victim' && reportAnalytics?.heatmaps?.victimGenderVsMonth && (
                    <HeatmapTable
                      title="Victim Gender Distribution by Month"
                      subtitle={`Monthly breakdown of victims' gender identities for ${selectedYear}`}
                      rows={reportAnalytics.heatmaps.victimGenderVsMonth.rows}
                      columns={reportAnalytics.heatmaps.victimGenderVsMonth.columns}
                      data={reportAnalytics.heatmaps.victimGenderVsMonth.data}
                      rowLabel="Gender"
                      columnLabel="Month"
                      colorScheme="rose"
                    />
                  )}
                  {heatmapSubView === 'witness' && reportAnalytics?.heatmaps?.witnessGenderVsMonth && (
                    <HeatmapTable
                      title="Witness Gender Distribution by Month"
                      subtitle={`Monthly breakdown of witnesses' gender identities for ${selectedYear}`}
                      rows={reportAnalytics.heatmaps.witnessGenderVsMonth.rows}
                      columns={reportAnalytics.heatmaps.witnessGenderVsMonth.columns}
                      data={reportAnalytics.heatmaps.witnessGenderVsMonth.data}
                      rowLabel="Gender"
                      columnLabel="Month"
                      colorScheme="amber"
                    />
                  )}
                  {heatmapSubView === 'mandatory' && reportAnalytics?.heatmaps?.mandatoryReporterGenderVsMonth && (
                    <HeatmapTable
                      title="Mandatory Reporter Gender Distribution by Month"
                      subtitle={`Monthly breakdown of mandatory reporters' gender identities for ${selectedYear}`}
                      rows={reportAnalytics.heatmaps.mandatoryReporterGenderVsMonth.rows}
                      columns={reportAnalytics.heatmaps.mandatoryReporterGenderVsMonth.columns}
                      data={reportAnalytics.heatmaps.mandatoryReporterGenderVsMonth.data}
                      rowLabel="Gender"
                      columnLabel="Month"
                      colorScheme="teal"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Report Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white text-center relative">
              <div className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer" onClick={() => setShowNotification(false)}>
                <X className="w-6 h-6" />
              </div>
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold">New Reports!</h2>
              <p className="text-red-100">There are new reports that require your review.</p>
            </div>

            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                There are <span className="font-bold text-red-600 text-lg">{reportAnalytics?.overview?.pendingReportsCount || 0}</span> pending report{(reportAnalytics?.overview?.pendingReportsCount || 0) > 1 ? 's' : ''} in the system.
              </p>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setShowNotification(false);
                    navigate('/superadmin/reports');
                  }}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-100 border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
                >
                  Review Now
                </button>
                <button
                  onClick={() => setShowNotification(false)}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden PDF Report Ã¢â‚¬â€ each .pdf-section is captured as one PDF page */}
      {isGeneratingPDF && (
        <div className="absolute top-0 left-[-9999px] w-[1000px] font-sans">

          {/* PAGE 1 â€” Header + Overview */}
          <div className="pdf-section bg-white p-6 text-gray-800">
            <div className="text-center pb-3 border-b-2 border-gray-200 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">ETALA Overall Analytics Report</h1>
              <p className="text-gray-500 mt-1 text-sm">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <h2 className="text-xl font-bold text-gray-800 border-b pb-1 mb-3">1. Overview</h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{totalReports}</p>
                <p className="text-xs text-gray-500">{activeReports} active</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs font-semibold text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{resolutionRate}%</p>
                <p className="text-xs text-gray-500">{avgResponseDays}d avg response</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <p className="text-xs font-semibold text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{userOverview.totalUsers || 0}</p>
                <p className="text-xs text-gray-500">{userOverview.activeUsers || 0} active</p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                <p className="text-xs font-semibold text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold text-cyan-600 mt-1">{avgDailyReports}</p>
                <p className="text-xs text-gray-500">Peak: {peakMonth}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border rounded-xl p-4">
                <h3 className="text-base font-bold mb-2">Case Status</h3>
                <div className="flex items-center justify-center">
                  <PieChart width={400} height={220}>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={75} dataKey="value" isAnimationActive={false}>
                      {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </div>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <h3 className="text-base font-bold mb-2">Severity Levels</h3>
                <div className="flex items-center justify-center">
                  <PieChart width={400} height={220}>
                    <Pie data={severityData} cx="50%" cy="50%" outerRadius={75} dataKey="value" isAnimationActive={false}>
                      {severityData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE 2 â€” Trends & Demographics */}
          <div className="pdf-section bg-white p-6 text-gray-800">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-1 mb-3">2. Trends &amp; Demographics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="bg-white border rounded-xl p-5">
                <h3 className="text-base font-bold mb-3">Report Monthly Trends</h3>
                <AreaChart width={430} height={220} data={monthlyTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={25} />
                  <Area type="monotone" dataKey="reports" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} isAnimationActive={false} />
                </AreaChart>
              </div>
              <div className="bg-white border rounded-xl p-5">
                <h3 className="text-base font-bold mb-3">Top Reporting Departments</h3>
                <BarChart width={430} height={220} data={topDeptData} margin={{ top: 5, right: 10, left: 0, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-40} textAnchor="end" interval={0} tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} width={25} />
                  <Bar dataKey="value" fill="#8b5cf6" isAnimationActive={false} />
                </BarChart>
              </div>
            </div>
          </div>

          {/* PAGE 3 â€” Heatmap: Dept x Month + Gender x Role */}
          <div className="pdf-section bg-white p-6 text-gray-800">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-1 mb-3">3. Heatmap Analysis</h2>

            {reportAnalytics?.heatmaps?.deptVsMonth && (
              <div className="mb-5">
                <h3 className="text-base font-bold mb-1">Monthly Report Volume by Department</h3>
                <p className="text-xs text-gray-500 mb-2">Tracking incident distribution across campus departments for {selectedYear}</p>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #e5e7eb', padding: '5px 10px', background: '#f9fafb', textAlign: 'left', fontWeight: 700 }}>Department</th>
                      {reportAnalytics.heatmaps.deptVsMonth.columns.map((col, ci) => (
                        <th key={ci} style={{ border: '1px solid #e5e7eb', padding: '5px 6px', background: '#f9fafb', textAlign: 'center', fontWeight: 700 }}>{col}</th>
                      ))}
                      <th style={{ border: '1px solid #e5e7eb', padding: '5px 6px', background: '#f3f4f6', textAlign: 'center', fontWeight: 700 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const hm = reportAnalytics.heatmaps.deptVsMonth;
                      const allVals = Object.values(hm.data).flatMap(r => Object.values(r || {}));
                      const maxVal = Math.max(...allVals.filter(v => v > 0), 1);
                      return hm.rows.map((row, ri) => {
                        const rowObj = hm.data[row] || {};
                        const rowTotal = hm.columns.reduce((a, col) => a + (rowObj[col] || 0), 0);
                        return (
                          <tr key={ri}>
                            <td style={{ border: '1px solid #e5e7eb', padding: '5px 10px', fontWeight: 600, background: '#f9fafb' }}>{row}</td>
                            {hm.columns.map((col, ci) => {
                              const val = rowObj[col] || 0;
                              const intensity = val ? Math.round((val / maxVal) * 100) : 0;
                              const bg = val ? `rgba(20,184,166,${0.1 + intensity / 130})` : '#f9fafb';
                              return <td key={ci} style={{ border: '1px solid #e5e7eb', padding: '5px 6px', textAlign: 'center', background: bg, color: intensity > 60 ? '#fff' : '#374151', fontWeight: val ? 600 : 400 }}>{val}</td>;
                            })}
                            <td style={{ border: '1px solid #e5e7eb', padding: '5px 6px', textAlign: 'center', background: '#f3f4f6', fontWeight: 700 }}>{rowTotal}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: 16 }} />

            {reportAnalytics?.heatmaps?.genderVsRole && (
              <div>
                <h3 className="text-base font-bold mb-1">Incident Distribution by Gender &amp; Role</h3>
                <p className="text-xs text-gray-500 mb-2">Analyzing reporter perspectives across different gender identities for {selectedYear}</p>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #e5e7eb', padding: '5px 10px', background: '#f9fafb', textAlign: 'left', fontWeight: 700 }}>Gender</th>
                      {reportAnalytics.heatmaps.genderVsRole.columns.map((col, ci) => (
                        <th key={ci} style={{ border: '1px solid #e5e7eb', padding: '5px 6px', background: '#f9fafb', textAlign: 'center', fontWeight: 700 }}>{col}</th>
                      ))}
                      <th style={{ border: '1px solid #e5e7eb', padding: '5px 6px', background: '#f3f4f6', textAlign: 'center', fontWeight: 700 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const hm = reportAnalytics.heatmaps.genderVsRole;
                      const allVals = Object.values(hm.data).flatMap(r => Object.values(r || {}));
                      const maxVal = Math.max(...allVals.filter(v => v > 0), 1);
                      return hm.rows.map((row, ri) => {
                        const rowObj = hm.data[row] || {};
                        const rowTotal = hm.columns.reduce((a, col) => a + (rowObj[col] || 0), 0);
                        return (
                          <tr key={ri}>
                            <td style={{ border: '1px solid #e5e7eb', padding: '5px 10px', fontWeight: 600, background: '#f9fafb' }}>{row}</td>
                            {hm.columns.map((col, ci) => {
                              const val = rowObj[col] || 0;
                              const intensity = val ? Math.round((val / maxVal) * 100) : 0;
                              const bg = val ? `rgba(139,92,246,${0.1 + intensity / 130})` : '#f9fafb';
                              return <td key={ci} style={{ border: '1px solid #e5e7eb', padding: '5px 6px', textAlign: 'center', background: bg, color: intensity > 60 ? '#fff' : '#374151', fontWeight: val ? 600 : 400 }}>{val}</td>;
                            })}
                            <td style={{ border: '1px solid #e5e7eb', padding: '5px 6px', textAlign: 'center', background: '#f3f4f6', fontWeight: 700 }}>{rowTotal}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAGE 4 â€” Heatmap: Reporter Gender x Month + End of Report */}
          {reportAnalytics?.heatmaps?.reporterGenderVsMonth && (
            <div className="pdf-section bg-white p-6 text-gray-800">
              <h3 className="text-base font-bold mb-1">Reporter Gender Distribution by Month</h3>
              <p className="text-xs text-gray-500 mb-2">Monthly breakdown of all reporters' gender identities for {selectedYear}</p>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #e5e7eb', padding: '5px 10px', background: '#f9fafb', textAlign: 'left', fontWeight: 700 }}>Gender</th>
                    {reportAnalytics.heatmaps.reporterGenderVsMonth.columns.map((col, ci) => (
                      <th key={ci} style={{ border: '1px solid #e5e7eb', padding: '5px 6px', background: '#f9fafb', textAlign: 'center', fontWeight: 700 }}>{col}</th>
                    ))}
                    <th style={{ border: '1px solid #e5e7eb', padding: '5px 6px', background: '#f3f4f6', textAlign: 'center', fontWeight: 700 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const hm = reportAnalytics.heatmaps.reporterGenderVsMonth;
                    const allVals = Object.values(hm.data).flatMap(r => Object.values(r || {}));
                    const maxVal = Math.max(...allVals.filter(v => v > 0), 1);
                    return hm.rows.map((row, ri) => {
                      const rowObj = hm.data[row] || {};
                      const rowTotal = hm.columns.reduce((a, col) => a + (rowObj[col] || 0), 0);
                      return (
                        <tr key={ri}>
                          <td style={{ border: '1px solid #e5e7eb', padding: '5px 10px', fontWeight: 600, background: '#f9fafb' }}>{row}</td>
                          {hm.columns.map((col, ci) => {
                            const val = rowObj[col] || 0;
                            const intensity = val ? Math.round((val / maxVal) * 100) : 0;
                            const bg = val ? `rgba(99,102,241,${0.1 + intensity / 130})` : '#f9fafb';
                            return <td key={ci} style={{ border: '1px solid #e5e7eb', padding: '5px 6px', textAlign: 'center', background: bg, color: intensity > 60 ? '#fff' : '#374151', fontWeight: val ? 600 : 400 }}>{val}</td>;
                          })}
                          <td style={{ border: '1px solid #e5e7eb', padding: '5px 6px', textAlign: 'center', background: '#f3f4f6', fontWeight: 700 }}>{rowTotal}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
              <div className="text-center pt-6 text-gray-400 text-sm">
                <p>End of Report</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboard;

