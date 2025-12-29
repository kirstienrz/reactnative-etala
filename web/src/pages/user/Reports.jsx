import { useEffect, useState } from "react";
import { getUserReportsWithParams } from "../../api/report";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-900 mb-2">Reports</h1>
          <p className="text-gray-600 text-sm sm:text-base">View and track your submitted reports.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by ticket, name..."
            className="flex-1 p-3 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="p-3 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white transition-all"
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

        {/* Report List */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : Array.isArray(reports) && reports.length > 0 ? (
            <ul className="space-y-3 sm:space-y-4">
              {reports.map((report) => (
                <li
                  key={report._id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all duration-200 hover:border-purple-300 active:scale-[0.99]"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">#{report.ticketNumber}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 sm:text-right">
                      Click to view details
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No reports found.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap justify-center items-center mt-6 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-sm sm:text-base flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <span className="px-3 py-2 text-sm sm:text-base text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-sm sm:text-base flex items-center gap-1"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Modal - Fixed z-index and removed blur */}
        {selectedReport && (
          <div className="fixed inset-0 z-[9999] modal-container">
            {/* Overlay without blur */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setSelectedReport(null)}
            ></div>

            {/* Modal container with responsive sizing and centering */}
            <div className="absolute inset-0 flex items-center justify-center p-0 sm:p-4">
              {/* Modal content */}
              <div className="bg-white w-full h-full sm:h-[90vh] sm:max-w-4xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Modal Header - Sticky */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
                  <div className="flex justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                          Report #{selectedReport.ticketNumber}
                        </h2>
                        <span className={`px-2 py-1 text-xs sm:text-sm rounded-full font-medium flex-shrink-0 ${
                          selectedReport.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          selectedReport.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          selectedReport.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedReport.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {selectedReport.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm truncate">
                        Submitted: {new Date(selectedReport.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                      onClick={() => setSelectedReport(null)}
                      aria-label="Close modal"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Body - Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Victim Information Section */}
                    <section className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-1.5 h-5 bg-purple-600 rounded-full flex-shrink-0"></div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Victim Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Full Name</label>
                            <p className="text-gray-900 text-sm sm:text-base">{formatField(`${selectedReport.firstName || ''} ${selectedReport.middleName || ''} ${selectedReport.lastName || ''}`.trim())}</p>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Alias</label>
                            <p className="text-gray-900 text-sm sm:text-base">{formatField(selectedReport.alias)}</p>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Sex</label>
                            <p className="text-gray-900 text-sm sm:text-base">{formatField(selectedReport.sex)}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Age</label>
                            <p className="text-gray-900 text-sm sm:text-base">{formatField(selectedReport.age)}</p>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Contact Information</label>
                            <p className="text-gray-900 text-sm sm:text-base">{formatField(selectedReport.guardianContact)}</p>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Location</label>
                            <p className="text-gray-900 text-sm sm:text-base">
                              {formatField(`${selectedReport.region || ''}, ${selectedReport.province || ''}, ${selectedReport.cityMun || ''}`
                                .replace(/, ,/g, ',')
                                .replace(/^, |, $/g, '')
                                .trim() || 'N/A')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Perpetrator Information Section */}
                    <section className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-1.5 h-5 bg-red-600 rounded-full flex-shrink-0"></div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Perpetrator Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Full Name</label>
                            <p className="text-gray-900 text-sm sm:text-base">
                              {formatField(`${selectedReport.perpFirstName || ''} ${selectedReport.perpMiddleName || ''} ${selectedReport.perpLastName || ''}`.trim())}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Alias</label>
                            <p className="text-gray-900 text-sm sm:text-base">{formatField(selectedReport.perpAlias)}</p>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Sex</label>
                            <p className="text-gray-900 text-sm sm:text-base">{formatField(selectedReport.perpSex)}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Age</label>
                            <p className="text-gray-900 text-sm sm:text-base">{formatField(selectedReport.perpAge)}</p>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Location</label>
                            <p className="text-gray-900 text-sm sm:text-base">
                              {formatField(`${selectedReport.perpRegion || ''}, ${selectedReport.perpProvince || ''}, ${selectedReport.perpCityMun || ''}`
                                .replace(/, ,/g, ',')
                                .replace(/^, |, $/g, '')
                                .trim() || 'N/A')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Incident Details Section */}
                    <section className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-1.5 h-5 bg-orange-600 rounded-full flex-shrink-0"></div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Incident Details</h3>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Incident Types</label>
                          <p className="text-gray-900 text-sm sm:text-base">{formatField(selectedReport.incidentTypes)}</p>
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Description</label>
                          <div className="mt-1">
                            <p className="text-gray-900 text-sm sm:text-base whitespace-pre-line bg-white p-3 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                              {formatField(selectedReport.incidentDescription)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Location</label>
                            <p className="text-gray-900 text-sm sm:text-base">
                              {formatField(`${selectedReport.placeOfIncident || ''}, ${selectedReport.incidentBarangay || ''}, ${selectedReport.incidentCityMun || ''}`
                                .replace(/, ,/g, ',')
                                .replace(/^, |, $/g, '')
                                .trim() || 'N/A')}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Latest Incident Date</label>
                            <p className="text-gray-900 text-sm sm:text-base">{formatField(selectedReport.latestIncidentDate)}</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Services & Referrals Section */}
                    <section className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-1.5 h-5 bg-green-600 rounded-full flex-shrink-0"></div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Services & Referrals</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${selectedReport.crisisIntervention ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <label className="text-xs sm:text-sm font-medium text-gray-500">Crisis Intervention</label>
                              <p className="text-gray-900 text-sm sm:text-base">{selectedReport.crisisIntervention ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${selectedReport.protectionOrder ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <label className="text-xs sm:text-sm font-medium text-gray-500">Protection Order</label>
                              <p className="text-gray-900 text-sm sm:text-base">{selectedReport.protectionOrder ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Healthcare Services</label>
                            <p className="text-gray-900 text-sm sm:text-base">{formatField(selectedReport.healthcareServices)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${selectedReport.referToLawEnforcement ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <label className="text-xs sm:text-sm font-medium text-gray-500">Law Enforcement Referral</label>
                              <p className="text-gray-900 text-sm sm:text-base">{selectedReport.referToLawEnforcement ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Timeline & Attachments Section */}
                    <section className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-1.5 h-5 bg-blue-600 rounded-full flex-shrink-0"></div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Timeline & Attachments</h3>
                      </div>

                      {/* Timeline */}
                      <div className="mb-4 sm:mb-6">
                        <h4 className="font-medium text-gray-700 mb-3 text-sm sm:text-base">Timeline Updates</h4>
                        {selectedReport.timeline?.length > 0 ? (
                          <div className="space-y-3">
                            {selectedReport.timeline.map((t, idx) => (
                              <div key={idx} className="flex gap-3">
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  {idx < selectedReport.timeline.length - 1 && (
                                    <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                                  )}
                                </div>
                                <div className="flex-1 pb-3 min-w-0">
                                  <p className="text-gray-900 text-sm sm:text-base">{t.action}</p>
                                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    By {t.performedBy} • {new Date(t.timestamp).toLocaleString()}
                                  </p>
                                  {t.remarks && (
                                    <p className="text-gray-600 text-xs sm:text-sm mt-2 bg-white p-2 rounded border">
                                      {t.remarks}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No timeline available</p>
                        )}
                      </div>

                      {/* Attachments */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3 text-sm sm:text-base">Attachments</h4>
                        {selectedReport.attachments && selectedReport.attachments.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                            {selectedReport.attachments.map((file, idx) => (
                              <div key={idx} className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                                {file.type === "image" ? (
                                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                                    <img 
                                      src={file.uri} 
                                      alt={file.fileName} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center p-2 sm:p-3">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-1 sm:mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs text-gray-500 truncate w-full text-center px-1">
                                      {file.fileName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No attachments</p>
                        )}
                      </div>
                    </section>
                  </div>
                </div>

                {/* Modal Footer - Sticky */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
                    >
                      Close Report
                    </button>
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