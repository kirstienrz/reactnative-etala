import React, { useState, useEffect } from 'react';
import { getUserAnalytics } from '../../api/user';
import { getReportAnalytics } from '../../api/report'; // Import the report analytics API
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, Archive, FileText, AlertTriangle, Shield, MessageSquare, Activity } from 'lucide-react';

const SuperAdminDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('userDept'); // 'userDept' or 'reportDept'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, reportRes] = await Promise.all([
          getUserAnalytics(),
          getReportAnalytics() // Fetch report analytics including department data
        ]);
        setUserData(userRes);
        setReportData(reportRes);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>;

  if (!userData && !reportData) return <div className="p-8 text-red-500">Failed to load data</div>;

  // User data charts (existing)
  const userTypeData = userData ? Object.entries(userData.userType).map(([name, value]) => ({
    name, value
  })) : [];

  const userDeptData = userData ? Object.entries(userData.department).map(([name, value]) => ({
    name, value
  })) : [];

  const trendData = userData ? userData.trend.months.map((month, i) => ({
    month,
    users: userData.trend.counts[i]
  })) : [];

  // Report department data
  const reportDeptData = reportData?.data?.topDepartments?.map(({ name, value }) => ({
    name,
    value,
    fill: '#8b5cf6' // Purple color for report departments
  })) || [];

  // Report overview stats
  const reportOverview = reportData?.data?.overview || {
    totalReports: 0,
    activeReports: 0,
    archivedReports: 0,
    severeReports: 0,
    moderateReports: 0,
    mildReports: 0,
    pendingAnalysis: 0
  };

  // Monthly report trends
  const reportTrendData = reportData?.data?.monthlyTrend?.months?.map((month, i) => ({
    month,
    reports: reportData.data.monthlyTrend.counts?.[i] || 0,
    archived: reportData.data.monthlyTrend.archived?.[i] || 0
  })) || [];

  // Recent activity
  const recentReports = reportData?.data?.recentActivity?.recentReports || [];
  const todayCount = reportData?.data?.recentActivity?.todayCount || 0;
  const weekCount = reportData?.data?.recentActivity?.weekCount || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">User and report statistics and trends</p>
      </div>

      {/* Combined Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* User Stats */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{userData?.overview?.totalUsers || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{userData?.overview?.activeUsers || 0}</p>
            </div>
            <UserCheck className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        {/* Report Stats */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-purple-600">{reportOverview.totalReports}</p>
            </div>
            <FileText className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Reports</p>
              <p className="text-3xl font-bold text-indigo-600">{reportOverview.activeReports}</p>
            </div>
            <MessageSquare className="w-10 h-10 text-indigo-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Additional Report Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Severe Reports</p>
              <p className="text-3xl font-bold text-red-600">{reportOverview.severeReports}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Moderate Reports</p>
              <p className="text-3xl font-bold text-yellow-600">{reportOverview.moderateReports}</p>
            </div>
            <Activity className="w-10 h-10 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mild Reports</p>
              <p className="text-3xl font-bold text-green-600">{reportOverview.mildReports}</p>
            </div>
            <Shield className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Reports</p>
              <p className="text-3xl font-bold text-cyan-600">{todayCount}</p>
            </div>
            <FileText className="w-10 h-10 text-cyan-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Department Charts Section */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Department Analytics</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveChart('userDept')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeChart === 'userDept' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              User Departments
            </button>
            <button
              onClick={() => setActiveChart('reportDept')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeChart === 'reportDept' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Report Departments
            </button>
          </div>
        </div>

        <div className="h-80">
          {activeChart === 'userDept' && (
            <>
              <h4 className="text-lg font-medium mb-4">User Registration by Department</h4>
              {userDeptData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userDeptData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No department data available for users
                </div>
              )}
            </>
          )}

          {activeChart === 'reportDept' && (
            <>
              <h4 className="text-lg font-medium mb-4">Reports Submitted by Department</h4>
              {reportDeptData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportDeptData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No department data available for reports
                </div>
              )}
            </>
          )}
        </div>

        {/* Department Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">User Departments Summary</h4>
            <p className="text-sm text-gray-600">
              Total departments with registered users: <span className="font-bold">{userDeptData.length}</span>
            </p>
            {userDeptData.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Top department: <span className="font-bold">{userDeptData[0]?.name}</span> ({userDeptData[0]?.value} users)
              </p>
            )}
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-700 mb-2">Report Departments Summary</h4>
            <p className="text-sm text-purple-600">
              Total departments with reports: <span className="font-bold">{reportDeptData.length}</span>
            </p>
            {reportDeptData.length > 0 && (
              <p className="text-sm text-purple-600 mt-1">
                Top reporting department: <span className="font-bold">{reportDeptData[0]?.name}</span> ({reportDeptData[0]?.value} reports)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trends Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trends */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">User Registration Trends (Last 6 Months)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No trend data available
            </div>
          )}
        </div>

        {/* Report Submission Trends */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Report Submission Trends (Last 6 Months)</h3>
          {reportTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="reports" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="New Reports"
                />
                <Line 
                  type="monotone" 
                  dataKey="archived" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Archived Reports"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No report trend data available
            </div>
          )}
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">User Type Distribution</h3>
          {userTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No user type data available
            </div>
          )}
        </div>

        {/* Recent Reports Activity */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Recent Reports Activity</h3>
          <div className="space-y-3">
            {recentReports.length > 0 ? (
              recentReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{report.ticketNumber}</p>
                    <p className="text-sm text-gray-600 truncate max-w-xs">{report.incidentDescription}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      report.caseStatus === 'Case Closed' ? 'bg-green-100 text-green-800' :
                      report.caseStatus === 'For Interview' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.caseStatus}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                No recent reports
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>This week: {weekCount} reports</span>
            <span>Today: {todayCount} reports</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;