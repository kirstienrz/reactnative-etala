import API from "./config"; // axios instance with baseURL & headers
// =========================================================
// 🧍 USER ENDPOINTS
// =========================================================

// 📨 SEND Referral PDF to user email
export const sendReferralPDFToUser = async (formData) => {
  const res = await API.post("/reports/send-pdf", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 📤 UPLOAD Referral PDF (no chat message, just returns URL)
export const uploadReferralPDF = async (formData) => {
  const res = await API.post("/reports/upload-pdf", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🟣 Disclose identity (user only) WITH password
// PATCH /reports/user/disclose/:id
export const discloseIdentity = async (reportId, password) => {
  try {
    const res = await API.patch(`/reports/user/disclose/${reportId}`, { password });
    return res.data;
  } catch (err) {
    console.error("DiscloseIdentity API Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
};

// 📝 Create a new report (with attachments)
export const createReport = async (formData) => {
  try {
    // Backend route: /api/reports/user/create
    // Since baseURL already has /api, we only need /reports/user/create
    const res = await API.post("/reports/user/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("CreateReport API Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });
    throw error;
  }
};

// 📄 Get all reports of logged-in user
export const getUserReports = async () => {
  const res = await API.get("/reports/user/all");
  return res.data;
};

// Fetch current user's reports with optional search, filter, and pagination
export const getUserReportsWithParams = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
}) => {
  try {
    // Only send params that have values
    const params = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (search) params.search = search;
    if (status) params.status = status;

    const res = await API.get("/reports/user/all", { params });

    // Ensure response has consistent structure
    return {
      data: res.data?.data || [],
      total: res.data?.total || 0,
      success: res.data?.success || false,
    };
  } catch (err) {
    console.error("Error fetching user reports:", err);
    return { data: [], total: 0, success: false };
  }
};



// 📄 Get a single report by ID (user's own)
export const getUserReportById = async (reportId) => {
  const res = await API.get(`/reports/user/${reportId}`);
  return res.data;
};

// ========================================
// 🧾 REPORT MANAGEMENT (Admin Side)
// ========================================

// 📋 GET all active (non-archived) reports
export const getAllReports = async () => {
  const res = await API.get("/reports/admin/all");
  return res.data;
};

// 📄 GET a single report by ID
export const getReportById = async (id) => {
  const res = await API.get(`/reports/admin/${id}`);
  return res.data;
};

// 🔄 UPDATE report status
export const updateReportStatus = async (id, status, remarks = "", caseStatus = null) => {
  const res = await API.put(`/reports/admin/${id}/status`, {
    status,
    remarks,
    caseStatus
  });
  return res.data;
};

// 📨 ADD referral entry to a report
export const addReferral = async (id, payload) => {
  const isMultipart = payload.attachments && payload.attachments.length > 0;

  if (isMultipart) {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      if (key === "attachments") {
        payload.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      } else if (Array.isArray(payload[key])) {
        // Mongoose might expect stringified array or multiple entries for same key
        formData.append(key, JSON.stringify(payload[key]));
      } else {
        formData.append(key, payload[key]);
      }
    });

    const res = await API.post(`/reports/admin/${id}/referral`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  const res = await API.post(`/reports/admin/${id}/referral`, payload);
  return res.data;
};

// 🗃️ ARCHIVE a report
export const archiveReport = async (id) => {
  const res = await API.put(`/reports/admin/${id}/archive`);
  return res.data;
};

// 🗂️ GET all archived reports
export const getArchivedReports = async () => {
  const res = await API.get("/reports/admin/archived");
  return res.data;
};

// ♻️ RESTORE an archived report
export const restoreReport = async (id) => {
  const res = await API.put(`/reports/admin/${id}/restore`);
  return res.data;
};

// =========================================================
// 🧍 USER EDIT / DISCLOSE
// =========================================================


// 🟢 Update report (editable fields only)
// PATCH /reports/user/update/:id
export const updateReportByUser = async (reportId, payload) => {
  try {
    const res = await API.patch(`/reports/user/update/${reportId}`, payload);
    return res.data;
  } catch (err) {
    console.error("UpdateReportByUser API Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
};

// api/report.js - Idagdag ito sa mga existing na exports
export const getReportAnalytics = async () => {
  try {
    const response = await API.get('/reports/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching report analytics:', error);
    throw error;
  }
};
