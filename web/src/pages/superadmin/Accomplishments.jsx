import React, { useEffect, useState } from "react";
import {
  getAccomplishments,
  getArchivedAccomplishments,
  uploadAccomplishment,
  archiveAccomplishment,
  restoreAccomplishment,
  deleteAccomplishment,
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
  CheckCircle2,
  Maximize2,
  Trash2
} from "lucide-react";

const Accomplishments = () => {
  const [reports, setReports] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [archiving, setArchiving] = useState({});
  const [restoring, setRestoring] = useState({});
  const [deleting, setDeleting] = useState({});
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [selectedPdfType, setSelectedPdfType] = useState("pdf");
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // Validation function for title
  const validateTitle = (titleValue) => {
    if (!titleValue.trim()) {
      return "Report title is required";
    }

    if (titleValue.trim().length < 3) {
      return "Title must be at least 3 characters long";
    }

    if (titleValue.trim().length > 100) {
      return "Title must be less than 100 characters";
    }

    // Check if title is purely numeric
    if (/^\d+$/.test(titleValue.trim())) {
      return "Title cannot be purely numeric";
    }

    // Optional: Check if title contains at least one letter
    if (!/[a-zA-Z]/.test(titleValue)) {
      return "Title must contain at least one letter";
    }

    return ""; // No error
  };

  // Validation function for year
  const validateYear = (yearValue) => {
    const currentYear = new Date().getFullYear();
    const minYear = 1900; // Adjust this based on your requirements

    if (!yearValue) {
      return "Year is required";
    }

    const yearNum = parseInt(yearValue);

    if (isNaN(yearNum)) {
      return "Year must be a valid number";
    }

    if (yearNum < minYear || yearNum > currentYear) {
      return `Year must be between ${minYear} and ${currentYear}`;
    }

    if (yearValue.length !== 4) {
      return "Year must be 4 digits (e.g. 2024)";
    }

    return ""; // No error
  };

  // Validation function for file type
  const validateFile = (file) => {
    if (!file) {
      return "File is required";
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.pdf', '.mp4', '.webm', '.png', '.jpg', '.jpeg'];
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      return "Only PDF, MP4, WebM, and Image files are allowed";
    }

    // Check MIME type as well for extra security
    const validMimeTypes = ['application/pdf', 'video/mp4', 'video/webm', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validMimeTypes.includes(file.type)) {
      return "File must be a valid document or media file";
    }

    // Optional: Check file size (e.g., max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return "File size must be less than 50MB";
    }

    return ""; // No error
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this accomplishment? This action cannot be undone.")) return;

    setDeleting(prev => ({ ...prev, [id]: true }));

    try {
      await deleteAccomplishment(id);
      fetchReports();
      setSuccess("Accomplishment deleted permanently");
    } catch (err) {
      setError("Failed to delete accomplishment report");
    } finally {
      setDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle title input change with validation
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);

    // Clear any previous title errors when user starts typing
    if (error && (error.includes("Title") || error.includes("title"))) {
      setError("");
    }
  };

  // Handle year input change with validation
  const handleYearChange = (e) => {
    const value = e.target.value;
    setYear(value);

    // Clear any previous year errors when user starts typing
    if (value && value.length === 4) {
      const errorMsg = validateYear(value);
      if (errorMsg) {
        setError("");
      }
    }
  };

  // Handle file selection with validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file immediately when selected
    const fileError = validateFile(selectedFile);
    if (fileError) {
      setError(fileError);
      setFile(null);
      // Clear the file input
      e.target.value = "";
      return;
    }

    // Clear any previous errors if file is valid
    if (error && (error.includes("file") || error.includes("File"))) {
      setError("");
    }

    setFile(selectedFile);
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

  if (loading && reports.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading reports...</p>
      </div>
    );
  }

  const activeList = reports;

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

        {/* Messaging */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <X size={18} className="cursor-pointer" onClick={() => setError("")} />
            <span className="font-medium">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} />
            <span className="font-medium">{success}</span>
          </div>
        )}

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
                  onChange={handleTitleChange}
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
                  onChange={handleYearChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none text-gray-900 font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">File (PDF, Video, or Image)</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf,video/mp4,video/webm,image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none text-sm text-gray-500 font-medium cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1 ml-1 uppercase tracking-wider font-bold">
                  Max 50MB
                </p>
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
                    "Upload Report"
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
              <div key={report._id} className="group bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300 relative flex flex-col h-full overflow-hidden">
                {/* Delete Button - Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(report._id);
                  }}
                  disabled={deleting[report._id]}
                  className="absolute top-4 right-4 p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all duration-300 backdrop-blur-md opacity-0 group-hover:opacity-100 z-10 shadow-lg shadow-red-500/20"
                  title="Delete Permanently"
                >
                  {deleting[report._id] ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>

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
                    onClick={() => {
                      setSelectedPdf(report.fileUrl);
                      setSelectedPdfName(report.title);
                      setSelectedPdfType(report.type || (report.fileUrl.toLowerCase().endsWith('.mp4') ? 'video' : report.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'pdf'));
                    }}
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

      {/* Media Viewer Modal */}
      {selectedPdf && (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black ${isFullscreen ? 'bg-black' : 'bg-opacity-90'} p-4 backdrop-blur-sm transition-all animate-in fade-in duration-300`}>
          <div className={`${isFullscreen ? 'w-screen h-screen' : 'bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[90vh]'} flex flex-col overflow-hidden animate-in zoom-in-95 duration-300`}>

            {/* Modal Header */}
            <div className="p-4 md:px-8 md:py-6 border-b flex justify-between items-center bg-white text-gray-900 sticky top-0 z-10">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold truncate leading-tight">{selectedPdfName || "Accomplishment Report"}</h3>
                  <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 uppercase tracking-wider">
                    {selectedPdfType} Document
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-500"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <X size={24} /> : <Maximize2 size={24} />}
                </button>

                <button
                  onClick={() => {
                    setSelectedPdf(null);
                    setIsFullscreen(false);
                  }}
                  className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center relative overflow-hidden">
              {selectedPdfType === "video" ? (
                <video
                  src={selectedPdf}
                  controls
                  autoPlay
                  className="w-full max-h-full"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : selectedPdfType === "image" ? (
                <img
                  src={selectedPdf}
                  alt={selectedPdfName}
                  className="w-full h-full object-contain"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <iframe
                  src={getEmbedUrl(selectedPdf)}
                  className="w-full h-full border-none bg-white"
                  title="PDF Viewer"
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}

              {/* Corner Info Overlay */}
              {!isFullscreen && (
                <div className="absolute top-6 left-6 pointer-events-none select-none hidden md:block">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl text-[11px] uppercase tracking-widest font-black text-white shadow-2xl">
                    Official Documentation
                  </div>
                </div>
              )}
            </div>

            {!isFullscreen && (
              <div className="p-4 md:px-8 md:py-6 border-t bg-gray-50 flex justify-between items-center">
                <p className="text-sm text-gray-500 font-medium">Reviewing {selectedPdfName}</p>
                <div className="flex gap-3">
                  <a
                    href={selectedPdf}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-xl text-sm font-bold transition flex items-center gap-2 hover:bg-gray-300"
                  >
                    <Download size={18} /> Download
                  </a>
                  <button
                    onClick={() => setSelectedPdf(null)}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-lg"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Accomplishments;