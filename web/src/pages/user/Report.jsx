import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, Calendar, ChevronDown, Check, Upload, X,
  Image as ImageIcon, Video, Info, Shield, AlertCircle, FileText, User
} from 'lucide-react';
import { createReport } from '../../api/report';
import { checkSpamReport } from "../../api/ai";
import { generateReportPDF, sendPDFToEmail } from '../../utils/generateReportPDF';
import { getUserProfile } from '../../api/user';

// ============ STYLES OBJECT ============
const colors = {
  primary: '#2563eb',
  secondary: '#475569',
  background: '#ffffff',
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
    justifyContent: 'center'
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
    fontWeight: '500'
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
    fontSize: '14px'
  },
  progressContainer: {
    marginBottom: '48px'
  },
  progressText: {
    fontSize: '14px',
    color: colors.textSecondary,
    fontWeight: '600'
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
    margin: '0 0 12px 0'
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
    marginBottom: '24px'
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
    margin: 0
  },
  inputGroup: {
    marginBottom: '20px'
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: '8px'
  },
  requiredStar: {
    color: colors.error
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '14px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    boxSizing: 'border-box',
    backgroundColor: colors.white,
    color: colors.textPrimary
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '14px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    boxSizing: 'border-box',
    backgroundColor: colors.white,
    color: colors.textPrimary,
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit'
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
    cursor: 'pointer'
  },
  dateInput: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.white,
    cursor: 'pointer'
  },
  dropdownInput: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.white,
    cursor: 'pointer'
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
    backgroundColor: colors.white
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    backgroundColor: colors.ultraLightBackground,
    borderRadius: '12px',
    marginBottom: '24px',
    border: `1px solid ${colors.border}`
  },
  toggleSwitch: {
    position: 'relative',
    width: '52px',
    height: '28px',
    backgroundColor: colors.border,
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary
  },
  toggleThumb: {
    position: 'absolute',
    top: '3px',
    left: '3px',
    width: '22px',
    height: '22px',
    backgroundColor: colors.white,
    borderRadius: '50%',
    transition: 'transform 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },
  toggleThumbActive: {
    transform: 'translateX(24px)'
  },
  optionCard: {
    padding: '16px',
    border: `1px solid`,
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    marginBottom: '12px'
  },
  importantNote: {
    padding: '24px',
    backgroundColor: colors.lightBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    marginTop: '32px'
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
    borderRadius: '8px'
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
    flexShrink: 0
  },
  checkboxLabel: {
    fontSize: '14px',
    color: colors.textPrimary,
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
    marginBottom: '24px'
  },
  summaryLabel: {
    fontSize: '12px',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    margin: '0 0 8px 0',
    fontWeight: '600'
  },
  summaryValue: {
    fontSize: '16px',
    color: colors.textPrimary,
    fontWeight: '600',
    margin: '0 0 4px 0'
  },
  summarySubtext: {
    fontSize: '14px',
    color: colors.textSecondary,
    margin: 0
  },
  navigation: {
    paddingTop: '40px',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between'
  },
  secondaryButton: {
    padding: '14px 28px',
    backgroundColor: colors.white,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
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
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
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
    zIndex: 1000
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
    padding: '8px 16px'
  },
  datePickerInput: {
    width: '100%',
    padding: '16px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '16px',
    color: colors.textPrimary
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
    background: 'none',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    color: colors.textPrimary,
    borderBottom: `1px solid ${colors.lightBackground}`
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
    backgroundColor: colors.lightBackground,
    borderRadius: '8px',
    marginBottom: '8px'
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
    color: colors.error
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
    gap: '8px'
  },
  modalCloseButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textSecondary
  }
};

const ReportForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownField, setDropdownField] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [aiValidationResult, setAiValidationResult] = useState(null);
  const [showAIValidation, setShowAIValidation] = useState(false);
  
  const [usePersonalInfo, setUsePersonalInfo] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [formData, setFormData] = useState({
    lastName: '', firstName: '', middleName: '', alias: '', sex: '',
    dateOfBirth: '', age: '', civilStatus: '', educationalAttainment: '',
    nationality: '', passportNo: '', occupation: '', religion: '',
    region: '', province: '', cityMun: '', barangay: '',
    disability: '', numberOfChildren: '', agesOfChildren: '',
    guardianLastName: '', guardianFirstName: '', guardianMiddleName: '',
    guardianRelationship: '', guardianRegion: '', guardianProvince: '',
    guardianCityMun: '', guardianBarangay: '', guardianContact: '',

    reporterRole: '', tupRole: '', reporterGender: '', reporterDepartment: '',

    perpLastName: '', perpFirstName: '', perpMiddleName: '', perpAlias: '',
    perpSex: '', perpDateOfBirth: '', perpAge: '', perpCivilStatus: '',
    perpEducation: '', perpNationality: '', perpPassport: '', perpOccupation: '',
    perpReligion: '', perpRegion: '', perpProvince: '', perpCityMun: '',
    perpBarangay: '', perpRelationship: '',

    incidentTypes: [], otherIncidentType: '', incidentDescription: '', latestIncidentDate: '',
    incidentRegion: '', incidentProvince: '', incidentCityMun: '', incidentBarangay: '',
    placeOfIncident: '', witnessName: '', witnessAddress: '', witnessContact: '',
    witnessAccount: '', witnessDate: '',

    attachments: [], additionalNotes: '', confirmAccuracy: false,
    confirmConfidentiality: false,
  });

  const totalSteps = 4;

  const regions = ['NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B', 'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X', 'Region XI', 'Region XII', 'Region XIII', 'CAR', 'BARMM'];
  const civilStatuses = ['Single', 'Married', 'Live In', 'Widowed', 'Separated'];
  const educationLevels = ['No Formal Education', 'Elementary', 'High School', 'Vocational', 'College', 'Post Graduate'];
  const religions = ['Roman Catholic', 'Islam', 'Protestant', 'Iglesia ni Kristo', 'Aglipayan', 'Other'];
  const disabilities = ['Without Disability', 'Permanent Disability', 'Temporary Disability'];
  const relationships = ['Current spouse/partner', 'Former spouse/partner', 'Parent/Guardian', 'Sibling', 'Relative', 'Teacher/Professor', 'Employer/Supervisor', 'Classmate', 'Neighbor', 'Stranger', 'Other'];
  const places = ['House', 'Work', 'School', 'Commercial Place', 'Religious Institution', 'Medical Treatment', 'Transport', 'Other'];
  const incidentTypesList = [
    {
      main: 'RA 9262 - Anti-Violence Against Women and their Children Act',
      subtypes: ['Sexual Abuse', 'Psychological', 'Physical', 'Economic', 'Other']
    },
    {
      main: 'RA 8353 - Anti Rape Law of 1995',
      subtypes: ['Rape by Sexual Intercourse', 'Rape by Sexual Assault']
    },
    {
      main: 'RA 7877 - Anti Sexual Harassment Act',
      subtypes: ['Verbal', 'Physical', 'Use objects picture letter or notes with sexual under pinning\'s']
    },
    {
      main: 'RA 7610 - Special Protection of Children Against Child Abuse, Exploitation and Dissemination Act',
      subtypes: ['Engage facilitate promote or attempt to commit child prostitution', 'Sexual Intercourse or lascivious conduct']
    },
    {
      main: 'RA 9208 - Anti Trafficking in Persons Act of 2003',
      subtypes: []
    },
    {
      main: 'RA 9775 - Anti Child Pornography Act',
      subtypes: []
    },
    {
      main: 'RA 9995 - Anti Photo and Video Voyeurism Act 2009',
      subtypes: []
    },
    {
      main: 'Revised Penal Code',
      subtypes: ['Art 300 - Acts of Lasciviousness', 'Others']
    }
  ];

  useEffect(() => {
    loadSavedProgress();
  }, []);

  const calculateAge = (birthday) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const storedUser = localStorage.getItem("user");
      
      if (!storedUser) {
        showAlert('Error', 'User not found. Please log in again.');
        setLoadingProfile(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser._id || parsedUser.id;

      if (!userId) {
        showAlert('Error', 'User ID not found. Please log in again.');
        setLoadingProfile(false);
        return;
      }

      console.log("📋 Fetching profile for user ID:", userId);

      const data = await getUserProfile(userId);

      const calculatedAge = data.birthday ? calculateAge(data.birthday) : '';

      const formattedBirthday = data.birthday ? new Date(data.birthday).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }) : '';

      setFormData(prev => ({
        ...prev,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        reporterGender: data.gender || '',
        dateOfBirth: formattedBirthday,
        age: calculatedAge,
        guardianContact: data.guardianContact || '',
        reporterDepartment: data.department || prev.reporterDepartment,
      }));

    } catch (error) {
      console.error('Error fetching user profile:', error);
      showAlert('Error', 'Failed to load your profile information.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleTogglePersonalInfo = async () => {
    const newToggleState = !usePersonalInfo;
    setUsePersonalInfo(newToggleState);

    if (newToggleState) {
      await fetchUserProfile();
    } else {
      setFormData(prev => ({
        ...prev,
        lastName: '',
        firstName: '',
        middleName: '',
        reporterGender: '',
        dateOfBirth: '',
        age: '',
        civilStatus: '',
        guardianContact: ''
      }));
    }
  };

  const loadSavedProgress = () => {
    try {
      const saved = localStorage.getItem('reportProgress');
      if (saved) {
        const data = JSON.parse(saved);
        setFormData(data.formData);
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

  // ============ UPDATED INCIDENT TYPE LOGIC ============
  const toggleIncidentType = (type) => {
    setFormData(prev => {
      const currentTypes = [...prev.incidentTypes];
      
      // Check if this is a subtype (contains " - ")
      const isSubtype = type.includes(' - ');
      
      if (isSubtype) {
        // Extract main type from subtype
        const mainType = type.split(' - ')[0];
        
        if (currentTypes.includes(type)) {
          // Unchecking a subtype
          const remainingSubtypes = currentTypes.filter(t => 
            t.startsWith(mainType + ' - ') && t !== type
          );
          
          // If no subtypes remain for this main type, also remove the main type
          if (remainingSubtypes.length === 0) {
            return {
              ...prev,
              incidentTypes: currentTypes.filter(t => t !== type && t !== mainType)
            };
          } else {
            return {
              ...prev,
              incidentTypes: currentTypes.filter(t => t !== type)
            };
          }
        } else {
          // Checking a subtype - automatically add main type if not present
          if (!currentTypes.includes(mainType)) {
            return {
              ...prev,
              incidentTypes: [...currentTypes, mainType, type]
            };
          } else {
            return {
              ...prev,
              incidentTypes: [...currentTypes, type]
            };
          }
        }
      } else {
        // This is a main type
        const category = incidentTypesList.find(cat => cat.main === type);
        
        if (currentTypes.includes(type)) {
          // Unchecking main type - also remove all its subtypes
          return {
            ...prev,
            incidentTypes: currentTypes.filter(t => 
              t !== type && !t.startsWith(type + ' - ')
            )
          };
        } else {
          // Checking main type
          if (category && category.subtypes.length > 0) {
            // Main type with subtypes - just add the main type
            // User will need to select subtypes separately
            return {
              ...prev,
              incidentTypes: [...currentTypes, type]
            };
          } else {
            // Main type without subtypes - just add it
            return {
              ...prev,
              incidentTypes: [...currentTypes, type]
            };
          }
        }
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.confirmAccuracy || !formData.confirmConfidentiality) {
      showAlert("Required", "Please confirm all statements before submitting.");
      return;
    }

    setLoading(true);
    setAiValidationResult(null);

    try {
      console.log("🔍 [1] Starting submission...");

      const aiCheck = await checkSpamReport({
        incidentDescription: formData.incidentDescription || "",
        additionalNotes: formData.additionalNotes || "",
        witnessAccount: formData.witnessAccount || "",
      });

      console.log("✅ [2] AI Response RECEIVED:", aiCheck.data);

      if (!aiCheck.data.allowed) {
        console.log("❌ AI BLOCKED DETECTED! Showing modal...");
        setAiValidationResult({
          allowed: false,
          reason: aiCheck.data.reason || "Your report lacks meaningful details.",
          details: {
            incidentDescription: formData.incidentDescription,
            additionalNotes: formData.additionalNotes,
            witnessAccount: formData.witnessAccount
          }
        });
        setShowAIValidation(true);
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      const isAnonymous = !formData.firstName && !formData.lastName;
      submitData.append('isAnonymous', String(isAnonymous));

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

      formData.attachments.forEach(attachment => {
        submitData.append('attachments', attachment.file);
      });

      const response = await createReport(submitData);
      const ticketNumber = response?.data?.ticketNumber || response?.ticketNumber || 'TUP-' + Date.now().toString().slice(-8);

      const pdfBlob = generateReportPDF({
        formData,
        ticketNumber,
        isAnonymous,
      });

      try {
        await sendPDFToEmail(pdfBlob, ticketNumber);
        console.log('✅ PDF sent to your registered email successfully');
      } catch (emailError) {
        console.error('❌ Failed to send PDF email:', emailError);
      }

      await clearProgress();

      showAlert(
        'Report Submitted Successfully',
        `Your report has been received.\n\nTicket Number: ${ticketNumber}\n\nA copy has been downloaded and sent to your registered email.`
      );

      setCurrentStep(1);
      setUsePersonalInfo(false);
      setFormData({
        lastName: '', firstName: '', middleName: '', alias: '', sex: '',
        dateOfBirth: '', age: '', civilStatus: '', educationalAttainment: '',
        nationality: '', passportNo: '', occupation: '', religion: '',
        region: '', province: '', cityMun: '', barangay: '',
        disability: '', numberOfChildren: '', agesOfChildren: '',
        guardianLastName: '', guardianFirstName: '', guardianMiddleName: '',
        guardianRelationship: '', guardianRegion: '', guardianProvince: '',
        guardianCityMun: '', guardianBarangay: '', guardianContact: '',
        reporterRole: '', tupRole: '', reporterGender: '', reporterDepartment: '',
        perpLastName: '', perpFirstName: '', perpMiddleName: '', perpAlias: '',
        perpSex: '', perpDateOfBirth: '', perpAge: '', perpCivilStatus: '',
        perpEducation: '', perpNationality: '', perpPassport: '', perpOccupation: '',
        perpReligion: '', perpRegion: '', perpProvince: '', perpCityMun: '',
        perpBarangay: '', perpRelationship: '',
        incidentTypes: [], otherIncidentType: '', incidentDescription: '', latestIncidentDate: '',
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
      if (!formData.reporterRole || !formData.tupRole || !formData.reporterDepartment) {
        showAlert('Required', 'Please provide your role, TUP affiliation, and Department.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (formData.incidentTypes.length === 0) {
        showAlert('Required', 'Please select at least one incident type.');
        return false;
      }
      
      // Check if main types with subtypes have at least one subtype selected
      for (const category of incidentTypesList) {
        if (category.subtypes.length > 0 && formData.incidentTypes.includes(category.main)) {
          const hasSubtype = formData.incidentTypes.some(type => 
            type.startsWith(category.main + ' - ')
          );
          if (!hasSubtype) {
            showAlert('Required', `Please select at least one subtype for "${category.main}"`);
            return false;
          }
        }
      }
      
      if (!formData.incidentDescription.trim()) {
        showAlert('Required', 'Please provide an incident description.');
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
      "Reporter Information",
      "Incident Details",
      "Perpetrator & Witness Information",
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

  const renderReporterInfo = () => (
    <div style={styles.stepContainer}>
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '32px',
            backgroundColor: styles.colors.ultraLightBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: `1px solid ${styles.colors.border}`,
          }}>
            <Shield size={32} color={styles.colors.primary} />
          </div>
          <h3 style={{ ...styles.sectionTitle, textAlign: 'center', fontSize: '24px' }}>Your Information</h3>
          <p style={{ ...styles.sectionDescription, textAlign: 'center', marginBottom: '32px' }}>
            Help us understand your situation better. Fields marked with * are required.
          </p>
        </div>

        <div style={styles.toggleContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <User size={20} color={styles.colors.primary} />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0', color: styles.colors.textPrimary }}>
                Use My Profile Information
              </h4>
              <p style={{ fontSize: '13px', color: styles.colors.textSecondary, margin: 0 }}>
                {loadingProfile ? 'Loading your profile...' : 
                 usePersonalInfo ? 'Profile information loaded' : 
                 'Auto-fill from your TUP profile'}
              </p>
            </div>
          </div>
          <div
            style={{
              ...styles.toggleSwitch,
              ...(usePersonalInfo ? styles.toggleSwitchActive : {})
            }}
            onClick={handleTogglePersonalInfo}
          >
            <div
              style={{
                ...styles.toggleThumb,
                ...(usePersonalInfo ? styles.toggleThumbActive : {})
              }}
            />
          </div>
        </div>

        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: styles.colors.textPrimary }}>
          Required Context
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
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
            <option value="Person Involved">Person Involved</option> 
            <option value="Witness">Witness</option>
            <option value="Friend/Family/Colleague">Friend/Family/Colleague</option>
            <option value="Reporter">Mandatory Reporter</option>
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

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>
              Department
              <span style={styles.requiredStar}> *</span>
            </label>
            <select
              style={styles.input}
              value={formData.reporterDepartment}
              onChange={(e) => setFormData(prev => ({ ...prev, reporterDepartment: e.target.value }))}
              required
            >
              <option value="">Select Department</option>
              <option value="BASD">Basic Arts and Science Department</option>
              <option value="CAAD">Civil and Allied Department</option>
              <option value="EEAD">Electrical and Allied Department</option>
              <option value="MAAD">Mechanical and Allied Department</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Gender</label>
            <select
              style={styles.selectInput}
              value={formData.reporterGender}
              onChange={(e) => setFormData(prev => ({ ...prev, reporterGender: e.target.value }))}
            >
              <option value="">Prefer not to say</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${styles.colors.border}`, paddingTop: '32px', marginTop: '32px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: styles.colors.textPrimary }}>
            Personal Information (Optional)
          </h4>
          <p style={{ fontSize: '13px', color: styles.colors.textSecondary, marginBottom: '24px', lineHeight: '1.6' }}>
            {usePersonalInfo 
              ? 'Information from your profile has been loaded. You can still edit or add missing details.'
              : 'Toggle "Use My Profile Information" above to auto-fill these fields, or leave blank to remain anonymous.'
            }
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Last Name</label>
              <input
                style={styles.input}
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => {
                  if (!usePersonalInfo) return;
                  setFormData(prev => ({ ...prev, lastName: e.target.value }));
                }}
                disabled={!usePersonalInfo}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>First Name</label>
              <input
                style={styles.input}
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => {
                  if (!usePersonalInfo) return;
                  setFormData(prev => ({ ...prev, firstName: e.target.value }));
                }}
                disabled={!usePersonalInfo}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Middle Name</label>
              <input
                style={styles.input}
                placeholder="Enter middle name"
                value={formData.middleName}
                onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                disabled={!usePersonalInfo}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Age</label>
              <input
                style={styles.input}
                placeholder="Age"
                type="number"
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => {
                  if (!usePersonalInfo) return;
                  setFormData(prev => ({ ...prev, age: e.target.value }));
                }}
                disabled={!usePersonalInfo}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Contact Number</label>
              <input
                style={styles.input}
                placeholder="09XXXXXXXXX"
                type="tel"
                value={formData.guardianContact}
                onChange={(e) => {
                  if (!usePersonalInfo) return;
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, guardianContact: value }));
                }}
                disabled={!usePersonalInfo}
                maxLength="11"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Civil Status</label>
              <div 
                style={{
                  ...styles.dropdownInput,
                  opacity: !usePersonalInfo ? 0.5 : 1,
                  cursor: !usePersonalInfo ? 'not-allowed' : 'pointer'
                }}
                onClick={() => usePersonalInfo && showDropdown('civilStatus', civilStatuses)}
              >
                <span style={{ color: !formData.civilStatus ? styles.colors.textSecondary : styles.colors.textPrimary }}>
                  {formData.civilStatus || 'Select'}
                </span>
                <ChevronDown size={20} color={styles.colors.textSecondary} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.importantNote}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Info size={18} color={styles.colors.textSecondary} />
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: styles.colors.textPrimary, fontWeight: '500' }}>
              Privacy & Confidentiality
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: styles.colors.textSecondary, lineHeight: '1.5' }}>
              All reports are handled with strict confidentiality by the TUP GAD Office.
              Whether you choose to remain anonymous or provide your details, your privacy is our priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIncidentDetails = () => (
    <div style={styles.stepContainer}>
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Incident Types</h3>
          <p style={styles.sectionDescription}>
            Select all types that apply to this incident
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {incidentTypesList.map((category, index) => {
            const isMainSelected = formData.incidentTypes.includes(category.main);
            const selectedSubtypes = formData.incidentTypes.filter(t => 
              t.startsWith(category.main + ' - ')
            );
            
            return (
              <div key={index} style={{ 
                border: `1px solid ${styles.colors.border}`,
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: styles.colors.lightBackground
              }}>
                {/* Main Category Checkbox */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: category.subtypes.length > 0 ? '12px' : '0'
                  }}
                  onClick={() => toggleIncidentType(category.main)}
                >
                  <div
                    style={{
                      ...styles.checkbox,
                      borderColor: isMainSelected ? styles.colors.primary : styles.colors.border,
                      backgroundColor: isMainSelected ? styles.colors.primary : 'transparent',
                      marginRight: '12px'
                    }}
                  >
                    {isMainSelected && <Check size={16} color="white" />}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: styles.colors.textPrimary }}>
                    {category.main}
                  </span>
                </div>

                {/* Subtypes if any */}
                {category.subtypes.length > 0 && (
                  <div style={{ 
                    marginLeft: '36px',
                    display: 'grid',
                    gridTemplateColumns: category.subtypes.length <= 2 ? '1fr 1fr' : '1fr',
                    gap: '8px'
                  }}>
                    {category.subtypes.map((subtype, subIndex) => {
                      const fullSubtype = `${category.main} - ${subtype}`;
                      const isSubtypeSelected = formData.incidentTypes.includes(fullSubtype);
                      
                      return (
                        <div
                          key={subIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '4px',
                            backgroundColor: isSubtypeSelected 
                              ? styles.colors.ultraLightBackground 
                              : 'transparent'
                          }}
                          onClick={() => toggleIncidentType(fullSubtype)}
                        >
                          <div
                            style={{
                              ...styles.checkbox,
                              width: '20px',
                              height: '20px',
                              borderColor: isSubtypeSelected 
                                ? styles.colors.primary 
                                : styles.colors.border,
                              backgroundColor: isSubtypeSelected 
                                ? styles.colors.primary 
                                : 'transparent',
                              marginRight: '10px'
                            }}
                          >
                            {isSubtypeSelected && (
                              <Check size={12} color="white" />
                            )}
                          </div>
                          <span style={{ fontSize: '13px', color: styles.colors.textPrimary }}>
                            {subtype}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Show warning if main is selected but no subtypes */}
                {category.subtypes.length > 0 && isMainSelected && selectedSubtypes.length === 0 && (
                  <div style={{
                    marginTop: '12px',
                    marginLeft: '36px',
                    padding: '8px 12px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#92400e'
                  }}>
                    Please select at least one subtype
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Other Input Field */}
        {(formData.incidentTypes.some(type => type.includes('Other')) || 
          formData.incidentTypes.some(type => type.includes('Others'))) && (
          <div style={{ marginTop: '16px' }}>
            <input
              style={styles.input}
              placeholder="Please specify other incident type..."
              value={formData.otherIncidentType || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, otherIncidentType: e.target.value }))}
            />
          </div>
        )}
      </div>

      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Incident Description</h3>
          <p style={styles.sectionDescription}>
            Please provide a detailed description of what happened
          </p>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>
            Description of Incident
            <span style={styles.requiredStar}> *</span>
          </label>
          <textarea
            style={styles.textarea}
            placeholder="Describe what happened in detail..."
            value={formData.incidentDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, incidentDescription: e.target.value }))}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Date of Latest Incident</label>
            <div
              style={styles.dateInput}
              onClick={() => showDatePickerModal('latestIncidentDate')}
            >
              <span style={{ color: formData.latestIncidentDate ? styles.colors.textPrimary : styles.colors.textSecondary }}>
                {formData.latestIncidentDate || 'Select date'}
              </span>
              <Calendar size={20} color={styles.colors.textSecondary} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Place of Incident</label>
            <div
              style={styles.dropdownInput}
              onClick={() => showDropdown('placeOfIncident', places)}
            >
              <span style={{ color: formData.placeOfIncident ? styles.colors.textPrimary : styles.colors.textSecondary }}>
                {formData.placeOfIncident || 'Select place'}
              </span>
              <ChevronDown size={20} color={styles.colors.textSecondary} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Region</label>
            <div
              style={styles.dropdownInput}
              onClick={() => showDropdown('incidentRegion', regions)}
            >
              <span style={{ color: formData.incidentRegion ? styles.colors.textPrimary : styles.colors.textSecondary }}>
                {formData.incidentRegion || 'Select'}
              </span>
              <ChevronDown size={20} color={styles.colors.textSecondary} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Province</label>
            <input
              style={styles.input}
              placeholder="Province"
              value={formData.incidentProvince}
              onChange={(e) => setFormData(prev => ({ ...prev, incidentProvince: e.target.value }))}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>City/Municipality</label>
            <input
              style={styles.input}
              placeholder="City/Municipality"
              value={formData.incidentCityMun}
              onChange={(e) => setFormData(prev => ({ ...prev, incidentCityMun: e.target.value }))}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Barangay</label>
            <input
              style={styles.input}
              placeholder="Barangay"
              value={formData.incidentBarangay}
              onChange={(e) => setFormData(prev => ({ ...prev, incidentBarangay: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Supporting Evidence</h3>
          <p style={styles.sectionDescription}>
            Upload any relevant documents, images, or videos (optional)
          </p>
        </div>

        {formData.attachments.length === 0 ? (
          <div style={styles.emptyAttachments}>
            <Upload size={32} color={styles.colors.textSecondary} style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '14px', color: styles.colors.textSecondary, margin: '0 0 16px 0' }}>
              No files attached yet
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            {formData.attachments.map((attachment, index) => (
              <div key={index} style={styles.attachmentItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {attachment.type === 'image' && <ImageIcon size={20} color={styles.colors.primary} />}
                  {attachment.type === 'video' && <Video size={20} color={styles.colors.primary} />}
                  {attachment.type === 'pdf' && <FileText size={20} color={styles.colors.primary} />}
                  {attachment.type === 'document' && <FileText size={20} color={styles.colors.primary} />}
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: styles.colors.textPrimary }}>
                      {attachment.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: styles.colors.textSecondary }}>
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  style={styles.removeAttachmentButton}
                  onClick={() => removeAttachment(index)}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button style={styles.addAttachmentButton} onClick={pickFiles}>
          <Upload size={20} />
          Add Files
        </button>
      </div>
    </div>
  );

  const renderPerpetratorInfo = () => (
    <div style={styles.stepContainer}>
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Perpetrator Information</h3>
          <p style={styles.sectionDescription}>
            Provide information about the person(s) involved (if known)
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Last Name</label>
            <input
              style={styles.input}
              placeholder="Last name"
              value={formData.perpLastName}
              onChange={(e) => setFormData(prev => ({ ...prev, perpLastName: e.target.value }))}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>First Name</label>
            <input
              style={styles.input}
              placeholder="First name"
              value={formData.perpFirstName}
              onChange={(e) => setFormData(prev => ({ ...prev, perpFirstName: e.target.value }))}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Middle Name</label>
            <input
              style={styles.input}
              placeholder="Middle name"
              value={formData.perpMiddleName}
              onChange={(e) => setFormData(prev => ({ ...prev, perpMiddleName: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
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
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, perpSex: sex }))}
                >
                  {sex}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Age</label>
            <input
              style={styles.input}
              placeholder="Age"
              type="number"
              min="1"
              max="120"
              value={formData.perpAge}
              onChange={(e) => setFormData(prev => ({ ...prev, perpAge: e.target.value }))}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Relationship to You</label>
            <div
              style={styles.dropdownInput}
              onClick={() => showDropdown('perpRelationship', relationships)}
            >
              <span style={{ color: formData.perpRelationship ? styles.colors.textPrimary : styles.colors.textSecondary }}>
                {formData.perpRelationship || 'Select'}
              </span>
              <ChevronDown size={20} color={styles.colors.textSecondary} />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Witness Information</h3>
          <p style={styles.sectionDescription}>
            If there were any witnesses, please provide their information (optional)
          </p>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>Witness Name</label>
          <input
            style={styles.input}
            placeholder="Full name of witness"
            value={formData.witnessName}
            onChange={(e) => setFormData(prev => ({ ...prev, witnessName: e.target.value }))}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Witness Address</label>
            <input
              style={styles.input}
              placeholder="Address"
              value={formData.witnessAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, witnessAddress: e.target.value }))}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Witness Contact</label>
            <input
              style={styles.input}
              placeholder="09XXXXXXXXX"
              type="tel"
              value={formData.witnessContact}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData(prev => ({ ...prev, witnessContact: value }));
              }}
              maxLength="11"
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>Witness Account</label>
          <textarea
            style={styles.textarea}
            placeholder="What did the witness observe?"
            value={formData.witnessAccount}
            onChange={(e) => setFormData(prev => ({ ...prev, witnessAccount: e.target.value }))}
          />
        </div>
      </div>

      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Additional Notes</h3>
          <p style={styles.sectionDescription}>
            Any other information you'd like to share
          </p>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>Additional Information</label>
          <textarea
            style={styles.textarea}
            placeholder="Include any other relevant details..."
            value={formData.additionalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div style={styles.stepContainer}>
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Review Your Report</h3>
          <p style={styles.sectionDescription}>
            Please review the information below before submitting
          </p>
        </div>

        <div style={styles.warningBox}>
          <AlertCircle size={24} color={styles.colors.warning} />
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: styles.colors.textPrimary }}>
              Important Information
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: styles.colors.textSecondary, lineHeight: '1.6' }}>
              Once submitted, your report will be reviewed by the TUP GAD Office. 
              You will receive a ticket number for tracking purposes.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          <div>
            <p style={styles.summaryLabel}>Reporter Type</p>
            <p style={styles.summaryValue}>{formData.reporterRole || 'Not specified'}</p>
            <p style={styles.summarySubtext}>
              {formData.firstName && formData.lastName 
                ? `${formData.firstName} ${formData.lastName}` 
                : 'Anonymous Reporter'}
            </p>
          </div>

          <div>
            <p style={styles.summaryLabel}>Incident Types</p>
            <p style={styles.summaryValue}>
              {formData.incidentTypes.length > 0 
                ? `${formData.incidentTypes.length} type${formData.incidentTypes.length > 1 ? 's' : ''} selected`
                : 'None selected'}
            </p>
            <p style={styles.summarySubtext}>
              {formData.latestIncidentDate || 'Date not specified'}
            </p>
          </div>
        </div>

        <div style={styles.verificationBox}>
          <div
            style={styles.checkboxContainer}
            onClick={() => setFormData(prev => ({ ...prev, confirmAccuracy: !prev.confirmAccuracy }))}
          >
            <div
              style={{
                ...styles.checkbox,
                borderColor: formData.confirmAccuracy ? styles.colors.primary : styles.colors.border,
                backgroundColor: formData.confirmAccuracy ? styles.colors.primary : 'transparent'
              }}
            >
              {formData.confirmAccuracy && <Check size={16} color="white" />}
            </div>
            <label style={styles.checkboxLabel}>
              I confirm that the information provided in this report is accurate to the best of my knowledge.
            </label>
          </div>

          <div
            style={styles.checkboxContainer}
            onClick={() => setFormData(prev => ({ ...prev, confirmConfidentiality: !prev.confirmConfidentiality }))}
          >
            <div
              style={{
                ...styles.checkbox,
                borderColor: formData.confirmConfidentiality ? styles.colors.primary : styles.colors.border,
                backgroundColor: formData.confirmConfidentiality ? styles.colors.primary : 'transparent'
              }}
            >
              {formData.confirmConfidentiality && <Check size={16} color="white" />}
            </div>
            <label style={styles.checkboxLabel}>
              I understand that this report will be handled confidentially by the TUP GAD Office.
            </label>
          </div>
        </div>

        <button
          style={{
            ...styles.submitButton,
            opacity: (!formData.confirmAccuracy || !formData.confirmConfidentiality || loading) ? 0.5 : 1,
            cursor: (!formData.confirmAccuracy || !formData.confirmConfidentiality || loading) ? 'not-allowed' : 'pointer'
          }}
          onClick={handleSubmit}
          disabled={!formData.confirmAccuracy || !formData.confirmConfidentiality || loading}
        >
          {loading ? (
            <>
              <div style={styles.spinner} />
              Submitting Report...
            </>
          ) : (
            <>
              <FileText size={20} />
              Submit Report
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderReporterInfo();
      case 2: return renderIncidentDetails();
      case 3: return renderPerpetratorInfo();
      case 4: return renderConfirmation();
      default: return null;
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

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

      {renderProgressBar()}

      <div style={styles.content}>
        {renderStepContent()}
      </div>

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

export default ReportForm;