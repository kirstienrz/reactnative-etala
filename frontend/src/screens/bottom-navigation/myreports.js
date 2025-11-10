import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUserReports } from '../../api/report';

const MyReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilterType, setDateFilterType] = useState('All');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const statuses = ['All', 'Pending', 'Under Review', 'In Progress', 'Resolved', 'Closed'];
  const categories = [
    'All',
    'RA 9262 - Sexual Abuse',
    'RA 9262 - Psychological',
    'RA 9262 - Physical',
    'RA 9262 - Economic',
    'RA 8353 - Rape',
    'RA 7877 - Sexual Harassment',
    'RA 7610 - Child Abuse',
    'Other'
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchQuery, selectedStatus, selectedCategory, dateFilterType, startDate, endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getUserReports();
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        setReports(response.data);
      } else if (response.reports) {
        setReports(response.reports);
      } else if (Array.isArray(response)) {
        setReports(response);
      } else {
        console.error('Unexpected response format:', response);
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load reports. Please try again.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, []);

  // ✅ Fixed: Better date parsing function that handles MM/DD/YYYY format
  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    // Check if it's in MM/DD/YYYY format
    const mmddyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(mmddyyyyPattern);
    
    if (match) {
      // Parse MM/DD/YYYY format manually
      const month = parseInt(match[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      
      const date = new Date(year, month, day);
      
      // Validate the date is correct (handles invalid dates like 13/32/2025)
      if (date.getMonth() === month && date.getDate() === day && date.getFullYear() === year) {
        return date;
      }
    }
    
    // Try parsing as ISO date or other standard formats
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return null;
    }
    
    return date;
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(report => 
        report.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.incidentDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(report => 
        report.incidentTypes?.some(type => type.includes(selectedCategory.split(' - ')[0]))
      );
    }

    // ✅ Fixed: Filter by date range using submittedAt instead of createdAt
    if (dateFilterType !== 'All') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(report => {
        // Use submittedAt for date filtering
        const reportDate = parseDate(report.submittedAt || report.createdAt);
        
        if (!reportDate) {
          console.warn('Report has no valid date:', report.ticketNumber);
          return false;
        }
        
        const reportDateOnly = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());

        switch (dateFilterType) {
          case 'Today':
            return reportDateOnly.getTime() === today.getTime();
          
          case 'This Week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return reportDateOnly >= weekAgo && reportDateOnly <= today;
          
          case 'This Month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return reportDateOnly >= monthStart && reportDateOnly <= today;
          
          case 'Custom':
            const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            return reportDateOnly >= start && reportDateOnly <= end;
          
          default:
            return true;
        }
      });
    }

    setFilteredReports(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#F59E0B',
      'Under Review': '#3B82F6',
      'In Progress': '#8B5CF6',
      'Resolved': '#10B981',
      'Closed': '#6B7280',
    };
    return colors[status] || '#6B7280';
  };

  // ✅ Fixed: Enhanced formatDate with better error handling
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = parseDate(dateString);
    
    if (!date) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatDateForSubmitted = (report) => {
    const dateString = report.submittedAt || report.createdAt || report.dateSubmitted;
    return formatDate(dateString);
  };

  const formatDateShort = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const getCategoryLabel = (incidentTypes) => {
    if (!incidentTypes || incidentTypes.length === 0) return 'Uncategorized';
    const firstType = incidentTypes[0];
    return firstType.length > 30 
      ? firstType.substring(0, 30) + '...' 
      : firstType;
  };

  const getReportStatus = (report) => {
    return report.status || 'Pending';
  };

  const renderReportCard = (report) => (
    <TouchableOpacity
      key={report._id}
      style={styles.reportCard}
      onPress={() => navigation.navigate('ReportDetails', { reportId: report._id })}
      activeOpacity={0.7}>
      <View style={styles.reportHeader}>
        <View style={styles.ticketInfo}>
          <MaterialIcons name="confirmation-number" size={16} color="#6B7280" />
          <Text style={styles.ticketNumber}>{report.ticketNumber || 'N/A'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(getReportStatus(report)) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(getReportStatus(report)) }]}>
            {getReportStatus(report)}
          </Text>
        </View>
      </View>

      <View style={styles.reportTypeRow}>
        <MaterialIcons 
          name={report.isAnonymous ? 'person-off' : 'person'} 
          size={14} 
          color="#6B7280" 
        />
        <Text style={styles.reportTypeText}>
          {report.isAnonymous ? 'Anonymous Report' : 'Identified Report'}
        </Text>
      </View>

      <Text style={styles.categoryText}>{getCategoryLabel(report.incidentTypes)}</Text>

      {report.incidentDescription && (
        <Text style={styles.descriptionPreview} numberOfLines={2}>
          {report.incidentDescription}
        </Text>
      )}

      {/* ✅ Fixed: Only show incident date if it's valid */}
      {report.latestIncidentDate && parseDate(report.latestIncidentDate) && (
        <View style={styles.incidentDateRow}>
          <MaterialIcons name="event" size={14} color="#9CA3AF" />
          <Text style={styles.incidentDateText}>
            Incident: {formatDate(report.latestIncidentDate)}
          </Text>
        </View>
      )}

      <View style={styles.reportFooter}>
        <View style={styles.dateContainer}>
          <MaterialIcons name="calendar-today" size={14} color="#9CA3AF" />
          <Text style={styles.dateText}>Submitted: {formatDateForSubmitted(report)}</Text>
        </View>

        {report.attachments && report.attachments.length > 0 && (
          <View style={styles.attachmentIndicator}>
            <MaterialIcons name="attach-file" size={12} color="#6B7280" />
            <Text style={styles.attachmentText}>{report.attachments.length}</Text>
          </View>
        )}

        <View style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View</Text>
          <Ionicons name="chevron-forward" size={16} color="#4338CA" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name="description" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No Reports Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedStatus !== 'All' || selectedCategory !== 'All' || dateFilterType !== 'All'
          ? 'Try adjusting your filters'
          : 'Your submitted reports will appear here'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4338CA" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Reports</Text>
          <Text style={styles.headerSubtitle}>{reports.length} total reports</Text>
        </View>
        <TouchableOpacity 
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}>
          <MaterialIcons 
            name={showFilters ? "filter-list-off" : "filter-list"} 
            size={24} 
            color="#4338CA" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ticket number or description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterChips}>
              {statuses.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    selectedStatus === status && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedStatus(status)}>
                  <Text style={[
                    styles.filterChipText,
                    selectedStatus === status && styles.filterChipTextActive
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterChips}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedCategory(category)}>
                  <Text style={[
                    styles.filterChipText,
                    selectedCategory === category && styles.filterChipTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={dateFilterType}
                onValueChange={(itemValue) => setDateFilterType(itemValue)}
                style={styles.picker}>
                <Picker.Item label="All Time" value="All" />
                <Picker.Item label="Today" value="Today" />
                <Picker.Item label="This Week" value="This Week" />
                <Picker.Item label="This Month" value="This Month" />
                <Picker.Item label="Custom Range" value="Custom" />
              </Picker>
            </View>
          </View>

          {dateFilterType === 'Custom' && (
            <View style={styles.customDateSection}>
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowStartDatePicker(true)}>
                    <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
                    <Text style={styles.dateButtonText}>{formatDateShort(startDate)}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}>
                    <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
                    <Text style={styles.dateButtonText}>{formatDateShort(endDate)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {(selectedStatus !== 'All' || selectedCategory !== 'All' || dateFilterType !== 'All') && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedStatus('All');
                setSelectedCategory('All');
                setDateFilterType('All');
              }}>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {filteredReports.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.reportsList}>
            {filteredReports.map(report => renderReportCard(report))}
          </View>
        )}
      </ScrollView>

      {showStartDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          maximumDate={new Date()}
        />
      )}

      {showEndDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          maximumDate={new Date()}
          minimumDate={startDate}
        />
      )}

      {Platform.OS === 'ios' && showStartDatePicker && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                  <Text style={styles.datePickerButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={startDate}
                mode="date"
                display="spinner"
                onChange={handleStartDateChange}
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'ios' && showEndDatePicker && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                  <Text style={styles.datePickerButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={endDate}
                mode="date"
                display="spinner"
                onChange={handleEndDateChange}
                maximumDate={new Date()}
                minimumDate={startDate}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  header: {
    backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 3,
  },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  filterToggle: { padding: 8 },
  searchContainer: {
    backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1F2937' },
  filtersContainer: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  filterSection: { marginBottom: 12 },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 10 },
  filterChips: { flexDirection: 'row' },
  filterChip: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#EEF2FF', borderColor: '#4338CA' },
  filterChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterChipTextActive: { color: '#4338CA', fontWeight: '600' },
  clearFiltersButton: { alignSelf: 'flex-start', paddingVertical: 6 },
  clearFiltersText: { fontSize: 13, color: '#DC2626', fontWeight: '600' },
  content: { flex: 1 },
  reportsList: { padding: 16 },
  reportCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  ticketInfo: { flexDirection: 'row', alignItems: 'center' },
  ticketNumber: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginLeft: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  reportTypeRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, alignSelf: 'flex-start',
  },
  reportTypeText: { fontSize: 12, color: '#6B7280', marginLeft: 6, fontWeight: '500' },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#4338CA', marginBottom: 8 },
  descriptionPreview: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 8 },
  incidentDateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  incidentDateText: { fontSize: 12, color: '#9CA3AF', marginLeft: 6 },
  reportFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 11, color: '#9CA3AF', marginLeft: 6 },
  attachmentIndicator: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6',
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8,
  },
  attachmentText: { fontSize: 11, color: '#6B7280', marginLeft: 3, fontWeight: '600' },
  viewButton: { flexDirection: 'row', alignItems: 'center' },
  viewButtonText: { fontSize: 13, fontWeight: '600', color: '#4338CA', marginRight: 4 },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  pickerContainer: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, overflow: 'hidden',
  },
  picker: { height: 50 },
  customDateSection: { marginTop: 10 },
  dateInputRow: { flexDirection: 'row', gap: 10 },
  dateInputContainer: { flex: 1 },
  dateLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  dateButton: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  dateButtonText: { fontSize: 14, color: '#1F2937', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  datePickerModal: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, paddingBottom: 34,
  },
  datePickerHeader: {
    flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  datePickerButton: { fontSize: 16, fontWeight: '600', color: '#4338CA' },
});

export default MyReportsScreen;