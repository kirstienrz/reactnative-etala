import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, TextInput, Modal, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

const ReportHistoryScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Enhanced mock data with complete intake form information
  const mockReports = [
    {
      id: 1,
      ticketNumber: 'ETALA-ID-202411-0001',
      type: 'Identified',
      status: 'Under Review',
      incidentType: 'RA 7877 - Sexual Harassment',
      dateSubmitted: '2024-11-01',
      dateUpdated: '2024-11-02',
      description: 'Verbal harassment incident reported at campus premises',
      priority: 'High',
      // Complete intake form data
      intakeData: {
        handlingOrganization: 'ETALA Support Center',
        caseManager: 'Maria Santos',
        blotterNo: 'BLT-2024-001',
        victim: {
          lastName: 'Dela Cruz',
          firstName: 'Ana Marie',
          middleName: 'Garcia',
          sex: 'Female',
          dateOfBirth: '1998-05-15',
          age: 26,
          civilStatus: 'Single',
          education: 'College Graduate',
          nationality: 'Filipino',
          occupation: 'Student',
          religion: 'Roman Catholic',
          address: {
            region: 'NCR',
            province: 'Metro Manila',
            city: 'Quezon City',
            barangay: 'Commonwealth'
          },
          disability: 'Without Disability',
          contactNo: '09171234567'
        },
        perpetrator: {
          lastName: 'Rodriguez',
          firstName: 'Juan',
          middleName: 'Santos',
          sex: 'Male',
          age: 45,
          civilStatus: 'Married',
          education: 'College Graduate',
          nationality: 'Filipino',
          occupation: 'Professor',
          religion: 'Roman Catholic',
          address: {
            region: 'NCR',
            province: 'Metro Manila',
            city: 'Quezon City',
            barangay: 'Diliman'
          },
          relationship: 'Teacher/Instructor/Professor'
        },
        incident: {
          description: 'Victim-survivor reported experiencing verbal sexual harassment from the perpetrator during office consultation hours. The perpetrator made inappropriate comments regarding the victim\'s appearance and made unwanted advances.',
          latestIncidentDate: '2024-10-28',
          location: {
            region: 'NCR',
            province: 'Metro Manila',
            city: 'Quezon City',
            barangay: 'Diliman'
          },
          place: 'School',
          harassmentType: 'Verbal'
        },
        services: {
          crisisIntervention: true,
          referredToSWDO: true,
          referredToHealthcare: true,
          referredToLawEnforcement: true,
          healthcareProvider: 'University Health Services',
          lawEnforcementAgency: 'PNP Women and Children Protection Desk'
        }
      }
    },
    {
      id: 2,
      ticketNumber: 'ETALA-ANON-202410-0234',
      type: 'Anonymous',
      status: 'In Progress',
      incidentType: 'RA 9262 - Psychological Violence',
      dateSubmitted: '2024-10-28',
      dateUpdated: '2024-10-30',
      description: 'Anonymous report of psychological abuse from intimate partner',
      priority: 'Medium',
      intakeData: {
        handlingOrganization: 'ETALA Support Center',
        caseManager: 'Roberto Alvarez',
        blotterNo: 'BLT-2024-002',
        victim: {
          lastName: 'Anonymous',
          firstName: 'Anonymous',
          middleName: 'Anonymous',
          sex: 'Female',
          age: 32,
          civilStatus: 'Married',
          education: 'High School Graduate',
          nationality: 'Filipino',
          occupation: 'Homemaker',
          religion: 'Roman Catholic',
          address: {
            region: 'NCR',
            province: 'Metro Manila',
            city: 'Quezon City',
            barangay: 'Withheld'
          },
          disability: 'Without Disability',
          contactNo: 'Withheld'
        },
        perpetrator: {
          lastName: 'Withheld',
          firstName: 'Withheld',
          middleName: 'Withheld',
          sex: 'Male',
          age: 35,
          civilStatus: 'Married',
          relationship: 'Current spouse/partner'
        },
        incident: {
          description: 'Victim-survivor reported continuous psychological abuse including intimidation, threats, and controlling behavior from current spouse.',
          latestIncidentDate: '2024-10-25',
          location: {
            region: 'NCR',
            province: 'Metro Manila',
            city: 'Quezon City',
            barangay: 'Withheld'
          },
          place: 'House'
        },
        services: {
          crisisIntervention: true,
          referredToSWDO: true,
          referredToHealthcare: false,
          referredToLawEnforcement: true
        }
      }
    }
  ];

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchQuery, selectedFilter, reports]);

  const loadReports = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(mockReports);
      setFilteredReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (selectedFilter !== 'All') {
      filtered = filtered.filter(report => report.status === selectedFilter);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(report =>
        report.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const exportToPDF = async (report) => {
    setExporting(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Export Successful',
        `Report ${report.ticketNumber} has been exported as PDF to your device.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#F59E0B';
      case 'Under Review': return '#3B82F6';
      case 'In Progress': return '#8B5CF6';
      case 'Resolved': return '#10B981';
      case 'Closed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'time-outline';
      case 'Under Review': return 'search-outline';
      case 'In Progress': return 'hourglass-outline';
      case 'Resolved': return 'checkmark-circle-outline';
      case 'Closed': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#DC2626';
      case 'High': return '#F59E0B';
      case 'Medium': return '#3B82F6';
      case 'Low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  const renderFilterChip = (label) => (
    <TouchableOpacity
      key={label}
      style={[styles.filterChip, selectedFilter === label && styles.filterChipSelected]}
      onPress={() => setSelectedFilter(label)}>
      <Text style={[styles.filterChipText, selectedFilter === label && styles.filterChipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderReportCard = (report) => (
    <TouchableOpacity
      key={report.id}
      style={styles.reportCard}
      onPress={() => openReportDetails(report)}
      activeOpacity={0.7}>
      <View style={styles.reportHeader}>
        <View style={styles.reportHeaderLeft}>
          <Text style={styles.ticketNumber}>{report.ticketNumber}</Text>
          <View style={styles.typeBadge}>
            <MaterialIcons 
              name={report.type === 'Anonymous' ? 'visibility-off' : 'person'} 
              size={12} 
              color="#6B7280" 
            />
            <Text style={styles.typeBadgeText}>{report.type}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) + '20' }]}>
          <Text style={[styles.priorityBadgeText, { color: getPriorityColor(report.priority) }]}>
            {report.priority}
          </Text>
        </View>
      </View>

      <View style={styles.reportBody}>
        <View style={styles.reportInfo}>
          <MaterialIcons name="warning" size={16} color="#6B7280" />
          <Text style={styles.incidentType} numberOfLines={1}>{report.incidentType}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{report.description}</Text>
      </View>

      <View style={styles.reportFooter}>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon(report.status)} 
            size={16} 
            color={getStatusColor(report.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
            {report.status}
          </Text>
        </View>
        <View style={styles.dateContainer}>
          <MaterialIcons name="schedule" size={14} color="#9CA3AF" />
          <Text style={styles.dateText}>{report.dateUpdated}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFormSection = (title, children) => (
    <View style={styles.formSection}>
      <View style={styles.formSectionHeader}>
        <Text style={styles.formSectionTitle}>{title}</Text>
      </View>
      <View style={styles.formSectionContent}>
        {children}
      </View>
    </View>
  );

  const renderFormField = (label, value) => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <Text style={styles.formValue}>{value || 'N/A'}</Text>
    </View>
  );

  const renderFormRow = (fields) => (
    <View style={styles.formRow}>
      {fields.map((field, index) => (
        <View key={index} style={styles.formFieldHalf}>
          <Text style={styles.formLabel}>{field.label}</Text>
          <Text style={styles.formValue}>{field.value || 'N/A'}</Text>
        </View>
      ))}
    </View>
  );

  const renderReportDetailsModal = () => {
    if (!selectedReport) return null;

    const { intakeData } = selectedReport;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>INTAKE FORM</Text>
                <Text style={styles.modalSubtitle}>Violence Against Women Documentation</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Case Information */}
              {renderFormSection('CASE INFORMATION', (
                <>
                  {renderFormRow([
                    { label: 'Case/Ticket Number', value: selectedReport.ticketNumber },
                    { label: 'Date of Intake', value: selectedReport.dateSubmitted }
                  ])}
                  {renderFormRow([
                    { label: 'Handling Organization', value: intakeData.handlingOrganization },
                    { label: 'Case Manager', value: intakeData.caseManager }
                  ])}
                  {renderFormRow([
                    { label: 'Blotter Number', value: intakeData.blotterNo },
                    { label: 'Status', value: selectedReport.status }
                  ])}
                </>
              ))}

              {/* Victim-Survivor Information */}
              {renderFormSection('VICTIM-SURVIVOR INFORMATION', (
                <>
                  {renderFormField('Full Name', 
                    `${intakeData.victim.lastName}, ${intakeData.victim.firstName} ${intakeData.victim.middleName}`
                  )}
                  {renderFormRow([
                    { label: 'Sex', value: intakeData.victim.sex },
                    { label: 'Date of Birth', value: intakeData.victim.dateOfBirth },
                    { label: 'Age', value: intakeData.victim.age }
                  ])}
                  {renderFormRow([
                    { label: 'Civil Status', value: intakeData.victim.civilStatus },
                    { label: 'Educational Attainment', value: intakeData.victim.education }
                  ])}
                  {renderFormRow([
                    { label: 'Nationality', value: intakeData.victim.nationality },
                    { label: 'Occupation', value: intakeData.victim.occupation }
                  ])}
                  {renderFormRow([
                    { label: 'Religion', value: intakeData.victim.religion },
                    { label: 'Disability Status', value: intakeData.victim.disability }
                  ])}
                  {renderFormField('Address', 
                    `${intakeData.victim.address.barangay}, ${intakeData.victim.address.city}, ${intakeData.victim.address.province}, ${intakeData.victim.address.region}`
                  )}
                  {intakeData.victim.contactNo !== 'Withheld' && 
                    renderFormField('Contact Number', intakeData.victim.contactNo)
                  }
                </>
              ))}

              {/* Perpetrator Information */}
              {renderFormSection('PERPETRATOR INFORMATION', (
                <>
                  {renderFormField('Full Name', 
                    intakeData.perpetrator.lastName === 'Withheld' 
                      ? 'Information Withheld (Anonymous Report)'
                      : `${intakeData.perpetrator.lastName}, ${intakeData.perpetrator.firstName} ${intakeData.perpetrator.middleName}`
                  )}
                  {intakeData.perpetrator.lastName !== 'Withheld' && (
                    <>
                      {renderFormRow([
                        { label: 'Sex', value: intakeData.perpetrator.sex },
                        { label: 'Age', value: intakeData.perpetrator.age }
                      ])}
                      {renderFormRow([
                        { label: 'Civil Status', value: intakeData.perpetrator.civilStatus },
                        { label: 'Educational Attainment', value: intakeData.perpetrator.education }
                      ])}
                      {intakeData.perpetrator.nationality && renderFormRow([
                        { label: 'Nationality', value: intakeData.perpetrator.nationality },
                        { label: 'Occupation', value: intakeData.perpetrator.occupation }
                      ])}
                      {intakeData.perpetrator.religion && renderFormField('Religion', intakeData.perpetrator.religion)}
                      {intakeData.perpetrator.address && renderFormField('Address', 
                        `${intakeData.perpetrator.address.barangay}, ${intakeData.perpetrator.address.city}, ${intakeData.perpetrator.address.province}, ${intakeData.perpetrator.address.region}`
                      )}
                    </>
                  )}
                  {renderFormField('Relationship to Victim-Survivor', intakeData.perpetrator.relationship)}
                </>
              ))}

              {/* Incident Information */}
              {renderFormSection('INCIDENT INFORMATION', (
                <>
                  {renderFormField('Type of Violence', selectedReport.incidentType)}
                  {selectedReport.incidentType.includes('7877') && 
                    renderFormField('Harassment Type', intakeData.incident.harassmentType)
                  }
                  {renderFormField('Date of Latest Incident', intakeData.incident.latestIncidentDate)}
                  {renderFormField('Place of Incident', intakeData.incident.place)}
                  {renderFormField('Geographic Location', 
                    `${intakeData.incident.location.barangay}, ${intakeData.incident.location.city}, ${intakeData.incident.location.province}, ${intakeData.incident.location.region}`
                  )}
                  {renderFormField('Description of Incident', intakeData.incident.description)}
                </>
              ))}

              {/* Services Provided */}
              {renderFormSection('SERVICES PROVIDED', (
                <>
                  {renderFormRow([
                    { label: 'Crisis Intervention', value: intakeData.services.crisisIntervention ? 'Yes' : 'No' },
                    { label: 'Referred to SWDO', value: intakeData.services.referredToSWDO ? 'Yes' : 'No' }
                  ])}
                  {renderFormRow([
                    { label: 'Referred to Healthcare', value: intakeData.services.referredToHealthcare ? 'Yes' : 'No' },
                    { label: 'Referred to Law Enforcement', value: intakeData.services.referredToLawEnforcement ? 'Yes' : 'No' }
                  ])}
                  {intakeData.services.healthcareProvider && 
                    renderFormField('Healthcare Provider', intakeData.services.healthcareProvider)
                  }
                  {intakeData.services.lawEnforcementAgency && 
                    renderFormField('Law Enforcement Agency', intakeData.services.lawEnforcementAgency)
                  }
                </>
              ))}

              <View style={styles.documentFooter}>
                <Text style={styles.documentFooterText}>
                  This is an official document generated from the ETALA Violence Against Women Documentation System.
                </Text>
                <Text style={styles.documentFooterText}>
                  Generated on: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.exportButton]} 
                onPress={() => exportToPDF(selectedReport)}
                disabled={exporting}>
                {exporting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="picture-as-pdf" size={20} color="#FFFFFF" />
                    <Text style={styles.modalButtonText}>Export as PDF</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.closeButtonFooter]} onPress={closeModal}>
                <Text style={[styles.modalButtonText, styles.closeButtonText]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Report History</Text>
          <Text style={styles.headerSubtitle}>{filteredReports.length} Total Reports</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ticket number or type..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['All', 'Pending', 'Under Review', 'In Progress', 'Resolved', 'Closed'].map(renderFilterChip)}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4338CA" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : filteredReports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inbox" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Reports Found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.trim() ? 'Try adjusting your search criteria' : 'Your submitted reports will appear here'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4338CA']} />
          }>
          {filteredReports.map(renderReportCard)}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {renderReportDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 3,
  },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  headerRight: { width: 40 },
  searchContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1F2937' },
  filterContainer: { backgroundColor: '#FFFFFF', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  filterScroll: { paddingHorizontal: 20 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterChipSelected: { backgroundColor: '#EEF2FF', borderColor: '#4338CA' },
  filterChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterChipTextSelected: { color: '#4338CA', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 20 },
  reportCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  reportHeaderLeft: { flex: 1 },
  ticketNumber: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  typeBadgeText: { fontSize: 11, color: '#6B7280', marginLeft: 4, fontWeight: '500' },
  priorityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  priorityBadgeText: { fontSize: 12, fontWeight: '700' },
  reportBody: { marginBottom: 12 },
  reportInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  incidentType: { fontSize: 14, color: '#374151', marginLeft: 6, flex: 1, fontWeight: '500' },
  description: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  reportFooter: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' 
  },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, color: '#9CA3AF', marginLeft: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  bottomPadding: { height: 24 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '95%', paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 20, borderBottomWidth: 2, borderBottomColor: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', letterSpacing: 0.5 },
  modalSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  closeButton: { padding: 4 },
  modalBody: { padding: 20 },
  formSection: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  formSectionHeader: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  formSectionContent: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  formField: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  formFieldHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formValue: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    fontWeight: '500',
  },
  documentFooter: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  documentFooterText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  modalFooter: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16, 
    borderRadius: 12,
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    backgroundColor: '#DC2626',
  },
  closeButtonFooter: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtonText: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '700',
  },
  closeButtonText: {
    color: '#1F2937',
  },
});
export default ReportHistoryScreen;