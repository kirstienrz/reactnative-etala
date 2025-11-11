import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Plus, FileText, ArrowRight, Upload, BarChart3, DollarSign } from 'lucide-react';

const BudgetProgramsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [excelData, setExcelData] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      setExcelData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  // Sample data for overview
  const budgetStats = [
    { label: 'Total Budget', value: '₱2.5M', change: '+12%', color: 'blue' },
    { label: 'Utilized', value: '₱1.8M', change: '+8%', color: 'green' },
    { label: 'Remaining', value: '₱700K', change: '-5%', color: 'orange' },
    { label: 'Programs', value: '15', change: '+3', color: 'purple' }
  ];

  const recentPrograms = [
    { name: 'Gender Mainstreaming', budget: '₱500K', spent: '₱350K', progress: 70 },
    { name: 'Women Empowerment', budget: '₱800K', spent: '₱600K', progress: 75 },
    { name: 'Capacity Building', budget: '₱300K', spent: '₱150K', progress: 50 },
    { name: 'Research & Development', budget: '₱400K', spent: '₱200K', progress: 50 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-blue-600" />
              Budget & Programs
            </h1>
            <p className="text-gray-500 text-sm">Manage and track program budgets and expenditures</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6 inline-flex">
          {['overview', 'budgetUpload', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-medium capitalize transition-all duration-200 rounded-lg flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab === 'overview' && <BarChart3 className="w-4 h-4" />}
              {tab === 'budgetUpload' && <Upload className="w-4 h-4" />}
              {tab === 'reports' && <FileText className="w-4 h-4" />}
              {tab === 'budgetUpload' ? 'Budget Upload' : tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {budgetStats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                      <DollarSign className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                  <div className={`text-sm font-medium mt-2 ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Programs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Programs</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {recentPrograms.map((program, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{program.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Budget: {program.budget}</span>
                        <span>Spent: {program.spent}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{program.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${program.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Budget Upload Tab */}
        {activeTab === 'budgetUpload' && (
          <div className="space-y-6">
            {/* Upload Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Budget File</h3>
                  <p className="text-sm text-gray-500">Upload Excel files (.xlsx, .xls) containing budget data</p>
                </div>
                {selectedFileName && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                    {selectedFileName}
                  </span>
                )}
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Drag and drop your Excel file here, or click to browse</p>
                <label className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />
                  Choose File
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-3">Supports .xlsx and .xls files up to 10MB</p>
              </div>
            </div>

            {/* Data Preview */}
            {excelData.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
                  <span className="text-sm text-gray-500">
                    {excelData.length} rows loaded
                  </span>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {Object.keys(excelData[0]).map((col, idx) => (
                          <th 
                            key={idx} 
                            className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {excelData.map((row, idx) => (
                        <tr 
                          key={idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {Object.keys(row).map((col, colIdx) => (
                            <td 
                              key={colIdx} 
                              className="px-4 py-3 text-sm text-gray-700"
                            >
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Quarterly Budget Report', date: 'Dec 2024', type: 'PDF' },
                { title: 'Program Expenditure', date: 'Nov 2024', type: 'Excel' },
                { title: 'Annual Budget Summary', date: 'Jan 2025', type: 'PDF' },
                { title: 'GAD Budget Allocation', date: 'Oct 2024', type: 'Excel' },
                { title: 'Financial Audit', date: 'Sep 2024', type: 'PDF' },
                { title: 'Program Performance', date: 'Aug 2024', type: 'Excel' }
              ].map((report, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {report.type}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{report.date}</span>
                    <button className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetProgramsDashboard;