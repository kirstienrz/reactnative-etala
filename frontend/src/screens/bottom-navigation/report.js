import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';

// Simple icon components using View and Text
const Icon = ({ name, size = 24, color = '#000' }) => {
  const icons = {
    'arrow-left': '←',
    'check': '✓',
    'alert': '⚠',
    'user': '👤',
    'user-x': '🚫',
    'upload': '↑',
    'x': '✕',
    'image': '🖼',
    'video': '🎥',
  };
  
  return (
    <Text style={{ fontSize: size, color, lineHeight: size }}>
      {icons[name] || '•'}
    </Text>
  );
};

const ReportScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnonymous, setIsAnonymous] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    // Reporter Info (for identified reports)
    fullName: '',
    role: '',
    college: '',
    gender: '',
    contactEmail: '',
    contactPhone: '',
    emergencyContact: '',
    allowContact: false,
    
    // Anonymous Reporter Info
    reporterRole: '',
    tupRole: '',
    anonymousGender: '',
    anonymousDepartment: '',
    
    // Incident Details
    incidentDate: '',
    incidentTime: '',
    incidentPlace: '',
    incidentTypes: [],
    incidentDescription: '',
    witnesses: '',
    
    // Perpetrator Info
    perpetratorName: '',
    perpetratorRole: '',
    perpetratorRelationship: '',
    
    // Support & Attachments
    reportedElsewhere: '',
    reportedWhere: '',
    supportNeeded: [],
    preferredContact: '',
    attachments: [],
    additionalNotes: '',
    
    // Confirmation
    confirmAccuracy: false,
    confirmConfidentiality: false,
  });

  const totalSteps = isAnonymous === null ? 1 : isAnonymous ? 6 : 7;

  useEffect(() => {
    loadSavedProgress();
  }, []);

  const loadSavedProgress = async () => {
    try {
      const saved = await SecureStore.getItemAsync('reportProgress');
      if (saved) {
        const data = JSON.parse(saved);
        setFormData(data.formData);
        setIsAnonymous(data.isAnonymous);
        setCurrentStep(data.currentStep);
        setSavedProgress(true);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const progressData = {
        formData,
        isAnonymous,
        currentStep,
        savedAt: new Date().toISOString(),
      };
      await SecureStore.setItemAsync('reportProgress', JSON.stringify(progressData));
      setSavedProgress(true);
      Alert.alert('Progress Saved', 'Your report progress has been saved.');
    } catch (error) {
      console.error('Error saving progress:', error);
      Alert.alert('Error', 'Failed to save progress.');
    }
  };

  const clearProgress = async () => {
    try {
      await SecureStore.deleteItemAsync('reportProgress');
      setSavedProgress(false);
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAttachments = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        fileName: asset.fileName || `attachment_${Date.now()}`,
      }));
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments],
      }));
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const toggleIncidentType = (type) => {
    setFormData(prev => ({
      ...prev,
      incidentTypes: prev.incidentTypes.includes(type)
        ? prev.incidentTypes.filter(t => t !== type)
        : [...prev.incidentTypes, type],
    }));
  };

  const toggleSupportType = (type) => {
    setFormData(prev => ({
      ...prev,
      supportNeeded: prev.supportNeeded.includes(type)
        ? prev.supportNeeded.filter(t => t !== type)
        : [...prev.supportNeeded, type],
    }));
  };

  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `ETALA-${isAnonymous ? 'ANON' : 'ID'}-${year}${month}-${random}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const ticketNumber = generateTicketNumber();
      
      // Clear saved progress
      await clearProgress();
      
      // Show success with ticket number
      Alert.alert(
        'Report Submitted Successfully',
        `Your report has been received.\n\nTicket Number: ${ticketNumber}\n\nPlease save this number for tracking your report.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    if (currentStep === 1 && isAnonymous === null) {
      Alert.alert('Required', 'Please select reporting mode.');
      return false;
    }
    
    if (currentStep === 2) {
      if (isAnonymous) {
        if (!formData.reporterRole || !formData.tupRole) {
          Alert.alert('Required', 'Please fill in all required fields.');
          return false;
        }
      } else {
        if (!formData.fullName || !formData.role || !formData.contactEmail) {
          Alert.alert('Required', 'Please fill in all required fields.');
          return false;
        }
      }
    }
    
    if ((isAnonymous && currentStep === 3) || (!isAnonymous && currentStep === 3)) {
      if (!formData.incidentDate || !formData.incidentPlace || formData.incidentTypes.length === 0 || !formData.incidentDescription) {
        Alert.alert('Required', 'Please fill in all required incident details.');
        return false;
      }
    }
    
    if ((isAnonymous && currentStep === 6) || (!isAnonymous && currentStep === 7)) {
      if (!formData.confirmAccuracy || !formData.confirmConfidentiality) {
        Alert.alert('Required', 'Please confirm all statements before submitting.');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
    </View>
  );

  const renderAnonymitySelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Reporting Mode</Text>
      <Text style={styles.stepSubtitle}>Select how you want to submit your report</Text>
      
      <TouchableOpacity
        style={[styles.anonymityCard, isAnonymous === true && styles.anonymityCardSelected]}
        onPress={() => setIsAnonymous(true)}
      >
        <View style={styles.anonymityIconContainer}>
          <Icon name="user-x" size={32} color={isAnonymous === true ? '#4338CA' : '#6B7280'} />
        </View>
        <View style={styles.anonymityContent}>
          <Text style={[styles.anonymityTitle, isAnonymous === true && styles.anonymityTitleSelected]}>
            Anonymous Report
          </Text>
          <Text style={styles.anonymityDescription}>
            Your identity will remain completely confidential. You'll receive a tracking number to check your report status.
          </Text>
        </View>
        {isAnonymous === true && (
          <View style={styles.checkCircle}>
            <Icon name="check" size={20} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.anonymityCard, isAnonymous === false && styles.anonymityCardSelected]}
        onPress={() => setIsAnonymous(false)}
      >
        <View style={styles.anonymityIconContainer}>
          <Icon name="user" size={32} color={isAnonymous === false ? '#4338CA' : '#6B7280'} />
        </View>
        <View style={styles.anonymityContent}>
          <Text style={[styles.anonymityTitle, isAnonymous === false && styles.anonymityTitleSelected]}>
            Identified Report
          </Text>
          <Text style={styles.anonymityDescription}>
            Provide your contact information for follow-up and support. Your information will be kept confidential.
          </Text>
        </View>
        {isAnonymous === false && (
          <View style={styles.checkCircle}>
            <Icon name="check" size={20} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>

      {savedProgress && (
        <View style={styles.savedProgressBanner}>
          <Icon name="alert" size={18} color="#059669" />
          <Text style={styles.savedProgressText}>Saved progress detected</Text>
        </View>
      )}
    </View>
  );

  const renderReporterInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        {isAnonymous ? 'Reporter Context' : 'Your Information'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {isAnonymous ? 'Help us understand your context (no personal data)' : 'Provide your contact information'}
      </Text>

      {isAnonymous ? (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Are you reporting as: *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Victim, Witness, Third Party"
              value={formData.reporterRole}
              onChangeText={(text) => setFormData(prev => ({ ...prev, reporterRole: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your role in TUP: *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Student, Faculty, Staff"
              value={formData.tupRole}
              onChangeText={(text) => setFormData(prev => ({ ...prev, tupRole: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender (optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Female, Male, Non-binary"
              value={formData.anonymousGender}
              onChangeText={(text) => setFormData(prev => ({ ...prev, anonymousGender: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>College or Department (optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., College of Engineering"
              value={formData.anonymousDepartment}
              onChangeText={(text) => setFormData(prev => ({ ...prev, anonymousDepartment: text }))}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name: *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role in TUP: *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Student, Faculty, Staff"
              value={formData.role}
              onChangeText={(text) => setFormData(prev => ({ ...prev, role: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>College / Department:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., College of Science"
              value={formData.college}
              onChangeText={(text) => setFormData(prev => ({ ...prev, college: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender Identity:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Female, Male, Non-binary"
              value={formData.gender}
              onChangeText={(text) => setFormData(prev => ({ ...prev, gender: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Email: *</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@tup.edu.ph"
              value={formData.contactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => setFormData(prev => ({ ...prev, contactEmail: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone (optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="0917-xxxxxxx"
              value={formData.contactPhone}
              keyboardType="phone-pad"
              onChangeText={(text) => setFormData(prev => ({ ...prev, contactPhone: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact (optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="Name and phone number"
              value={formData.emergencyContact}
              onChangeText={(text) => setFormData(prev => ({ ...prev, emergencyContact: text }))}
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setFormData(prev => ({ ...prev, allowContact: !prev.allowContact }))}
          >
            <View style={[styles.checkbox, formData.allowContact && styles.checkboxChecked]}>
              {formData.allowContact && <Icon name="check" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>I allow the GAD Office to contact me for follow-up</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderIncidentDetails = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Incident Details</Text>
      <Text style={styles.stepSubtitle}>Provide information about what happened</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Incident: *</Text>
        <TextInput
          style={styles.input}
          placeholder="MM/DD/YYYY"
          value={formData.incidentDate}
          onChangeText={(text) => setFormData(prev => ({ ...prev, incidentDate: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Time of Incident (optional):</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2:30 PM"
          value={formData.incidentTime}
          onChangeText={(text) => setFormData(prev => ({ ...prev, incidentTime: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Place of Incident: *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Classroom, Office, Laboratory"
          value={formData.incidentPlace}
          onChangeText={(text) => setFormData(prev => ({ ...prev, incidentPlace: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Type of Incident: * (Select all that apply)</Text>
        <View style={styles.chipContainer}>
          {['Sexual Harassment', 'Verbal Abuse', 'Bullying', 'Discrimination', 'Stalking', 'Physical Violence', 'Other'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, formData.incidentTypes.includes(type) && styles.chipSelected]}
              onPress={() => toggleIncidentType(type)}
            >
              <Text style={[styles.chipText, formData.incidentTypes.includes(type) && styles.chipTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description of Incident: *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Please describe what happened in detail..."
          value={formData.incidentDescription}
          onChangeText={(text) => setFormData(prev => ({ ...prev, incidentDescription: text }))}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Were there witnesses? (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Yes, two classmates"
          value={formData.witnesses}
          onChangeText={(text) => setFormData(prev => ({ ...prev, witnesses: text }))}
        />
      </View>
    </View>
  );

  const renderPerpetratorInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Perpetrator Information</Text>
      <Text style={styles.stepSubtitle}>Provide details about the person involved (if known)</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name (if known):</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Prof. Santos or Unknown"
          value={formData.perpetratorName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpetratorName: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>TUP Role:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Student, Faculty, Staff, Unknown"
          value={formData.perpetratorRole}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpetratorRole: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Relationship to you:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Teacher, Classmate, Supervisor"
          value={formData.perpetratorRelationship}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpetratorRelationship: text }))}
        />
      </View>
    </View>
  );

  const renderSupportNeeded = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Support Requested</Text>
      <Text style={styles.stepSubtitle}>Let us know how we can help you</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Have you reported this elsewhere?</Text>
        <TextInput
          style={styles.input}
          placeholder="Yes or No"
          value={formData.reportedElsewhere}
          onChangeText={(text) => setFormData(prev => ({ ...prev, reportedElsewhere: text }))}
        />
      </View>

      {formData.reportedElsewhere.toLowerCase() === 'yes' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>If yes, where?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Guidance Office"
            value={formData.reportedWhere}
            onChangeText={(text) => setFormData(prev => ({ ...prev, reportedWhere: text }))}
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>What kind of support do you need? (Select all that apply)</Text>
        <View style={styles.chipContainer}>
          {['Counseling', 'Legal Assistance', 'Medical Help', 'Mediation', 'Others'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, formData.supportNeeded.includes(type) && styles.chipSelected]}
              onPress={() => toggleSupportType(type)}
            >
              <Text style={[styles.chipText, formData.supportNeeded.includes(type) && styles.chipTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred contact method:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Email, Phone, In-person"
          value={formData.preferredContact}
          onChangeText={(text) => setFormData(prev => ({ ...prev, preferredContact: text }))}
        />
      </View>
    </View>
  );

  const renderAttachments = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Attachments & Evidence</Text>
      <Text style={styles.stepSubtitle}>Upload any supporting documents, images, or videos (optional)</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Icon name="upload" size={24} color="#4338CA" />
        <Text style={styles.uploadButtonText}>Upload Files</Text>
        <Text style={styles.uploadButtonSubtext}>Images, Videos, or Documents</Text>
      </TouchableOpacity>

      {formData.attachments.length > 0 && (
        <View style={styles.attachmentsList}>
          <Text style={styles.attachmentsTitle}>Uploaded Files ({formData.attachments.length})</Text>
          {formData.attachments.map((attachment, index) => (
            <View key={index} style={styles.attachmentItem}>
              <View style={styles.attachmentIcon}>
                <Icon 
                  name={attachment.type === 'image' ? 'image' : 'video'} 
                  size={20} 
                  color="#4338CA" 
                />
              </View>
              <Text style={styles.attachmentName} numberOfLines={1}>
                {attachment.fileName}
              </Text>
              <TouchableOpacity onPress={() => removeAttachment(index)}>
                <Icon name="x" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Additional notes (optional):</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g., There may be CCTV near the area..."
          value={formData.additionalNotes}
          onChangeText={(text) => setFormData(prev => ({ ...prev, additionalNotes: text }))}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review & Confirm</Text>
      <Text style={styles.stepSubtitle}>Please review your information before submitting</Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Reporting Mode</Text>
          <Text style={styles.reviewText}>{isAnonymous ? 'Anonymous' : 'Identified'}</Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Incident Details</Text>
          <Text style={styles.reviewText}>Date: {formData.incidentDate || 'Not provided'}</Text>
          <Text style={styles.reviewText}>Place: {formData.incidentPlace || 'Not provided'}</Text>
          <Text style={styles.reviewText}>Types: {formData.incidentTypes.join(', ') || 'Not provided'}</Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Attachments</Text>
          <Text style={styles.reviewText}>{formData.attachments.length} file(s) attached</Text>
        </View>
      </View>

      <View style={styles.confirmationChecks}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, confirmAccuracy: !prev.confirmAccuracy }))}
        >
          <View style={[styles.checkbox, formData.confirmAccuracy && styles.checkboxChecked]}>
            {formData.confirmAccuracy && <Icon name="check" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I confirm that this information is true to the best of my knowledge *
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, confirmConfidentiality: !prev.confirmConfidentiality }))}
        >
          <View style={[styles.checkbox, formData.confirmConfidentiality && styles.checkboxChecked]}>
            {formData.confirmConfidentiality && <Icon name="check" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I understand that this report will be handled confidentially by the TUP GAD Office *
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.warningBox}>
        <Icon name="alert" size={20} color="#D97706" />
        <Text style={styles.warningText}>
          Once submitted, you will receive a ticket number to track your report. Please save this number for future reference.
        </Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    if (currentStep === 1) return renderAnonymitySelection();
    
    if (isAnonymous) {
      switch (currentStep) {
        case 2: return renderReporterInfo();
        case 3: return renderIncidentDetails();
        case 4: return renderPerpetratorInfo();
        case 5: return renderAttachments();
        case 6: return renderConfirmation();
        default: return null;
      }
    } else {
      switch (currentStep) {
        case 2: return renderReporterInfo();
        case 3: return renderIncidentDetails();
        case 4: return renderPerpetratorInfo();
        case 5: return renderSupportNeeded();
        case 6: return renderAttachments();
        case 7: return renderConfirmation();
        default: return null;
      }
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>ETALA Report</Text>
          <Text style={styles.headerSubtitle}>Secure & Confidential</Text>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={saveProgress}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {currentStep > 1 && renderProgressBar()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.primaryButton, currentStep === 1 && styles.primaryButtonFull]}
          onPress={isLastStep ? handleSubmit : handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isLastStep ? 'Submit Report' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  saveButtonText: {
    color: '#4338CA',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4338CA',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  anonymityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  anonymityCardSelected: {
    borderColor: '#4338CA',
    backgroundColor: '#EEF2FF',
  },
  anonymityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  anonymityContent: {
    flex: 1,
  },
  anonymityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  anonymityTitleSelected: {
    color: '#4338CA',
  },
  anonymityDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4338CA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  savedProgressBanner: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  savedProgressText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4338CA',
  },
  chipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#4338CA',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#4338CA',
    borderColor: '#4338CA',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4338CA',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4338CA',
    marginTop: 12,
  },
  uploadButtonSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  attachmentsList: {
    marginBottom: 20,
  },
  attachmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  attachmentItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  reviewSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  confirmationChecks: {
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    marginLeft: 12,
    lineHeight: 18,
  },
  bottomActions: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4338CA',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonFull: {
    marginLeft: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportScreen;