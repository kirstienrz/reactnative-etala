import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { getUserProfile } from "../../api/user";
import { TrendingUp, AlertCircle, CheckCircle2, Bell, Calendar, MoreVertical } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const metrics = [
    { label: "Total Reports", value: 120, color: "bg-blue-50 border-blue-200 text-blue-700", icon: TrendingUp, trend: "+12% from last month" },
    { label: "Open Cases", value: 34, color: "bg-amber-50 border-amber-200 text-amber-700", icon: AlertCircle, trend: "5 need attention" },
    { label: "Resolved", value: 86, color: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: CheckCircle2, trend: "72% resolution rate" },
    { label: "Notifications", value: 15, color: "bg-violet-50 border-violet-200 text-violet-700", icon: Bell, trend: "2 unread" },
  ];

  const reportsPie = {
    labels: ["Open", "Resolved", "Referred"],
    datasets: [
      {
        data: [34, 86, 10],
        backgroundColor: ["#F59E0B", "#10B981", "#3B82F6"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const casesLine = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "New Cases",
        data: [5, 8, 6, 10, 7, 4, 9],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.02)",
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#fff",
        pointBorderWidth: 1.5,
        borderWidth: 2,
      },
    ],
  };

  const deptBar = {
    labels: ["OSA", "HR", "Dept Head", "Faculty"],
    datasets: [
      {
        label: "Reports",
        data: [40, 25, 30, 25],
        backgroundColor: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"],
        borderRadius: 4,
        barThickness: 32,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 12,
          font: { 
            size: 11,
            family: "'Inter', sans-serif"
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 12,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.03)'
        },
        border: {
          display: false
        },
        ticks: {
          stepSize: 5
        }
      }
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back, {user?.firstName}. Here's your system overview.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`${metric.color} border rounded-xl p-5 transition-all hover:shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-white/50">
                  <Icon className="w-5 h-5" />
                </div>
                <MoreVertical className="w-5 h-5 opacity-50" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">{metric.value.toLocaleString()}</p>
                <p className="text-sm font-medium">{metric.label}</p>
                <p className="text-xs opacity-75 mt-2">{metric.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900 mb-1">Reports by Status</h3>
            <p className="text-sm text-gray-500">Current distribution</p>
          </div>
          <div className="h-64">
            <Pie data={reportsPie} options={chartOptions} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900 mb-1">Weekly Activity</h3>
            <p className="text-sm text-gray-500">New cases over the past week</p>
          </div>
          <div className="h-64">
            <Line data={casesLine} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Bar Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900 mb-1">Department Reports</h3>
            <p className="text-sm text-gray-500">Breakdown by department</p>
          </div>
          <div className="h-64">
            <Bar data={deptBar} options={chartOptions} />
          </div>
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-1">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest reports</p>
          </div>
          <div className="divide-y divide-gray-100">
            {[
              { name: "John D.", type: "Incident", status: "Open", dept: "OSA", date: "Dec 18", initials: "JD", color: "blue" },
              { name: "Mary S.", type: "Report", status: "Resolved", dept: "HR", date: "Dec 17", initials: "MS", color: "emerald" },
              { name: "Alice T.", type: "Incident", status: "Referred", dept: "Dept Head", date: "Dec 16", initials: "AT", color: "violet" },
              { name: "Robert L.", type: "Complaint", status: "Open", dept: "Faculty", date: "Dec 15", initials: "RL", color: "amber" },
            ].map((report, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${report.color}-100 flex items-center justify-center`}>
                      <span className={`text-sm font-medium text-${report.color}-600`}>{report.initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.type}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${report.color}-100 text-${report.color}-700 font-medium`}>
                    {report.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{report.dept}</span>
                  <span>{report.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;