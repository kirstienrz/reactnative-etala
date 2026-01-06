import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Load stored data
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const department = localStorage.getItem("department");
const storedUser = localStorage.getItem("user");

let isTokenValid = false;
let parsedUser = null;

if (token) {
  try {
    const decoded = jwtDecode(token);
    isTokenValid = decoded.exp * 1000 > Date.now();

    if (isTokenValid && storedUser) {
      parsedUser = JSON.parse(storedUser);
      console.log('🔄 Loaded user from localStorage:', parsedUser);
    }
  } catch (error) {
    console.error('❌ Token validation failed:', error);
    isTokenValid = false;
  }
}

const initialState = {
  token: isTokenValid ? token : null,
  role: isTokenValid ? role : "",
  department: isTokenValid ? department : "",
  user: isTokenValid ? parsedUser || { role, department } : null,
  isLoggedIn: isTokenValid && !!role,
};

console.log('🚀 Auth Initial State:', initialState);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, role, department, user } = action.payload;

      console.log('✅ Login Success - Full Payload:', action.payload);
      
      // ✅ Extract user ID from JWT token as fallback
      let userIdFromToken = null;
      try {
        const decoded = jwtDecode(token);
        console.log('🔍 Decoded JWT:', decoded);
        userIdFromToken = decoded.id || decoded._id || decoded.userId || decoded.sub;
      } catch (error) {
        console.error('❌ Failed to decode JWT:', error);
      }

      // ✅ Build complete user object
      const completeUser = {
        ...user,
        _id: user?._id || user?.id || userIdFromToken,
        id: user?._id || user?.id || userIdFromToken,
        role: role,
        department: department,
      };

      console.log('👤 Complete user object:', completeUser);
      
      // ✅ Validate that we have a user ID
      if (!completeUser._id && !completeUser.id) {
        console.error('⚠️ CRITICAL: No user ID found! Check your backend API response.');
        console.error('Payload received:', action.payload);
        console.error('JWT decoded:', userIdFromToken);
      }

      state.token = token;
      state.role = role;
      state.department = department;
      state.isLoggedIn = true;
      state.user = completeUser;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("department", department);
      localStorage.setItem("user", JSON.stringify(completeUser));
      
      console.log('💾 Saved to localStorage:', {
        user: completeUser,
        role,
        department
      });
    },

    logout: (state) => {
      console.log('👋 Logging out...');
      
      state.token = null;
      state.role = "";
      state.department = "";
      state.user = null;
      state.isLoggedIn = false;

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("department");
      localStorage.removeItem("user");
    },

    setUser: (state, action) => {
      console.log('🔄 Updating user:', action.payload);
      
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
      
      console.log('✅ User updated:', state.user);
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;