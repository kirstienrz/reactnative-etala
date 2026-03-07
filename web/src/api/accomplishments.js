import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 🏆 ACCOMPLISHMENT REPORT MANAGEMENT ROUTES
// ========================================

// 📋 GET all active accomplishment reports
export const getAccomplishments = async () => {
  const res = await API.get("/accomplishments");
  return res.data;
};

// 🗃️ GET all archived accomplishment reports
export const getArchivedAccomplishments = async () => {
  const res = await API.get("/accomplishments/archived");
  return res.data;
};

// 📤 UPLOAD new accomplishment report (PDF)
export const uploadAccomplishment = async (formData) => {
  const res = await API.post("/accomplishments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🗃️ ARCHIVE an accomplishment report
export const archiveAccomplishment = async (id) => {
  const res = await API.put(`/accomplishments/${id}/archive`);
  return res.data;
};

// 🔄 RESTORE an archived accomplishment report
export const restoreAccomplishment = async (id) => {
  const res = await API.put(`/accomplishments/${id}/restore`);
  return res.data;
};

// ❌ DELETE an accomplishment report (permanently)
export const deleteAccomplishment = async (id) => {
  const res = await API.delete(`/accomplishments/${id}`);
  return res.data;
};
