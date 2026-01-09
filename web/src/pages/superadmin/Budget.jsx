import React, { useEffect, useState } from "react";
import { FileText, Upload, DollarSign, X, Eye, ChevronLeft, ChevronRight, AlertCircle, Trash2, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { getAllBudgets, uploadBudget, deleteBudget } from "../../api/budget";

const BudgetProgramsDashboard = () => {
  const [activeTab, setActiveTab] = useState("reports");
  const [budgets, setBudgets] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [alertModal, setAlertModal] = useState(null);

  // FETCH ALL
  const fetchBudgets = async () => {
    try {
      const data = await getAllBudgets();
      setBudgets(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  // DRAG AND DROP HANDLERS
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
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Check if file type is allowed
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (allowedTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
      } else {
        setAlertModal({ type: 'error', message: 'Only PDF and image files (JPG, PNG) are allowed' });
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // UPLOAD
  const handleUpload = async () => {
    if (!title || !file) { 
      setAlertModal({ type: 'error', message: 'Title and file are required' });
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);
      await uploadBudget(formData);

      setTitle("");
      setFile(null);
      fetchBudgets();
      setActiveTab("reports");
      setAlertModal({ type: 'success', message: 'Budget uploaded successfully!' });
    } catch (err) {
      console.error("❌ Upload Error:", err.response?.data || err.message);
      setAlertModal({ type: 'error', message: 'Upload failed: ' + (err.response?.data?.message || err.message) });
    } finally { setLoading(false); }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    try {
      await deleteBudget(id);
      fetchBudgets();
      setAlertModal({ type: 'success', message: 'Budget deleted successfully!' });
    } catch (err) {
      console.error(err);
      setAlertModal({ type: 'error', message: 'Delete failed: ' + (err.response?.data?.message || err.message) });
    }
  };

  // File type badge
  const getFileTypeBadge = (format) => {
    if (!format) return "File";
    if (format.includes("pdf")) return "PDF";
    if (format.includes("image")) return "Image";
    return "File";
  };

  // Preview
  const openPreview = (item) => {
    setPreviewFile(item);
    setCurrentPage(0);
    setImageError(false);
    setZoomLevel(1);
  };
  
  const closePreview = () => {
    setPreviewFile(null);
    setCurrentPage(0);
    setImageError(false);
    setZoomLevel(1);
  };
  
  const nextPage = () => {
    if (previewFile && currentPage < previewFile.file.page_count - 1) {
      setCurrentPage(currentPage + 1);
      setImageError(false);
      setZoomLevel(1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setImageError(false);
      setZoomLevel(1);
    }
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Budget & Programs</h1>
          </div>
          <p className="text-gray-600 text-sm ml-9">Manage and preview budget documents</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-5">
          {["reports", "budgetUpload"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab === "budgetUpload" ? "Upload New" : "All Documents"}
            </button>
          ))}
        </div>

        {/* UPLOAD TAB */}
        {activeTab === "budgetUpload" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-5 py-3">
              <h3 className="text-base font-semibold text-white">Upload New Document</h3>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. GAD Annual Budget 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div 
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  
                  <div className="pointer-events-none">
                    <div className={`inline-flex p-3 rounded-full mb-3 ${
                      isDragging ? 'bg-blue-200' : 'bg-gray-100'
                    }`}>
                      <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <p className="text-blue-600 font-medium mb-1">
                      {isDragging ? 'Drop file here' : 'Click to browse or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">PDF and Images (JPG, PNG) • Max 25MB</p>
                  </div>
                </div>
                
                {file && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center gap-2 border border-blue-200">
                    <div className="p-1.5 bg-blue-600 rounded">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-800 font-medium flex-1">{file.name}</span>
                    <button onClick={() => setFile(null)} 
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={handleUpload} disabled={loading || !title || !file}
                  className="flex-1 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-md">
                  {loading ? "Uploading..." : "Upload Document"}
                </button>
                <button onClick={() => { setTitle(""); setFile(null); }}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Document Library</h3>
                <p className="text-xs text-gray-500 mt-0.5">{budgets.length} {budgets.length === 1 ? 'document' : 'documents'}</p>
              </div>
            </div>

            {budgets.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No documents uploaded yet</p>
                <p className="text-gray-400 text-sm mt-1">Upload your first budget document to get started</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {budgets.map(item => (
                    <div key={item._id} className="p-4 hover:bg-blue-50/50 transition-colors flex items-center gap-4">
                      
                      {/* Icon */}
                      <div className="p-2.5 bg-blue-100 rounded-lg">
                        <FileText className="text-blue-600 w-5 h-5" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>
                            {new Date(item.createdAt).toLocaleDateString("en-US", { 
                              year:"numeric", month:"short", day:"numeric" 
                            })}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {getFileTypeBadge(item.file.format)}
                          </span>
                          {item.file.page_count > 1 && (
                            <span className="text-blue-600 font-medium">
                              {item.file.page_count} pages
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openPreview(item)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                          <Eye size={14} /> Preview
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)}
                          className="flex items-center justify-center bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                          title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PREVIEW MODAL */}
        {previewFile && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="bg-blue-600 px-5 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-base">{previewFile.title}</h3>
                  {previewFile.file.page_count > 1 && (
                    <p className="text-blue-100 text-xs mt-0.5">
                      Page {currentPage + 1} of {previewFile.file.page_count}
                    </p>
                  )}
                </div>
                <button 
                  onClick={closePreview} 
                  className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Image Display */}
              <div className="flex-1 bg-gray-100 overflow-auto min-h-0">
                <div className="w-full min-h-full flex items-center justify-center p-4">
                  {imageError ? (
                    <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-sm">
                      <div className="inline-flex p-3 bg-yellow-100 rounded-full mb-3">
                        <AlertCircle className="w-8 h-8 text-yellow-600" />
                      </div>
                      <p className="text-gray-800 font-semibold mb-1">Unable to load preview</p>
                      <p className="text-sm text-gray-500 mb-3">This page may not be available yet</p>
                      <button 
                        onClick={() => setImageError(false)} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <img 
                      src={previewFile.file.image_urls[currentPage]} 
                      className="rounded-lg shadow-lg transition-transform duration-200 block" 
                      style={{ 
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'center center',
                        width: 'auto',
                        maxWidth: zoomLevel === 1 ? '100%' : 'none',
                        height: 'auto'
                      }}
                      alt={`Page ${currentPage + 1}`}
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
              </div>

              {/* Zoom Controls */}
              {!imageError && (
                <div className="bg-white border-t border-gray-200 px-4 py-1.5 flex items-center justify-center gap-1 flex-shrink-0">
                  <button 
                    onClick={zoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Zoom Out">
                    <ZoomOut size={16} />
                  </button>
                  
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-medium rounded text-xs min-w-[50px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  
                  <button 
                    onClick={resetZoom}
                    className="p-1.5 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Reset Zoom">
                    <RotateCw size={16} />
                  </button>
                  
                  <button 
                    onClick={zoomIn}
                    disabled={zoomLevel >= 3}
                    className="p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Zoom In">
                    <ZoomIn size={16} />
                  </button>
                </div>
              )}

              {/* Navigation Footer */}
              {previewFile.file.page_count > 1 && !imageError && (
                <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
                  <button 
                    onClick={prevPage} 
                    disabled={currentPage === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200">
                    <ChevronLeft size={16} /> Previous
                  </button>
                  
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded text-xs">
                    {currentPage + 1} / {previewFile.file.page_count}
                  </span>
                  
                  <button 
                    onClick={nextPage} 
                    disabled={currentPage === previewFile.file.page_count - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200">
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ALERT MODAL */}
        {alertModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
              <div className={`p-4 ${alertModal.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${alertModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {alertModal.type === 'success' ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${alertModal.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                      {alertModal.type === 'success' ? 'Success' : 'Error'}
                    </h3>
                    <p className={`text-sm mt-0.5 ${alertModal.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                      {alertModal.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-end">
                <button 
                  onClick={() => setAlertModal(null)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    alertModal.type === 'success' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}>
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BudgetProgramsDashboard;