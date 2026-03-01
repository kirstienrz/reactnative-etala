// src/api/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket?.connected) {
      console.log("✅ Socket already connected");
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true, // 🔥 Ensure auto-connect
    });

    this.socket.on("connect", () => {
      console.log("🟢 Socket connected:", this.socket.id);
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    // 🔥 Debug: Log all incoming events
    this.socket.onAny((eventName, ...args) => {
      console.log(`📨 Socket event received: ${eventName}`, args);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log("🔴 Socket disconnected manually");
    }
  }

  joinTicket(ticketNumber) {
    if (this.socket?.connected) {
      this.socket.emit("join-ticket", ticketNumber);
      console.log(`🎫 Joined ticket room: ${ticketNumber}`);
    } else {
      console.warn("⚠️ Cannot join ticket - socket not connected");
    }
  }

  leaveTicket(ticketNumber) {
    if (this.socket?.connected) {
      this.socket.emit("leave-ticket", ticketNumber);
      console.log(`🚪 Left ticket room: ${ticketNumber}`);
    }
  }

  joinAdminRoom() {
    if (this.socket?.connected) {
      this.socket.emit("join-admin-room");
      console.log("👑 Joined admin room");
    } else {
      console.warn("⚠️ Cannot join admin room - socket not connected");
    }
  }

  joinUserRoom(userId) {
    if (this.socket?.connected) {
      this.socket.emit("join-user-room", userId);
      console.log(`👤 Joined user room: ${userId}`);
    } else {
      console.warn("⚠️ Cannot join user room - socket not connected");
    }
  }

  sendTyping(ticketNumber, userName, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit("typing", { ticketNumber, userName, isTyping });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      // ✅ Don't remove existing listeners, just add
      this.socket.on("new-message", callback);
    }
  }

  onTicketUpdated(callback) {
    if (this.socket) {
      this.socket.on("ticket-updated", callback);
    }
  }

  onTicketClosed(callback) {
    if (this.socket) {
      this.socket.on("ticket-closed", callback);
    }
  }

  onTicketReopened(callback) {
    if (this.socket) {
      this.socket.on("ticket-reopened", callback);
    }
  }

  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on("messages-read", callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user-typing", callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

const socketService = new SocketService();
export default socketService;