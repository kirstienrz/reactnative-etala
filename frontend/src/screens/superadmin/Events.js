import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
    FlatList,
    RefreshControl,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAllCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../../api/calendar';

const { width } = Dimensions.get('window');

const SuperAdminCalendarMobile = () => {
    const [allEvents, setAllEvents] = useState([]); // Store original events
    const [eventsByDate, setEventsByDate] = useState({}); // Events organized by date for calendar view
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [viewMode, setViewMode] = useState('month');
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        upcoming: 0,
        completed: 0
    });
    const [markedDates, setMarkedDates] = useState({});

    const today = new Date().toISOString().split('T')[0];

    const eventTypes = {
        holiday: {
            color: '#ef4444',
            icon: 'calendar-remove',
            label: 'Holiday',
            bgColor: '#fef2f2'
        },
        not_available: {
            color: '#6b7280',
            icon: 'close-circle',
            label: 'Not Available',
            bgColor: '#f9fafb'
        },
        consultation: {
            color: '#8b5cf6',
            icon: 'account-group',
            label: 'Consultation',
            bgColor: '#f5f3ff'
        },
        program_event: {
            color: '#3b82f6',
            icon: 'calendar-check',
            label: 'Program Event',
            bgColor: '#eff6ff'
        },
        default: {
            color: '#3b82f6',
            icon: 'calendar',
            label: 'Event',
            bgColor: '#eff6ff'
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await getAllCalendarEvents();

            if (response.success && response.data) {
                // Store original events
                const processedEvents = response.data.map(event => ({
                    ...event,
                    type: event.type || 'default',
                    config: eventTypes[event.type || 'default'] || eventTypes.default
                }));
                
                setAllEvents(processedEvents);
                
                // Process for calendar view (per-day)
                const { markedDates: processedMarkedDates, eventsByDate: processedEventsByDate } = 
                    processEventsForCalendar(processedEvents);
                
                setEventsByDate(processedEventsByDate);
                setMarkedDates(processedMarkedDates);
                calculateStats(processedEvents);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            Alert.alert('Error', 'Failed to load calendar events');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const processEventsForCalendar = (events) => {
    const markedDates = {};
    const eventsByDate = {};

    events.forEach(event => {
        if (!event.start) return;

        const startDate = event.start.split('T')[0];
        const endDate = event.end ? event.end.split('T')[0] : startDate;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(start);

        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];

            if (!markedDates[dateStr]) {
                markedDates[dateStr] = {
                    marked: true,
                    dots: [{ color: event.config.color }]
                };
            } else {
                // if may existing events sa date, add multiple colored dots
                markedDates[dateStr].dots.push({ color: event.config.color });
            }

            if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
            eventsByDate[dateStr].push(event);

            current.setDate(current.getDate() + 1);
        }
    });

    return { markedDates, eventsByDate };
};


    const calculateStats = (events) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const total = events.length;
        const thisMonth = events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        }).length;

        const upcoming = events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate > now;
        }).length;

        const completed = events.filter(event => {
            return event.extendedProps?.status === 'completed';
        }).length;

        setStats({ total, thisMonth, upcoming, completed });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    const handleDateSelect = (day) => {
        setSelectedDate(day.dateString);
    };

    const handleEventPress = (event) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const handleAddEvent = () => {
        setIsEditMode(false);
        setFormData({
            start: selectedDate || today,
            end: selectedDate || today,
            allDay: true,
            type: 'consultation'
        });
        setShowModal(true);
    };

    const handleEditEvent = () => {
        if (!selectedEvent) return;
        
        setIsEditMode(true);
        setFormData({
            id: selectedEvent.id,
            title: selectedEvent.title,
            type: selectedEvent.type || 'consultation',
            start: selectedEvent.start.split('T')[0],
            end: selectedEvent.end ? selectedEvent.end.split('T')[0] : selectedEvent.start.split('T')[0],
            location: selectedEvent.location || '',
            description: selectedEvent.description || '',
            allDay: selectedEvent.allDay !== false
        });
        setShowEventModal(false);
        setShowModal(true);
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;

        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCalendarEvent(selectedEvent.id);
                            setShowEventModal(false);
                            setSelectedEvent(null);
                            fetchEvents();
                            Alert.alert('Success', 'Event deleted successfully!');
                        } catch (error) {
                            console.error('Error deleting event:', error);
                            Alert.alert('Error', 'Failed to delete event');
                        }
                    }
                }
            ]
        );
    };

    const handleSaveEvent = async () => {
        try {
            if (!formData.title) {
                Alert.alert('Error', 'Please enter an event title');
                return;
            }

            if (isEditMode) {
                await updateCalendarEvent(formData.id, formData);
            } else {
                await createCalendarEvent(formData);
            }

            setShowModal(false);
            setFormData({});
            setIsEditMode(false);
            fetchEvents();
            Alert.alert('Success', `Event ${isEditMode ? 'updated' : 'saved'} successfully!`);
        } catch (error) {
            console.error('Error saving event:', error);
            Alert.alert('Error', 'Failed to save event');
        }
    };

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>Total Events</Text>
                    <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                        <Icon name="calendar-month" size={20} color="#2563eb" />
                    </View>
                </View>
                <Text style={styles.statValue}>{stats.total}</Text>
            </View>

            <View style={styles.statCard}>
                <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>This Month</Text>
                    <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                        <Icon name="calendar-today" size={20} color="#16a34a" />
                    </View>
                </View>
                <Text style={styles.statValue}>{stats.thisMonth}</Text>
            </View>

            <View style={styles.statCard}>
                <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>Upcoming</Text>
                    <View style={[styles.statIcon, { backgroundColor: '#ffedd5' }]}>
                        <Icon name="calendar-clock" size={20} color="#ea580c" />
                    </View>
                </View>
                <Text style={styles.statValue}>{stats.upcoming}</Text>
            </View>

            <View style={styles.statCard}>
                <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>Completed</Text>
                    <View style={[styles.statIcon, { backgroundColor: '#f3f4f6' }]}>
                        <Icon name="check-circle" size={20} color="#6b7280" />
                    </View>
                </View>
                <Text style={styles.statValue}>{stats.completed}</Text>
            </View>
        </View>
    );

    const renderEventItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.eventCard, { borderLeftColor: item.config.color }]}
            onPress={() => handleEventPress(item)}
        >
            <View style={styles.eventHeader}>
                <View style={styles.eventType}>
                    <Icon name={item.config.icon} size={16} color={item.config.color} />
                    <Text style={[styles.eventTypeText, { color: item.config.color }]}>
                        {item.config.label}
                    </Text>
                </View>
                {item.allDay && (
                    <View style={styles.allDayBadge}>
                        <Text style={styles.allDayText}>All Day</Text>
                    </View>
                )}
            </View>

            <Text style={styles.eventTitle}>{item.title}</Text>

            <View style={styles.eventDetails}>
                <Icon name="clock-outline" size={14} color="#6b7280" />
                <Text style={styles.eventTime}>
                    {new Date(item.start).toLocaleDateString()}
                    {item.end && item.start.split('T')[0] !== item.end.split('T')[0] 
                        ? ` - ${new Date(item.end).toLocaleDateString()}` 
                        : ''}
                </Text>
            </View>

            {item.location && (
                <View style={styles.eventDetails}>
                    <Icon name="map-marker" size={14} color="#6b7280" />
                    <Text style={styles.eventLocation}>{item.location}</Text>
                </View>
            )}

            {item.description && (
                <Text style={styles.eventDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            )}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading calendar...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Superadmin Calendar</Text>
                    <Text style={styles.subtitle}>Manage Programs, Projects, Events, Holidays & Consultations</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                        <Icon name="refresh" size={20} color="#374151" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
                        <Icon name="plus" size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>
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
                {renderStats()}
                {/* View Mode Toggle */}
                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.viewButton, viewMode === 'month' && styles.viewButtonActive]}
                        onPress={() => setViewMode('month')}
                    >
                        <Icon
                            name="calendar-month"
                            size={16}
                            color={viewMode === 'month' ? '#ffffff' : '#6b7280'}
                        />
                        <Text style={[
                            styles.viewButtonText,
                            viewMode === 'month' && styles.viewButtonTextActive
                        ]}>
                            Calendar
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
                        onPress={() => setViewMode('list')}
                    >
                        <Icon
                            name="format-list-bulleted"
                            size={16}
                            color={viewMode === 'list' ? '#ffffff' : '#6b7280'}
                        />
                        <Text style={[
                            styles.viewButtonText,
                            viewMode === 'list' && styles.viewButtonTextActive
                        ]}>
                            List
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Calendar View */}
                {viewMode === 'month' ? (
                    <>
                        <View style={styles.calendarContainer}>
                            <Calendar
                                current={selectedDate}
                                onDayPress={handleDateSelect}
                                markingType="multi-dot"
                                markedDates={{
                                    ...markedDates,
                                    [selectedDate]: {
                                        ...markedDates[selectedDate],
                                        selected: true,
                                        selectedColor: '#2563eb',
                                    }
                                }}
                                theme={{
                                    backgroundColor: '#ffffff',
                                    calendarBackground: '#ffffff',
                                    textSectionTitleColor: '#6b7280',
                                    selectedDayBackgroundColor: '#2563eb',
                                    selectedDayTextColor: '#ffffff',
                                    todayTextColor: '#2563eb',
                                    dayTextColor: '#374151',
                                    textDisabledColor: '#d1d5db',
                                    arrowColor: '#2563eb',
                                    monthTextColor: '#111827',
                                    textDayFontSize: 14,
                                    textMonthFontSize: 16,
                                    textDayHeaderFontSize: 12,
                                }}
                                style={styles.calendar}
                            />
                        </View>

                        <View style={styles.eventsSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    Events for {new Date(selectedDate).toLocaleDateString()}
                                </Text>
                                <TouchableOpacity onPress={handleAddEvent}>
                                    <Text style={styles.addEventText}>+ Add Event</Text>
                                </TouchableOpacity>
                            </View>
                            
                            {eventsByDate[selectedDate] && eventsByDate[selectedDate].length > 0 ? (
                                eventsByDate[selectedDate].map((item, index) => (
                                    <View key={`${item.id}-${index}`}>
                                        {renderEventItem({ item })}
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyEvents}>
                                    <Icon name="calendar-blank" size={48} color="#9ca3af" />
                                    <Text style={styles.emptyEventsText}>No events scheduled</Text>
                                    <Text style={styles.emptyEventsSubtext}>Tap + to add an event</Text>
                                </View>
                            )}
                        </View>
                    </>
                ) : (
                    <View style={styles.listContainer}>
                        <Text style={styles.listTitle}>All Events</Text>
                        <FlatList
                            data={allEvents.sort((a, b) => new Date(a.start) - new Date(b.start))}
                            renderItem={renderEventItem}
                            keyExtractor={(item, index) => `${item.id}-${index}`}
                            scrollEnabled={false}
                            contentContainerStyle={styles.allEventsList}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Add/Edit Event Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setShowModal(false);
                    setIsEditMode(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isEditMode ? 'Edit Event' : 'Add Calendar Event'}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setShowModal(false);
                                setIsEditMode(false);
                            }}>
                                <Icon name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Event Title *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.title || ''}
                                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                                    placeholder="Enter event title"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Event Type</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                                    {Object.entries(eventTypes)
                                        .filter(([key]) => key !== 'default')
                                        .map(([key, type]) => (
                                            <TouchableOpacity
                                                key={key}
                                                style={[
                                                    styles.typeButton,
                                                    formData.type === key && { 
                                                        backgroundColor: type.color + '20', 
                                                        borderColor: type.color 
                                                    }
                                                ]}
                                                onPress={() => setFormData({ ...formData, type: key })}
                                            >
                                                <Icon 
                                                    name={type.icon} 
                                                    size={16} 
                                                    color={formData.type === key ? type.color : '#6b7280'} 
                                                />
                                                <Text style={[
                                                    styles.typeButtonText,
                                                    formData.type === key && { color: type.color }
                                                ]}>
                                                    {type.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                </ScrollView>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Start Date *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.start || ''}
                                    onChangeText={(text) => setFormData({ ...formData, start: text })}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>End Date</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.end || ''}
                                    onChangeText={(text) => setFormData({ ...formData, end: text })}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Location (Optional)</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.location || ''}
                                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                                    placeholder="Enter location"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Description (Optional)</Text>
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    value={formData.description || ''}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    placeholder="Enter description"
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <TouchableOpacity
                                    style={styles.checkbox}
                                    onPress={() => setFormData({ ...formData, allDay: !formData.allDay })}
                                >
                                    <View style={[styles.checkboxBox, formData.allDay && styles.checkboxBoxChecked]}>
                                        {formData.allDay && <Icon name="check" size={14} color="#ffffff" />}
                                    </View>
                                    <Text style={styles.checkboxText}>All Day Event</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowModal(false);
                                    setIsEditMode(false);
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveEvent}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isEditMode ? 'Update' : 'Save'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Event Details Modal */}
            <Modal
                visible={showEventModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEventModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedEvent && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={styles.eventModalHeader}>
                                        <View style={[styles.eventTypeBadge, { backgroundColor: selectedEvent.config.color + '20' }]}>
                                            <Icon name={selectedEvent.config.icon} size={16} color={selectedEvent.config.color} />
                                            <Text style={[styles.eventTypeBadgeText, { color: selectedEvent.config.color }]}>
                                                {selectedEvent.config.label}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setShowEventModal(false)}>
                                            <Icon name="close" size={24} color="#374151" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <ScrollView style={styles.modalBody}>
                                    <Text style={styles.eventModalTitle}>{selectedEvent.title}</Text>

                                    <View style={styles.eventModalDetail}>
                                        <Icon name="clock-outline" size={18} color="#6b7280" />
                                        <View style={styles.eventModalDetailText}>
                                            <Text style={styles.eventModalDetailLabel}>Date & Time</Text>
                                            <Text style={styles.eventModalDetailValue}>
                                                {new Date(selectedEvent.start).toLocaleDateString()}
                                                {selectedEvent.end && selectedEvent.start.split('T')[0] !== selectedEvent.end.split('T')[0] &&
                                                    ` - ${new Date(selectedEvent.end).toLocaleDateString()}`}
                                                {selectedEvent.allDay && ' (All Day)'}
                                            </Text>
                                        </View>
                                    </View>

                                    {selectedEvent.location && (
                                        <View style={styles.eventModalDetail}>
                                            <Icon name="map-marker" size={18} color="#6b7280" />
                                            <View style={styles.eventModalDetailText}>
                                                <Text style={styles.eventModalDetailLabel}>Location</Text>
                                                <Text style={styles.eventModalDetailValue}>{selectedEvent.location}</Text>
                                            </View>
                                        </View>
                                    )}

                                    {selectedEvent.description && (
                                        <View style={styles.eventModalDetail}>
                                            <Icon name="text-box-outline" size={18} color="#6b7280" />
                                            <View style={styles.eventModalDetailText}>
                                                <Text style={styles.eventModalDetailLabel}>Description</Text>
                                                <Text style={styles.eventModalDetailValue}>{selectedEvent.description}</Text>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.eventModalActions}>
                                        <TouchableOpacity 
                                            style={styles.editButton}
                                            onPress={handleEditEvent}
                                        >
                                            <Icon name="pencil" size={16} color="#2563eb" />
                                            <Text style={styles.editButtonText}>Edit Event</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.deleteButton}
                                            onPress={handleDeleteEvent}
                                        >
                                            <Icon name="trash-can-outline" size={16} color="#dc2626" />
                                            <Text style={styles.deleteButtonText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
        paddingBottom: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        minWidth: (width - 56) / 2,
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
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 10,
        color: '#6b7280',
        flex: 1,
    },
    statIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    legendContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 16,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    legendRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 11,
        color: '#6b7280',
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 16,
    },
    viewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 6,
    },
    viewButtonActive: {
        backgroundColor: '#2563eb',
    },
    viewButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
    },
    viewButtonTextActive: {
        color: '#ffffff',
    },
    calendarContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 16,
    },
    calendar: {
        borderRadius: 8,
    },
    customDay: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
    },
    selectedCustomDay: {
        backgroundColor: '#2563eb',
        borderRadius: 16,
    },
    todayCustomDay: {
        borderWidth: 1,
        borderColor: '#2563eb',
        borderRadius: 16,
    },
    customDayText: {
        fontSize: 14,
        color: '#374151',
    },
    selectedCustomDayText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    todayCustomDayText: {
        color: '#2563eb',
        fontWeight: '600',
    },
    disabledCustomDayText: {
        color: '#d1d5db',
    },
    customEventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        position: 'absolute',
        bottom: 4,
    },
    listContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    allEventsList: {
        gap: 12,
    },
    eventsSection: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    addEventText: {
        fontSize: 12,
        color: '#2563eb',
        fontWeight: '600',
    },
    eventCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderLeftWidth: 4,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventType: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    eventTypeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    allDayBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    allDayText: {
        fontSize: 10,
        color: '#6b7280',
        fontWeight: '500',
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    eventDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    eventTime: {
        fontSize: 12,
        color: '#6b7280',
    },
    eventLocation: {
        fontSize: 12,
        color: '#6b7280',
    },
    eventDescription: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 8,
        lineHeight: 16,
    },
    emptyEvents: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyEventsText: {
        fontSize: 14,
        color: '#374151',
        marginTop: 12,
    },
    emptyEventsSubtext: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 4,
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
    formInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#ffffff',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    typeScroll: {
        flexDirection: 'row',
        marginHorizontal: -4,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginHorizontal: 4,
        backgroundColor: '#ffffff',
    },
    typeButtonText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkboxBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxBoxChecked: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    checkboxText: {
        fontSize: 14,
        color: '#374151',
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
    saveButton: {
        backgroundColor: '#2563eb',
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    eventModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    eventTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    eventTypeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    eventModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    eventModalDetail: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
    },
    eventModalDetailText: {
        flex: 1,
    },
    eventModalDetailLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
    },
    eventModalDetailValue: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    eventModalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2563eb',
        backgroundColor: '#ffffff',
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563eb',
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dc2626',
        backgroundColor: '#ffffff',
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#dc2626',
    },
});

export default SuperAdminCalendarMobile;