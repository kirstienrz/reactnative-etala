import API from "./config"; // axios instance with baseURL & headers
// =========================================================
// 🧍 USER ENDPOINTS
// =========================================================

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

// Pinalitan: Severity analysis instead of sentiment
// Analyze severity of a report// Update your API function to accept forceRefresh parameter
export const analyzeReportSeverity = async (reportId, forceRefresh = false) => {
  try {
    const res = await API.post(`/reports/admin/${reportId}/analyze-severity${forceRefresh ? '?forceRefresh=true' : ''}`);
    return res.data;
  } catch (err) {
    console.error("Analyze Severity API Error:", err);
    return { 
      success: false, 
      message: err.response?.data?.message || "Failed to analyze severity" 
    };
  }
};

// api/reportApi.js (or similar)
export const batchReanalyzeStaleReports = async (days = 7, limit = 50) => {
  try {
    const res = await API.post('/reports/admin/batch-reanalyze-stale', { days, limit });
    return res.data;
  } catch (err) {
    console.error("Batch Reanalyze API Error:", err);
    return { 
      success: false, 
      message: err.response?.data?.message || "Failed to re-analyze stale reports" 
    };
  }
};

export const getReanalysisStats = async (daysThreshold = 7) => {
  try {
    const res = await API.get(`/reports/admin/reanalysis-stats?daysThreshold=${daysThreshold}`);
    return res.data;
  } catch (err) {
    console.error("Reanalysis Stats API Error:", err);
    return { 
      success: false, 
      message: err.response?.data?.message || "Failed to get re-analysis stats" 
    };
  }
};

// api/report.js - ADD THIS FUNCTION
export const reanalyzeAllReports = async (batchSize = 20) => {
  try {
    const res = await API.post('/reports/admin/reanalyze-all', { batchSize });
    return res.data;
  } catch (err) {
    console.error("Re-analyze All API Error:", err);
    return { 
      success: false, 
      message: err.response?.data?.message || "Failed to re-analyze all reports" 
    };
  }
};

// Batch analyze severity for multiple reports
export const batchAnalyzeSeverity = async (reportIds) => {
  try {
    const res = await API.post('/reports/admin/batch-analyze-severity', { reportIds });
    return res.data;
  } catch (err) {
    console.error("Batch Severity Analysis API Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    return { 
      success: false, 
      message: err.response?.data?.message || "Failed to analyze severity in batch" 
    };
  }
};

// Get severity statistics
export const getSeverityStats = async (params) => {
  try {
    const res = await API.get('/reports/admin/severity-stats', { params });
    return res.data;
  } catch (err) {
    console.error("Get Severity Stats API Error:", err);
    return { success: false, data: null };
  }
};