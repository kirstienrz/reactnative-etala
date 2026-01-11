import API from "./config";

// =========================================================
// 🧍 USER ENDPOINTS
// =========================================================

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

// 📄 Get a single report by ID (user's own)
export const getUserReportById = async (reportId) => {
  const res = await API.get(`/reports/user/${reportId}`);
  return res.data;
};

// // =========================================================
// // 🧑‍💼 ADMIN ENDPOINTS
// // =========================================================

// // 📋 Get all non-archived reports
// export const getAllReports = async () => {
//   const res = await API.get("/reports/admin/all");
//   return res.data;
// };

// // 📋 Get single report by ID
// export const getReportById = async (reportId) => {
//   const res = await API.get(`/reports/admin/${reportId}`);
//   return res.data;
// };

// // 🔄 Update report status
// export const updateReportStatus = async (reportId, status) => {
//   const res = await API.put(`/reports/admin/${reportId}/status`, { status });
//   return res.data;
// };

// // 🗂️ Archive a report
// export const archiveReport = async (reportId) => {
//   const res = await API.put(`/reports/admin/${reportId}/archive`);
//   return res.data;
// };

// // 🗂️ Get all archived reports
// export const getArchivedReports = async () => {
//   const res = await API.get("/reports/admin/archived");
//   return res.data;
// };

// // ♻️ Restore an archived report
// export const restoreReport = async (reportId) => {
//   const res = await API.put(`/reports/admin/${reportId}/restore`);
//   return res.data;
// };

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


// Add this to your existing API functions

// Analyze sentiment of a report
export const analyzeReportSentiment = async (reportId) => {
  try {
    const res = await API.post(`/reports/admin/${reportId}/analyze-sentiment`);
    return res.data;
  } catch (err) {
    console.error("Analyze Sentiment API Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    return { 
      success: false, 
      message: err.response?.data?.message || "Failed to analyze sentiment" 
    };
  }
};

// Batch analyze sentiment for multiple reports
export const batchAnalyzeSentiment = async (reportIds) => {
  try {
    const res = await API.post('/reports/admin/batch-analyze-sentiment', { reportIds });
    return res.data;
  } catch (err) {
    console.error("Batch Sentiment Analysis API Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    return { 
      success: false, 
      message: err.response?.data?.message || "Failed to analyze sentiment in batch" 
    };
  }
};