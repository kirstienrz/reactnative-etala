import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Plus,
  Filter,
  Search,
  FileText,
  Users,
  Target,
  ArrowRight,
  Edit,
  Eye,
  Archive
} from 'lucide-react';

const BudgetProgramsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState('2025');

  const budgetOverview = {
    totalBudget: 5000000,
    utilized: 3250000,
    remaining: 1750000,
    utilizationRate: 65
  };

  const quarterlyData = [
    { quarter: 'Q1', allocated: 1250000, spent: 1100000, utilization: 88 },
    { quarter: 'Q2', allocated: 1250000, spent: 950000, utilization: 76 },
    { quarter: 'Q3', allocated: 1250000, spent: 800000, utilization: 64 },
    { quarter: 'Q4', allocated: 1250000, spent: 400000, utilization: 32 }
  ];

  const programs = [
    {
      id: 1,
      name: 'Gender Sensitivity Training',
      department: 'All Departments',
      budget: 500000,
      spent: 450000,
      status: 'active',
      startDate: '2025-01-15',
      endDate: '2025-12-15',
      beneficiaries: 250
    },
    {
      id: 2,
      name: 'Women in STEM Mentorship',
      department: 'EEAD',
      budget: 300000,
      spent: 180000,
      status: 'active',
      startDate: '2025-02-01',
      endDate: '2025-11-30',
      beneficiaries: 80
    },
    {
      id: 3,
      name: 'Anti-Sexual Harassment Campaign',
      department: 'All Departments',
      budget: 200000,
      spent: 200000,
      status: 'completed',
      startDate: '2025-03-01',
      endDate: '2025-10-31',
      beneficiaries: 500
    },
    {
      id: 4,
      name: 'GAD Focal Person Development',
      department: 'BASD',
      budget: 150000,
      spent: 75000,
      status: 'active',
      startDate: '2025-04-01',
      endDate: '2025-12-31',
      beneficiaries: 30
    }
  ];

  const departmentBudget = [
    { name: 'BASD', allocated: 800000, spent: 520000, utilization: 65 },
    { name: 'CAAD', allocated: 900000, spent: 630000, utilization: 70 },
    { name: 'EEAD', allocated: 1000000, spent: 750000, utilization: 75 },
    { name: 'MAAD', allocated: 850000, spent: 510000, utilization: 60 },
    { name: 'GAD Office', allocated: 450000, spent: 340000, utilization: 76 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budget & Programs</h1>
              <p className="text-gray-600 mt-1">Financial Management Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <button className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Program
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {['overview', 'programs', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-purple-700 border-b-2 border-purple-700'
                    : 'text-gray-600 hover:text-purple-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Budget Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Budget</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(budgetOverview.totalBudget)}</p>
                <p className="text-xs text-gray-500 mt-2">Fiscal Year {selectedYear}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-700" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Utilized</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(budgetOverview.utilized)}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {budgetOverview.utilizationRate}% utilization rate
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <PieChart className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Remaining</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(budgetOverview.remaining)}</p>
                <p className="text-xs text-gray-500 mt-2">Available for allocation</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Target className="w-6 h-6 text-orange-700" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Active Programs</h3>
                <p className="text-2xl font-bold text-gray-900">{programs.filter(p => p.status === 'active').length}</p>
                <p className="text-xs text-gray-500 mt-2">Currently running</p>
              </div>
            </div>

            {/* Quarterly Budget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quarterly Budget Performance</h2>
              <div className="space-y-4">
                {quarterlyData.map((quarter) => (
                  <div key={quarter.quarter} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-900 w-12">{quarter.quarter}</span>
                        <div className="text-sm">
                          <span className="text-gray-600">Allocated: </span>
                          <span className="font-semibold text-gray-900">{formatCurrency(quarter.allocated)}</span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span className="text-gray-600">Spent: </span>
                          <span className="font-semibold text-gray-900">{formatCurrency(quarter.spent)}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-purple-700">{quarter.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${quarter.utilization}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Budget Allocation */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Budget by Department</h2>
              <div className="space-y-4">
                {departmentBudget.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-4">
                    <div className="w-32 font-semibold text-gray-700">{dept.name}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          {formatCurrency(dept.spent)} / {formatCurrency(dept.allocated)}
                        </span>
                        <span className="text-sm font-semibold text-purple-700">{dept.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full"
                          style={{ width: `${dept.utilization}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            {/* Programs List */}
            <div className="space-y-4">
              {programs.map((program) => (
                <div key={program.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{program.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(program.status)}`}>
                          {program.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{program.department}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{program.startDate} - {program.endDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{program.beneficiaries} beneficiaries</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
                        <Archive className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                      <span className="text-sm font-semibold text-purple-700">
                        {formatCurrency(program.spent)} / {formatCurrency(program.budget)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full"
                        style={{ width: `${(program.spent / program.budget) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {((program.spent / program.budget) * 100).toFixed(1)}% utilized
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatCurrency(program.budget - program.spent)} remaining
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Annual GAD Budget Report', icon: FileText, color: 'purple' },
                { name: 'PCW Accomplishment Report', icon: BarChart3, color: 'violet' },
                { name: 'Quarterly Financial Report', icon: PieChart, color: 'indigo' },
                { name: 'Program Performance Report', icon: Target, color: 'blue' }
              ].map((report, idx) => {
                const Icon = report.icon;
                return (
                  <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className={`bg-${report.color}-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 text-${report.color}-700`} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{report.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">Generate comprehensive reports for {selectedYear}</p>
                    <button className="text-purple-700 font-semibold hover:text-purple-800 flex items-center gap-2">
                      Generate Report
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetProgramsDashboard;