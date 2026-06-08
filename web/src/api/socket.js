// src/api/socket.js
import { io } from "socket.io-client";
import { Capacitor } from "@capacitor/core";

const isMobileApp = Capacitor.isNative;
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Auto-detect: use localhost for local development, otherwise use env var or production
const SOCKET_URL = isMobileApp
  ? (import.meta.env.VITE_API_URL_MOBILE ? import.meta.env.VITE_API_URL_MOBILE.replace(/\/api$/, "") : "http://localhost:5000")
  : (isLocalhost ? "http://localhost:5000" : (import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"));

console.log("🔧 Socket Service Configuration:");
console.log("  - isMobileApp:", isMobileApp);
console.log("  - isLocalhost:", isLocalhost);
console.log("  - VITE_SOCKET_URL:", import.meta.env.VITE_SOCKET_URL);
console.log("  - VITE_API_URL_MOBILE:", import.meta.env.VITE_API_URL_MOBILE);
console.log("  - Final SOCKET_URL:", SOCKET_URL);

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentTicketRoom = null; // Track current ticket room
    this.currentUserIdRoom = null; // Track current user room
    this.isAdminRoomJoined = false; // Track admin room status
  }

  connect() {
    if (this.socket) {
      if (!this.socket.connected) {
        console.log("⏳ Socket initialized but not connected, connecting...");
        this.socket.connect();
      } else {
        console.log("✅ Socket already connected");
      }
      return this.socket;
    }

    console.log("🔌 Initializing new socket connection to:", SOCKET_URL);
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

      // 🔥 Auto re-join rooms upon connection/reconnection
      if (this.currentTicketRoom) {
        this.socket.emit("join-ticket", this.currentTicketRoom);
        console.log(`🎫 Auto-rejoined ticket room on connect: ${this.currentTicketRoom}`);
      }
      if (this.currentUserIdRoom) {
        this.socket.emit("join-user-room", this.currentUserIdRoom);
        console.log(`👤 Auto-rejoined user room on connect: ${this.currentUserIdRoom}`);
      }
      if (this.isAdminRoomJoined) {
        this.socket.emit("join-admin-room");
        console.log("👑 Auto-rejoined admin room on connect");
      }
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
    // Leave previous ticket room if exists and connected
    if (this.currentTicketRoom && this.currentTicketRoom !== ticketNumber) {
      if (this.socket?.connected) {
        this.socket.emit("leave-ticket", this.currentTicketRoom);
      }
      console.log(`🚪 Auto-left previous ticket room: ${this.currentTicketRoom}`);
    }
    
    // Set target room state (queued/persisted for connection)
    this.currentTicketRoom = ticketNumber;
    
    if (this.socket?.connected) {
      this.socket.emit("join-ticket", ticketNumber);
      console.log(`🎫 Joined ticket room: ${ticketNumber}`);
    } else {
      console.log(`⏳ Socket not connected yet. Ticket room ${ticketNumber} queued for connection.`);
    }
  }

  leaveTicket(ticketNumber) {
    if (this.socket?.connected) {
      this.socket.emit("leave-ticket", ticketNumber);
    }
    if (this.currentTicketRoom === ticketNumber) {
      this.currentTicketRoom = null;
    }
    console.log(`🚪 Left ticket room: ${ticketNumber}`);
  }

  joinAdminRoom() {
    this.isAdminRoomJoined = true;
    if (this.socket?.connected) {
      this.socket.emit("join-admin-room");
      console.log("👑 Joined admin room");
    } else {
      console.log("⏳ Socket not connected yet. Admin room queued for connection.");
    }
  }

  joinUserRoom(userId) {
    this.currentUserIdRoom = userId;
    if (this.socket?.connected) {
      this.socket.emit("join-user-room", userId);
      console.log(`👤 Joined user room: ${userId}`);
    } else {
      console.log(`⏳ Socket not connected yet. User room ${userId} queued for connection.`);
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

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        // Remove only the specific listener
        this.socket.off(event, callback);
      } else {
        // Remove ALL listeners for this event (use with caution)
        this.socket.off(event);
      }
    }
  }
}

const socketService = new SocketService();
export default socketService;