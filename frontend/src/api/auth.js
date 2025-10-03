import API from "./config";

export const loginUser = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};

export const logoutUser = async () => {
  // optional: you can also clear token on backend
  return true;
};
