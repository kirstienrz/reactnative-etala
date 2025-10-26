//src/api/auth.js

import axios from "axios";

// 🔹 Change this to your backend URL
const API_URL = "http://localhost:5000/api/auth";

/**
 * Login with email + TUPT ID + password
 * Returns user data including stoken
 */
export const login = async (email, password, tupId) => {
  const response = await axios.post(`${API_URL}/login`, {
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
  const response = await axios.post(`${API_URL}/verify-pin`, { email, pin });
  return response.data;
};

/**
 * Change password
 * Requires userId (from login) and newPassword
 */
export const changePassword = async (userId, newPassword, token) => {
  const response = await axios.post(
    `${API_URL}/change-password`,
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
  const response = await axios.post(
    `${API_URL}/set-pin`,
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
