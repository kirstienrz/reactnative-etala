import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// API functions - you'll need to implement these
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  addProject,
  updateProject,
  deleteProject,
  addEvent,
  updateEvent,
  deleteEvent
} from '../../api/program';

const { width, height } = Dimensions.get('window');

const GADProgramsMobile = () => {
  // All state declarations
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedYears, setExpandedYears] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch programs
  const fetchPrograms = async () => {
    try {
      const response = await getAllPrograms({
        year: yearFilter !== 'all' ? yearFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });

      if (response.success) {
        setPrograms(response.data);
        if (response.data.length > 0 && !selectedProgram) {
          setSelectedProgram(response.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
      Alert.alert('Error', 'Failed to fetch programs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Check if event is overdue
  const isEventOverdue = (event) => {
    if (event.status === 'completed' || event.status === 'cancelled') return false;
    
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return eventDate < today;
  };

  // Check if all events in program are completed
  const canMarkProgramComplete = (program) => {
    if (!program.projects || program.projects.length === 0) return false;
    
    const allEvents = program.projects.flatMap(p => p.events || []);
    if (allEvents.length === 0) return false;
    
    return allEvents.every(event => event.status === 'completed');
  };

  // Auto-suggest program completion
  const handleCheckCompletion = async (program) => {
    const allEventsComplete = canMarkProgramComplete(program);
    
    if (allEventsComplete && program.status !== 'completed') {
      Alert.alert(
        'Mark as Completed',
        'All events are completed. Mark this program as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark Complete',
            onPress: async () => {
              try {
                await updateProgram(program._id, { ...program, status: 'completed' });
                const response = await getAllPrograms();
                if (response.success) {
                  setPrograms(response.data);
                  const updatedProgram = response.data.find(p => p._id === program._id);
                  if (updatedProgram) {
                    setSelectedProgram(updatedProgram);
                  }
                }
                Alert.alert('Success', 'Program marked as completed!');
              } catch (err) {
                console.error('Error updating program:', err);
                Alert.alert('Error', 'Failed to update program');
              }
            }
          }
        ]
      );
    } else if (!allEventsComplete) {
      Alert.alert('Cannot Complete', 'Not all events are completed yet.');
    } else {
      Alert.alert('Already Completed', 'Program is already marked as completed.');
    }
  };

  const handleSave = async () => {
    try {
      let savedProgramId = selectedProgram?._id;

      if (modalType === 'program') {
        if (formData._id) {
          await updateProgram(formData._id, formData);
          savedProgramId = formData._id;
        } else {
          const response = await createProgram(formData);
          if (response.success) {
            savedProgramId = response.data._id;
          }
        }
      } else if (modalType === 'project') {
        if (formData._id) {
          await updateProject(selectedProgram._id, formData._id, formData);
        } else {
          await addProject(selectedProgram._id, formData);
        }
      } else if (modalType === 'event') {
        const projectId = formData.projectId;
        if (formData._id) {
          await updateEvent(selectedProgram._id, projectId, formData._id, formData);
        } else {
          await addEvent(selectedProgram._id, projectId, formData);
        }
      }

      const response = await getAllPrograms();
      if (response.success) {
        setPrograms(response.data);
        const updatedProgram = response.data.find(p => p._id === savedProgramId);
        if (updatedProgram) {
          setSelectedProgram(updatedProgram);
        }
      }

      setShowModal(false);
      setFormData({});
    } catch (err) {
      console.error('Error saving:', err);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  // Get unique years
  const availableYears = useMemo(() => {
    return [...new Set(programs.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
  }, [programs]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === 'all' || p.year === parseInt(yearFilter);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesYear && matchesStatus;
    });
  }, [programs, searchTerm, yearFilter, statusFilter]);

  // Group by year
  const programsByYear = useMemo(() => {
    return filteredPrograms.reduce((acc, program) => {
      const year = program.year || 'Uncategorized';
      if (!acc[year]) acc[year] = [];
      acc[year].push(program);
      return acc;
    }, {});
  }, [filteredPrograms]);

  const sortedYears = useMemo(() => {
    return Object.keys(programsByYear).sort((a, b) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return parseInt(b) - parseInt(a);
    });
  }, [programsByYear]);

  // Auto-expand first year
  useEffect(() => {
    if (sortedYears.length > 0 && Object.keys(expandedYears).length === 0) {
      setExpandedYears({ [sortedYears[0]]: true });
    }
  }, [sortedYears, expandedYears]);

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  // Get stats
  const getStats = (program) => {
    if (!program) return { totalProjects: 0, completedProjects: 0, totalEvents: 0, completedEvents: 0, overdueEvents: 0 };

    const projects = program.projects || [];
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    const events = projects.flatMap(p => p.events || []);
    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const overdueEvents = events.filter(e => isEventOverdue(e)).length;

    return { totalProjects, completedProjects, totalEvents, completedEvents, overdueEvents };
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const config = {
      upcoming: { color: '#dbeafe', text: '#1e40af', icon: 'clock-outline', label: 'Upcoming' },
      ongoing: { color: '#ffedd5', text: '#ea580c', icon: 'play-circle-outline', label: 'Ongoing' },
      completed: { color: '#dcfce7', text: '#166534', icon: 'check-circle-outline', label: 'Completed' },
      cancelled: { color: '#fee2e2', text: '#991b1b', icon: 'close-circle-outline', label: 'Cancelled' }
    };
    const conf = config[status] || config.ongoing;
    
    return (
      <View style={[styles.badge, { backgroundColor: conf.color }]}>
        <Icon name={conf.icon} size={14} color={conf.text} />
        <Text style={[styles.badgeText, { color: conf.text }]}>{conf.label}</Text>
      </View>
    );
  };

  // Progress Bar Component
  const ProgressBar = ({ completed, total }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{completed}/{total}</Text>
      </View>
    );
  };

  const stats = selectedProgram ? getStats(selectedProgram) : null;

  // Render program item for sidebar
  const renderProgramItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.programItem,
        selectedProgram?._id === item._id && styles.selectedProgramItem
      ]}
      onPress={() => {
        setSelectedProgram(item);
        setShowSidebar(false);
      }}
    >
      <View style={styles.programHeader}>
        <Text style={styles.programName} numberOfLines={1}>{item.name}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.programDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.programStats}>
        <View style={styles.statItem}>
          <Icon name="target" size={14} color="#6b7280" />
          <Text style={styles.statText}>{item.projects?.length || 0} projects</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="calendar" size={14} color="#6b7280" />
          <Text style={styles.statText}>{item.projects?.flatMap(p => p.events || []).length || 0} events</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render project item
  const renderProjectItem = ({ item: project }) => (
    <View style={styles.projectCard}>
      <TouchableOpacity
        style={styles.projectHeader}
        onPress={() => toggleProject(project._id)}
      >
        <Icon
          name={expandedProjects[project._id] ? 'chevron-down' : 'chevron-right'}
          size={24}
          color="#374151"
        />
        <View style={styles.projectInfo}>
          <View style={styles.projectTitleRow}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectYear}>{project.year}</Text>
          </View>
          <View style={styles.projectStats}>
            <Text style={styles.projectStat}>
              {project.events?.length || 0} events
            </Text>
            <Text style={styles.projectStat}>
              {project.events?.filter(e => e.status === 'completed').length || 0} completed
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setShowModal(true);
            setModalType('project');
            setFormData({ ...project });
          }}
        >
          <Icon name="pencil-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </TouchableOpacity>

      {expandedProjects[project._id] && (
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsTitle}>Events</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setShowModal(true);
                setModalType('event');
                setFormData({ status: 'upcoming', projectId: project._id });
              }}
            >
              <Icon name="plus" size={16} color="#2563eb" />
              <Text style={styles.addButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>

          {!project.events || project.events.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Icon name="calendar-blank" size={32} color="#9ca3af" />
              <Text style={styles.emptyText}>No events scheduled</Text>
            </View>
          ) : (
            project.events.map(event => (
              <View key={event._id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(true);
                      setModalType('event');
                      setFormData({ ...event, projectId: project._id });
                    }}
                  >
                    <Icon name="pencil-outline" size={18} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.eventStatusRow}>
                  <StatusBadge status={event.status} />
                  {isEventOverdue(event) && (
                    <View style={styles.overdueBadge}>
                      <Icon name="clock-alert-outline" size={14} color="#dc2626" />
                      <Text style={styles.overdueText}>Overdue</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetail}>
                    <Icon name="calendar" size={16} color="#2563eb" />
                    <Text style={styles.eventDetailText}>{event.date}</Text>
                    {isEventOverdue(event) && (
                      <Text style={styles.overdueNote}> (Needs status update)</Text>
                    )}
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <Icon name="account-group" size={16} color="#2563eb" />
                    <Text style={styles.eventDetailText}>{event.participants} participants</Text>
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <Icon name="map-marker" size={16} color="#2563eb" />
                    <Text style={styles.eventDetailText}>{event.venue}</Text>
                  </View>
                  
                  {event.description && (
                    <View style={styles.eventDescription}>
                      <Icon name="text-box-outline" size={16} color="#6b7280" />
                      <Text style={styles.descriptionText}>{event.description}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loading" size={48} color="#2563eb" />
        <Text style={styles.loadingText}>Loading programs...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(true)}>
          <Icon name="menu" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Text style={styles.headerMainTitle}>
            {selectedProgram?.name || 'Select a Program'}
          </Text>
          {selectedProgram && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {selectedProgram.description}
            </Text>
          )}
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Icon name="filter-variant" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters Modal */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filtersContent}>
            <Text style={styles.filtersTitle}>Filters</Text>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search programs..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            
            <Text style={styles.filterLabel}>Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
              <TouchableOpacity
                style={[
                  styles.yearButton,
                  yearFilter === 'all' && styles.yearButtonActive
                ]}
                onPress={() => setYearFilter('all')}
              >
                <Text style={[
                  styles.yearButtonText,
                  yearFilter === 'all' && styles.yearButtonTextActive
                ]}>All Years</Text>
              </TouchableOpacity>
              {availableYears.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearButton,
                    yearFilter === year.toString() && styles.yearButtonActive
                  ]}
                  onPress={() => setYearFilter(year.toString())}
                >
                  <Text style={[
                    styles.yearButtonText,
                    yearFilter === year.toString() && styles.yearButtonTextActive
                  ]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.filterLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  statusFilter === 'all' && styles.statusButtonActive
                ]}
                onPress={() => setStatusFilter('all')}
              >
                <Text style={[
                  styles.statusButtonText,
                  statusFilter === 'all' && styles.statusButtonTextActive
                ]}>All Status</Text>
              </TouchableOpacity>
              {['upcoming', 'ongoing', 'completed'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    statusFilter === status && styles.statusButtonActive
                  ]}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    statusFilter === status && styles.statusButtonTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                fetchPrograms();
                setShowFilters(false);
              }}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPrograms();
            }}
          />
        }
        contentContainerStyle={styles.content}
      >
        {!selectedProgram ? (
          <View style={styles.emptyState}>
            <Icon name="target" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No Program Selected</Text>
            <Text style={styles.emptyStateText}>
              Select a program from the sidebar to view details
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => setShowSidebar(true)}
            >
              <Text style={styles.browseButtonText}>Browse Programs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Program Status</Text>
                    <StatusBadge status={selectedProgram.status} />
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Projects</Text>
                    <Text style={styles.statValue}>
                      {stats.completedProjects}/{stats.totalProjects}
                    </Text>
                    <ProgressBar completed={stats.completedProjects} total={stats.totalProjects} />
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Events</Text>
                    <Text style={styles.statValue}>
                      {stats.completedEvents}/{stats.totalEvents}
                    </Text>
                    <ProgressBar completed={stats.completedEvents} total={stats.totalEvents} />
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Overall Progress</Text>
                    <Text style={styles.statValue}>
                      {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
                    </Text>
                  </View>
                  
                  {stats.overdueEvents > 0 && (
                    <View style={[styles.statCard, styles.overdueCard]}>
                      <Text style={styles.statLabel}>Overdue Events</Text>
                      <Text style={styles.overdueValue}>{stats.overdueEvents}</Text>
                      <Text style={styles.overdueNoteText}>Need attention</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}

            {/* Notifications */}
            {stats && stats.overdueEvents > 0 && (
              <View style={styles.overdueAlert}>
                <Icon name="alert-circle-outline" size={20} color="#92400e" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>⚠️ Overdue Events Detected</Text>
                  <Text style={styles.alertText}>
                    You have {stats.overdueEvents} event{stats.overdueEvents > 1 ? 's' : ''} that are past due.
                    Please review and update their status.
                  </Text>
                </View>
              </View>
            )}

            {stats && stats.completedEvents === stats.totalEvents && stats.totalEvents > 0 && selectedProgram.status !== 'completed' && (
              <View style={styles.completionAlert}>
                <Icon name="check-circle-outline" size={20} color="#166534" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>🎉 All Events Completed!</Text>
                  <Text style={styles.alertText}>
                    All {stats.totalEvents} events in this program have been completed.
                    You may now mark the program as complete.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.markCompleteButton}
                  onPress={() => handleCheckCompletion(selectedProgram)}
                >
                  <Text style={styles.markCompleteText}>Mark Complete</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setShowModal(true);
                  setModalType('program');
                  setFormData({ ...selectedProgram });
                }}
              >
                <Icon name="pencil-outline" size={18} color="#374151" />
                <Text style={styles.actionButtonText}>Edit Program</Text>
              </TouchableOpacity>
              
              {selectedProgram && canMarkProgramComplete(selectedProgram) && selectedProgram.status !== 'completed' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => handleCheckCompletion(selectedProgram)}
                >
                  <Icon name="check-circle-outline" size={18} color="#ffffff" />
                  <Text style={[styles.actionButtonText, styles.completeButtonText]}>
                    Mark Complete
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.actionButton, styles.addButtonMain]}
                onPress={() => {
                  setShowModal(true);
                  setModalType('project');
                  setFormData({ status: 'ongoing', year: new Date().getFullYear() });
                }}
              >
                <Icon name="plus" size={18} color="#ffffff" />
                <Text style={[styles.actionButtonText, styles.addButtonText]}>
                  Add Project
                </Text>
              </TouchableOpacity>
            </View>

            {/* Projects List */}
            <View style={styles.projectsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Projects</Text>
              </View>
              
              {!selectedProgram.projects || selectedProgram.projects.length === 0 ? (
                <View style={styles.emptyProjects}>
                  <Icon name="target" size={48} color="#9ca3af" />
                  <Text style={styles.emptyProjectsText}>
                    No projects yet. Add your first project to get started.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={selectedProgram.projects}
                  renderItem={renderProjectItem}
                  keyExtractor={item => item._id}
                  scrollEnabled={false}
                  nestedScrollEnabled={true}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Add Program FAB */}
      {!showModal && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setShowModal(true);
            setModalType('program');
            setFormData({ status: 'ongoing', year: new Date().getFullYear() });
          }}
        >
          <Icon name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Sidebar Modal */}
      <Modal
        visible={showSidebar}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSidebar(false)}
      >
        <SafeAreaView style={styles.sidebarContainer}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Programs</Text>
            <TouchableOpacity onPress={() => setShowSidebar(false)}>
              <Icon name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredPrograms}
            renderItem={renderProgramItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.programList}
            ListEmptyComponent={
              <View style={styles.emptyPrograms}>
                <Text style={styles.emptyProgramsText}>No programs found</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Input Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {formData._id ? 'Edit' : 'Add'} {modalType}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              {modalType === 'program' && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Program Name"
                    value={formData.name || ''}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description"
                    value={formData.description || ''}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={3}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Year"
                    value={formData.year?.toString() || ''}
                    onChangeText={(text) => setFormData({ ...formData, year: parseInt(text) || '' })}
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.statusOptions}>
                    {['upcoming', 'ongoing', 'completed', 'cancelled'].map(status => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          formData.status === status && styles.statusOptionSelected
                        ]}
                        onPress={() => setFormData({ ...formData, status })}
                      >
                        <Text style={[
                          styles.statusOptionText,
                          formData.status === status && styles.statusOptionTextSelected
                        ]}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {modalType === 'project' && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Project Name"
                    value={formData.name || ''}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Year"
                    value={formData.year?.toString() || ''}
                    onChangeText={(text) => setFormData({ ...formData, year: parseInt(text) || '' })}
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.statusOptions}>
                    {['upcoming', 'ongoing', 'completed', 'cancelled'].map(status => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          formData.status === status && styles.statusOptionSelected
                        ]}
                        onPress={() => setFormData({ ...formData, status })}
                      >
                        <Text style={[
                          styles.statusOptionText,
                          formData.status === status && styles.statusOptionTextSelected
                        ]}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {modalType === 'event' && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Event Title"
                    value={formData.title || ''}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description"
                    value={formData.description || ''}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={3}
                  />
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.date || ''}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                    placeholder="YYYY-MM-DD"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Participants"
                    value={formData.participants?.toString() || ''}
                    onChangeText={(text) => setFormData({ ...formData, participants: parseInt(text) || '' })}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Venue"
                    value={formData.venue || ''}
                    onChangeText={(text) => setFormData({ ...formData, venue: text })}
                  />
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.statusOptions}>
                    {['upcoming', 'ongoing', 'completed', 'cancelled'].map(status => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          formData.status === status && styles.statusOptionSelected
                        ]}
                        onPress={() => setFormData({ ...formData, status })}
                      >
                        <Text style={[
                          styles.statusOptionText,
                          formData.status === status && styles.statusOptionTextSelected
                        ]}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Icon name="content-save-outline" size={18} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filtersContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  filtersContent: {
    gap: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  yearScroll: {
    marginTop: 4,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 8,
  },
  yearButtonActive: {
    backgroundColor: '#2563eb',
  },
  yearButtonText: {
    fontSize: 12,
    color: '#374151',
  },
  yearButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  statusScroll: {
    marginTop: 4,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 8,
  },
  statusButtonActive: {
    backgroundColor: '#2563eb',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#374151',
  },
  statusButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 32,
  },
  browseButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsScroll: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  overdueCard: {
    borderColor: '#fbbf24',
    backgroundColor: '#fef3c7',
  },
  overdueValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
  },
  overdueNoteText: {
    fontSize: 11,
    color: '#92400e',
    marginTop: 4,
  },
  overdueAlert: {
    backgroundColor: '#ffedd5',
    borderLeftWidth: 4,
    borderLeftColor: '#ea580c',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  completionAlert: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: '#166534',
  },
  markCompleteButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  markCompleteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  completeButton: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  completeButtonText: {
    color: '#ffffff',
  },
  addButtonMain: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  addButtonText: {
    color: '#ffffff',
  },
  projectsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  emptyProjects: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyProjectsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 200,
  },
  projectCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  projectInfo: {
    flex: 1,
    marginLeft: 8,
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  projectYear: {
    fontSize: 11,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  projectStats: {
    flexDirection: 'row',
    gap: 12,
  },
  projectStat: {
    fontSize: 12,
    color: '#6b7280',
  },
  eventsSection: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  eventStatusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  overdueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 4,
  },
  eventDetails: {
    gap: 6,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#4b5563',
  },
  overdueNote: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
  eventDescription: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  descriptionText: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sidebarContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  programList: {
    padding: 16,
  },
  programItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedProgramItem: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  programName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  programDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  programStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#6b7280',
  },
  emptyPrograms: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyProgramsText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalForm: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  statusOptionSelected: {
    backgroundColor: '#2563eb',
  },
  statusOptionText: {
    fontSize: 12,
    color: '#374151',
  },
  statusOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
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
    flexDirection: 'row',
    gap: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default GADProgramsMobile;