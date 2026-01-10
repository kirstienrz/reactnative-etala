import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const Research = () => {
  const researchPapers = [
    {
      id: '1',
      title: 'Gender Equality in Workplace',
      author: 'Dr. Maria Santos',
      year: '2023',
      category: 'Social Research',
    },
    {
      id: '2',
      title: 'Economic Impact Analysis',
      author: 'Prof. Juan Dela Cruz',
      year: '2022',
      category: 'Economic Study',
    },
    {
      id: '3',
      title: 'Educational Access Study',
      author: 'Dr. Anna Reyes',
      year: '2023',
      category: 'Education',
    },
    {
      id: '4',
      title: 'Health Disparities Report',
      author: 'Dr. Robert Lim',
      year: '2022',
      category: 'Public Health',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Research</Text>
        <Text style={styles.subtitle}>Academic papers and studies</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Total Papers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>This Year</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Recent Research Papers</Text>
        
        {researchPapers.map(paper => (
          <TouchableOpacity key={paper.id} style={styles.paperCard}>
            <View style={styles.paperHeader}>
              <Text style={styles.paperTitle}>{paper.title}</Text>
              <Text style={styles.paperYear}>{paper.year}</Text>
            </View>
            <Text style={styles.paperAuthor}>By: {paper.author}</Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{paper.category}</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Upload New Research</Text>
          <Text style={styles.uploadText}>
            Submit your research papers, studies, and academic work for publication.
          </Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload Paper</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1F2937',
  },
  paperCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paperTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 10,
  },
  paperYear: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paperAuthor: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 10,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  uploadCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Research;