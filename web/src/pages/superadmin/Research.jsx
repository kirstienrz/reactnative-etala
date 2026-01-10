import React, { useState, useEffect } from 'react';
import { 
  Upload, Edit2, Trash2, Plus, X, Search, Calendar, 
  Image, BookOpen, User, Eye, Archive, ArchiveRestore, 
  Link, ExternalLink, RefreshCw, FileText 
} from 'lucide-react';

// Import API functions
import {
  getAllResearch,
  getResearchStats,
  createResearch,
  updateResearch,
  archiveResearch,
  restoreResearch,
  deleteResearch,
  bulkArchiveResearch,
  bulkRestoreResearch,
  bulkDeleteResearch,
  prepareResearchFormData,
  getAvailableYears,
  defaultResearchFilters
} from '../../api/research';

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <RefreshCw className="animate-spin text-blue-600" size={32} />
  </div>
);

// Error component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
    <div className="text-red-600 mb-2">{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Try Again
      </button>
    )}
  </div>
);

// Empty state component
const EmptyState = ({ message, subMessage }) => (
  <div className="col-span-full text-center py-12 bg-white rounded-lg border">
    <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
    <h3 className="text-xl font-semibold text-gray-600 mb-2">{message}</h3>
    <p className="text-gray-500">{subMessage}</p>
  </div>
);

export default function ResearchAdmin() {
  // State management
  const [researchData, setResearchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    archived: 0,
    withLinks: 0
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingResearch, setEditingResearch] = useState(null);
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [availableYears, setAvailableYears] = useState(['All Years']);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewResearch, setPreviewResearch] = useState(null);
  const [viewArchived, setViewArchived] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [researchFile, setResearchFile] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Form state with link field
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    year: new Date().getFullYear().toString(),
    abstract: '',
    tags: '',
    status: 'active',
    link: ''
  });

  // Fetch research data
  const fetchResearchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        status: viewArchived ? 'archived' : 'active',
        year: selectedYear !== 'All Years' ? selectedYear : '',
        search: searchQuery,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortBy
      };

      const response = await getAllResearch(filters);
      
      if (response.success) {
        setResearchData(response.data);
        setStats(response.stats);
        setPagination({
          page: response.currentPage,
          limit: pagination.limit,
          total: response.total,
          pages: response.pages
        });
      }
    } catch (error) {
      console.error('Error fetching research:', error);
      setError('Failed to load research data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await getResearchStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch available years
  const fetchAvailableYears = async () => {
    try {
      const years = await getAvailableYears();
      setAvailableYears(years);
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchResearchData();
    fetchStats();
    fetchAvailableYears();
  }, [viewArchived, selectedYear, searchQuery, sortBy, pagination.page]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle research file upload
  const handleResearchFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResearchFile(file);
    }
  };

  // Handle form submission (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = prepareResearchFormData(
        formData,
        thumbnailFile,
        researchFile
      );

      let response;
      if (editingResearch) {
        response = await updateResearch(editingResearch._id, formDataToSend);
      } else {
        response = await createResearch(formDataToSend);
      }

      if (response.success) {
        // Refresh data
        await fetchResearchData();
        await fetchStats();
        
        // Reset form and close modal
        resetForm();
        setShowModal(false);
        
        // Show success message
        alert(response.message);
      }
    } catch (error) {
      console.error('Error saving research:', error);
      alert(error.response?.data?.error || 'Failed to save research');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (research) => {
    setEditingResearch(research);
    setFormData({
      title: research.title,
      authors: research.authors,
      year: research.year,
      abstract: research.abstract,
      tags: research.tags?.join(', ') || '',
      status: research.status,
      link: research.link || ''
    });
    setThumbnailPreview(research.thumbnail?.url || '');
    setThumbnailFile(null);
    setResearchFile(null);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this research?')) return;
    
    try {
      const response = await deleteResearch(id);
      if (response.success) {
        await fetchResearchData();
        await fetchStats();
        alert(response.message);
      }
    } catch (error) {
      console.error('Error deleting research:', error);
      alert('Failed to delete research');
    }
  };

  // Handle archive
  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive this research?')) return;
    
    try {
      const response = await archiveResearch(id);
      if (response.success) {
        await fetchResearchData();
        await fetchStats();
        alert(response.message);
      }
    } catch (error) {
      console.error('Error archiving research:', error);
      alert('Failed to archive research');
    }
  };

  // Handle restore
  const handleRestore = async (id) => {
    if (!window.confirm('Are you sure you want to restore this research?')) return;
    
    try {
      const response = await restoreResearch(id);
      if (response.success) {
        await fetchResearchData();
        await fetchStats();
        alert(response.message);
      }
    } catch (error) {
      console.error('Error restoring research:', error);
      alert('Failed to restore research');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      authors: '',
      year: new Date().getFullYear().toString(),
      abstract: '',
      tags: '',
      status: 'active',
      link: ''
    });
    setThumbnailPreview(null);
    setThumbnailFile(null);
    setResearchFile(null);
    setEditingResearch(null);
  };

  // Toggle item selection
  const toggleItemSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.size === researchData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(researchData.map(item => item._id)));
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedItems.size === 0) return;

    const actionText = action === 'archive' ? 'archive' : 
                      action === 'restore' ? 'restore' : 'delete';
    
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedItems.size} item(s)?`)) return;

    try {
      const ids = Array.from(selectedItems);
      let response;

      switch (action) {
        case 'archive':
          response = await bulkArchiveResearch(ids);
          break;
        case 'restore':
          response = await bulkRestoreResearch(ids);
          break;
        case 'delete':
          response = await bulkDeleteResearch(ids);
          break;
      }

      if (response.success) {
        await fetchResearchData();
        await fetchStats();
        setSelectedItems(new Set());
        alert(response.message);
      }
    } catch (error) {
      console.error(`Error bulk ${action}:`, error);
      alert(`Failed to ${action} research items`);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render loading state
  if (loading && researchData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Render error state
  if (error && researchData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={fetchResearchData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Research Publications</h1>
              <p className="text-gray-600 mt-1">
                {viewArchived 
                  ? 'Viewing archived research' 
                  : 'Manage active research publications'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchResearchData}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                title="Refresh"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={() => setViewArchived(!viewArchived)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition shadow-sm flex items-center gap-2"
              >
                {viewArchived ? 'View Active Research' : 'View Archived Research'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards - Active/Archived */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600 mb-1">Total Research</div>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600 mb-1">Active Research</div>
            <div className="text-2xl font-bold text-green-900">
              {viewArchived ? '—' : stats.active}
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm font-medium text-yellow-600 mb-1">Archived Research</div>
            <div className="text-2xl font-bold text-yellow-900">
              {viewArchived ? stats.archived : '—'}
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-600 mb-1">With Links</div>
            <div className="text-2xl font-bold text-purple-900">
              {stats.withLinks}
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${viewArchived ? 'archived' : 'active'} research...`}
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>

              {!viewArchived && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add New Research
                </button>
              )}

              {researchData.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {selectedItems.size === researchData.length && researchData.length > 0 ? 
                    'Deselect All' : 'Select All'
                  }
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedItems.size} item(s) selected
              </div>
              <div className="flex gap-2">
                {viewArchived ? (
                  <>
                    <button
                      onClick={() => handleBulkAction('restore')}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm flex items-center gap-1"
                    >
                      <ArchiveRestore size={14} />
                      Restore Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete Selected
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleBulkAction('archive')}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm flex items-center gap-1"
                    >
                      <Archive size={14} />
                      Archive Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete Selected
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Research Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchResearchData} />
        ) : researchData.length === 0 ? (
          <EmptyState
            message={searchQuery
              ? 'No research found matching your search'
              : viewArchived
                ? 'No archived research found'
                : 'No research found'}
            subMessage={!viewArchived && !searchQuery && 'Start by adding new research publications'}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {researchData.map(research => (
                <div
                  key={research._id}
                  className={`bg-white rounded-lg border overflow-hidden hover:shadow-lg transition ${selectedItems.has(research._id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(research._id)}
                          onChange={() => toggleItemSelection(research._id)}
                          className="w-4 h-4"
                        />
                        {research.status === 'archived' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Archived
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {research.link && (
                          <a
                            href={research.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-500 hover:text-blue-600"
                            title="Open Link"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        {research.researchFile?.url && (
                          <a
                            href={research.researchFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-500 hover:text-blue-600"
                            title="Download File"
                          >
                            <FileText size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => setPreviewResearch(research)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(research)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        {viewArchived ? (
                          <button
                            onClick={() => handleRestore(research._id)}
                            className="p-1 text-gray-500 hover:text-green-600"
                            title="Restore"
                          >
                            <ArchiveRestore size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchive(research._id)}
                            className="p-1 text-gray-500 hover:text-yellow-600"
                            title="Archive"
                          >
                            <Archive size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(research._id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <img
                      src={research.thumbnail?.url || 'https://via.placeholder.com/400x300'}
                      alt={research.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />

                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                      {research.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <User size={14} />
                      <span className="line-clamp-1">{research.authors}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar size={14} />
                      <span className="ml-1">{research.year}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {research.abstract}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {research.tags?.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {research.tags?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{research.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewResearch(research)}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      {research.link && (
                        <a
                          href={research.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                        >
                          <ExternalLink size={14} />
                          Open Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Research Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingResearch ? 'Edit Research' : 'Add New Research'}
              </h2>
              <button onClick={() => {
                resetForm();
                setShowModal(false);
              }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter research title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authors *
                    </label>
                    <input
                      type="text"
                      name="authors"
                      value={formData.authors}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter author names (separated by commas)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      min="2000"
                      max="2099"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      External Link (Optional)
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="url"
                        name="link"
                        value={formData.link}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/research-link"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Add a link to the full research paper or external resource
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (Optional)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tags (separated by commas)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail Image (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                        id="thumbnailUpload"
                      />
                      <label htmlFor="thumbnailUpload" className="cursor-pointer">
                        {thumbnailPreview ? (
                          <div className="space-y-2">
                            <img
                              src={thumbnailPreview}
                              alt="Thumbnail preview"
                              className="w-32 h-32 object-cover rounded-lg mx-auto"
                            />
                            <p className="text-center text-sm text-blue-600">
                              Click to change thumbnail
                            </p>
                          </div>
                        ) : editingResearch?.thumbnail?.url ? (
                          <div className="space-y-2">
                            <img
                              src={editingResearch.thumbnail.url}
                              alt="Current thumbnail"
                              className="w-32 h-32 object-cover rounded-lg mx-auto"
                            />
                            <p className="text-center text-sm text-blue-600">
                              Click to change thumbnail
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                            <p className="text-gray-600">Click to upload thumbnail</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research File (Optional - PDF, DOC, DOCX)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResearchFileUpload}
                        className="hidden"
                        id="researchFileUpload"
                      />
                      <label htmlFor="researchFileUpload" className="cursor-pointer">
                        <div className="text-center py-4">
                          <FileText className="mx-auto text-gray-400 mb-2" size={24} />
                          <p className="text-gray-600">
                            {researchFile 
                              ? `Selected: ${researchFile.name}`
                              : editingResearch?.researchFile?.originalName
                              ? `Current: ${editingResearch.researchFile.originalName}`
                              : 'Click to upload research file'
                            }
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Abstract *
                    </label>
                    <textarea
                      name="abstract"
                      value={formData.abstract}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter research abstract"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowModal(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        {editingResearch ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingResearch ? 'Update Research' : 'Create Research'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Research Preview Modal */}
      {previewResearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Research Details</h2>
              <button
                onClick={() => setPreviewResearch(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <img
                  src={previewResearch.thumbnail?.url || 'https://via.placeholder.com/800x600'}
                  alt={previewResearch.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {previewResearch.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <User size={16} />
                    <span className="font-medium">{previewResearch.authors}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Publication Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year:</span>
                        <span className="font-medium">{previewResearch.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${previewResearch.status === 'archived' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {previewResearch.status === 'archived' ? 'Archived' : 'Active'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published:</span>
                        <span className="font-medium">{formatDate(previewResearch.datePublished)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {previewResearch.link && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                        <Link size={16} />
                        External Link
                      </h3>
                      <a
                        href={previewResearch.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm truncate block"
                      >
                        {previewResearch.link}
                      </a>
                    </div>
                  )}

                  {previewResearch.researchFile?.url && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                        <FileText size={16} />
                        Research File
                      </h3>
                      <a
                        href={previewResearch.researchFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        {previewResearch.researchFile.originalName || 'Download File'}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Abstract</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {previewResearch.abstract}
                </p>
              </div>

              {previewResearch.tags && previewResearch.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {previewResearch.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleEdit(previewResearch);
                    setPreviewResearch(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Research
                </button>
                {previewResearch.status === 'active' ? (
                  <button
                    onClick={() => {
                      handleArchive(previewResearch._id);
                      setPreviewResearch(null);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Archive Research
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleRestore(previewResearch._id);
                      setPreviewResearch(null);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Restore Research
                  </button>
                )}
                {previewResearch.link && (
                  <a
                    href={previewResearch.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Open Link
                  </a>
                )}
                <button
                  onClick={() => setPreviewResearch(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}