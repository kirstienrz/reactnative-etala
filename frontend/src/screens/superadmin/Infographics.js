import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Alert,
  FlatList,
  RefreshControl,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getInfographics,
  getArchivedInfographics,
  uploadInfographics,
  archiveInfographic,
  restoreInfographic,
  deleteInfographic
} from '../../api/infographics';

const { width, height } = Dimensions.get('window');

const InfographicsAdminMobile = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');
  const [modalImage, setModalImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [infographics, setInfographics] = useState([]);
  const [newYear, setNewYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const [formData, setFormData] = useState({
    academicYear: '',
    title: '',
    status: 'active'
  });

  const fetchInfographics = async () => {
    try {
      setLoading(true);
      const data = viewArchived ? await getArchivedInfographics() : await getInfographics();
      const infographicsArray = Array.isArray(data) ? data : [];
      setInfographics(infographicsArray);

      // Compute unique years
      const years = [...new Set(infographicsArray.map(item => item.academicYear))];
      const academicYearsData = years.map(year => ({
        id: year,
        year: year,
        status: 'active',
        infographicsCount: infographicsArray.filter(item => item.academicYear === year).length
      }));
      setAcademicYears(academicYearsData);
    } catch (error) {
      console.error('Failed to fetch infographics:', error);
      Alert.alert('Error', 'Failed to fetch infographics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInfographics();
  }, [viewArchived]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInfographics();
  };

  // Process data
  const filteredInfographics = infographics.filter(item =>
    item.status === (viewArchived ? 'archived' : 'active') &&
    (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.academicYear?.includes(searchQuery))
  );

  const filteredAndSortedImages = filteredInfographics.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.uploadDate) - new Date(a.uploadDate);
    if (sortBy === 'oldest') return new Date(a.uploadDate) - new Date(b.uploadDate);
    return 0;
  });

  const groupedInfographics = filteredAndSortedImages.reduce((acc, item) => {
    if (!acc[item.academicYear]) acc[item.academicYear] = [];
    acc[item.academicYear].push(item);
    return acc;
  }, {});

  const stats = {
    active: infographics.filter(i => i.status === 'active').length,
    archived: infographics.filter(i => i.status === 'archived').length,
    selected: selectedImages.size
  };

  const activeYears = academicYears.filter(y => y.status === 'active');

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleYearChange = (value) => {
    if (value === '' || /^\d{0,4}$/.test(value)) {
      setNewYear(value);
    }
  };

  const handleCreateYear = () => {
    // Validation
    if (!newYear.trim()) {
      Alert.alert('Error', 'Please enter a year!');
      return;
    }

    if (!/^\d{4}$/.test(newYear)) {
      Alert.alert('Error', 'Please enter a valid 4-digit year (2000-2099)!');
      return;
    }

    if (academicYears.find(y => y.year === newYear)) {
      Alert.alert('Error', 'This academic year already exists!');
      return;
    }

    const existingYearInInfographics = infographics.find(item => item.academicYear === newYear);
    if (existingYearInInfographics) {
      Alert.alert('Error', 'This academic year already exists in your infographics!');
      return;
    }

    const newAcademicYear = {
      id: Date.now(),
      year: newYear,
      status: 'active',
      infographicsCount: 0
    };

    setAcademicYears(prev => [...prev, newAcademicYear]);
    setNewYear('');
    setShowYearModal(false);
    Alert.alert('Success', `Academic Year ${newYear} created successfully!`);
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: !editingItem,
        quality: 0.8,
        selectionLimit: editingItem ? 1 : 10,
        allowsEditing: false,
      });

      if (!result.canceled) {
        const images = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          width: asset.width,
          height: asset.height,
        }));
        setPreviewImages(images);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!formData.academicYear) {
      Alert.alert('Error', 'Please select an academic year!');
      return;
    }

    if (previewImages.length === 0) {
      Alert.alert('Error', 'Please upload at least one image!');
      return;
    }

    setIsUploading(true);

    const form = new FormData();
    form.append('academicYear', formData.academicYear);
    form.append('title', formData.title || '');
    
    previewImages.forEach((image, index) => {
      // Extract file extension from URI
      const uriParts = image.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      form.append('images', {
        uri: image.uri,
        type: image.type || `image/${fileType}`,
        name: image.name || `infographic_${Date.now()}_${index}.${fileType}`,
      });
    });

    try {
      await uploadInfographics(form);
      setFormData({ academicYear: '', title: '', status: 'active' });
      setPreviewImages([]);
      setShowUploadModal(false);
      
      setTimeout(() => {
        fetchInfographics();
      }, 500);
      
      Alert.alert('Success', 'Infographics uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      academicYear: item.academicYear,
      title: item.title,
      status: item.status
    });
    setPreviewImages([{ 
      uri: item.imageUrl,
      type: 'image/jpeg',
      name: item.title || `infographic_${item.id}.jpg`
    }]);
    setShowUploadModal(true);
  };

  const handleArchive = (id) => {
    Alert.alert(
      'Archive Infographic',
      'Are you sure you want to archive this infographic?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              await archiveInfographic(id);
              fetchInfographics();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to archive infographic');
            }
          }
        }
      ]
    );
  };

  const handleRestore = (id) => {
    Alert.alert(
      'Restore Infographic',
      'Restore this infographic?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await restoreInfographic(id);
              fetchInfographics();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to restore infographic');
            }
          }
        }
      ]
    );
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Infographic',
      'Are you sure you want to delete this infographic?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInfographic(id);
              fetchInfographics();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete infographic');
            }
          }
        }
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
      setSelectedImages(new Set(filteredAndSortedImages.map(img => img.id)));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedImages.size === 0) return;

    Alert.alert(
      'Confirm Bulk Action',
      `Confirm ${action} for ${selectedImages.size} image(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              for (let id of selectedImages) {
                if (action === 'archive') await archiveInfographic(id);
                if (action === 'restore') await restoreInfographic(id);
              }
              setSelectedImages(new Set());
              fetchInfographics();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', `Failed to ${action} infographics`);
            }
          }
        }
      ]
    );
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setEditingItem(null);
    setFormData({
      academicYear: '',
      title: '',
      status: 'active'
    });
    setPreviewImages([]);
  };

  const renderYearSection = (year, items) => (
    <View key={year} style={styles.yearSection}>
      <View style={styles.yearHeader}>
        <Icon name="calendar-month" size={24} color="#2563eb" />
        <Text style={styles.yearTitle}>AY {year}</Text>
        <View style={styles.yearBadge}>
          <Text style={styles.yearBadgeText}>{items.length} items</Text>
        </View>
      </View>
      
      <FlatList
        data={items}
        renderItem={({ item }) => renderInfographicCard(item)}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.imageGrid}
        scrollEnabled={false}
      />
    </View>
  );

  const renderInfographicCard = (item) => (
    <TouchableOpacity
      style={[
        styles.imageCard,
        selectedImages.has(item.id) && styles.selectedImageCard
      ]}
      onPress={() => setModalImage(item.imageUrl)}
      onLongPress={() => toggleImageSelection(item.id)}
      delayLongPress={500}
    >
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedImages.has(item.id) && styles.checkboxChecked
          ]}
          onPress={() => toggleImageSelection(item.id)}
        >
          {selectedImages.has(item.id) && (
            <Icon name="check" size={16} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
      
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.imageOverlay}>
        <View style={styles.imageInfo}>
          <Text style={styles.imageTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.imageDate}>
            {new Date(item.uploadDate).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.imageActions}>
          {viewArchived ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRestore(item.id)}
            >
              <Icon name="restore" size={16} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(item)}
              >
                <Icon name="pencil-outline" size={16} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleArchive(item.id)}
              >
                <Icon name="archive-outline" size={16} color="#ffffff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Higher Education Institutions Data</Text>
          <Text style={styles.headerSubtitle}>
            {viewArchived
              ? 'View and restore archived infographics'
              : 'Upload and manage infographics by academic year'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewToggleButton}
          onPress={() => setViewArchived(!viewArchived)}
        >
          <Text style={styles.viewToggleText}>
            {viewArchived ? 'View Active Images' : 'View Archived Images'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
          />
        }
        contentContainerStyle={styles.content}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Images</Text>
            <Text style={styles.statValue}>
              {viewArchived ? '—' : stats.active}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Archived Images</Text>
            <Text style={styles.statValue}>
              {viewArchived ? stats.archived : '—'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Selected</Text>
            <Text style={styles.statValue}>{stats.selected}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or year..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
            >
              <Text style={styles.controlButtonText}>
                {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
              </Text>
            </TouchableOpacity>
            
            {!viewArchived && (
              <TouchableOpacity
                style={[styles.controlButton, styles.newYearButton]}
                onPress={() => setShowYearModal(true)}
              >
                <Icon name="plus" size={16} color="#ffffff" />
                <Text style={styles.controlButtonText}>New Year</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.controlButton, styles.uploadButton]}
              onPress={() => setShowUploadModal(true)}
            >
              <Icon name="cloud-upload-outline" size={16} color="#ffffff" />
              <Text style={styles.controlButtonText}>Add Infographics</Text>
            </TouchableOpacity>
          </ScrollView>

          {filteredAndSortedImages.length > 0 && (
            <View style={styles.selectionControls}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={toggleSelectAll}
              >
                <Text style={styles.selectAllText}>
                  {selectedImages.size === filteredAndSortedImages.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
              
              {selectedImages.size > 0 && (
                <TouchableOpacity
                  style={[
                    styles.bulkActionButton,
                    viewArchived ? styles.restoreButton : styles.archiveButton
                  ]}
                  onPress={() => handleBulkAction(viewArchived ? 'restore' : 'archive')}
                >
                  <Text style={styles.bulkActionText}>
                    {viewArchived ? 'Restore' : 'Archive'} ({selectedImages.size})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Infographics List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading infographics...</Text>
          </View>
        ) : Object.keys(groupedInfographics).length > 0 ? (
          <View style={styles.infographicsList}>
            {Object.keys(groupedInfographics)
              .sort()
              .reverse()
              .map(year => renderYearSection(year, groupedInfographics[year]))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="image-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery
                ? 'No infographics found'
                : viewArchived
                ? 'No archived infographics found'
                : 'No infographics found'}
            </Text>
            <Text style={styles.emptyStateText}>
              {!viewArchived && 'Start by adding infographics for an academic year'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Academic Year Modal */}
      <Modal
        visible={showYearModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowYearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Academic Year</Text>
              <TouchableOpacity onPress={() => setShowYearModal(false)}>
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Year *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newYear}
                  onChangeText={handleYearChange}
                  placeholder="Enter year, e.g. 2024"
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <Text style={styles.formHint}>
                  Enter a single 4-digit year (2000-2099)
                </Text>
                {newYear && !/^\d{4}$/.test(newYear) && (
                  <Text style={styles.formError}>
                    Please enter a valid 4-digit year
                  </Text>
                )}
              </View>

              {newYear && /^\d{4}$/.test(newYear) && (
                <View style={styles.yearPreview}>
                  <Text style={styles.previewText}>
                    <Text style={styles.previewLabel}>Preview:</Text> Academic Year {newYear}
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowYearModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleCreateYear}
                  disabled={!newYear || !/^\d{4}$/.test(newYear)}
                >
                  <Text style={styles.createButtonText}>Create Year</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Upload Infographics Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeUploadModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.uploadModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Infographic' : 'Add Infographics'}
              </Text>
              <TouchableOpacity onPress={closeUploadModal}>
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Academic Year * {!formData.academicYear && 
                  <Text style={styles.requiredText}>(Required)</Text>}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectContainer,
                    !formData.academicYear && styles.selectContainerError
                  ]}
                  onPress={() => {}}
                >
                  <Text style={[
                    styles.selectText,
                    !formData.academicYear && styles.selectTextError
                  ]}>
                    {formData.academicYear || 'Select Academic Year'}
                  </Text>
                  <Icon name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
                {!formData.academicYear && (
                  <Text style={styles.formError}>
                    Please select an academic year before uploading
                  </Text>
                )}
                <FlatList
                  data={activeYears}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.yearOption}
                      onPress={() => handleInputChange('academicYear', item.year)}
                    >
                      <Text style={styles.yearOptionText}>
                        {item.year} ({item.infographicsCount} infographics)
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.id}
                  style={styles.yearOptionsList}
                />
              </View>

              {editingItem && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Title</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.title}
                    onChangeText={(text) => handleInputChange('title', text)}
                    placeholder="Infographic title"
                  />
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Upload Infographics * {!editingItem && '(Multiple files supported)'}
                </Text>
                <TouchableOpacity
                  style={styles.uploadArea}
                  onPress={handleImagePicker}
                >
                  {previewImages.length > 0 ? (
                    <View style={styles.previewContainer}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {previewImages.map((image, index) => (
                          <Image
                            key={index}
                            source={{ uri: image.uri }}
                            style={styles.previewImage}
                            resizeMode="cover"
                          />
                        ))}
                      </ScrollView>
                      <Text style={styles.previewText}>
                        {previewImages.length} image(s) selected - Tap to change
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Icon name="cloud-upload-outline" size={48} color="#9ca3af" />
                      <Text style={styles.uploadPlaceholderText}>
                        Tap to upload infographics
                      </Text>
                      <Text style={styles.uploadPlaceholderHint}>
                        PNG, JPG, WebP up to 5MB each
                      </Text>
                      {!editingItem && (
                        <Text style={styles.uploadPlaceholderHint}>
                          You can select multiple files
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeUploadModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.uploadSubmitButton]}
                onPress={handleSubmit}
                disabled={!formData.academicYear || previewImages.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.uploadSubmitText}>Uploading...</Text>
                  </>
                ) : (
                  <Text style={styles.uploadSubmitText}>
                    {editingItem ? 'Update' : 'Upload'} Infographics
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={!!modalImage}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalImage(null)}
      >
        <TouchableOpacity
          style={styles.imagePreviewOverlay}
          activeOpacity={1}
          onPress={() => setModalImage(null)}
        >
          <Image
            source={{ uri: modalImage }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closePreviewButton}
            onPress={() => setModalImage(null)}
          >
            <Icon name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  viewToggleButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  viewToggleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  controlsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  controlsRow: {
    marginBottom: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  controlButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  newYearButton: {
    backgroundColor: '#7c3aed',
  },
  uploadButton: {
    backgroundColor: '#2563eb',
  },
  selectionControls: {
    flexDirection: 'row',
    gap: 8,
  },
  selectAllButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  bulkActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  archiveButton: {
    backgroundColor: '#f59e0b',
  },
  restoreButton: {
    backgroundColor: '#10b981',
  },
  bulkActionText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  yearSection: {
    marginBottom: 24,
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  yearBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  yearBadgeText: {
    fontSize: 10,
    color: '#1e40af',
    fontWeight: '600',
  },
  imageGrid: {
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  imageCard: {
    width: (width - 40) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedImageCard: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  image: {
    width: '100%',
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  imageInfo: {
    flex: 1,
  },
  imageTitle: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  imageDate: {
    fontSize: 9,
    color: '#d1d5db',
    marginTop: 2,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  uploadModalContent: {
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  requiredText: {
    color: '#dc2626',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  formHint: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  formError: {
    fontSize: 11,
    color: '#dc2626',
    marginTop: 4,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectContainerError: {
    borderColor: '#f87171',
    backgroundColor: '#fef2f2',
  },
  selectText: {
    fontSize: 14,
    color: '#111827',
  },
  selectTextError: {
    color: '#6b7280',
  },
  yearOptionsList: {
    marginTop: 8,
    maxHeight: 200,
  },
  yearOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  yearOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  yearPreview: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 14,
    color: '#1e40af',
  },
  previewLabel: {
    fontWeight: 'bold',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  uploadPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  uploadPlaceholderHint: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 8,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  createButton: {
    backgroundColor: '#7c3aed',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  uploadSubmitButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    gap: 8,
  },
  uploadSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closePreviewButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InfographicsAdminMobile;