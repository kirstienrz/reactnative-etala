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
  Linking,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  Feather,
  FontAwesome,
} from '@expo/vector-icons';
import {
  getWebinars,
  createWebinar,
  updateWebinar,
  deleteWebinar,
  getResources,
  createResource,
  updateResource,
  deleteResource,
} from '../../api/knowledge';

const AdminKnowledgeHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('webinars');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('webinar');
  
  const [webinars, setWebinars] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    organization: '',
    date: '',
    duration: '',
    videoUrl: '',
    description: '',
    tags: '',
    size: '',
    url: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [webinarsData, resourcesData] = await Promise.all([
        getWebinars(),
        getResources(),
      ]);
      setWebinars(webinarsData);
      setResources(resourcesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setEditingItem(item);
      if (type === 'webinar') {
        setFormData({
          ...item,
          tags: item.tags?.join(', ') || '',
        });
      } else {
        setFormData({ ...item });
      }
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        speaker: '',
        organization: '',
        date: '',
        duration: '',
        videoUrl: '',
        description: '',
        tags: '',
        size: '',
        url: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      title: '',
      speaker: '',
      organization: '',
      date: '',
      duration: '',
      videoUrl: '',
      description: '',
      tags: '',
      size: '',
      url: '',
    });
  };

  const getYouTubeID = (url) => {
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?]+)/;
    const match = url?.match(regExp);
    return match ? match[1] : null;
  };

  const handleSubmit = async () => {
    if (modalType === 'webinar') {
      if (!formData.title || !formData.speaker || !formData.date || !formData.videoUrl) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    } else {
      if (!formData.title || !formData.date || !formData.url) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    }

    setUploading(true);
    try {
      if (modalType === 'webinar') {
        const payload = {
          title: formData.title,
          speaker: formData.speaker,
          organization: formData.organization,
          date: formData.date,
          duration: formData.duration,
          videoUrl: formData.videoUrl,
          description: formData.description,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        };

        if (editingItem) {
          await updateWebinar(editingItem._id, payload);
          Alert.alert('Success', 'Webinar updated successfully');
        } else {
          await createWebinar(payload);
          Alert.alert('Success', 'Webinar created successfully');
        }
        
        const updatedWebinars = await getWebinars();
        setWebinars(updatedWebinars);
      } else {
        const payload = {
          title: formData.title,
          date: formData.date,
          size: formData.size,
          url: formData.url,
        };

        if (editingItem) {
          await updateResource(editingItem._id, payload);
          Alert.alert('Success', 'Resource updated successfully');
        } else {
          await createResource(payload);
          Alert.alert('Success', 'Resource created successfully');
        }
        
        const updatedResources = await getResources();
        setResources(updatedResources);
      }

      closeModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to save data');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (type, id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'webinar') {
                await deleteWebinar(id);
                const updatedWebinars = await getWebinars();
                setWebinars(updatedWebinars);
                Alert.alert('Success', 'Webinar deleted successfully');
              } else {
                await deleteResource(id);
                const updatedResources = await getResources();
                setResources(updatedResources);
                Alert.alert('Success', 'Resource deleted successfully');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const filteredWebinars = webinars.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = resources.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderWebinarItem = ({ item }) => {
    const youtubeId = getYouTubeID(item.videoUrl);
    const thumbnailUrl = youtubeId 
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : null;

    return (
      <View style={styles.webinarCard}>
        <TouchableOpacity
          onPress={() => Linking.openURL(item.videoUrl)}
        >
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.noThumbnail]}>
              <Ionicons name="videocam-outline" size={48} color="#D1D9E6" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.webinarContent}>
          <Text style={styles.webinarTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.webinarDescription} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          
          <View style={styles.webinarDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color="#6C757D" />
              <Text style={styles.detailText}>{item.speaker}</Text>
            </View>
            {item.organization && (
              <View style={styles.detailRow}>
                <Ionicons name="business-outline" size={14} color="#6C757D" />
                <Text style={styles.detailText}>{item.organization}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#6C757D" />
              <Text style={styles.detailText}>{item.date}</Text>
            </View>
            {item.duration && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={14} color="#6C757D" />
                <Text style={styles.detailText}>{item.duration}</Text>
              </View>
            )}
          </View>

          {item.tags?.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => openModal('webinar', item)}
            >
              <Ionicons name="create-outline" size={16} color="#2D5BFF" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete('webinar', item._id)}
            >
              <Ionicons name="trash-outline" size={16} color="#DC3545" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderResourceItem = ({ item }) => (
    <View style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <View style={styles.resourceIcon}>
          <MaterialIcons name="picture-as-pdf" size={24} color="#DC3545" />
        </View>
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.resourceDetails}>
            <View style={styles.resourceDetail}>
              <Ionicons name="calendar-outline" size={12} color="#6C757D" />
              <Text style={styles.resourceDetailText}>{item.date}</Text>
            </View>
            {item.size && (
              <View style={styles.resourceDetail}>
                <Ionicons name="document-outline" size={12} color="#6C757D" />
                <Text style={styles.resourceDetailText}>{item.size}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.resourceActions}>
        <TouchableOpacity
          style={[styles.resourceActionButton, styles.downloadButton]}
          onPress={() => Linking.openURL(item.url)}
        >
          <Feather name="download" size={16} color="#2D5BFF" />
          <Text style={styles.downloadButtonText}>View/Download</Text>
        </TouchableOpacity>
        
        <View style={styles.resourceEditButtons}>
          <TouchableOpacity
            style={[styles.editIconButton, styles.marginRight]}
            onPress={() => openModal('resource', item)}
          >
            <Ionicons name="create-outline" size={18} color="#2D5BFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={() => handleDelete('resource', item._id)}
          >
            <Ionicons name="trash-outline" size={18} color="#DC3545" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D5BFF" />
        <Text style={styles.loadingText}>Loading knowledge hub...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Knowledge Hub Admin</Text>
          <Text style={styles.subtitle}>Manage webinars and resources</Text>
        </View>
        <TouchableOpacity onPress={fetchData}>
          <Ionicons name="refresh" size={22} color="#2D5BFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'webinars' && styles.tabActive]}
              onPress={() => setActiveTab('webinars')}
            >
              <Ionicons 
                name="videocam-outline" 
                size={18} 
                color={activeTab === 'webinars' ? '#2D5BFF' : '#6C757D'} 
              />
              <Text style={[styles.tabText, activeTab === 'webinars' && styles.tabTextActive]}>
                Webinars & Trainings ({webinars.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'resources' && styles.tabActive]}
              onPress={() => setActiveTab('resources')}
            >
              <Ionicons 
                name="document-text-outline" 
                size={18} 
                color={activeTab === 'resources' ? '#2D5BFF' : '#6C757D'} 
              />
              <Text style={[styles.tabText, activeTab === 'resources' && styles.tabTextActive]}>
                Resources ({resources.length})
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Search and Add Button */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#7C8DB5" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#8A94A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openModal(activeTab === 'webinars' ? 'webinar' : 'resource')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>
            Add {activeTab === 'webinars' ? 'Webinar' : 'Resource'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'webinars' ? filteredWebinars : filteredResources}
        renderItem={activeTab === 'webinars' ? renderWebinarItem : renderResourceItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2D5BFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {activeTab === 'webinars' ? (
              <Ionicons name="videocam-off-outline" size={48} color="#D1D9E6" />
            ) : (
              <MaterialIcons name="picture-as-pdf" size={48} color="#D1D9E6" />
            )}
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No results found' : 'No items yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try a different search' : `Add your first ${activeTab === 'webinars' ? 'webinar' : 'resource'}`}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit' : 'Add'} {modalType === 'webinar' ? 'Webinar/Training' : 'Resource'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#2D5BFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {modalType === 'webinar' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Title *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter title"
                      value={formData.title}
                      onChangeText={(text) => setFormData({...formData, title: text})}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Speaker *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter speaker name"
                      value={formData.speaker}
                      onChangeText={(text) => setFormData({...formData, speaker: text})}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Organization</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter organization"
                      value={formData.organization}
                      onChangeText={(text) => setFormData({...formData, organization: text})}
                    />
                  </View>

                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, styles.halfInput]}>
                      <Text style={styles.inputLabel}>Date *</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="YYYY-MM-DD"
                        value={formData.date}
                        onChangeText={(text) => setFormData({...formData, date: text})}
                      />
                    </View>
                    <View style={[styles.inputGroup, styles.halfInput]}>
                      <Text style={styles.inputLabel}>Duration</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., 2 hours"
                        value={formData.duration}
                        onChangeText={(text) => setFormData({...formData, duration: text})}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>YouTube URL *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.videoUrl}
                      onChangeText={(text) => setFormData({...formData, videoUrl: text})}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      placeholder="Enter description"
                      multiline
                      numberOfLines={4}
                      value={formData.description}
                      onChangeText={(text) => setFormData({...formData, description: text})}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tags (comma separated)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Leadership, Governance, Women Empowerment"
                      value={formData.tags}
                      onChangeText={(text) => setFormData({...formData, tags: text})}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Title *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter resource title"
                      value={formData.title}
                      onChangeText={(text) => setFormData({...formData, title: text})}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Document URL *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="https://example.com/document.pdf"
                      value={formData.url}
                      onChangeText={(text) => setFormData({...formData, url: text})}
                    />
                  </View>

                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, styles.halfInput]}>
                      <Text style={styles.inputLabel}>Date *</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="YYYY-MM-DD"
                        value={formData.date}
                        onChangeText={(text) => setFormData({...formData, date: text})}
                      />
                    </View>
                    <View style={[styles.inputGroup, styles.halfInput]}>
                      <Text style={styles.inputLabel}>File Size</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., 2.4 MB"
                        value={formData.size}
                        onChangeText={(text) => setFormData({...formData, size: text})}
                      />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, uploading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingItem ? 'Update' : 'Save'}
                  </Text>
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
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#F0F5FF',
    borderWidth: 1,
    borderColor: '#2D5BFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
  tabTextActive: {
    color: '#2D5BFF',
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D5BFF',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // Webinar Card Styles
  webinarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
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
  thumbnail: {
    width: '100%',
    height: 180,
  },
  noThumbnail: {
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webinarContent: {
    padding: 16,
  },
  webinarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    lineHeight: 22,
  },
  webinarDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
    lineHeight: 20,
  },
  webinarDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6C757D',
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#3949AB',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#F0F5FF',
    borderWidth: 1,
    borderColor: '#2D5BFF',
  },
  deleteButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D5BFF',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC3545',
  },
  // Resource Card Styles
  resourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
    lineHeight: 20,
  },
  resourceDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  resourceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resourceDetailText: {
    fontSize: 12,
    color: '#6C757D',
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  resourceActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F5FF',
    borderRadius: 6,
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D5BFF',
  },
  resourceEditButtons: {
    flexDirection: 'row',
  },
  editIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  marginRight: {
    marginRight: 8,
  },
  // Empty State
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
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(33, 37, 41, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  modalBody: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
  saveButton: {
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
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdminKnowledgeHub;