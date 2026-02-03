

import { useEffect, useState } from "react";
import { getUserReportsWithParams, discloseIdentity } from "../../api/report";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [revealPassword, setRevealPassword] = useState("");

  const limit = 5;

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getUserReportsWithParams({
        page,
        limit,
        search,
        status: statusFilter
      });

      // Backend now returns { data: reports, total }
      const reportsData = res?.data || [];
      const total = res?.total || reportsData.length;

      setReports(reportsData);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error(err);
      setReports([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [page, search, statusFilter]);

  // Helper function to format field display
  const formatField = (value, fallback = "N/A") => {
    if (value === null || value === undefined || value === "") return fallback;
    if (Array.isArray(value) && value.length === 0) return fallback;
    if (Array.isArray(value)) return value.join(", ");
    return value;
  };

  // Prevent body scroll when modal is open and fix z-index issues
  useEffect(() => {
    if (selectedReport) {
      document.body.style.overflow = 'hidden';
      // Ensure modal is on top of other elements
      const modalContainer = document.querySelector('.modal-container');
      if (modalContainer) {
        modalContainer.style.zIndex = '9999';
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedReport]);


const handleReveal = async (reportId, password) => {
  if (!password) return alert("Password is required.");

  try {
    setLoading(true);
    await discloseIdentity(reportId, password); // call API
    alert("Your report is now revealed. Authorized personnel can see your info.");
    fetchReports(); // refresh the list
    setSelectedReport(null);
    setShowPasswordInput(false);
    setRevealPassword("");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to reveal the report. Please try again.");
  } finally {
    setLoading(false);
  }
};

return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">View and track your submitted reports.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reports
              </label>
              <input
                type="text"
                placeholder="Search by ticket number, name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
          ) : Array.isArray(reports) && reports.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-semibold text-gray-900 text-lg">#{report.ticketNumber}</span>
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                                'bg-purple-100 text-purple-800'
                          }`}>
                          {report.status}
                        </span>
                        {report.isAnonymous && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 text-sm">
                        Submitted on {new Date(report.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600 font-medium">
                      <span>View Details</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {search || statusFilter ? 'Try adjusting your search or filter criteria.' : 'You haven\'t submitted any reports yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {reports.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="text-sm text-gray-600">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-[9999] modal-container">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setSelectedReport(null)}
            ></div>

            {/* Modal content */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 truncate">
                          Report #{selectedReport.ticketNumber}
                        </h2>
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${selectedReport.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          selectedReport.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            selectedReport.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              selectedReport.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                                'bg-purple-100 text-purple-800'
                          }`}>
                          {selectedReport.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-gray-500 text-sm">
                          Submitted: {new Date(selectedReport.submittedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {selectedReport.isAnonymous ? (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            Anonymous Report
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            Identity Disclosed
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                      onClick={() => setSelectedReport(null)}
                      aria-label="Close modal"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Victim Information */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-900">Victim Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Full Name</label>
                            <p className="text-gray-900">{formatField(`${selectedReport.firstName || ''} ${selectedReport.middleName || ''} ${selectedReport.lastName || ''}`.trim())}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Alias</label>
                            <p className="text-gray-900">{formatField(selectedReport.alias)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Sex</label>
                            <p className="text-gray-900">{formatField(selectedReport.sex)}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Age</label>
                            <p className="text-gray-900">{formatField(selectedReport.age)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Contact Information</label>
                            <p className="text-gray-900">{formatField(selectedReport.guardianContact)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Location</label>
                            <p className="text-gray-900">
                              {formatField(`${selectedReport.region || ''}, ${selectedReport.province || ''}, ${selectedReport.cityMun || ''}`
                                .replace(/, ,/g, ',')
                                .replace(/^, |, $/g, '')
                                .trim() || 'N/A')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Perpetrator Information */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-900">Perpetrator Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Full Name</label>
                            <p className="text-gray-900">
                              {formatField(`${selectedReport.perpFirstName || ''} ${selectedReport.perpMiddleName || ''} ${selectedReport.perpLastName || ''}`.trim())}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Alias</label>
                            <p className="text-gray-900">{formatField(selectedReport.perpAlias)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Sex</label>
                            <p className="text-gray-900">{formatField(selectedReport.perpSex)}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Age</label>
                            <p className="text-gray-900">{formatField(selectedReport.perpAge)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Location</label>
                            <p className="text-gray-900">
                              {formatField(`${selectedReport.perpRegion || ''}, ${selectedReport.perpProvince || ''}, ${selectedReport.perpCityMun || ''}`
                                .replace(/, ,/g, ',')
                                .replace(/^, |, $/g, '')
                                .trim() || 'N/A')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Incident Details */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-orange-600 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-900">Incident Details</h3>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-medium text-gray-500 block mb-2">Incident Types</label>
                          <p className="text-gray-900">{formatField(selectedReport.incidentTypes)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 block mb-2">Description</label>
                          <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-900 whitespace-pre-line">
                              {formatField(selectedReport.incidentDescription)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Location</label>
                            <p className="text-gray-900">
                              {formatField(`${selectedReport.placeOfIncident || ''}, ${selectedReport.incidentBarangay || ''}, ${selectedReport.incidentCityMun || ''}`
                                .replace(/, ,/g, ',')
                                .replace(/^, |, $/g, '')
                                .trim() || 'N/A')}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Latest Incident Date</label>
                            <p className="text-gray-900">{formatField(selectedReport.latestIncidentDate)}</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Services & Referrals */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-green-600 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-900">Services & Referrals</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                          <div className="flex items-start gap-3">
                            <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${selectedReport.crisisIntervention ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <label className="text-sm font-medium text-gray-500 block mb-1">Crisis Intervention</label>
                              <p className="text-gray-900">{selectedReport.crisisIntervention ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${selectedReport.protectionOrder ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <label className="text-sm font-medium text-gray-500 block mb-1">Protection Order</label>
                              <p className="text-gray-900">{selectedReport.protectionOrder ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-5">
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Healthcare Services</label>
                            <p className="text-gray-900">{formatField(selectedReport.healthcareServices)}</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${selectedReport.referToLawEnforcement ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <label className="text-sm font-medium text-gray-500 block mb-1">Law Enforcement Referral</label>
                              <p className="text-gray-900">{selectedReport.referToLawEnforcement ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Timeline & Attachments */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-900">Timeline & Attachments</h3>
                      </div>

                      {/* Timeline */}
                      <div className="mb-8">
                        <h4 className="font-semibold text-gray-900 mb-4">Timeline Updates</h4>
                        {selectedReport.timeline?.length > 0 ? (
                          <div className="space-y-6">
                            {selectedReport.timeline.map((t, idx) => (
                              <div key={idx} className="flex gap-4">
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                  {idx < selectedReport.timeline.length - 1 && (
                                    <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                                  )}
                                </div>
                                <div className="flex-1 pb-6 min-w-0">
                                  <p className="text-gray-900 font-medium">{t.action}</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    By {t.performedBy} • {new Date(t.timestamp).toLocaleString()}
                                  </p>
                                  {t.remarks && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                      <p className="text-gray-700 text-sm">{t.remarks}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No timeline available</p>
                        )}
                      </div>

                      {/* Attachments */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Attachments</h4>
                        {selectedReport.attachments && selectedReport.attachments.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {selectedReport.attachments.map((file, idx) => (
                              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                {file.type === "image" ? (
                                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                                    <img
                                      src={file.uri}
                                      alt={file.fileName}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center p-4">
                                    <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs text-gray-500 text-center truncate w-full px-2">
                                      {file.fileName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No attachments</p>
                        )}
                      </div>
                    </section>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      {selectedReport.isAnonymous && (
                        <p className="text-sm text-gray-600">
                          ⚠️ This is an anonymous report. You can choose to disclose your identity to enable editing capabilities.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Close
                      </button>

                      {selectedReport.isAnonymous && !showPasswordInput && (
                        <button
                          disabled={loading}
                          onClick={() => setShowPasswordInput(true)}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          Disclose Identity
                        </button>
                      )}

                      {selectedReport.isAnonymous && showPasswordInput && (
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
                          <input
                            type="password"
                            placeholder="Enter your password"
                            value={revealPassword}
                            onChange={(e) => setRevealPassword(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none mb-2 sm:mb-0 sm:mr-2 w-full sm:w-auto"
                          />
                          <button
                            disabled={loading || !revealPassword}
                            onClick={() => handleReveal(selectedReport._id, revealPassword)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            {loading ? "Processing..." : "Confirm"}
                          </button>
                        </div>
                      )}

                      {/* {!selectedReport.isAnonymous && (
                        <button
                          onClick={async () => {
                            try {
                              setLoading(true);
                              // await updateReportByUser(selectedReport._id, editableFields);
                              alert("Report updated successfully!");
                              fetchReports();
                              setSelectedReport(null);
                            } catch (err) {
                              console.error(err);
                              alert("Failed to update report. Please try again.");
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Save Changes
                        </button>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}