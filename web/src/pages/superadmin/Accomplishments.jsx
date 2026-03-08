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
  Minimize2,
  Trash2,
  Upload,
  Plus
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
  const [isDragging, setIsDragging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

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
      setShowAddModal(false);
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
      // Clear the file input if possible
      if (e.target.value) {
        e.target.value = "";
      }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Accomplishment Reports
          </h1>
          <p className="text-gray-600">
            Manage official documentation of achievements and milestones
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setViewArchived(false)}
            className={`pb-3 px-4 font-medium transition ${!viewArchived
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Active Reports
          </button>
          <button
            onClick={() => setViewArchived(true)}
            className={`pb-3 px-4 font-medium transition ${viewArchived
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Archived
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex-1"></div>
            {/* Right side */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!viewArchived && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ml-auto relative z-30"
                >
                  <Plus size={18} />
                  Add Report
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {activeList.length} {!viewArchived ? "active" : "archived"} reports
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

        {/* Upload Form Modal - Only in Active View */}
        {showAddModal && !viewArchived && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Upload New Report
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleUpload} className="space-y-6">
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
                    <div
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="file"
                        accept=".pdf,application/pdf,video/mp4,video/webm,image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                      />
                      <div className="pointer-events-none">
                        <div className={`inline-flex p-3 rounded-full mb-2 ${isDragging ? 'bg-blue-200' : 'bg-gray-100'}`}>
                          <Upload className={`w-5 h-5 ${isDragging ? 'text-blue-600' : 'text-gray-500'}`} />
                        </div>
                        {file ? (
                          <p className="text-gray-800 font-bold text-sm">Selected: {file.name}</p>
                        ) : (
                          <>
                            <p className="text-gray-600 font-medium text-sm">Click or drag and drop files here</p>
                            <p className="text-gray-400 text-xs mt-1">PDF, Video, Image</p>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 ml-1 uppercase tracking-wider font-bold flex justify-between">
                      <span>Max 50MB</span>
                      {error && (error.includes("file") || error.includes("File")) && (
                        <span className="text-red-500">{error}</span>
                      )}
                    </p>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-8 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
            </div>
          </div>
        )}

        {/* Table List */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-8">
          {activeList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No {!viewArchived ? "active" : "archived"} reports found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Academic Year</th>
                  <th className="p-3 text-center">File</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeList.map((report) => (
                  <tr key={report._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{report.title}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {report.year}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedPdf(report.fileUrl);
                          setSelectedPdfName(report.title);
                          setSelectedPdfType(report.type || (report.fileUrl.toLowerCase().endsWith('.mp4') ? 'video' : report.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'pdf'));
                        }}
                        className="text-blue-600 hover:text-blue-800 flex justify-center w-full items-center gap-2"
                        title="View Document"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        {!viewArchived ? (
                          <>
                            <button
                              onClick={() => handleArchive(report._id)}
                              disabled={archiving[report._id]}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded disabled:opacity-50"
                              title="Archive"
                            >
                              {archiving[report._id] ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(report._id)}
                            disabled={restoring[report._id]}
                            className="px-3 py-1 text-green-600 hover:bg-green-50 rounded border border-green-200 disabled:opacity-50"
                            title="Restore"
                          >
                            {restoring[report._id] ? <Loader2 size={16} className="animate-spin inline mr-1" /> : null} Restore
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(report._id);
                          }}
                          disabled={deleting[report._id]}
                          className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all disabled:opacity-50"
                          title="Delete Permanently"
                        >
                          {deleting[report._id] ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
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