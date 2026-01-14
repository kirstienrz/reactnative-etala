

import React, { useState, useEffect } from "react";
import {
  getCarouselImages,
  getArchivedCarouselImages,
  uploadCarouselImage,
  archiveCarouselImage,
  restoreCarouselImage,
} from "../../api/carousel";

export default function CarouselManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [viewArchived, setViewArchived] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [imageMetadata, setImageMetadata] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

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
    const file = e.target.files[0];
    setSelectedFile(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Get image metadata
      const img = new Image();
      img.onload = () => {
        setImageMetadata({
          size: (file.size / 1024).toFixed(2),
          dimensions: `${img.width} x ${img.height}`,
          type: file.type,
          name: file.name
        });
      };
      img.src = url;
    } else {
      setPreviewUrl(null);
      setImageMetadata(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      setError("Image size must be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG, and WebP images are allowed");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      await uploadCarouselImage(formData);
      setSuccess("Image uploaded successfully!");
      setSelectedFile(null);
      setPreviewUrl(null);
      setImageMetadata(null);
      fetchImages();
    } catch (err) {
      setError("Failed to upload image");
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

    const confirmMsg = action === "archive" 
      ? `Archive ${selectedImages.size} image(s)?`
      : `Restore ${selectedImages.size} image(s)?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const promises = Array.from(selectedImages).map(id =>
        action === "archive" ? archiveCarouselImage(id) : restoreCarouselImage(id)
      );
      await Promise.all(promises);
      setSuccess(`Successfully ${action}d ${selectedImages.size} image(s)`);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Highlights Management
          </h1>
          <p className="text-gray-600 mt-1">
            {viewArchived
              ? "View and restore archived Hightlights images"
              : "Upload and manage active hightlights images"}
          </p>
        </div>
        <button
          onClick={() => setViewArchived(!viewArchived)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition shadow-sm"
        >
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
        <div className="mb-6 bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Image</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md 
                  file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                  hover:file:bg-blue-100 cursor-pointer"
              />
              <button
                type="submit"
                disabled={!selectedFile}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Upload
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Maximum file size: 5MB • Supported formats: JPG, PNG, WebP
            </div>
          </form>
          
          {/* Image Preview with Metadata */}
          {previewUrl && (
            <div className="mt-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-start gap-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  onClick={() => setModalImage(previewUrl)}
                  className="w-48 h-48 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition"
                />
                {imageMetadata && (
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Image Details:</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-medium">File Name:</span>
                        <span className="text-right truncate ml-2 max-w-xs">{imageMetadata.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Size:</span>
                        <span>{imageMetadata.size} KB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Dimensions:</span>
                        <span>{imageMetadata.dimensions} px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Format:</span>
                        <span>{imageMetadata.type.split('/')[1].toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                  <button
                    onClick={() => handleBulkAction(viewArchived ? "restore" : "archive")}
                    className={`px-4 py-2 text-white rounded-lg transition ${
                      viewArchived 
                        ? "bg-green-500 hover:bg-green-600" 
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    {viewArchived ? "Restore" : "Archive"} Selected ({selectedImages.size})
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedImages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 mt-4">
              {searchQuery 
                ? "No images found matching your search" 
                : viewArchived 
                  ? "No archived images found" 
                  : "No images found"}
            </p>
          </div>
        ) : (
          filteredAndSortedImages.map((img) => (
            <div
              key={img._id}
              className={`relative border rounded-lg overflow-hidden shadow hover:shadow-lg transition ${
                selectedImages.has(img._id) ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedImages.has(img._id)}
                  onChange={() => toggleImageSelection(img._id)}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>

              <img
                src={img.imageUrl}
                alt="Carousel"
                onClick={() => setModalImage(img.imageUrl)}
                className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
              />
              
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent text-white p-3">
                <div className="flex justify-between items-end">
                  <div className="text-xs">
                    <div className="font-medium">{new Date(img.createdAt).toLocaleDateString()}</div>
                    <div className="text-gray-300">{new Date(img.createdAt).toLocaleTimeString()}</div>
                  </div>
                  {viewArchived ? (
                    <button
                      onClick={() => handleRestore(img._id)}
                      className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs font-medium transition"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => handleArchive(img._id)}
                      className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-xs font-medium transition"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Enlarged Image */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 cursor-pointer"
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-12 right-0 text-white text-4xl font-bold hover:text-gray-300 transition"
            >
              ×
            </button>
            <img
              src={modalImage}
              alt="Enlarged view"
              className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}