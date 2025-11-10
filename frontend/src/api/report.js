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