import API from "./config";

// 📰 Fetch all announcements
export const getAnnouncements = async () => {
  try {
    const res = await API.get("/announcements");
    return res.data;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
};

// 📝 (Optional) Create new announcement
export const createAnnouncement = async (title, message) => {
  try {
    const res = await API.post("/announcements", { title, message });
    return res.data;
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};
