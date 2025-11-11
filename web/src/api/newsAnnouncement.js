// api/newsAnnouncements.js
import API from "./config";

// =========================
// 📰 NEWS API
// =========================
export const getNews = async () => {
  const res = await API.get("/news");
  return res.data;
};

export const createNews = async (data) => {
  const res = await API.post("/news", data);
  return res.data;
};

export const updateNews = async (id, data) => {
  const res = await API.put(`/news/${id}`, data);
  return res.data;
};

export const deleteNews = async (id) => {
  const res = await API.delete(`/news/${id}`);
  return res.data;
};

// =========================
// 📣 ANNOUNCEMENTS API
// =========================
export const getAnnouncements = async () => {
  const res = await API.get("/announcements");
  return res.data;
};

export const createAnnouncement = async (data) => {
  const res = await API.post("/announcements", data);
  return res.data;
};

export const updateAnnouncement = async (id, data) => {
  const res = await API.put(`/announcements/${id}`, data);
  return res.data;
};

export const deleteAnnouncement = async (id) => {
  const res = await API.delete(`/announcements/${id}`);
  return res.data;
};
