import React, { useState } from "react";
import { 
  FileDown, 
  FileSpreadsheet, 
  Calendar, 
  Filter, 
  ChartPie, 
  Users, 
  Briefcase, 
  ClipboardList,
  Download,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const Exports = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    reportType: "",
    status: ""
  });

  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reportTypes = [
    "GAD Suggestions",
    "User Activities",
    "Incident / Report Management",
    "Referral & Assignment",
    "Budget & Programs",
    "Projects Overview",
    "Messaging Logs",
    "Knowledge Hub Upload Logs"
  ];

  const exportData = [
    {
      title: "User Management",
      description: "All users, roles, status, and registration logs.",
      icon: Users,
      iconColor: "text-blue-500",
      available: true
    },
    {
      title: "GAD Suggestion Analytics",
      description: "Suggestion trends, approval rates, priorities.",
      icon: ChartPie,
      iconColor: "text-pink-500",
      available: true
    },
    {
      title: "Projects & Programs",
      description: "Project progress, budgets, timelines.",
      icon: Briefcase,
      iconColor: "text-green-700",
      available: true
    },
    {
      title: "Incident & Report Management",
      description: "Reports, actions taken, status updates.",
      icon: ClipboardList,
      iconColor: "text-indigo-500",
      available: true
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      reportType: "",
      status: ""
    });
  };

  const handleExport = async (format) => {
    if (!filters.reportType) {
      alert("Please select a report type first.");
      return;
    }

    setIsLoading(true);
    setSelectedFormat(format);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would trigger the actual download
      console.log(`Exporting ${filters.reportType} as ${format}`, filters);
      alert(`Exporting ${filters.reportType} as ${format}...`);
      
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsLoading(false);
      setSelectedFormat("");
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Reports</h2>
        <p className="text-gray-600">
          Download system-generated reports for documentation, analysis, and compliance.
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
            <Filter size={18} /> Filter Reports
          </h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Active filters
              </span>
            )}
            {isFilterExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {isFilterExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Start Date
                </label>
                <input 
                  type="date" 
                  className="border border-gray-300 w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  End Date
                </label>
                <input 
                  type="date" 
                  className="border border-gray-300 w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Report Type
                </label>
                <select 
                  className="border border-gray-300 w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={filters.reportType}
                  onChange={(e) => handleFilterChange("reportType", e.target.value)}
                >
                  <option value="">Select Type</option>
                  {reportTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Status
                </label>
                <select 
                  className="border border-gray-300 w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            {hasActiveFilters && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Format Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* PDF Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <FileDown size={36} className="text-blue-600" />
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Recommended
            </span>
          </div>
          <h4 className="font-bold text-lg text-gray-900 mb-2">Export as PDF</h4>
          <p className="text-sm text-gray-600 mb-4">
            Download a formatted PDF report with charts and professional layout.
          </p>
          <button 
            onClick={() => handleExport("PDF")}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              isLoading && selectedFormat === "PDF" 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isLoading && selectedFormat === "PDF" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Excel Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-green-200">
          <FileSpreadsheet size={36} className="text-green-600 mb-4" />
          <h4 className="font-bold text-lg text-gray-900 mb-2">Export as Excel</h4>
          <p className="text-sm text-gray-600 mb-4">
            Download an Excel file with raw data for detailed analysis and processing.
          </p>
          <button 
            onClick={() => handleExport("Excel")}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              isLoading && selectedFormat === "Excel" 
                ? "bg-green-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {isLoading && selectedFormat === "Excel" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Excel
              </>
            )}
          </button>
        </div>

        {/* CSV Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-yellow-200">
          <ClipboardList size={36} className="text-yellow-600 mb-4" />
          <h4 className="font-bold text-lg text-gray-900 mb-2">Export as CSV</h4>
          <p className="text-sm text-gray-600 mb-4">
            Download raw data in CSV format for analytics and external documentation.
          </p>
          <button 
            onClick={() => handleExport("CSV")}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              isLoading && selectedFormat === "CSV" 
                ? "bg-yellow-400 cursor-not-allowed" 
                : "bg-yellow-600 hover:bg-yellow-700"
            } text-white`}
          >
            {isLoading && selectedFormat === "CSV" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Download CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Available Data Sections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Available Data for Export
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportData.map((item, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                item.available 
                  ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer" 
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.available ? item.iconColor : "text-gray-400"}`}>
                  <item.icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    {!item.available && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="text-2xl font-bold text-blue-700">24</div>
          <div className="text-sm text-blue-600">Reports Generated Today</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="text-2xl font-bold text-green-700">156</div>
          <div className="text-sm text-green-600">Total This Month</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="text-2xl font-bold text-purple-700">89%</div>
          <div className="text-sm text-purple-600">Most Used Format: PDF</div>
        </div>
      </div>
    </div>
  );
};

export default Exports;