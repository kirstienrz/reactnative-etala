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

// ➕ CREATE new accomplishment collection
export const createAccomplishment = async (data) => {
  const res = await API.post("/accomplishments", data);
  return res.data;
};

// 📤 UPLOAD files to an accomplishment collection
export const uploadFiles = async (id, files, captions = []) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  captions.forEach((caption) => formData.append("captions[]", caption));

  const res = await API.post(`/accomplishments/${id}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🗑️ DELETE a single file from an accomplishment collection
export const deleteFile = async (accomplishmentId, fileId) => {
  const res = await API.delete(`/accomplishments/${accomplishmentId}/files/${fileId}`);
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
