import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, Calendar, ChevronDown, Check, Upload, X,
  Image as ImageIcon, Video, Info, Shield, AlertCircle, FileText
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { createReport } from '../../api/report';
import { checkSpamReport } from "../../api/ai";
import { generateReportPDF, sendPDFToEmail } from '../../utils/generateReportPDF';

// ============ STYLES OBJECT (NAILIPAT SA TOP) ============
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
  container: (isMobile) => ({
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '20px 16px' : '40px 32px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: colors.background,
    minHeight: '100vh',
    color: colors.textPrimary
  }),
  header: (isMobile) => ({
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    gap: isMobile ? '16px' : '0',
    marginBottom: isMobile ? '32px' : '48px',
    paddingBottom: '24px',
    borderBottom: `1px solid ${colors.border}`
  }),

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
  sectionCard: (isMobile) => ({
    backgroundColor: colors.white,
    borderRadius: '12px',
    padding: isMobile ? '20px' : '32px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
  }),

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
  optionGroup: (isMobile) => ({
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: '12px'
  }),

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
  optionCard: {
    padding: '16px',
    border: `1px solid`,
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white
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
    cursor: 'pointer'
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
    borderBottom: `1px solid ${colors.border}`
  },
  removeAttachmentButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
    justifyContent: 'center'
  },
  aiValidationModal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
  },
  aiModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    zIndex: 10
  },
  aiModalContent: {
    padding: '24px'
  },
  aiResultCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    border: '1px solid #E5E7EB'
  },
  aiDetails: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E5E7EB'
  },
  aiDetailItem: {
    marginBottom: '12px'
  },
  aiDetailLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6B7280',
    display: 'block',
    marginBottom: '4px'
  },
  aiDetailText: {
    fontSize: '14px',
    color: '#374151',
    backgroundColor: '#F9FAFB',
    padding: '8px 12px',
    borderRadius: '6px',
    borderLeft: '3px solid #E5E7EB'
  },
  aiSuggestions: {
    backgroundColor: '#F0F9FF',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    border: '1px solid #BAE6FD'
  },
  aiModalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  aiEditButton: {
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  aiSecondaryButton: {
    backgroundColor: 'white',
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
// ============ END OF STYLES ============

const ReportForm = () => {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  // ✅ Get logged-in user's profile data
  const { user } = useSelector((state) => state.auth);

  // ✅ Department code → full name mapping
  const departmentMap = {
    'BASD': 'Basic Arts and Science Department',
    'CAAD': 'Civil and Allied Department',
    'EEAD': 'Electrical and Allied Department',
    'MAAD': 'Mechanical and Allied Department',
  };

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const currentStyles = React.useMemo(() => ({
    ...styles,
    container: styles.container(isMobile),
    header: styles.header(isMobile),
    sectionCard: styles.sectionCard(isMobile),
    optionGroup: styles.optionGroup(isMobile),
  }), [isMobile]);

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const [loading, setLoading] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownField, setDropdownField] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [aiValidationResult, setAiValidationResult] = useState(null);
  const [showAIValidation, setShowAIValidation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfidentialityModal, setShowConfidentialityModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasAgreedPersistent, setHasAgreedPersistent] = useState(false);

  const [formData, setFormData] = useState({
    // Reporter/Victim Information (all optional now)
    lastName: '', firstName: '', middleName: '', alias: '', sex: '',
    dateOfBirth: '', age: '', civilStatus: '', educationalAttainment: '',
    nationality: '', passportNo: '', occupation: '', religion: '',
    region: '', province: '', cityMun: '', barangay: '',
    disability: '', numberOfChildren: '', agesOfChildren: '',
    guardianLastName: '', guardianFirstName: '', guardianMiddleName: '',
    guardianRelationship: '', guardianRegion: '', guardianProvince: '',
    guardianCityMun: '', guardianBarangay: '', guardianContact: '',

    // Reporter Context
    reporterRole: '', tupRole: '', reporterGender: '', reporterDepartment: '',

    // Perpetrator Information
    perpLastName: '', perpFirstName: '', perpMiddleName: '', perpAlias: '',
    perpSex: '', perpDateOfBirth: '', perpAge: '', perpCivilStatus: '',
    perpEducation: '', perpNationality: '', perpPassport: '', perpOccupation: '',
    perpReligion: '', perpRegion: '', perpProvince: '', perpCityMun: '',
    perpBarangay: '', perpRelationship: '',

    // Incident Information
    salaysay: '', latestIncidentDate: '',
    incidentRegion: '', incidentProvince: '', incidentCityMun: '', incidentBarangay: '',
    placeOfIncident: '', witnessName: '', witnessAddress: '', witnessContact: '',
    witnessAccount: '', witnessDate: '',

    // Additional
    attachments: [], additionalNotes: '', confirmAccuracy: false,
    confirmConfidentiality: false,
  });

  // ✅ Auto-fill gender, department, and userType from user's profile
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        reporterGender: prev.reporterGender || user.gender || '',
        reporterDepartment: prev.reporterDepartment || departmentMap[user.department] || user.department || '',
        tupRole: prev.tupRole || user.userType || '',
      }));
    }
  }, [user]);


  const totalSteps = 4;

  const regions = ['NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B', 'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X', 'Region XI', 'Region XII', 'Region XIII', 'CAR', 'BARMM'];
  const civilStatuses = ['Single', 'Married', 'Live In', 'Widowed', 'Separated'];
  const educationLevels = ['No Formal Education', 'Elementary', 'High School', 'Vocational', 'College', 'Post Graduate'];
  const religions = ['Roman Catholic', 'Islam', 'Protestant', 'Iglesia ni Kristo', 'Aglipayan', 'Other'];
  const disabilities = ['Without Disability', 'Permanent Disability', 'Temporary Disability'];
  const relationships = ['Current spouse/partner', 'Former spouse/partner', 'Parent/Guardian', 'Sibling', 'Relative', 'Teacher/Professor', 'Employer/Supervisor', 'Classmate', 'Neighbor', 'Stranger', 'Other'];
  const places = ['House', 'Work', 'School', 'Commercial Place', 'Religious Institution', 'Medical Treatment', 'Transport', 'Other'];

  useEffect(() => {
    loadSavedProgress();
    checkConfidentiality();
  }, []);

  const checkConfidentiality = () => {
    const token = localStorage.getItem('token');
    const acceptedToken = localStorage.getItem('confidentialityAcceptedToken');

    if (token && acceptedToken === token) {
      setHasAgreedPersistent(true);
    } else {
      setShowConfidentialityModal(true);
    }
  };

  const handleAcceptConfidentiality = () => {
    if (!agreedToTerms) return;

    const token = localStorage.getItem('token');
    if (token) {
      localStorage.setItem('confidentialityAcceptedToken', token);
    }
    setHasAgreedPersistent(true);
    setShowConfidentialityModal(false);
  };

  // Reset the AI validation when user edits the form


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

  const processFiles = (files) => {
    const validImages = files.filter(file => file.type.startsWith('image/'));

    if (validImages.length === 0 && files.length > 0) {
      showAlert('Invalid Files', 'Please upload images only (JPG, PNG, WEBP, etc.)');
      return;
    }

    const newAttachments = validImages.map(file => ({
      file,
      name: file.name,
      type: 'image',
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const pickFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      processFiles(files);
    };
    input.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
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


  // const handleSubmit = async () => {
  //   if (!formData.confirmAccuracy || !formData.confirmConfidentiality) {
  //     showAlert("Required", "Please confirm all statements before submitting.");
  //     return;
  //   }

  //   setLoading(true);
  //   setAiValidationResult(null); // Reset previous results

  //   try {
  //     // 🧠 AI SPAM CHECK
  //     const aiCheck = await checkSpamReport({
  //       incidentDescription: formData.incidentDescription || "",
  //       additionalNotes: formData.additionalNotes || "",
  //       witnessAccount: formData.witnessAccount || "",
  //     });

  //     if (!aiCheck.data.allowed) {
  //       // Store the AI result to show to user
  //       setAiValidationResult({
  //         allowed: false,
  //         reason: aiCheck.data.reason || "Your report lacks meaningful details.",
  //         details: {
  //           incidentDescription: formData.incidentDescription,
  //           additionalNotes: formData.additionalNotes,
  //           witnessAccount: formData.witnessAccount
  //         }
  //       });

  //       // Show the AI validation modal instead of just alert
  //       setShowAIValidation(true);
  //       setLoading(false);
  //       return;
  //     }


  //  const handleSubmit = async () => {
  //   if (!formData.confirmAccuracy || !formData.confirmConfidentiality) {
  //     showAlert("Required", "Please confirm all statements before submitting.");
  //     return;
  //   }

  //   setLoading(true);
  //   setAiValidationResult(null);

  //   try {
  //     console.log("🔍 Starting AI validation...");

  //     // TEMPORARY: SIMULATE AI RESPONSE FOR TESTING
  //     // Comment this out when AI API is working
  //     const simulatedAIResponse = {
  //       data: {
  //         allowed: false,
  //         reason: "Incident description contains random, meaningless text."
  //       }
  //     };

  //     if (!simulatedAIResponse.data.allowed) {
  //       console.log("❌ AI Blocked (SIMULATED) - Showing modal...");

  //       setAiValidationResult({
  //         allowed: false,
  //         reason: simulatedAIResponse.data.reason,
  //         details: {
  //           incidentDescription: formData.incidentDescription,
  //           additionalNotes: formData.additionalNotes,
  //           witnessAccount: formData.witnessAccount
  //         }
  //       });

  //       setShowAIValidation(true);
  //       setLoading(false);
  //       return;
  //     }


  //     // UNCOMMENT THIS WHEN AI API IS WORKING
  //     let aiCheck;
  //     try {
  //       aiCheck = await checkSpamReport({
  //         incidentDescription: formData.incidentDescription || "",
  //         additionalNotes: formData.additionalNotes || "",
  //         witnessAccount: formData.witnessAccount || "",
  //       });
  //       console.log("✅ AI Response:", aiCheck.data);

  //       if (!aiCheck.data.allowed) {
  //         console.log("❌ AI Blocked - Showing modal...");
  //         setAiValidationResult({
  //           allowed: false,
  //           reason: aiCheck.data.reason || "Your report lacks meaningful details.",
  //           details: {
  //             incidentDescription: formData.incidentDescription,
  //             additionalNotes: formData.additionalNotes,
  //             witnessAccount: formData.witnessAccount
  //           }
  //         });
  //         setShowAIValidation(true);
  //         setLoading(false);
  //         return;
  //       }

  //     } catch (aiError) {
  //       console.error("❌ AI API Error:", aiError);
  //       // Handle error...
  //     }


  //     console.log("✅ AI Approved - Continuing submission...");
  //       // ---- EXISTING CODE BELOW ----
  //       const submitData = new FormData();

  //       // Determine if anonymous based on whether personal info is provided
  //       const isAnonymous = !formData.firstName && !formData.lastName;
  //       submitData.append('isAnonymous', String(isAnonymous));

  //       Object.keys(formData).forEach(key => {
  //         if (key === 'attachments') return;
  //         const value = formData[key];
  //         if (Array.isArray(value)) {
  //           value.forEach(item => submitData.append(`${key}[]`, item));
  //         } else if (typeof value === 'boolean') {
  //           submitData.append(key, value.toString());
  //         } else if (value !== '' && value !== null && value !== undefined) {
  //           submitData.append(key, value.toString());
  //         }
  //       });

  //       formData.attachments.forEach(attachment => {
  //         submitData.append('attachments', attachment.file);
  //       });

  //       // ✅ STEP 1: Submit the report
  //       const response = await createReport(submitData);
  //       const ticketNumber = response?.data?.ticketNumber || response?.ticketNumber || 'TUP-' + Date.now().toString().slice(-8);

  //       // ✅ STEP 2: Generate PDF - This will auto-download
  //       const pdfBlob = generateReportPDF({
  //         formData,
  //         ticketNumber,
  //         isAnonymous,
  //       });

  //       // ✅ STEP 3: Send PDF via Email
  //       try {
  //         await sendPDFToEmail(pdfBlob, ticketNumber);
  //         console.log('✅ PDF sent to your registered email successfully');
  //       } catch (emailError) {
  //         console.error('❌ Failed to send PDF email:', emailError);
  //         showAlert(
  //           'Report Submitted',
  //           `Your report has been received.\n\nTicket Number: ${ticketNumber}\n\nNote: Email delivery failed. Please download the PDF manually.`
  //         );
  //       }

  //       await clearProgress();

  //       showAlert(
  //         'Report Submitted Successfully',
  //         `Your report has been received.\n\nTicket Number: ${ticketNumber}\n\nA copy has been downloaded and sent to your registered email.`
  //       );

  //       // Reset form
  //       setCurrentStep(1);
  //       setFormData({
  //         lastName: '', firstName: '', middleName: '', alias: '', sex: '',
  //         dateOfBirth: '', age: '', civilStatus: '', educationalAttainment: '',
  //         nationality: '', passportNo: '', occupation: '', religion: '',
  //         region: '', province: '', cityMun: '', barangay: '',
  //         disability: '', numberOfChildren: '', agesOfChildren: '',
  //         guardianLastName: '', guardianFirstName: '', guardianMiddleName: '',
  //         guardianRelationship: '', guardianRegion: '', guardianProvince: '',
  //         guardianCityMun: '', guardianBarangay: '', guardianContact: '',
  //         reporterRole: '', tupRole: '', reporterGender: '', reporterDepartment: '',
  //         perpLastName: '', perpFirstName: '', perpMiddleName: '', perpAlias: '',
  //         perpSex: '', perpDateOfBirth: '', perpAge: '', perpCivilStatus: '',
  //         perpEducation: '', perpNationality: '', perpPassport: '', perpOccupation: '',
  //         perpReligion: '', perpRegion: '', perpProvince: '', perpCityMun: '',
  //         perpBarangay: '', perpRelationship: '',
  //         incidentTypes: [], incidentDescription: '', latestIncidentDate: '',
  //         incidentRegion: '', incidentProvince: '', incidentCityMun: '', incidentBarangay: '',
  //         placeOfIncident: '', witnessName: '', witnessAddress: '', witnessContact: '',
  //         witnessAccount: '', witnessDate: '',
  //         attachments: [], additionalNotes: '', confirmAccuracy: false,
  //         confirmConfidentiality: false,
  //       });

  //     } catch (error) {
  //       console.error('Submit error:', error);
  //       let errorMessage = 'Failed to submit report. Please try again.';
  //       if (error.response?.data?.message) {
  //         errorMessage = error.response.data.message;
  //       }
  //       showAlert('Error', errorMessage);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const handleSubmit = async () => {
    if (!formData.confirmAccuracy || !formData.confirmConfidentiality) {
      showAlert("Required", "Please confirm all statements before submitting.");
      return;
    }

    setLoading(true);
    setAiValidationResult(null);

    try {
      console.log("🔍 [1] Starting submission...");
      console.log("📝 Text being submitted:", formData.incidentDescription);

      // CALL AI CHECK
      const aiCheck = await checkSpamReport({
        salaysay: formData.salaysay || "",
        additionalNotes: formData.additionalNotes || "",
        witnessAccount: formData.witnessAccount || "",
      });

      console.log("✅ [2] AI Response RECEIVED:", aiCheck.data);
      console.log("✅ [3] aiCheck.data.allowed =", aiCheck.data.allowed);
      console.log("✅ [4] aiCheck.data.reason =", aiCheck.data.reason);

      // CRITICAL: Check if AI blocked it
      if (!aiCheck.data.allowed) {
        console.log("❌ [5] AI BLOCKED DETECTED! Showing modal...");

        setAiValidationResult({
          allowed: false,
          reason: aiCheck.data.reason || "Your report lacks meaningful details.",
          details: {
            incidentDescription: formData.incidentDescription,
            additionalNotes: formData.additionalNotes,
            witnessAccount: formData.witnessAccount
          }
        });

        console.log("✅ [6] Setting showAIValidation to TRUE");
        setShowAIValidation(true);
        setLoading(false);
        console.log("✅ [7] Modal should now appear!");
        return;
      } else {
        console.log("✅ [5] AI APPROVED - continuing to submission");
      }

      // ALWAYS CONTINUE TO SUBMISSION
      console.log("✅ [6] Continuing to submission...");

      // ---- EXISTING SUBMISSION CODE ----
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

      // Submit the report
      const response = await createReport(submitData);
      const ticketNumber = response?.data?.ticketNumber || response?.ticketNumber || 'TUP-' + Date.now().toString().slice(-8);

      // Generate PDF
      const pdfBlob = await generateReportPDF({
        formData,
        ticketNumber,
        isAnonymous,
      });

      // Send PDF via Email
      try {
        await sendPDFToEmail(pdfBlob, ticketNumber);
        console.log('✅ PDF sent to your registered email successfully');
      } catch (emailError) {
        console.error('❌ Failed to send PDF email:', emailError);
        showAlert(
          'Report Submitted',
          `Your report has been received.\n\nTicket Number: ${ticketNumber}\n\nNote: Email delivery failed. Please download the PDF manually.`
        );
      }

      await clearProgress();

      showAlert(
        'Report Submitted Successfully',
        `Your report has been received.\n\nTicket Number: ${ticketNumber}\n\nA copy has been downloaded and sent to your registered email.`
      );

      // Reset form
      setCurrentStep(1);
      setFormData({
        // ... reset all form fields ...
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
        salaysay: '', latestIncidentDate: '',
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
        showAlert('Required', 'Please provide your role / TUP affiliation / Department.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.latestIncidentDate || !formData.salaysay || !formData.placeOfIncident || !formData.incidentBarangay) {
        showAlert('Required', 'Please fill in all incident details.');
        return false;
      }
      if (formData.salaysay.trim().length < 10) {
        showAlert('Invalid Statement', 'Salaysay must be at least 10 characters long.');
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

  const renderAIValidationModal = () => {
    if (!showAIValidation || !aiValidationResult) {
      console.log("❌ Modal conditions not met:", { showAIValidation, aiValidationResult });
      return null;
    }

    console.log("✅ Rendering AI Validation Modal...");

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }} onClick={() => {
        console.log("Closing modal");
        setShowAIValidation(false);
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }} onClick={(e) => {
          e.stopPropagation();
          console.log("Modal content clicked");
        }}>

          {/* MODAL HEADER */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isMobile ? '16px 20px' : '24px 32px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF'
          }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={24} color="#DC2626" />
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  color: '#111827',
                  fontWeight: '600',
                  lineHeight: '1.4'
                }}>
                  Content Validation Required
                </h3>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: '#6B7280',
                  fontWeight: '400'
                }}>
                  AI-assisted quality assessment
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                console.log("Close button clicked");
                setShowAIValidation(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#F3F4F6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>

          {/* MODAL CONTENT */}
          <div style={{ padding: isMobile ? '20px' : '32px' }}>


            {/* VALIDATION STATUS */}
            <div style={{
              backgroundColor: '#FEF2F2',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid #FECACA'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <X size={18} color="#DC2626" />
                </div>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#DC2626'
                }}>
                  Report Not Approved
                </span>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '16px',
                borderRadius: '6px',
                marginBottom: '20px',
                borderLeft: '3px solid #DC2626'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  color: '#374151',
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  {aiValidationResult.reason}
                </p>
              </div>

              {/* CONTENT ANALYSIS */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                padding: '20px',
                border: '1px solid #E5E7EB'
              }}>
                <h4 style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  margin: '0 0 20px 0',
                  color: '#111827',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Content Analysis
                </h4>

                {formData.incidentDescription && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#6B7280',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>Incident Description</span>
                      <span style={{
                        fontSize: '11px',
                        backgroundColor: '#F3F4F6',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {formData.incidentDescription.length} characters
                      </span>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: '#F9FAFB',
                      padding: '16px',
                      borderRadius: '6px',
                      borderLeft: '2px solid #DC2626',
                      fontFamily: 'monospace',
                      lineHeight: '1.5'
                    }}>
                      {formData.incidentDescription.length > 120
                        ? formData.incidentDescription.substring(0, 120) + '...'
                        : formData.incidentDescription}
                    </div>
                  </div>
                )}

                {formData.additionalNotes && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#6B7280',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>Additional Notes</span>
                      <span style={{
                        fontSize: '11px',
                        backgroundColor: '#F3F4F6',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {formData.additionalNotes.length} characters
                      </span>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: '#F9FAFB',
                      padding: '16px',
                      borderRadius: '6px',
                      borderLeft: '2px solid #F59E0B'
                    }}>
                      {formData.additionalNotes.length > 80
                        ? formData.additionalNotes.substring(0, 80) + '...'
                        : formData.additionalNotes}
                    </div>
                  </div>
                )}

                {formData.witnessAccount && (
                  <div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#6B7280',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>Witness Account</span>
                      <span style={{
                        fontSize: '11px',
                        backgroundColor: '#F3F4F6',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {formData.witnessAccount.length} characters
                      </span>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: '#F9FAFB',
                      padding: '16px',
                      borderRadius: '6px',
                      borderLeft: '2px solid #10B981'
                    }}>
                      {formData.witnessAccount.length > 80
                        ? formData.witnessAccount.substring(0, 80) + '...'
                        : formData.witnessAccount}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GUIDELINES */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '28px',
              border: '1px solid #E2E8F0'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 20px 0',
                color: '#1E293B'
              }}>
                Report Quality Guidelines
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>

                <div>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#64748B',
                    margin: '0 0 8px 0'
                  }}>
                    Specificity
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#334155',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Include precise dates, times, locations, and identifiable details
                  </p>
                </div>
                <div>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#64748B',
                    margin: '0 0 8px 0'
                  }}>
                    Clarity
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#334155',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Present events in chronological order with clear context
                  </p>
                </div>
                <div>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#64748B',
                    margin: '0 0 8px 0'
                  }}>
                    Completeness
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#334155',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Provide all relevant information while maintaining focus
                  </p>
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                borderLeft: '3px solid #3B82F6'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#1E40AF',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Exemplary Report Structure
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#4B5563',
                  lineHeight: '1.6',
                  fontStyle: 'italic'
                }}>
                  "On [Date] at approximately [Time] in [Location], [specific incident] occurred involving [individuals]. The sequence of events began when... This incident resulted in [consequences]. I am reporting this because [rationale]."
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  console.log("Edit Report clicked");
                  setShowAIValidation(false);
                  setTimeout(() => {
                    const textarea = document.querySelector('textarea');
                    if (textarea) {
                      textarea.focus();
                      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  letterSpacing: '0.025em'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#B91C1C';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#DC2626';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Revise Report
              </button>
            </div>

            {/* FOOTER */}
            <div style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #E5E7EB'
            }}>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: '#6B7280',
                lineHeight: '1.5',
                textAlign: 'center'
              }}>
                This automated validation ensures report quality and prevents system misuse.
                All submissions are handled in accordance with institutional policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfidentialityModal = () => {
    if (!showConfidentialityModal) return null;

    return (
      <div style={{
        ...currentStyles.modalOverlay,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000
      }}>
        <div style={{
          ...currentStyles.modalContent,
          maxWidth: '600px',
          padding: isMobile ? '20px' : '40px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '32px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: `1px solid #dbeafe`,
            }}>
              <Shield size={32} color={currentStyles.colors.primary} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: currentStyles.colors.textPrimary, margin: '0 0 8px 0' }}>
              Terms of Confidentiality
            </h2>
            <p style={{ fontSize: '14px', color: currentStyles.colors.textSecondary, margin: 0 }}>
              Please review and agree to our confidentiality terms to proceed.
            </p>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '12px',
            marginBottom: '32px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: currentStyles.colors.textPrimary,
            textAlign: 'justify'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '16px' }}>
              By proceeding with the submission of this report, you acknowledge and agree to the following confidentiality terms:
            </p>

            <p style={{ marginBottom: '16px' }}>
              All information provided in this report will be treated with strict confidentiality and will only be accessed by authorized personnel of the system for the purpose of reviewing, processing, and responding to the concern submitted.
            </p>

            <p style={{ marginBottom: '16px' }}>
              The information you provide may be viewed by designated administrators or authorized individuals responsible for handling reports and ensuring appropriate action. These individuals are required to handle all submitted information with respect, privacy, and confidentiality.
            </p>

            <p style={{ marginBottom: '16px' }}>
              Your personal information and report details will not be disclosed to unauthorized persons and will only be used for documentation, analysis, and appropriate response related to the concern filed within the system.
            </p>

            <p style={{ marginBottom: '16px' }}>
              By submitting this report, you confirm that the information you are providing is true and accurate to the best of your knowledge, and you understand that the report will be handled according to the confidentiality and data protection policies of the system.
            </p>

            <p style={{ fontStyle: 'italic', color: currentStyles.colors.textSecondary }}>
              If you do not agree with these terms, you may choose not to proceed with the submission of your report.
            </p>
          </div>

          <div style={{ borderTop: `1px solid ${currentStyles.colors.border}`, paddingTop: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
              onClick={() => setAgreedToTerms(!agreedToTerms)}
            >
              <div style={{
                ...currentStyles.checkbox,
                backgroundColor: agreedToTerms ? currentStyles.colors.primary : 'white',
                borderColor: agreedToTerms ? currentStyles.colors.primary : currentStyles.colors.border,
                marginTop: '2px'
              }}>
                {agreedToTerms && <Check size={14} color="white" />}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: currentStyles.colors.textPrimary, lineHeight: '1.4' }}>
                I have read and agree to the terms of confidentiality and confirm that all information provided is true and accurate.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{
                  ...currentStyles.secondaryButton,
                  flex: 1
                }}
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
              <button
                style={{
                  ...currentStyles.primaryButton,
                  flex: 2,
                  backgroundColor: agreedToTerms ? currentStyles.colors.primary : currentStyles.colors.border,
                  cursor: agreedToTerms ? 'pointer' : 'not-allowed',
                  boxShadow: agreedToTerms ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
                }}
                disabled={!agreedToTerms}
                onClick={handleAcceptConfidentiality}
              >
                Agree and Proceed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProgressBar = () => (
    <div style={currentStyles.progressContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={currentStyles.progressText}>
          Step {currentStep} of {totalSteps}
        </div>
        <div style={currentStyles.stepIndicator}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} style={{
              ...currentStyles.stepDot,
              backgroundColor: currentStep > index ? currentStyles.colors.primary : currentStyles.colors.border,
              borderColor: currentStep > index ? currentStyles.colors.primary : currentStyles.colors.border,
            }}>
              {currentStep > index ? <Check size={12} color="white" /> : null}
            </div>
          ))}
        </div>
      </div>
      <h2 style={currentStyles.stepTitle}>{getStepTitle()}</h2>
      <div style={currentStyles.progressBar}>
        <div
          style={{
            ...currentStyles.progressFill,
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
          }}
        />
      </div>
    </div>
  );

  const renderReporterInfo = () => (
    <div style={currentStyles.stepContainer}>
      <div style={currentStyles.sectionCard}>
        <div style={currentStyles.sectionHeader}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '32px',
            backgroundColor: currentStyles.colors.ultraLightBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: `1px solid ${currentStyles.colors.border}`,
          }}>
            <Shield size={32} color={currentStyles.colors.primary} />
          </div>
          <h3 style={{ ...currentStyles.sectionTitle, textAlign: 'center', fontSize: '24px' }}>Your Information</h3>
          <p style={{ ...currentStyles.sectionDescription, textAlign: 'center', marginBottom: '32px' }}>
            Help us understand your situation better. All fields are optional except your role.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '32px', marginBottom: '32px' }}>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: currentStyles.colors.textPrimary }}>
              Required Context
            </h4>
            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>
                Are you reporting as
                <span style={currentStyles.requiredStar}> *</span>
              </label>
              <select
                style={currentStyles.selectInput}
                value={formData.reporterRole}
                onChange={(e) => setFormData(prev => ({ ...prev, reporterRole: e.target.value }))}
              >
                <option value="">Select your role</option>
                <option value="Victim">Victim</option>
                <option value="Witness">Witness</option>
                <option value="Mandatory Reporter">Mandatory Reporter</option>
              </select>
            </div>

            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>
                TUP Affiliation
                <span style={currentStyles.requiredStar}> *</span>
              </label>
              {user?.userType ? (
                <div style={{
                  ...currentStyles.input,
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  color: currentStyles.colors.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Check size={16} color={currentStyles.colors.success} />
                  {formData.tupRole}
                  <span style={{ fontSize: '11px', color: currentStyles.colors.textSecondary, marginLeft: 'auto' }}>Auto-filled from profile</span>
                </div>
              ) : (
                <select
                  style={currentStyles.selectInput}
                  value={formData.tupRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, tupRole: e.target.value }))}
                >
                  <option value="">Select affiliation</option>
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Staff">Staff</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: currentStyles.colors.textPrimary }}>
              Auto-filled from Profile
            </h4>
            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>Gender</label>
              {user?.gender ? (
                <div style={{
                  ...currentStyles.input,
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  color: currentStyles.colors.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Check size={16} color={currentStyles.colors.success} />
                  {formData.reporterGender}
                  <span style={{ fontSize: '11px', color: currentStyles.colors.textSecondary, marginLeft: 'auto' }}>From profile</span>
                </div>
              ) : (
                <select
                  style={currentStyles.selectInput}
                  value={formData.reporterGender}
                  onChange={(e) => setFormData(prev => ({ ...prev, reporterGender: e.target.value }))}
                >
                  <option value="">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              )}
            </div>
            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>Department
                <span style={currentStyles.requiredStar}> *</span>
              </label>
              {user?.department ? (
                <div style={{
                  ...currentStyles.input,
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  color: currentStyles.colors.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Check size={16} color={currentStyles.colors.success} />
                  {formData.reporterDepartment}
                  <span style={{ fontSize: '11px', color: currentStyles.colors.textSecondary, marginLeft: 'auto' }}>From profile</span>
                </div>
              ) : (
                <select
                  style={currentStyles.input}
                  value={formData.reporterDepartment}
                  onChange={(e) => setFormData(prev => ({ ...prev, reporterDepartment: e.target.value }))}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Civil and Allied Department">Civil and Allied Department</option>
                  <option value="Electrical and Allied Department">Electrical and Allied Department</option>
                  <option value="Mechanical and Allied Department">Mechanical and Allied Department</option>
                  <option value="Basic Arts and Science Department">Basic Arts and Science Department</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div style={{
          ...currentStyles.importantNote,
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Shield size={18} color={currentStyles.colors.success} />
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: currentStyles.colors.textPrimary, fontWeight: '500' }}>
                Your gender, department, and affiliation are pulled from your profile automatically.
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: currentStyles.colors.textSecondary, lineHeight: '1.5' }}>
                This information helps GAD for categorization and analytics only.
                Your name and other personal details are <strong>never</strong> shared when the report is anonymous.
              </p>
            </div>
          </div>
        </div>


      </div>

      <div style={currentStyles.importantNote}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Info size={18} color={currentStyles.colors.textSecondary} />
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: currentStyles.colors.textPrimary, fontWeight: '500' }}>
              Privacy & Confidentiality
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: currentStyles.colors.textSecondary, lineHeight: '1.5' }}>
              All reports are handled with strict confidentiality by the TUP GAD Office.
              Whether you choose to remain anonymous or provide your details, your privacy is our priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIncidentDetails = () => (
    <div style={currentStyles.stepContainer}>
      <div style={{ display: 'grid' }}>
        <div>
          <div style={{ ...currentStyles.sectionCard, marginBottom: '24px' }}>
            <div style={currentStyles.sectionHeader}>
              <h3 style={currentStyles.sectionTitle}>Incident Details</h3>
              <p style={currentStyles.sectionDescription}>Tell us what happened</p>
            </div>
            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>
                Date of Latest Incident
                <span style={currentStyles.requiredStar}> *</span>
              </label>
              <div style={currentStyles.dateInput} onClick={() => showDatePickerModal('latestIncidentDate')}>
                <span style={{ color: !formData.latestIncidentDate ? currentStyles.colors.textSecondary : currentStyles.colors.textPrimary }}>
                  {formData.latestIncidentDate || 'Select date'}
                </span>
                <Calendar size={20} color={currentStyles.colors.textSecondary} />
              </div>
            </div>

            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>
                Salaysay (Incident Statement)
                <span style={currentStyles.requiredStar}> *</span>
              </label>
              <textarea
                style={{ ...currentStyles.input, minHeight: '200px', resize: 'vertical' }}
                placeholder="Provide a detailed description of what happened, including dates, times, locations, and any other relevant information..."
                value={formData.salaysay}
                onChange={(e) => setFormData(prev => ({ ...prev, salaysay: e.target.value }))}
              />
            </div>
          </div>

          <div style={currentStyles.sectionCard}>
            <div style={currentStyles.sectionHeader}>
              <h3 style={currentStyles.sectionTitle}>Location Details</h3>
              <p style={currentStyles.sectionDescription}>Where the incident occurred</p>
            </div>
            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>
                Place of Incident
                <span style={currentStyles.requiredStar}> *</span>
              </label>
              <div style={currentStyles.dropdownInput} onClick={() => showDropdown('placeOfIncident', places)}>
                <span style={{ color: !formData.placeOfIncident ? currentStyles.colors.textSecondary : currentStyles.colors.textPrimary }}>
                  {formData.placeOfIncident || 'Select place'}
                </span>
                <ChevronDown size={20} color={currentStyles.colors.textSecondary} />
              </div>
            </div>
            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>
                Address Details
                <span style={currentStyles.requiredStar}> *</span>
              </label>
              <input
                style={currentStyles.input}
                placeholder="Specific location details..."
                value={formData.incidentBarangay}
                onChange={(e) => setFormData(prev => ({ ...prev, incidentBarangay: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerpetratorInfo = () => (
    <div style={currentStyles.stepContainer}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '24px' : '32px' }}>

        <div style={currentStyles.sectionCard}>
          <div style={currentStyles.sectionHeader}>
            <h3 style={currentStyles.sectionTitle}>Perpetrator Information</h3>
            <p style={currentStyles.sectionDescription}>Details about the alleged perpetrator (if known)</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '20px', marginBottom: '20px' }}>

            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>Last Name</label>
              <input
                style={currentStyles.input}
                placeholder="Enter last name"
                value={formData.perpLastName}
                onChange={(e) => setFormData(prev => ({ ...prev, perpLastName: e.target.value }))}
              />
            </div>
            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>First Name</label>
              <input
                style={currentStyles.input}
                placeholder="Enter first name"
                value={formData.perpFirstName}
                onChange={(e) => setFormData(prev => ({ ...prev, perpFirstName: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '20px', marginBottom: '20px' }}>

            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>Sex</label>
              <div style={currentStyles.optionGroup}>
                {['Male', 'Female'].map(sex => (
                  <button
                    key={sex}
                    type="button"
                    style={{
                      ...currentStyles.optionButton,
                      backgroundColor: formData.perpSex === sex ? currentStyles.colors.primary : 'white',
                      color: formData.perpSex === sex ? 'white' : currentStyles.colors.textPrimary,
                      borderColor: formData.perpSex === sex ? currentStyles.colors.primary : currentStyles.colors.border,
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, perpSex: sex }))}
                  >
                    {sex}
                  </button>
                ))}
              </div>
            </div>
            <div style={currentStyles.inputGroup}>
              <label style={currentStyles.inputLabel}>Age (approx.)</label>
              <input
                style={currentStyles.input}
                placeholder="Approximate age"
                type="number"
                value={formData.perpAge}
                onChange={(e) => setFormData(prev => ({ ...prev, perpAge: e.target.value }))}
              />
            </div>
          </div>
          <div style={currentStyles.inputGroup}>
            <label style={currentStyles.inputLabel}>Relationship to You</label>
            <div style={currentStyles.dropdownInput} onClick={() => showDropdown('perpRelationship', relationships)}>
              <span style={{ color: !formData.perpRelationship ? currentStyles.colors.textSecondary : currentStyles.colors.textPrimary }}>
                {formData.perpRelationship || 'Select relationship'}
              </span>
              <ChevronDown size={20} color={currentStyles.colors.textSecondary} />
            </div>
          </div>
          <div style={currentStyles.inputGroup}>
            <label style={currentStyles.inputLabel}>Occupation (if known)</label>
            <input
              style={currentStyles.input}
              placeholder="Enter occupation"
              value={formData.perpOccupation}
              onChange={(e) => setFormData(prev => ({ ...prev, perpOccupation: e.target.value }))}
            />
          </div>
        </div>

        <div style={currentStyles.sectionCard}>
          <div style={currentStyles.sectionHeader}>
            <h3 style={currentStyles.sectionTitle}>Witness Information</h3>
            <p style={currentStyles.sectionDescription}>Details of any witnesses (if applicable)</p>
          </div>
          <div style={currentStyles.inputGroup}>
            <label style={currentStyles.inputLabel}>Witness Name</label>
            <input
              style={currentStyles.input}
              placeholder="Enter witness name"
              value={formData.witnessName}
              onChange={(e) => setFormData(prev => ({ ...prev, witnessName: e.target.value }))}
            />
          </div>
          <div style={currentStyles.inputGroup}>
            <label style={currentStyles.inputLabel}>Witness Contact</label>
            <input
              style={currentStyles.input}
              placeholder="Contact information"
              value={formData.witnessContact}
              onChange={(e) => setFormData(prev => ({ ...prev, witnessContact: e.target.value }))}
            />
          </div>
          <div style={currentStyles.inputGroup}>
            <label style={currentStyles.inputLabel}>Witness Statement</label>
            <textarea
              style={{ ...currentStyles.input, minHeight: '150px', resize: 'vertical' }}
              placeholder="Brief statement from witness (if available)..."
              value={formData.witnessAccount}
              onChange={(e) => setFormData(prev => ({ ...prev, witnessAccount: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => {
    const isAnonymous = !formData.firstName && !formData.lastName;

    return (
      <div style={currentStyles.stepContainer}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? '24px' : '32px' }}>

          <div>
            <div style={{ ...currentStyles.sectionCard, marginBottom: '24px' }}>
              <div style={currentStyles.sectionHeader}>
                <h3 style={currentStyles.sectionTitle}>Report Summary</h3>
                <p style={currentStyles.sectionDescription}>Review your report details</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px', marginBottom: '24px' }}>

                {/* <div>
                  <p style={currentStyles.summaryLabel}>Reporting Mode</p>
                  <p style={currentStyles.summaryValue}>{isAnonymous ? 'Anonymous' : 'Identified'}</p>
                </div> */}

                {!isAnonymous && (
                  <div>
                    <p style={currentStyles.summaryLabel}>Reporter</p>
                    <p style={currentStyles.summaryValue}>{formData.firstName} {formData.lastName}</p>
                  </div>
                )}

                <div>
                  <p style={currentStyles.summaryLabel}>Reporting As</p>
                  <p style={currentStyles.summaryValue}>{formData.reporterRole || 'Not specified'}</p>
                </div>

                <div>
                  <p style={currentStyles.summaryLabel}>TUP Affiliation</p>
                  <p style={currentStyles.summaryValue}>{formData.tupRole || 'Not specified'}</p>
                </div>

                <div>
                  <p style={currentStyles.summaryLabel}>Department</p>
                  <p style={currentStyles.summaryValue}>{formData.reporterDepartment || 'Not specified'}</p>
                </div>

                <div>
                  <p style={currentStyles.summaryLabel}>Gender</p>
                  <p style={currentStyles.summaryValue}>{formData.reporterGender || 'Prefer not to say'}</p>
                </div>

                <div>
                  <p style={currentStyles.summaryLabel}>Incident Date</p>
                  <p style={currentStyles.summaryValue}>{formData.latestIncidentDate || 'Not provided'}</p>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={currentStyles.summaryLabel}>Salaysay (Statement)</p>
                  <p style={{ ...currentStyles.summaryValue, whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '4px' }}>
                    {formData.salaysay || 'No statement provided'}
                  </p>
                </div>
              </div>

              <div style={currentStyles.inputGroup}>
                <label style={currentStyles.inputLabel}>Additional Notes</label>
                <textarea
                  style={{ ...currentStyles.input, minHeight: '120px', resize: 'vertical' }}
                  placeholder="Any additional information or context..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                />
              </div>
            </div>

            <div style={currentStyles.sectionCard}>
              <div style={currentStyles.sectionHeader}>
                <h3 style={currentStyles.sectionTitle}>Attachments</h3>
                <p style={currentStyles.sectionDescription}>Supporting documents and evidence</p>
              </div>
              {formData.attachments.length === 0 ? (
                <div style={currentStyles.emptyAttachments}>
                  <FileText size={24} color={currentStyles.colors.textSecondary} />
                  <p style={{ margin: '12px 0 0 0', color: currentStyles.colors.textSecondary, fontSize: '14px' }}>
                    No attachments added
                  </p>
                </div>
              ) : (
                <div>
                  {formData.attachments.map((attachment, index) => (
                    <div key={index} style={currentStyles.attachmentItem}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {attachment.type === 'image' && <ImageIcon size={16} color={currentStyles.colors.textSecondary} />}
                        {attachment.type === 'video' && <Video size={16} color={currentStyles.colors.textSecondary} />}
                        {attachment.type === 'pdf' && <FileText size={16} color={currentStyles.colors.textSecondary} />}
                        <span style={{ fontSize: '14px', color: currentStyles.colors.textPrimary }}>
                          {attachment.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        style={currentStyles.removeAttachmentButton}
                      >
                        <X size={16} color={currentStyles.colors.textSecondary} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div
                style={{
                  ...currentStyles.addAttachmentButton,
                  borderColor: isDragging ? currentStyles.colors.primary : currentStyles.colors.border,
                  backgroundColor: isDragging ? '#eff6ff' : currentStyles.colors.white,
                  borderStyle: 'dashed',
                  borderWidth: '2px',
                  flexDirection: 'column',
                  padding: '32px',
                  minHeight: '180px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={pickFiles}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '24px',
                  backgroundColor: isDragging ? currentStyles.colors.primary : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  transition: 'all 0.2s ease'
                }}>
                  <Upload size={24} color={isDragging ? 'white' : currentStyles.colors.primary} />
                </div>

                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: currentStyles.colors.textPrimary }}>
                  {isDragging ? 'Drop your images here' : 'Drop & Drag images here'}
                </h4>

                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: currentStyles.colors.textSecondary }}>
                  or click to browse from your device
                </p>

                <div style={{
                  marginTop: '12px',
                  padding: '4px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ImageIcon size={14} color="#64748b" />
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                    IMAGES ONLY • MAX 1GB TOTAL
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={currentStyles.sectionCard}>
              <div style={currentStyles.sectionHeader}>
                <h3 style={currentStyles.sectionTitle}>Final Verification</h3>
                <p style={currentStyles.sectionDescription}>Confirm before submission</p>
              </div>
              <div style={currentStyles.verificationBox}>
                <div
                  style={currentStyles.checkboxContainer}
                  onClick={() => setFormData(prev => ({ ...prev, confirmAccuracy: !prev.confirmAccuracy }))}
                >
                  <div style={{
                    ...currentStyles.checkbox,
                    backgroundColor: formData.confirmAccuracy ? currentStyles.colors.primary : 'white',
                    borderColor: formData.confirmAccuracy ? currentStyles.colors.primary : currentStyles.colors.border
                  }}>
                    {formData.confirmAccuracy && <Check size={16} color="white" />}
                  </div>
                  <span style={currentStyles.checkboxLabel}>
                    I confirm that all information provided is accurate to the best of my knowledge
                  </span>
                  <span style={currentStyles.requiredStar}> *</span>
                </div>

                <div
                  style={{ ...currentStyles.checkboxContainer, marginTop: '16px' }}
                  onClick={() => setFormData(prev => ({ ...prev, confirmConfidentiality: !prev.confirmConfidentiality }))}
                >
                  <div style={{
                    ...currentStyles.checkbox,
                    backgroundColor: formData.confirmConfidentiality ? currentStyles.colors.primary : 'white',
                    borderColor: formData.confirmConfidentiality ? currentStyles.colors.primary : currentStyles.colors.border
                  }}>
                    {formData.confirmConfidentiality && <Check size={16} color="white" />}
                  </div>
                  <span style={currentStyles.checkboxLabel}>
                    I understand this report will be handled confidentially by the TUP GAD Office
                  </span>
                  <span style={currentStyles.requiredStar}> *</span>
                </div>
              </div>

              <div style={currentStyles.warningBox}>
                <AlertCircle size={18} color={currentStyles.colors.warning} />
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: currentStyles.colors.textPrimary, fontWeight: '500' }}>
                    Important: Report Submission
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: currentStyles.colors.textSecondary, lineHeight: '1.5' }}>
                    Upon submission, you will receive a unique ticket number to track your report status.
                    Please save this number for future reference.
                  </p>
                </div>
              </div>

              <button
                style={{
                  ...currentStyles.submitButton,
                  backgroundColor: !formData.confirmAccuracy || !formData.confirmConfidentiality
                    ? currentStyles.colors.border
                    : currentStyles.colors.primary,
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
                    <div style={currentStyles.spinner}></div>
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
  };

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
    <div style={currentStyles.container}>
      <div style={currentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentStep > 1 && (
            <button style={currentStyles.backButton} onClick={handleBack}>
              <ArrowLeft size={24} color={currentStyles.colors.textPrimary} />
            </button>
          )}
          <div>
            <h1 style={currentStyles.mainTitle}>TUP GAD Incident Report</h1>
            <p style={currentStyles.mainSubtitle}>Secure • Confidential • Professional</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentStep > 1 && currentStep < totalSteps && (
            <button style={currentStyles.saveButton} onClick={saveProgress}>
              <Save size={18} color={currentStyles.colors.primary} />
              <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '600' }}>Save Draft</span>
            </button>
          )}
        </div>
      </div>

      {renderProgressBar()}

      <div style={currentStyles.content}>
        {renderStepContent()}
      </div>

      <div style={currentStyles.navigation}>
        {currentStep > 1 && !isLastStep && (
          <button style={currentStyles.secondaryButton} onClick={handleBack}>
            Back
          </button>
        )}

        {!isLastStep && (
          <button
            style={currentStyles.primaryButton}
            onClick={handleNext}
          >
            Continue
          </button>
        )}
      </div>

      {renderAIValidationModal()}
      {renderConfidentialityModal()}

      {showDatePicker && (
        <div style={currentStyles.modalOverlay} onClick={() => setShowDatePicker(false)}>
          <div style={currentStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={currentStyles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: currentStyles.colors.textPrimary }}>Select Date</h3>
              <button onClick={() => setShowDatePicker(false)} style={currentStyles.modalDoneButton}>
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
              style={currentStyles.datePickerInput}
            />
          </div>
        </div>
      )}

      {dropdownVisible && (
        <div style={currentStyles.modalOverlay} onClick={() => setDropdownVisible(false)}>
          <div style={currentStyles.dropdownModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={currentStyles.dropdownTitle}>Select Option</h3>
            <div style={currentStyles.dropdownList}>
              {dropdownOptions.map((option, index) => (
                <button
                  key={index}
                  style={currentStyles.dropdownOption}
                  onClick={() => selectDropdownOption(option)}
                >
                  <span style={currentStyles.dropdownOptionText}>{option}</span>
                  {formData[dropdownField] === option && <Check size={20} color={currentStyles.colors.primary} />}
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