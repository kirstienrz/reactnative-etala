// api/documentation.js
import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 📁 DOCUMENTATION MANAGEMENT ROUTES
// ========================================

// 📋 GET all active documentation sets
export const getAllDocs = async () => {
  const res = await API.get("/documentation");
  return res.data;
};

// 📖 GET single documentation set by ID
export const getDoc = async (id) => {
  const res = await API.get(`/documentation/${id}`);
  return res.data;
};

// 📤 CREATE new documentation set (title + description)
export const createDoc = async (data) => {
  // data: { title: string, description?: string }
  const res = await API.post("/documentation", data);
  return res.data;
};

// ✏️ UPLOAD files to a documentation set
export const uploadFiles = async (docId, files, captions = []) => {
  // files: array of File objects
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  captions.forEach((c) => formData.append("captions", c));

  const res = await API.post(`/documentation/${docId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🗑️ DELETE a file from a documentation set
export const deleteFile = async (docId, fileId) => {
  const res = await API.delete(`/documentation/${docId}/files/${fileId}`);
  return res.data;
};

// 📦 ARCHIVE a documentation set
export const archiveDoc = async (docId) => {
  const res = await API.patch(`/documentation/${docId}/archive`);
  return res.data;
};
