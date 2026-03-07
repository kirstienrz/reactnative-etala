import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 🏢 ORGANIZATIONAL CHART MANAGEMENT ROUTES
// ========================================

// 📋 GET all active org chart images
export const getOrgChartImages = async () => {
  const res = await API.get("/org-chart/images");
  return res.data;
};

// 🗃️ GET all archived org chart images
export const getArchivedOrgChartImages = async () => {
  const res = await API.get("/org-chart/archived");
  return res.data;
};

// 📤 UPLOAD new org chart image
export const uploadOrgChartImage = async (formData) => {
  const res = await API.post("/org-chart/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🗃️ ARCHIVE an org chart image
export const archiveOrgChartImage = async (id) => {
  const res = await API.put(`/org-chart/archive/${id}`);
  return res.data;
};

// 🔄 RESTORE an archived org chart image
export const restoreOrgChartImage = async (id) => {
  const res = await API.put(`/org-chart/restore/${id}`);
  return res.data;
};

// ❌ DELETE an org chart image (permanently)
export const deleteOrgChartImage = async (id) => {
  const res = await API.delete(`/org-chart/delete/${id}`);
  return res.data;
};