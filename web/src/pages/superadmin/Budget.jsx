import React, { useEffect, useState } from "react";
import { FileText, Upload, DollarSign, X, Eye, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
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

  // UPLOAD
  const handleUpload = async () => {
    if (!title || !file) { alert("Title and file are required"); return; }
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
      alert("✅ Budget uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload Error:", err.response?.data || err.message);
      alert("❌ Upload failed: " + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    try {
      await deleteBudget(id);
      fetchBudgets();
      alert("✅ Budget deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Delete failed: " + (err.response?.data?.message || err.message));
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
  };
  
  const closePreview = () => {
    setPreviewFile(null);
    setCurrentPage(0);
    setImageError(false);
  };
  
  const nextPage = () => {
    if (previewFile && currentPage < previewFile.file.page_count - 1) {
      setCurrentPage(currentPage + 1);
      setImageError(false);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setImageError(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Budget & Programs</h1>
          </div>
          <p className="text-gray-600 ml-14">Manage and preview budget documents</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          {["reports", "budgetUpload"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 font-medium rounded-lg transition-all ${
                activeTab === tab 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab === "budgetUpload" ? "Upload New" : "All Documents"}
            </button>
          ))}
        </div>

        {/* UPLOAD TAB */}
        {activeTab === "budgetUpload" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Upload New Document</h3>
              <p className="text-blue-100 text-sm">Add a new budget or program file</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="e.g. GAD Annual Budget 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <label className="cursor-pointer">
                      <span className="text-blue-600 font-semibold hover:text-blue-700 text-lg">Browse files</span>
                      <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} 
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">PDF and Images (JPG, PNG)</p>
                    <p className="text-xs text-gray-400 mt-1">Maximum file size: 25MB</p>
                  </div>
                  
                  {file && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl inline-flex items-center gap-3 border border-blue-200">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm text-gray-800 font-medium">{file.name}</span>
                      <button onClick={() => setFile(null)} 
                        className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleUpload} disabled={loading || !title || !file}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-blue-600/30 disabled:shadow-none">
                  {loading ? "Uploading..." : "Upload Document"}
                </button>
                <button onClick={() => { setTitle(""); setFile(null); }}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
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
                <h3 className="text-xl font-semibold text-gray-900">Document Library</h3>
                <p className="text-sm text-gray-500 mt-1">{budgets.length} {budgets.length === 1 ? 'document' : 'documents'} available</p>
              </div>
            </div>

            {budgets.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                <div className="inline-flex p-6 bg-gray-100 rounded-full mb-4">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No documents uploaded yet</p>
                <p className="text-gray-400 text-sm mt-1">Upload your first budget document to get started</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {budgets.map(item => (
                  <div key={item._id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all group">
                    
                    {/* Header with Icon */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 border-b border-blue-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <FileText className="text-blue-600 w-7 h-7" />
                        </div>
                        <span className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-full">
                          {getFileTypeBadge(item.file.format)}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 line-clamp-2 text-lg leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString("en-US", { 
                            year:"numeric", month:"short", day:"numeric" 
                          })}
                        </span>
                        {item.file.page_count > 1 && (
                          <span className="text-blue-600 font-medium">
                            {item.file.page_count} pages
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openPreview(item)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/30 hover:shadow-lg">
                          <Eye size={16} /> Preview
                        </button>
                        <button onClick={() => handleDelete(item._id)}
                          className="flex items-center justify-center bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                          title="Delete">
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PREVIEW MODAL */}
        {previewFile && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">{previewFile.title}</h3>
                  {previewFile.file.page_count > 1 && (
                    <p className="text-blue-100 text-sm mt-0.5">
                      Page {currentPage + 1} of {previewFile.file.page_count}
                    </p>
                  )}
                </div>
                <button 
                  onClick={closePreview} 
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                  <X size={22} />
                </button>
              </div>

              {/* Image Display */}
              <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center overflow-auto">
                {imageError ? (
                  <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <div className="inline-flex p-4 bg-yellow-100 rounded-full mb-4">
                      <AlertCircle className="w-10 h-10 text-yellow-600" />
                    </div>
                    <p className="text-gray-800 font-semibold text-lg mb-2">Unable to load preview</p>
                    <p className="text-sm text-gray-500 mb-4">This page may not be available yet</p>
                    <button 
                      onClick={() => setImageError(false)} 
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-600/30">
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="relative max-w-full max-h-full">
                    <img 
                      src={previewFile.file.image_urls[currentPage]} 
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                      alt={`Page ${currentPage + 1}`}
                      onError={() => setImageError(true)}
                    />
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              {previewFile.file.page_count > 1 && !imageError && (
                <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <button 
                    onClick={prevPage} 
                    disabled={currentPage === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100">
                    <ChevronLeft size={20} /> Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl text-sm">
                      {currentPage + 1} / {previewFile.file.page_count}
                    </span>
                  </div>
                  
                  <button 
                    onClick={nextPage} 
                    disabled={currentPage === previewFile.file.page_count - 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100">
                    Next <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BudgetProgramsDashboard;