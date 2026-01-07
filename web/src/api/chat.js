import API from "./config";
import { getItem } from "../utils/storage"; // ✅ get token from SecureStore

// 💬 Create or Get Chat (1-on-1)
export const createOrGetChat = async (userId) => {
  try {
    const token = await getItem("token");
    const res = await API.post(
      "/chat",
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error creating/getting chat:", error.response?.data || error.message);
    throw error;
  }
};

// 📋 Get All Chats for Logged-in User
export const getChats = async () => {
  try {
    const token = await getItem("token");
    const res = await API.get("/chat", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching chats:", error.response?.data || error.message);
    throw error;
  }
};

// ✉️ Send Message
export const sendMessage = async (chatId, receiverId, content, type, action) => {
  const token = await getItem("token");
  const res = await API.post(
    "/chat/message",
    { chatId, receiverId, content, type, action },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};


// 📩 Get Messages in a Chat
export const getMessages = async (chatId) => {
  try {
    const token = await getItem("token");
    const res = await API.get(`/chat/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching messages:", error.response?.data || error.message);
    throw error;
  }
};

// 👀 Mark Message as Read
export const markMessageAsRead = async (messageId) => {
  try {
    const token = await getItem("token");
    const res = await API.put(
      `/chat/message/${messageId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error marking message as read:", error.response?.data || error.message);
    throw error;
  }
};

// Add this to your existing chat.js API file
export const getAllUsers = async () => {
  try {
    const token = await getItem("token");
    const res = await API.get("/user/all", { // ✅ Changed from "/user/users" to "/users/all"
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};