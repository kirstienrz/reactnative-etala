import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Modal, FlatList,
  RefreshControl, ActivityIndicator, Alert, Platform, StyleSheet,
  SafeAreaView, StatusBar,
} from "react-native";
import { 
  Search, Filter, Calendar, User, Clock, Archive, Eye, Download,
  Printer, BarChart3, X, MessageSquare, AlertTriangle, ThumbsUp, CheckSquare,
} from "lucide-react-native";
import { Button, SegmentedButtons } from "react-native-paper";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getSuggestions, updateSuggestion, toggleArchive } from "../../api/suggestion";

const AdminGADSuggestionBox = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("active");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => { fetchSuggestions(); }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const data = await getSuggestions();
      setSuggestions(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSuggestions();
    setRefreshing(false);
  };

  const handleArchive = async (id) => {
    Alert.alert("Archive", "Archive this suggestion?", [
      { text: "Cancel", style: "cancel" },
      { text: "Archive", onPress: async () => {
        try {
          await toggleArchive(id);
          await fetchSuggestions();
        } catch (err) {
          Alert.alert("Error", "Failed to archive.");
        }
      }}
    ]);
  };

  const handleUnarchive = async (id) => {
    Alert.alert("Unarchive", "Restore this suggestion?", [
      { text: "Cancel", style: "cancel" },
      { text: "Restore", onPress: async () => {
        try {
          await toggleArchive(id);
          await fetchSuggestions();
        } catch (err) {
          Alert.alert("Error", "Failed to restore.");
        }
      }}
    ]);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const suggestion = suggestions.find(s => s.id === id);
      await updateSuggestion(id, { ...suggestion, status: newStatus });
      await fetchSuggestions();
    } catch (err) {
      Alert.alert("Error", "Failed to update status.");
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    try {
      const suggestion = suggestions.find(s => s.id === id);
      await updateSuggestion(id, { ...suggestion, priority: newPriority });
      await fetchSuggestions();
    } catch (err) {
      Alert.alert("Error", "Failed to update priority.");
    }
  };

  const handleExportCSV = async () => {
    try {
      const html = `<html><body><h1>GAD Suggestions</h1><table border="1"><tr><th>ID</th><th>Text</th><th>By</th><th>Date</th><th>Status</th></tr>${filteredSuggestions.map(s => `<tr><td>${s.id}</td><td>${s.text}</td><td>${s.submittedBy}</td><td>${new Date(s.submittedDate).toLocaleDateString()}</td><td>${s.status}</td></tr>`).join('')}</table></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (err) {
      Alert.alert("Error", "Export failed.");
    }
  };

  const activeSuggestions = suggestions.filter(s => !s.archived);
  const archivedSuggestions = suggestions.filter(s => s.archived);
  const displayedSuggestions = viewMode === "active" ? activeSuggestions : archivedSuggestions;

  let filteredSuggestions = displayedSuggestions.filter((s) => {
    const matchesSearch = s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.submittedBy && s.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => ({
    'pending': '#fef3c7', 'under-review': '#dbeafe', 'approved': '#d1fae5',
    'rejected': '#fee2e2', 'implemented': '#f3e8ff'
  }[status] || '#f3f4f6');

  const getStatusTextColor = (status) => ({
    'pending': '#92400e', 'under-review': '#1e40af', 'approved': '#065f46',
    'rejected': '#991b1b', 'implemented': '#5b21b6'
  }[status] || '#374151');

  const getPriorityColor = (p) => ({ 'high': '#fee2e2', 'medium': '#ffedd5', 'low': '#f3f4f6' }[p] || '#f3f4f6');
  const getPriorityTextColor = (p) => ({ 'high': '#991b1b', 'medium': '#9a3412', 'low': '#374151' }[p] || '#374151');

  const stats = {
    total: activeSuggestions.length,
    pending: activeSuggestions.filter(s => s.status === 'pending').length,
    approved: activeSuggestions.filter(s => s.status === 'approved').length,
    archived: archivedSuggestions.length,
  };

  const SuggestionItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, selectedItems.includes(item.id) && styles.selectedCard]}
      onPress={() => { setSelectedSuggestion(item); setShowDetailModal(true); }}
    >
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); 
          setSelectedItems(p => p.includes(item.id) ? p.filter(i => i !== item.id) : [...p, item.id]); }}>
          <View style={[styles.checkbox, selectedItems.includes(item.id) && styles.checkboxActive]}>
            {selectedItems.includes(item.id) && <CheckSquare size={10} color="#fff" />}
          </View>
        </TouchableOpacity>
        <View style={styles.cardInfo}>
          <View style={styles.cardTop}>
            <Text style={styles.cardId}>#{item.id}</Text>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: getPriorityColor(item.priority) }]}>
                <Text style={[styles.badgeText, { color: getPriorityTextColor(item.priority) }]}>
                  {item.priority.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={[styles.badgeText, { color: getStatusTextColor(item.status) }]}>
                  {item.status.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardText} numberOfLines={2}>{item.text}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.cardUser}>
              <User size={11} color="#64748b" />
              <Text style={styles.cardUserText}>{item.submittedBy || 'Anonymous'}</Text>
            </View>
            <View style={styles.cardDate}>
              <Calendar size={11} color="#64748b" />
              <Text style={styles.cardDateText}>
                {new Date(item.submittedDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.viewBtn} onPress={() => { setSelectedSuggestion(item); setShowDetailModal(true); }}>
          <Eye size={14} color="#3b82f6" />
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.archiveBtn, item.archived && styles.restoreBtn]}
          onPress={(e) => { e.stopPropagation(); item.archived ? handleUnarchive(item.id) : handleArchive(item.id); }}
        >
          <Archive size={14} color={item.archived ? "#10b981" : "#64748b"} />
          <Text style={[styles.archiveBtnText, item.archived && { color: "#10b981" }]}>
            {item.archived ? 'Restore' : 'Archive'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>GAD Suggestion Box</Text>
            <Text style={styles.subtitle}>{stats.total} active • {stats.pending} pending</Text>
          </View>
          <TouchableOpacity style={styles.analyticsBtn} onPress={() => setShowAnalytics(true)}>
            <BarChart3 size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        
        {/* Toggle */}
        <View style={styles.toggleWrapper}>
          <SegmentedButtons
            value={viewMode}
            onValueChange={setViewMode}
            buttons={[
              { value: 'active', label: 'Active' },
              { value: 'archived', label: 'Archived' },
            ]}
            style={styles.toggle}
          />
        </View>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            placeholder="Search..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={14} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} color={showFilters ? "#fff" : "#3b82f6"} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'pending', 'under-review', 'approved', 'rejected'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.filterText, statusFilter === s && styles.filterTextActive]}>
                  {s === 'all' ? 'All' : s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* List Header */}
      <View style={styles.listHeader}>
        <TouchableOpacity style={styles.selectAll} onPress={() => {
          if (selectedItems.length === filteredSuggestions.length) {
            setSelectedItems([]);
          } else {
            setSelectedItems(filteredSuggestions.map(s => s.id));
          }
        }}>
          <View style={[styles.selectCheckbox, selectedItems.length === filteredSuggestions.length && filteredSuggestions.length > 0 && styles.selectCheckboxActive]}>
            {selectedItems.length === filteredSuggestions.length && filteredSuggestions.length > 0 && (
              <CheckSquare size={9} color="#fff" />
            )}
          </View>
          <Text style={styles.selectText}>
            {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select All'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.count}>{filteredSuggestions.length} of {displayedSuggestions.length}</Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredSuggestions}
        renderItem={({ item }) => <SuggestionItem item={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Search size={36} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No suggestions found</Text>
            <Text style={styles.emptyText}>Try adjusting your search</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBtn} onPress={handleExportCSV}>
          <Download size={18} color="#3b82f6" />
          <Text style={styles.bottomBtnText}>Export</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.bottomBtn} onPress={() => Alert.alert("Print", "Coming soon")}>
          <Printer size={18} color="#3b82f6" />
          <Text style={styles.bottomBtnText}>Print</Text>
        </TouchableOpacity>
      </View>

      {/* Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Details</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {selectedSuggestion && (
              <>
                <View style={styles.detailRow}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>ID</Text>
                    <Text style={styles.detailValue}>#{selectedSuggestion.id}</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedSuggestion.submittedDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Status & Priority</Text>
                  <View style={styles.chipRow}>
                    <View style={[styles.chip, { backgroundColor: getStatusColor(selectedSuggestion.status) }]}>
                      <Text style={[styles.chipText, { color: getStatusTextColor(selectedSuggestion.status) }]}>
                        {selectedSuggestion.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Text>
                    </View>
                    <View style={[styles.chip, { backgroundColor: getPriorityColor(selectedSuggestion.priority) }]}>
                      <Text style={[styles.chipText, { color: getPriorityTextColor(selectedSuggestion.priority) }]}>
                        {selectedSuggestion.priority.charAt(0).toUpperCase() + selectedSuggestion.priority.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Submitted By</Text>
                  <View style={styles.userBox}>
                    <User size={16} color="#64748b" />
                    <Text style={styles.userBoxText}>{selectedSuggestion.submittedBy || 'Anonymous'}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Suggestion</Text>
                  <View style={styles.textBox}>
                    <Text style={styles.textBoxContent}>{selectedSuggestion.text}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Update Status</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.btnRow}>
                      {['pending', 'under-review', 'approved', 'rejected', 'implemented'].map(status => (
                        <TouchableOpacity
                          key={status}
                          style={[styles.updateBtn, selectedSuggestion.status === status && styles.updateBtnActive]}
                          onPress={() => handleStatusChange(selectedSuggestion.id, status)}
                        >
                          <Text style={[styles.updateBtnText, selectedSuggestion.status === status && styles.updateBtnTextActive]}>
                            {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Update Priority</Text>
                  <View style={styles.priorityRow}>
                    {['high', 'medium', 'low'].map(priority => (
                      <TouchableOpacity
                        key={priority}
                        style={[styles.priorityBtn, selectedSuggestion.priority === priority && styles.priorityBtnActive]}
                        onPress={() => handlePriorityChange(selectedSuggestion.id, priority)}
                      >
                        <Text style={[styles.priorityBtnText, selectedSuggestion.priority === priority && styles.priorityBtnTextActive]}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button mode="outlined" onPress={() => setShowDetailModal(false)} style={styles.cancelBtn}>
              Close
            </Button>
            <Button mode="contained" onPress={() => {
              selectedSuggestion?.archived ? handleUnarchive(selectedSuggestion.id) : handleArchive(selectedSuggestion.id);
              setShowDetailModal(false);
            }} style={styles.actionBtn}>
              {selectedSuggestion?.archived ? 'Restore' : 'Archive'}
            </Button>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Analytics Modal */}
      <Modal visible={showAnalytics} animationType="slide" presentationStyle="pageSheet"
        onRequestClose={() => setShowAnalytics(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAnalytics(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Analytics</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.analyticsContent}>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <MessageSquare size={22} color="#3b82f6" />
                <Text style={styles.analyticsValue}>{suggestions.length}</Text>
                <Text style={styles.analyticsLabel}>Total</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Clock size={22} color="#f59e0b" />
                <Text style={styles.analyticsValue}>{stats.pending}</Text>
                <Text style={styles.analyticsLabel}>Pending</Text>
              </View>
              <View style={styles.analyticsCard}>
                <ThumbsUp size={22} color="#10b981" />
                <Text style={styles.analyticsValue}>{stats.approved}</Text>
                <Text style={styles.analyticsLabel}>Approved</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Archive size={22} color="#64748b" />
                <Text style={styles.analyticsValue}>{stats.archived}</Text>
                <Text style={styles.analyticsLabel}>Archived</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingTop: Platform.OS === 'ios' ? 8 : 12, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  headerContent: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  analyticsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  toggleWrapper: { paddingHorizontal: 16 },
  toggle: { borderRadius: 8 },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 40, gap: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, fontSize: 14, color: '#1e293b', padding: 0 },
  filterBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  filters: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#f8fafc', borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  filterChipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  filterText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  selectAll: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectCheckbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
  selectCheckboxActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  selectText: { fontSize: 13, color: '#3b82f6', fontWeight: '500' },
  count: { fontSize: 13, color: '#64748b' },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 90 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  selectedCard: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  cardHeader: { flexDirection: 'row', marginBottom: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2 },
  checkboxActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  cardInfo: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardId: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  badges: { flexDirection: 'row', gap: 4 },
  badge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 9, fontWeight: '700' },
  cardText: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', gap: 12 },
  cardUser: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  cardUserText: { fontSize: 11, color: '#64748b' },
  cardDate: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDateText: { fontSize: 11, color: '#64748b' },
  cardActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, marginTop: 2 },
  viewBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', borderRadius: 6, paddingVertical: 7, gap: 4 },
  viewBtnText: { fontSize: 12, color: '#3b82f6', fontWeight: '500' },
  archiveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: 6, paddingVertical: 7, gap: 4 },
  restoreBtn: { backgroundColor: '#f0fdf4' },
  archiveBtnText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#475569', marginTop: 12, marginBottom: 4 },
  emptyText: { fontSize: 13, color: '#94a3b8' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingHorizontal: 16, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  bottomBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  bottomBtnText: { fontSize: 14, color: '#3b82f6', fontWeight: '600' },
  divider: { width: 1, backgroundColor: '#e2e8f0' },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b' },
  modalContent: { padding: 16, paddingBottom: 30 },
  detailRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  detailCol: { flex: 1 },
  detailSection: { marginBottom: 16 },
  detailLabel: { fontSize: 13, fontWeight: '500', color: '#64748b', marginBottom: 6 },
  detailValue: { fontSize: 15, color: '#1e293b', fontWeight: '600' },
  chipRow: { flexDirection: 'row', gap: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  chipText: { fontSize: 13, fontWeight: '600' },
  userBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  userBoxText: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
  textBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  textBoxContent: { fontSize: 14, color: '#475569', lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 8 },
  updateBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#f1f5f9', borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  updateBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  updateBtnText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  updateBtnTextActive: { color: '#fff' },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#f1f5f9', borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  priorityBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  priorityBtnText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  priorityBtnTextActive: { color: '#fff' },
  modalFooter: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  cancelBtn: { flex: 1, height: 44, borderColor: '#cbd5e1' },
  actionBtn: { flex: 1, height: 44, backgroundColor: '#3b82f6' },
  analyticsContent: { padding: 16 },
  analyticsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  analyticsCard: { width: '48%', backgroundColor: '#f8fafc', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  analyticsValue: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginVertical: 6 },
  analyticsLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
});

export default AdminGADSuggestionBox;