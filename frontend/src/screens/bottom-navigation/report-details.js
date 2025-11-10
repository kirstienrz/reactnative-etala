import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getUserReportById } from '../../api/report';

const ReportDetailsScreen = ({ route, navigation }) => {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserReportById(reportId);
      console.log('Report data:', response); // Debug log
      
      // ✅ Fixed: Backend returns { success: true, data: report }
      if (response.success && response.data) {
        setReport(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      Alert.alert('Error', 'Failed to load report details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed: Date parsing function that handles MM/DD/YYYY format
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
      
      // Validate the date is correct
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

  // ✅ Fixed: Format date with proper parsing
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = parseDate(dateString);
    
    if (!date) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Fixed: Format short date with proper parsing
  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = parseDate(dateString);
    
    if (!date) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const handleOpenAttachment = async (attachment) => {
    try {
      const url = attachment.uri;
      
      // Check if URL is valid
      if (!url) {
        Alert.alert('Error', 'Attachment URL not found');
        return;
      }

      // Check if the device can open the URL
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open this file type: ${attachment.fileName}`);
      }
    } catch (error) {
      console.error('Error opening attachment:', error);
      Alert.alert('Error', 'Failed to open attachment. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4338CA" />
          <Text style={styles.loadingText}>Loading report details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#DC2626" />
          <Text style={styles.errorText}>Report not found</Text>
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
          <Text style={styles.headerTitle}>Report Details</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        
        {/* A. Ticket Header */}
        <View style={styles.ticketHeader}>
          <View style={styles.ticketHeaderTop}>
            <View>
              <Text style={styles.ticketLabel}>Ticket ID</Text>
              <View style={styles.ticketNumberContainer}>
                <MaterialIcons name="confirmation-number" size={20} color="#4338CA" />
                <Text style={styles.ticketNumber}>{report.ticketNumber}</Text>
              </View>
            </View>
            <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
              <Text style={[styles.statusTextLarge, { color: getStatusColor(report.status) }]}>
                {report.status || 'Pending'}
              </Text>
            </View>
          </View>
          
          <View style={styles.categoryContainer}>
            <MaterialIcons name="label" size={16} color="#6B7280" />
            <Text style={styles.categoryText}>
              {report.incidentTypes?.join(', ') || 'Uncategorized'}
            </Text>
          </View>
        </View>

        {/* B. Report Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <MaterialIcons name="description" size={20} color="#6B7280" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Description</Text>
                <Text style={styles.summaryText}>
                  {report.incidentDescription || 'No description provided'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <MaterialIcons name="person" size={20} color="#6B7280" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Submitted by</Text>
                <Text style={styles.summaryText}>
                  {report.isAnonymous 
                    ? 'Anonymous Reporter' 
                    : `${report.firstName || ''} ${report.lastName || ''}`.trim() || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <MaterialIcons name="calendar-today" size={20} color="#6B7280" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Date submitted</Text>
                <Text style={styles.summaryText}>
                  {formatDate(report.submittedAt || report.createdAt)}
                </Text>
              </View>
            </View>

            {/* ✅ Added: Incident Date display */}
            {report.latestIncidentDate && parseDate(report.latestIncidentDate) && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <MaterialIcons name="event" size={20} color="#6B7280" />
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Incident Date</Text>
                    <Text style={styles.summaryText}>
                      {formatShortDate(report.latestIncidentDate)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {report.incidentRegion && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <MaterialIcons name="location-on" size={20} color="#6B7280" />
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Location</Text>
                    <Text style={styles.summaryText}>
                      {[report.incidentRegion, report.incidentProvince, report.incidentCityMun, report.incidentBarangay]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* C. Attachments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          
          {report.attachments && report.attachments.length > 0 ? (
            <View style={styles.attachmentsCard}>
              {report.attachments.map((attachment, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.attachmentItem}
                  onPress={() => handleOpenAttachment(attachment)}>
                  <View style={styles.attachmentIcon}>
                    <MaterialIcons 
                      name={attachment.type?.includes('image') ? 'image' : attachment.type?.includes('video') ? 'videocam' : 'insert-drive-file'} 
                      size={24} 
                      color="#4338CA" 
                    />
                  </View>
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {attachment.fileName || `Attachment ${index + 1}`}
                    </Text>
                    <Text style={styles.attachmentMeta}>
                      {attachment.type || 'Unknown type'}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <MaterialIcons name="attach-file" size={32} color="#D1D5DB" />
              <Text style={styles.emptyText}>No attachments</Text>
            </View>
          )}
        </View>

        {/* D. Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          
          <View style={styles.timelineCard}>
            {report.statusHistory && report.statusHistory.length > 0 ? (
              report.statusHistory.map((history, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineIndicator}>
                    <View style={[styles.timelineDot, { backgroundColor: getStatusColor(history.status) }]} />
                    {index < report.statusHistory.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStatus}>{history.status}</Text>
                    <Text style={styles.timelineDate}>{formatDate(history.timestamp)}</Text>
                    {history.note && (
                      <Text style={styles.timelineNote}>{history.note}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.timelineItem}>
                <View style={styles.timelineIndicator}>
                  <View style={[styles.timelineDot, { backgroundColor: getStatusColor(report.status) }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{report.status || 'Pending'}</Text>
                  <Text style={styles.timelineDate}>
                    {formatDate(report.submittedAt || report.createdAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* E. Referral History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral History</Text>
          
          {report.referralHistory && report.referralHistory.length > 0 ? (
            <View style={styles.referralCard}>
              {report.referralHistory.map((referral, index) => (
                <View key={index} style={styles.referralItem}>
                  <View style={styles.referralIcon}>
                    <MaterialCommunityIcons name="office-building" size={20} color="#4338CA" />
                  </View>
                  <View style={styles.referralInfo}>
                    <Text style={styles.referralDepartment}>{referral.department}</Text>
                    <Text style={styles.referralDate}>{formatShortDate(referral.timestamp)}</Text>
                  </View>
                  <View style={styles.referralStatus}>
                    <View style={[styles.referralDot, { backgroundColor: '#10B981' }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="office-building-outline" size={32} color="#D1D5DB" />
              <Text style={styles.emptyText}>No referrals yet</Text>
            </View>
          )}
        </View>

        {/* F. Admin Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Notes</Text>
          
          {report.adminNotes && report.adminNotes.length > 0 ? (
            <View style={styles.notesCard}>
              {report.adminNotes.map((note, index) => (
                <View key={index} style={styles.noteItem}>
                  <View style={styles.noteHeader}>
                    <View style={styles.noteAuthor}>
                      <MaterialIcons name="account-circle" size={16} color="#6B7280" />
                      <Text style={styles.noteAuthorText}>{note.author || 'Admin'}</Text>
                    </View>
                    <Text style={styles.noteDate}>{formatShortDate(note.timestamp)}</Text>
                  </View>
                  <Text style={styles.noteContent}>{note.content}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <MaterialIcons name="notes" size={32} color="#D1D5DB" />
              <Text style={styles.emptyText}>No admin notes yet</Text>
              <Text style={styles.emptySubtext}>
                Admin notes will appear here as your report is processed
              </Text>
            </View>
          )}
        </View>

        {/* G. Messaging Access */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.messagingButton}
            onPress={() => navigation.navigate('TicketMessages', { reportId: report._id, ticketNumber: report.ticketNumber })}>
            <View style={styles.messagingIcon}>
              <MaterialIcons name="chat-bubble" size={24} color="#4338CA" />
            </View>
            <View style={styles.messagingContent}>
              <Text style={styles.messagingTitle}>View Messages for This Ticket</Text>
              <Text style={styles.messagingSubtitle}>
                {report.isAnonymous 
                  ? 'Communicate anonymously with the support team'
                  : 'Chat with the support team about your report'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#4338CA" />
          </TouchableOpacity>

          {report.isAnonymous && (
            <View style={styles.infoBox}>
              <MaterialIcons name="info-outline" size={18} color="#3B82F6" />
              <Text style={styles.infoText}>
                Your identity remains confidential. All messages are anonymous.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 16,
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: { padding: 8, width: 40 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  placeholder: { width: 40 },
  content: { flex: 1 },
  ticketHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  ticketHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ticketLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ticketNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryContent: {
    flex: 1,
    marginLeft: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  attachmentsCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  attachmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  attachmentMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
    textAlign: 'center',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  timelineNote: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  referralCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  referralIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  referralInfo: {
    flex: 1,
  },
  referralDepartment: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  referralStatus: {
    marginLeft: 12,
  },
  referralDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  noteItem: {
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteAuthorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 6,
  },
  noteDate: {
    fontSize: 11,
    color: '#B45309',
  },
  noteContent: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  messagingButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4338CA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messagingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  messagingContent: {
    flex: 1,
  },
  messagingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4338CA',
    marginBottom: 4,
  },
  messagingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    marginLeft: 12,
    lineHeight: 18,
  },
});

export default ReportDetailsScreen;