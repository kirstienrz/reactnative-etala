// config/socket.js
const setupSocketIO = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    // 🎫 Join ticket room (for viewing a specific ticket conversation)
    socket.on("join-ticket", (ticketNumber) => {
      // Leave all previous ticket rooms before joining new one
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith('ticket-') && room !== `ticket-${ticketNumber}`) {
          socket.leave(room);
          console.log(`🚪 Socket ${socket.id} auto-left ${room}`);
        }
      });
      
      socket.join(`ticket-${ticketNumber}`);
      console.log(`🎫 Socket ${socket.id} joined ticket-${ticketNumber}`);
    });

    // 🚪 Leave ticket room
    socket.on("leave-ticket", (ticketNumber) => {
      socket.leave(`ticket-${ticketNumber}`);
      console.log(`🚪 Socket ${socket.id} left ticket-${ticketNumber}`);
    });

    // 👤 Join user room (for user-specific notifications)
    socket.on("join-user-room", (userId) => {
      socket.join(`user-${userId}`);
      console.log(`👤 Socket ${socket.id} joined user-${userId}`);
    });

    // 👑 Join admin room (for admin dashboard updates)
    socket.on("join-admin-room", () => {
      socket.join("admin-room");
      console.log(`👑 Socket ${socket.id} joined admin-room`);
      
      // 🔍 Debug: Check who's in the room
      const adminRoom = io.sockets.adapter.rooms.get('admin-room');
      console.log(`📊 Total sockets in admin-room: ${adminRoom ? adminRoom.size : 0}`);
      if (adminRoom) {
        console.log(`👥 Socket IDs in admin-room:`, Array.from(adminRoom));
      }
    });

    // 💬 User is typing indicator
    socket.on("typing", ({ ticketNumber, userName, isTyping }) => {
      socket.to(`ticket-${ticketNumber}`).emit("user-typing", {
        ticketNumber,
        userName,
        isTyping
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
  
  // 🔍 Add a helper function to check admin room status
  io.checkAdminRoom = () => {
    const adminRoom = io.sockets.adapter.rooms.get('admin-room');
    console.log(`📊 Admin room status:`, {
      exists: !!adminRoom,
      size: adminRoom ? adminRoom.size : 0,
      sockets: adminRoom ? Array.from(adminRoom) : []
    });
    return adminRoom;
  };
};

module.exports = setupSocketIO;