import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, Calendar, ChevronDown, Check, User, UserX,
  Upload, X, Image as ImageIcon, Video, Info, Shield, AlertCircle, FileText, Lock
} from 'lucide-react';
import { createReport } from '../../api/report';
import { generateReportPDF } from '../../utils/generateReportPDF';


const ReportForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownField, setDropdownField] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState([]);

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

    // Additional
    attachments: [], additionalNotes: '', confirmAccuracy: false,
    confirmConfidentiality: false,
  });

  const totalSteps = 6;

  const regions = ['NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B', 'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X', 'Region XI', 'Region XII', 'Region XIII', 'CAR', 'BARMM'];
  const civilStatuses = ['Single', 'Married', 'Live In', 'Widowed', 'Separated'];
  const educationLevels = ['No Formal Education', 'Elementary', 'High School', 'Vocational', 'College', 'Post Graduate'];
  const religions = ['Roman Catholic', 'Islam', 'Protestant', 'Iglesia ni Kristo', 'Aglipayan', 'Other'];
  const disabilities = ['Without Disability', 'Permanent Disability', 'Temporary Disability'];
  const relationships = ['Current spouse/partner', 'Former spouse/partner', 'Parent/Guardian', 'Sibling', 'Relative', 'Teacher/Professor', 'Employer/Supervisor', 'Classmate', 'Neighbor', 'Stranger', 'Other'];
  const places = ['House', 'Work', 'School', 'Commercial Place', 'Religious Institution', 'Medical Treatment', 'Transport', 'Other'];
  const incidentTypesList = [
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
  ];

  // Load saved progress from localStorage
  useEffect(() => {
    loadSavedProgress();
  }, []);

  const loadSavedProgress = () => {
    try {
      const saved = localStorage.getItem('reportProgress');
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

  const saveProgress = () => {
    try {
      localStorage.setItem('reportProgress', JSON.stringify({
        formData,
        isAnonymous,
        currentStep,
        savedAt: new Date().toISOString(),
      }));
      setSavedProgress(true);
      showAlert('Progress Saved', 'Your report progress has been saved locally.');
    } catch (error) {
      showAlert('Error', 'Failed to save progress.');
    }
  };

  const clearProgress = () => {
    try {
      localStorage.removeItem('reportProgress');
      setSavedProgress(false);
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  };

  const showAlert = (title, message) => {
    alert(`${title}\n\n${message}`);
  };

  const pickFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      const newAttachments = files.map(file => ({
        file,
        name: file.name,
        type: getFileType(file),
        size: file.size,
        url: URL.createObjectURL(file)
      }));
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    };
    input.click();
  };

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('document') || file.type.includes('word')) return 'document';
    return 'other';
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
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

  const handleSubmit = async () => {
    // Validate before submitting
    if (!formData.confirmAccuracy || !formData.confirmConfidentiality) {
      showAlert('Required', 'Please confirm all statements before submitting.');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('isAnonymous', String(isAnonymous));

      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === 'attachments') return;
        const value = formData[key];
        if (Array.isArray(value)) {
          value.forEach(item => submitData.append(`${key}[]`, item));
        } else if (typeof value === 'boolean') {
          submitData.append(key, value.toString());
        } else if (value !== '' && value !== null && value !== undefined) {
          submitData.append(key, value.toString());
        }
      });

      // Append attachments
      formData.attachments.forEach(attachment => {
        submitData.append('attachments', attachment.file);
      });

      // ✅ SUBMIT REPORT
      const response = await createReport(submitData);

      // ============================
      // 🧾 PDF DOWNLOAD (RIGHT HERE)
      // ============================
      const ticketNumber =
        response?.ticketNumber || 'TUP-' + Date.now().toString().slice(-8);

      generateReportPDF({
        formData,     // use current form data (NOT reset yet)
        ticketNumber,
        isAnonymous,
      });

      // ============================
      // CLEAR & FEEDBACK
      // ============================
      await clearProgress();

      showAlert(
        'Report Submitted Successfully',
        `Your report has been received.\n\nTicket Number: ${ticketNumber}\n\nA copy of your report has been downloaded as a PDF.`
      );

      // ============================
      // RESET FORM (LAST STEP)
      // ============================
      setCurrentStep(1);
      setIsAnonymous(false);
      setFormData({
        lastName: '', firstName: '', middleName: '', alias: '', sex: '',
        dateOfBirth: '', age: '', civilStatus: '', educationalAttainment: '',
        nationality: '', passportNo: '', occupation: '', religion: '',
        region: '', province: '', cityMun: '', barangay: '',
        disability: '', numberOfChildren: '', agesOfChildren: '',
        guardianLastName: '', guardianFirstName: '', guardianMiddleName: '',
        guardianRelationship: '', guardianRegion: '', guardianProvince: '',
        guardianCityMun: '', guardianBarangay: '', guardianContact: '',
        reporterRole: '', tupRole: '', anonymousGender: '', anonymousDepartment: '',
        perpLastName: '', perpFirstName: '', perpMiddleName: '', perpAlias: '',
        perpSex: '', perpDateOfBirth: '', perpAge: '', perpCivilStatus: '',
        perpEducation: '', perpNationality: '', perpPassport: '', perpOccupation: '',
        perpReligion: '', perpRegion: '', perpProvince: '', perpCityMun: '',
        perpBarangay: '', perpRelationship: '',
        perpGuardianLastName: '', perpGuardianFirstName: '', perpGuardianMiddleName: '',
        perpGuardianRelationship: '', perpGuardianRegion: '', perpGuardianProvince: '',
        perpGuardianCityMun: '', perpGuardianBarangay: '', perpGuardianContact: '',
        incidentTypes: [], incidentDescription: '', latestIncidentDate: '',
        incidentRegion: '', incidentProvince: '', incidentCityMun: '', incidentBarangay: '',
        placeOfIncident: '', witnessName: '', witnessAddress: '', witnessContact: '',
        witnessAccount: '', witnessDate: '',
        attachments: [], additionalNotes: '', confirmAccuracy: false,
        confirmConfidentiality: false,
      });

    } catch (error) {
      console.error('Submit error:', error);
      let errorMessage = 'Failed to submit report. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showAlert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      return true;
    }
    if (currentStep === 2) {
      if (!isAnonymous) {
        if (!formData.lastName || !formData.firstName || !formData.sex || !formData.age) {
          showAlert('Required', 'Please fill in all required fields (Name, Sex, Age).');
          return false;
        }
      } else {
        if (!formData.reporterRole || !formData.tupRole) {
          showAlert('Required', 'Please fill in all required fields (Reporter Role & TUP Role).');
          return false;
        }
      }
    }
    if (currentStep === 5) {
      if (formData.incidentTypes.length === 0 || !formData.latestIncidentDate) {
        showAlert('Required', 'Please select at least one incident type and provide the date.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const showDatePickerModal = (field) => {
    setDatePickerField(field);
    setShowDatePicker(true);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    setFormData(prev => ({ ...prev, [datePickerField]: formattedDate }));
    setShowDatePicker(false);
  };

  const showDropdown = (field, options) => {
    setDropdownField(field);
    setDropdownOptions(options);
    setDropdownVisible(true);
  };

  const selectDropdownOption = (value) => {
    setFormData(prev => ({ ...prev, [dropdownField]: value }));
    setDropdownVisible(false);
  };

  const getStepTitle = () => {
    const titles = [
      "Reporting Mode",
      isAnonymous ? "Reporter Context" : "Victim-Survivor Information",
      isAnonymous ? "Perpetrator Information" : "Guardian Information",
      isAnonymous ? "Incident Details" : "Perpetrator Information",
      isAnonymous ? "Review & Submit" : "Incident Details",
      "Review & Submit"
    ];
    return titles[currentStep - 1] || "";
  };

  const renderProgressBar = () => (
    <div style={styles.progressContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </div>
        <div style={styles.stepIndicator}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} style={{
              ...styles.stepDot,
              backgroundColor: currentStep > index ? styles.colors.primary : styles.colors.border,
              borderColor: currentStep > index ? styles.colors.primary : styles.colors.border,
            }}>
              {currentStep > index ? <Check size={12} color="white" /> : null}
            </div>
          ))}
        </div>
      </div>
      <h2 style={styles.stepTitle}>{getStepTitle()}</h2>
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
          }}
        />
      </div>
    </div>
  );

  const renderAnonymitySelection = () => (
    <div style={styles.stepContainer}>
      <div style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '20px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '40px',
          backgroundColor: styles.colors.ultraLightBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          border: `1px solid ${styles.colors.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <Shield size={40} color={styles.colors.primary} />
        </div>
        <h2 style={styles.stepTitle}>Choose Reporting Mode</h2>
        <p style={styles.stepSubtitle}>Select how you would like to submit your report</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div
          style={{
            ...styles.anonymityCard,
            borderColor: isAnonymous ? styles.colors.primary : styles.colors.border,
            backgroundColor: isAnonymous ? styles.colors.ultraLightBackground : 'white',
            boxShadow: isAnonymous ? '0 4px 20px rgba(37, 99, 235, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
          onClick={() => setIsAnonymous(true)}
        >
          <div style={{
            ...styles.anonymityIconContainer,
            backgroundColor: isAnonymous ? styles.colors.primary : styles.colors.ultraLightBackground,
            boxShadow: isAnonymous ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 2px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <UserX size={28} color={isAnonymous ? 'white' : styles.colors.textSecondary} />
          </div>
          <div style={styles.anonymityContent}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{
                ...styles.anonymityTitle,
                color: isAnonymous ? styles.colors.primary : styles.colors.textPrimary
              }}>
                Anonymous Report
              </h3>
            </div>
            <ul style={styles.featureList}>
              <li>Your identity remains confidential</li>
              <li>Secure tracking number provided</li>
              <li>No personal information required</li>
            </ul>
          </div>
          {isAnonymous && (
            <div style={styles.checkCircle}>
              <Check size={20} color="white" />
            </div>
          )}
        </div>

        <div
          style={{
            ...styles.anonymityCard,
            borderColor: !isAnonymous ? styles.colors.primary : styles.colors.border,
            backgroundColor: !isAnonymous ? styles.colors.ultraLightBackground : 'white',
            boxShadow: !isAnonymous ? '0 4px 20px rgba(37, 99, 235, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
          onClick={() => setIsAnonymous(false)}
        >
          <div style={{
            ...styles.anonymityIconContainer,
            backgroundColor: !isAnonymous ? styles.colors.primary : styles.colors.ultraLightBackground,
            boxShadow: !isAnonymous ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 2px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <User size={28} color={!isAnonymous ? 'white' : styles.colors.textSecondary} />
          </div>
          <div style={styles.anonymityContent}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{
                ...styles.anonymityTitle,
                color: isAnonymous ? styles.colors.primary : styles.colors.textPrimary
              }}>
                Identified Report
              </h3>
              <div style={{
                marginLeft: '12px',
                padding: '4px 8px',
                backgroundColor: styles.colors.lightBackground,
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                color: styles.colors.primary,
                letterSpacing: '0.5px'
              }}>
                RECOMMENDED
              </div>
            </div>
            <ul style={styles.featureList}>
              <li>Enables follow-up support</li>
              <li>Access to full services</li>
              <li>Strict confidentiality maintained</li>
            </ul>
          </div>
          {!isAnonymous && (
            <div style={styles.checkCircle}>
              <Check size={20} color="white" />
            </div>
          )}
        </div>
      </div>

      <div style={styles.importantNote}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Info size={18} color={styles.colors.textSecondary} />
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: styles.colors.textPrimary, fontWeight: '500' }}>
              Important Information
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: styles.colors.textSecondary, lineHeight: '1.5' }}>
              All reports are handled with strict confidentiality by the TUP GAD Office.
              False reporting may result in legal consequences under RA 11313 (Safe Spaces Act).
            </p>
          </div>
        </div>
      </div>

      {savedProgress && (
        <div style={styles.savedProgressBanner}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Info size={18} color={styles.colors.success} />
            <div>
              <span style={styles.savedProgressText}>Saved progress detected</span>
              <p style={{ fontSize: '13px', color: styles.colors.textSecondary, margin: '4px 0 0 0' }}>
                You can continue where you left off. Your data is saved locally on this device.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVictimInfo = () => (
    <div style={styles.stepContainer}>
      {isAnonymous ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Your Role & Context</h3>
              <p style={styles.sectionDescription}>Required information for anonymous reports</p>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>
                Are you reporting as
                <span style={styles.requiredStar}> *</span>
              </label>
              <select
                style={styles.selectInput}
                value={formData.reporterRole}
                onChange={(e) => setFormData(prev => ({ ...prev, reporterRole: e.target.value }))}
              >
                <option value="">Select your role</option>
                <option value="Victim">Victim</option>
                <option value="Witness">Witness</option>
                <option value="Third Party">Third Party (Friend, Family, Colleague)</option>
                <option value="Mandatory Reporter">Mandatory Reporter</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>
                Your role in TUP
                <span style={styles.requiredStar}> *</span>
              </label>
              <select
                style={styles.selectInput}
                value={formData.tupRole}
                onChange={(e) => setFormData(prev => ({ ...prev, tupRole: e.target.value }))}
              >
                <option value="">Select your role</option>
                <option value="Student">Student</option>
                <option value="Faculty">Faculty Member</option>
                <option value="Staff">Staff</option>
                <option value="Administrator">Administrator</option>
                <option value="Alumni">Alumni</option>
                <option value="Visitor">Visitor</option>
              </select>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Optional Information</h3>
              <p style={styles.sectionDescription}>Additional context for better assistance</p>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Gender (optional)</label>
              <select
                style={styles.selectInput}
                value={formData.anonymousGender}
                onChange={(e) => setFormData(prev => ({ ...prev, anonymousGender: e.target.value }))}
              >
                <option value="">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>College/Department (optional)</label>
              <input
                style={styles.input}
                placeholder="e.g., College of Engineering"
                value={formData.anonymousDepartment}
                onChange={(e) => setFormData(prev => ({ ...prev, anonymousDepartment: e.target.value }))}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          <div>
            <div style={{ ...styles.sectionCard, marginBottom: '24px' }}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
                <p style={styles.sectionDescription}>Basic identification details</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>
                    Last Name
                    <span style={styles.requiredStar}> *</span>
                  </label>
                  <input
                    style={styles.input}
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>
                    First Name
                    <span style={styles.requiredStar}> *</span>
                  </label>
                  <input
                    style={styles.input}
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Middle Name</label>
                  <input
                    style={styles.input}
                    placeholder="Enter middle name"
                    value={formData.middleName}
                    onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Alias (if any)</label>
                  <input
                    style={styles.input}
                    placeholder="Enter alias"
                    value={formData.alias}
                    onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>
                    Sex
                    <span style={styles.requiredStar}> *</span>
                  </label>
                  <div style={styles.optionGroup}>
                    {['Male', 'Female'].map(sex => (
                      <button
                        key={sex}
                        type="button"
                        style={{
                          ...styles.optionButton,
                          backgroundColor: formData.sex === sex ? styles.colors.primary : 'white',
                          color: formData.sex === sex ? 'white' : styles.colors.textPrimary,
                          borderColor: formData.sex === sex ? styles.colors.primary : styles.colors.border,
                          boxShadow: formData.sex === sex ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, sex }))}
                      >
                        {sex}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>
                    Age
                    <span style={styles.requiredStar}> *</span>
                  </label>
                  <input
                    style={styles.input}
                    placeholder="Enter age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Address Information</h3>
                <p style={styles.sectionDescription}>Current residential address</p>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Region</label>
                <div style={styles.dropdownInput} onClick={() => showDropdown('region', regions)}>
                  <span style={{ color: !formData.region ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                    {formData.region || 'Select region'}
                  </span>
                  <ChevronDown size={20} color={styles.colors.textSecondary} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '12px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Province</label>
                  <input
                    style={styles.input}
                    placeholder="Enter province"
                    value={formData.province}
                    onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>City/Municipality</label>
                  <input
                    style={styles.input}
                    placeholder="Enter city/municipality"
                    value={formData.cityMun}
                    onChange={(e) => setFormData(prev => ({ ...prev, cityMun: e.target.value }))}
                  />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Barangay</label>
                <input
                  style={styles.input}
                  placeholder="Enter barangay"
                  value={formData.barangay}
                  onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div>
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Demographic Information</h3>
                <p style={styles.sectionDescription}>Additional personal details</p>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Date of Birth</label>
                <div style={styles.dateInput} onClick={() => showDatePickerModal('dateOfBirth')}>
                  <span style={{ color: !formData.dateOfBirth ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                    {formData.dateOfBirth || 'Select date'}
                  </span>
                  <Calendar size={20} color={styles.colors.textSecondary} />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Civil Status</label>
                <div style={styles.dropdownInput} onClick={() => showDropdown('civilStatus', civilStatuses)}>
                  <span style={{ color: !formData.civilStatus ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                    {formData.civilStatus || 'Select civil status'}
                  </span>
                  <ChevronDown size={20} color={styles.colors.textSecondary} />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Educational Attainment</label>
                <div style={styles.dropdownInput} onClick={() => showDropdown('educationalAttainment', educationLevels)}>
                  <span style={{ color: !formData.educationalAttainment ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                    {formData.educationalAttainment || 'Select education level'}
                  </span>
                  <ChevronDown size={20} color={styles.colors.textSecondary} />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Disability Status</label>
                <div style={styles.dropdownInput} onClick={() => showDropdown('disability', disabilities)}>
                  <span style={{ color: !formData.disability ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                    {formData.disability || 'Select disability status'}
                  </span>
                  <ChevronDown size={20} color={styles.colors.textSecondary} />
                </div>
              </div>
            </div>

            <div style={{ ...styles.sectionCard, marginTop: '24px' }}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Additional Information</h3>
                <p style={styles.sectionDescription}>Optional details</p>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Nationality</label>
                <input
                  style={styles.input}
                  placeholder="e.g., Filipino"
                  value={formData.nationality}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Religion</label>
                <div style={styles.dropdownInput} onClick={() => showDropdown('religion', religions)}>
                  <span style={{ color: !formData.religion ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                    {formData.religion || 'Select religion'}
                  </span>
                  <ChevronDown size={20} color={styles.colors.textSecondary} />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Occupation</label>
                <input
                  style={styles.input}
                  placeholder="Enter occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGuardianInfo = () => (
    <div style={styles.stepContainer}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Guardian Details</h3>
            <p style={styles.sectionDescription}>Required for minors (below 18 years old)</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Last Name</label>
              <input
                style={styles.input}
                placeholder="Enter last name"
                value={formData.guardianLastName}
                onChange={(e) => setFormData(prev => ({ ...prev, guardianLastName: e.target.value }))}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>First Name</label>
              <input
                style={styles.input}
                placeholder="Enter first name"
                value={formData.guardianFirstName}
                onChange={(e) => setFormData(prev => ({ ...prev, guardianFirstName: e.target.value }))}
              />
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Middle Name</label>
            <input
              style={styles.input}
              placeholder="Enter middle name"
              value={formData.guardianMiddleName}
              onChange={(e) => setFormData(prev => ({ ...prev, guardianMiddleName: e.target.value }))}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Relationship to Victim-Survivor</label>
            <input
              style={styles.input}
              placeholder="e.g., Mother, Father, Legal Guardian"
              value={formData.guardianRelationship}
              onChange={(e) => setFormData(prev => ({ ...prev, guardianRelationship: e.target.value }))}
            />
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Guardian Contact Information</h3>
            <p style={styles.sectionDescription}>Contact details and address</p>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Contact Number</label>
            <input
              style={styles.input}
              placeholder="0917-xxxxxxx"
              value={formData.guardianContact}
              onChange={(e) => setFormData(prev => ({ ...prev, guardianContact: e.target.value }))}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Region</label>
            <div style={styles.dropdownInput} onClick={() => showDropdown('guardianRegion', regions)}>
              <span style={{ color: !formData.guardianRegion ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                {formData.guardianRegion || 'Select region'}
              </span>
              <ChevronDown size={20} color={styles.colors.textSecondary} />
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>City/Municipality</label>
            <input
              style={styles.input}
              placeholder="Enter city/municipality"
              value={formData.guardianCityMun}
              onChange={(e) => setFormData(prev => ({ ...prev, guardianCityMun: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerpetratorInfo = () => (
    <div style={styles.stepContainer}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Personal Details</h3>
            <p style={styles.sectionDescription}>Information about the alleged perpetrator</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Last Name</label>
              <input
                style={styles.input}
                placeholder="Enter last name"
                value={formData.perpLastName}
                onChange={(e) => setFormData(prev => ({ ...prev, perpLastName: e.target.value }))}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>First Name</label>
              <input
                style={styles.input}
                placeholder="Enter first name"
                value={formData.perpFirstName}
                onChange={(e) => setFormData(prev => ({ ...prev, perpFirstName: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Middle Name</label>
              <input
                style={styles.input}
                placeholder="Enter middle name"
                value={formData.perpMiddleName}
                onChange={(e) => setFormData(prev => ({ ...prev, perpMiddleName: e.target.value }))}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Alias (if known)</label>
              <input
                style={styles.input}
                placeholder="Enter alias"
                value={formData.perpAlias}
                onChange={(e) => setFormData(prev => ({ ...prev, perpAlias: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Sex</label>
              <div style={styles.optionGroup}>
                {['Male', 'Female'].map(sex => (
                  <button
                    key={sex}
                    type="button"
                    style={{
                      ...styles.optionButton,
                      backgroundColor: formData.perpSex === sex ? styles.colors.primary : 'white',
                      color: formData.perpSex === sex ? 'white' : styles.colors.textPrimary,
                      borderColor: formData.perpSex === sex ? styles.colors.primary : styles.colors.border,
                      boxShadow: formData.perpSex === sex ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, perpSex: sex }))}
                  >
                    {sex}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Age (approx.)</label>
              <input
                style={styles.input}
                placeholder="Enter approximate age"
                type="number"
                min="1"
                max="120"
                value={formData.perpAge}
                onChange={(e) => setFormData(prev => ({ ...prev, perpAge: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div>
          <div style={{ ...styles.sectionCard, marginBottom: '24px' }}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Relationship & Context</h3>
              <p style={styles.sectionDescription}>Connection to victim and other details</p>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Relationship to Victim</label>
              <div style={styles.dropdownInput} onClick={() => showDropdown('perpRelationship', relationships)}>
                <span style={{ color: !formData.perpRelationship ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                  {formData.perpRelationship || 'Select relationship'}
                </span>
                <ChevronDown size={20} color={styles.colors.textSecondary} />
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Occupation (if known)</label>
              <input
                style={styles.input}
                placeholder="Enter occupation"
                value={formData.perpOccupation}
                onChange={(e) => setFormData(prev => ({ ...prev, perpOccupation: e.target.value }))}
              />
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Additional Information</h3>
              <p style={styles.sectionDescription}>Identifying details and description</p>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Last Known Location</label>
              <input
                style={styles.input}
                placeholder="e.g., TUP Manila Campus"
                value={formData.perpCityMun}
                onChange={(e) => setFormData(prev => ({ ...prev, perpCityMun: e.target.value }))}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Description</label>
              <textarea
                style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                placeholder="Physical description or other identifying information..."
                value={formData.incidentDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, incidentDescription: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIncidentDetails = () => (
    <div style={styles.stepContainer}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div>
          <div style={{ ...styles.sectionCard, marginBottom: '24px' }}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Incident Details</h3>
              <p style={styles.sectionDescription}>Date and description of what happened</p>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>
                Date of Latest Incident
                <span style={styles.requiredStar}> *</span>
              </label>
              <div style={styles.dateInput} onClick={() => showDatePickerModal('latestIncidentDate')}>
                <span style={{ color: !formData.latestIncidentDate ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                  {formData.latestIncidentDate || 'Select date'}
                </span>
                <Calendar size={20} color={styles.colors.textSecondary} />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Description of Incident</label>
              <textarea
                style={{ ...styles.input, minHeight: '200px', resize: 'vertical' }}
                placeholder="Provide a detailed description of what happened, including dates, times, locations, and any other relevant information..."
                value={formData.incidentDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, incidentDescription: e.target.value }))}
              />
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Location Details</h3>
              <p style={styles.sectionDescription}>Where the incident occurred</p>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Place of Incident</label>
              <div style={styles.dropdownInput} onClick={() => showDropdown('placeOfIncident', places)}>
                <span style={{ color: !formData.placeOfIncident ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                  {formData.placeOfIncident || 'Select place of incident'}
                </span>
                <ChevronDown size={20} color={styles.colors.textSecondary} />
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Address Details</label>
              <input
                style={styles.input}
                placeholder="Specific location details..."
                value={formData.incidentBarangay}
                onChange={(e) => setFormData(prev => ({ ...prev, incidentBarangay: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div>
          <div style={{ ...styles.sectionCard, marginBottom: '24px' }}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Incident Classification</h3>
              <p style={styles.sectionDescription}>
                Select all applicable incident types
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                  (Not sure? Chat with our chatbot)
                </span>
              </p>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>
                Type of Incident
                <span style={styles.requiredStar}> *</span>
              </label>
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                {incidentTypesList.map(type => (
                  <div
                    key={type}
                    style={{
                      ...styles.optionCard,
                      borderColor: formData.incidentTypes.includes(type) ? styles.colors.primary : styles.colors.border,
                      backgroundColor: formData.incidentTypes.includes(type) ? styles.colors.ultraLightBackground : 'white',
                      marginBottom: '8px'
                    }}
                    onClick={() => toggleIncidentType(type)}
                  >
                    <span style={{
                      fontSize: '13px',
                      color: formData.incidentTypes.includes(type) ? styles.colors.primary : styles.colors.textPrimary
                    }}>
                      {type}
                    </span>
                    {formData.incidentTypes.includes(type) && (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        backgroundColor: styles.colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Check size={12} color="white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Witness Information</h3>
              <p style={styles.sectionDescription}>Details of any witnesses (if applicable)</p>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Witness Name (if any)</label>
              <input
                style={styles.input}
                placeholder="Enter witness name"
                value={formData.witnessName}
                onChange={(e) => setFormData(prev => ({ ...prev, witnessName: e.target.value }))}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Witness Contact</label>
              <input
                style={styles.input}
                placeholder="Contact information"
                value={formData.witnessContact}
                onChange={(e) => setFormData(prev => ({ ...prev, witnessContact: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div style={styles.stepContainer}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div>
          <div style={{ ...styles.sectionCard, marginBottom: '24px' }}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Report Summary</h3>
              <p style={styles.sectionDescription}>Review your report details</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <p style={styles.summaryLabel}>Reporting Mode</p>
                <p style={styles.summaryValue}>{isAnonymous ? 'Anonymous' : 'Identified'}</p>
              </div>

              {!isAnonymous && (
                <div>
                  <p style={styles.summaryLabel}>Victim-Survivor</p>
                  <p style={styles.summaryValue}>{formData.firstName} {formData.lastName}</p>
                  <p style={styles.summarySubtext}>Age: {formData.age || 'Not provided'}</p>
                </div>
              )}

              <div>
                <p style={styles.summaryLabel}>Incident Date</p>
                <p style={styles.summaryValue}>{formData.latestIncidentDate || 'Not provided'}</p>
              </div>

              <div>
                <p style={styles.summaryLabel}>Incident Types</p>
                <p style={styles.summaryValue}>
                  {formData.incidentTypes.length > 0
                    ? formData.incidentTypes.slice(0, 2).join(', ') + (formData.incidentTypes.length > 2 ? `, +${formData.incidentTypes.length - 2} more` : '')
                    : 'Not specified'}
                </p>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Additional Notes</label>
              <textarea
                style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
                placeholder="Any additional information or context..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              />
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Attachments</h3>
              <p style={styles.sectionDescription}>Supporting documents and evidence</p>
            </div>
            {formData.attachments.length === 0 ? (
              <div style={styles.emptyAttachments}>
                <FileText size={24} color={styles.colors.textSecondary} />
                <p style={{ margin: '12px 0 0 0', color: styles.colors.textSecondary, fontSize: '14px' }}>
                  No attachments added
                </p>
              </div>
            ) : (
              <div>
                {formData.attachments.map((attachment, index) => (
                  <div key={index} style={styles.attachmentItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {attachment.type === 'image' && <ImageIcon size={16} color={styles.colors.textSecondary} />}
                      {attachment.type === 'video' && <Video size={16} color={styles.colors.textSecondary} />}
                      {attachment.type === 'pdf' && <FileText size={16} color={styles.colors.textSecondary} />}
                      <span style={{ fontSize: '14px', color: styles.colors.textPrimary }}>
                        {attachment.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      style={styles.removeAttachmentButton}
                    >
                      <X size={16} color={styles.colors.textSecondary} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              style={styles.addAttachmentButton}
              onClick={pickFiles}
            >
              <Upload size={18} style={{ marginRight: '8px' }} />
              Add Attachments
            </button>
          </div>
        </div>

        <div>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Final Verification</h3>
              <p style={styles.sectionDescription}>Confirm before submission</p>
            </div>
            <div style={styles.verificationBox}>
              <div
                style={styles.checkboxContainer}
                onClick={() => setFormData(prev => ({ ...prev, confirmAccuracy: !prev.confirmAccuracy }))}
              >
                <div style={{
                  ...styles.checkbox,
                  backgroundColor: formData.confirmAccuracy ? styles.colors.primary : 'white',
                  borderColor: formData.confirmAccuracy ? styles.colors.primary : styles.colors.border
                }}>
                  {formData.confirmAccuracy && <Check size={16} color="white" />}
                </div>
                <span style={styles.checkboxLabel}>
                  I confirm that all information provided is accurate to the best of my knowledge
                </span>
                <span style={styles.requiredStar}> *</span>
              </div>

              <div
                style={{ ...styles.checkboxContainer, marginTop: '16px' }}
                onClick={() => setFormData(prev => ({ ...prev, confirmConfidentiality: !prev.confirmConfidentiality }))}
              >
                <div style={{
                  ...styles.checkbox,
                  backgroundColor: formData.confirmConfidentiality ? styles.colors.primary : 'white',
                  borderColor: formData.confirmConfidentiality ? styles.colors.primary : styles.colors.border
                }}>
                  {formData.confirmConfidentiality && <Check size={16} color="white" />}
                </div>
                <span style={styles.checkboxLabel}>
                  I understand this report will be handled confidentially by the TUP GAD Office
                </span>
                <span style={styles.requiredStar}> *</span>
              </div>
            </div>

            <div style={styles.warningBox}>
              <AlertCircle size={18} color={styles.colors.warning} />
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: styles.colors.textPrimary, fontWeight: '500' }}>
                  Important: Report Submission
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: styles.colors.textSecondary, lineHeight: '1.5' }}>
                  Upon submission, you will receive a unique ticket number to track your report status.
                  Please save this number for future reference.
                </p>
              </div>
            </div>

            <button
              style={{
                ...styles.submitButton,
                backgroundColor: !formData.confirmAccuracy || !formData.confirmConfidentiality
                  ? styles.colors.border
                  : styles.colors.primary,
                cursor: !formData.confirmAccuracy || !formData.confirmConfidentiality
                  ? 'not-allowed'
                  : 'pointer',
                boxShadow: !formData.confirmAccuracy || !formData.confirmConfidentiality
                  ? 'none'
                  : '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
              onClick={handleSubmit}
              disabled={loading || !formData.confirmAccuracy || !formData.confirmConfidentiality}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={styles.spinner}></div>
                  <span style={{ marginLeft: '8px' }}>Submitting...</span>
                </div>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderAnonymitySelection();
      case 2: return renderVictimInfo();
      case 3: return isAnonymous ? renderPerpetratorInfo() : renderGuardianInfo();
      case 4: return isAnonymous ? renderIncidentDetails() : renderPerpetratorInfo();
      case 5: return isAnonymous ? renderConfirmation() : renderIncidentDetails();
      case 6: return renderConfirmation();
      default: return null;
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentStep > 1 && (
            <button style={styles.backButton} onClick={handleBack}>
              <ArrowLeft size={24} color={styles.colors.textPrimary} />
            </button>
          )}
          <div>
            <h1 style={styles.mainTitle}>TUP GAD Incident Report</h1>
            <p style={styles.mainSubtitle}>Secure • Confidential • Professional</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentStep > 1 && currentStep < totalSteps && (
            <button style={styles.saveButton} onClick={saveProgress}>
              <Save size={18} color={styles.colors.primary} />
              <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '600' }}>Save Draft</span>
            </button>
          )}
        </div>
      </div>

      {currentStep > 1 && renderProgressBar()}

      <div style={styles.content}>
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div style={styles.navigation}>
        {currentStep > 1 && !isLastStep && (
          <button style={styles.secondaryButton} onClick={handleBack}>
            Back
          </button>
        )}

        {!isLastStep && (
          <button
            style={styles.primaryButton}
            onClick={handleNext}
          >
            Continue
          </button>
        )}
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div style={styles.modalOverlay} onClick={() => setShowDatePicker(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: styles.colors.textPrimary }}>Select Date</h3>
              <button onClick={() => setShowDatePicker(false)} style={styles.modalDoneButton}>
                Done
              </button>
            </div>
            <input
              type="date"
              value={formData[datePickerField] ?
                new Date(formData[datePickerField]).toISOString().split('T')[0] :
                new Date().toISOString().split('T')[0]}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              style={styles.datePickerInput}
            />
          </div>
        </div>
      )}

      {/* Dropdown Modal */}
      {dropdownVisible && (
        <div style={styles.modalOverlay} onClick={() => setDropdownVisible(false)}>
          <div style={styles.dropdownModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.dropdownTitle}>Select Option</h3>
            <div style={styles.dropdownList}>
              {dropdownOptions.map((option, index) => (
                <button
                  key={index}
                  style={styles.dropdownOption}
                  onClick={() => selectDropdownOption(option)}
                >
                  <span style={styles.dropdownOptionText}>{option}</span>
                  {formData[dropdownField] === option && <Check size={20} color={styles.colors.primary} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Professional Color Scheme
const colors = {
  primary: '#2563eb',       // Professional blue
  secondary: '#475569',     // Neutral slate
  background: '#ffffff',    // White background
  lightBackground: '#f8fafc',
  ultraLightBackground: '#f1f5f9',
  border: '#e2e8f0',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  white: '#ffffff'
};

// Styles
const styles = {
  colors,
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 32px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: colors.background,
    minHeight: '100vh',
    color: colors.textPrimary
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '48px',
    paddingBottom: '24px',
    borderBottom: `1px solid ${colors.border}`
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: colors.lightBackground
    }
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: colors.textPrimary,
    margin: '0 0 4px 0',
    letterSpacing: '-0.025em',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  mainSubtitle: {
    fontSize: '14px',
    color: colors.textSecondary,
    margin: 0,
    fontWeight: '500',
    letterSpacing: '0.025em'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: colors.lightBackground,
    color: colors.primary,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    ':hover': {
      backgroundColor: colors.ultraLightBackground,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }
  },
  progressContainer: {
    marginBottom: '48px'
  },
  progressText: {
    fontSize: '14px',
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: '0.025em'
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  stepDot: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: `2px solid`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  progressBar: {
    height: '4px',
    backgroundColor: colors.ultraLightBackground,
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '16px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    transition: 'width 0.3s ease',
    borderRadius: '2px'
  },
  stepTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: colors.textPrimary,
    margin: '0 0 12px 0',
    lineHeight: '1.2'
  },
  stepSubtitle: {
    fontSize: '16px',
    color: colors.textSecondary,
    margin: '0 0 0 0',
    lineHeight: '1.6'
  },
  content: {
    marginBottom: '48px'
  },
  stepContainer: {
    backgroundColor: colors.background,
    borderRadius: '12px'
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: '12px',
    padding: '32px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
    transition: 'box-shadow 0.2s',
    ':hover': {
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)'
    }
  },
  sectionHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${colors.border}`
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: colors.textPrimary,
    margin: '0 0 8px 0'
  },
  sectionDescription: {
    fontSize: '14px',
    color: colors.textSecondary,
    margin: 0,
    lineHeight: '1.5'
  },
  inputGroup: {
    marginBottom: '24px'
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: '8px',
    letterSpacing: '-0.01em'
  },
  requiredStar: {
    color: colors.error,
    marginLeft: '4px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '14px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    boxSizing: 'border-box',
    backgroundColor: colors.white,
    color: colors.textPrimary,
    transition: 'all 0.2s',
    lineHeight: '1.5',
    ':focus': {
      outline: 'none',
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px rgba(37, 99, 235, 0.1)`
    },
    '::placeholder': {
      color: colors.textSecondary,
      opacity: 0.7
    }
  },
  selectInput: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '14px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    boxSizing: 'border-box',
    backgroundColor: colors.white,
    color: colors.textPrimary,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    backgroundSize: '16px',
    paddingRight: '48px',
    transition: 'all 0.2s',
    cursor: 'pointer',
    ':focus': {
      outline: 'none',
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px rgba(37, 99, 235, 0.1)`
    }
  },
  dateInput: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.white,
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: colors.primary,
      backgroundColor: colors.lightBackground
    }
  },
  dropdownInput: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.white,
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: colors.primary,
      backgroundColor: colors.lightBackground
    }
  },
  optionGroup: {
    display: 'flex',
    gap: '12px'
  },
  optionButton: {
    flex: 1,
    padding: '14px 16px',
    border: `1px solid`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: colors.white,
    ':hover': {
      transform: 'translateY(-1px)'
    }
  },
  optionCard: {
    padding: '16px',
    border: `1px solid`,
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.2s',
    backgroundColor: colors.white,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  },
  anonymityCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '32px',
    border: `2px solid`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
    ':hover': {
      transform: 'translateY(-4px)'
    }
  },
  anonymityIconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    flexShrink: 0,
    transition: 'all 0.3s'
  },
  anonymityContent: {
    flex: 1
  },
  anonymityTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    transition: 'color 0.2s',
    letterSpacing: '-0.01em'
  },
  featureList: {
    margin: 0,
    paddingLeft: '20px',
    color: colors.textSecondary,
    fontSize: '14px',
    lineHeight: '1.6',
    listStyleType: 'none',
    li: {
      position: 'relative',
      marginBottom: '8px',
      ':before': {
        content: '"✓"',
        position: 'absolute',
        left: '-20px',
        color: colors.primary,
        fontWeight: 'bold'
      }
    }
  },
  checkCircle: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    width: '28px',
    height: '28px',
    borderRadius: '14px',
    backgroundColor: colors.success,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 8px rgba(5, 150, 105, 0.3)'
  },
  savedProgressBanner: {
    padding: '20px',
    backgroundColor: colors.lightBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    marginTop: '32px',
    borderLeft: `4px solid ${colors.success}`
  },
  savedProgressText: {
    fontSize: '14px',
    color: colors.success,
    fontWeight: '600',
    display: 'block',
    marginBottom: '4px'
  },
  importantNote: {
    padding: '24px',
    backgroundColor: colors.lightBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    borderLeft: `4px solid ${colors.primary}`
  },
  verificationBox: {
    backgroundColor: colors.ultraLightBackground,
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: `1px solid ${colors.border}`
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    cursor: 'pointer',
    padding: '16px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: colors.lightBackground
    }
  },
  checkbox: {
    width: '24px',
    height: '24px',
    border: `2px solid`,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
    flexShrink: 0,
    transition: 'all 0.2s'
  },
  checkboxLabel: {
    fontSize: '14px',
    color: colors.textPrimary,
    lineHeight: '1.5',
    flex: 1,
    fontWeight: '500'
  },
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '20px',
    backgroundColor: '#fffbeb',
    border: `1px solid #fde68a`,
    borderRadius: '12px',
    gap: '16px',
    marginBottom: '24px',
    borderLeft: `4px solid ${colors.warning}`
  },
  summaryLabel: {
    fontSize: '12px',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    margin: '0 0 8px 0',
    fontWeight: '600'
  },
  summaryValue: {
    fontSize: '16px',
    color: colors.textPrimary,
    fontWeight: '600',
    margin: '0 0 4px 0',
    lineHeight: '1.4'
  },
  summarySubtext: {
    fontSize: '14px',
    color: colors.textSecondary,
    margin: 0,
    lineHeight: '1.4'
  },
  navigation: {
    paddingTop: '40px',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  secondaryButton: {
    padding: '14px 28px',
    backgroundColor: colors.white,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '-0.01em',
    ':hover': {
      backgroundColor: colors.lightBackground,
      borderColor: colors.primary,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  },
  primaryButton: {
    padding: '14px 36px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '-0.01em',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    ':hover': {
      backgroundColor: '#1d4ed8',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)'
    }
  },
  submitButton: {
    width: '100%',
    padding: '16px 28px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '-0.01em',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: `2px solid rgba(255, 255, 255, 0.3)`,
    borderTop: `2px solid white`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '32px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${colors.border}`
  },
  modalDoneButton: {
    background: 'none',
    border: 'none',
    color: colors.primary,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: colors.lightBackground
    }
  },
  datePickerInput: {
    width: '100%',
    padding: '16px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '16px',
    color: colors.textPrimary,
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px rgba(37, 99, 235, 0.1)`
    }
  },
  dropdownModal: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    width: '90%',
    maxWidth: '400px',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
  },
  dropdownTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.textPrimary,
    padding: '24px',
    margin: 0,
    borderBottom: `1px solid ${colors.border}`
  },
  dropdownList: {
    maxHeight: '400px',
    overflowY: 'auto'
  },
  dropdownOption: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: `1px solid ${colors.lightBackground}`,
    background: 'none',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s',
    fontSize: '14px',
    color: colors.textPrimary,
    ':hover': {
      backgroundColor: colors.lightBackground
    }
  },
  dropdownOptionText: {
    fontSize: '14px',
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '500'
  },
  emptyAttachments: {
    textAlign: 'center',
    padding: '48px 32px',
    border: `2px dashed ${colors.border}`,
    borderRadius: '12px',
    marginBottom: '24px',
    backgroundColor: colors.lightBackground
  },
  attachmentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: `1px solid ${colors.border}`,
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: colors.lightBackground
    },
    ':last-child': {
      borderBottom: 'none'
    }
  },
  removeAttachmentButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: colors.ultraLightBackground,
      transform: 'scale(1.1)'
    }
  },
  addAttachmentButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: colors.white,
    color: colors.textPrimary,
    border: `2px dashed ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: colors.primary,
      backgroundColor: colors.lightBackground,
      transform: 'translateY(-1px)'
    }
  }
};

// Add spinner animation
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ReportForm;