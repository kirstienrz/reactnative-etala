import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import {
  FileText,
  Download,
  Copy,
  Search,
  Filter,
  Eye,
  Mail,
  Flag,
  AlertTriangle,
  BookOpen,
  Save,
  Edit2,
  X,
} from 'lucide-react-native';

const TemplatesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  const [templates, setTemplates] = useState([
    {
      id: 1,
      title: 'Acknowledgment Letter',
      category: 'acknowledgment',
      description: 'Official letter to acknowledge receipt of documents, requests, or communications',
      content: `[Letterhead]

[Date]

[Recipient Name]
[Recipient Position]
[Recipient Address]

Subject: Acknowledgment of [Document/Request Type]

Dear [Recipient Name],

This is to formally acknowledge receipt of your [document/request] dated [Date] regarding [Subject Matter].

We have received the following:
• [List of documents/items received]
• [Additional details]

Please be advised that your [document/request] is now under review and processing. We will notify you of any updates or additional requirements within [timeline].

Should you have any questions or require further assistance, please do not hesitate to contact us at [contact information].

Thank you for your patience and understanding.

Respectfully yours,

[Your Name]
[Your Position]
[Office/Department]`,
      lastUpdated: '2024-12-01',
      usageCount: 45
    },
    {
      id: 2,
      title: 'Referral Letter',
      category: 'referral',
      description: 'Formal letter referring individuals or matters to appropriate offices or personnel',
      content: `[Letterhead]

[Date]

[Recipient Name]
[Recipient Position]
[Recipient Office/Department]
[Recipient Address]

Subject: Referral of [Case/Matter Type]

Dear [Recipient Name],

I am writing to refer to your office the case of [Client Name] regarding [Brief Description of Matter].

Background:
[Provide relevant background information]

Reasons for Referral:
• [Reason 1]
• [Reason 2]
• [Reason 3]

We believe that your office is better equipped to handle this matter due to [justification]. Enclosed are the following documents for your reference:
• [List of enclosed documents]

We would appreciate it if you could provide the necessary assistance and keep us informed of any developments.

Thank you for your cooperation.

Sincerely,

[Your Name]
[Your Position]
[Office/Department]`,
      lastUpdated: '2024-11-28',
      usageCount: 32
    },
    {
      id: 3,
      title: 'Resolution Letter',
      category: 'resolution',
      description: 'Official document stating decisions or resolutions made by the office or committee',
      content: `[Letterhead]

RESOLUTION NO. [Number]
Series of [Year]

A RESOLUTION [Title describing the action]

WHEREAS, [Preamble statement 1];

WHEREAS, [Preamble statement 2];

WHEREAS, [Preamble statement 3];

NOW, THEREFORE, upon motion of [Name of mover], duly seconded by [Name of seconder], be it:

RESOLVED, as it is hereby resolved, that [Main resolution content];

RESOLVED FURTHER, that [Additional directive 1];

RESOLVED FINALLY, that copies of this resolution be furnished to [List of offices/individuals to receive copies] for their information and guidance.

APPROVED this [Date] at [Place].

ATTESTED BY:

_______________________
[Secretary Name]
Secretary

APPROVED BY:

_______________________
[Chairperson Name]
Chairperson`,
      lastUpdated: '2024-12-05',
      usageCount: 28
    },
    {
      id: 4,
      title: 'Incident Summary Report',
      category: 'incident',
      description: 'Structured report documenting incidents, findings, and recommendations',
      content: `INCIDENT SUMMARY REPORT

I. BASIC INFORMATION
Report No: [Report Number]
Date of Incident: [Date]
Time of Incident: [Time]
Location: [Location]
Report Date: [Current Date]
Prepared by: [Your Name/Position]

II. INCIDENT DETAILS
Type of Incident: [Incident Type]
Persons Involved: 
• [Name 1] - [Role]
• [Name 2] - [Role]

Witnesses:
• [Witness 1] - [Contact Information]
• [Witness 2] - [Contact Information]

III. NARRATIVE DESCRIPTION
[Provide detailed chronological account of the incident, including what happened, when, where, and how]

IV. IMMEDIATE ACTIONS TAKEN
• [Action 1]
• [Action 2]
• [Action 3]

V. FINDINGS AND ANALYSIS
[Analysis of the incident, contributing factors, and observations]

VI. RECOMMENDATIONS
• [Recommendation 1]
• [Recommendation 2]
• [Recommendation 3]

VII. ATTACHMENTS
• [List of attached documents/photos/evidence]

_______________________
[Prepared By Signature]
[Prepared By Name]
[Position]`,
      lastUpdated: '2024-11-30',
      usageCount: 51
    }
  ]);

  const categories = [
    { value: 'all', label: 'All', icon: FileText, color: '#3b82f6' },
    { value: 'acknowledgment', label: 'Ack', icon: Mail, color: '#10b981' },
    { value: 'referral', label: 'Referral', icon: Flag, color: '#8b5cf6' },
    { value: 'resolution', label: 'Resolution', icon: BookOpen, color: '#f59e0b' },
    { value: 'incident', label: 'Incident', icon: AlertTriangle, color: '#ef4444' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyTemplate = async (content) => {
    // For React Native, you might need to use a library like @react-native-clipboard/clipboard
    // For now, we'll simulate it
    Alert.alert('Success', 'Template copied to clipboard!');
  };

  const handleDownloadTemplate = (template) => {
    Alert.alert('Download Started', `${template.title} is being downloaded...`);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setEditedContent(template.content);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      const updatedTemplates = templates.map(template =>
        template.id === editingTemplate.id
          ? {
              ...template,
              content: editedContent,
              lastUpdated: new Date().toISOString().split('T')[0],
              usageCount: template.usageCount + 1
            }
          : template
      );
      setTemplates(updatedTemplates);
      setEditingTemplate(null);
      setEditedContent('');
      Alert.alert('Success', 'Template updated successfully!');
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditedContent('');
  };

  const getCategoryColor = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.color : '#3b82f6';
  };

  const renderTemplateItem = ({ item }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={styles.templateTitleContainer}>
          <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
            {React.createElement(categories.find(cat => cat.value === item.category)?.icon || FileText, {
              size: 20,
              color: getCategoryColor(item.category)
            })}
          </View>
          <View style={styles.templateInfo}>
            <Text style={styles.templateTitle}>{item.title}</Text>
            <Text style={styles.templateDescription}>{item.description}</Text>
          </View>
        </View>
        <View style={styles.usageBadge}>
          <Text style={styles.usageText}>{item.usageCount} uses</Text>
        </View>
      </View>

      <View style={styles.templateMeta}>
        <Text style={styles.templateMetaText}>Last updated: {item.lastUpdated}</Text>
        <Text style={[styles.templateMetaText, { textTransform: 'capitalize' }]}>{item.category}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.previewButton]}
          onPress={() => setPreviewTemplate(item)}
        >
          <Eye size={16} color="#4b5563" />
          <Text style={styles.previewButtonText}>Preview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditTemplate(item)}
        >
          <Edit2 size={16} color="#ffffff" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={() => handleDownloadTemplate(item)}
        >
          <Download size={16} color="#ffffff" />
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const { width } = Dimensions.get('window');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <FileText size={28} color="#2563eb" />
            <View>
              <Text style={styles.title}>Official Templates</Text>
              <Text style={styles.subtitle}>
                Pre-built letter templates for official communications
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.exportAllButton}>
            <Download size={16} color="#ffffff" />
            <Text style={styles.exportAllButtonText}>Export All</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Total Templates</Text>
              <Text style={styles.statValue}>{templates.length}</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
              <FileText size={20} color="#2563eb" />
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Most Used</Text>
              <Text style={[styles.statValue, { fontSize: 16 }]}>Incident Report</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
              <AlertTriangle size={20} color="#16a34a" />
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Last Updated</Text>
              <Text style={[styles.statValue, { fontSize: 16 }]}>Dec 5, 2024</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#fed7aa' }]}>
              <FileText size={20} color="#f59e0b" />
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Total Usage</Text>
              <Text style={styles.statValue}>
                {templates.reduce((sum, template) => sum + template.usageCount, 0)}
              </Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
              <Download size={20} color="#8b5cf6" />
            </View>
          </View>
        </ScrollView>

        {/* Filters and Search */}
        <View style={styles.filterCard}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={16} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search templates..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
          >
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.value && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category.value)}
                >
                  <IconComponent 
                    size={16} 
                    color={selectedCategory === category.value ? '#ffffff' : category.color} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category.value && styles.categoryButtonTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Templates List */}
        <FlatList
          data={filteredTemplates}
          renderItem={renderTemplateItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FileText size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No templates found</Text>
              <Text style={styles.emptyStateSubtext}>Try a different search or category</Text>
            </View>
          }
        />

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        visible={!!previewTemplate}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPreviewTemplate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{previewTemplate?.title}</Text>
                <Text style={styles.modalSubtitle}>{previewTemplate?.description}</Text>
              </View>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity
                  style={styles.editModalButton}
                  onPress={() => {
                    handleEditTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  <Edit2 size={16} color="#ffffff" />
                  <Text style={styles.editModalButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setPreviewTemplate(null)}
                >
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Modal Content */}
            <ScrollView style={styles.modalContent}>
              <View style={styles.previewContentContainer}>
                <Text style={styles.previewContent}>
                  {previewTemplate?.content}
                </Text>
              </View>
            </ScrollView>
            
            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setPreviewTemplate(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.copyButton]}
                onPress={() => handleCopyTemplate(previewTemplate?.content)}
              >
                <Copy size={16} color="#ffffff" />
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.downloadModalButton]}
                onPress={() => handleDownloadTemplate(previewTemplate)}
              >
                <Download size={16} color="#ffffff" />
                <Text style={styles.downloadModalButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={!!editingTemplate}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit {editingTemplate?.title}</Text>
                <Text style={styles.modalSubtitle}>Modify the template content as needed</Text>
              </View>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={handleCancelEdit}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Modal Content */}
            <View style={styles.editModalContent}>
              <Text style={styles.textAreaLabel}>Template Content</Text>
              <TextInput
                style={styles.textArea}
                value={editedContent}
                onChangeText={setEditedContent}
                placeholder="Enter template content..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={15}
                textAlignVertical="top"
              />
              
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Template Tips:</Text>
                <Text style={styles.tipsText}>• Use [brackets] for placeholder text</Text>
                <Text style={styles.tipsText}>• Maintain proper formatting and structure</Text>
                <Text style={styles.tipsText}>• Include all necessary sections</Text>
                <Text style={styles.tipsText}>• Save your changes when finished</Text>
              </View>
            </View>
            
            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTemplate}
              >
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  exportAllButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportAllButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    width: 150,
    marginRight: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  templateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  templateTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  usageBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usageText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  templateMetaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  previewButton: {
    backgroundColor: '#f3f4f6',
  },
  previewButtonText: {
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#2563eb',
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
  downloadButton: {
    backgroundColor: '#16a34a',
  },
  downloadButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  editModalButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editModalButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
  closeModalButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  previewContentContainer: {
    padding: 20,
  },
  previewContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  closeButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  copyButton: {
    backgroundColor: '#2563eb',
  },
  copyButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  downloadModalButton: {
    backgroundColor: '#16a34a',
  },
  downloadModalButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  editModalContent: {
    padding: 20,
  },
  textAreaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 200,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  tipsContainer: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 2,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#16a34a',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default TemplatesPage;