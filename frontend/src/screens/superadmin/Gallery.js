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
  RefreshControl,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  getAlbums,
  getArchivedAlbums,
  getAlbum,
  createAlbum,
  uploadImages,
  archiveAlbum,
  restoreAlbum,
  deleteAlbum,
  deleteImage,
  bulkArchiveAlbums,
  bulkRestoreAlbums,
} from '../../api/albums';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const GalleryMobile = () => {
  // State management
  const [albums, setAlbums] = useState([]);
  const [archivedAlbums, setArchivedAlbums] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState({});
  
  // Modal states
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Form states
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [albumCover, setAlbumCover] = useState(null);
  
  const [uploadData, setUploadData] = useState({
    albumId: '',
    files: [],
    captions: [],
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date-desc');

  // Fetch albums
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      if (viewArchived) {
        const response = await getArchivedAlbums();
        setArchivedAlbums(response.data || []);
      } else {
        const response = await getAlbums();
        setAlbums(response.data || []);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load albums');
      console.error('Error fetching albums:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlbums();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAlbums();
    requestPermissions();
  }, [viewArchived]);

  // Request permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permissions are required');
    }
  };

  // Fetch single album
  const fetchAlbum = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: true }));
    try {
      const response = await getAlbum(id);
      setSelectedAlbum(response.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load album details');
      console.error('Error fetching album:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  // Pick cover image
  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAlbumCover(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', err);
    }
  };

  // Pick multiple images for upload
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setUploadData(prev => ({
          ...prev,
          files: [...prev.files, ...result.assets],
          captions: [...prev.captions, ...result.assets.map(() => '')],
        }));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick images');
      console.error('Image picker error:', err);
    }
  };

  // Create album
  const handleCreateAlbum = async () => {
    if (!newAlbum.title.trim()) {
      Alert.alert('Error', 'Album title is required');
      return;
    }

    if (!albumCover) {
      Alert.alert('Error', 'Please select a cover image');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', newAlbum.title);
      formData.append('description', newAlbum.description || '');
      formData.append('date', newAlbum.date);
      formData.append('coverImage', {
        uri: albumCover.uri,
        type: 'image/jpeg',
        name: 'cover.jpg',
      });

      await createAlbum(formData);
      
      Alert.alert('Success', 'Album created successfully!');
      setShowCreateModal(false);
      resetCreateForm();
      fetchAlbums();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create album');
      console.error('Error creating album:', err);
    } finally {
      setUploading(false);
    }
  };

  // Upload images
  const handleUploadImages = async () => {
    if (!uploadData.albumId) {
      Alert.alert('Error', 'No album selected');
      return;
    }

    if (uploadData.files.length === 0) {
      Alert.alert('Error', 'Please select at least one image');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      uploadData.files.forEach((file, index) => {
        formData.append('images', {
          uri: file.uri,
          type: 'image/jpeg',
          name: `image-${index}.jpg`,
        });
      });
      
      if (uploadData.captions.length > 0) {
        formData.append('captions', JSON.stringify(uploadData.captions));
      }

      await uploadImages(uploadData.albumId, formData);
      
      Alert.alert('Success', `${uploadData.files.length} image(s) uploaded successfully!`);
      setShowUploadModal(false);
      resetUploadForm();
      
      if (selectedAlbum && selectedAlbum._id === uploadData.albumId) {
        fetchAlbum(uploadData.albumId);
      }
      
      fetchAlbums();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to upload images');
      console.error('Error uploading images:', err);
    } finally {
      setUploading(false);
    }
  };

  // Archive album
  const handleArchiveAlbum = (id) => {
    Alert.alert(
      'Archive Album',
      'Are you sure you want to archive this album?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveAlbum(id);
              Alert.alert('Success', 'Album archived successfully!');
              
              if (viewArchived) {
                setArchivedAlbums(prev => prev.filter(album => album._id !== id));
              } else {
                setAlbums(prev => prev.filter(album => album._id !== id));
              }
              
              if (selectedAlbum && selectedAlbum._id === id) {
                setSelectedAlbum(null);
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to archive album');
              console.error('Error archiving album:', err);
            }
          },
        },
      ]
    );
  };

  // Restore album
  const handleRestoreAlbum = async (id) => {
    try {
      await restoreAlbum(id);
      Alert.alert('Success', 'Album restored successfully!');
      
      if (viewArchived) {
        setArchivedAlbums(prev => prev.filter(album => album._id !== id));
      }
      
      fetchAlbums();
    } catch (err) {
      Alert.alert('Error', 'Failed to restore album');
      console.error('Error restoring album:', err);
    }
  };

  // Delete album
  const handleDeleteAlbum = (id) => {
    Alert.alert(
      'Delete Album',
      'Are you sure you want to permanently delete this album? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAlbum(id);
              Alert.alert('Success', 'Album deleted permanently!');
              
              if (viewArchived) {
                setArchivedAlbums(prev => prev.filter(album => album._id !== id));
              } else {
                setAlbums(prev => prev.filter(album => album._id !== id));
              }
              
              if (selectedAlbum && selectedAlbum._id === id) {
                setSelectedAlbum(null);
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete album');
              console.error('Error deleting album:', err);
            }
          },
        },
      ]
    );
  };

  // Delete image
  const handleDeleteImage = (albumId, imageIndex) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteImage(albumId, imageIndex);
              Alert.alert('Success', 'Image deleted successfully!');
              
              if (selectedAlbum && selectedAlbum._id === albumId) {
                fetchAlbum(albumId);
              }
              
              fetchAlbums();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete image');
              console.error('Error deleting image:', err);
            }
          },
        },
      ]
    );
  };

  // Reset forms
  const resetCreateForm = () => {
    setNewAlbum({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setAlbumCover(null);
  };

  const resetUploadForm = () => {
    setUploadData({
      albumId: '',
      files: [],
      captions: [],
    });
  };

  // Remove upload image
  const removeUploadImage = (index) => {
    setUploadData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      captions: prev.captions.filter((_, i) => i !== index),
    }));
  };

  // Update caption
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
      month: 'short',
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

  // Filter albums
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

  // Render album card
  const renderAlbumCard = ({ item: album }) => (
    <TouchableOpacity
      style={styles.albumCard}
      onPress={() => fetchAlbum(album._id)}
      activeOpacity={0.8}
    >
      <View style={styles.albumCoverContainer}>
        <Image
          source={{ uri: album.coverImage?.imageUrl || 'https://via.placeholder.com/400x300' }}
          style={styles.albumCover}
          resizeMode="cover"
        />
        <View style={styles.coverOverlay} />
        
        <View style={[
          styles.statusBadge,
          album.isArchived ? styles.statusArchived : styles.statusActive
        ]}>
          <Text style={styles.statusText}>
            {album.isArchived ? 'Archived' : 'Active'}
          </Text>
        </View>
        
        <View style={styles.photoCountBadge}>
          <MaterialIcons name="image" size={14} color="#fff" />
          <Text style={styles.photoCountText}>{album.totalPhotos || 0}</Text>
        </View>
      </View>
      
      <View style={styles.albumDetails}>
        <Text style={styles.albumTitle} numberOfLines={2}>{album.title}</Text>
        <Text style={styles.albumDescription} numberOfLines={2}>
          {album.description || 'No description'}
        </Text>
        
        <View style={styles.albumInfo}>
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text style={styles.infoText}>{formatDate(album.date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render photo item
  const renderPhotoItem = ({ item: image, index }) => (
    <TouchableOpacity
      style={styles.photoItem}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: image.imageUrl }}
        style={styles.photoImage}
        resizeMode="cover"
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
        onPress={() => handleDeleteImage(selectedAlbum._id, index)}
      >
        <Ionicons name="trash-outline" size={18} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading albums...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Photo Gallery</Text>
            <Text style={styles.headerSubtitle}>University Activities</Text>
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearchModal(true)}
          >
            <Ionicons name="search" size={22} color="#374151" />
          </TouchableOpacity>
        </View>
        
        {/* Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={styles.statsContainer}
        >
          <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <MaterialIcons name="folder" size={20} color="#3b82f6" />
            <Text style={styles.statNumber}>{stats.totalAlbums}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
            <MaterialIcons name="image" size={20} color="#16a34a" />
            <Text style={styles.statNumber}>{stats.activeAlbums}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="eye-off-outline" size={20} color="#d97706" />
            <Text style={styles.statNumber}>{stats.archivedAlbums}</Text>
            <Text style={styles.statLabel}>Archived</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#f3e8ff' }]}>
            <MaterialIcons name="collections" size={20} color="#7c3aed" />
            <Text style={styles.statNumber}>{stats.totalPhotos}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
        </ScrollView>
        
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.viewToggleButton}
            onPress={() => setViewArchived(!viewArchived)}
          >
            <Ionicons
              name={viewArchived ? 'eye' : 'eye-off'}
              size={18}
              color="#374151"
            />
            <Text style={styles.viewToggleText}>
              {viewArchived ? 'View Active' : 'View Archived'}
            </Text>
          </TouchableOpacity>
          
          {!viewArchived && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>New Album</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Albums List */}
      <FlatList
        data={filteredAlbums}
        renderItem={renderAlbumCard}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={styles.albumsRow}
        contentContainerStyle={styles.albumsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="folder-open" size={48} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No albums found</Text>
            <Text style={styles.emptyDescription}>
              {viewArchived 
                ? 'No archived albums yet'
                : 'Create your first album to get started'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      {!viewArchived && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Album Detail Modal */}
      <Modal
        visible={!!selectedAlbum}
        animationType="slide"
        onRequestClose={() => setSelectedAlbum(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedAlbum?.title}
              </Text>
              <View style={styles.modalInfo}>
                <View style={styles.modalInfoItem}>
                  <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                  <Text style={styles.modalInfoText}>
                    {selectedAlbum && formatDate(selectedAlbum.date)}
                  </Text>
                </View>
                <View style={styles.modalInfoItem}>
                  <MaterialIcons name="image" size={14} color="#6b7280" />
                  <Text style={styles.modalInfoText}>
                    {selectedAlbum?.totalPhotos || 0} photos
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedAlbum(null)}
            >
              <Ionicons name="close" size={26} color="#374151" />
            </TouchableOpacity>
          </View>

          {(!selectedAlbum?.images || selectedAlbum.images.length === 0) ? (
            <View style={styles.emptyAlbumState}>
              <View style={styles.emptyAlbumIcon}>
                <MaterialIcons name="add-photo-alternate" size={48} color="#9ca3af" />
              </View>
              <Text style={styles.emptyAlbumTitle}>No photos yet</Text>
              <Text style={styles.emptyAlbumDescription}>
                Upload photos to this album
              </Text>
              <TouchableOpacity
                style={styles.uploadPhotosButton}
                onPress={() => {
                  setUploadData(prev => ({ ...prev, albumId: selectedAlbum?._id }));
                  setShowUploadModal(true);
                }}
              >
                <MaterialIcons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.uploadPhotosButtonText}>Upload Photos</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.photosHeader}>
                <Text style={styles.photosHeaderText}>
                  {selectedAlbum?.images?.length || 0} Photos
                </Text>
                <TouchableOpacity
                  style={styles.addPhotosButton}
                  onPress={() => {
                    setUploadData(prev => ({ ...prev, albumId: selectedAlbum?._id }));
                    setShowUploadModal(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={selectedAlbum?.images || []}
                renderItem={renderPhotoItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                columnWrapperStyle={styles.photosRow}
                contentContainerStyle={styles.photosList}
              />
            </>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.modalActionButton,
                selectedAlbum?.isArchived
                  ? styles.restoreActionButton
                  : styles.archiveActionButton
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
              <Text style={styles.modalActionButtonText}>
                {selectedAlbum?.isArchived ? 'Restore' : 'Archive'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteActionButton}
              onPress={() => {
                handleDeleteAlbum(selectedAlbum?._id);
                setSelectedAlbum(null);
              }}
            >
              <Text style={styles.deleteActionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Create Album Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.formModalContainer}>
          <View style={styles.formModalHeader}>
            <Text style={styles.formModalTitle}>Create Album</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={26} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formModalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Album Title *</Text>
              <TextInput
                style={styles.formInput}
                value={newAlbum.title}
                onChangeText={(text) => setNewAlbum(prev => ({ ...prev, title: text }))}
                placeholder="e.g., Graduation 2024"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={newAlbum.description}
                onChangeText={(text) => setNewAlbum(prev => ({ ...prev, description: text }))}
                placeholder="Brief description..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date *</Text>
              <TextInput
                style={styles.formInput}
                value={newAlbum.date}
                onChangeText={(text) => setNewAlbum(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cover Image *</Text>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickCoverImage}
              >
                <MaterialIcons name="add-photo-alternate" size={24} color="#3b82f6" />
                <Text style={styles.imagePickerText}>
                  {albumCover ? 'Change Cover Image' : 'Select Cover Image'}
                </Text>
              </TouchableOpacity>
              
              {albumCover && (
                <Image
                  source={{ uri: albumCover.uri }}
                  style={styles.coverPreview}
                  resizeMode="cover"
                />
              )}
            </View>
          </ScrollView>

          <View style={styles.formModalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCreateModal(false);
                resetCreateForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!newAlbum.title || !albumCover || uploading) && styles.submitButtonDisabled
              ]}
              onPress={handleCreateAlbum}
              disabled={!newAlbum.title || !albumCover || uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Upload Images Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <SafeAreaView style={styles.formModalContainer}>
          <View style={styles.formModalHeader}>
            <Text style={styles.formModalTitle}>Upload Photos</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <Ionicons name="close" size={26} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formModalContent}>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImages}
            >
              <MaterialIcons name="add-photo-alternate" size={24} color="#3b82f6" />
              <Text style={styles.imagePickerText}>
                {uploadData.files.length > 0
                  ? `${uploadData.files.length} photo(s) selected`
                  : 'Select Photos'}
              </Text>
            </TouchableOpacity>

            {uploadData.files.length > 0 && (
              <View style={styles.uploadPreviewContainer}>
                <Text style={styles.uploadPreviewTitle}>
                  Selected Photos ({uploadData.files.length})
                </Text>
                {uploadData.files.map((file, index) => (
                  <View key={index} style={styles.uploadPreviewItem}>
                    <Image
                      source={{ uri: file.uri }}
                      style={styles.uploadPreviewImage}
                      resizeMode="cover"
                    />
                    <View style={styles.uploadPreviewDetails}>
                      <TextInput
                        style={styles.captionInput}
                        value={uploadData.captions[index] || ''}
                        onChangeText={(text) => updateUploadCaption(index, text)}
                        placeholder="Add caption..."
                        placeholderTextColor="#9ca3af"
                        multiline
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeUploadImage(index)}
                      >
                        <Ionicons name="close-circle" size={20} color="#dc2626" />
                        <Text style={styles.removeImageText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.formModalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowUploadModal(false);
                resetUploadForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (uploadData.files.length === 0 || uploading) && styles.submitButtonDisabled
              ]}
              onPress={handleUploadImages}
              disabled={uploadData.files.length === 0 || uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Upload ({uploadData.files.length})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Search/Filter Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.searchModalOverlay}>
          <View style={styles.searchModalContainer}>
            <View style={styles.searchModalHeader}>
              <Text style={styles.searchModalTitle}>Search & Filter</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchModalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Search</Text>
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search" size={20} color="#6b7280" />
                  <TextInput
                    style={styles.searchInput}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="Search albums..."
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sort By</Text>
                <View style={styles.sortOptions}>
                  {[
                    { value: 'date-desc', label: 'Newest First' },
                    { value: 'date-asc', label: 'Oldest First' },
                    { value: 'title-asc', label: 'Title A-Z' },
                    { value: 'title-desc', label: 'Title Z-A' },
                    { value: 'photos-desc', label: 'Most Photos' },
                  ].map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortOption,
                        sortBy === option.value && styles.sortOptionActive
                      ]}
                      onPress={() => setSortBy(option.value)}
                    >
                      <Text style={[
                        styles.sortOptionText,
                        sortBy === option.value && styles.sortOptionTextActive
                      ]}>
                        {option.label}
                      </Text>
                      {sortBy === option.value && (
                        <Ionicons name="checkmark" size={20} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setShowSearchModal(false)}
            >
              <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsScroll: {
    marginBottom: 16,
  },
  statsContainer: {
    gap: 12,
    paddingRight: 16,
  },
  statCard: {
    width: 100,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  albumsList: {
    padding: 16,
  },
  albumsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  albumCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  albumCoverContainer: {
    height: 140,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusArchived: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065f46',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  albumDetails: {
    padding: 12,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  albumDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  albumInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#3b82f6',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalHeaderContent: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  modalInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalInfoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  modalCloseButton: {
    padding: 4,
  },
  emptyAlbumState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
  uploadPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  uploadPhotosButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  photosHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addPhotosButton: {
    width: 36,
    height: 36,
    backgroundColor: '#059669',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photosList: {
    padding: 16,
  },
  photosRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoItem: {
    width: (width - 44) / 2,
    height: 160,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  captionText: {
    fontSize: 11,
    color: '#fff',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc2626',
    padding: 6,
    borderRadius: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  modalActionButton: {
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
  modalActionButtonText: {
    fontSize: 15,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  formModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  formModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  formModalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#93c5fd',
    borderRadius: 12,
    paddingVertical: 20,
    gap: 8,
  },
  imagePickerText: {
    fontSize: 15,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  coverPreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 12,
  },
  uploadPreviewContainer: {
    marginTop: 20,
  },
  uploadPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  uploadPreviewItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  uploadPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  uploadPreviewDetails: {
    flex: 1,
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
    minHeight: 40,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeImageText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
  },
  formModalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  searchModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchModalContent: {
    padding: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  sortOptions: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sortOptionActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  sortOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  sortOptionTextActive: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  applyFiltersButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default GalleryMobile;