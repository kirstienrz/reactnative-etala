import React, { useState } from 'react';
import { Download, Eye, Calendar, Users } from 'lucide-react';

const CommitteeReports = () => {
  const [selectedYear, setSelectedYear] = useState('All');

  const reports = [
    {
      id: 1,
      title: 'GAD Committee Report - Q4 2024',
      meetingDate: 'October 15, 2024',
      attendees: 12,
      year: '2024',
      fileSize: '856 KB'
    },
    {
      id: 2,
      title: 'GAD Committee Report - Q3 2024',
      meetingDate: 'July 22, 2024',
      attendees: 14,
      year: '2024',
      fileSize: '924 KB'
    },
    {
      id: 3,
      title: 'GAD Committee Report - Q2 2024',
      meetingDate: 'April 18, 2024',
      attendees: 13,
      year: '2024',
      fileSize: '1.1 MB'
    },
    {
      id: 4,
      title: 'GAD Committee Report - Q1 2024',
      meetingDate: 'January 25, 2024',
      attendees: 15,
      year: '2024',
      fileSize: '980 KB'
    },
    {
      id: 5,
      title: 'GAD Committee Annual Report 2023',
      meetingDate: 'December 12, 2023',
      attendees: 16,
      year: '2023',
      fileSize: '2.3 MB'
    },
    {
      id: 6,
      title: 'GAD Committee Report - Q4 2023',
      meetingDate: 'October 18, 2023',
      attendees: 14,
      year: '2023',
      fileSize: '890 KB'
    }
  ];

  const years = ['All', '2024', '2023'];

  const filteredReports = selectedYear === 'All' 
    ? reports 
    : reports.filter(report => report.year === selectedYear);

  const handleView = (reportTitle) => {
    alert(`Viewing: ${reportTitle}\n\nThis would open the report in a preview window.`);
  };

  const handleDownload = (reportTitle) => {
    alert(`Downloading: ${reportTitle}\n\nThis would initiate the report download.`);
  };

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Committee Reports
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Official reports from GAD Committee meetings and activities
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">About Committee Reports</h2>
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              The GAD Committee meets regularly to oversee the implementation of gender and development programs, review policies, and ensure alignment with institutional goals and national GAD mandates.
            </p>
            <p>
              These reports document the committee's deliberations, decisions, and recommendations. They provide transparency and accountability in GAD governance and serve as official records of committee proceedings.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 text-sm">Filter:</span>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                  selectedYear === year
                    ? 'bg-violet-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-violet-400'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Reports List */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-8">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {filteredReports.map((report, index) => (
              <div
                key={report.id}
                className={`flex items-center justify-between p-6 hover:bg-slate-50 transition-colors ${
                  index !== filteredReports.length - 1 ? 'border-b border-slate-200' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {report.title}
                  </h3>
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {report.meetingDate}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {report.attendees} members
                    </span>
                    <span>{report.fileSize}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-6">
                  <button
                    onClick={() => handleView(report.title)}
                    className="bg-white text-violet-700 border border-violet-200 rounded-lg px-4 py-2 shadow hover:bg-violet-50 transition-colors dark:bg-white dark:text-violet-700 dark:hover:bg-violet-100"
                    title="View Report"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">View</span>
                  </button>
                  <button
                    onClick={() => handleDownload(report.title)}
                    className="bg-white text-slate-600 border border-slate-300 rounded-lg px-4 py-2 shadow hover:bg-slate-100 transition-colors dark:bg-white dark:text-slate-600 dark:hover:bg-slate-200"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CommitteeReports;