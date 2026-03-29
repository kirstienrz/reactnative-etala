import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 👤 CURRENT USER ROUTES (SELF-MANAGEMENT)
// ========================================

export const getUserProfile = async () => {
  const res = await API.get("/user/me");
  return res.data;
};

export const updateUserProfile = async (payload) => {
  const res = await API.put("/user/me", payload);
  return res.data;
};

// ========================================
// 👥 USER MANAGEMENT CRUD (SUPERADMIN)
// ========================================

// 📋 GET users for management with pagination & filters
export const getAllUsersForManagement = async (params = {}) => {
  const res = await API.get("/user/manage/users", { params });
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

// ✉️ RESEND activation link
export const resendActivationLink = async (userId) => {
  const res = await API.post(`/user/manage/users/${userId}/resend-activation`);
  return res.data;
};

export const getUserAnalytics = async () => {
  const res = await API.get("/user/analytics");
  return res.data;
};