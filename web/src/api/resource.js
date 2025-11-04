import API from "./config";

// ========================================
// 📚 RESOURCE MANAGEMENT ROUTES
// ========================================

// 📋 Get all resources
export const getResources = async () => {
  const res = await API.get("/resources");
  return res.data;
};

// ➕ Create new resource
export const createResource = async (data) => {
  const res = await API.post("/resources", data);
  return res.data;
};

// ✏️ Update resource
export const updateResource = async (id, data) => {
  const res = await API.put(`/resources/${id}`, data);
  return res.data;
};

// 🗑 Delete resource
export const deleteResource = async (id) => {
  const res = await API.delete(`/resources/${id}`);
  return res.data;
};
