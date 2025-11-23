import API from "./config";

// 🖥 Fetch all webinars
export const getWebinars = async () => {
  try {
    const res = await API.get("/webinars"); // matches your backend route
    return res.data;
  } catch (error) {
    console.error("Error fetching webinars:", error);
    throw error;
  }
};

// 📚 Fetch all resources
export const getResources = async () => {
  try {
    const res = await API.get("/resources"); // matches your backend route
    return res.data;
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw error;
  }
};
