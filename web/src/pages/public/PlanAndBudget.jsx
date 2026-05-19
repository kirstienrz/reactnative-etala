import React, { useState, useEffect } from 'react';
import { FileText, Eye, Calendar, Loader, ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';
import { getActiveBudgets } from '../../api/budget';

const PlanAndBudget = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pagination states
  const [currentListPage, setCurrentListPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch documents - ONLY ACTIVE (non-archived)
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await getActiveBudgets(); // Changed from getAllBudgets to getActiveBudgets
        const approvedDocs = data.filter(doc => doc.status === 'Approved');
        setDocuments(approvedDocs);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const startIndex = (currentListPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = documents.slice(startIndex, endIndex);

  const handleView = (doc) => {
    setPreviewDoc(doc);
    setCurrentPage(0);
    setImageError(false);
    setZoomLevel(100);
    setIsFullscreen(false);
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setCurrentPage(0);
    setImageError(false);
    setZoomLevel(100);
    setIsFullscreen(false);
  };

  const nextPage = () => {
    if (previewDoc && currentPage < previewDoc.file.page_count - 1) {
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

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  // Pagination functions
  const goToPage = (page) => {
    setCurrentListPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextListPage = () => {
    if (currentListPage < totalPages) {
      setCurrentListPage(currentListPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevListPage = () => {
    if (currentListPage > 1) {
      setCurrentListPage(currentListPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-violet-100 text-violet-700';
    }
  };

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight select-none">
            Plan and <span className="text-violet-400">Budget</span>
          </h1>
          <div className="w-20 h-1.5 bg-violet-500 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-violet-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Official GAD plans, resource allocations, and institutional accountability reports.
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">About GAD Plans and Budgets</h2>
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              The Gender and Development (GAD) Plan and Budget outlines the university's strategic framework for promoting gender equality and women's empowerment. These documents detail the programs, activities, and financial allocations dedicated to GAD initiatives across all institutional units.
            </p>
            <p>
              All plans and budgets presented here have been officially approved and are aligned with national policies on gender mainstreaming, including the Magna Carta of Women and relevant government directives on GAD budget allocation.
            </p>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-12 h-12 text-violet-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
                <FileText className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Documents Available</h3>
              <p className="text-slate-600">There are currently no approved documents to display.</p>
            </div>
          ) : (
            <>
              {/* Document List */}
              <div className="space-y-6 mb-8">
                {currentDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-violet-400 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-start gap-6 flex-1">
                          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                            <FileText className="w-8 h-8 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="inline-block px-3 py-1 bg-violet-50 text-violet-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                {doc.year}
                              </span>
                              <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${getStatusColor(doc.status)}`}>
                                {doc.status}
                              </span>
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-violet-600 transition-colors">
                              {doc.title}
                            </h2>

                            {doc.description && (
                              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-4 line-clamp-2">
                                {doc.description}
                              </p>
                            )}

                            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              {doc.dateApproved && (
                                <span className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Approved: {new Date(doc.dateApproved).toLocaleDateString("en-US", {
                                    year: "numeric", month: "short", day: "numeric"
                                  })}
                                </span>
                              )}
                              {doc.file.page_count > 0 && (
                                <span className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  {doc.file.page_count} {doc.file.page_count === 1 ? 'page' : 'pages'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleView(doc)}
                            className="w-full md:w-auto bg-violet-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-violet-700 transition-all shadow-xl shadow-violet-200 flex items-center justify-center gap-3 active:scale-95 group/btn"
                          >
                            View Document
                            <Eye size={20} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={prevListPage}
                    disabled={currentListPage === 1}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentListPage - 1 && pageNumber <= currentListPage + 1);

                      const showEllipsis =
                        (pageNumber === 2 && currentListPage > 3) ||
                        (pageNumber === totalPages - 1 && currentListPage < totalPages - 2);

                      if (showEllipsis) {
                        return (
                          <span key={index} className="px-3 py-2 text-slate-400">
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={index}
                          onClick={() => goToPage(pageNumber)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${currentListPage === pageNumber
                            ? 'bg-violet-600 text-white'
                            : 'border border-slate-300 hover:bg-slate-100'
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={nextListPage}
                    disabled={currentListPage === totalPages}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Pagination Info */}
              {totalPages > 1 && (
                <div className="text-center mt-4 text-sm text-slate-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, documents.length)} of {documents.length} documents
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Preview Modal (Updated to match premium document viewer style) */}
      {previewDoc && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-300" onClick={closePreview}>
          <div
            className={isFullscreen ? "fixed inset-0 w-screen h-screen bg-white z-[10001] flex flex-col overflow-hidden" : "bg-white w-full sm:max-w-6xl h-[90vh] sm:rounded-[3rem] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:px-10 sm:py-6 border-b flex justify-between items-center bg-white text-slate-900 sticky top-0 z-10 flex-shrink-0">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-xl font-black truncate leading-tight uppercase tracking-tight">{previewDoc.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Plan & Budget Material • {previewDoc.year}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getStatusColor(previewDoc.status)}`}>
                      {previewDoc.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <a 
                  href={(previewDoc.file.url || previewDoc.file.image_urls[0])?.replace("http://", "https://")} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                  title="Open in new tab"
                >
                  <ExternalLink size={24} />
                </a>
                <div className="hidden sm:flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <button
                    onClick={zoomOut}
                    disabled={zoomLevel <= 50}
                    className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg disabled:opacity-30 transition-all"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <span className="text-xs font-black text-slate-600 min-w-[45px] text-center">{zoomLevel}%</span>
                  <button
                    onClick={zoomIn}
                    disabled={zoomLevel >= 200}
                    className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg disabled:opacity-30 transition-all"
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hidden sm:flex p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                >
                  {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                </button>
                <button
                  onClick={closePreview}
                  className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Document Viewer Area */}
            <div className="flex-1 bg-slate-900 relative overflow-hidden group min-h-0">
              <div className="absolute inset-0 overflow-auto custom-scrollbar p-4 sm:p-10 flex items-start justify-center">
                {imageError ? (
                  <div className="text-center p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] max-w-md my-auto">
                    <div className="inline-flex p-5 bg-amber-500/10 text-amber-500 rounded-full mb-6">
                      <FileText size={48} />
                    </div>
                    <h3 className="text-white text-xl font-black mb-2 uppercase tracking-tight">Preview Unavailable</h3>
                    <p className="text-white/50 text-sm font-medium mb-8">This document page is still being processed or is currently offline.</p>
                    <button
                      onClick={() => setImageError(false)}
                      className="w-full px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-violet-400 hover:text-white transition-all"
                    >
                      Attempt Reconnect
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={previewDoc.file.image_urls[currentPage]?.replace("http://", "https://")}
                      style={{
                        width: `${zoomLevel}%`,
                        maxWidth: 'none',
                        height: 'auto'
                      }}
                      className="rounded-lg shadow-2xl transition-all duration-300"
                      alt={`Page ${currentPage + 1}`}
                      onError={() => setImageError(true)}
                    />
                  </div>
                )}
              </div>

              {/* Navigation Overlays */}
              {!imageError && previewDoc.file.page_count > 1 && (
                <>
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="absolute left-6 z-20 p-5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 disabled:hidden"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === previewDoc.file.page_count - 1}
                    className="absolute right-6 z-20 p-5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 disabled:hidden"
                  >
                    <ChevronRight size={32} />
                  </button>

                  {/* Page Indicator Bubble */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full text-xs font-black tracking-[0.2em] transition-all group-hover:scale-110">
                    {currentPage + 1} / {previewDoc.file.page_count}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PlanAndBudget;