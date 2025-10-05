import API from "./config";

export const getUserProfile = async (userId) => {
  const res = await API.get(`/user/${userId}`);
  return res.data;
};

export const updateUserProfile = async (userId, payload) => {
  const res = await API.put(`/user/${userId}`, payload);
  return res.data;
};
