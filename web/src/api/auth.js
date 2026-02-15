import API from "./config";

/**
 * Login with email + TUPT ID + password
 */
export const login = async (email, password, tupId) => {
  const response = await API.post("/auth/login", {
    email,
    password,
    tupId,
  });
  return response.data;
};

/**
 * Verify PIN login
 */
export const verifyPin = async (email, pin) => {
  const response = await API.post("/auth/verify-pin", { email, pin });
  return response.data;
};

/**
 * Signup a new user
 * Expects firstName, lastName, email, password, tupId, userType, department
 */
export const signup = async (userData) => {
  const response = await API.post("/auth/signup", userData);
  return response.data;
};

/**
 * Change password
 * Requires userId and newPassword
 */
export const changePassword = async (userId, newPassword, token) => {
  const response = await API.post(
    "/auth/change-password",
    { userId, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Set 6-digit PIN for a user
 * Requires email + pin
 */
export const setPin = async (email, pin, token) => {
  const response = await API.post(
    "/auth/set-pin",
    { email, pin },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Helper to get stored token from localStorage
 */
export const getToken = () => localStorage.getItem("token");

/**
 * Helper to get stored user role
 */
export const getRole = () => localStorage.getItem("role");
