import API from "./config";

// 📋 GET all active documents
export const getDocuments = async () => {
  const res = await API.get("/documents");
  return res.data;
};

// 🗃️ GET all archived documents
export const getArchivedDocuments = async () => {
  const res = await API.get("/documents/archived");
  return res.data;
};

// ➕ CREATE new document collection
export const createDocument = async (data) => {
  const res = await API.post("/documents", data);
  return res.data;
};

// 🆙 UPDATE document info
export const updateDocument = async (id, data) => {
  const res = await API.put(`/documents/${id}`, data);
  return res.data;
};

// 📤 UPLOAD files to document
export const uploadDocumentFiles = async (id, files, captions = []) => {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  captions.forEach(cap => formData.append("captions[]", cap));

  const res = await API.post(`/documents/${id}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🗑️ DELETE single file
export const deleteDocumentFile = async (documentId, fileId) => {
  const res = await API.delete(`/documents/${documentId}/files/${fileId}`);
  return res.data;
};

// 🗃️ ARCHIVE
export const archiveDocument = async (id) => {
  const res = await API.patch(`/documents/${id}/archive`);
  return res.data;
};

// 🔄 RESTORE
export const restoreDocument = async (id) => {
  const res = await API.patch(`/documents/${id}/restore`);
  return res.data;
};

// ❌ DELETE PERMANENT
export const deleteDocument = async (id) => {
  const res = await API.delete(`/documents/${id}`);
  return res.data;
};

// LEGACY SUPPORT (used by some old code maybe)
export const uploadDocument = async (id, formData) => {
  // If it's old code sending FormData, we need to adapt or just let it fail/fix it
  // For now, let's keep it as an alias for update if ID exists
  if (id) return API.put(`/documents/${id}`, formData);
  return API.post("/documents", formData);
};
