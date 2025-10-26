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
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, role } = action.payload;
      state.isLoggedIn = true;
      state.token = token;
      state.role = role;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.role = "";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
