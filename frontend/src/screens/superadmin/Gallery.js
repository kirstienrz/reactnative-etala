import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
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
  Grid3x3,
  List,
  LayoutGrid,
  Download,
  Share2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
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
} from '../../api/albums';

const { width } = Dimensions.get('window');

// FIX: Add 'function' keyword or arrow function
const Gallery = () => {  // <- DITO ANG PAGBABAGO
  // State management
  const [albums, setAlbums] = useState([]);
  const [archivedAlbums, setArchivedAlbums] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date-desc');
  
  // Form data
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [albumCover, setAlbumCover] = useState(null);
  const [albumCoverPreview, setAlbumCoverPreview] = useState(null);
  
  const [uploadData, setUploadData] = useState({
    albumId: '',
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
    setError('');
    
    try {
      if (viewArchived) {
        const response = await getArchivedAlbums();
        setArchivedAlbums(response.data || []);
      } else {
        const response = await getAlbums();
        setAlbums(response.data || []);
      }
    } catch (err) {
      setError('Failed to load albums. Please try again.');
      console.error('Error fetching albums:', err);
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
      setError('Failed to load album details.');
      console.error('Error fetching album:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle create album
  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploading(true);

    if (!newAlbum.title.trim()) {
      setError('Album title is required');
      setUploading(false);
      return;
    }

    if (!albumCover) {
      setError('Please select a cover image');
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newAlbum.title);
      formData.append('description', newAlbum.description || '');
      formData.append('date', newAlbum.date);
      formData.append('coverImage', albumCover);

      const response = await createAlbum(formData);
      
      setSuccess('Album created successfully!');
      setShowCreateModal(false);
      
      // Reset form
      setNewAlbum({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setAlbumCover(null);
      setAlbumCoverPreview(null);
      
      // Refresh album list
      fetchAlbums();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create album');
      console.error('Error creating album:', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle upload images to album
  const handleUploadImages = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploading(true);

    if (!uploadData.albumId) {
      setError('No album selected');
      setUploading(false);
      return;
    }

    if (uploadData.files.length === 0) {
      setError('Please select at least one image');
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      
      // Add files
      uploadData.files.forEach(file => {
        formData.append('images', file);
      });
      
      // Add captions
      if (uploadData.captions.length > 0) {
        formData.append('captions', JSON.stringify(uploadData.captions));
      }

      const response = await uploadImages(uploadData.albumId, formData);
      
      setSuccess(`${uploadData.files.length} image(s) uploaded successfully!`);
      setShowUploadModal(false);
      
      // Reset upload data
      setUploadData({
        albumId: '',
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
      setError(err.response?.data?.message || 'Failed to upload images');
      console.error('Error uploading images:', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle archive album
  const handleArchiveAlbum = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: true }));
    setError('');
    setSuccess('');
    
    try {
      await archiveAlbum(id);
      setSuccess('Album archived successfully!');
      
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
      setError(err.response?.data?.message || 'Failed to archive album');
      console.error('Error archiving album:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle restore album
  const handleRestoreAlbum = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: true }));
    setError('');
    setSuccess('');
    
    try {
      await restoreAlbum(id);
      setSuccess('Album restored successfully!');
      
      // Update UI
      if (viewArchived) {
        setArchivedAlbums(prev => prev.filter(album => album._id !== id));
      }
      
      // Refresh active albums list
      fetchAlbums();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore album');
      console.error('Error restoring album:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle delete album
  const handleDeleteAlbum = async () => {
    if (!albumToDelete) return;
    
    setProcessing(prev => ({ ...prev, [albumToDelete]: true }));
    setError('');
    setSuccess('');
    
    try {
      await deleteAlbum(albumToDelete);
      setSuccess('Album deleted permanently!');
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
      setError(err.response?.data?.message || 'Failed to delete album');
      console.error('Error deleting album:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [albumToDelete]: false }));
    }
  };

  // Handle delete image
  const handleDeleteImage = async () => {
    const { albumId, imageIndex } = imageToDelete;
    if (!albumId || imageIndex === null) return;
    
    setProcessing(prev => ({ ...prev, [`image-${albumId}-${imageIndex}`]: true }));
    setError('');
    setSuccess('');
    
    try {
      await deleteImage(albumId, imageIndex);
      setSuccess('Image deleted successfully!');
      setShowImageDeleteModal(false);
      setImageToDelete({ albumId: null, imageIndex: null });
      
      // Refresh current album
      if (selectedAlbum && selectedAlbum._id === albumId) {
        fetchAlbum(albumId);
      }
      
      // Refresh album list to update photo count
      fetchAlbums();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image');
      console.error('Error deleting image:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [`image-${albumId}-${imageIndex}`]: false }));
    }
  };

  // Handle bulk archive
  const handleBulkArchive = async () => {
    if (selectedAlbums.size === 0) {
      setError('Select at least one album');
      return;
    }
    
    setBulkProcessing(true);
    setError('');
    setSuccess('');
    
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
      setError(err.response?.data?.message || 'Failed to bulk archive albums');
      console.error('Error bulk archiving:', err);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Handle bulk restore
  const handleBulkRestore = async () => {
    if (selectedAlbums.size === 0) {
      setError('Select at least one album');
      return;
    }
    
    setBulkProcessing(true);
    setError('');
    setSuccess('');
    
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
      setError(err.response?.data?.message || 'Failed to bulk restore albums');
      console.error('Error bulk restoring:', err);
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
  const handleCoverImageChange = (file) => {
    if (file) {
      setAlbumCover(file);
      setAlbumCoverPreview(URL.createObjectURL(file));
    }
  };

  // Handle image files selection for upload
  const handleImageFilesChange = (files) => {
    setUploadData(prev => ({
      ...prev,
      files: [...prev.files, ...files],
      captions: [...prev.captions, ...files.map(() => '')],
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
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'photos-desc':
          return (b.totalPhotos || 0) - (a.totalPhotos || 0);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading albums...</Text>
        <Text style={styles.loadingSubtext}>Please wait a moment</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>University Photo Gallery</Text>
              <Text style={styles.subtitle}>Manage photo albums for university activities</Text>
            </View>
            
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.viewToggleButton}
                onPress={() => {
                  setViewArchived(!viewArchived);
                  fetchAlbums();
                }}
              >
                {viewArchived ? (
                  <>
                    <Eye size={16} color="#374151" />
                    <Text style={styles.viewToggleText}>View Active Albums</Text>
                  </>
                ) : (
                  <>
                    <EyeOff size={16} color="#374151" />
                    <Text style={styles.viewToggleText}>View Archived Albums</Text>
                  </>
                )}
              </TouchableOpacity>
              
              {!viewArchived && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={styles.createButtonText}>Create New Album</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Total Albums</Text>
                <Text style={styles.statNumber}>{stats.totalAlbums}</Text>
              </View>
              <Folder size={20} color="#3b82f6" />
            </View>
            
            <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
              <View style={styles.statContent}>
                <Text style={[styles.statLabel, { color: '#16a34a' }]}>Active Albums</Text>
                <Text style={styles.statNumber}>{stats.activeAlbums}</Text>
              </View>
              <ImageIcon size={20} color="#16a34a" />
            </View>
            
            <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
              <View style={styles.statContent}>
                <Text style={[styles.statLabel, { color: '#d97706' }]}>Archived</Text>
                <Text style={styles.statNumber}>{stats.archivedAlbums}</Text>
              </View>
              <EyeOff size={20} color="#d97706" />
            </View>
            
            <View style={[styles.statCard, { backgroundColor: '#f3e8ff' }]}>
              <View style={styles.statContent}>
                <Text style={[styles.statLabel, { color: '#7c3aed' }]}>Total Photos</Text>
                <Text style={styles.statNumber}>{stats.totalPhotos}</Text>
              </View>
              <Upload size={20} color="#7c3aed" />
            </View>
          </View>
        </View>

        {/* Alerts */}
        {error ? (
          <View style={styles.errorAlert}>
            <View style={styles.alertContent}>
              <X size={24} color="#dc2626" />
              <View style={styles.alertTextContainer}>
                <Text style={styles.alertTitle}>Error</Text>
                <Text style={styles.alertMessage}>{error}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successAlert}>
            <View style={styles.alertContent}>
              <Check size={24} color="#059669" />
              <View style={styles.alertTextContainer}>
                <Text style={styles.alertTitle}>Success</Text>
                <Text style={styles.alertMessage}>{success}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Controls */}
        <View style={styles.controlsCard}>
          <View style={styles.controlsRow}>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Search size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search albums by title or description..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            {/* Sort and View Options */}
            <View style={styles.sortViewContainer}>
              <View style={styles.sortPicker}>
                <Text style={styles.sortText}>Sort: </Text>
                <TextInput
                  style={styles.sortInput}
                  value={
                    sortBy === 'date-desc' ? 'Newest First' :
                    sortBy === 'date-asc' ? 'Oldest First' :
                    sortBy === 'title-asc' ? 'Title A-Z' :
                    sortBy === 'title-desc' ? 'Title Z-A' :
                    'Most Photos'
                  }
                  editable={false}
                />
              </View>
              
              <View style={styles.viewModeContainer}>
                <TouchableOpacity
                  style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeActive]}
                  onPress={() => setViewMode('grid')}
                >
                  <Grid3x3 size={16} color={viewMode === 'grid' ? '#3b82f6' : '#6b7280'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeActive]}
                  onPress={() => setViewMode('list')}
                >
                  <List size={16} color={viewMode === 'list' ? '#3b82f6' : '#6b7280'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.viewModeButton, viewMode === 'compact' && styles.viewModeActive]}
                  onPress={() => setViewMode('compact')}
                >
                  <LayoutGrid size={16} color={viewMode === 'compact' ? '#3b82f6' : '#6b7280'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Albums Grid */}
        {filteredAlbums.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Folder size={48} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No albums found</Text>
            <Text style={styles.emptyDescription}>
              {viewArchived 
                ? 'No archived albums. Archive albums to see them here.'
                : searchTerm
                ? 'No albums match your search'
                : 'Create your first album to get started.'}
            </Text>
          </View>
        ) : (
          <View style={[
            styles.albumsContainer,
            viewMode === 'grid' ? styles.gridView :
            viewMode === 'list' ? styles.listView :
            styles.compactView
          ]}>
            {filteredAlbums.map(album => (
              <TouchableOpacity
                key={album._id}
                style={styles.albumCard}
                onPress={() => fetchAlbum(album._id)}
              >
                {/* Album Cover */}
                <View style={styles.albumCoverContainer}>
                  <Image
                    source={{ uri: album.coverImage?.imageUrl || 'https://via.placeholder.com/400x300' }}
                    style={styles.albumCover}
                  />
                  <View style={styles.coverOverlay} />
                  
                  {/* Album Status */}
                  <View style={[
                    styles.statusBadge,
                    album.isArchived ? styles.statusArchived : styles.statusActive
                  ]}>
                    <Text style={[
                      styles.statusText,
                      album.isArchived ? styles.statusTextArchived : styles.statusTextActive
                    ]}>
                      {album.isArchived ? 'Archived' : 'Active'}
                    </Text>
                  </View>
                  
                  {/* Photo Count */}
                  <View style={styles.photoCountBadge}>
                    <ImageIcon size={16} color="#fff" />
                    <Text style={styles.photoCountText}>{album.totalPhotos || 0} photos</Text>
                  </View>
                </View>
                
                {/* Album Details */}
                <View style={styles.albumDetails}>
                  <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
                  <Text style={styles.albumDescription} numberOfLines={2}>
                    {album.description || 'No description'}
                  </Text>
                  
                  {/* Album Info */}
                  <View style={styles.albumInfo}>
                    <View style={styles.infoRow}>
                      <Calendar size={16} color="#6b7280" />
                      <Text style={styles.infoText}>{formatDate(album.date)}</Text>
                    </View>
                  </View>
                  
                  {/* Action Buttons */}
                  <View style={styles.albumActions}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => fetchAlbum(album._id)}
                      disabled={processing[album._id]}
                    >
                      {processing[album._id] ? (
                        <ActivityIndicator size="small" color="#1d4ed8" />
                      ) : (
                        <>
                          <Eye size={16} color="#1d4ed8" />
                          <Text style={styles.viewButtonText}>View Album</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    
                    {!viewArchived && (
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => {
                          setUploadData(prev => ({ ...prev, albumId: album._id }));
                          setShowUploadModal(true);
                        }}
                      >
                        <Upload size={16} color="#16a34a" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bulk Actions */}
        {selectedAlbums.size > 0 && (
          <View style={styles.bulkActionsContainer}>
            <View style={styles.bulkActionsContent}>
              <View style={styles.bulkActionsHeader}>
                <View style={styles.bulkCountBadge}>
                  <Text style={styles.bulkCountText}>{selectedAlbums.size}</Text>
                </View>
                <View>
                  <Text style={styles.bulkTitle}>
                    {selectedAlbums.size} album{selectedAlbums.size !== 1 ? 's' : ''} selected
                  </Text>
                  <Text style={styles.bulkSubtitle}>Perform bulk actions</Text>
                </View>
              </View>
              
              <View style={styles.bulkActionsButtons}>
                {viewArchived ? (
                  <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={handleBulkRestore}
                    disabled={bulkProcessing}
                  >
                    {bulkProcessing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Check size={16} color="#fff" />
                        <Text style={styles.bulkButtonText}>Restore Selected</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.archiveButton}
                    onPress={handleBulkArchive}
                    disabled={bulkProcessing}
                  >
                    {bulkProcessing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Folder size={16} color="#fff" />
                        <Text style={styles.bulkButtonText}>Archive Selected</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSelectedAlbums(new Set())}
                >
                  <Text style={styles.clearButtonText}>Clear Selection</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {/* Album Detail Modal */}
      <Modal
        visible={!!selectedAlbum}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedAlbum(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedAlbum?.title}</Text>
                <View style={styles.modalInfoRow}>
                  <View style={styles.modalInfoItem}>
                    <Calendar size={16} color="#6b7280" />
                    <Text style={styles.modalInfoText}>{selectedAlbum && formatDate(selectedAlbum.date)}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <ImageIcon size={16} color="#6b7280" />
                    <Text style={styles.modalInfoText}>{selectedAlbum?.totalPhotos || 0} photos</Text>
                  </View>
                </View>
                <Text style={styles.modalDescription}>
                  {selectedAlbum?.description || 'No description'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedAlbum(null)}
              >
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            {/* Modal Content */}
            <ScrollView style={styles.modalContent}>
              {(!selectedAlbum?.images || selectedAlbum.images.length === 0) ? (
                <View style={styles.emptyAlbumState}>
                  <View style={styles.emptyAlbumIcon}>
                    <ImageIcon size={40} color="#9ca3af" />
                  </View>
                  <Text style={styles.emptyAlbumTitle}>No photos yet</Text>
                  <Text style={styles.emptyAlbumDescription}>Upload photos to this album</Text>
                  <TouchableOpacity
                    style={styles.emptyAlbumButton}
                    onPress={() => {
                      setUploadData(prev => ({ ...prev, albumId: selectedAlbum?._id }));
                      setShowUploadModal(true);
                    }}
                  >
                    <Upload size={20} color="#fff" />
                    <Text style={styles.emptyAlbumButtonText}>Upload Photos</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.photosHeader}>
                    <Text style={styles.photosTitle}>
                      Photos ({selectedAlbum?.images?.length || 0})
                    </Text>
                    <TouchableOpacity
                      style={styles.addPhotosButton}
                      onPress={() => {
                        setUploadData(prev => ({ ...prev, albumId: selectedAlbum?._id }));
                        setShowUploadModal(true);
                      }}
                    >
                      <Plus size={16} color="#fff" />
                      <Text style={styles.addPhotosButtonText}>Add More Photos</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.photosGrid}>
                    {selectedAlbum?.images?.map((image, index) => (
                      <View key={index} style={styles.photoItem}>
                        <Image
                          source={{ uri: image.imageUrl }}
                          style={styles.photoImage}
                        />
                        {image.caption && (
                          <View style={styles.photoCaption}>
                            <Text style={styles.captionText} numberOfLines={2}>
                              {image.caption}
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.deletePhotoButton}
                          onPress={() => {
                            setImageToDelete({ albumId: selectedAlbum?._id, imageIndex: index });
                            setShowImageDeleteModal(true);
                          }}
                        >
                          <Trash2 size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
            
            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.modalFooterText}>
                {selectedAlbum?.images?.length || 0} photo{(selectedAlbum?.images?.length || 0) !== 1 ? 's' : ''} in this album
              </Text>
              <View style={styles.modalFooterButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    selectedAlbum?.isArchived ? styles.restoreActionButton : styles.archiveActionButton
                  ]}
                  onPress={() => {
                    if (selectedAlbum?.isArchived) {
                      handleRestoreAlbum(selectedAlbum._id);
                    } else {
                      handleArchiveAlbum(selectedAlbum._id);
                    }
                    setSelectedAlbum(null);
                  }}
                >
                  <Text style={styles.actionButtonText}>
                    {selectedAlbum?.isArchived ? 'Restore Album' : 'Archive Album'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteActionButton}
                  onPress={() => {
                    setAlbumToDelete(selectedAlbum?._id);
                    setShowDeleteModal(true);
                  }}
                >
                  <Text style={styles.deleteActionButtonText}>Delete Album</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Album Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createModalContainer}>
            <View style={styles.createModalHeader}>
              <Text style={styles.createModalTitle}>Create New Album</Text>
              <TouchableOpacity
                style={styles.createModalCloseButton}
                onPress={() => setShowCreateModal(false)}
              >
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.createModalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Album Title *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newAlbum.title}
                  onChangeText={(text) => setNewAlbum(prev => ({ ...prev, title: text }))}
                  placeholder="e.g., Graduation 2024"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={newAlbum.description}
                  onChangeText={(text) => setNewAlbum(prev => ({ ...prev, description: text }))}
                  placeholder="Brief description of the album"
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newAlbum.date}
                  onChangeText={(text) => setNewAlbum(prev => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cover Image *</Text>
                <TouchableOpacity style={styles.fileUploadButton}>
                  <Text style={styles.fileUploadText}>Select Cover Image</Text>
                </TouchableOpacity>
                {albumCoverPreview && (
                  <View style={styles.previewContainer}>
                    <Text style={styles.previewLabel}>Preview:</Text>
                    <Image
                      source={{ uri: albumCoverPreview }}
                      style={styles.previewImage}
                    />
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.createModalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateAlbum}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Create Album</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload Photos Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModalContainer}>
            <View style={styles.uploadModalHeader}>
              <Text style={styles.uploadModalTitle}>Upload Photos to Album</Text>
              <TouchableOpacity
                style={styles.uploadModalCloseButton}
                onPress={() => setShowUploadModal(false)}
              >
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.uploadModalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Photos *</Text>
                <TouchableOpacity style={styles.fileUploadButton}>
                  <Text style={styles.fileUploadText}>Select Photos</Text>
                </TouchableOpacity>
              </View>
              
              {uploadData.previews.length > 0 && (
                <View style={styles.previewsContainer}>
                  <Text style={styles.previewsTitle}>
                    Preview ({uploadData.previews.length} photos)
                  </Text>
                  {uploadData.previews.map((preview, index) => (
                    <View key={index} style={styles.previewItem}>
                      <Image
                        source={{ uri: preview }}
                        style={styles.previewThumbnail}
                      />
                      <View style={styles.previewDetails}>
                        <Text style={styles.previewFileName} numberOfLines={1}>
                          {uploadData.files[index]?.name || `Photo ${index + 1}`}
                        </Text>
                        <TextInput
                          style={styles.captionInput}
                          value={uploadData.captions[index] || ''}
                          onChangeText={(text) => updateUploadCaption(index, text)}
                          placeholder="Add caption for this photo..."
                          placeholderTextColor="#9ca3af"
                        />
                        <TouchableOpacity
                          style={styles.removePreviewButton}
                          onPress={() => removeUploadImage(index)}
                        >
                          <X size={16} color="#dc2626" />
                          <Text style={styles.removePreviewText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            
            <View style={styles.uploadModalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, uploadData.files.length === 0 && styles.submitButtonDisabled]}
                onPress={handleUploadImages}
                disabled={uploading || uploadData.files.length === 0}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Upload {uploadData.files.length} Photo{uploadData.files.length !== 1 ? 's' : ''}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Album Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmModalIcon}>
              <Trash2 size={32} color="#dc2626" />
            </View>
            <Text style={styles.confirmModalTitle}>Delete Album</Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to permanently delete this album? This action cannot be undone.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setAlbumToDelete(null);
                }}
              >
                <Text style={styles.confirmCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleDeleteAlbum}
                disabled={processing[albumToDelete]}
              >
                {processing[albumToDelete] ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Delete Permanently</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Image Confirmation Modal */}
      <Modal
        visible={showImageDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageDeleteModal(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmModalIcon}>
              <Trash2 size={32} color="#dc2626" />
            </View>
            <Text style={styles.confirmModalTitle}>Delete Image</Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to delete this image? This action cannot be undone.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={() => {
                  setShowImageDeleteModal(false);
                  setImageToDelete({ albumId: null, imageIndex: null });
                }}
              >
                <Text style={styles.confirmCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleDeleteImage}
                disabled={processing[`image-${imageToDelete.albumId}-${imageToDelete.imageIndex}`]}
              >
                {processing[`image-${imageToDelete.albumId}-${imageToDelete.imageIndex}`] ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Delete Image</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  // Header Styles
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: width * 0.4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  // Alert Styles
  errorAlert: {
    backgroundColor: '#fef2f2',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#374151',
  },
  // Controls
  controlsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  sortViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 14,
    color: '#374151',
  },
  sortInput: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 8,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 6,
  },
  viewModeActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Albums Grid
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 32,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#f3f4f6',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: width * 0.7,
  },
  albumsContainer: {
    paddingHorizontal: 16,
  },
  gridView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listView: {
    flexDirection: 'column',
  },
  compactView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  albumCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  albumCoverContainer: {
    height: 192,
    position: 'relative',
  },
  albumCover: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusArchived: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#065f46',
  },
  statusTextArchived: {
    color: '#92400e',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  photoCountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  albumDetails: {
    padding: 16,
  },
  albumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  albumDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  albumInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  albumActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    gap: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d4ed8',
  },
  uploadButton: {
    padding: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
  },
  // Bulk Actions
  bulkActionsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bulkActionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bulkActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bulkCountBadge: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulkCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  bulkTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  bulkSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  bulkActionsButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d97706',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  bulkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 24,
    maxHeight: '60%',
  },
  emptyAlbumState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAlbumIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyAlbumTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyAlbumDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  emptyAlbumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyAlbumButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addPhotosButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    width: (width - 72) / 2,
    marginBottom: 12,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: 192,
    borderRadius: 12,
  },
  photoCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  captionText: {
    fontSize: 12,
    color: '#fff',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc2626',
    padding: 6,
    borderRadius: 20,
  },
  modalFooter: {
    padding: 24,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalFooterText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  modalFooterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  restoreActionButton: {
    backgroundColor: '#059669',
  },
  archiveActionButton: {
    backgroundColor: '#d97706',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deleteActionButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Create Modal
  createModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  createModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  createModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  createModalCloseButton: {
    padding: 4,
  },
  createModalContent: {
    padding: 24,
    maxHeight: '70%',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fileUploadButton: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fileUploadText: {
    fontSize: 16,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  previewContainer: {
    marginTop: 12,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  previewImage: {
    width: 192,
    height: 128,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  createModalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Upload Modal
  uploadModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  uploadModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  uploadModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  uploadModalCloseButton: {
    padding: 4,
  },
  uploadModalContent: {
    padding: 24,
    maxHeight: '70%',
  },
  previewsContainer: {
    marginTop: 20,
  },
  previewsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  previewItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  previewThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  previewDetails: {
    flex: 1,
  },
  previewFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  removePreviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removePreviewText: {
    fontSize: 14,
    color: '#dc2626',
  },
  uploadModalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  // Confirm Modal
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  confirmModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '90%',
    padding: 24,
    alignItems: 'center',
  },
  confirmModalIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#fef2f2',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  confirmModalText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default Gallery;