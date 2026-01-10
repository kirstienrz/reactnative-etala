import API from "./config";
import { getItem } from "../utils/storage";

// 💬 Create or Get Ticket
export const createOrGetTicket = async (ticketNumber, isAnonymous = false) => {
  try {
    const token = await getItem("token");
    const res = await API.post(
      "/chat", // same route as backend
      { ticketNumber, isAnonymous },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error creating/getting ticket:", error.response?.data || error.message);
    throw error;
  }
};

// 📋 Get All Tickets for Logged-in User
export const getTickets = async () => {
  try {
    const token = await getItem("token");
    const res = await API.get("/chat", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching tickets:", error.response?.data || error.message);
    throw error;
  }
};

// ✉️ Send Message inside a ticket
export const sendMessage = async (ticketId, content, type, action) => {
  try {
    const token = await getItem("token");
    const res = await API.post(
      "/chat/message",
      { ticketId, content, type, action }, // no receiverId
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error sending message:", error.response?.data || error.message);
    throw error;
  }
};

// 📩 Get Messages in a Ticket (chatbox)
export const getMessages = async (ticketId) => {
  try {
    const token = await getItem("token");
    const res = await API.get(`/chat/${ticketId}/messages`, {
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

// Optional: get all users (for staff/admin use)
export const getAllUsers = async () => {
  try {
    const token = await getItem("token");
    const res = await API.get("/user/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};
