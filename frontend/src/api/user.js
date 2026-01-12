import API from "./config";

export const getUserProfile = async (userId) => {
  const res = await API.get(`/user/${userId}`);
  return res.data;
};

export const updateUserProfile = async (userId, payload) => {
  const res = await API.put(`/user/${userId}`, payload);
  return res.data;
};



// ========================================
// 👥 USER MANAGEMENT CRUD (SUPERADMIN)
// ========================================

// 📋 GET all users for management
export const getAllUsersForManagement = async () => {
  const res = await API.get("/user/manage/users");
  return res.data;
};

// 🔍 GET single user details
export const getUserById = async (userId) => {
  const res = await API.get(`/user/manage/users/${userId}`);
  return res.data;
};

// ➕ CREATE new user
export const createUser = async (userData) => {
  const res = await API.post("/user/manage/users", userData);
  return res.data;
};

// 📝 UPDATE user
export const updateUser = async (userId, userData) => {
  const res = await API.put(`/user/manage/users/${userId}`, userData);
  return res.data;
};

// 🗑️ DELETE user
export const deleteUser = async (userId) => {
  const res = await API.delete(`/user/manage/users/${userId}`);
  return res.data;
};

// 📦 ARCHIVE user
export const archiveUser = async (userId) => {
  const res = await API.put(`/user/manage/users/${userId}/archive`);
  return res.data;
};

// 🔄 UNARCHIVE/RESTORE user
export const unarchiveUser = async (userId) => {
  const res = await API.put(`/user/manage/users/${userId}/unarchive`);
  return res.data;
};

export const getUserAnalytics = async () => {
  const res = await API.get("/user/analytics");
  return res.data;
};