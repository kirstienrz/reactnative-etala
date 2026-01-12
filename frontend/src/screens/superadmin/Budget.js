import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  RefreshControl,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  FileText,
  Upload,
  DollarSign,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Archive,
  ArchiveRestore,
  Edit2,
  Calendar,
  Search,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react-native';
import {
  getAllBudgets,
  uploadBudget,
  updateBudget,
  archiveBudget,
  unarchiveBudget,
  getActiveBudgets,
  getArchivedBudgets,
} from '../../api/budget';
// For file picker, install: expo-document-picker or react-native-document-picker
import * as DocumentPicker from 'expo-document-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BudgetProgramsMobile = () => {
  const [activeTab, setActiveTab] = useState('reports'); // reports, archived, upload
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [dateApproved, setDateApproved] = useState('');
  const [status, setStatus] = useState('Pending');
  const [file, setFile] = useState(null);
  
  // UI states
  const [previewFile, setPreviewFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [alertModal, setAlertModal] = useState(null);
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Selection
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = activeTab === 'archived' 
        ? await getArchivedBudgets() 
        : await getActiveBudgets();
      setBudgets(data);
      setSelectedItems([]);
      setIsSelectionMode(false);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, [activeTab]);

  // File picker
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setFile(result);
      }
    } catch (err) {
      console.error('File picker error:', err);
      showAlert('error', 'Failed to pick file');
    }
  };

  // Clear form
  const clearForm = () => {
    setTitle('');
    setDescription('');
    setYear('');
    setDateApproved('');
    setStatus('Pending');
    setFile(null);
    setEditingBudget(null);
  };

  // Upload
  const handleUpload = async () => {
    if (!title || !year || !file) {
      showAlert('error', 'Title, year, and file are required');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('year', year);
      formData.append('dateApproved', dateApproved);
      formData.append('status', status);
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      });

      await uploadBudget(formData);
      clearForm();
      setActiveTab('reports');
      await fetchBudgets();
      showAlert('success', 'Budget uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      showAlert('error', 'Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setTitle(budget.title);
    setDescription(budget.description || '');
    setYear(budget.year);
    setDateApproved(budget.dateApproved ? new Date(budget.dateApproved).toISOString().split('T')[0] : '');
    setStatus(budget.status || 'Pending');
    setShowEditModal(true);
  };

  // Update
  const handleUpdate = async () => {
    if (!title || !year) {
      showAlert('error', 'Title and year are required');
      return;
    }

    try {
      setLoading(true);
      await updateBudget(editingBudget._id, {
        title,
        description,
        year,
        dateApproved,
        status,
      });

      setShowEditModal(false);
      clearForm();
      await fetchBudgets();
      showAlert('success', 'Budget updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      showAlert('error', 'Update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Archive single
  const handleArchiveSingle = (id) => {
    Alert.alert(
      'Archive Budget',
      'Are you sure you want to archive this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveBudget(id);
              await fetchBudgets();
              showAlert('success', 'Budget archived successfully!');
            } catch (err) {
              console.error(err);
              showAlert('error', 'Archive failed');
            }
          },
        },
      ]
    );
  };

  // Archive multiple
  const handleArchiveMultiple = () => {
    if (selectedItems.length === 0) {
      showAlert('error', 'Please select items to archive');
      return;
    }

    Alert.alert(
      'Archive Budgets',
      `Archive ${selectedItems.length} selected item(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await Promise.all(selectedItems.map(id => archiveBudget(id)));
              await fetchBudgets();
              showAlert('success', `${selectedItems.length} item(s) archived successfully!`);
            } catch (err) {
              console.error(err);
              showAlert('error', 'Archive failed');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Unarchive
  const handleUnarchive = (id) => {
    Alert.alert(
      'Restore Budget',
      'Are you sure you want to restore this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await unarchiveBudget(id);
              await fetchBudgets();
              showAlert('success', 'Budget restored successfully!');
            } catch (err) {
              console.error(err);
              showAlert('error', 'Restore failed');
            }
          },
        },
      ]
    );
  };

  // Selection
  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredBudgets.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredBudgets.map(b => b._id));
    }
  };

  // Alert helper
  const showAlert = (type, message) => {
    setAlertModal({ type, message });
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

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setZoomLevel(1);

  // Filter
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (budget.description && budget.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesYear = !filterYear || budget.year === filterYear;
    const matchesStatus = !filterStatus || budget.status === filterStatus;
    return matchesSearch && matchesYear && matchesStatus;
  });

  const availableYears = [...new Set(budgets.map(b => b.year))].sort((a, b) => b.localeCompare(a));

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#D1FAE5', text: '#065F46' };
      case 'Pending': return { bg: '#FEF3C7', text: '#92400E' };
      case 'Draft': return { bg: '#F3F4F6', text: '#374151' };
      case 'Rejected': return { bg: '#FEE2E2', text: '#991B1B' };
      default: return { bg: '#DBEAFE', text: '#1E40AF' };
    }
  };

  // File type badge
  const getFileTypeBadge = (format) => {
    if (!format) return 'File';
    if (format.includes('pdf')) return 'PDF';
    if (format.includes('image')) return 'Image';
    return 'File';
  };

  // Render budget item
  const renderBudgetItem = ({ item }) => {
    const statusColors = getStatusColor(item.status);
    const isSelected = selectedItems.includes(item._id);

    return (
      <TouchableOpacity
        style={[
          styles.budgetCard,
          isSelected && styles.budgetCardSelected
        ]}
        onPress={() => isSelectionMode ? toggleSelection(item._id) : openPreview(item)}
        onLongPress={() => {
          if (activeTab === 'reports') {
            setIsSelectionMode(true);
            toggleSelection(item._id);
          }
        }}
      >
        {/* Selection indicator */}
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            {isSelected && <Check width={16} height={16} color="#fff" />}
          </View>
        )}

        {/* Header */}
        <View style={styles.budgetHeader}>
          <View style={styles.budgetHeaderContent}>
            <View style={styles.budgetBadges}>
              <View style={styles.yearBadge}>
                <Text style={styles.yearBadgeText}>{item.year}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <View style={styles.budgetIcon}>
              <FileText width={20} height={20} color="#fff" />
            </View>
          </View>
          <Text style={styles.budgetTitle} numberOfLines={3}>{item.title}</Text>
        </View>

        {/* Info */}
        <View style={styles.budgetInfo}>
          <View style={styles.budgetInfoRow}>
            {item.dateApproved && (
              <View style={styles.budgetInfoItem}>
                <Calendar width={12} height={12} color="#6B7280" />
                <Text style={styles.budgetInfoText}>
                  {new Date(item.dateApproved).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
            <View style={styles.budgetInfoItem}>
              <View style={styles.fileTypeBadge}>
                <Text style={styles.fileTypeBadgeText}>{getFileTypeBadge(item.file.format)}</Text>
              </View>
              {item.file.page_count > 1 && (
                <Text style={styles.pageCount}>{item.file.page_count} pages</Text>
              )}
            </View>
          </View>
        </View>

        {/* Actions */}
        {!isSelectionMode && (
          <View style={styles.budgetActions}>
            <TouchableOpacity style={styles.previewButton} onPress={() => openPreview(item)}>
              <Eye width={14} height={14} color="#fff" />
              <Text style={styles.previewButtonText}>Preview</Text>
            </TouchableOpacity>

            {activeTab === 'reports' ? (
              <>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                  <Edit2 width={14} height={14} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.archiveButton} onPress={() => handleArchiveSingle(item._id)}>
                  <Archive width={14} height={14} color="#F97316" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.restoreButton} onPress={() => handleUnarchive(item._id)}>
                <ArchiveRestore width={14} height={14} color="#10B981" />
                <Text style={styles.restoreButtonText}>Restore</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Alert Modal */}
      <Modal visible={!!alertModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal}>
            <View style={[styles.alertHeader, alertModal?.type === 'success' ? styles.alertHeaderSuccess : styles.alertHeaderError]}>
              <View style={styles.alertIconContainer}>
                {alertModal?.type === 'success' ? (
                  <Check width={24} height={24} color="#059669" />
                ) : (
                  <AlertCircle width={24} height={24} color="#DC2626" />
                )}
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  {alertModal?.type === 'success' ? 'Success' : 'Error'}
                </Text>
                <Text style={styles.alertMessage}>{alertModal?.message}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.alertButton} onPress={() => setAlertModal(null)}>
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Edit Document</Text>
            <TouchableOpacity onPress={() => { setShowEditModal(false); clearForm(); }}>
              <X width={24} height={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Document Title <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. GAD Plan and Budget 2024"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fiscal Year <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholder="e.g. 2024"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Date Approved</Text>
                <TextInput
                  style={styles.input}
                  value={dateApproved}
                  onChangeText={setDateApproved}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.pickerContainer}>
                  {/* Simple status selector */}
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      const statuses = ['Pending', 'Approved', 'Draft', 'Rejected'];
                      Alert.alert('Select Status', '', statuses.map(s => ({
                        text: s,
                        onPress: () => setStatus(s),
                      })));
                    }}
                  >
                    <Text style={styles.pickerButtonText}>{status}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                <Text style={styles.noticeBold}>Note:</Text> File cannot be changed when editing. To use a different file, archive this document and upload a new one.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => { setShowEditModal(false); clearForm(); }}
            >
              <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handleUpdate}
              disabled={loading || !title || !year}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalButtonPrimaryText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={!!previewFile} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.previewHeader}>
            <View style={styles.previewHeaderContent}>
              <Text style={styles.previewTitle} numberOfLines={2}>{previewFile?.title}</Text>
              <View style={styles.previewMeta}>
                <Text style={styles.previewMetaText}>{previewFile?.year}</Text>
                {previewFile?.file.page_count > 1 && (
                  <Text style={styles.previewMetaText}>
                    Page {currentPage + 1} of {previewFile.file.page_count}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={closePreview}>
              <X width={24} height={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.previewContent}
            contentContainerStyle={styles.previewScrollContent}
            minimumZoomScale={0.5}
            maximumZoomScale={3}
          >
            {imageError ? (
              <View style={styles.previewError}>
                <AlertCircle width={48} height={48} color="#F59E0B" />
                <Text style={styles.previewErrorTitle}>Unable to load preview</Text>
                <Text style={styles.previewErrorText}>This page may not be available yet</Text>
                <TouchableOpacity style={styles.previewErrorButton} onPress={() => setImageError(false)}>
                  <Text style={styles.previewErrorButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Image
                source={{ uri: previewFile?.file.image_urls[currentPage] }}
                style={[styles.previewImage, { transform: [{ scale: zoomLevel }] }]}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            )}
          </ScrollView>

          {/* Zoom controls */}
          {!imageError && (
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomButton} onPress={zoomOut} disabled={zoomLevel <= 0.5}>
                <ZoomOut width={20} height={20} color={zoomLevel <= 0.5 ? '#9CA3AF' : '#374151'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomButton} onPress={resetZoom}>
                <RotateCcw width={20} height={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomButton} onPress={zoomIn} disabled={zoomLevel >= 3}>
                <ZoomIn width={20} height={20} color={zoomLevel >= 3 ? '#9CA3AF' : '#374151'} />
              </TouchableOpacity>
            </View>
          )}

          {/* Page navigation */}
          {previewFile?.file.page_count > 1 && !imageError && (
            <View style={styles.pageNavigation}>
              <TouchableOpacity
                style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
                onPress={prevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft width={20} height={20} color={currentPage === 0 ? '#9CA3AF' : '#374151'} />
                <Text style={[styles.pageButtonText, currentPage === 0 && styles.pageButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <View style={styles.pageIndicator}>
                <Text style={styles.pageIndicatorText}>
                  {currentPage + 1} / {previewFile.file.page_count}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.pageButton, currentPage === previewFile.file.page_count - 1 && styles.pageButtonDisabled]}
                onPress={nextPage}
                disabled={currentPage === previewFile.file.page_count - 1}
              >
                <Text style={[styles.pageButtonText, currentPage === previewFile.file.page_count - 1 && styles.pageButtonTextDisabled]}>
                  Next
                </Text>
                <ChevronRight width={20} height={20} color={currentPage === previewFile.file.page_count - 1 ? '#9CA3AF' : '#374151'} />
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Main Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <DollarSign width={20} height={20} color="#fff" />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Plan & Budget</Text>
          <Text style={styles.headerSubtitle}>Manage budget documents</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'reports', label: 'Active' },
            { key: 'archived', label: 'Archived' },
            { key: 'upload', label: 'Upload' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {activeTab === 'upload' ? (
        <ScrollView style={styles.uploadContent} contentContainerStyle={styles.uploadScrollContent}>
          <View style={styles.uploadCard}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Document Title <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. GAD Plan and Budget 2024"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fiscal Year <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholder="e.g. 2024"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Date Approved</Text>
                <TextInput
                  style={styles.input}
                  value={dateApproved}
                  onChangeText={setDateApproved}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Status</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    const statuses = ['Pending', 'Approved', 'Draft', 'Rejected'];
                    Alert.alert('Select Status', '', statuses.map(s => ({
                      text: s,
                      onPress: () => setStatus(s),
                    })));
                  }}
                >
                  <Text style={styles.pickerButtonText}>{status}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Upload File <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity style={styles.filePickerButton} onPress={pickFile}>
                <Upload width={24} height={24} color="#3B82F6" />
                <Text style={styles.filePickerText}>
                  {file ? file.name : 'Choose file (PDF or Image)'}
                </Text>
              </TouchableOpacity>
              {file && (
                <View style={styles.fileInfo}>
                  <FileText width={16} height={16} color="#3B82F6" />
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <TouchableOpacity onPress={() => setFile(null)}>
                    <X width={16} height={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.uploadActions}>
              <TouchableOpacity
                style={[styles.uploadButton, (!title || !year || !file || loading) && styles.uploadButtonDisabled]}
                onPress={handleUpload}
                disabled={!title || !year || !file || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.uploadButtonText}>Upload Document</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.listContent}>
          {/* Search and filters */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search width={16} height={16} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>

          {showFilters && (
            <View style={styles.filtersContainer}>
              <TouchableOpacity
                style={styles.filterItem}
                onPress={() => {
                  Alert.alert('Select Year', '', [
                    { text: 'All Years', onPress: () => setFilterYear('') },
                    ...availableYears.map(y => ({ text: y, onPress: () => setFilterYear(y) })),
                  ]);
                }}
              >
                <Text style={styles.filterItemText}>
                  Year: {filterYear || 'All'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterItem}
                onPress={() => {
                  const statuses = ['Approved', 'Pending', 'Draft', 'Rejected'];
                  Alert.alert('Select Status', '', [
                    { text: 'All Status', onPress: () => setFilterStatus('') },
                    ...statuses.map(s => ({ text: s, onPress: () => setFilterStatus(s) })),
                  ]);
                }}
              >
                <Text style={styles.filterItemText}>
                  Status: {filterStatus || 'All'}
                </Text>
              </TouchableOpacity>

              {(searchQuery || filterYear || filterStatus) && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearchQuery('');
                    setFilterYear('');
                    setFilterStatus('');
                  }}
                >
                  <Text style={styles.clearFiltersText}>Clear all</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Selection mode header */}
          {isSelectionMode && (
            <View style={styles.selectionHeader}>
              <TouchableOpacity style={styles.selectAllButton} onPress={toggleSelectAll}>
                <Text style={styles.selectAllText}>
                  {selectedItems.length === filteredBudgets.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.archiveMultipleButton}
                onPress={handleArchiveMultiple}
                disabled={selectedItems.length === 0}
              >
                <Archive width={16} height={16} color="#fff" />
                <Text style={styles.archiveMultipleText}>
                  Archive ({selectedItems.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelSelectionButton}
                onPress={() => {
                  setIsSelectionMode(false);
                  setSelectedItems([]);
                }}
              >
                <Text style={styles.cancelSelectionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List */}
          <FlatList
            data={filteredBudgets}
            renderItem={renderBudgetItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  {activeTab === 'archived' ? (
                    <Archive width={48} height={48} color="#9CA3AF" />
                  ) : (
                    <FileText width={48} height={48} color="#9CA3AF" />
                  )}
                  <Text style={styles.emptyText}>
                    {activeTab === 'archived' ? 'No archived documents' : 'No documents found'}
                  </Text>
                </View>
              )
            }
          />

          {/* Bulk archive button (floating) */}
          {!isSelectionMode && activeTab === 'reports' && filteredBudgets.length > 0 && (
            <TouchableOpacity
              style={styles.bulkArchiveFab}
              onPress={() => setIsSelectionMode(true)}
            >
              <Archive width={20} height={20} color="#fff" />
              <Text style={styles.bulkArchiveFabText}>Bulk Archive</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  tabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  uploadContent: {
    flex: 1,
  },
  uploadScrollContent: {
    padding: 16,
  },
  uploadCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#111827',
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 32,
    backgroundColor: '#F9FAFB',
  },
  filePickerText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
  },
  noticeBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  noticeBold: {
    fontWeight: '600',
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  listContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  filterItemText: {
    fontSize: 13,
    color: '#374151',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearFiltersText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  archiveMultipleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#F97316',
    borderRadius: 6,
  },
  archiveMultipleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  cancelSelectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelSelectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  listContainer: {
    padding: 16,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetCardSelected: {
    borderColor: '#F97316',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    backgroundColor: '#F97316',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  budgetHeader: {
    backgroundColor: '#3B82F6',
    padding: 16,
  },
  budgetHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  budgetBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  yearBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  yearBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  budgetIcon: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 22,
  },
  budgetInfo: {
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
  },
  budgetInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budgetInfoText: {
    fontSize: 11,
    color: '#6B7280',
  },
  fileTypeBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  fileTypeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C3AED',
  },
  pageCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
  budgetActions: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  previewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  archiveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  restoreButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  bulkArchiveFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F97316',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bulkArchiveFabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  alertModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  alertHeaderSuccess: {
    backgroundColor: '#D1FAE5',
  },
  alertHeaderError: {
    backgroundColor: '#FEE2E2',
  },
  alertIconContainer: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#4B5563',
  },
  alertButton: {
    padding: 16,
    alignItems: 'center',
  },
  alertButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalScrollContent: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalButtonSecondary: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#3B82F6',
  },
  previewHeaderContent: {
    flex: 1,
    marginRight: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  previewMetaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  previewContent: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  previewScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewImage: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH * 1.4,
  },
  previewError: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  previewErrorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  previewErrorText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  previewErrorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  previewErrorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  zoomButton: {
    padding: 8,
  },
  pageNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  pageButtonTextDisabled: {
    color: '#9CA3AF',
  },
  pageIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
  },
  pageIndicatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
  },
});

export default BudgetProgramsMobile;