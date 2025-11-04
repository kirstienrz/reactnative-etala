import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 🎠 CAROUSEL MANAGEMENT ROUTES
// ========================================

// 📋 GET all active carousel images
export const getCarouselImages = async () => {
  const res = await API.get("/carousel");
  return res.data;
};
