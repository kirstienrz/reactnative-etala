import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 🎫 TICKET MANAGEMENT ROUTES
// ========================================

// 📋 GET all tickets (ADMIN ONLY - for admin dashboard)
export const getAllTickets = async (params) => {
  const res = await API.get("/tickets", { params });
  return res.data;
};

// 📋 GET user's own tickets (USER - for their own tickets only)
export const getMyTickets = async () => {
  const res = await API.get("/tickets/my-tickets");
  return res.data;
};

// 📊 GET ticket details (BOTH - with access control)
export const getTicketDetails = async (ticketNumber) => {
  const res = await API.get(`/tickets/${ticketNumber}`);
  return res.data;
};

// 💬 GET messages for a specific ticket (BOTH USER & ADMIN)
export const getTicketMessages = async (ticketNumber, params) => {
  const res = await API.get(`/tickets/${ticketNumber}/messages`, { params });
  return res.data;
};

// ✉️ SEND message (BOTH USER & ADMIN)
export const sendTicketMessage = async (ticketNumber, messageData) => {
  const res = await API.post(`/tickets/${ticketNumber}/messages`, messageData);
  return res.data;
};

// ✅ MARK messages as read (BOTH USER & ADMIN)
export const markMessagesAsRead = async (ticketNumber) => {
  const res = await API.patch(`/tickets/${ticketNumber}/messages/read`);
  return res.data;
};

// ❌ MARK ticket as unread (ADMIN ONLY)
export const markTicketAsUnread = async (ticketNumber) => {
  const res = await API.patch(`/tickets/${ticketNumber}/messages/unread`);
  return res.data;
};

// 🔒 CLOSE ticket (ADMIN ONLY)
export const closeTicket = async (ticketNumber, reason) => {
  const res = await API.patch(`/tickets/${ticketNumber}/close`, { reason });
  return res.data;
};

// 🔓 REOPEN ticket (ADMIN ONLY)
export const reopenTicket = async (ticketNumber) => {
  const res = await API.patch(`/tickets/${ticketNumber}/reopen`);
  return res.data;
};

// 📊 GET ticket stats (ADMIN ONLY)
export const getTicketStats = async () => {
  const res = await API.get("/tickets/stats/overview");
  return res.data;
};