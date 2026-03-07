import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 🎠 CAROUSEL MANAGEMENT ROUTES
// ========================================

// 📋 GET all active carousel images
export const getCarouselImages = async () => {
  const res = await API.get("/carousel");
  return res.data;
};

// 🗃️ GET all archived carousel images
export const getArchivedCarouselImages = async () => {
  const res = await API.get("/carousel/archived");
  return res.data;
};

// 📤 UPLOAD new carousel image
export const uploadCarouselImage = async (formData) => {
  const res = await API.post("/carousel/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🗃️ ARCHIVE a carousel image
export const archiveCarouselImage = async (id) => {
  const res = await API.put(`/carousel/archive/${id}`);
  return res.data;
};

// 🔄 RESTORE an archived carousel image
export const restoreCarouselImage = async (id) => {
  const res = await API.put(`/carousel/restore/${id}`);
  return res.data;
};

// 🗑️ DELETE a carousel image permanently
export const deleteCarouselImage = async (id) => {
  const res = await API.delete(`/carousel/delete/${id}`);
  return res.data;
};
