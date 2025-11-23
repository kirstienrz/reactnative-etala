import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Image, TextInput } from 'react-native';
import { getWebinars, getResources } from '../../api/knowledge';

// Helper to extract YouTube video ID
const getYouTubeID = (url) => {
  if (!url) return null;
  const regex = /(?:youtube\.com.*(?:\\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const KnowledgeHub = () => {
  const [activeTab, setActiveTab] = useState('webinars'); // 'webinars' or 'resources'
  const [webinars, setWebinars] = useState([]);
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const w = await getWebinars();
        const r = await getResources();
        setWebinars(w);
        setResources(r);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const filteredWebinars = webinars
    .filter(w => w.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  const filteredResources = resources
    .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Knowledge Hub</Text>
      <Text style={styles.subtitle}>Your learning resource center</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'webinars' && styles.activeTab]}
          onPress={() => setActiveTab('webinars')}
        >
          <Text style={[styles.tabText, activeTab === 'webinars' && styles.activeTabText]}>
            Webinars & Trainings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'resources' && styles.activeTab]}
          onPress={() => setActiveTab('resources')}
        >
          <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>
            Resources
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Content */}
      <ScrollView style={{ flex: 1, marginTop: 10 }}>
        {activeTab === 'webinars' &&
  filteredWebinars.map(item => {
    const videoID = getYouTubeID(item.videoUrl);
    const thumbnail = item.thumbnailUrl || (videoID ? `https://img.youtube.com/vi/${videoID}/hqdefault.jpg` : null);
    return (
      <View
        key={item._id}
        style={styles.card}
      >
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5E7EB' }]}>
            <Text style={{ color: '#6B7280' }}>No Video</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.speaker} — {item.organization}</Text>
          <Text style={styles.cardSubtitle}>{item.date} • {item.duration || 'N/A'}</Text>
          <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>
          {item.videoUrl && <Text style={styles.linkText}>Watch Video</Text>}
        </View>
      </View>
    );
  })
}

        {activeTab === 'resources' &&
          filteredResources.map(item => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              onPress={() => Linking.openURL(item.url)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>Type: {item.type || 'N/A'}</Text>
                <Text style={styles.cardSubtitle}>Size: {item.size}</Text>
                <Text style={styles.cardSubtitle}>Date: {item.date}</Text>
                <Text style={styles.linkText}>Open Resource</Text>
              </View>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 16 },
  tabContainer: { flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#4338CA' },
  tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  activeTabText: { color: '#4338CA', fontWeight: '700' },
  searchInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 8, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 2 },
  thumbnail: { width: '100%', height: 180 },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  cardDescription: { fontSize: 13, color: '#374151', marginBottom: 6 },
  linkText: { fontSize: 13, color: '#4338CA', fontWeight: '600' },
});

export default KnowledgeHub;
