import axios from "axios";
import { getToken } from "./auth";

// 🔥 Detect environment automatically
const isLocal = window.location.hostname === "localhost";

const baseURL = isLocal
  ? "http://localhost:5000/api"
  : "https://reactnative-etala.vercel.app/api"; // change to backend domain in prod

const API = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

// 🔐 Automatically attach JWT
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
