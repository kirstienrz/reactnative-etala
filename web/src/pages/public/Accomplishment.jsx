import React, { useState, useEffect } from "react";
import { Download, FileText, X, Maximize2, Minimize2, ChevronLeft, ChevronRight, Eye, Image as ImageIcon, FileVideo, File } from "lucide-react";
import { getAccomplishments } from "../../api/accomplishments"; // Axios API call

const Accomplishment = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Viewer State
  const [showViewer, setShowViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getAccomplishments();
      setReports(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load accomplishment reports.");
    } finally {
      setLoading(false);
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
    if (!file) return false;
    const ext = getFileExtension(file);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || (file.fileType === 'image');
  };

  const isVideoFile = (file) => {
    if (!file) return false;
    const ext = getFileExtension(file);
    return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext) || (file.fileType === 'video');
  };

  const isPdfFile = (file) => {
    if (!file) return false;
    const ext = getFileExtension(file);
    return ext === 'pdf' || (file.fileType === 'pdf');
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

  return (
    <main className="bg-white min-h-screen">
      <section className="relative py-24 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight select-none">
            Accomplishment <span className="text-violet-400">Reports</span>
          </h1>
          <div className="w-20 h-1.5 bg-violet-500 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-violet-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Tracking our progress, achievements, and milestones throughout the academic years.
          </p>
        </div>
      </section>

      {/* Reports Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex flex-col items-center py-12">
              <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold">Synchronizing reports...</p>
            </div>
          )}
          {error && <p className="text-center text-red-500 font-bold bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>}

          <div className="space-y-6">
            {!loading && !error && reports.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-xl">No reports available at this time.</p>
              </div>
            )}

            {reports.map((report) => (
              <div
                key={report._id}
                className="group bg-white border border-slate-200 hover:border-violet-600 hover:shadow-2xl hover:shadow-violet-100 p-8 rounded-[2.5rem] transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-violet-100 text-violet-700 px-4 py-1 rounded-full text-xs font-black tracking-widest">{report.year}</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Published: {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-violet-700 transition-colors">
                      {report.title}
                    </h3>
                    {report.description && <p className="text-slate-500 font-medium mt-3 text-sm leading-relaxed">{report.description}</p>}
                  </div>

                  <div className="flex items-center gap-4">
                    {report.files?.length > 0 ? (
                      <button
                        onClick={() => handleFileAction(report.files[0], report.files)}
                        className="bg-violet-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-violet-700 transition-all shadow-xl shadow-violet-200 flex items-center gap-3 active:scale-95"
                      >
                        View Reports
                        <Eye size={20} />
                      </button>
                    ) : (
                      <span className="text-slate-300 font-bold text-sm italic">No attached files</span>
                    )}
                  </div>
                </div>

                {/* File Preview Stack if multiple */}
                {report.files?.length > 1 && (
                  <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap gap-3">
                    {report.files.map((file, i) => (
                      <div
                        key={i}
                        onClick={() => handleFileAction(file, report.files)}
                        className="bg-slate-50 hover:bg-violet-50 p-3 rounded-2xl transition-all border border-transparent hover:border-violet-200 flex items-center gap-3 cursor-pointer group/file"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 group-hover/file:scale-110 transition-transform">
                          {isImageFile(file) ? <ImageIcon size={16} className="text-violet-500" /> : isVideoFile(file) ? <FileVideo size={16} className="text-red-500" /> : <FileText size={16} className="text-slate-500" />}
                        </div>
                        <span className="text-[10px] font-black text-slate-900 truncate max-w-[120px] uppercase tracking-tighter">{file.originalName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIEW MODAL (Same robust viewer as admin) */}
      {showViewer && selectedFile && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={isFullscreen ? "w-screen h-screen" : "bg-white w-full sm:max-w-6xl h-full sm:h-[90vh] sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"}>

            {/* Header */}
            <div className="p-4 sm:px-8 sm:py-6 border-b flex justify-between items-center bg-white text-slate-900 sticky top-0 z-10 flex-shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-xl font-black truncate leading-tight uppercase tracking-tight">{selectedFile.originalName}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Accomplishment report material</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={selectedFile.fileUrl}
                  download={selectedFile.originalName}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 sm:p-3 hover:bg-slate-50 text-slate-500 rounded-xl transition-all"
                  title="Download"
                >
                  <Download size={22} />
                </a>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hidden sm:flex p-2 sm:p-3 hover:bg-slate-50 text-slate-500 rounded-xl transition-all"
                >
                  {isFullscreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
                </button>
                <button onClick={() => { setShowViewer(false); setSelectedFile(null); }} className="p-2 sm:p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-900 flex items-center justify-center relative group overflow-hidden">
              {/* Navigation */}
              {previewFiles.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const newIndex = (currentPreviewIndex - 1 + previewFiles.length) % previewFiles.length;
                      setCurrentPreviewIndex(newIndex);
                      setSelectedFile(previewFiles[newIndex]);
                    }}
                    className="absolute left-4 z-20 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={() => {
                      const newIndex = (currentPreviewIndex + 1) % previewFiles.length;
                      setCurrentPreviewIndex(newIndex);
                      setSelectedFile(previewFiles[newIndex]);
                    }}
                    className="absolute right-4 z-20 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}

              <div className="w-full h-full flex items-center justify-center p-2 sm:p-8">
                {isImageFile(selectedFile) ? (
                  <img src={selectedFile.fileUrl} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onContextMenu={e => e.preventDefault()} />
                ) : isVideoFile(selectedFile) ? (
                  <video src={selectedFile.fileUrl} controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl" />
                ) : (
                  <iframe src={getEmbedUrl(selectedFile)} className="w-full h-full border-none bg-white rounded-2xl shadow-2xl" />
                )}
              </div>

              {previewFiles.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-xs font-black tracking-widest transition-opacity group-hover:opacity-100 opacity-80">
                  {currentPreviewIndex + 1} / {previewFiles.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Accomplishment;
