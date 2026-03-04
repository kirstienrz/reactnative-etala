// api/infographics.js
import API from "./config";

// ========================================
// 🖼️ INFOGRAPHICS MANAGEMENT ROUTES
// ========================================

// 📋 GET all active infographics
export const getInfographics = async () => {
  const res = await API.get("/infographics");
  return res.data;
};

// 🗃️ GET all archived infographics
export const getArchivedInfographics = async () => {
  const res = await API.get("/infographics/archived");
  return res.data;
};

// 📤 UPLOAD new infographic(s)
export const uploadInfographics = async (formData) => {
  const res = await API.post("/infographics", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✏️ UPDATE an existing infographic
export const updateInfographic = async (id, formData) => {
  const res = await API.put(`/infographics/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🗃️ ARCHIVE an infographic
export const archiveInfographic = async (id) => {
  const res = await API.patch(`/infographics/${id}/status`, {
    status: 'archived'
  });
  return res.data;
};

// 🔄 RESTORE an archived infographic
export const restoreInfographic = async (id) => {
  const res = await API.patch(`/infographics/${id}/status`, {
    status: 'active'
  });
  return res.data;
};

// ❌ DELETE an infographic
export const deleteInfographic = async (id) => {
  const res = await API.delete(`/infographics/${id}`);
  return res.data;
};