// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode"; // ✅ correct import

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

let isTokenValid = false;
if (token) {
  try {
    const decoded = jwtDecode(token);
    isTokenValid = decoded.exp * 1000 > Date.now();
  } catch {
    isTokenValid = false;
  }
}
const initialState = {
  token: isTokenValid ? token : null,
  role: isTokenValid ? role : "",
  isLoggedIn: isTokenValid && !!role,
  profile: null, // <-- add this
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, role, profile } = action.payload;
      state.isLoggedIn = true;
      state.token = token;
      state.role = role;
      state.profile = profile || null; // <-- store user profile on login
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.role = "";
      state.profile = null; // <-- clear profile
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
    setProfile: (state, action) => {
      state.profile = action.payload; // <-- update profile anytime
    },
  },
});

export const { loginSuccess, logout, setProfile } = authSlice.actions;
export default authSlice.reducer;
