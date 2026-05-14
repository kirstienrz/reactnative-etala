import axios from "axios";
import { Capacitor } from "@capacitor/core";

const isMobileApp = Capacitor.isNative; // true if running as mobile app
const baseURL = isMobileApp
  ? import.meta.env.VITE_API_URL_MOBILE
  : import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Helper: check if a JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// ✅ Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 401 — only redirect if token is ACTUALLY expired, not on every 401
let isRedirecting = false; // prevent multiple simultaneous redirects
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      const token = localStorage.getItem("token");

      // Only force logout if the token itself is expired or missing
      if (isTokenExpired(token)) {
        isRedirecting = true;

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        const publicPaths = ["/login", "/signup", "/activate", "/forgot-password", "/reset-password"];
        const isPublic = publicPaths.some((path) => window.location.pathname.startsWith(path));

        if (!isPublic) {
          // Small delay to let any in-flight requests finish
          setTimeout(() => {
            window.location.href = "/login";
            isRedirecting = false;
          }, 300);
        } else {
          isRedirecting = false;
        }
      }
      // If token is still valid but got 401 → permission issue, not expiry → don't redirect
    }
    return Promise.reject(error);
  }
);

export default API;