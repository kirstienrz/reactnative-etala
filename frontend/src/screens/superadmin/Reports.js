import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import { 
  getAllReports, 
  getArchivedReports, 
  getReportById, 
  updateReportStatus, 
  archiveReport, 
  restoreReport, 
  addReferral 
} from '../../api/report';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [reports, setReports] = useState([]);
  const [archivedReports, setArchivedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [caseStatusFilter, setCaseStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCaseStatusModal, setShowCaseStatusModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  
  const [newStatus, setNewStatus] = useState('');
  const [newCaseStatus, setNewCaseStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [caseStatusRemarks, setCaseStatusRemarks] = useState('');
  const [referralDept, setReferralDept] = useState('');
  const [referralNote, setReferralNote] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [activeRes, archivedRes] = await Promise.all([
        getAllReports(),
        getArchivedReports()
      ]);
      
      if (activeRes.success) setReports(activeRes.data || []);
      else showToast(activeRes.message || 'Failed to fetch active reports', 'error');
      
      if (archivedRes.success) setArchivedReports(archivedRes.data || []);
    } catch (error) {
      showToast(error.response?.data?.message || error.message || 'Failed to fetch reports', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showToast = (message, type = 'success') => {
    Alert.alert(type === 'error' ? 'Error' : 'Success', message, [{ text: 'OK' }]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleViewDetails = async (reportId) => {
    try {
      const res = await getReportById(reportId);
      if (res.success) {
        setSelectedReport(res.data);
        setShowDetailsModal(true);
      } else {
        showToast(res.message || 'Failed to load report details', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to load report details', 'error');
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    try {
      const res = await updateReportStatus(selectedReport._id, newStatus, statusRemarks);
      if (res.success) {
        showToast('Status updated successfully');
        setShowStatusModal(false);
        setNewStatus('');
        setStatusRemarks('');
        fetchReports();
      } else {
        showToast(res.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update status', 'error');
    }
  };

  const handleUpdateCaseStatus = async () => {
    if (!newCaseStatus) return;
    try {
      const res = await updateReportStatus(
        selectedReport._id, 
        selectedReport.status, 
        caseStatusRemarks, 
        newCaseStatus
      );
      if (res.success) {
        showToast('Case status updated successfully');
        setShowCaseStatusModal(false);
        setNewCaseStatus('');
        setCaseStatusRemarks('');
        fetchReports();
      } else {
        showToast(res.message || 'Failed to update case status', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update case status', 'error');
    }
  };

  const handleArchive = async () => {
    try {
      const res = await archiveReport(selectedReport._id);
      if (res.success) {
        showToast('Report archived successfully');
        setShowArchiveModal(false);
        setShowDetailsModal(false);
        fetchReports();
      } else {
        showToast(res.message || 'Failed to archive report', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to archive report', 'error');
    }
  };

  const handleRestore = async () => {
    try {
      const res = await restoreReport(selectedReport._id);
      if (res.success) {
        showToast('Report restored successfully');
        setShowRestoreModal(false);
        setShowDetailsModal(false);
        fetchReports();
      } else {
        showToast(res.message || 'Failed to restore report', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to restore report', 'error');
    }
  };

  const handleAddReferral = async () => {
    if (!referralDept) return;
    try {
      const res = await addReferral(selectedReport._id, {
        department: referralDept,
        note: referralNote
      });
      if (res.success) {
        showToast('Referral added successfully');
        setShowReferralModal(false);
        setReferralDept('');
        setReferralNote('');
        fetchReports();
      } else {
        showToast(res.message || 'Failed to add referral', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to add referral', 'error');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCaseStatusFilter('All');
    setCategoryFilter('All');
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: '#FFF2CC',
      Reviewed: '#D9EAFD',
      'In Progress': '#E2D9F3',
      Resolved: '#D5E8D4',
      Closed: '#E2E2E2',
    };
    return colors[status] || '#F5F5F5';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      Pending: '#B35C00',
      Reviewed: '#0052CC',
      'In Progress': '#5243AA',
      Resolved: '#0B6E4F',
      Closed: '#505050',
    };
    return colors[status] || '#505050';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: 'time-outline',
      Reviewed: 'eye-outline',
      'In Progress': 'sync-outline',
      Resolved: 'checkmark-circle-outline',
      Closed: 'close-circle-outline',
    };
    return icons[status] || 'alert-circle-outline';
  };

  const getCaseStatusColor = (caseStatus) => {
    const colors = {
      'For Queuing': '#FFE6CC',
      'For Interview': '#CCE8FF',
      'For Appointment': '#E6CCFF',
      'For Referral': '#FFCCE6',
    };
    return colors[caseStatus] || '#F5F5F5';
  };

  const getCaseStatusTextColor = (caseStatus) => {
    const colors = {
      'For Queuing': '#CC5500',
      'For Interview': '#0066CC',
      'For Appointment': '#6600CC',
      'For Referral': '#CC0066',
    };
    return colors[caseStatus] || '#505050';
  };

  const getCaseStatusIcon = (caseStatus) => {
    const icons = {
      'For Queuing': 'list-outline',
      'For Interview': 'people-outline',
      'For Appointment': 'calendar-outline',
      'For Referral': 'share-outline',
    };
    return icons[caseStatus] || 'alert-circle-outline';
  };

  const allCategories = [...new Set(
    [...reports, ...archivedReports]
      .flatMap(r => r.incidentTypes || [])
      .filter(Boolean)
  )];

  const filteredReports = (activeTab === 'active' ? reports : archivedReports).filter(r => {
    const matchesSearch = !searchTerm || 
      r.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.incidentDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.createdBy?.tupId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesCaseStatus = caseStatusFilter === 'All' || r.caseStatus === caseStatusFilter;
    const matchesCategory = categoryFilter === 'All' || r.incidentTypes?.includes(categoryFilter);
    
    return matchesSearch && matchesStatus && matchesCaseStatus && matchesCategory;
  });

  const activeFilterCount = [
    statusFilter !== 'All',
    caseStatusFilter !== 'All',
    categoryFilter !== 'All',
  ].filter(Boolean).length;

  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => handleViewDetails(item._id)}
    >
      <View style={styles.reportHeader}>
        <View>
          <Text style={styles.ticketNumber}>{item.ticketNumber || 'N/A'}</Text>
          <Text style={styles.dateText}>
            {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons
            name={getStatusIcon(item.status)}
            size={14}
            color={getStatusTextColor(item.status)}
          />
          <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
{/*       
      <Text style={styles.description} numberOfLines={2}>
        {item.incidentDescription || 'No description'}
      </Text> */}
      
      <View style={styles.reportFooter}>
        <Text style={styles.reporterText}>
          {item.isAnonymous ? '👤 Anonymous' : `👤 ${item.createdBy?.tupId || 'Unknown'}`}
        </Text>
        {item.caseStatus && (
          <View style={[styles.caseStatusBadge, { backgroundColor: getCaseStatusColor(item.caseStatus) }]}>
            <Ionicons
              name={getCaseStatusIcon(item.caseStatus)}
              size={12}
              color={getCaseStatusTextColor(item.caseStatus)}
            />
            <Text style={[styles.caseStatusText, { color: getCaseStatusTextColor(item.caseStatus) }]}>
              {item.caseStatus}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const InfoItem = ({ label, value }) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value || 'N/A'}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D5BFF" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          {/* <Text style={styles.title}>Report Management</Text> */}
          <Text style={styles.subtitle}>Monitor incident reports</Text>
        </View>
        <TouchableOpacity onPress={fetchReports}>
          <Ionicons name="refresh" size={22} color="#2D5BFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#7C8DB5" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            placeholderTextColor="#8A94A6"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={18} color="#7C8DB5" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, (showFilters || activeFilterCount > 0) && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Feather name="filter" size={18} color={(showFilters || activeFilterCount > 0) ? '#fff' : '#2D5BFF'} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.filtersModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={22} color="#2D5BFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.filterLabel}>Report Status</Text>
              <View style={styles.filterChips}>
                {['All', 'Pending', 'Reviewed', 'In Progress', 'Resolved', 'Closed'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Case Status</Text>
              <View style={styles.filterChips}>
                {['All', 'For Queuing', 'For Interview', 'For Appointment', 'For Referral'].map(caseStatus => (
                  <TouchableOpacity
                    key={caseStatus}
                    style={[styles.filterChip, caseStatusFilter === caseStatus && styles.filterChipActive]}
                    onPress={() => setCaseStatusFilter(caseStatus)}
                  >
                    <Text style={[styles.filterChipText, caseStatusFilter === caseStatus && styles.filterChipTextActive]}>
                      {caseStatus}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {allCategories.length > 0 && (
                <>
                  <Text style={styles.filterLabel}>Categories</Text>
                  <View style={styles.filterChips}>
                    <TouchableOpacity
                      style={[styles.filterChip, categoryFilter === 'All' && styles.filterChipActive]}
                      onPress={() => setCategoryFilter('All')}
                    >
                      <Text style={[styles.filterChipText, categoryFilter === 'All' && styles.filterChipTextActive]}>
                        All
                      </Text>
                    </TouchableOpacity>
                    {allCategories.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
                        onPress={() => setCategoryFilter(cat)}
                      >
                        <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({reports.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'archived' && styles.tabActive]}
          onPress={() => setActiveTab('archived')}
        >
          <Text style={[styles.tabText, activeTab === 'archived' && styles.tabTextActive]}>
            Archived ({archivedReports.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReportItem}
        keyExtractor={(item, index) => item._id || index.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#2D5BFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={48} color="#D1D9E6" />
            <Text style={styles.emptyTitle}>No reports found</Text>
            <Text style={styles.emptyText}>Adjust your search or filters</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Report Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={styles.detailsModalContainer}>
          <View style={styles.detailsModalHeader}>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Ionicons name="arrow-back" size={24} color="#2D5BFF" />
            </TouchableOpacity>
            <Text style={styles.detailsModalTitle}>Report Details</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.detailsContent}>
            {selectedReport && (
              <>
                {/* Header */}
                <View style={styles.headerCard}>
                  <Text style={styles.headerTicket}>{selectedReport.ticketNumber}</Text>
                  <View style={[styles.headerStatus, { backgroundColor: getStatusColor(selectedReport.status) }]}>
                    <Ionicons
                      name={getStatusIcon(selectedReport.status)}
                      size={16}
                      color={getStatusTextColor(selectedReport.status)}
                    />
                    <Text style={[styles.headerStatusText, { color: getStatusTextColor(selectedReport.status) }]}>
                      {selectedReport.status}
                    </Text>
                  </View>
                </View>

                {/* Status */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>Status</Text>
                  <View style={styles.statusGrid}>
                    <View>
                      <Text style={styles.statusLabel}>Report Status</Text>
                      <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusColor(selectedReport.status) }]}>
                        <Text style={[styles.statusBadgeText, { color: getStatusTextColor(selectedReport.status) }]}>
                          {selectedReport.status}
                        </Text>
                      </View>
                    </View>
                    {selectedReport.caseStatus && (
                      <View>
                        <Text style={styles.statusLabel}>Case Status</Text>
                        <View style={[styles.statusBadgeSmall, { backgroundColor: getCaseStatusColor(selectedReport.caseStatus) }]}>
                          <Text style={[styles.statusBadgeText, { color: getCaseStatusTextColor(selectedReport.caseStatus) }]}>
                            {selectedReport.caseStatus}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Basic Info */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>Basic Information</Text>
                  <InfoItem label="Submitted" value={new Date(selectedReport.submittedAt).toLocaleString()} />
                  {selectedReport.lastUpdated && <InfoItem label="Last Updated" value={new Date(selectedReport.lastUpdated).toLocaleString()} />}
                </View>

                {/* Reporter Info */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>Reporter Information</Text>
                  {selectedReport.isAnonymous ? (
                    <View style={styles.anonymousCard}>
                      <Text style={styles.anonymousTitle}>Anonymous Report</Text>
                      <InfoItem label="Role" value={selectedReport.reporterRole} />
                      <InfoItem label="Gender" value={selectedReport.anonymousGender} />
                    </View>
                  ) : (
                    <InfoItem label="TUP ID" value={selectedReport.createdBy?.tupId || 'Unknown'} />
                  )}
                </View>

                {/* Incident Info */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>Incident Information</Text>
                  {selectedReport.incidentTypes?.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {selectedReport.incidentTypes.map((type, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{type}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <Text style={styles.descriptionText}>
                    {selectedReport.incidentDescription || 'No description provided'}
                  </Text>
                </View>

                {/* Attachments */}
                {selectedReport.attachments?.length > 0 && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoCardTitle}>Attachments</Text>
                    {selectedReport.attachments.map((att, index) => (
                      <TouchableOpacity key={index} style={styles.attachmentItem}>
                        <Feather name="file" size={18} color="#5A67D8" />
                        <Text style={styles.attachmentText} numberOfLines={1}>
                          {att.fileName}
                        </Text>
                        <MaterialIcons name="download" size={18} color="#5A67D8" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Action Buttons - All 4 buttons included */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.statusAction]}
              onPress={() => {
                setNewStatus(selectedReport?.status || '');
                setShowStatusModal(true);
              }}
            >
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Update Report Status</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.caseStatusAction]}
              onPress={() => {
                setNewCaseStatus(selectedReport?.caseStatus || '');
                setShowCaseStatusModal(true);
              }}
            >
              <Ionicons name="list-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Update Case Status</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.referralAction]}
              onPress={() => setShowReferralModal(true)}
            >
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Add Referral</Text>
            </TouchableOpacity>
            
            {activeTab === 'active' ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.archiveAction]}
                onPress={() => setShowArchiveModal(true)}
              >
                <Ionicons name="archive-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Archive Report</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.restoreAction]}
                onPress={() => setShowRestoreModal(true)}
              >
                <Ionicons name="refresh-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Restore Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.actionModal}>
            <View style={styles.actionModalHeader}>
              <Text style={styles.actionModalTitle}>Update Report Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionInput}>
              <Text style={styles.actionLabel}>Select Status</Text>
              <View style={styles.statusOptions}>
                {['Pending', 'Reviewed', 'In Progress', 'Resolved', 'Closed'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusOption, newStatus === status && styles.statusOptionActive]}
                    onPress={() => setNewStatus(status)}
                  >
                    <Text style={[styles.statusOptionText, newStatus === status && styles.statusOptionTextActive]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.actionInput}>
              <Text style={styles.actionLabel}>Remarks (Optional)</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                placeholder="Add remarks..."
                placeholderTextColor="#8A94A6"
                value={statusRemarks}
                onChangeText={setStatusRemarks}
              />
            </View>

            <View style={styles.actionModalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, !newStatus && styles.disabledButton]}
                disabled={!newStatus}
                onPress={handleUpdateStatus}
              >
                <Text style={styles.confirmButtonText}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Case Status Modal */}
      <Modal
        visible={showCaseStatusModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.actionModal}>
            <View style={styles.actionModalHeader}>
              <Text style={styles.actionModalTitle}>Update Case Status</Text>
              <TouchableOpacity onPress={() => setShowCaseStatusModal(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionInput}>
              <Text style={styles.actionLabel}>Select Case Status</Text>
              <View style={styles.statusOptions}>
                {['For Queuing', 'For Interview', 'For Appointment', 'For Referral'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusOption, newCaseStatus === status && styles.caseStatusOptionActive]}
                    onPress={() => setNewCaseStatus(status)}
                  >
                    <Text style={[styles.statusOptionText, newCaseStatus === status && styles.statusOptionTextActive]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.actionInput}>
              <Text style={styles.actionLabel}>Remarks (Optional)</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                placeholder="Add remarks..."
                placeholderTextColor="#8A94A6"
                value={caseStatusRemarks}
                onChangeText={setCaseStatusRemarks}
              />
            </View>

            <View style={styles.actionModalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCaseStatusModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.caseConfirmButton, !newCaseStatus && styles.disabledButton]}
                disabled={!newCaseStatus}
                onPress={handleUpdateCaseStatus}
              >
                <Text style={styles.confirmButtonText}>Update Case Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Referral Modal */}
      <Modal
        visible={showReferralModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.actionModal}>
            <View style={styles.actionModalHeader}>
              <Text style={styles.actionModalTitle}>Add Referral</Text>
              <TouchableOpacity onPress={() => setShowReferralModal(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionInput}>
              <Text style={styles.actionLabel}>Department</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., OSA, HR, Legal..."
                placeholderTextColor="#8A94A6"
                value={referralDept}
                onChangeText={setReferralDept}
              />
            </View>

            <View style={styles.actionInput}>
              <Text style={styles.actionLabel}>Referral Note</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                placeholder="Enter referral details..."
                placeholderTextColor="#8A94A6"
                value={referralNote}
                onChangeText={setReferralNote}
              />
            </View>

            <View style={styles.actionModalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowReferralModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.referralConfirmButton, !referralDept && styles.disabledButton]}
                disabled={!referralDept}
                onPress={handleAddReferral}
              >
                <Text style={styles.confirmButtonText}>Add Referral</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Archive Modal */}
      <Modal
        visible={showArchiveModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationIcon}>
              <Ionicons name="archive" size={40} color="#DC6803" />
            </View>
            <Text style={styles.confirmationTitle}>Archive Report</Text>
            <Text style={styles.confirmationText}>
              Archive this report? It will be moved to archived section.
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.confirmationCancelButton]}
                onPress={() => setShowArchiveModal(false)}
              >
                <Text style={styles.confirmationCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.archiveConfirmButton]}
                onPress={handleArchive}
              >
                <Text style={styles.confirmationConfirmText}>Archive Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Restore Modal */}
      <Modal
        visible={showRestoreModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationIcon}>
              <Ionicons name="refresh" size={40} color="#0B6E4F" />
            </View>
            <Text style={styles.confirmationTitle}>Restore Report</Text>
            <Text style={styles.confirmationText}>
              Restore this report? It will be moved back to active reports.
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.confirmationCancelButton]}
                onPress={() => setShowRestoreModal(false)}
              >
                <Text style={styles.confirmationCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.restoreConfirmButton]}
                onPress={handleRestore}
              >
                <Text style={styles.confirmationConfirmText}>Restore Report</Text>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#212529',
    padding: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F0F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  filterButtonActive: {
    backgroundColor: '#2D5BFF',
    borderColor: '#2D5BFF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC3545',
    borderRadius: 8,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 4,
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
  listContent: {
    padding: 16,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  dateText: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reporterText: {
    fontSize: 13,
    color: '#6C757D',
  },
  caseStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  caseStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 4,
  },
  // Filters Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(33, 37, 41, 0.5)',
    justifyContent: 'flex-end',
  },
  filtersModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '70%',
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
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 8,
    marginTop: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  filterChipActive: {
    backgroundColor: '#2D5BFF',
    borderColor: '#2D5BFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 8,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C757D',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#2D5BFF',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Details Modal
  detailsModalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  detailsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  detailsModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  detailsContent: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTicket: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  headerStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statusLabel: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 6,
  },
  statusBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  anonymousCard: {
    backgroundColor: '#FFF8E6',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE7B3',
  },
  anonymousTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B35C00',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#3949AB',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  attachmentText: {
    flex: 1,
    fontSize: 14,
    color: '#343A40',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  statusAction: {
    backgroundColor: '#2D5BFF',
  },
  caseStatusAction: {
    backgroundColor: '#5A67D8',
  },
  referralAction: {
    backgroundColor: '#805AD5',
  },
  archiveAction: {
    backgroundColor: '#DC6803',
  },
  restoreAction: {
    backgroundColor: '#0B6E4F',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  // Action Modal
  actionModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  actionInput: {
    padding: 16,
    paddingTop: 0,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    backgroundColor: '#F8F9FA',
  },
  statusOptionActive: {
    backgroundColor: '#2D5BFF',
    borderColor: '#2D5BFF',
  },
  caseStatusOptionActive: {
    backgroundColor: '#5A67D8',
    borderColor: '#5A67D8',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    color: '#212529',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  actionModalFooter: {
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
  confirmButton: {
    backgroundColor: '#2D5BFF',
  },
  caseConfirmButton: {
    backgroundColor: '#5A67D8',
  },
  referralConfirmButton: {
    backgroundColor: '#805AD5',
  },
  archiveConfirmButton: {
    backgroundColor: '#DC6803',
  },
  restoreConfirmButton: {
    backgroundColor: '#0B6E4F',
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
  // Confirmation Modal
  confirmationModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  confirmationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF8E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 15,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmationCancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  confirmationConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmationCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C757D',
  },
});

export default AdminReports;