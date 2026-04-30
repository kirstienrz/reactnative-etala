import React, { useState, useEffect } from "react";
import {
  getCarouselImages,
  getArchivedCarouselImages,
  uploadCarouselImage,
  archiveCarouselImage,
  restoreCarouselImage,
  deleteCarouselImage,
} from "../../api/carousel";
import { Trash2, Archive, RefreshCcw, Eye, Search, Plus, Filter, CheckCircle, Info, Upload } from "lucide-react";

export default function CarouselManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [modalMedia, setModalMedia] = useState(null); // { url, type }
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isDragging, setIsDragging] = useState(false);
  const [highlightTitle, setHighlightTitle] = useState("");
  const [highlightDescription, setHighlightDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
    fetchImages();
  }, [viewArchived]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = viewArchived
        ? await getArchivedCarouselImages()
        : await getCarouselImages();
      setImages(data);
      setSelectedImages(new Set());
    } catch (err) {
      setError("Failed to load Hightlights images");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    if (files.length > 0) {
      const generatedPreviews = files.map(file => {
        return {
          url: URL.createObjectURL(file),
          name: file.name,
          size: (file.size / 1024).toFixed(2),
          type: file.type.startsWith("video/") ? "video" : "image",
          mimeType: file.type
        };
      });
      setPreviews(generatedPreviews);
    } else {
      setPreviews([]);
    }
  };
  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!highlightTitle.trim()) {
      setError("Please provide a title for this highlight album");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Please select at least one media file first");
      return;
    }

    // Validation
    const maxSize = 100 * 1024 * 1024; // 100MB for multiple files
    for (const file of selectedFiles) {
      if (file.size > maxSize) {
        setError(`File ${file.name} must be less than 100MB`);
        return;
      }

      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4", "video/webm"];
      if (!validTypes.includes(file.type)) {
        setError(`File ${file.name} has invalid type. Supported formats: JPG, PNG, WebP, MP4, WebM`);
        return;
      }
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("title", highlightTitle);
      formData.append("description", highlightDescription);
      
      selectedFiles.forEach((file) => {
        formData.append("media", file);
      });

      await uploadCarouselImage(formData);
      setSuccess("Highlight album created successfully!");
      setSelectedFiles([]);
      setPreviews([]);
      setHighlightTitle("");
      setHighlightDescription("");
      fetchImages();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload highlight album");
    } finally {
      setIsUploading(false);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this image?")) return;

    try {
      await archiveCarouselImage(id);
      setSuccess("Image archived successfully!");
      fetchImages();
    } catch (err) {
      setError("Failed to archive image");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Restore this image?")) return;

    try {
      await restoreCarouselImage(id);
      setSuccess("Image restored successfully!");
      fetchImages();
    } catch (err) {
      setError("Failed to restore image");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this media? This action cannot be undone.")) return;

    try {
      await deleteCarouselImage(id);
      setSuccess("Media permanently deleted!");
      fetchImages();
    } catch (err) {
      setError("Failed to delete image");
    }
  };

  // Bulk Actions
  const toggleImageSelection = (id) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImages(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedImages.size === filteredAndSortedImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredAndSortedImages.map(img => img._id)));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedImages.size === 0) {
      setError("Please select at least one image");
      return;
    }

    let confirmMsg = "";
    if (action === "archive") confirmMsg = `Archive ${selectedImages.size} image(s)?`;
    else if (action === "restore") confirmMsg = `Restore ${selectedImages.size} image(s)?`;
    else if (action === "delete") confirmMsg = `Are you sure you want to permanently delete ${selectedImages.size} selected media? This action cannot be undone.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const promises = Array.from(selectedImages).map(id => {
        if (action === "archive") return archiveCarouselImage(id);
        if (action === "restore") return restoreCarouselImage(id);
        if (action === "delete") return deleteCarouselImage(id);
        return Promise.resolve();
      });
      await Promise.all(promises);
      setSuccess(`Successfully ${action === "delete" ? "deleted" : action + "d"} ${selectedImages.size} image(s)`);
      fetchImages();
    } catch (err) {
      setError(`Failed to ${action} some images`);
    }
  };

  // Filter and Sort
  const filteredAndSortedImages = images
    .filter(img => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      const date = new Date(img.createdAt).toLocaleDateString().toLowerCase();
      return date.includes(searchLower);
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  // Statistics
  const stats = {
    active: !viewArchived ? images.length : 0,
    archived: viewArchived ? images.length : 0,
    selected: selectedImages.size
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Loading Hightlights images...</p>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Highlights Management
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            {viewArchived
              ? "View and restore archived Highlights images"
              : "Upload and manage active highlights images"}
          </p>
        </div>
        <button
          onClick={() => setViewArchived(!viewArchived)}
          className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition shadow-sm font-semibold flex items-center justify-center gap-2"
        >
          {viewArchived ? <Eye size={18} /> : <Archive size={18} />}
          {viewArchived ? "View Active Images" : "View Archived Images"}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-600 mb-1">Active Images</div>
          <div className="text-2xl font-bold text-blue-900">
            {viewArchived ? "—" : images.length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-600 mb-1">Archived Images</div>
          <div className="text-2xl font-bold text-yellow-900">
            {viewArchived ? images.length : "—"}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-600 mb-1">Selected</div>
          <div className="text-2xl font-bold text-green-900">
            {stats.selected}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-900 font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-green-900 font-bold">×</button>
        </div>
      )}

      {/* Upload Section */}
      {!viewArchived && (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm mb-10">
          <div className="flex flex-col xl:flex-row items-center gap-6">
            {/* Action Icon & Title (Hidden on Mobile) */}
            <div className="hidden xl:flex items-center gap-4 pr-6 border-r border-slate-100">
              <div className="p-3 bg-violet-100 rounded-2xl text-violet-600">
                <Plus size={24} />
              </div>
              <div className="whitespace-nowrap">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter">New Highlight</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Create Album</p>
              </div>
            </div>

            {/* Inputs Section */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Album Title</label>
                <input
                  type="text"
                  placeholder="e.g., Summit 2024"
                  value={highlightTitle}
                  onChange={(e) => setHighlightTitle(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                <input
                  type="text"
                  placeholder="Brief story about this highlight..."
                  value={highlightDescription}
                  onChange={(e) => setHighlightDescription(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Upload Zone & Action Button */}
            <div className="flex items-end gap-3 w-full xl:w-auto">
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative group border-2 border-dashed rounded-2xl px-6 h-[54px] flex items-center transition-all duration-300 text-center flex-1 xl:flex-none ${
                  isDragging
                    ? "border-violet-500 bg-violet-50"
                    : "border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-slate-100/50"
                }`}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <div className="flex items-center gap-3">
                  <Upload size={20} className="text-violet-600" />
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-900 leading-tight whitespace-nowrap">
                      {previews.length > 0 ? `${previews.length} Files Selected` : "Select Media"}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">JPG, MP4, WEBM</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-10 h-[54px] bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isUploading ? (
                  <RefreshCcw className="animate-spin" size={18} />
                ) : (
                  <CheckCircle size={18} />
                )}
                {isUploading ? "..." : "Create Album"}
              </button>
            </div>
          </div>

          {/* Previews Row */}
          {previews.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-4">
              <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {previews.map((preview, i) => (
                  <div key={i} className="flex-shrink-0 w-14 h-14 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-transform hover:scale-105">
                    {preview.type === "video" ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <Eye size={12} className="text-white opacity-50" />
                      </div>
                    ) : (
                      <img src={preview.url} className="w-full h-full object-cover" alt="" />
                    )}
                    {i === 0 && (
                      <div className="absolute inset-0 border-2 border-violet-500 rounded-xl pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => {setSelectedFiles([]); setPreviews([]);}} className="px-4 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-xl uppercase tracking-widest transition-colors">
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Controls: Search, Sort, Bulk Actions */}
      <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by date... (e.g., 20-02-25)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {images.length > 0 && (
              <>
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  {selectedImages.size === filteredAndSortedImages.length ? "Deselect All" : "Select All"}
                </button>

                {selectedImages.size > 0 && (
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleBulkAction(viewArchived ? "restore" : "archive")}
                      className={`flex-1 md:flex-none px-4 py-2 text-white rounded-lg transition flex items-center justify-center gap-2 ${viewArchived
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-amber-500 hover:bg-amber-600"
                        }`}
                    >
                      {viewArchived ? <RefreshCcw size={16} /> : <Archive size={16} />}
                      {viewArchived ? "Restore" : "Archive"} ({selectedImages.size})
                    </button>
                    <button
                      onClick={() => handleBulkAction("delete")}
                      className="flex-1 md:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete ({selectedImages.size})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredAndSortedImages.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Info className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold text-xl">
              {searchQuery
                ? "No highlight albums found matching your search"
                : viewArchived
                  ? "No archived highlight albums"
                  : "No highlight albums created yet"}
            </p>
          </div>
        ) : (
          filteredAndSortedImages.map((img) => (
            <div
              key={img._id}
              className={`group relative bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-500 ${
                selectedImages.has(img._id) ? "ring-4 ring-violet-500 border-transparent" : ""
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-20">
                <input
                  type="checkbox"
                  checked={selectedImages.has(img._id)}
                  onChange={() => toggleImageSelection(img._id)}
                  className="w-6 h-6 rounded-lg border-2 border-white cursor-pointer accent-violet-600 transition-transform hover:scale-110"
                />
              </div>

              {/* Individual Delete Button */}
              <button
                onClick={() => handleDelete(img._id)}
                className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-red-500 hover:text-white text-slate-400 p-3 rounded-2xl transition-all shadow-lg backdrop-blur-md"
                title="Delete Permanently"
              >
                <Trash2 size={18} />
              </button>

              {/* Compact Card Render */}
              <div className="aspect-video bg-slate-100 relative overflow-hidden group/card">
                {img.coverImage?.type === 'video' || (img.items && img.items[0]?.type === 'video') ? (
                  <video
                    src={img.coverImage?.imageUrl || (img.items && img.items[0]?.imageUrl)}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-700"
                    autoPlay
                    muted
                    loop
                    playsInline
                    onClick={() => setModalMedia({ url: img.coverImage?.imageUrl || (img.items && img.items[0]?.imageUrl), type: 'video' })}
                  />
                ) : (
                  <img
                    src={img.coverImage?.imageUrl || (img.items && img.items[0]?.imageUrl) || img.imageUrl}
                    alt={img.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/about/logo.png";
                      e.target.className = "w-full h-full object-contain p-8 bg-slate-50 opacity-20";
                    }}
                    onClick={() => setModalMedia({ url: img.coverImage?.imageUrl || (img.items && img.items[0]?.imageUrl) || img.imageUrl, type: 'image' })}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-700"
                    crossOrigin="anonymous"
                  />
                )}
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                
                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-black text-sm truncate leading-none mb-1">
                        {img.title || "Untitled"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">
                          {img.items?.length || 1} items
                        </span>
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest border-l border-white/20 pl-2">
                          {new Date(img.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {viewArchived ? (
                        <button
                          onClick={() => handleRestore(img._id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-all shadow-lg active:scale-95"
                          title="Restore Highlight"
                        >
                          <RefreshCcw size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchive(img._id)}
                          className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-lg transition-all backdrop-blur-md active:scale-95"
                          title="Archive Highlight"
                        >
                          <Archive size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Enlarged Media */}
      {modalMedia && (
        <div
          onClick={() => setModalMedia(null)}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 cursor-pointer"
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setModalMedia(null)}
              className="absolute -top-12 right-0 text-white text-4xl font-bold hover:text-gray-300 transition"
            >
              ×
            </button>
            {modalMedia.type === 'video' ? (
              <video
                src={modalMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-screen rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={modalMedia.url}
                alt="Enlarged view"
                className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}