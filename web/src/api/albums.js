// api/albums.js
import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 🖼️ ALBUM MANAGEMENT ROUTES
// ========================================

// 📋 GET all active albums
export const getAlbums = async () => {
  const res = await API.get("/albums");
  return res.data;
};

// 🗃️ GET all archived albums
export const getArchivedAlbums = async () => {
  const res = await API.get("/albums/archived");
  return res.data;
};

// 📖 GET single album with images
export const getAlbum = async (id) => {
  const res = await API.get(`/albums/${id}`);
  return res.data;
};

// 📤 CREATE new album (with cover image)
export const createAlbum = async (formData) => {
  const res = await API.post("/albums", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✏️ UPDATE album details (cover image optional)
export const updateAlbum = async (id, formData) => {
  const res = await API.put(`/albums/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🗑️ DELETE album permanently
export const deleteAlbum = async (id) => {
  const res = await API.delete(`/albums/${id}`);
  return res.data;
};

// 🗃️ ARCHIVE an album
export const archiveAlbum = async (id) => {
  const res = await API.put(`/albums/${id}/archive`);
  return res.data;
};

// 🔄 RESTORE an archived album
export const restoreAlbum = async (id) => {
  const res = await API.put(`/albums/${id}/restore`);
  return res.data;
};

// 📦 BULK archive albums
export const bulkArchiveAlbums = async (albumIds) => {
  const res = await API.post("/albums/bulk-archive", { albumIds });
  return res.data;
};

// 📦 BULK restore albums
export const bulkRestoreAlbums = async (albumIds) => {
  const res = await API.post("/albums/bulk-restore", { albumIds });
  return res.data;
};

// ========================================
// 📸 IMAGE MANAGEMENT ROUTES (within album)
// ========================================

// 📤 UPLOAD images to album
export const uploadImages = async (albumId, formData) => {
  const res = await API.post(`/albums/${albumId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✏️ UPDATE image caption
export const updateImageCaption = async (albumId, imageIndex, caption) => {
  const res = await API.put(`/albums/${albumId}/images/${imageIndex}`, { caption });
  return res.data;
};

// 🗑️ DELETE image from album
export const deleteImage = async (albumId, imageIndex) => {
  const res = await API.delete(`/albums/${albumId}/images/${imageIndex}`);
  return res.data;
};