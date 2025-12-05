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
  FontAwesome,
} from '@expo/vector-icons';
import {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../api/news';

const AdminNewsAnnouncements = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('news');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('news');
  
  const [news, setNews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    content: '',
    link: '',
    imageFile: null,
    imageUrl: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [newsData, announcementsData] = await Promise.all([
        getNews(),
        getAnnouncements(),
      ]);
      setNews(newsData);
      setAnnouncements(announcementsData);
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
      setFormData({
        title: item.title || '',
        date: item.date || '',
        content: item.content || '',
        link: item.link || '',
        imageFile: null,
        imageUrl: item.imageUrl || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        date: '',
        content: '',
        link: '',
        imageFile: null,
        imageUrl: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      title: '',
      date: '',
      content: '',
      link: '',
      imageFile: null,
      imageUrl: '',
    });
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
      setFormData({
        ...formData,
        imageFile: asset,
        imageUrl: asset.uri,
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setUploading(true);
    try {
      if (modalType === 'news') {
        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('content', formData.content);
        if (formData.date) payload.append('date', formData.date);
        if (formData.link) payload.append('link', formData.link);
        
        if (formData.imageFile) {
          payload.append('image', {
            uri: formData.imageFile.uri,
            type: formData.imageFile.mimeType,
            name: formData.imageFile.fileName || 'image.jpg',
          });
        }

        if (editingItem) {
          await updateNews(editingItem._id, payload);
          Alert.alert('Success', 'News updated successfully');
        } else {
          await createNews(payload);
          Alert.alert('Success', 'News created successfully');
        }
        
        const updatedNews = await getNews();
        setNews(updatedNews);
      } else {
        const payload = {
          title: formData.title,
          content: formData.content,
          link: formData.link,
        };

        if (editingItem) {
          await updateAnnouncement(editingItem._id, payload);
          Alert.alert('Success', 'Announcement updated successfully');
        } else {
          await createAnnouncement(payload);
          Alert.alert('Success', 'Announcement created successfully');
        }
        
        const updatedAnnouncements = await getAnnouncements();
        setAnnouncements(updatedAnnouncements);
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
              if (type === 'news') {
                await deleteNews(id);
                const updatedNews = await getNews();
                setNews(updatedNews);
                Alert.alert('Success', 'News deleted successfully');
              } else {
                await deleteAnnouncement(id);
                const updatedAnnouncements = await getAnnouncements();
                setAnnouncements(updatedAnnouncements);
                Alert.alert('Success', 'Announcement deleted successfully');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAnnouncements = announcements.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNewsItem = ({ item }) => (
    <View style={styles.newsCard}>
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.newsMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6C757D" />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
        </View>
        
        <Text style={styles.newsContentText} numberOfLines={3}>
          {item.content}
        </Text>
        
        {item.link && (
          <TouchableOpacity style={styles.linkButton}>
            <Ionicons name="link-outline" size={14} color="#2D5BFF" />
            <Text style={styles.linkText}>Read more</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.newsActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openModal('news', item)}
          >
            <Ionicons name="create-outline" size={16} color="#2D5BFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete('news', item._id)}
          >
            <Ionicons name="trash-outline" size={16} color="#DC3545" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAnnouncementItem = ({ item }) => (
    <View style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <View style={styles.announcementIcon}>
          <Ionicons name="megaphone-outline" size={20} color="#DC6803" />
        </View>
        <View style={styles.announcementInfo}>
          <Text style={styles.announcementTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.announcementMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color="#6C757D" />
              <Text style={styles.metaTextSmall}>{item.date}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <Text style={styles.announcementContent} numberOfLines={3}>
        {item.content}
      </Text>
      
      <View style={styles.announcementActions}>
        <TouchableOpacity
          style={[styles.editIconButton, styles.marginRight]}
          onPress={() => openModal('announcement', item)}
        >
          <Ionicons name="create-outline" size={18} color="#2D5BFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editIconButton}
          onPress={() => handleDelete('announcement', item._id)}
        >
          <Ionicons name="trash-outline" size={18} color="#DC3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D5BFF" />
        <Text style={styles.loadingText}>Loading news & announcements...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>News & Announcements Admin</Text>
          <Text style={styles.subtitle}>Manage latest updates</Text>
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
              style={[styles.tab, activeTab === 'news' && styles.tabActive]}
              onPress={() => setActiveTab('news')}
            >
              <Ionicons 
                name="newspaper-outline" 
                size={18} 
                color={activeTab === 'news' ? '#2D5BFF' : '#6C757D'} 
              />
              <Text style={[styles.tabText, activeTab === 'news' && styles.tabTextActive]}>
                News ({news.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'announcements' && styles.tabActive]}
              onPress={() => setActiveTab('announcements')}
            >
              <Ionicons 
                name="megaphone-outline" 
                size={18} 
                color={activeTab === 'announcements' ? '#2D5BFF' : '#6C757D'} 
              />
              <Text style={[styles.tabText, activeTab === 'announcements' && styles.tabTextActive]}>
                Announcements ({announcements.length})
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
          onPress={() => openModal(activeTab === 'news' ? 'news' : 'announcement')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>
            Add {activeTab === 'news' ? 'News' : 'Announcement'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'news' ? filteredNews : filteredAnnouncements}
        renderItem={activeTab === 'news' ? renderNewsItem : renderAnnouncementItem}
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
            {activeTab === 'news' ? (
              <Ionicons name="newspaper-outline" size={48} color="#D1D9E6" />
            ) : (
              <Ionicons name="megaphone-outline" size={48} color="#D1D9E6" />
            )}
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No results found' : 'No items yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try a different search' : `Add your first ${activeTab === 'news' ? 'news' : 'announcement'}`}
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
                {editingItem ? 'Edit' : 'Add'} {modalType === 'news' ? 'News' : 'Announcement'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#2D5BFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
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
                <Text style={styles.inputLabel}>Content *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Enter content"
                  multiline
                  numberOfLines={4}
                  value={formData.content}
                  onChangeText={(text) => setFormData({...formData, content: text})}
                />
              </View>

              {modalType === 'news' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Image</Text>
                    {formData.imageUrl ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image
                          source={{ uri: formData.imageUrl }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.changeImageButton}
                          onPress={pickImage}
                        >
                          <Text style={styles.changeImageText}>Change Image</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.imageUploadArea}
                        onPress={pickImage}
                      >
                        <Ionicons name="image-outline" size={32} color="#2D5BFF" />
                        <Text style={styles.uploadAreaText}>Select Image</Text>
                        <Text style={styles.uploadAreaSubtext}>
                          Tap to choose an image
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>External Link</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="https://example.com"
                      value={formData.link}
                      onChangeText={(text) => setFormData({...formData, link: text})}
                    />
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
  // News Card Styles
  newsCard: {
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
  newsImage: {
    width: '100%',
    height: 180,
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6C757D',
  },
  newsContentText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  linkText: {
    fontSize: 13,
    color: '#2D5BFF',
    fontWeight: '500',
  },
  newsActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
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
  // Announcement Card Styles
  announcementCard: {
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
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  announcementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
    lineHeight: 20,
  },
  announcementMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaTextSmall: {
    fontSize: 12,
    color: '#6C757D',
  },
  announcementContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  announcementActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageUploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: '#2D5BFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F0F5FF',
  },
  uploadAreaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5BFF',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadAreaSubtext: {
    fontSize: 13,
    color: '#6C757D',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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

export default AdminNewsAnnouncements;