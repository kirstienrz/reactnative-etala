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

// 📤 UPLOAD or UPDATE document
export const uploadDocument = async (id, formData) => {
  if (id) {
    // Update
    const res = await API.put(`/documents/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } else {
    // Create
    const res = await API.post("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
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

// ❌ DELETE
export const deleteDocument = async (id) => {
  const res = await API.delete(`/documents/${id}`);
  return res.data;
};
