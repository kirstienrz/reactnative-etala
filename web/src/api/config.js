import axios from "axios";
import { Capacitor } from "@capacitor/core";

const isMobileApp = Capacitor.isNative; // true if running as mobile app
const baseURL = isMobileApp
  ? import.meta.env.VITE_API_URL_MOBILE
  : import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // Set to false since we use Bearer tokens
});

API.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage to avoid circular dependency
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;