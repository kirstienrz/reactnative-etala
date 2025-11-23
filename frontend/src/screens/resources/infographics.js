import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Calendar, RefreshCw } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { getInfographics } from '../../api/infographics'; // GET only

export default function InfographicsViewer() {
  const [infographics, setInfographics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);

  const fetchInfographics = async () => {
    try {
      setLoading(true);
      const data = await getInfographics();
      const arrayData = Array.isArray(data) ? data : [];
      setInfographics(arrayData);

      // compute unique years
      const uniqueYears = [...new Set(arrayData.map(item => item.academicYear))].sort((a,b) => b-a);
      setYears(uniqueYears);
    } catch (error) {
      console.error('Failed to fetch infographics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfographics();
  }, []);

  // Filter by search + year
  const filtered = infographics
    .filter(item =>
      (!selectedYear || item.academicYear === selectedYear) &&
      (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       item.academicYear?.includes(searchQuery))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.uploadDate) - new Date(a.uploadDate);
      if (sortBy === 'oldest') return new Date(a.uploadDate) - new Date(b.uploadDate);
      return 0;
    });

  const renderInfographic = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.yearText}>AY {item.academicYear}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title or year..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Year filter */}
      <Picker
        selectedValue={selectedYear}
        onValueChange={(itemValue) => setSelectedYear(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="All Years" value="" />
        {years.map(year => (
          <Picker.Item key={year} label={`AY ${year}`} value={year} />
        ))}
      </Picker>

      {/* Sort toggle */}
      <Text style={styles.sortText} onPress={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}>
        Sort: {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No infographics found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) =>  item.id ? `${item.id}-${item.academicYear}` : `noid-${index}-${item.academicYear}`}
          renderItem={renderInfographic}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 16 },
  searchInput: { marginHorizontal: 16, backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8, borderColor: '#D1D5DB', borderWidth: 1, marginBottom: 8 },
  picker: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 8 },
  sortText: { marginHorizontal: 16, color: '#2563EB', fontWeight: '500', marginBottom: 16 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', marginHorizontal: 4 },
  image: { width: '100%', height: 120 },
  title: { padding: 6, fontSize: 14, fontWeight: '600', color: '#111827' },
  yearText: { paddingHorizontal: 6, paddingBottom: 6, fontSize: 12, color: '#6B7280' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#6B7280' },
});
