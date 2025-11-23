import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Change this to your backend address
// const API_BASE_URL = "http://192.168.254.162:5000/api"; 
// const API_BASE_URL = "http://192.168.1.8:5000/api"; 

const API_BASE_URL = "http://192.168.1.9:5000/api"; 
// const API_BASE_URL = "http://10.226.166.194:5000/api"; 
// For iOS simulator: http://localhost:5000/api
// For physical device: replace with your PC's IP

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
