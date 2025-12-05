import API from "./config";

// ========================================
// 🎥 WEBINAR MANAGEMENT ROUTES
// ========================================

// 📋 Get all webinars
export const getWebinars = async () => {
  const res = await API.get("/webinars");
  return res.data;
};

// ➕ Create new webinar
export const createWebinar = async (data) => {
  const res = await API.post("/webinars", data);
  return res.data;
};

// ✏️ Update webinar
export const updateWebinar = async (id, data) => {
  const res = await API.put(`/webinars/${id}`, data);
  return res.data;
};

// 🗑 Delete webinar
export const deleteWebinar = async (id) => {
  const res = await API.delete(`/webinars/${id}`);
  return res.data;
};

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
