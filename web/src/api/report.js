import API from "./config"; // axios instance with baseURL & headers

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
export const updateReportStatus = async (id, status) => {
  const res = await API.put(`/reports/admin/${id}/status`, { status });
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
