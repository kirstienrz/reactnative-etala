import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const ReportScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnonymous, setIsAnonymous] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);

  const [formData, setFormData] = useState({
    // Victim-Survivor Information
    lastName: '', firstName: '', middleName: '', alias: '', sex: '',
    dateOfBirth: '', age: '', civilStatus: '', educationalAttainment: '',
    nationality: '', passportNo: '', occupation: '', religion: '',
    region: '', province: '', cityMun: '', barangay: '',
    disability: '', numberOfChildren: '', agesOfChildren: '',
    guardianLastName: '', guardianFirstName: '', guardianMiddleName: '',
    guardianRelationship: '', guardianRegion: '', guardianProvince: '',
    guardianCityMun: '', guardianBarangay: '', guardianContact: '',
    
    // Anonymous Reporter Info
    reporterRole: '', tupRole: '', anonymousGender: '', anonymousDepartment: '',
    
    // Perpetrator Information
    perpLastName: '', perpFirstName: '', perpMiddleName: '', perpAlias: '',
    perpSex: '', perpDateOfBirth: '', perpAge: '', perpCivilStatus: '',
    perpEducation: '', perpNationality: '', perpPassport: '', perpOccupation: '',
    perpReligion: '', perpRegion: '', perpProvince: '', perpCityMun: '',
    perpBarangay: '', perpRelationship: '',
    perpGuardianLastName: '', perpGuardianFirstName: '', perpGuardianMiddleName: '',
    perpGuardianRelationship: '', perpGuardianRegion: '', perpGuardianProvince: '',
    perpGuardianCityMun: '', perpGuardianBarangay: '', perpGuardianContact: '',
    
    // Incident Information
    incidentTypes: [], incidentDescription: '', latestIncidentDate: '',
    incidentRegion: '', incidentProvince: '', incidentCityMun: '', incidentBarangay: '',
    placeOfIncident: '', witnessName: '', witnessAddress: '', witnessContact: '',
    witnessAccount: '', witnessDate: '',
    
    // Services & Support
    crisisIntervention: false, protectionOrder: false, referToSWDO: false,
    swdoDate: '', swdoServices: [], referToHealthcare: false, healthcareDate: '',
    healthcareProvider: '', healthcareServices: [], referToLawEnforcement: false,
    lawDate: '', lawAgency: '', referToOther: false, otherDate: '',
    otherProvider: '', otherService: '',
    
    // Additional
    attachments: [], additionalNotes: '', confirmAccuracy: false,
    confirmConfidentiality: false, allowContact: false,
  });

  const totalSteps = isAnonymous === null ? 1 : isAnonymous ? 7 : 8;

  useEffect(() => { loadSavedProgress(); }, []);

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
      await SecureStore.setItemAsync('reportProgress', JSON.stringify({
        formData, isAnonymous, currentStep, savedAt: new Date().toISOString(),
      }));
      setSavedProgress(true);
      Alert.alert('Progress Saved', 'Your report progress has been saved.');
    } catch (error) {
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
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  const toggleIncidentType = (type) => {
    setFormData(prev => ({
      ...prev,
      incidentTypes: prev.incidentTypes.includes(type)
        ? prev.incidentTypes.filter(t => t !== type)
        : [...prev.incidentTypes, type],
    }));
  };

  const toggleService = (field, service) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(service)
        ? prev[field].filter(s => s !== service)
        : [...prev[field], service],
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      const ticketNumber = generateTicketNumber();
      await clearProgress();
      Alert.alert(
        'Report Submitted Successfully',
        `Your report has been received.\n\nTicket Number: ${ticketNumber}\n\nPlease save this number for tracking your report.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
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
        if (!formData.lastName || !formData.firstName || !formData.sex || !formData.age) {
          Alert.alert('Required', 'Please fill in all required fields.');
          return false;
        }
      }
    }
    if (currentStep === 4) {
      if (formData.incidentTypes.length === 0 || !formData.latestIncidentDate) {
        Alert.alert('Required', 'Please fill in all required incident details.');
        return false;
      }
    }
    if ((isAnonymous && currentStep === 7) || (!isAnonymous && currentStep === 8)) {
      if (!formData.confirmAccuracy || !formData.confirmConfidentiality) {
        Alert.alert('Required', 'Please confirm all statements before submitting.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setCurrentStep(prev => prev + 1); };
  const handleBack = () => currentStep > 1 ? setCurrentStep(prev => prev - 1) : navigation.goBack();

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
          <MaterialCommunityIcons 
            name="account-off-outline" 
            size={32} 
            color={isAnonymous === true ? '#4338CA' : '#6B7280'} 
          />
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
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.anonymityCard, isAnonymous === false && styles.anonymityCardSelected]}
        onPress={() => setIsAnonymous(false)}
      >
        <View style={styles.anonymityIconContainer}>
          <MaterialIcons 
            name="person-outline" 
            size={32} 
            color={isAnonymous === false ? '#4338CA' : '#6B7280'} 
          />
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
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>

      {savedProgress && (
        <View style={styles.savedProgressBanner}>
          <MaterialIcons name="info-outline" size={18} color="#059669" />
          <Text style={styles.savedProgressText}>Saved progress detected</Text>
        </View>
      )}
    </View>
  );

  const renderVictimInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        {isAnonymous ? 'Reporter Context' : 'Victim-Survivor Information'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {isAnonymous ? 'Help us understand your context (no personal data)' : 'Please provide your information'}
      </Text>

      {isAnonymous ? (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Are you reporting as: *</Text>
            <TextInput style={styles.input} placeholder="e.g., Victim, Witness, Third Party"
              value={formData.reporterRole}
              onChangeText={(text) => setFormData(prev => ({ ...prev, reporterRole: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your role in TUP: *</Text>
            <TextInput style={styles.input} placeholder="e.g., Student, Faculty, Staff"
              value={formData.tupRole}
              onChangeText={(text) => setFormData(prev => ({ ...prev, tupRole: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender (optional):</Text>
            <TextInput style={styles.input} placeholder="e.g., Female, Male, Non-binary"
              value={formData.anonymousGender}
              onChangeText={(text) => setFormData(prev => ({ ...prev, anonymousGender: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>College or Department (optional):</Text>
            <TextInput style={styles.input} placeholder="e.g., College of Engineering"
              value={formData.anonymousDepartment}
              onChangeText={(text) => setFormData(prev => ({ ...prev, anonymousDepartment: text }))} />
          </View>
        </>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name: *</Text>
            <TextInput style={styles.input} placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name: *</Text>
            <TextInput style={styles.input} placeholder="First Name"
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Middle Name:</Text>
            <TextInput style={styles.input} placeholder="Middle Name"
              value={formData.middleName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, middleName: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alias (if any):</Text>
            <TextInput style={styles.input} placeholder="Alias"
              value={formData.alias}
              onChangeText={(text) => setFormData(prev => ({ ...prev, alias: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sex: *</Text>
            <View style={styles.chipContainer}>
              {['Male', 'Female'].map(sex => (
                <TouchableOpacity key={sex}
                  style={[styles.chip, formData.sex === sex && styles.chipSelected]}
                  onPress={() => setFormData(prev => ({ ...prev, sex }))}>
                  <Text style={[styles.chipText, formData.sex === sex && styles.chipTextSelected]}>
                    {sex}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth:</Text>
            <TextInput style={styles.input} placeholder="MM/DD/YYYY"
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age: *</Text>
            <TextInput style={styles.input} placeholder="Age" keyboardType="numeric"
              value={formData.age}
              onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Civil Status:</Text>
            <View style={styles.chipContainer}>
              {['Single', 'Married', 'Live In', 'Widowed', 'Separated'].map(status => (
                <TouchableOpacity key={status}
                  style={[styles.chip, formData.civilStatus === status && styles.chipSelected]}
                  onPress={() => setFormData(prev => ({ ...prev, civilStatus: status }))}>
                  <Text style={[styles.chipText, formData.civilStatus === status && styles.chipTextSelected]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Educational Attainment:</Text>
            <View style={styles.chipContainer}>
              {['No Formal Education', 'Elementary', 'High School', 'Vocational', 'College', 'Post Graduate'].map(edu => (
                <TouchableOpacity key={edu}
                  style={[styles.chip, formData.educationalAttainment === edu && styles.chipSelected]}
                  onPress={() => setFormData(prev => ({ ...prev, educationalAttainment: edu }))}>
                  <Text style={[styles.chipText, formData.educationalAttainment === edu && styles.chipTextSelected]}>
                    {edu}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nationality:</Text>
            <TextInput style={styles.input} placeholder="e.g., Filipino"
              value={formData.nationality}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nationality: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Passport No. (if non-Filipino):</Text>
            <TextInput style={styles.input} placeholder="Passport Number"
              value={formData.passportNo}
              onChangeText={(text) => setFormData(prev => ({ ...prev, passportNo: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Occupation:</Text>
            <TextInput style={styles.input} placeholder="Occupation"
              value={formData.occupation}
              onChangeText={(text) => setFormData(prev => ({ ...prev, occupation: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Religion:</Text>
            <View style={styles.chipContainer}>
              {['Roman Catholic', 'Islam', 'Protestant', 'Iglesia ni Kristo', 'Aglipayan', 'Other'].map(rel => (
                <TouchableOpacity key={rel}
                  style={[styles.chip, formData.religion === rel && styles.chipSelected]}
                  onPress={() => setFormData(prev => ({ ...prev, religion: rel }))}>
                  <Text style={[styles.chipText, formData.religion === rel && styles.chipTextSelected]}>
                    {rel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address:</Text>
            <TextInput style={styles.input} placeholder="Region"
              value={formData.region}
              onChangeText={(text) => setFormData(prev => ({ ...prev, region: text }))} />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Province"
              value={formData.province}
              onChangeText={(text) => setFormData(prev => ({ ...prev, province: text }))} />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="City/Municipality"
              value={formData.cityMun}
              onChangeText={(text) => setFormData(prev => ({ ...prev, cityMun: text }))} />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Barangay"
              value={formData.barangay}
              onChangeText={(text) => setFormData(prev => ({ ...prev, barangay: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Disability Status:</Text>
            <View style={styles.chipContainer}>
              {['Without Disability', 'Permanent Disability', 'Temporary Disability'].map(dis => (
                <TouchableOpacity key={dis}
                  style={[styles.chip, formData.disability === dis && styles.chipSelected]}
                  onPress={() => setFormData(prev => ({ ...prev, disability: dis }))}>
                  <Text style={[styles.chipText, formData.disability === dis && styles.chipTextSelected]}>
                    {dis}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Children (if any):</Text>
            <TextInput style={styles.input} placeholder="0" keyboardType="numeric"
              value={formData.numberOfChildren}
              onChangeText={(text) => setFormData(prev => ({ ...prev, numberOfChildren: text }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ages of Children:</Text>
            <TextInput style={styles.input} placeholder="e.g., 5, 8, 12"
              value={formData.agesOfChildren}
              onChangeText={(text) => setFormData(prev => ({ ...prev, agesOfChildren: text }))} />
          </View>
          <TouchableOpacity style={styles.checkboxContainer}
            onPress={() => setFormData(prev => ({ ...prev, allowContact: !prev.allowContact }))}>
            <View style={[styles.checkbox, formData.allowContact && styles.checkboxChecked]}>
              {formData.allowContact && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>I allow the GAD Office to contact me for follow-up</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderGuardianInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Guardian Information</Text>
      <Text style={styles.stepSubtitle}>If victim-survivor is a child (below 18)</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Last Name:</Text>
        <TextInput style={styles.input} placeholder="Last Name"
          value={formData.guardianLastName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, guardianLastName: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian First Name:</Text>
        <TextInput style={styles.input} placeholder="First Name"
          value={formData.guardianFirstName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, guardianFirstName: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Middle Name:</Text>
        <TextInput style={styles.input} placeholder="Middle Name"
          value={formData.guardianMiddleName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, guardianMiddleName: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Relationship to Victim-Survivor:</Text>
        <TextInput style={styles.input} placeholder="e.g., Mother, Father, Guardian"
          value={formData.guardianRelationship}
          onChangeText={(text) => setFormData(prev => ({ ...prev, guardianRelationship: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Address:</Text>
        <TextInput style={styles.input} placeholder="Region"
          value={formData.guardianRegion}
          onChangeText={(text) => setFormData(prev => ({ ...prev, guardianRegion: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Province"
          value={formData.guardianProvince}
          onChangeText={(text) => setFormData(prev => ({ ...prev, guardianProvince: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="City/Municipality"
          value={formData.guardianCityMun}
          onChangeText={(text) => setFormData(prev => ({ ...prev, guardianCityMun: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Barangay"
          value={formData.guardianBarangay}
          onChangeText={(text) => setFormData(prev => ({ ...prev, guardianBarangay: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Contact Number:</Text>
        <TextInput style={styles.input} placeholder="0917-xxxxxxx"
          value={formData.guardianContact} keyboardType="phone-pad"
          onChangeText={(text) => setFormData(prev => ({ ...prev, guardianContact: text }))} />
      </View>
    </View>
  );

  const renderPerpetratorInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Perpetrator Information</Text>
      <Text style={styles.stepSubtitle}>Provide details about the person involved</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name:</Text>
        <TextInput style={styles.input} placeholder="Last Name"
          value={formData.perpLastName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpLastName: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name:</Text>
        <TextInput style={styles.input} placeholder="First Name"
          value={formData.perpFirstName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpFirstName: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Middle Name:</Text>
        <TextInput style={styles.input} placeholder="Middle Name"
          value={formData.perpMiddleName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpMiddleName: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Alias:</Text>
        <TextInput style={styles.input} placeholder="Alias"
          value={formData.perpAlias}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpAlias: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sex:</Text>
        <View style={styles.chipContainer}>
          {['Male', 'Female'].map(sex => (
            <TouchableOpacity key={sex}
              style={[styles.chip, formData.perpSex === sex && styles.chipSelected]}
              onPress={() => setFormData(prev => ({ ...prev, perpSex: sex }))}>
              <Text style={[styles.chipText, formData.perpSex === sex && styles.chipTextSelected]}>
                {sex}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nationality:</Text>
        <TextInput style={styles.input} placeholder="e.g., Filipino"
          value={formData.perpNationality}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpNationality: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Passport No. (if non-Filipino):</Text>
        <TextInput style={styles.input} placeholder="Passport Number"
          value={formData.perpPassport}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpPassport: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Occupation:</Text>
        <TextInput style={styles.input} placeholder="Occupation"
          value={formData.perpOccupation}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpOccupation: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Religion:</Text>
        <View style={styles.chipContainer}>
          {['Roman Catholic', 'Islam', 'Protestant', 'Iglesia ni Kristo', 'Aglipayan', 'Other'].map(rel => (
            <TouchableOpacity key={rel}
              style={[styles.chip, formData.perpReligion === rel && styles.chipSelected]}
              onPress={() => setFormData(prev => ({ ...prev, perpReligion: rel }))}>
              <Text style={[styles.chipText, formData.perpReligion === rel && styles.chipTextSelected]}>
                {rel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address:</Text>
        <TextInput style={styles.input} placeholder="Region"
          value={formData.perpRegion}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpRegion: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Province"
          value={formData.perpProvince}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpProvince: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="City/Municipality"
          value={formData.perpCityMun}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpCityMun: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Barangay"
          value={formData.perpBarangay}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpBarangay: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Relationship to Victim-Survivor:</Text>
        <View style={styles.chipContainer}>
          {['Current spouse/partner', 'Former spouse/partner', 'Parent/Guardian', 'Sibling', 'Relative', 
            'Teacher/Professor', 'Employer/Supervisor', 'Classmate', 'Neighbor', 'Stranger', 'Other'].map(rel => (
            <TouchableOpacity key={rel}
              style={[styles.chip, formData.perpRelationship === rel && styles.chipSelected]}
              onPress={() => setFormData(prev => ({ ...prev, perpRelationship: rel }))}>
              <Text style={[styles.chipText, formData.perpRelationship === rel && styles.chipTextSelected]}>
                {rel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <Text style={[styles.stepSubtitle, { marginTop: 24, marginBottom: 16 }]}>
        If perpetrator is a child (below 18), provide guardian information:
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Last Name:</Text>
        <TextInput style={styles.input} placeholder="Last Name"
          value={formData.perpGuardianLastName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpGuardianLastName: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian First Name:</Text>
        <TextInput style={styles.input} placeholder="First Name"
          value={formData.perpGuardianFirstName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpGuardianFirstName: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Middle Name:</Text>
        <TextInput style={styles.input} placeholder="Middle Name"
          value={formData.perpGuardianMiddleName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpGuardianMiddleName: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Relationship:</Text>
        <TextInput style={styles.input} placeholder="e.g., Mother, Father"
          value={formData.perpGuardianRelationship}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpGuardianRelationship: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Address:</Text>
        <TextInput style={styles.input} placeholder="Region"
          value={formData.perpGuardianRegion}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpGuardianRegion: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Province"
          value={formData.perpGuardianProvince}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpGuardianProvince: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="City/Municipality"
          value={formData.perpGuardianCityMun}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpGuardianCityMun: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Barangay"
          value={formData.perpGuardianBarangay}
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpGuardianBarangay: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Contact Number:</Text>
        <TextInput style={styles.input} placeholder="0917-xxxxxxx"
          value={formData.perpGuardianContact} keyboardType="phone-pad"
          onChangeText={(text) => setFormData(prev => ({ ...prev, perpGuardianContact: text }))} />
      </View>
    </View>
  );

  const renderIncidentDetails = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Incident Information</Text>
      <Text style={styles.stepSubtitle}>Provide details about the incident</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Type of Incident: * (Select all that apply)</Text>
        <View style={styles.chipContainer}>
          {[
            'RA 9262 - Sexual Abuse',
            'RA 9262 - Psychological',
            'RA 9262 - Physical',
            'RA 9262 - Economic',
            'RA 8353 - Rape by Sexual Intercourse',
            'RA 8353 - Rape by Sexual Assault',
            'RA 7877 - Sexual Harassment',
            'RA 7610 - Child Abuse',
            'RA 9208 - Trafficking',
            'RA 9775 - Child Pornography',
            'RA 9995 - Photo/Video Voyeurism',
            'RPC Art 300 - Acts of Lasciviousness',
            'Other'
          ].map(type => (
            <TouchableOpacity key={type}
              style={[styles.chip, formData.incidentTypes.includes(type) && styles.chipSelected]}
              onPress={() => toggleIncidentType(type)}>
              <Text style={[styles.chipText, formData.incidentTypes.includes(type) && styles.chipTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description of Incident:</Text>
        <TextInput style={[styles.input, styles.textArea]}
          placeholder="Please describe what happened in detail..."
          value={formData.incidentDescription} multiline numberOfLines={6} textAlignVertical="top"
          onChangeText={(text) => setFormData(prev => ({ ...prev, incidentDescription: text }))} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Latest Incident: *</Text>
        <TextInput style={styles.input} placeholder="MM/DD/YYYY"
          value={formData.latestIncidentDate}
          onChangeText={(text) => setFormData(prev => ({ ...prev, latestIncidentDate: text }))} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Geographic Location of Incident:</Text>
        <TextInput style={styles.input} placeholder="Region"
          value={formData.incidentRegion}
          onChangeText={(text) => setFormData(prev => ({ ...prev, incidentRegion: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Province"
          value={formData.incidentProvince}
          onChangeText={(text) => setFormData(prev => ({ ...prev, incidentProvince: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="City/Municipality"
          value={formData.incidentCityMun}
          onChangeText={(text) => setFormData(prev => ({ ...prev, incidentCityMun: text }))} />
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Barangay"
          value={formData.incidentBarangay}
          onChangeText={(text) => setFormData(prev => ({ ...prev, incidentBarangay: text }))} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Place of Incident:</Text>
        <View style={styles.chipContainer}>
          {['House', 'Work', 'School', 'Commercial Place', 'Religious Institution', 
            'Medical Treatment', 'Transport', 'Other'].map(place => (
            <TouchableOpacity key={place}
              style={[styles.chip, formData.placeOfIncident === place && styles.chipSelected]}
              onPress={() => setFormData(prev => ({ ...prev, placeOfIncident: place }))}>
              <Text style={[styles.chipText, formData.placeOfIncident === place && styles.chipTextSelected]}>
                {place}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.stepSubtitle, { marginTop: 24, marginBottom: 16 }]}>Witness Information (if any):</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Witness Name:</Text>
        <TextInput style={styles.input} placeholder="Full name"
          value={formData.witnessName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, witnessName: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Witness Address:</Text>
        <TextInput style={styles.input} placeholder="Complete address"
          value={formData.witnessAddress}
          onChangeText={(text) => setFormData(prev => ({ ...prev, witnessAddress: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Witness Contact Number:</Text>
        <TextInput style={styles.input} placeholder="0917-xxxxxxx"
          value={formData.witnessContact} keyboardType="phone-pad"
          onChangeText={(text) => setFormData(prev => ({ ...prev, witnessContact: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Eye Witness Account:</Text>
        <TextInput style={[styles.input, styles.textArea]}
          placeholder="What did the witness see or hear..."
          value={formData.witnessAccount} multiline numberOfLines={4} textAlignVertical="top"
          onChangeText={(text) => setFormData(prev => ({ ...prev, witnessAccount: text }))} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Witness Statement:</Text>
        <TextInput style={styles.input} placeholder="MM/DD/YYYY"
          value={formData.witnessDate}
          onChangeText={(text) => setFormData(prev => ({ ...prev, witnessDate: text }))} />
      </View>
    </View>
  );

  const renderServicesInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Services Information</Text>
      <Text style={styles.stepSubtitle}>Select the services needed or already provided</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Crisis Intervention:</Text>
        <TouchableOpacity style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, crisisIntervention: !prev.crisisIntervention }))}>
          <View style={[styles.checkbox, formData.crisisIntervention && styles.checkboxChecked]}>
            {formData.crisisIntervention && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Include rescue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, protectionOrder: !prev.protectionOrder }))}>
          <View style={[styles.checkbox, formData.protectionOrder && styles.checkboxChecked]}>
            {formData.protectionOrder && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Issuance/Enforcement of Barangay Protection Order</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Refer to Social Welfare and Development Officer:</Text>
        <TouchableOpacity style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, referToSWDO: !prev.referToSWDO }))}>
          <View style={[styles.checkbox, formData.referToSWDO && styles.checkboxChecked]}>
            {formData.referToSWDO && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Yes, refer to SWDO</Text>
        </TouchableOpacity>
        {formData.referToSWDO && (
          <>
            <TextInput style={styles.input} placeholder="Date (MM/DD/YYYY)"
              value={formData.swdoDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, swdoDate: text }))} />
            <Text style={[styles.label, { marginTop: 12 }]}>Services needed:</Text>
            <View style={styles.chipContainer}>
              {['Psychiatric Services', 'Emergency Shelter', 'Economic Assistance', 'Other'].map(service => (
                <TouchableOpacity key={service}
                  style={[styles.chip, formData.swdoServices.includes(service) && styles.chipSelected]}
                  onPress={() => toggleService('swdoServices', service)}>
                  <Text style={[styles.chipText, formData.swdoServices.includes(service) && styles.chipTextSelected]}>
                    {service}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Refer to Healthcare Provider:</Text>
        <TouchableOpacity style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, referToHealthcare: !prev.referToHealthcare }))}>
          <View style={[styles.checkbox, formData.referToHealthcare && styles.checkboxChecked]}>
            {formData.referToHealthcare && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Yes, refer to healthcare provider</Text>
        </TouchableOpacity>
        {formData.referToHealthcare && (
          <>
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Date (MM/DD/YYYY)"
              value={formData.healthcareDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, healthcareDate: text }))} />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Name of Healthcare Provider"
              value={formData.healthcareProvider}
              onChangeText={(text) => setFormData(prev => ({ ...prev, healthcareProvider: text }))} />
            <Text style={[styles.label, { marginTop: 12 }]}>Services needed:</Text>
            <View style={styles.chipContainer}>
              {['First Aid', 'Medical Treatment', 'Medical Certificate', 'Medical-Legal Exam', 'Other'].map(service => (
                <TouchableOpacity key={service}
                  style={[styles.chip, formData.healthcareServices.includes(service) && styles.chipSelected]}
                  onPress={() => toggleService('healthcareServices', service)}>
                  <Text style={[styles.chipText, formData.healthcareServices.includes(service) && styles.chipTextSelected]}>
                    {service}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Refer to Law Enforcement:</Text>
        <TouchableOpacity style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, referToLawEnforcement: !prev.referToLawEnforcement }))}>
          <View style={[styles.checkbox, formData.referToLawEnforcement && styles.checkboxChecked]}>
            {formData.referToLawEnforcement && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Yes, refer to law enforcement</Text>
        </TouchableOpacity>
        {formData.referToLawEnforcement && (
          <>
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Date (MM/DD/YYYY)"
              value={formData.lawDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lawDate: text }))} />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Agency Name"
              value={formData.lawAgency}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lawAgency: text }))} />
          </>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Refer to Other Service Provider:</Text>
        <TouchableOpacity style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, referToOther: !prev.referToOther }))}>
          <View style={[styles.checkbox, formData.referToOther && styles.checkboxChecked]}>
            {formData.referToOther && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Yes, refer to other service provider</Text>
        </TouchableOpacity>
        {formData.referToOther && (
          <>
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Date (MM/DD/YYYY)"
              value={formData.otherDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, otherDate: text }))} />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Name of Service Provider"
              value={formData.otherProvider}
              onChangeText={(text) => setFormData(prev => ({ ...prev, otherProvider: text }))} />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Type of Service"
              value={formData.otherService}
              onChangeText={(text) => setFormData(prev => ({ ...prev, otherService: text }))} />
          </>
        )}
      </View>
    </View>
  );

  const renderAttachments = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Attachments & Evidence</Text>
      <Text style={styles.stepSubtitle}>Upload any supporting documents, images, or videos (optional)</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <MaterialIcons name="cloud-upload" size={32} color="#4338CA" />
        <Text style={styles.uploadButtonText}>Upload Files</Text>
        <Text style={styles.uploadButtonSubtext}>Images, Videos, or Documents</Text>
      </TouchableOpacity>

      {formData.attachments.length > 0 && (
        <View style={styles.attachmentsList}>
          <Text style={styles.attachmentsTitle}>Uploaded Files ({formData.attachments.length})</Text>
          {formData.attachments.map((attachment, index) => (
            <View key={index} style={styles.attachmentItem}>
              <View style={styles.attachmentIcon}>
                <MaterialIcons 
                  name={attachment.type === 'image' ? 'image' : 'videocam'} 
                  size={20} 
                  color="#4338CA" 
                />
              </View>
              <Text style={styles.attachmentName} numberOfLines={1}>{attachment.fileName}</Text>
              <TouchableOpacity onPress={() => removeAttachment(index)}>
                <MaterialIcons name="close" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Additional notes (optional):</Text>
        <TextInput style={[styles.input, styles.textArea]}
          placeholder="Any additional information..."
          value={formData.additionalNotes} multiline numberOfLines={4} textAlignVertical="top"
          onChangeText={(text) => setFormData(prev => ({ ...prev, additionalNotes: text }))} />
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

        {!isAnonymous && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewSectionTitle}>Victim-Survivor</Text>
            <Text style={styles.reviewText}>
              {formData.firstName} {formData.lastName}
            </Text>
            <Text style={styles.reviewText}>Age: {formData.age || 'Not provided'}</Text>
          </View>
        )}

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Incident Details</Text>
          <Text style={styles.reviewText}>Date: {formData.latestIncidentDate || 'Not provided'}</Text>
          <Text style={styles.reviewText}>
            Types: {formData.incidentTypes.length > 0 ? formData.incidentTypes.join(', ') : 'Not provided'}
          </Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Attachments</Text>
          <Text style={styles.reviewText}>{formData.attachments.length} file(s) attached</Text>
        </View>
      </View>

      <View style={styles.confirmationChecks}>
        <TouchableOpacity style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, confirmAccuracy: !prev.confirmAccuracy }))}>
          <View style={[styles.checkbox, formData.confirmAccuracy && styles.checkboxChecked]}>
            {formData.confirmAccuracy && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I confirm that this information is true to the best of my knowledge *
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, confirmConfidentiality: !prev.confirmConfidentiality }))}>
          <View style={[styles.checkbox, formData.confirmConfidentiality && styles.checkboxChecked]}>
            {formData.confirmConfidentiality && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I understand that this report will be handled confidentially by the TUP GAD Office *
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.warningBox}>
        <MaterialIcons name="info-outline" size={20} color="#D97706" />
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
        case 2: return renderVictimInfo();
        case 3: return renderPerpetratorInfo();
        case 4: return renderIncidentDetails();
        case 5: return renderServicesInfo();
        case 6: return renderAttachments();
        case 7: return renderConfirmation();
        default: return null;
      }
    } else {
      switch (currentStep) {
        case 2: return renderVictimInfo();
        case 3: return renderGuardianInfo();
        case 4: return renderPerpetratorInfo();
        case 5: return renderIncidentDetails();
        case 6: return renderServicesInfo();
        case 7: return renderAttachments();
        case 8: return renderConfirmation();
        default: return null;
      }
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>ETALA Report</Text>
          <Text style={styles.headerSubtitle}>Secure & Confidential</Text>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={saveProgress}>
          <MaterialIcons name="save" size={18} color="#4338CA" style={{ marginRight: 4 }} />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {currentStep > 1 && renderProgressBar()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.bottomActions}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.primaryButton, currentStep === 1 && styles.primaryButtonFull]}
          onPress={isLastStep ? handleSubmit : handleNext}
          disabled={loading}>
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 3,
  },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  saveButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8, 
    backgroundColor: '#EEF2FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: { color: '#4338CA', fontSize: 14, fontWeight: '600' },
  progressContainer: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#4338CA', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#6B7280', textAlign: 'center', fontWeight: '500' },
  content: { flex: 1 },
  stepContainer: { padding: 20 },
  stepTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 20 },
  anonymityCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  anonymityCardSelected: { borderColor: '#4338CA', backgroundColor: '#EEF2FF' },
  anonymityIconContainer: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  anonymityContent: { flex: 1 },
  anonymityTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  anonymityTitleSelected: { color: '#4338CA' },
  anonymityDescription: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  checkCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#4338CA',
    justifyContent: 'center', alignItems: 'center', marginLeft: 12,
  },
  savedProgressBanner: {
    backgroundColor: '#ECFDF5', padding: 16, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
  },
  savedProgressText: { fontSize: 14, color: '#059669', fontWeight: '600', marginLeft: 8 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#1F2937',
  },
  textArea: { minHeight: 120, paddingTop: 14 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, marginRight: 8, marginBottom: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipSelected: { backgroundColor: '#EEF2FF', borderColor: '#4338CA' },
  chipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  chipTextSelected: { color: '#4338CA', fontWeight: '600' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB',
    marginRight: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#4338CA', borderColor: '#4338CA' },
  checkboxLabel: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
  uploadButton: {
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#4338CA',
    borderStyle: 'dashed', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 20,
  },
  uploadButtonText: { fontSize: 16, fontWeight: '600', color: '#4338CA', marginTop: 12 },
  uploadButtonSubtext: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  attachmentsList: { marginBottom: 20 },
  attachmentsTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  attachmentItem: {
    backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  attachmentIcon: {
    width: 40, height: 40, borderRadius: 8, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  attachmentName: { flex: 1, fontSize: 14, color: '#1F2937', fontWeight: '500' },
  reviewCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  reviewSection: {
    marginBottom: 20, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  reviewSectionTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  reviewText: { fontSize: 14, color: '#6B7280', marginBottom: 4, lineHeight: 20 },
  confirmationChecks: { marginBottom: 24 },
  warningBox: {
    backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12,
    flexDirection: 'row', alignItems: 'flex-start',
  },
  warningText: { flex: 1, fontSize: 13, color: '#92400E', marginLeft: 12, lineHeight: 18 },
  bottomActions: {
    backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 8,
  },
  primaryButton: {
    flex: 1, backgroundColor: '#4338CA', paddingVertical: 16, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
    shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  primaryButtonFull: { marginLeft: 0 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 16, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  secondaryButtonText: { color: '#374151', fontSize: 16, fontWeight: '600' },
});

export default ReportScreen;