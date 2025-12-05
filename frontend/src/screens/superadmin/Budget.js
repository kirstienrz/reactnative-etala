import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const BudgetProgramsDashboardMobile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [excelData, setExcelData] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sample data
  const budgetStats = [
    { label: 'Total Budget', value: '₱2.5M', change: '+12%', color: '#2563eb', icon: 'cash-multiple' },
    { label: 'Utilized', value: '₱1.8M', change: '+8%', color: '#16a34a', icon: 'chart-box' },
    { label: 'Remaining', value: '₱700K', change: '-5%', color: '#ea580c', icon: 'wallet-outline' },
    { label: 'Programs', value: '15', change: '+3', color: '#9333ea', icon: 'clipboard-list' }
  ];

  const recentPrograms = [
    { id: 'p1', name: 'Gender Mainstreaming', budget: '₱500K', spent: '₱350K', progress: 70 },
    { id: 'p2', name: 'Women Empowerment', budget: '₱800K', spent: '₱600K', progress: 75 },
    { id: 'p3', name: 'Capacity Building', budget: '₱300K', spent: '₱150K', progress: 50 },
    { id: 'p4', name: 'Research & Development', budget: '₱400K', spent: '₱200K', progress: 50 },
  ];

  const reports = [
    { id: 'r1', title: 'Quarterly Budget Report', date: 'Dec 2024', type: 'PDF' },
    { id: 'r2', title: 'Program Expenditure', date: 'Nov 2024', type: 'Excel' },
    { id: 'r3', title: 'Annual Budget Summary', date: 'Jan 2025', type: 'PDF' },
    { id: 'r4', title: 'GAD Budget Allocation', date: 'Oct 2024', type: 'Excel' },
    { id: 'r5', title: 'Financial Audit', date: 'Sep 2024', type: 'PDF' },
    { id: 'r6', title: 'Program Performance', date: 'Aug 2024', type: 'Excel' }
  ];

  const handleFileUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ],
      });

      if (res.type === 'success') {
        setSelectedFileName(res.name);
        setUploadProgress(30);

        const fileContent = await FileSystem.readAsStringAsync(res.uri, { encoding: FileSystem.EncodingType.Base64 });
        setUploadProgress(70);

        const workbook = XLSX.read(fileContent, { type: 'base64' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        setExcelData(jsonData);
        setUploadProgress(100);
        setShowPreview(true);

        setTimeout(() => setUploadProgress(0), 1000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleExportReport = () => {
    alert('Export feature not implemented yet.');
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      {budgetStats.map((stat) => (
        <View key={stat.label} style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
              <Icon name={stat.icon} size={20} color={stat.color} />
            </View>
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={[styles.statChange, { color: stat.change.startsWith('+') ? '#16a34a' : '#dc2626' }]}>
            {stat.change} from last month
          </Text>
        </View>
      ))}
    </View>
  );

  const renderProgramItem = ({ item }) => (
    <View key={item.id} style={styles.programCard}>
      <View style={styles.programHeader}>
        <Text style={styles.programName} numberOfLines={1}>{item.name}</Text>
        <Icon name="chevron-right" size={20} color="#2563eb" />
      </View>
      <View style={styles.programStats}>
        <View style={styles.budgetInfo}>
          <Text style={styles.budgetLabel}>Budget</Text>
          <Text style={styles.budgetValue}>{item.budget}</Text>
        </View>
        <View style={styles.budgetInfo}>
          <Text style={styles.budgetLabel}>Spent</Text>
          <Text style={styles.budgetValue}>{item.spent}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
      </View>
    </View>
  );

  const renderReportItem = ({ item }) => (
    <View key={item.id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Icon name="file-document-outline" size={24} color="#2563eb" />
        <View style={[styles.reportTypeBadge, { backgroundColor: item.type === 'PDF' ? '#fef3c7' : '#dbeafe' }]}>
          <Text style={[styles.reportTypeText, { color: item.type === 'PDF' ? '#92400e' : '#1e40af' }]}>{item.type}</Text>
        </View>
      </View>
      <Text style={styles.reportTitle}>{item.title}</Text>
      <View style={styles.reportFooter}>
        <Text style={styles.reportDate}>{item.date}</Text>
        <TouchableOpacity style={styles.downloadButton}>
          <Icon name="download-outline" size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDataPreview = () => {
    if (!excelData.length) return null;
    const columns = Object.keys(excelData[0]);
    const sampleData = excelData.slice(0, 5);

    return (
      <Modal visible={showPreview} animationType="slide" transparent={true} onRequestClose={() => setShowPreview(false)}>
        <View style={styles.previewModal}>
          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Data Preview</Text>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.tableHeader}>
                  {columns.map((col) => (
                    <View key={col} style={styles.tableHeaderCell}>
                      <Text style={styles.tableHeaderText}>{col}</Text>
                    </View>
                  ))}
                </View>
                {sampleData.map((row, idx) => (
                  <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                    {columns.map((col) => (
                      <View key={col} style={styles.tableCell}>
                        <Text style={styles.tableCellText}>{row[col] || '-'}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.confirmButton} onPress={() => setShowPreview(false)}>
              <Text style={styles.confirmButtonText}>Confirm Import</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.titleRow}>
              <Icon name="cash-multiple" size={28} color="#2563eb" />
              <Text style={styles.title}>Budget & Programs</Text>
            </View>
            <Text style={styles.subtitle}>Manage and track program budgets</Text>
          </View>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
            <Icon name="tray-arrow-down" size={18} color="#ffffff" />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {[
            { key: 'overview', label: 'Overview', icon: 'chart-box-outline' },
            { key: 'budgetUpload', label: 'Upload', icon: 'cloud-upload-outline' },
            { key: 'reports', label: 'Reports', icon: 'file-document-outline' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Icon name={tab.icon} size={16} color={activeTab === tab.key ? '#ffffff' : '#6b7280'} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {renderStats()}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Programs</Text>
              </View>
              <FlatList
                data={recentPrograms}
                renderItem={renderProgramItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          </View>
        )}

        {activeTab === 'budgetUpload' && (
          <View style={styles.tabContent}>
            <View style={styles.uploadCard}>
              <Text style={styles.uploadTitle}>Upload Budget File</Text>
              <Text style={styles.uploadSubtitle}>Upload Excel files (.xlsx, .xls) containing budget data</Text>

              <TouchableOpacity style={styles.uploadArea} onPress={handleFileUpload}>
                <Icon name="cloud-upload-outline" size={48} color="#9ca3af" />
                <Text style={styles.uploadAreaTitle}>Tap to upload Excel file</Text>
                {selectedFileName ? <Text style={styles.fileNameText}>{selectedFileName}</Text> : null}
                {uploadProgress > 0 && <Text>{uploadProgress}%</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'reports' && (
          <View style={styles.tabContent}>
            <FlatList
              data={reports}
              renderItem={renderReportItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.reportsGrid}
            />
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (activeTab === 'budgetUpload') handleFileUpload();
          else handleExportReport();
        }}
      >
        <Icon
          name={activeTab === 'budgetUpload' ? 'upload' : 'plus'}
          size={24}
          color="#ffffff"
        />
      </TouchableOpacity>

      {/* Data Preview Modal */}
      {renderDataPreview()}
    </SafeAreaView>
  );
};

// --- Styles (keep your previous styles as-is, or merge) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 80 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6b7280' },
  exportButton: { backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  exportButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  tabsContainer: { marginBottom: 20 },
  tabButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  activeTabButton: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  activeTabText: { color: '#fff' },
  tabContent: { gap: 16 },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flex: 1, minWidth: width * 0.43, borderWidth: 1, borderColor: '#e5e7eb' },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#6b7280', flex: 1 },
  statIconContainer: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  statChange: { fontSize: 10, fontWeight: '600' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  programCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 },
  programHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  programName: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
  programStats: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  budgetInfo: { flex: 1 },
  budgetLabel: { fontSize: 11, color: '#6b7280', marginBottom: 2 },
  budgetValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  progressContainer: { gap: 6 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 11, color: '#6b7280' },
  progressValue: { fontSize: 11, fontWeight: '600', color: '#111827' },
  progressBar: { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 2 },
  uploadCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 },
  uploadTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  uploadSubtitle: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
  uploadArea: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 12, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 8 },
  uploadAreaTitle: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  fileNameText: { fontSize: 12, color: '#111827', marginTop: 2 },
  reportCard: { backgroundColor: '#fff', flex: 1, minWidth: width * 0.43, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reportTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  reportTypeText: { fontSize: 10, fontWeight: '600' },
  reportTitle: { fontSize: 12, fontWeight: '600', color: '#111827', marginBottom: 4 },
  reportFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportDate: { fontSize: 10, color: '#6b7280' },
  downloadButton: { padding: 4 },
  reportsGrid: { justifyContent: 'space-between' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#2563eb', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  previewModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  previewContent: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '80%' },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  previewTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e5e7eb' },
  tableHeaderCell: { padding: 8, minWidth: 100, borderRightWidth: 1, borderColor: '#d1d5db' },
  tableHeaderText: { fontSize: 12, fontWeight: '600', color: '#111827' },
  tableRow: { flexDirection: 'row' },
  tableRowEven: { backgroundColor: '#f9fafb' },
  tableCell: { padding: 8, minWidth: 100, borderRightWidth: 1, borderColor: '#d1d5db' },
  tableCellText: { fontSize: 12, color: '#111827' },
  confirmButton: { marginTop: 12, backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontWeight: '600' }
});

export default BudgetProgramsDashboardMobile;
