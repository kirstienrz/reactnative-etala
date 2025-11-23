import API from "./config";

// 📰 Fetch all non-archived news
export const getNews = async () => {
  try {
    const res = await API.get("/news"); // matches your router.get("/")
    return res.data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};
