// components/AlbumGalleryManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  Calendar,
  Folder,
  Image as ImageIcon,
  Upload,
  Trash2,
  Plus,
  X,
  Check,
  Eye,
  EyeOff,
  Search,
  Clock,
  Grid3x3,
  List,
  LayoutGrid,
  ChevronDown,
  Download,
  Share2,
  Edit,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  getAlbums,
  getArchivedAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  uploadImages,
  updateImageCaption,
  deleteImage,
  archiveAlbum,
  restoreAlbum,
  deleteAlbum,
  bulkArchiveAlbums,
  bulkRestoreAlbums
} from "../../api/albums";

export default function AlbumGalleryManagement() {
  // State management
  const [albums, setAlbums] = useState([]);
  const [archivedAlbums, setArchivedAlbums] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form states
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedAlbums, setSelectedAlbums] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);
  const [imageToDelete, setImageToDelete] = useState({ albumId: null, imageIndex: null });
  const [showImageDeleteModal, setShowImageDeleteModal] = useState(false);
  
  // Filter and view states
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date-desc");
  
  // Form data
  const [newAlbum, setNewAlbum] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [albumCover, setAlbumCover] = useState(null);
  const [albumCoverPreview, setAlbumCoverPreview] = useState(null);
  
  const [uploadData, setUploadData] = useState({
    albumId: "",
    files: [],
    captions: [],
    previews: []
  });

  // Fetch albums on component mount
  useEffect(() => {
    fetchAlbums();
  }, []);

  // Fetch albums based on view (active/archived)
  const fetchAlbums = async () => {
    setLoading(true);
    setError("");
    
    try {
      if (viewArchived) {
        const response = await getArchivedAlbums();
        setArchivedAlbums(response.data || []);
      } else {
        const response = await getAlbums();
        setAlbums(response.data || []);
      }
    } catch (err) {
      setError("Failed to load albums. Please try again.");
      console.error("Error fetching albums:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single album with images
  const fetchAlbum = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: true }));
    
    try {
      const response = await getAlbum(id);
      setSelectedAlbum(response.data);
    } catch (err) {
      setError("Failed to load album details.");
      console.error("Error fetching album:", err);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle create album
  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    if (!newAlbum.title.trim()) {
      setError("Album title is required");
      setUploading(false);
      return;
    }

    if (!albumCover) {
      setError("Please select a cover image");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newAlbum.title);
      formData.append("description", newAlbum.description || "");
      formData.append("date", newAlbum.date);
      formData.append("coverImage", albumCover);

      const response = await createAlbum(formData);
      
      setSuccess("Album created successfully!");
      setShowCreateModal(false);
      
      // Reset form
      setNewAlbum({
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
      });
      setAlbumCover(null);
      setAlbumCoverPreview(null);
      
      // Refresh album list
      fetchAlbums();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create album");
      console.error("Error creating album:", err);
    } finally {
      setUploading(false);
    }
  };

  // Handle upload images to album
  const handleUploadImages = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    if (!uploadData.albumId) {
      setError("No album selected");
      setUploading(false);
      return;
    }

    if (uploadData.files.length === 0) {
      setError("Please select at least one image");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      
      // Add files
      uploadData.files.forEach(file => {
        formData.append("images", file);
      });
      
      // Add captions
      if (uploadData.captions.length > 0) {
        formData.append("captions", JSON.stringify(uploadData.captions));
      }

      const response = await uploadImages(uploadData.albumId, formData);
      
      setSuccess(`${uploadData.files.length} image(s) uploaded successfully!`);
      setShowUploadModal(false);
      
      // Reset upload data
      setUploadData({
        albumId: "",
        files: [],
        captions: [],
        previews: []
      });
      
      // Refresh current album if viewing
      if (selectedAlbum && selectedAlbum._id === uploadData.albumId) {
        fetchAlbum(uploadData.albumId);
      }
      
      // Refresh album list
      fetchAlbums();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload images");
      console.error("Error uploading images:", err);
    } finally {
      setUploading(false);
    }
  };

  // Handle archive album
  const handleArchiveAlbum = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: true }));
    setError("");
    setSuccess("");
    
    try {
      await archiveAlbum(id);
      setSuccess("Album archived successfully!");
      
      // Update UI
      if (viewArchived) {
        setArchivedAlbums(prev => prev.filter(album => album._id !== id));
      } else {
        setAlbums(prev => prev.filter(album => album._id !== id));
      }
      
      // Close modal if viewing this album
      if (selectedAlbum && selectedAlbum._id === id) {
        setSelectedAlbum(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to archive album");
      console.error("Error archiving album:", err);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle restore album
  const handleRestoreAlbum = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: true }));
    setError("");
    setSuccess("");
    
    try {
      await restoreAlbum(id);
      setSuccess("Album restored successfully!");
      
      // Update UI
      if (viewArchived) {
        setArchivedAlbums(prev => prev.filter(album => album._id !== id));
      }
      
      // Refresh active albums list
      fetchAlbums();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restore album");
      console.error("Error restoring album:", err);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle delete album
  const handleDeleteAlbum = async () => {
    if (!albumToDelete) return;
    
    setProcessing(prev => ({ ...prev, [albumToDelete]: true }));
    setError("");
    setSuccess("");
    
    try {
      await deleteAlbum(albumToDelete);
      setSuccess("Album deleted permanently!");
      setShowDeleteModal(false);
      setAlbumToDelete(null);
      
      // Update UI
      if (viewArchived) {
        setArchivedAlbums(prev => prev.filter(album => album._id !== albumToDelete));
      } else {
        setAlbums(prev => prev.filter(album => album._id !== albumToDelete));
      }
      
      // Close modal if viewing this album
      if (selectedAlbum && selectedAlbum._id === albumToDelete) {
        setSelectedAlbum(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete album");
      console.error("Error deleting album:", err);
    } finally {
      setProcessing(prev => ({ ...prev, [albumToDelete]: false }));
    }
  };

  // Handle delete image
  const handleDeleteImage = async () => {
    const { albumId, imageIndex } = imageToDelete;
    if (!albumId || imageIndex === null) return;
    
    setProcessing(prev => ({ ...prev, [`image-${albumId}-${imageIndex}`]: true }));
    setError("");
    setSuccess("");
    
    try {
      await deleteImage(albumId, imageIndex);
      setSuccess("Image deleted successfully!");
      setShowImageDeleteModal(false);
      setImageToDelete({ albumId: null, imageIndex: null });
      
      // Refresh current album
      if (selectedAlbum && selectedAlbum._id === albumId) {
        fetchAlbum(albumId);
      }
      
      // Refresh album list to update photo count
      fetchAlbums();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete image");
      console.error("Error deleting image:", err);
    } finally {
      setProcessing(prev => ({ ...prev, [`image-${albumId}-${imageIndex}`]: false }));
    }
  };

  // Handle bulk archive
  const handleBulkArchive = async () => {
    if (selectedAlbums.size === 0) {
      setError("Select at least one album");
      return;
    }
    
    setBulkProcessing(true);
    setError("");
    setSuccess("");
    
    try {
      const albumIds = Array.from(selectedAlbums);
      await bulkArchiveAlbums(albumIds);
      
      setSuccess(`${albumIds.length} album(s) archived successfully!`);
      
      // Update UI
      if (viewArchived) {
        setArchivedAlbums(prev => prev.filter(album => !albumIds.includes(album._id)));
      } else {
        setAlbums(prev => prev.filter(album => !albumIds.includes(album._id)));
      }
      
      // Clear selection
      setSelectedAlbums(new Set());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to bulk archive albums");
      console.error("Error bulk archiving:", err);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Handle bulk restore
  const handleBulkRestore = async () => {
    if (selectedAlbums.size === 0) {
      setError("Select at least one album");
      return;
    }
    
    setBulkProcessing(true);
    setError("");
    setSuccess("");
    
    try {
      const albumIds = Array.from(selectedAlbums);
      await bulkRestoreAlbums(albumIds);
      
      setSuccess(`${albumIds.length} album(s) restored successfully!`);
      
      // Update UI
      if (viewArchived) {
        setArchivedAlbums(prev => prev.filter(album => !albumIds.includes(album._id)));
      }
      
      // Refresh active albums
      fetchAlbums();
      
      // Clear selection
      setSelectedAlbums(new Set());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to bulk restore albums");
      console.error("Error bulk restoring:", err);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Toggle album selection
  const toggleAlbumSelection = (albumId) => {
    const newSet = new Set(selectedAlbums);
    if (newSet.has(albumId)) {
      newSet.delete(albumId);
    } else {
      newSet.add(albumId);
    }
    setSelectedAlbums(newSet);
  };

  // Handle cover image selection
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAlbumCover(file);
      setAlbumCoverPreview(URL.createObjectURL(file));
    }
  };

  // Handle image files selection for upload
  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadData(prev => ({
      ...prev,
      files: [...prev.files, ...files],
      captions: [...prev.captions, ...files.map(() => "")],
      previews: [...prev.previews, ...files.map(file => URL.createObjectURL(file))]
    }));
  };

  // Remove image from upload preview
  const removeUploadImage = (index) => {
    setUploadData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      captions: prev.captions.filter((_, i) => i !== index),
      previews: prev.previews.filter((_, i) => i !== index)
    }));
  };

  // Update caption in upload preview
  const updateUploadCaption = (index, caption) => {
    const newCaptions = [...uploadData.captions];
    newCaptions[index] = caption;
    setUploadData(prev => ({ ...prev, captions: newCaptions }));
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate stats
  const stats = {
    totalAlbums: albums.length + archivedAlbums.length,
    activeAlbums: albums.length,
    archivedAlbums: archivedAlbums.length,
    totalPhotos: albums.reduce((sum, album) => sum + (album.totalPhotos || 0), 0)
  };

  // Filter albums based on search
  const filteredAlbums = (viewArchived ? archivedAlbums : albums)
    .filter(album => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        album.title.toLowerCase().includes(searchLower) ||
        (album.description && album.description.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date) - new Date(a.date);
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "photos-desc":
          return (b.totalPhotos || 0) - (a.totalPhotos || 0);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-6 text-gray-700 text-lg font-medium">Loading albums...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                University Photo Gallery
              </h1>
              <p className="text-gray-600">
                Manage photo albums for university activities
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setViewArchived(!viewArchived);
                  fetchAlbums();
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
              >
                {viewArchived ? (
                  <>
                    <Eye className="w-4 h-4" />
                    View Active Albums
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    View Archived Albums
                  </>
                )}
              </button>
              
              {!viewArchived && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Create New Album
                </button>
              )}
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Albums</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAlbums}</p>
                </div>
                <Folder className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active Albums</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeAlbums}</p>
                </div>
                <ImageIcon className="w-5 h-5 text-green-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Archived</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.archivedAlbums}</p>
                </div>
                <EyeOff className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Photos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPhotos}</p>
                </div>
                <Upload className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-5 rounded-xl shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="font-medium">Error</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-100 border-l-4 border-emerald-500 text-emerald-700 p-5 rounded-xl shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Check className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="ml-3">
                <p className="font-medium">Success</p>
                <p className="mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search albums by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Sort and View Options */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="photos-desc">Most Photos</option>
              </select>
              
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow" : ""}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow" : ""}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`p-2 rounded ${viewMode === "compact" ? "bg-white shadow" : ""}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Albums Grid */}
        <div className="mb-8">
          {filteredAlbums.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                <Folder className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No albums found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {viewArchived 
                  ? 'No archived albums. Archive albums to see them here.'
                  : searchTerm
                  ? 'No albums match your search'
                  : 'Create your first album to get started.'}
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
              viewMode === "list" ? "grid-cols-1" :
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            }`}>
              {filteredAlbums.map(album => (
                <div
                  key={album._id}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Album Cover */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={album.coverImage?.imageUrl || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop"}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Album Status */}
                    <div className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full ${
                      album.isArchived
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {album.isArchived ? 'Archived' : 'Active'}
                    </div>
                    
                    {/* Photo Count */}
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>{album.totalPhotos || 0} photos</span>
                    </div>
                  </div>
                  
                  {/* Album Details */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                        {album.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {album.description || "No description"}
                      </p>
                    </div>
                    
                    {/* Album Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(album.date)}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => fetchAlbum(album._id)}
                        disabled={processing[album._id]}
                        className="flex-1 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all flex items-center justify-center gap-2 font-medium"
                      >
                        {processing[album._id] ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-blue-700 border-t-transparent rounded-full"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            View Album
                          </>
                        )}
                      </button>
                      
                      {!viewArchived && (
                        <button
                          onClick={() => {
                            setUploadData(prev => ({ ...prev, albumId: album._id }));
                            setShowUploadModal(true);
                          }}
                          className="px-3 py-2.5 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg hover:from-green-100 hover:to-green-200 transition-all"
                          title="Upload Photos"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedAlbums.size > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedAlbums.size}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedAlbums.size} album{selectedAlbums.size !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-gray-600">Perform bulk actions</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {viewArchived ? (
                  <button
                    onClick={handleBulkRestore}
                    disabled={bulkProcessing}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all flex items-center gap-3 font-semibold"
                  >
                    {bulkProcessing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Restoring...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Restore Selected
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleBulkArchive}
                    disabled={bulkProcessing}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all flex items-center gap-3 font-semibold"
                  >
                    {bulkProcessing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Archiving...
                      </>
                    ) : (
                      <>
                        <Folder className="w-4 h-4" />
                        Archive Selected
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedAlbums(new Set())}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Album Detail Modal */}
      {selectedAlbum && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAlbum.title}</h2>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedAlbum.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <ImageIcon className="w-4 h-4" />
                      <span>{selectedAlbum.totalPhotos || 0} photos</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{selectedAlbum.description || "No description"}</p>
                </div>
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {(!selectedAlbum.images || selectedAlbum.images.length === 0) ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No photos yet</h3>
                  <p className="text-gray-500 mb-4">Upload photos to this album</p>
                  <button
                    onClick={() => {
                      setUploadData(prev => ({ ...prev, albumId: selectedAlbum._id }));
                      setShowUploadModal(true);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-3 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photos
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Photos ({selectedAlbum.images.length})
                    </h3>
                    <button
                      onClick={() => {
                        setUploadData(prev => ({ ...prev, albumId: selectedAlbum._id }));
                        setShowUploadModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add More Photos
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedAlbum.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.imageUrl}
                          alt={image.caption || `Photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-sm rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.caption}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setImageToDelete({ albumId: selectedAlbum._id, imageIndex: index });
                            setShowImageDeleteModal(true);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {selectedAlbum.images?.length || 0} photo{(selectedAlbum.images?.length || 0) !== 1 ? 's' : ''} in this album
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (selectedAlbum.isArchived) {
                        handleRestoreAlbum(selectedAlbum._id);
                      } else {
                        handleArchiveAlbum(selectedAlbum._id);
                      }
                      setSelectedAlbum(null);
                    }}
                    className={`px-4 py-2.5 rounded-xl transition-all ${
                      selectedAlbum.isArchived
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                    }`}
                  >
                    {selectedAlbum.isArchived ? 'Restore Album' : 'Archive Album'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setAlbumToDelete(selectedAlbum._id);
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all"
                  >
                    Delete Album
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create New Album</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateAlbum} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Album Title *
                  </label>
                  <input
                    type="text"
                    value={newAlbum.title}
                    onChange={(e) => setNewAlbum(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Graduation 2024"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newAlbum.description}
                    onChange={(e) => setNewAlbum(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Brief description of the album"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newAlbum.date}
                    onChange={(e) => setNewAlbum(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {albumCoverPreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={albumCoverPreview}
                        alt="Cover preview"
                        className="w-48 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Album'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Photos Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Upload Photos to Album</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUploadImages} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Photos *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageFilesChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-blue-100 file:text-blue-700 hover:file:from-blue-100 hover:file:to-blue-200"
                  />
                </div>
                
                {uploadData.previews.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Preview ({uploadData.previews.length} photos)
                    </h3>
                    <div className="space-y-4">
                      {uploadData.previews.map((preview, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {uploadData.files[index].name}
                            </p>
                            <input
                              type="text"
                              value={uploadData.captions[index] || ""}
                              onChange={(e) => updateUploadCaption(index, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Add caption for this photo..."
                            />
                            <button
                              type="button"
                              onClick={() => removeUploadImage(index)}
                              className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || uploadData.files.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Uploading...
                    </>
                  ) : (
                    `Upload ${uploadData.files.length} Photo${uploadData.files.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Album Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-100 to-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Album</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to permanently delete this album? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAlbumToDelete(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAlbum}
                disabled={processing[albumToDelete]}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2"
              >
                {processing[albumToDelete] ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Image Confirmation Modal */}
      {showImageDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-100 to-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Image</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this image? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImageDeleteModal(false);
                  setImageToDelete({ albumId: null, imageIndex: null });
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteImage}
                disabled={processing[`image-${imageToDelete.albumId}-${imageToDelete.imageIndex}`]}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2"
              >
                {processing[`image-${imageToDelete.albumId}-${imageToDelete.imageIndex}`] ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Image'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}