import axios from "axios";
import * as SecureStore from "expo-secure-store";


const API_BASE_URL = "http://192.168.254.162:5000/api"; 


const API = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Auto-attach token if available
API.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.log("SecureStore error:", err);
  }
  return config;
});

export default API;
