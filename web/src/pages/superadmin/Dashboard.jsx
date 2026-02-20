import React, { useState, useEffect } from 'react';
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
  Target, TrendingDown, BarChart3, Calendar
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('userDept');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reports', 'comparison'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [userRes, reportRes] = await Promise.all([
          getUserAnalytics(),
          getReportAnalytics()
        ]);
        
        console.log('🔍 User Data:', userRes);
        console.log('🔍 Report Data:', reportRes);
        
        setUserData(userRes);
        setReportData(reportRes);
        
      } catch (err) {
        console.error('❌ Error fetching analytics:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
  const peakMonth = performance.peakMonth || 'N/A';
  const peakMonthCount = performance.peakMonthCount || 0;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-blue-100">Comprehensive analytics and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <Calendar className="w-6 h-6" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${activeTab === 'overview' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-medium ${activeTab === 'reports' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Reports Analytics
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 font-medium ${activeTab === 'comparison' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Comparison
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Reports */}
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-3xl font-bold text-blue-600">{totalReports}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeReports} active • {archivedReports} archived
                  </p>
                </div>
                <FileText className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </div>

            {/* Active Reports */}
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Reports</p>
                  <p className="text-3xl font-bold text-green-600">{activeReports}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {todayCount} today • {weekCount} this week
                  </p>
                </div>
                <Activity className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolution Rate</p>
                  <p className="text-3xl font-bold text-purple-600">{resolutionRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg response: {avgResponseDays} days
                  </p>
                </div>
                <Target className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </div>

            {/* Daily Average */}
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Daily Average</p>
                  <p className="text-3xl font-bold text-cyan-600">{avgDailyReports}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Peak: {peakMonthCount} in {peakMonth}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-cyan-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold mb-4">Report Trends (Last 6 Months)</h3>
              <div className="h-64">
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
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
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold mb-4">Case Status Distribution</h3>
              <div className="h-64">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
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
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Reports Activity</h3>
              <div className="flex space-x-4 text-sm">
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
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{report.ticketNumber}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          report.caseStatus === 'Case Closed' ? 'bg-green-100 text-green-800' :
                          report.caseStatus === 'For Interview' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.caseStatus || 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{report.incidentDescription}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className={`font-medium ${
                          report.severity === 'Severe' ? 'text-red-600' :
                          report.severity === 'Moderate' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          Severity: {report.severity || 'Unanalyzed'}
                        </span>
                        <span>Submitted: {new Date(report.submittedAt).toLocaleDateString()}</span>
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
          {/* Department & Incident Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Departments */}
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Top Reporting Departments</h3>
                <BarChart3 className="w-5 h-5 text-gray-500" />
              </div>
              <div className="h-80">
                {topDeptData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
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

            {/* Top Incident Types */}
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Top Incident Types</h3>
                <AlertTriangle className="w-5 h-5 text-gray-500" />
              </div>
              <div className="h-80">
                {topIncidentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topIncidentData}>
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
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                        name="Incidents"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No incident type data available
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
                <ResponsiveContainer width="100%" height="100%">
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
                  <ResponsiveContainer width="100%" height="100%">
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
                  <ResponsiveContainer width="100%" height="100%">
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
                      ? `${(((monthlyTrendData[monthlyTrendData.length-1]?.reports || 0) - (monthlyTrendData[0]?.reports || 0)) / (monthlyTrendData[0]?.reports || 1) * 100).toFixed(1)}%`
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
    </div>
  );
};

export default SuperAdminDashboard;