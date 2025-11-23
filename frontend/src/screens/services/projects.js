import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { Calendar, Users, Clock, ChevronDown, ChevronRight, Search } from 'lucide-react-native';
import { getAllPrograms } from '../../api/program';

const UserGADPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [expandedPrograms, setExpandedPrograms] = useState(new Set());
  const [expandedProjects, setExpandedProjects] = useState(new Set());

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await getAllPrograms({
        year: yearFilter !== 'all' ? yearFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      if (response.success) setPrograms(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  const toggleProgram = (programId) => {
    setExpandedPrograms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(programId)) {
        newSet.delete(programId);
      } else {
        newSet.add(programId);
      }
      return newSet;
    });
  };

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allYears = new Set(Object.keys(programsByYear));
    const allPrograms = new Set(filteredPrograms.map(p => p._id));
    const allProjects = new Set();
    filteredPrograms.forEach(p => {
      p.projects?.forEach(proj => allProjects.add(proj._id));
    });
    setExpandedYears(allYears);
    setExpandedPrograms(allPrograms);
    setExpandedProjects(allProjects);
  };

  const collapseAll = () => {
    setExpandedYears(new Set());
    setExpandedPrograms(new Set());
    setExpandedProjects(new Set());
  };

  const StatusBadge = ({ status }) => {
    const config = {
      upcoming: { color: '#F3F4F6', text: '#374151', label: 'Upcoming' },
      ongoing: { color: '#1F2937', text: '#FFFFFF', label: 'Ongoing' },
      completed: { color: '#F3F4F6', text: '#16A34A', label: 'Completed' },
      cancelled: { color: '#F3F4F6', text: '#DC2626', label: 'Cancelled' }
    };
    const conf = config[status] || config.ongoing;
    return (
      <View style={[styles.badge, { backgroundColor: conf.color }]}>
        <Text style={[styles.badgeText, { color: conf.text }]}>{conf.label}</Text>
      </View>
    );
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === 'all' || p.year === parseInt(yearFilter);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesYear && matchesStatus;
    });
  }, [programs, searchTerm, yearFilter, statusFilter]);

  // Group programs by year
  const programsByYear = useMemo(() => {
    const grouped = {};
    filteredPrograms.forEach(program => {
      const year = program.year || 'No Year';
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(program);
    });
    return grouped;
  }, [filteredPrograms]);

  // Sort years in descending order
  const sortedYears = useMemo(() => {
    return Object.keys(programsByYear).sort((a, b) => {
      if (a === 'No Year') return 1;
      if (b === 'No Year') return -1;
      return parseInt(b) - parseInt(a);
    });
  }, [programsByYear]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1F2937" />
        <Text style={styles.loadingText}>Loading programs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GAD Programs</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={expandAll} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Expand All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={collapseAll} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Collapse All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          placeholder="Search programs..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Year</Text>
          <TextInput
            placeholder="All"
            value={yearFilter}
            onChangeText={setYearFilter}
            style={styles.filterInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Status</Text>
          <TextInput
            placeholder="All"
            value={statusFilter}
            onChangeText={setStatusFilter}
            style={styles.filterInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Programs List Grouped by Year */}
      <FlatList
        data={sortedYears}
        keyExtractor={(year) => year.toString()}
        renderItem={({ item: year }) => {
          const isYearExpanded = expandedYears.has(year);
          const yearPrograms = programsByYear[year];
          const programCount = yearPrograms.length;
          const eventCount = yearPrograms.reduce((sum, p) => 
            sum + (p.projects?.reduce((pSum, proj) => pSum + (proj.events?.length || 0), 0) || 0), 0
          );

          return (
            <View style={styles.yearSection}>
              {/* Year Header - Collapsible */}
              <TouchableOpacity 
                style={styles.yearHeader}
                onPress={() => toggleYear(year)}
                activeOpacity={0.7}
              >
                <View style={styles.yearHeaderLeft}>
                  {isYearExpanded ? (
                    <ChevronDown size={22} color="#111827" />
                  ) : (
                    <ChevronRight size={22} color="#111827" />
                  )}
                  <Text style={styles.yearTitle}>{year}</Text>
                </View>
                <Text style={styles.yearStats}>
                  {programCount} program{programCount !== 1 ? 's' : ''} • {eventCount} event{eventCount !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>

              {/* Year Content - Programs */}
              {isYearExpanded && (
                <View style={styles.yearContent}>
                  {yearPrograms.map(program => {
                    const isExpanded = expandedPrograms.has(program._id);
                    const projectCount = program.projects?.length || 0;
                    const programEventCount = program.projects?.reduce((sum, p) => sum + (p.events?.length || 0), 0) || 0;

                    return (
                      <View key={program._id} style={styles.programCard}>
                        {/* Program Header - Collapsible */}
                        <TouchableOpacity 
                          style={styles.programHeader} 
                          onPress={() => toggleProgram(program._id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.programHeaderLeft}>
                            {isExpanded ? (
                              <ChevronDown size={20} color="#374151" />
                            ) : (
                              <ChevronRight size={20} color="#374151" />
                            )}
                            <View style={styles.programInfo}>
                              <Text style={styles.programTitle}>{program.name}</Text>
                              <Text style={styles.programStats}>
                                {projectCount} project{projectCount !== 1 ? 's' : ''} • {programEventCount} event{programEventCount !== 1 ? 's' : ''}
                              </Text>
                            </View>
                          </View>
                          <StatusBadge status={program.status} />
                        </TouchableOpacity>

                        {/* Program Content - Expandable */}
                        {isExpanded && (
                          <View style={styles.programContent}>
                            {program.description && (
                              <Text style={styles.programDesc}>{program.description}</Text>
                            )}

                            {/* Projects */}
                            {program.projects?.map(project => {
                              const isProjectExpanded = expandedProjects.has(project._id);
                              const projectEventCount = project.events?.length || 0;

                              return (
                                <View key={project._id} style={styles.projectCard}>
                                  {/* Project Header - Collapsible */}
                                  <TouchableOpacity 
                                    style={styles.projectHeader}
                                    onPress={() => toggleProject(project._id)}
                                    activeOpacity={0.7}
                                  >
                                    <View style={styles.projectHeaderLeft}>
                                      {isProjectExpanded ? (
                                        <ChevronDown size={16} color="#6B7280" />
                                      ) : (
                                        <ChevronRight size={16} color="#6B7280" />
                                      )}
                                      <Text style={styles.projectTitle}>{project.name}</Text>
                                    </View>
                                    <View style={styles.projectHeaderRight}>
                                      <Text style={styles.projectYear}>{project.year}</Text>
                                      <Text style={styles.projectEventCount}>{projectEventCount} event{projectEventCount !== 1 ? 's' : ''}</Text>
                                    </View>
                                  </TouchableOpacity>

                                  {/* Project Events - Expandable */}
                                  {isProjectExpanded && project.events?.length > 0 && (
                                    <View style={styles.eventsContainer}>
                                      {project.events.map(event => (
                                        <View key={event._id} style={styles.eventCard}>
                                          <View style={styles.eventHeader}>
                                            <Text style={styles.eventTitle}>{event.title}</Text>
                                            <StatusBadge status={event.status} />
                                          </View>
                                          
                                          <View style={styles.eventDetails}>
                                            <View style={styles.eventDetail}>
                                              <Calendar size={14} color="#6B7280" />
                                              <Text style={styles.eventDetailText}>{event.date}</Text>
                                            </View>
                                            
                                            <View style={styles.eventDetail}>
                                              <Users size={14} color="#6B7280" />
                                              <Text style={styles.eventDetailText}>{event.participants} participants</Text>
                                            </View>
                                            
                                            <View style={styles.eventDetail}>
                                              <Clock size={14} color="#6B7280" />
                                              <Text style={styles.eventDetailText}>{event.venue}</Text>
                                            </View>
                                          </View>
                                        </View>
                                      ))}
                                    </View>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280'
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827'
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12
  },
  filterItem: {
    flex: 1
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    color: '#111827'
  },
  listContent: {
    padding: 20,
    paddingTop: 0
  },
  yearSection: {
    marginBottom: 16
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 2
  },
  yearHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  yearStats: {
    fontSize: 13,
    color: '#D1D5DB',
    fontWeight: '500'
  },
  yearContent: {
    paddingLeft: 8,
    gap: 10
  },
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden'
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FAFAFA'
  },
  programHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10
  },
  programInfo: {
    flex: 1
  },
  programTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2
  },
  programStats: {
    fontSize: 12,
    color: '#6B7280'
  },
  programContent: {
    padding: 14,
    paddingTop: 10
  },
  programDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden'
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB'
  },
  projectHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8
  },
  projectHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1
  },
  projectYear: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  projectEventCount: {
    fontSize: 11,
    color: '#6B7280'
  },
  eventsContainer: {
    padding: 12,
    paddingTop: 8,
    gap: 8
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8
  },
  eventDetails: {
    gap: 6
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  eventDetailText: {
    fontSize: 13,
    color: '#6B7280'
  }
});

export default UserGADPrograms;