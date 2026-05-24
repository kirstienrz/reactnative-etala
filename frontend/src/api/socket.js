// src/api/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "https://reactnative-etala.onrender.com";

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

  // 🔥 CRITICAL: Make sure these listeners are properly set up
  onNewMessage(callback) {
    if (this.socket) {
      // Remove any existing listener first to prevent duplicates
      this.socket.off("new-message");
      this.socket.on("new-message", (data) => {
        console.log("📨 new-message event received:", data);
        callback(data);
      });
    }
  }

  onTicketUpdated(callback) {
    if (this.socket) {
      this.socket.off("ticket-updated");
      this.socket.on("ticket-updated", (data) => {
        console.log("📨 ✅✅✅ ticket-updated event received:", data);
        console.log("📊 Ticket details:", {
          ticketNumber: data.ticketNumber,
          hasUnreadMessages: data.hasUnreadMessages,
          unreadCount: data.unreadCount
        });
        callback(data);
      });
    }
  }

  onTicketClosed(callback) {
    if (this.socket) {
      this.socket.off("ticket-closed");
      this.socket.on("ticket-closed", (data) => {
        console.log("📨 ticket-closed event received:", data);
        callback(data);
      });
    }
  }

  onTicketReopened(callback) {
    if (this.socket) {
      this.socket.off("ticket-reopened");
      this.socket.on("ticket-reopened", (data) => {
        console.log("📨 ticket-reopened event received:", data);
        callback(data);
      });
    }
  }

  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.off("messages-read");
      this.socket.on("messages-read", (data) => {
        console.log("📨 messages-read event received:", data);
        callback(data);
      });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.off("user-typing");
      this.socket.on("user-typing", (data) => {
        console.log("📨 user-typing event received:", data);
        callback(data);
      });
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