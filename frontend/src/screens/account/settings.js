import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import {
  Bell,
  Shield,
  FileText,
  Trash2,
  Info,
  ChevronRight,
  Eye,
  Globe,
  X,
} from 'lucide-react-native';

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reportReminders, setReportReminders] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const toggleNotifications = () => setNotificationsEnabled((prev) => !prev);
  const toggleEmailNotifications = () => setEmailNotifications((prev) => !prev);
  const toggleReportReminders = () => setReportReminders((prev) => !prev);
  const togglePrivacyMode = () => setPrivacyMode((prev) => !prev);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear app cache? This will remove temporary files and may require re-downloading some content.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your preferences</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                  <Bell size={20} color="#4338CA" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive updates and announcements
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
                thumbColor={notificationsEnabled ? '#4338CA' : '#F3F4F6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Globe size={20} color="#059669" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Get important updates via email
                  </Text>
                </View>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={toggleEmailNotifications}
                trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
                thumbColor={emailNotifications ? '#4338CA' : '#F3F4F6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <FileText size={20} color="#D97706" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Report Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Reminders for pending reports
                  </Text>
                </View>
              </View>
              <Switch
                value={reportReminders}
                onValueChange={toggleReportReminders}
                trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
                thumbColor={reportReminders ? '#4338CA' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#FCE7F3' }]}>
                  <Eye size={20} color="#DB2777" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Privacy Mode</Text>
                  <Text style={styles.settingDescription}>
                    Hide sensitive information
                  </Text>
                </View>
              </View>
              <Switch
                value={privacyMode}
                onValueChange={togglePrivacyMode}
                trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
                thumbColor={privacyMode ? '#4338CA' : '#F3F4F6'}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setPrivacyModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                  <Shield size={20} color="#4338CA" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                  <Text style={styles.settingDescription}>
                    How we handle your data
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setTermsModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
                  <FileText size={20} color="#2563EB" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Terms of Service</Text>
                  <Text style={styles.settingDescription}>
                    Usage terms and conditions
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Data</Text>
          
          <View style={styles.settingCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleClearCache}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                  <Trash2 size={20} color="#DC2626" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Clear Cache</Text>
                  <Text style={styles.settingDescription}>
                    Free up storage space
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>


        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>GAD Portal v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            © 2025 Gender and Development Office
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity
                onPress={() => setPrivacyModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
              <Text style={styles.modalSectionTitle}>1. Information Collection</Text>
              <Text style={styles.modalText}>
                The GAD Portal collects personal information including your name, email address, 
                student/employee ID, and department affiliation. We collect this information when 
                you register for an account, submit reports, or interact with portal features.
              </Text>

              <Text style={styles.modalSectionTitle}>2. Use of Information</Text>
              <Text style={styles.modalText}>
                We use your information to:{'\n'}
                • Provide and maintain GAD Portal services{'\n'}
                • Process and respond to incident reports{'\n'}
                • Send notifications about GAD activities and updates{'\n'}
                • Improve our services and user experience{'\n'}
                • Ensure compliance with institutional policies
              </Text>

              <Text style={styles.modalSectionTitle}>3. Data Protection</Text>
              <Text style={styles.modalText}>
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. All sensitive 
                data is encrypted and stored securely on institutional servers.
              </Text>

              <Text style={styles.modalSectionTitle}>4. Information Sharing</Text>
              <Text style={styles.modalText}>
                Your personal information will only be shared with authorized GAD Office personnel 
                and relevant institutional authorities when necessary for processing reports or 
                addressing GAD-related concerns. We do not sell or share your information with 
                third parties.
              </Text>

              <Text style={styles.modalSectionTitle}>5. Confidentiality</Text>
              <Text style={styles.modalText}>
                We maintain strict confidentiality protocols for all incident reports and sensitive 
                information. Access is limited to authorized personnel on a need-to-know basis.
              </Text>

              <Text style={styles.modalSectionTitle}>6. Your Rights</Text>
              <Text style={styles.modalText}>
                You have the right to:{'\n'}
                • Access your personal information{'\n'}
                • Request corrections to your data{'\n'}
                • Withdraw consent for non-essential communications{'\n'}
                • Request deletion of your account (subject to record-keeping requirements)
              </Text>

              <Text style={styles.modalSectionTitle}>7. Data Retention</Text>
              <Text style={styles.modalText}>
                We retain your information for as long as necessary to fulfill the purposes outlined 
                in this policy, comply with legal obligations, and maintain records as required by 
                institutional policies.
              </Text>

              <Text style={styles.modalSectionTitle}>8. Changes to Privacy Policy</Text>
              <Text style={styles.modalText}>
                We may update this privacy policy periodically. Users will be notified of significant 
                changes through the portal or email.
              </Text>

              <Text style={styles.modalSectionTitle}>9. Contact</Text>
              <Text style={styles.modalText}>
                For questions about this privacy policy or data protection practices, contact the 
                GAD Office through the portal's support channels.
              </Text>

              <Text style={styles.modalFooter}>
                Last Updated: January 2025
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={termsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms of Service</Text>
              <TouchableOpacity
                onPress={() => setTermsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
              <Text style={styles.modalSectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.modalText}>
                By accessing and using the GAD Portal, you agree to be bound by these Terms of Service 
                and all applicable institutional policies. If you do not agree to these terms, please 
                do not use the portal.
              </Text>

              <Text style={styles.modalSectionTitle}>2. Eligibility</Text>
              <Text style={styles.modalText}>
                The GAD Portal is available to current students, faculty, and staff of the institution. 
                Users must register with their official institutional email address and maintain active 
                enrollment or employment status.
              </Text>

              <Text style={styles.modalSectionTitle}>3. User Responsibilities</Text>
              <Text style={styles.modalText}>
                You agree to:{'\n'}
                • Provide accurate and complete information{'\n'}
                • Maintain the confidentiality of your account credentials{'\n'}
                • Use the portal only for its intended purposes{'\n'}
                • Report incidents truthfully and in good faith{'\n'}
                • Respect the confidentiality of others{'\n'}
                • Comply with all institutional policies and applicable laws
              </Text>

              <Text style={styles.modalSectionTitle}>4. Prohibited Activities</Text>
              <Text style={styles.modalText}>
                Users shall not:{'\n'}
                • Submit false or misleading reports{'\n'}
                • Use the portal to harass, defame, or harm others{'\n'}
                • Attempt to access unauthorized areas or data{'\n'}
                • Share login credentials with others{'\n'}
                • Disrupt or interfere with portal operations{'\n'}
                • Use the portal for commercial purposes
              </Text>

              <Text style={styles.modalSectionTitle}>5. Incident Reporting</Text>
              <Text style={styles.modalText}>
                All incident reports should be submitted in good faith. False reports may result in 
                disciplinary action. The GAD Office will investigate reports in accordance with 
                institutional procedures and applicable laws.
              </Text>

              <Text style={styles.modalSectionTitle}>6. Confidentiality</Text>
              <Text style={styles.modalText}>
                While we strive to maintain confidentiality, users understand that certain information 
                may need to be shared with authorized personnel for investigation and resolution purposes. 
                Complete anonymity cannot be guaranteed in all situations.
              </Text>

              <Text style={styles.modalSectionTitle}>7. Content and Resources</Text>
              <Text style={styles.modalText}>
                All content, resources, and materials provided through the portal are for educational 
                and informational purposes. Users may not reproduce, distribute, or modify portal 
                content without authorization.
              </Text>

              <Text style={styles.modalSectionTitle}>8. Account Termination</Text>
              <Text style={styles.modalText}>
                The institution reserves the right to suspend or terminate user accounts for violations 
                of these terms, institutional policies, or upon separation from the institution.
              </Text>

              <Text style={styles.modalSectionTitle}>9. Disclaimer</Text>
              <Text style={styles.modalText}>
                The portal is provided "as is" without warranties of any kind. While we strive to 
                maintain accuracy and availability, we do not guarantee uninterrupted service or 
                error-free operation.
              </Text>

              <Text style={styles.modalSectionTitle}>10. Limitation of Liability</Text>
              <Text style={styles.modalText}>
                The institution shall not be liable for any damages arising from use of the portal, 
                including but not limited to direct, indirect, incidental, or consequential damages.
              </Text>

              <Text style={styles.modalSectionTitle}>11. Changes to Terms</Text>
              <Text style={styles.modalText}>
                We reserve the right to modify these terms at any time. Users will be notified of 
                significant changes. Continued use of the portal after changes constitutes acceptance 
                of the modified terms.
              </Text>

              <Text style={styles.modalSectionTitle}>12. Governing Law</Text>
              <Text style={styles.modalText}>
                These terms are governed by applicable institutional policies and Philippine law. 
                Disputes shall be resolved in accordance with institutional grievance procedures.
              </Text>

              <Text style={styles.modalSectionTitle}>13. Contact</Text>
              <Text style={styles.modalText}>
                For questions about these terms, contact the GAD Office through the portal's 
                support channels or visit the GAD Office during business hours.
              </Text>

              <Text style={styles.modalFooter}>
                Last Updated: January 2025
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setTermsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  spacer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalFooter: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4338CA',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});