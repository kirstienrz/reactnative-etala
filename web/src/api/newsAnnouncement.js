import API from "./config";

// =========================
// 📰 NEWS API
// =========================
let newsCache = null;
let newsCacheTime = 0;

export const getNews = async () => {
  const now = Date.now();
  if (newsCache && now - newsCacheTime < 300000) {
    API.get("/news").then(res => {
      newsCache = res.data;
      newsCacheTime = Date.now();
    }).catch(() => {});
    return newsCache;
  }
  const res = await API.get("/news");
  newsCache = res.data;
  newsCacheTime = now;
  return res.data;
};

export const getArchivedNews = async () => {
  const res = await API.get("/news/archived");
  return res.data;
};

export const createNews = async (formData) => {
  const res = await API.post("/news", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateNews = async (id, formData) => {
  const res = await API.put(`/news/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const archiveNews = async (id) => {
  const res = await API.patch(`/news/${id}/archive`);
  return res.data;
};

export const restoreNews = async (id) => {
  const res = await API.patch(`/news/${id}/restore`);
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