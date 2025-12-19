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
    }
  } catch {
    isTokenValid = false;
  }
}

const initialState = {
  token: isTokenValid ? token : null,
  role: isTokenValid ? role : "",
  department: isTokenValid ? department : "",
  user: isTokenValid
    ? parsedUser || { role, department }
    : null,
  isLoggedIn: isTokenValid && !!role,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, role, department, user } = action.payload;

      state.token = token;
      state.role = role;
      state.department = department;
      state.isLoggedIn = true;

      // add user object for Layout/Sidebar
      state.user =
        user || { role, department };

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("department", department);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
    },

    logout: (state) => {
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
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
