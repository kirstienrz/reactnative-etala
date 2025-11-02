import API from "./config"; // axios instance with baseURL & headers

export const getUserProfile = async () => {
  const res = await API.get("/user/me");
  return res.data;
};

export const updateUserProfile = async (payload) => {
  const res = await API.put("/user/me", payload);
  return res.data;
};
