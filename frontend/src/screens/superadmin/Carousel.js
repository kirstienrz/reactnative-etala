import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Ionicons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import {
  getCarouselImages,
  getArchivedCarouselImages,
  uploadCarouselImage,
  archiveCarouselImage,
  restoreCarouselImage,
} from '../../api/carousel';

const CarouselManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewArchived, setViewArchived] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);

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
      Alert.alert('Error', 'Failed to load carousel images');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchImages();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedFile(asset);
      setImageInfo({
        uri: asset.uri,
        type: asset.mimeType,
        size: (asset.fileSize / 1024).toFixed(2),
        dimensions: `${asset.width} x ${asset.height}`,
        name: asset.fileName || 'image.jpg',
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.fileSize > maxSize) {
      Alert.alert('Error', 'Image size must be less than 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.mimeType)) {
      Alert.alert('Error', 'Only JPG, PNG, and WebP images are allowed');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType,
        name: selectedFile.fileName || 'image.jpg',
      });

      await uploadCarouselImage(formData);
      Alert.alert('Success', 'Image uploaded successfully!');
      setSelectedFile(null);
      setImageInfo(null);
      setShowUploadModal(false);
      fetchImages();
    } catch (err) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleArchive = async (id) => {
    Alert.alert(
      'Archive Image',
      'Are you sure you want to archive this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveCarouselImage(id);
              Alert.alert('Success', 'Image archived successfully!');
              fetchImages();
            } catch (err) {
              Alert.alert('Error', 'Failed to archive image');
            }
          },
        },
      ]
    );
  };

  const handleRestore = async (id) => {
    Alert.alert(
      'Restore Image',
      'Restore this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await restoreCarouselImage(id);
              Alert.alert('Success', 'Image restored successfully!');
              fetchImages();
            } catch (err) {
              Alert.alert('Error', 'Failed to restore image');
            }
          },
        },
      ]
    );
  };

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

  const handleBulkAction = async () => {
    if (selectedImages.size === 0) {
      Alert.alert('Error', 'Please select at least one image');
      return;
    }

    const action = viewArchived ? 'restore' : 'archive';
    const actionText = viewArchived ? 'Restore' : 'Archive';
    const confirmMsg = `${actionText} ${selectedImages.size} image(s)?`;

    Alert.alert(
      `${actionText} Images`,
      confirmMsg,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          onPress: async () => {
            try {
              const promises = Array.from(selectedImages).map(id =>
                action === 'archive' ? archiveCarouselImage(id) : restoreCarouselImage(id)
              );
              await Promise.all(promises);
              Alert.alert('Success', `${actionText}ed ${selectedImages.size} image(s) successfully`);
              fetchImages();
            } catch (err) {
              Alert.alert('Error', `Failed to ${action} some images`);
            }
          },
        },
      ]
    );
  };

  const filteredAndSortedImages = images
    .filter(img => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      const date = new Date(img.createdAt).toLocaleDateString().toLowerCase();
      return date.includes(searchLower);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  const stats = {
    active: !viewArchived ? images.length : 0,
    archived: viewArchived ? images.length : 0,
    selected: selectedImages.size
  };

  const renderImageItem = ({ item }) => (
    <View style={styles.imageCard}>
      <TouchableOpacity
        onPress={() => {
          setSelectedImage(item.imageUrl);
          setShowImageModal(true);
        }}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.imageOverlay}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleImageSelection(item._id)}
        >
          <View style={[
            styles.checkboxInner,
            selectedImages.has(item._id) && styles.checkboxChecked
          ]}>
            {selectedImages.has(item._id) && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.imageInfo}>
          <Text style={styles.imageDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.imageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            viewArchived ? styles.restoreButton : styles.archiveButton
          ]}
          onPress={() => viewArchived ? handleRestore(item._id) : handleArchive(item._id)}
        >
          <Text style={styles.actionButtonText}>
            {viewArchived ? 'Restore' : 'Archive'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D5BFF" />
        <Text style={styles.loadingText}>Loading carousel images...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Carousel Management</Text>
          <Text style={styles.subtitle}>
            {viewArchived
              ? 'View and restore archived images'
              : 'Upload and manage active images'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setViewArchived(!viewArchived)}
        >
          <Text style={styles.toggleButtonText}>
            {viewArchived ? 'View Active' : 'View Archived'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.activeCard]}>
          <Text style={styles.statLabel}>Active Images</Text>
          <Text style={styles.statValue}>
            {viewArchived ? '—' : stats.active}
          </Text>
        </View>
        <View style={[styles.statCard, styles.archivedCard]}>
          <Text style={styles.statLabel}>Archived Images</Text>
          <Text style={styles.statValue}>
            {viewArchived ? stats.archived : '—'}
          </Text>
        </View>
        <View style={[styles.statCard, styles.selectedCard]}>
          <Text style={styles.statLabel}>Selected</Text>
          <Text style={styles.statValue}>{stats.selected}</Text>
        </View>
      </View>

      {/* Upload Button for Active View */}
      {!viewArchived && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload New Image</Text>
        </TouchableOpacity>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#7C8DB5" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by date..."
            placeholderTextColor="#8A94A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
          >
            <Text style={styles.sortButtonText}>
              {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6C757D" />
          </TouchableOpacity>

          {filteredAndSortedImages.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={toggleSelectAll}
              >
                <Text style={styles.selectButtonText}>
                  {selectedImages.size === filteredAndSortedImages.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>

              {selectedImages.size > 0 && (
                <TouchableOpacity
                  style={[
                    styles.bulkActionButton,
                    viewArchived ? styles.bulkRestoreButton : styles.bulkArchiveButton
                  ]}
                  onPress={handleBulkAction}
                >
                  <Text style={styles.bulkActionButtonText}>
                    {viewArchived ? 'Restore' : 'Archive'} ({selectedImages.size})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {/* Images Grid */}
      <FlatList
        data={filteredAndSortedImages}
        renderItem={renderImageItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2D5BFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="image" size={48} color="#D1D9E6" />
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? 'No images found'
                : viewArchived
                ? 'No archived images'
                : 'No images found'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try a different search'
                : viewArchived
                ? 'No images have been archived yet'
                : 'Upload your first image'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Image Preview Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.closeImageButton}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.uploadModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Image</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Ionicons name="close" size={22} color="#2D5BFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {!selectedFile ? (
                <TouchableOpacity
                  style={styles.uploadArea}
                  onPress={pickImage}
                >
                  <Ionicons name="cloud-upload-outline" size={48} color="#2D5BFF" />
                  <Text style={styles.uploadAreaTitle}>Select Image</Text>
                  <Text style={styles.uploadAreaText}>
                    Maximum file size: 5MB
                  </Text>
                  <Text style={styles.uploadAreaText}>
                    Supported formats: JPG, PNG, WebP
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: imageInfo.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.imageDetails}>
                    <Text style={styles.detailsTitle}>Image Details</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>File Name:</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {imageInfo.name}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Size:</Text>
                      <Text style={styles.detailValue}>{imageInfo.size} KB</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Dimensions:</Text>
                      <Text style={styles.detailValue}>{imageInfo.dimensions} px</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Format:</Text>
                      <Text style={styles.detailValue}>
                        {imageInfo.type.split('/')[1].toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={pickImage}
                  >
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.uploadConfirmButton,
                  (!selectedFile || uploading) && styles.disabledButton
                ]}
                onPress={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#2D5BFF',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  subtitle: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2D5BFF',
    borderRadius: 6,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeCard: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  archivedCard: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  selectedCard: {
    backgroundColor: '#E8F5FF',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D5BFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  controlsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#212529',
  },
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    gap: 6,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  bulkActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  bulkArchiveButton: {
    backgroundColor: '#DC6803',
  },
  bulkRestoreButton: {
    backgroundColor: '#0B6E4F',
  },
  bulkActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageCard: {
    width: '48%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  image: {
    width: '100%',
    height: 160,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    justifyContent: 'space-between',
  },
  checkbox: {
    alignSelf: 'flex-start',
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2D5BFF',
  },
  imageInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  imageDate: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  imageTime: {
    color: '#E9ECEF',
    fontSize: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  archiveButton: {
    backgroundColor: '#DC6803',
  },
  restoreButton: {
    backgroundColor: '#0B6E4F',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 4,
    textAlign: 'center',
  },
  // Image Modal
  imageModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImageButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 1,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  // Upload Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(33, 37, 41, 0.5)',
    justifyContent: 'flex-end',
  },
  uploadModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  modalContent: {
    padding: 16,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderWidth: 2,
    borderColor: '#2D5BFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F0F5FF',
  },
  uploadAreaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5BFF',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadAreaText: {
    fontSize: 13,
    color: '#6C757D',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  imageDetails: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  detailValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
    maxWidth: '60%',
  },
  changeImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  changeImageText: {
    fontSize: 14,
    color: '#2D5BFF',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  uploadConfirmButton: {
    backgroundColor: '#2D5BFF',
  },
  disabledButton: {
    backgroundColor: '#CED4DA',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C757D',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CarouselManagement;