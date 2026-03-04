import React, { useEffect, useState } from "react";
import {
  getAccomplishments,
  getArchivedAccomplishments,
  uploadAccomplishment,
  archiveAccomplishment,
  restoreAccomplishment,
} from "../../api/accomplishments";
import {
  FileText,
  Loader2,
  Eye,
  X,
  Archive,
  RefreshCcw,
  Clock,
  Calendar,
  Download,
  FileCheck,
  CheckCircle2
} from "lucide-react";

const Accomplishments = () => {
  const [reports, setReports] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [archiving, setArchiving] = useState({});
  const [restoring, setRestoring] = useState({});
  const [selectedPdf, setSelectedPdf] = useState(null);

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReports();
  }, [viewArchived]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = viewArchived
        ? await getArchivedAccomplishments()
        : await getAccomplishments();
      setReports(data);
    } catch (err) {
      setError("Failed to load accomplishment reports");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !year || !file) {
      setError("All fields are required");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("year", year);
    formData.append("file", file);

    try {
      await uploadAccomplishment(formData);
      setSuccess("Accomplishment report uploaded successfully");
      setTitle("");
      setYear("");
      setFile(null);
      fetchReports();
    } catch (err) {
      setError("Failed to upload accomplishment report");
    } finally {
      setUploading(false);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this accomplishment report?")) return;
    setArchiving(prev => ({ ...prev, [id]: true }));
    try {
      await archiveAccomplishment(id);
      fetchReports();
    } catch (err) {
      setError("Failed to archive accomplishment report");
    } finally {
      setArchiving(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Restore this accomplishment report?")) return;
    setRestoring(prev => ({ ...prev, [id]: true }));
    try {
      await restoreAccomplishment(id);
      fetchReports();
    } catch (err) {
      setError("Failed to restore accomplishment report");
    } finally {
      setRestoring(prev => ({ ...prev, [id]: false }));
    }
  };

  // Robust PDF Embed URL generator
  const getEmbedUrl = (url) => {
    if (!url) return "";
    // If it's a Cloudinary raw URL, use Google Docs Viewer proxy to ensure inline viewing
    if (url.includes('/raw/upload/') && url.toLowerCase().endsWith('.pdf')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    // For 'image' resource type PDFs (new uploads), standard URL works
    return `${url}#toolbar=0`;
  };

  const activeList = reports; // The API already filters based on fetchReports state

  if (loading && reports.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">Accomplishment Reports</h1>
            <p className="text-gray-600 mt-1">Official documentation of achievements and milestones</p>
          </div>
          <button
            onClick={() => setViewArchived(!viewArchived)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${viewArchived
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
          >
            {viewArchived ? (
              <><RefreshCcw size={18} /> View Active</>
            ) : (
              <><Archive size={18} /> View Archived</>
            )}
          </button>
        </div>

        {/* Upload Form - Only in Active View */}
        {!viewArchived && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              Upload New Report
            </h3>

            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g., Annual Report 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none text-gray-900 font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Year</label>
                <input
                  type="number"
                  placeholder="2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none text-gray-900 font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none text-sm text-gray-500 font-medium cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <div className="md:col-span-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <><Loader2 className="animate-spin" size={20} /> Uploading...</>
                  ) : (
                    "Upload Publication"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeList.length === 0 ? (
            <div className="col-span-full py-24 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={48} className="text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500">Your collection of reports will appear here</p>
            </div>
          ) : (
            activeList.map((report) => (
              <div key={report._id} className="group bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300 relative flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FileText size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                    {report.title}
                  </h3>
                  <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                    <Calendar size={16} />
                    <span>Academic Year {report.year}</span>
                  </div>
                </div>

                <div className="mt-auto pt-8 flex items-center justify-between border-t border-gray-50">
                  <button
                    onClick={() => setSelectedPdf(report)}
                    className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
                  >
                    View Report <Eye size={18} />
                  </button>

                  <div className="flex gap-2">
                    {viewArchived ? (
                      <button
                        onClick={() => handleRestore(report._id)}
                        disabled={restoring[report._id]}
                        className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm"
                        title="Restore"
                      >
                        {restoring[report._id] ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchive(report._id)}
                        disabled={archiving[report._id]}
                        className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all duration-200 shadow-sm"
                        title="Archive"
                      >
                        {archiving[report._id] ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-10 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 max-w-xl truncate leading-tight">{selectedPdf.title}</h3>
                  <p className="text-gray-500 font-semibold flex items-center gap-2 mt-1">
                    <Calendar size={16} /> Academic Year {selectedPdf.year}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={selectedPdf.fileUrl}
                  download
                  className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-2xl text-sm font-black transition flex items-center gap-2"
                >
                  <Download size={20} /> Download
                </a>
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="p-4 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            {/* Modal Iframe Content */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center relative inner-shadow overflow-hidden">
              <iframe
                src={getEmbedUrl(selectedPdf.fileUrl)}
                className="w-full h-full border-none bg-white"
                title={selectedPdf.title}
                allow="autoplay"
              />

              {/* Corner Info */}
              <div className="absolute top-6 left-6 pointer-events-none select-none">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl text-[11px] uppercase tracking-widest font-black text-white shadow-2xl">
                  Official GAD Publication
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accomplishments;