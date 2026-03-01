import axios from "axios";
import { getToken } from "./auth";
import { Capacitor } from "@capacitor/core";

const isMobileApp = Capacitor.isNative; // true if running as mobile app
const baseURL = isMobileApp
  ? import.meta.env.VITE_API_URL_MOBILE
  : import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;