import React, { useEffect, useState } from "react";
import { FileText, Upload, DollarSign, X, Eye, ChevronLeft, ChevronRight, AlertCircle, Archive, ArchiveRestore, Edit2, Calendar, Search, Check } from "lucide-react";
import { getAllBudgets, uploadBudget, updateBudget, archiveBudget, unarchiveBudget, getActiveBudgets, getArchivedBudgets } from "../../api/budget";

const BudgetProgramsDashboard = () => {
  const [activeTab, setActiveTab] = useState("reports");
  const [budgets, setBudgets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [dateApproved, setDateApproved] = useState("");
  const [status, setStatus] = useState("Pending");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [alertModal, setAlertModal] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPageList, setCurrentPageList] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // FETCH BUDGETS
  const fetchBudgets = async () => {
    try {
      const data = activeTab === "archived" 
        ? await getArchivedBudgets() 
        : await getActiveBudgets();
      setBudgets(data);
      setSelectedItems([]);
      setIsSelectionMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBudgets(); }, [activeTab]);

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

  // CLEAR FORM
  const clearForm = () => {
    setTitle("");
    setDescription("");
    setYear("");
    setDateApproved("");
    setStatus("Pending");
    setFile(null);
    setEditingBudget(null);
  };

  // UPLOAD
  const handleUpload = async () => {
    if (!title || !year || !file) { 
      setAlertModal({ type: 'error', message: 'Title, year, and file are required' });
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("year", year);
      formData.append("dateApproved", dateApproved);
      formData.append("status", status);
      formData.append("file", file);
      await uploadBudget(formData);

      clearForm();
      fetchBudgets();
      setActiveTab("reports");
      setAlertModal({ type: 'success', message: 'Budget uploaded successfully!' });
      setCurrentPageList(1);
    } catch (err) {
      console.error("❌ Upload Error:", err.response?.data || err.message);
      setAlertModal({ type: 'error', message: 'Upload failed: ' + (err.response?.data?.message || err.message) });
    } finally { setLoading(false); }
  };

  // EDIT
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setTitle(budget.title);
    setDescription(budget.description || "");
    setYear(budget.year);
    setDateApproved(budget.dateApproved ? new Date(budget.dateApproved).toISOString().split('T')[0] : "");
    setStatus(budget.status || "Pending");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    clearForm();
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!title || !year) { 
      setAlertModal({ type: 'error', message: 'Title and year are required' });
      return;
    }
    try {
      setLoading(true);
      await updateBudget(editingBudget._id, {
        title,
        description,
        year,
        dateApproved,
        status
      });

      closeEditModal();
      fetchBudgets();
      setAlertModal({ type: 'success', message: 'Budget updated successfully!' });
      setCurrentPageList(1);
    } catch (err) {
      console.error("❌ Update Error:", err.response?.data || err.message);
      setAlertModal({ type: 'error', message: 'Update failed: ' + (err.response?.data?.message || err.message) });
    } finally { setLoading(false); }
  };

  // ARCHIVE SINGLE
  const handleArchiveSingle = async (id) => {
    if (!window.confirm("Are you sure you want to archive this budget?")) return;
    try {
      await archiveBudget(id);
      fetchBudgets();
      setAlertModal({ type: 'success', message: 'Budget archived successfully!' });
    } catch (err) {
      console.error(err);
      setAlertModal({ type: 'error', message: 'Archive failed: ' + (err.response?.data?.message || err.message) });
    }
  };

  // ARCHIVE MULTIPLE
  const handleArchiveMultiple = async () => {
    if (selectedItems.length === 0) {
      setAlertModal({ type: 'error', message: 'Please select items to archive' });
      return;
    }
    
    if (!window.confirm(`Archive ${selectedItems.length} selected item(s)?`)) return;
    
    try {
      setLoading(true);
      await Promise.all(selectedItems.map(id => archiveBudget(id)));
      fetchBudgets();
      setAlertModal({ type: 'success', message: `${selectedItems.length} item(s) archived successfully!` });
      setSelectedItems([]);
      setIsSelectionMode(false);
    } catch (err) {
      console.error(err);
      setAlertModal({ type: 'error', message: 'Archive failed: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  // UNARCHIVE
  const handleUnarchive = async (id) => {
    if (!window.confirm("Are you sure you want to restore this budget?")) return;
    try {
      await unarchiveBudget(id);
      fetchBudgets();
      setAlertModal({ type: 'success', message: 'Budget restored successfully!' });
    } catch (err) {
      console.error(err);
      setAlertModal({ type: 'error', message: 'Restore failed: ' + (err.response?.data?.message || err.message) });
    }
  };

  // SELECTION HANDLERS
  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === currentBudgets.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentBudgets.map(b => b._id));
    }
  };

  // DELETE (COMMENTED OUT)
  // const handleDelete = async (id) => {
  //   if (!window.confirm("Are you sure you want to delete this budget?")) return;
  //   try {
  //     await deleteBudget(id);
  //     fetchBudgets();
  //     setAlertModal({ type: 'success', message: 'Budget deleted successfully!' });
  //   } catch (err) {
  //     console.error(err);
  //     setAlertModal({ type: 'error', message: 'Delete failed: ' + (err.response?.data?.message || err.message) });
  //   }
  // };

  // File type badge
  const getFileTypeBadge = (format) => {
    if (!format) return "File";
    if (format.includes("pdf")) return "PDF";
    if (format.includes("image")) return "Image";
    return "File";
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
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

  // Filter and search budgets
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (budget.description && budget.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesYear = !filterYear || budget.year === filterYear;
    const matchesStatus = !filterStatus || budget.status === filterStatus;
    
    return matchesSearch && matchesYear && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);
  const startIndex = (currentPageList - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBudgets = filteredBudgets.slice(startIndex, endIndex);

  // Get unique years for filter
  const availableYears = [...new Set(budgets.map(b => b.year))].sort((a, b) => b.localeCompare(a));

  const goToPage = (page) => {
    setCurrentPageList(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPageList(1);
  }, [searchQuery, filterYear, filterStatus]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Plan & Budget</h1>
          </div>
          <p className="text-gray-600 text-sm ml-9">Manage and preview budget documents</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-5">
          {["reports", "archived", "budgetUpload"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab === "budgetUpload" ? "Upload New" : tab === "archived" ? "Archived" : "Active Documents"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Document Title <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. GAD Plan and Budget 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Fiscal Year <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={year} onChange={e => setYear(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Brief description of the document..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date Approved
                  </label>
                  <input type="date" value={dateApproved} onChange={e => setDateApproved(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status
                  </label>
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Draft">Draft</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {!editingBudget && (
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
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleUpload} 
                  disabled={loading || !title || !year || !file}
                  className="flex-1 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-md">
                  {loading ? "Uploading..." : "Upload Document"}
                </button>
                <button onClick={clearForm}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && editingBudget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
              <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Edit Document</h3>
                <button 
                  onClick={closeEditModal} 
                  className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Document Title <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. GAD Plan and Budget 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Fiscal Year <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={year} onChange={e => setYear(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. 2024"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Brief description of the document..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date Approved
                    </label>
                    <input type="date" value={dateApproved} onChange={e => setDateApproved(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Draft">Draft</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <strong>Note:</strong> File cannot be changed when editing. To use a different file, please archive this document and upload a new one.
                </div>
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-200 flex gap-2">
                <button 
                  onClick={handleUpdate} 
                  disabled={loading || !title || !year}
                  className="flex-1 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-md">
                  {loading ? "Updating..." : "Update Document"}
                </button>
                <button onClick={closeEditModal}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TAB (Active Documents) */}
        {(activeTab === "reports" || activeTab === "archived") && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search */}
                <div className="md:col-span-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Year Filter */}
                <div>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Draft">Draft</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchQuery || filterYear || filterStatus) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Active filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Search: "{searchQuery}"
                      <button onClick={() => setSearchQuery("")} className="hover:bg-blue-200 rounded-full p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filterYear && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Year: {filterYear}
                      <button onClick={() => setFilterYear("")} className="hover:bg-blue-200 rounded-full p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filterStatus && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Status: {filterStatus}
                      <button onClick={() => setFilterStatus("")} className="hover:bg-blue-200 rounded-full p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterYear("");
                      setFilterStatus("");
                    }}
                    className="ml-auto text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTab === "archived" ? "Archived Documents" : "Active Documents"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filteredBudgets.length} {filteredBudgets.length === 1 ? 'document' : 'documents'}
                  {(searchQuery || filterYear || filterStatus) && ` (filtered from ${budgets.length} total)`}
                  {totalPages > 1 && ` • Page ${currentPageList} of ${totalPages}`}
                </p>
              </div>
              
              {/* Selection Mode Controls */}
              {activeTab === "reports" && filteredBudgets.length > 0 && (
                <div className="flex items-center gap-2">
                  {isSelectionMode ? (
                    <>
                      <button
                        onClick={handleArchiveMultiple}
                        disabled={selectedItems.length === 0 || loading}
                        className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                      >
                        <Archive size={14} />
                        Archive ({selectedItems.length})
                      </button>
                      <button
                        onClick={() => {
                          setIsSelectionMode(false);
                          setSelectedItems([]);
                        }}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsSelectionMode(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 text-sm font-medium transition-colors"
                    >
                      <Archive size={14} />
                      Bulk Archive
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredBudgets.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
                  {activeTab === "archived" ? (
                    <Archive className="w-10 h-10 text-gray-400" />
                  ) : (
                    <FileText className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <p className="text-gray-600 font-medium">
                  {activeTab === "archived" ? "No archived documents" : "No documents uploaded yet"}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {activeTab === "archived" 
                    ? "Archived documents will appear here" 
                    : "Upload your first budget document to get started"}
                </p>
              </div>
            ) : (
              <>
                {/* Select All Checkbox */}
                {isSelectionMode && currentBudgets.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === currentBudgets.length && currentBudgets.length > 0}
                          onChange={toggleSelectAll}
                          className="w-5 h-5 text-orange-600 border-2 border-orange-300 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        />
                      </div>
                      <span className="text-sm font-medium text-orange-700">
                        Select all on this page ({currentBudgets.length} items)
                      </span>
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {currentBudgets.map(item => (
                    <div key={item._id} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden ${
                      isSelectionMode && selectedItems.includes(item._id) 
                        ? 'border-2 border-orange-500 ring-2 ring-orange-200' 
                        : 'border-2 border-gray-200 hover:border-blue-300'
                    }`}>
                      {/* Selection Checkbox */}
                      {isSelectionMode && (
                        <div className="bg-orange-50 border-b border-orange-200 px-3 py-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item._id)}
                              onChange={() => toggleSelection(item._id)}
                              className="w-4 h-4 text-orange-600 border-2 border-orange-300 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                            />
                            <span className="text-xs font-medium text-orange-700">
                              {selectedItems.includes(item._id) ? 'Selected' : 'Select'}
                            </span>
                          </label>
                        </div>
                      )}

                      {/* Header */}
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="px-2 py-0.5 bg-white/90 text-blue-700 text-xs font-bold rounded-full">
                            {item.year}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                            <FileText className="text-white w-5 h-5" />
                          </div>
                          <h4 className="font-bold text-white text-base line-clamp-3 leading-snug">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="px-4 py-3 border-t-2 border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {item.dateApproved && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-500" />
                              <span className="text-xs">
                                {new Date(item.dateApproved).toLocaleDateString("en-US", { 
                                  month:"short", day:"numeric", year:"numeric"
                                })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 font-medium rounded-full text-xs">
                              {getFileTypeBadge(item.file.format)}
                            </span>
                            {item.file.page_count > 1 && (
                              <span className="text-blue-600 font-medium text-xs">
                                {item.file.page_count} pages
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 bg-gray-50 border-t-2 border-gray-100 flex gap-2">
                        <button 
                          onClick={() => openPreview(item)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all bg-blue-600 text-white hover:bg-blue-700">
                          <Eye size={12} /> Preview
                        </button>
                        
                        {activeTab === "reports" ? (
                          <>
                            <button 
                              onClick={() => handleEdit(item)}
                              className="flex items-center justify-center bg-blue-50 text-blue-600 px-2 py-1.5 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                              title="Edit">
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => handleArchiveSingle(item._id)}
                              className="flex items-center justify-center bg-orange-50 text-orange-600 px-2 py-1.5 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
                              title="Archive">
                              <Archive size={12} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleUnarchive(item._id)}
                            className="flex items-center justify-center gap-1 bg-green-50 text-green-600 px-2 py-1.5 rounded-lg hover:bg-green-100 transition-colors border border-green-200 text-xs font-medium"
                            title="Restore">
                            <ArchiveRestore size={12} /> Restore
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => goToPage(currentPageList - 1)}
                      disabled={currentPageList === 1}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPageList - 1 && page <= currentPageList + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                currentPageList === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPageList - 2 ||
                          page === currentPageList + 2
                        ) {
                          return (
                            <span key={page} className="px-2 py-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => goToPage(currentPageList + 1)}
                      disabled={currentPageList === totalPages}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
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
                  {previewFile.description && (
                    <p className="text-blue-100 text-sm mt-1 line-clamp-2">{previewFile.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-blue-100">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full font-medium">
                      {previewFile.year}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      previewFile.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      previewFile.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      previewFile.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {previewFile.status}
                    </span>
                    {previewFile.dateApproved && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(previewFile.dateApproved).toLocaleDateString("en-US", { 
                          month:"short", day:"numeric", year:"numeric"
                        })}
                      </span>
                    )}
                  </div>
                  {previewFile.file.page_count > 1 && (
                    <p className="text-blue-100 text-xs mt-1">
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
                      <Check className="w-6 h-6 text-green-600" />
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