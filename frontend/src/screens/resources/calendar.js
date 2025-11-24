import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { X, Calendar as CalendarIcon, Clock, MapPin, Users, Info } from 'lucide-react-native';
import { getAllCalendarEvents } from '../../api/calendar';

export default function UserCalendar() {
  const [events, setEvents] = useState({});
  const [rawEvents, setRawEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getAllCalendarEvents();

      console.log('📊 API Response:', response);

      if (response.success) {
        const formatted = {};
        const rawData = [];

        response.data.forEach(event => {
          if (event.type !== 'consultation') {
            // ✅ FLATTEN THE DATA - extract extendedProps to top level
            const flattenedEvent = {
              _id: event._id,
              title: event.title,
              start: event.start,
              type: event.type,
              // ✅ Extract ALL data from extendedProps
              description: event.extendedProps?.description || '',
              venue: event.extendedProps?.venue || '',
              location: event.extendedProps?.location || '',
              participants: event.extendedProps?.participants || 0,
              programId: event.extendedProps?.programId,
              projectId: event.extendedProps?.projectId
            };

            console.log('📅 Flattened Event:', flattenedEvent); // DEBUG

            rawData.push(flattenedEvent);

            // Format for calendar marking
            if (!formatted[event.start]) {
              formatted[event.start] = {
                marked: true,
                dots: []
              };
            }

            formatted[event.start].dots.push({
              color: getEventColor(event.type),
              key: event._id
            });
          }
        });

        console.log('📝 Events with descriptions:', rawData.filter(e => e.description).length);
        console.log('📝 Total events:', rawData.length);

        setEvents(formatted);
        setRawEvents(rawData); // ✅ Now contains flattened data
      }
    } catch (err) {
      console.error('❌ Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Now handleEventPress can access properties directly
  const handleEventPress = (event) => {
    console.log('🔍 Event pressed:', {
      title: event.title,
      description: event.description,
      venue: event.venue,
      location: event.location,
      participants: event.participants,
      hasDescription: !!event.description
    });

    setSelectedEvent({
      ...event,
      // Already flattened, no need for extendedProps
      description: event.description || 'No description available',
      location: event.venue || event.location || 'No location specified',
      participants: event.participants || 0
    });
    setShowModal(true);
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'holiday': return '#DC2626';
      case 'not_available': return '#6B7280';
      case 'program_event': return '#1F2937';
      default: return '#1F2937';
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'holiday': return 'Holiday';
      case 'not_available': return 'Not Available';
      case 'program_event': return 'Program Event';
      default: return 'Event';
    }
  };

  const getEventTypeBadgeColor = (type) => {
    switch (type) {
      case 'holiday': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'not_available': return { bg: '#F3F4F6', text: '#6B7280' };
      case 'program_event': return { bg: '#E5E7EB', text: '#1F2937' };
      default: return { bg: '#E5E7EB', text: '#1F2937' };
    }
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);

    // Get all events for this date
    const dayEvents = rawEvents.filter(event => event.start === dateString);

    console.log('📅 Selected date events:', dayEvents.map(e => ({ // DEBUG
      title: e.title,
      description: e.description,
      hasDesc: !!e.description
    })));

    setSelectedDayEvents(dayEvents);
  };


  // ⬇️ ADD DEBUG BUTTON
  const showDebugInfo = () => {
    const eventsWithDesc = rawEvents.filter(e => e.description);
    const eventsWithoutDesc = rawEvents.filter(e => !e.description);

    Alert.alert(
      '🔍 Debug Information',
      `Total Events: ${rawEvents.length}\n` +
      `With Description: ${eventsWithDesc.length}\n` +
      `Without Description: ${eventsWithoutDesc.length}\n\n` +
      `Selected Date: ${selectedDate || 'None'}\n` +
      `Events on Selected Date: ${selectedDayEvents.length}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F2937" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CalendarIcon size={28} color="#111827" />
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>
        {/* ⬇️ ADD DEBUG BUTTON */}
        <TouchableOpacity onPress={showDebugInfo} style={styles.debugButton}>
          <Text style={styles.debugButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Calendar
            markedDates={{
              ...events,
              [selectedDate]: {
                ...events[selectedDate],
                selected: true,
                selectedColor: '#E5E7EB'
              }
            }}
            markingType={'multi-dot'}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#6B7280',
              selectedDayBackgroundColor: '#1F2937',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#1F2937',
              dayTextColor: '#111827',
              textDisabledColor: '#D1D5DB',
              dotColor: '#1F2937',
              selectedDotColor: '#ffffff',
              arrowColor: '#1F2937',
              monthTextColor: '#111827',
              textMonthFontWeight: '700',
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13
            }}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Event Types</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.legendText}>Holiday</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
              <Text style={styles.legendText}>Not Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1F2937' }]} />
              <Text style={styles.legendText}>Program Event</Text>
            </View>
          </View>
        </View>

        {/* Selected Day Events */}
        {selectedDate && (
          <View style={styles.eventsSection}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsSectionTitle}>
                Events on {new Date(selectedDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
              {/* ⬇️ SHOW EVENT COUNT */}
              <Text style={styles.eventCount}>
                {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {selectedDayEvents.length === 0 ? (
              <View style={styles.noEventsCard}>
                <CalendarIcon size={40} color="#D1D5DB" />
                <Text style={styles.noEventsText}>No events on this date</Text>
              </View>
            ) : (
              <View style={styles.eventsList}>
                {selectedDayEvents.map((event) => {
                  const badgeColors = getEventTypeBadgeColor(event.type);
                  const hasDescription = !!event.description;

                  return (
                    <TouchableOpacity
                      key={event._id}
                      style={styles.eventCard}
                      onPress={() => handleEventPress(event)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.eventHeader}>
                        <View style={styles.eventTitleContainer}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <View style={styles.eventBadges}>
                            <View style={[styles.eventTypeBadge, { backgroundColor: badgeColors.bg }]}>
                              <Text style={[styles.eventTypeText, { color: badgeColors.text }]}>
                                {getEventTypeLabel(event.type)}
                              </Text>
                            </View>
                            {/* ⬇️ SHOW DESCRIPTION INDICATOR */}
                            {hasDescription && (
                              <View style={styles.hasDescriptionBadge}>
                                <Text style={styles.hasDescriptionText}>📝</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      {/* ⬇️ FIXED DESCRIPTION DISPLAY */}
                      {/* ⬇️ SIGURADUHING string ang ilalagay */}
                      {hasDescription ? (
                        <View style={styles.descriptionContainer}>
                          <Text style={styles.eventDescription}>
                            {String(event.description || '')}  {/* ✅ Force to string */}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.noDescriptionText}>
                          No description available
                        </Text>
                      )}

                      <View style={styles.eventDetails}>
                        {event.location && (
                          <View style={styles.eventDetailItem}>
                            <MapPin size={14} color="#6B7280" />
                            <Text style={styles.eventDetailText}>{event.location}</Text>
                          </View>
                        )}
                        {event.participants && (
                          <View style={styles.eventDetailItem}>
                            <Users size={14} color="#6B7280" />
                            <Text style={styles.eventDetailText}>{event.participants} participants</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.eventFooter}>
                        <Text style={styles.tapToView}>Tap to view details</Text>
                        {/* ⬇️ SHOW DEBUG INFO */}
                        <Text style={styles.debugInfo}>
                          ID: {event._id?.substring(0, 8)}...
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Event Details Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEvent && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalSection}>
                    <View style={[
                      styles.eventTypeBadge,
                      { backgroundColor: getEventTypeBadgeColor(selectedEvent.type).bg }
                    ]}>
                      <Text style={[
                        styles.eventTypeText,
                        { color: getEventTypeBadgeColor(selectedEvent.type).text }
                      ]}>
                        {getEventTypeLabel(selectedEvent.type)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={styles.modalSectionHeader}>
                      <Info size={18} color="#374151" />
                      <Text style={styles.modalSectionTitle}>Description</Text>
                    </View>
                    <Text style={styles.modalText}>
                      {selectedEvent.description || 'No description available'}
                    </Text>
                    {/* ⬇️ SHOW DEBUG IN MODAL */}
                    <Text style={styles.debugModalText}>
                      Description length: {selectedEvent.description?.length || 0} characters
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={styles.modalSectionHeader}>
                      <CalendarIcon size={18} color="#374151" />
                      <Text style={styles.modalSectionTitle}>Date</Text>
                    </View>
                    <Text style={styles.modalText}>
                      {new Date(selectedEvent.start).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>

                  {/* ✅ ONLY render if may value */}
                  {selectedEvent?.location ? (
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <MapPin size={18} color="#374151" />
                        <Text style={styles.modalSectionTitle}>Location</Text>
                      </View>
                      <Text style={styles.modalText}>
                        {String(selectedEvent.location)}
                      </Text>
                    </View>
                  ) : null}

                  {selectedEvent?.participants ? (
  <View style={styles.modalSection}>
    <View style={styles.modalSectionHeader}>
      <Users size={18} color="#374151" />
      <Text style={styles.modalSectionTitle}>Participants</Text>
    </View>
    <Text style={styles.modalText}>
      {selectedEvent.participants} people  {/* ✅ Already a string */}
    </Text>
  </View>
) : null}
                </ScrollView>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827'
  },
  debugButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  legendCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendText: {
    fontSize: 14,
    color: '#374151'
  },
  eventsSection: {
    paddingHorizontal: 16,
    paddingBottom: 20
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1
  },
  eventCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600'
  },
  noEventsCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  noEventsText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF'
  },
  eventsList: {
    gap: 12
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  eventHeader: {
    marginBottom: 8
  },
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap'
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1
  },
  eventBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  eventTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  eventTypeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  hasDescriptionBadge: {
    padding: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 4
  },
  hasDescriptionText: {
    fontSize: 10,
    fontWeight: '600'
  },
  descriptionContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1F2937',
    marginBottom: 12
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },
  noDescriptionText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center'
  },
  eventDetails: {
    gap: 8,
    marginBottom: 8
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  eventDetailText: {
    fontSize: 13,
    color: '#6B7280'
  },
  eventFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    marginTop: 4
  },
  tapToView: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic'
  },
  debugInfo: {
    fontSize: 10,
    color: '#D1D5DB',
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12
  },
  closeButton: {
    padding: 4
  },
  modalBody: {
    padding: 20
  },
  modalSection: {
    marginBottom: 20
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  modalText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22
  },
  debugModalText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4
  },
  modalCloseButton: {
    backgroundColor: '#1F2937',
    padding: 16,
    alignItems: 'center',
    margin: 20,
    marginTop: 0,
    borderRadius: 10
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});