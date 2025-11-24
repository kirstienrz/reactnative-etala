import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronDown, ChevronRight, Calendar, Search } from 'lucide-react-native';
import { getInfographics } from '../../api/infographics';

export default function InfographicsViewer() {
  const [infographics, setInfographics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState({});

  const fetchInfographics = async () => {
    try {
      setLoading(true);
      const data = await getInfographics();
      const arrayData = Array.isArray(data) ? data : [];
      setInfographics(arrayData);

      // Auto-expand first year
      const uniqueYears = [...new Set(arrayData.map(item => item.academicYear))].sort((a,b) => b-a);
      if (uniqueYears.length > 0) {
        setExpandedYears({ [uniqueYears[0]]: true });
      }
    } catch (error) {
      console.error('Failed to fetch infographics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfographics();
  }, []);

  // Toggle year expansion
  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  // Group by year
  const groupedData = infographics
    .filter(item =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.academicYear?.includes(searchQuery)
    )
    .reduce((acc, item) => {
      const year = item.academicYear || 'Unknown';
      if (!acc[year]) acc[year] = [];
      acc[year].push(item);
      return acc;
    }, {});

  // Sort years
  const sortedYears = Object.keys(groupedData).sort((a, b) => {
    if (sortBy === 'newest') return b.localeCompare(a);
    return a.localeCompare(b);
  });

  const renderInfographic = (item) => (
    <View key={item.id || item._id} style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.dateContainer}>
          <Calendar size={12} color="#6B7280" />
          <Text style={styles.dateText}>
            {new Date(item.uploadDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F2937" />
        <Text style={styles.loadingText}>Loading infographics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Infographics</Text>
        <Text style={styles.headerSubtitle}>{infographics.length} total items</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or year..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Sort Toggle */}
      <TouchableOpacity 
        style={styles.sortButton}
        onPress={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
      >
        <Text style={styles.sortText}>
          Sort: {sortBy === 'newest' ? '📅 Newest First' : '📅 Oldest First'}
        </Text>
      </TouchableOpacity>

      {/* Collapsible Years */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sortedYears.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No infographics found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search</Text>
          </View>
        ) : (
          sortedYears.map(year => {
            const items = groupedData[year];
            const isExpanded = expandedYears[year];

            return (
              <View key={year} style={styles.yearSection}>
                {/* Year Header */}
                <TouchableOpacity 
                  style={styles.yearHeader}
                  onPress={() => toggleYear(year)}
                  activeOpacity={0.7}
                >
                  <View style={styles.yearHeaderLeft}>
                    {isExpanded ? (
                      <ChevronDown size={20} color="#374151" />
                    ) : (
                      <ChevronRight size={20} color="#374151" />
                    )}
                    <Text style={styles.yearTitle}> Year {year}</Text>
                  </View>
                  <View style={styles.yearBadge}>
                    <Text style={styles.yearBadgeText}>{items.length}</Text>
                  </View>
                </TouchableOpacity>

                {/* Infographics Grid */}
                {isExpanded && (
                  <View style={styles.gridContainer}>
                    {items.map(item => renderInfographic(item))}
                  </View>
                )}
              </View>
            );
          })
        )}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    padding: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827'
  },
  sortButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'flex-start'
  },
  sortText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 14
  },
  scrollView: {
    flex: 1
  },
  yearSection: {
    marginBottom: 12
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB'
  },
  yearHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  yearTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  yearBadge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center'
  },
  yearBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: '#F9FAFB',
    gap: 12
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3F4F6'
  },
  cardContent: {
    padding: 10
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 18
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4
  },
  bottomSpacing: {
    height: 20
  }
});