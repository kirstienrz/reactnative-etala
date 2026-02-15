import React, { useState, useEffect } from 'react';
import { FileText, Eye, Calendar, Loader, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveBudgets } from '../../api/budget';

const PlanAndBudget = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
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
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setCurrentPage(0);
    setImageError(false);
    setZoomLevel(100);
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
    switch(status) {
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
      <section className="relative pt-20 pb-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Plan and Budget
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Official GAD plans, budgets, and accomplishment reports
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8">
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
        <div className="max-w-5xl mx-auto px-8">
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
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full">
                              {doc.year}
                            </span>
                            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </div>
                          
                          <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">
                            {doc.title}
                          </h2>
                          
                          {doc.description && (
                            <p className="text-slate-600 leading-relaxed mb-4">
                              {doc.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
                            {doc.dateApproved && (
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Approved: {new Date(doc.dateApproved).toLocaleDateString("en-US", { 
                                  year:"numeric", month:"long", day:"numeric" 
                                })}
                              </span>
                            )}
                            {doc.file.page_count > 0 && (
                              <span>{doc.file.page_count} {doc.file.page_count === 1 ? 'page' : 'pages'}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleView(doc)}
                              className="bg-white text-violet-700 border border-violet-200 rounded-lg px-4 py-2 shadow hover:bg-violet-50 transition-colors"
                            >
                              <Eye className="w-5 h-5" />
                              View Document
                            </button>
                          </div>
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
                          className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${
                            currentListPage === pageNumber
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

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-600 px-6 py-4 flex items-start justify-between flex-shrink-0">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-white text-xl mb-2">{previewDoc.title}</h3>
                
                {previewDoc.description && (
                  <p className="text-violet-100 text-sm mb-3 leading-relaxed">
                    {previewDoc.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full font-semibold text-white">
                    Year: {previewDoc.year}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full font-semibold ${getStatusColor(previewDoc.status)}`}>
                    {previewDoc.status}
                  </span>
                  {previewDoc.dateApproved && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white">
                      <Calendar className="w-3 h-3" />
                      {new Date(previewDoc.dateApproved).toLocaleDateString("en-US", { 
                        month:"short", day:"numeric", year:"numeric"
                      })}
                    </span>
                  )}
                  {previewDoc.file.page_count > 1 && (
                    <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full font-semibold text-white">
                      {previewDoc.file.page_count} pages
                    </span>
                  )}
                </div>
                
                {previewDoc.file.page_count > 1 && (
                  <p className="text-violet-100 text-sm mt-2 font-medium">
                    Viewing Page {currentPage + 1} of {previewDoc.file.page_count}
                  </p>
                )}
              </div>
              <button 
                onClick={closePreview} 
                className="text-violet-200 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={zoomOut}
                  disabled={zoomLevel <= 50}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm min-w-[70px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={zoomIn}
                  disabled={zoomLevel >= 200}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={resetZoom}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors ml-2"
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Display */}
            <div className="flex-1 bg-slate-100 overflow-auto min-h-0">
              <div className="w-full h-full flex items-start justify-center p-6">
                {imageError ? (
                  <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                    <div className="inline-flex p-4 bg-yellow-100 rounded-full mb-4">
                      <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-slate-800 font-semibold text-lg mb-2">Unable to load preview</p>
                    <p className="text-sm text-slate-600 mb-4">This page may not be available yet</p>
                    <button 
                      onClick={() => setImageError(false)} 
                      className="px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm font-medium transition-colors">
                      Try Again
                    </button>
                  </div>
                ) : (
                  <img 
                    src={previewDoc.file.image_urls[currentPage]} 
                    style={{ 
                      width: `${zoomLevel}%`,
                      maxWidth: 'none',
                      height: 'auto'
                    }}
                    className="rounded-lg shadow-2xl object-contain" 
                    alt={`Page ${currentPage + 1}`}
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
            </div>

            {/* Navigation Footer */}
            {previewDoc.file.page_count > 1 && !imageError && (
              <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 text-slate-700 hover:bg-slate-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <span className="px-4 py-2 bg-violet-100 text-violet-700 font-bold rounded-lg text-sm">
                  {currentPage + 1} / {previewDoc.file.page_count}
                </span>
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === previewDoc.file.page_count - 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 text-slate-700 hover:bg-slate-200">
                  Next
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default PlanAndBudget;