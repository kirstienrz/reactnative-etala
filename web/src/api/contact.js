import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 📧 CONTACT FORM MANAGEMENT ROUTES
// ========================================

// 📤 SEND contact form message
export const sendContactMessage = async (formData) => {
  const res = await API.post("/contact", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 📋 GET contact form submissions (admin only - optional)
export const getContactSubmissions = async () => {
  const res = await API.get("/contact");
  return res.data;
};

// 🔍 GET single contact submission (admin only - optional)
export const getContactSubmission = async (id) => {
  const res = await API.get(`/contact/${id}`);
  return res.data;
};

// ✅ MARK contact as read (admin only - optional)
export const markContactAsRead = async (id) => {
  const res = await API.put(`/contact/${id}/read`);
  return res.data;
};

// 🗑️ DELETE contact submission (admin only - optional)
export const deleteContactSubmission = async (id) => {
  const res = await API.delete(`/contact/${id}`);
  return res.data;
};

// ========================================
// 🔧 HELPER FUNCTIONS
// ========================================

// 📁 Prepare form data for contact submission
export const prepareContactFormData = (contactData, attachments = []) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('name', contactData.name);
  formData.append('email', contactData.email);
  formData.append('subject', contactData.subject);
  formData.append('message', contactData.message);
  
  // Add attachments if provided
  attachments.forEach(file => {
    formData.append('attachments', file);
  });
  
  return formData;
};

// 🎯 Default contact form data
export const defaultContactData = {
  name: '',
  email: '',
  subject: '',
  message: ''
};

// 📧 Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 📝 Validate contact form
export const validateContactForm = (formData) => {
  const errors = [];
  
  if (!formData.name.trim()) {
    errors.push('Name is required');
  }
  
  if (!formData.email.trim()) {
    errors.push('Email is required');
  } else if (!validateEmail(formData.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!formData.subject.trim()) {
    errors.push('Subject is required');
  }
  
  if (!formData.message.trim()) {
    errors.push('Message is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};