import { useEffect, useState } from "react";
import { getUserReportsWithParams } from "../../api/report";
import { UserCheck, ClipboardList, Shield, Users, FileText, Download, Share2, Clock, X } from "lucide-react";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalTab, setModalTab] = useState("details");

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

  const InfoItem = ({ label, value, fallback = null }) => {
    const displayValue = value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '') ? fallback : value;
    return (
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
        <p className={`text-sm font-medium ${displayValue === fallback ? 'text-gray-400 italic' : 'text-gray-900'}`}>
          {displayValue || '—'}
        </p>
      </div>
    );
  };

  useEffect(() => {
    if (selectedReport) {
      document.body.style.overflow = 'hidden';
      const modalContainer = document.querySelector('.modal-container');
      if (modalContainer) {
        modalContainer.style.zIndex = '9999';
      }
      setModalTab("details"); // Reset tab when opening new report
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedReport]);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openTicket = params.get('open');
    if (openTicket && reports.length > 0) {
      const found = reports.find(r => r.ticketNumber === openTicket);
      if (found) {
        setSelectedReport(found);
      }
    }
  }, [reports]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">View and track your submitted reports.</p>
        </div>

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
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                          report.caseStatus === 'For Queuing' ? 'bg-orange-100 text-orange-800' :
                          report.caseStatus === 'For Interview' ? 'bg-cyan-100 text-cyan-800' :
                          report.caseStatus === 'For Referral' ? 'bg-pink-100 text-pink-800' :
                          report.caseStatus === 'Case Closed' ? 'bg-gray-100 text-gray-800' :
                          report.caseStatus?.startsWith("Internal") ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800' // Default / Pending fallback
                        }`}>
                          {report.caseStatus || report.status}
                        </span>
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

        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 modal-container">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                  <p className="text-sm text-gray-600 mt-1">#{selectedReport.ticketNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
                <button
                  onClick={() => setModalTab("details")}
                  className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${modalTab === "details"
                      ? "border-purple-600 text-purple-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Incident Details
                </button>
                <button
                  onClick={() => setModalTab("history")}
                  className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${modalTab === "history"
                      ? "border-purple-600 text-purple-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Case History & Referrals
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                {modalTab === "details" ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Reporter Info */}
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <UserCheck size={14} /> Reporter Information
                        </h3>
                        {selectedReport.isAnonymous ? (
                          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                            <p className="text-sm font-bold text-purple-900 mb-2">Anonymous Submission</p>
                            <div className="grid grid-cols-2 gap-y-3">
                              <InfoItem label="Role" value={selectedReport.reporterRole} />
                              <InfoItem label="Gender" value={selectedReport.anonymousGender} />
                              <InfoItem label="Affiliation" value={selectedReport.tupRole} />
                              <InfoItem label="Dept" value={selectedReport.reporterDepartment} />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                {selectedReport.createdBy?.firstName?.charAt(0) || "U"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {selectedReport.createdBy?.firstName} {selectedReport.createdBy?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{selectedReport.createdBy?.tupId}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </section>

                      {/* Basic Info */}
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <ClipboardList size={14} /> Case Overview
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <InfoItem label="Status" value={selectedReport.caseStatus || selectedReport.status} />
                          <InfoItem label="Category" value={selectedReport.incidentTypes?.join(", ") || "General"} />
                          <InfoItem label="Submitted" value={new Date(selectedReport.submittedAt).toLocaleDateString()} />
                          <InfoItem label="Time" value={new Date(selectedReport.submittedAt).toLocaleTimeString()} />
                        </div>
                      </section>
                    </div>

                    {/* Location Details */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Shield size={14} /> Location Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem label="Place of Incident" value={selectedReport.placeOfIncident} />
                        <InfoItem label="Address Details" value={`${selectedReport.incidentBarangay || ''} ${selectedReport.incidentCityMun || ''} ${selectedReport.incidentProvince || ''}`.trim() || 'N/A'} />
                      </div>
                    </section>

                    {/* Incident Statement */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">Incident Statement</h3>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {selectedReport.salaysay || selectedReport.incidentDescription || selectedReport.incidentStatement || "No statement provided"}
                        </p>
                      </div>
                    </section>

                    {/* Victim & Perpetrator Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">Victim Details</h3>
                        <div className="grid grid-cols-2 gap-y-4">
                          <InfoItem label="Full Name" value={selectedReport.isAnonymous ? "Anonymous Reporter" : `${selectedReport.firstName || ''} ${selectedReport.lastName || ''}`.trim() || 'N/A'} />
                          <InfoItem label="Gender" value={selectedReport.isAnonymous ? (selectedReport.reporterGender || selectedReport.anonymousGender) : selectedReport.sex} />
                          <InfoItem label="Address" value={`${selectedReport.barangay || ''} ${selectedReport.cityMun || ''}`.trim() || 'N/A'} />
                          <InfoItem label="Occupation" value={selectedReport.occupation} />
                        </div>
                      </section>
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">Perpetrator Details</h3>
                        <div className="grid grid-cols-2 gap-y-4">
                          <InfoItem label="Name" value={`${selectedReport.perpFirstName || ''} ${selectedReport.perpLastName || ''}`.trim() || 'N/A'} fallback="Not provided" />
                          <InfoItem label="Gender" value={selectedReport.perpSex} fallback="Not provided" />
                          <InfoItem label="Relationship" value={selectedReport.perpRelationship} fallback="Not provided" />
                          <InfoItem label="Occupation" value={selectedReport.perpOccupation} fallback="Not provided" />
                          <InfoItem label="Address" value={selectedReport.perpBarangay} fallback="Not provided" />
                        </div>
                      </section>
                    </div>

                    {/* Witness Information */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Users size={14} /> Witness Information
                      </h3>
                      {selectedReport.witnessName ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <InfoItem label="Witness Name" value={selectedReport.witnessName} fallback="Not provided" />
                            <InfoItem label="Gender" value={selectedReport.witnessGender} fallback="Not provided" />
                            <InfoItem label="Contact Info" value={selectedReport.witnessContact} fallback="Not provided" />
                            <InfoItem label="Address" value={selectedReport.witnessAddress} fallback="Not provided" />
                          </div>
                          {selectedReport.witnessAccount && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Witness Statement</label>
                              <p className="text-sm text-gray-800 leading-relaxed italic">"{selectedReport.witnessAccount}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No witnesses provided</p>
                      )}
                    </section>

                    {/* Attachments */}
                    {selectedReport.attachments?.length > 0 && (
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">Evidence & Attachments</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedReport.attachments.map((att, i) => (
                            <a
                              key={i}
                              href={att.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-200 transition-all group"
                            >
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 group-hover:text-purple-600 transition-colors shadow-sm">
                                <FileText size={16} />
                              </div>
                              <span className="text-[11px] font-bold text-gray-700 truncate flex-1">{att.fileName}</span>
                              <Download size={14} className="text-gray-400" />
                            </a>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Additional Notes */}
                    {selectedReport.additionalNotes && (
                      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">Additional Notes</h3>
                        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                            {selectedReport.additionalNotes}
                          </p>
                        </div>
                      </section>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Referral Tracking Section */}
                    {selectedReport.referrals?.length > 0 && (
                      <section className="bg-purple-600 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <Share2 size={18} /> Formal Referrals Issued
                          </h3>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold">
                            {selectedReport.referrals.length} {selectedReport.referrals.length === 1 ? 'Referral' : 'Referrals'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedReport.referrals.map((ref, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    {ref.referralType === "External" ? <Shield size={20} /> : <Users size={20} />}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold leading-tight">
                                      {ref.referralType === "External" ? ref.barangayName : ref.department}
                                    </p>
                                    <p className="text-[10px] opacity-70 uppercase font-bold tracking-tighter">
                                      {ref.referralType} Referral
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-[10px] opacity-80 flex items-center gap-1">
                                <Clock size={10} /> Issued on {new Date(ref.date).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Unified Timeline */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Clock size={16} /> Activity Log & Audit Trail
                      </h3>
                      <div className="space-y-6">
                        {selectedReport.timeline?.map((t, i) => (
                          <div key={i} className="relative pl-8 border-l-2 border-gray-100 pb-2">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${t.action.includes("Referral") ? "bg-purple-600" :
                                t.action.includes("Closed") ? "bg-gray-800" : "bg-blue-500"
                              }`}></div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                              <p className="text-sm font-bold text-gray-900">{t.action}</p>
                              <time className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                {new Date(t.timestamp).toLocaleString()}
                              </time>
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                              <div className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                                  <UserCheck size={10} className="text-gray-400" />
                                </div>
                                <span className="font-bold text-gray-700">
                                  {selectedReport.isAnonymous &&
                                    (t.performedBy && typeof t.performedBy === 'object'
                                      ? (t.performedBy._id === (selectedReport.createdBy?._id || selectedReport.createdBy))
                                      : (t.performedBy === (selectedReport.createdBy?._id || selectedReport.createdBy)))
                                    ? "Anonymous Reporter"
                                    : (t.performedBy && typeof t.performedBy === 'object'
                                      ? `${t.performedBy.firstName || ''} ${t.performedBy.lastName || ''}`.trim() || 'System'
                                      : (t.performedBy || 'System'))
                                  }
                                </span>
                              </div>
                            </div>

                            {t.remarks && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-[11px] text-gray-600 italic leading-relaxed">
                                  "{t.remarks}"
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </div>

              {/* Footer Actions for Details Modal */}
              <div className="border-t border-gray-200 p-6 bg-white sticky bottom-0">
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-sm"
                  >
                    Close Report Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}