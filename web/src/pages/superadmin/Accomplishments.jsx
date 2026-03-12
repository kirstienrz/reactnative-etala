import React, { useEffect, useState } from "react";
import {
  getAccomplishments,
  getArchivedAccomplishments,
  createAccomplishment,
  uploadFiles,
  archiveAccomplishment,
  restoreAccomplishment,
  deleteAccomplishment,
  deleteFile as deleteSingleFile,
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
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Image as ImageIcon,
  FileVideo,
  File,
  Filter
} from "lucide-react";

const Accomplishments = () => {
  const [reports, setReports] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadMoreModal, setShowUploadMoreModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Creation States
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");
  const [filesToUpload, setFilesToUpload] = useState([]);

  // Viewer State
  const [showViewer, setShowViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
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
      setReports(data || []);
    } catch (err) {
      setError("Failed to load accomplishment reports");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndUpload = async (e) => {
    e.preventDefault();
    if (!title || !year) return;
    setUploading(true);
    try {
      // 1. Create the accomplishment entry
      const createRes = await createAccomplishment({
        title: title.trim(),
        year: parseInt(year),
        description
      });

      const newId = createRes.data._id;

      // 2. If files selected, upload them
      if (filesToUpload.length > 0) {
        await uploadFiles(newId, filesToUpload);
      }

      setSuccess("Accomplishment report created successfully");
      setShowAddModal(false);
      resetForm();
      fetchReports();
    } catch (err) {
      setError("Failed to create accomplishment");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadMore = async () => {
    if (!selectedReport || filesToUpload.length === 0) return;
    setUploading(true);
    try {
      await uploadFiles(selectedReport._id, filesToUpload);
      setSuccess("Files added successfully");
      setShowUploadMoreModal(false);
      resetForm();
      fetchReports();
    } catch (err) {
      setError("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setYear(new Date().getFullYear().toString());
    setDescription("");
    setFilesToUpload([]);
    setSelectedReport(null);
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this accomplishment report?")) return;
    try {
      await archiveAccomplishment(id);
      fetchReports();
    } catch (err) {
      setError("Failed to archive");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Restore this accomplishment report?")) return;
    try {
      await restoreAccomplishment(id);
      fetchReports();
    } catch (err) {
      setError("Failed to restore");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this accomplishment? This cannot be undone.")) return;
    try {
      await deleteAccomplishment(id);
      setSuccess("Deleted successfully");
      fetchReports();
    } catch (err) {
      setError("Failed to delete");
    }
  };

  // Media Helpers
  const getFileExtension = (file) => {
    const fileName = file.originalName || file.name || '';
    const fileUrl = file.fileUrl || file.url || '';
    if (fileName.includes('.')) return fileName.toLowerCase().split('.').pop();
    if (fileUrl.includes('.')) {
      const urlParts = fileUrl.split('.');
      return urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
    }
    return '';
  };

  const isImageFile = (file) => {
    const ext = getFileExtension(file);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || (file.fileType === 'image');
  };

  const isVideoFile = (file) => {
    const ext = getFileExtension(file);
    return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext) || (file.fileType === 'video');
  };

  const isPdfFile = (file) => {
    const ext = getFileExtension(file);
    return ext === 'pdf' || (file.fileType === 'pdf');
  };

  const getFileIcon = (file) => {
    if (isPdfFile(file)) return <FileText size={18} className="text-red-500" />;
    if (isVideoFile(file)) return <FileVideo size={18} className="text-red-500" />;
    if (isImageFile(file)) return <ImageIcon size={18} className="text-blue-500" />;
    return <File size={18} className="text-gray-400" />;
  };

  const getEmbedUrl = (file) => {
    const url = file.fileUrl || file.url;
    if (!url) return "";
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.match(/\.(xls|xlsx|ppt|pptx|doc|docx)$/)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }
    if (lowerUrl.match(/\.(pdf|csv|txt)$/) || url.includes('/raw/upload/')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  const handleFileAction = (file, allFiles = []) => {
    setPreviewFiles(allFiles);
    const index = allFiles.findIndex(f => (f._id || f.id) === (file._id || file.id));
    setCurrentPreviewIndex(index >= 0 ? index : 0);
    setSelectedFile(file);
    setShowViewer(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  const filteredReports = reports.filter(r =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.year?.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Accomplishment Reports</h1>
          <p className="text-gray-600">Official documentation of achievements and milestones</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setViewArchived(false)}
            className={`pb-3 px-4 font-medium transition ${!viewArchived ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
          >
            Active Reports
          </button>
          <button
            onClick={() => setViewArchived(true)}
            className={`pb-3 px-4 font-medium transition ${viewArchived ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
          >
            Archived
          </button>
        </div>

        {/* Action Bar */}
        <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
          {!viewArchived && (
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Add New Report
            </button>
          )}
        </div>

        {/* Messaging */}
        {(error || success) && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-semibold animate-in fade-in slide-in-from-top-2 ${error ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            {error ? <X size={20} /> : <CheckCircle2 size={20} />}
            <span className="flex-1">{error || success}</span>
            <X size={18} className="cursor-pointer opacity-50 hover:opacity-100" onClick={() => { setError(""); setSuccess(""); }} />
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="mt-4 text-gray-500 font-medium">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-20 text-center text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-10" />
              <p>No reports found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-black tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Year</th>
                    <th className="px-6 py-4">Files</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.map(report => {
                    const files = report.files || [];
                    return (
                      <tr key={report._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{report.title}</p>
                          {report.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{report.description}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black">{report.year}</span>
                        </td>
                        <td className="px-6 py-4">
                          {files.length > 0 ? (
                            <div className="flex items-center -space-x-2">
                              {files.slice(0, 3).map((f, i) => (
                                <div
                                  key={i}
                                  onClick={() => handleFileAction(f, files)}
                                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 shadow-sm overflow-hidden cursor-pointer hover:z-10 hover:scale-110 transition-all flex items-center justify-center"
                                >
                                  {isImageFile(f) ? (
                                    <img src={f.fileUrl} alt="" className="w-full h-full object-cover" />
                                  ) : getFileIcon(f)}
                                </div>
                              ))}
                              {files.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                                  +{files.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs italic">No files</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            {files.length > 0 && (
                              <button
                                onClick={() => handleFileAction(files[0], files)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="View Files"
                              >
                                <Eye size={18} />
                              </button>
                            )}
                            {!viewArchived ? (
                              <>
                                <button
                                  onClick={() => handleArchive(report._id)}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                                  title="Archive"
                                >
                                  <Archive size={18} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRestore(report._id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Restore"
                              >
                                <RefreshCcw size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(report._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Permanently"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-gray-900">Add Accomplishment Report</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateAndUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Report Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Annual Audit 2024" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Academic Year</label>
                <input type="number" value={year} onChange={e => setYear(e.target.value)} required placeholder="2024" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Summary (Optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="Brief details about this report..." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Upload Files</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-all bg-gray-50 relative pointer">
                  <input type="file" multiple onChange={e => setFilesToUpload(Array.from(e.target.files))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                        {filesToUpload.length > 0 ? `${filesToUpload.length} files selected` : "Select files for this report"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">PDF, Images, Videos, Office Docs up to 50MB</p>
                  </div>
                </div>
                {filesToUpload.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {filesToUpload.map((file, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-xl flex items-start gap-4 border border-gray-100">
                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="font-bold text-gray-900 text-xs truncate pr-4">{file.name}</p>
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = [...filesToUpload];
                                newFiles.splice(i, 1);
                                setFilesToUpload(newFiles);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  {uploading ? "Creating..." : "Save Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEWER MODAL */}
      {showViewer && selectedFile && (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-sm transition-all animate-in fade-in duration-300`}>
          <div className={`${isFullscreen ? 'w-screen h-screen' : 'bg-white w-full sm:max-w-6xl h-full sm:h-[90vh] sm:rounded-2xl'} flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative`}>

            <div className="p-3 sm:px-6 sm:py-4 border-b flex justify-between items-center bg-white text-gray-900 sticky top-0 z-10 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-lg font-bold truncate leading-tight">{selectedFile.originalName}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">
                    {isImageFile(selectedFile) ? 'Image' : isVideoFile(selectedFile) ? 'Video' : 'Document'} • {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <a href={selectedFile.fileUrl} download={selectedFile.originalName} target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500" title="Download"><Download size={20} /></a>
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500">{isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</button>
                <button onClick={() => { setShowViewer(false); setSelectedFile(null); }} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 bg-gray-900 flex items-center justify-center relative group min-h-0 overflow-hidden">
              {previewFiles.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const newIndex = (currentPreviewIndex - 1 + previewFiles.length) % previewFiles.length;
                      setCurrentPreviewIndex(newIndex);
                      setSelectedFile(previewFiles[newIndex]);
                    }}
                    className="absolute left-4 z-20 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => {
                      const newIndex = (currentPreviewIndex + 1) % previewFiles.length;
                      setCurrentPreviewIndex(newIndex);
                      setSelectedFile(previewFiles[newIndex]);
                    }}
                    className="absolute right-4 z-20 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              <div className="w-full h-full flex items-center justify-center p-2 sm:p-6">
                {isImageFile(selectedFile) ? (
                  <img src={selectedFile.fileUrl} className="max-w-full max-h-full object-contain rounded shadow-2xl" onContextMenu={e => e.preventDefault()} />
                ) : isVideoFile(selectedFile) ? (
                  <video src={selectedFile.fileUrl} controls autoPlay className="max-w-full max-h-full rounded shadow-2xl" />
                ) : (
                  <iframe src={getEmbedUrl(selectedFile)} className="w-full h-full border-none bg-white rounded shadow-2xl" onContextMenu={e => e.preventDefault()} />
                )}
              </div>

              {previewFiles.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
                  {currentPreviewIndex + 1} / {previewFiles.length}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accomplishments;