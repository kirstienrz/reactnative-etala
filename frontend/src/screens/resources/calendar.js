import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Modal } from 'react-native';
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

      if (response.success) {
        const formatted = {};
        const rawData = [];

        response.data.forEach(event => {
          if (event.type !== 'consultation') {
            // Store raw event data
            rawData.push(event);

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

        setEvents(formatted);
        setRawEvents(rawData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (type) => {
    switch(type) {
      case 'holiday': return '#DC2626';
      case 'not_available': return '#6B7280';
      case 'program_event': return '#1F2937';
      default: return '#1F2937';
    }
  };

  const getEventTypeLabel = (type) => {
    switch(type) {
      case 'holiday': return 'Holiday';
      case 'not_available': return 'Not Available';
      case 'program_event': return 'Program Event';
      default: return 'Event';
    }
  };

  const getEventTypeBadgeColor = (type) => {
    switch(type) {
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
    setSelectedDayEvents(dayEvents);
  };

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
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
        <CalendarIcon size={28} color="#111827" />
        <Text style={styles.headerTitle}>Calendar</Text>
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
            <Text style={styles.eventsSectionTitle}>
              Events on {new Date(selectedDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </Text>

            {selectedDayEvents.length === 0 ? (
              <View style={styles.noEventsCard}>
                <CalendarIcon size={40} color="#D1D5DB" />
                <Text style={styles.noEventsText}>No events on this date</Text>
              </View>
            ) : (
              <View style={styles.eventsList}>
                {selectedDayEvents.map((event) => {
                  const badgeColors = getEventTypeBadgeColor(event.type);
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
                          <View style={[styles.eventTypeBadge, { backgroundColor: badgeColors.bg }]}>
                            <Text style={[styles.eventTypeText, { color: badgeColors.text }]}>
                              {getEventTypeLabel(event.type)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {event.description && (
                        <Text style={styles.eventDescription} numberOfLines={2}>
                          {event.description}
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

                  {selectedEvent.description && (
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <Info size={18} color="#374151" />
                        <Text style={styles.modalSectionTitle}>Description</Text>
                      </View>
                      <Text style={styles.modalText}>{selectedEvent.description}</Text>
                    </View>
                  )}

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

                  {selectedEvent.location && (
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <MapPin size={18} color="#374151" />
                        <Text style={styles.modalSectionTitle}>Location</Text>
                      </View>
                      <Text style={styles.modalText}>{selectedEvent.location}</Text>
                    </View>
                  )}

                  {selectedEvent.participants && (
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <Users size={18} color="#374151" />
                        <Text style={styles.modalSectionTitle}>Participants</Text>
                      </View>
                      <Text style={styles.modalText}>{selectedEvent.participants} people</Text>
                    </View>
                  )}
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
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827'
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
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12
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
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12
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