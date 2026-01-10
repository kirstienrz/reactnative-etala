// routes/tickets.js
const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const Message = require("../models/message");
const Report = require("../models/report");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail"); // ✉️ Import email utility

// Middlewares
const authenticateAdmin = authMiddleware(["superadmin"]);
const authenticateUser = authMiddleware(["user", "superadmin"]);
const authenticateAny = authMiddleware(["user", "superadmin"]);

// ========================================
// 📊 SPECIFIC ROUTES (MUST BE BEFORE PARAMETERIZED ROUTES)
// ========================================

// 📊 Get ticket stats (ADMIN ONLY)
router.get("/stats/overview", authenticateAdmin, async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: "Open" });
    const closedTickets = await Ticket.countDocuments({ status: "Closed" });
    const unreadMessages = await Ticket.aggregate([
      { $group: { _id: null, total: { $sum: "$unreadCount.admin" } } }
    ]);
    res.json({
      totalTickets,
      openTickets,
      closedTickets,
      unreadMessages: unreadMessages[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📋 Get user's own tickets (USER - for their own tickets only)
router.get("/my-tickets", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let tickets = await Ticket.find({ userId })
      .populate("reportId")
      .sort({ lastMessageAt: -1 });
    
    // Convert to plain objects with virtuals
    tickets = tickets.map(t => t.toObject({ virtuals: true }));
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// 📋 GENERAL ROUTES
// ========================================

// 📋 Get all tickets (ADMIN ONLY - for admin dashboard)
router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const { status, search, sortBy = "lastMessageAt" } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (search) query.ticketNumber = new RegExp(search, "i");
    let tickets = await Ticket.find(query)
      .populate("reportId")
      .populate("userId", "firstName lastName email")
      .sort({ [sortBy]: -1 });
    
    // Convert to plain objects with virtuals
    tickets = tickets.map(t => t.toObject({ virtuals: true }));
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// 📊 PARAMETERIZED ROUTES (MUST BE AFTER SPECIFIC ROUTES)
// ========================================

// 💬 Get messages for a specific ticket (BOTH USER & ADMIN)
router.get("/:ticketNumber/messages", authenticateAny, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const { limit = 50, before } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Check if user has access to this ticket
    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // If user (not admin), verify they own this ticket
    if (userRole !== "superadmin") {
      if (!ticket.isAnonymous && ticket.userId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      // For anonymous tickets, check if user created the report
      if (ticket.reportId) {
        const report = await Report.findById(ticket.reportId);
        if (report && report.createdBy.toString() !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }
    
    let query = { ticketNumber };
    if (before) query.createdAt = { $lt: new Date(before) };
    
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Mark messages as read (BOTH USER & ADMIN)
router.patch("/:ticketNumber/messages/read", authenticateAny, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Check if user has access to this ticket
    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // If user (not admin), verify they own this ticket
    if (userRole !== "superadmin") {
      if (!ticket.isAnonymous && ticket.userId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      // For anonymous tickets, check if user created the report
      if (ticket.reportId) {
        const report = await Report.findById(ticket.reportId);
        if (report && report.createdBy.toString() !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }
    
    // Get Socket.IO instance
    const io = req.app.get("io");
    
    if (userRole === "superadmin") {
      // Admin reading - mark user messages as read
      await Message.updateMany(
        { ticketNumber, sender: "user", isRead: false },
        { isRead: true }
      );
      await Ticket.findOneAndUpdate(
        { ticketNumber },
        { "unreadCount.admin": 0 }
      );
      
      // 🔥 Emit read status update to user
      io.to(`ticket-${ticketNumber}`).emit("messages-read", {
        ticketNumber,
        readBy: "admin"
      });
      
      // 🔥 Emit to admin room to update ticket list
      let updatedTicket = await Ticket.findOne({ ticketNumber })
        .populate("reportId")
        .populate("userId", "firstName lastName email");
      
      // Convert to plain object and manually add virtual property
      updatedTicket = updatedTicket.toObject({ virtuals: true });
      
      console.log("📤 Emitting ticket-updated to admin-room");
      console.log("📊 Updated ticket data:", {
        ticketNumber: updatedTicket.ticketNumber,
        hasUnreadMessages: updatedTicket.hasUnreadMessages,
        unreadCount: updatedTicket.unreadCount
      });
      
      io.to("admin-room").emit("ticket-updated", updatedTicket);
    } else {
      // User reading - mark admin messages as read
      console.log('👤 User is marking messages as read');
      console.log('🔍 User ID:', userId);
      console.log('🔍 Ticket user ID:', ticket.userId);
      
      await Message.updateMany(
        { ticketNumber, sender: "admin", isRead: false },
        { isRead: true }
      );
      await Ticket.findOneAndUpdate(
        { ticketNumber },
        { "unreadCount.user": 0 }
      );
      
      // 🔥 Emit read status update to admin
      io.to(`ticket-${ticketNumber}`).emit("messages-read", {
        ticketNumber,
        readBy: "user"
      });
      
      // 🔥 Emit to user room to update ticket list
      let updatedTicket = await Ticket.findOne({ ticketNumber })
        .populate("reportId")
        .populate("userId", "firstName lastName email");
      
      // Convert to plain object and manually add virtual property
      updatedTicket = updatedTicket.toObject({ virtuals: true });
      
      console.log('📤 Emitting ticket-updated to user room');
      console.log('📍 Room name:', `user-${ticket.userId}`);
      console.log('📊 Updated ticket data:', {
        ticketNumber: updatedTicket.ticketNumber,
        unreadCount: updatedTicket.unreadCount,
        hasUnreadMessagesForUser: updatedTicket.hasUnreadMessagesForUser
      });
      
      // Check user room
      const userRoom = io.sockets.adapter.rooms.get(`user-${ticket.userId}`);
      console.log('📊 User room status:', {
        exists: !!userRoom,
        size: userRoom ? userRoom.size : 0,
        sockets: userRoom ? Array.from(userRoom) : []
      });
      
      io.to(`user-${ticket.userId}`).emit("ticket-updated", updatedTicket);
      console.log('✅ Emitted ticket-updated to user room');
    }
    
    res.json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ❌ Mark ticket as unread (ADMIN ONLY - for UI purposes)
router.patch("/:ticketNumber/messages/unread", authenticateAdmin, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    
    // Check if ticket exists
    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Set unread count to 1 (minimum to show as unread)
    await Ticket.findOneAndUpdate(
      { ticketNumber },
      { "unreadCount.admin": 1 }
    );
    
    // Get updated ticket
    let updatedTicket = await Ticket.findOne({ ticketNumber })
      .populate("reportId")
      .populate("userId", "firstName lastName email");
    
    // Convert to plain object and manually add virtual property
    updatedTicket = updatedTicket.toObject({ virtuals: true });
    
    console.log("📤 Emitting ticket-updated (mark unread) to admin-room");
    console.log("📊 Updated ticket data:", {
      ticketNumber: updatedTicket.ticketNumber,
      hasUnreadMessages: updatedTicket.hasUnreadMessages,
      unreadCount: updatedTicket.unreadCount
    });
    
    // 🔥 Emit to admin room to update ticket list
    const io = req.app.get("io");
    io.to("admin-room").emit("ticket-updated", updatedTicket);
    
    res.json({ success: true, message: "Ticket marked as unread" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✉️ Send message (BOTH USER & ADMIN)
router.post("/:ticketNumber/messages", authenticateAny, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const { content, attachments } = req.body;
    const senderId = req.user.id;
    const userRole = req.user.role;
    
    // Validate content
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    // Check if ticket exists
    const ticket = await Ticket.findOne({ ticketNumber })
      .populate("userId", "firstName lastName email");
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Check if ticket is closed
    if (ticket.status === "Closed") {
      return res.status(400).json({ message: "Cannot send message to closed ticket" });
    }
    
    // If user (not admin), verify they own this ticket
    if (userRole !== "superadmin") {
      if (!ticket.isAnonymous && ticket.userId._id.toString() !== senderId) {
        return res.status(403).json({ message: "Access denied" });
      }
      // For anonymous tickets, check if user created the report
      if (ticket.reportId) {
        const report = await Report.findById(ticket.reportId);
        if (report && report.createdBy.toString() !== senderId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }
    
    // Get sender info
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Determine sender type and name
    const isAdmin = userRole === "superadmin";
    const senderName = isAdmin 
      ? `${sender.firstName} ${sender.lastName}` 
      : ticket.displayName;
    
    // ✉️ CHECK IF THIS IS THE FIRST ADMIN REPLY
    const isFirstAdminReply = isAdmin && !ticket.adminHasReplied;
    
    const message = new Message({
      ticketNumber,
      sender: isAdmin ? "admin" : "user",
      senderId,
      senderName,
      messageType: attachments?.length > 0 ? "file" : "text",
      content,
      attachments: attachments || []
    });
    
    await message.save();
    
    // Update ticket last message time and unread count
    const updateData = {
      lastMessageAt: new Date(),
      lastMessage: content.substring(0, 100)
    };
    
    if (isAdmin) {
      updateData.$inc = { "unreadCount.user": 1 };
      // ✅ Mark that admin has replied
      if (isFirstAdminReply) {
        updateData.adminHasReplied = true;
      }
    } else {
      updateData.$inc = { "unreadCount.admin": 1 };
    }
    
    let updatedTicket = await Ticket.findOneAndUpdate(
      { ticketNumber }, 
      updateData,
      { new: true }
    ).populate("reportId")
     .populate("userId", "firstName lastName email");
    
    // Convert to plain object with virtuals
    updatedTicket = updatedTicket.toObject({ virtuals: true });
    
    // ✉️ SEND EMAIL NOTIFICATION ON FIRST ADMIN REPLY
    if (isFirstAdminReply && ticket.userId?.email) {
      try {
        const userEmail = ticket.userId.email;
        const userName = ticket.displayName || `${ticket.userId.firstName} ${ticket.userId.lastName}`;
        
        await sendEmail({
          to: userEmail,
          subject: `Reply to Your Support Ticket #${ticketNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Support Ticket Update</h2>
              <p>Hi ${userName},</p>
              <p>Our support team has replied to your ticket <strong>#${ticketNumber}</strong>.</p>
              <p>Please log in to your account in the GAD Portal to view the message and continue the conversation.</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                This is an automated notification. Please do not reply to this email.
              </p>
            </div>
          `
        });
        
        console.log(`✉️ First reply email sent to ${userEmail} for ticket ${ticketNumber}`);
      } catch (emailError) {
        console.error("❌ Failed to send first reply email:", emailError);
        // Don't fail the request if email fails
      }
    }
    
    // 🔥 EMIT SOCKET EVENT FOR NEW MESSAGE
    const io = req.app.get("io");
    io.to(`ticket-${ticketNumber}`).emit("new-message", {
      message,
      ticket: updatedTicket
    });
    
    // 🔥 EMIT EVENT FOR TICKET LIST UPDATE (for admins/users to see unread counts)
    if (isAdmin) {
      console.log('📤 Admin sent message, emitting to user room');
      console.log('👤 User ID:', ticket.userId._id);
      console.log('📍 Room name:', `user-${ticket.userId._id}`);
      console.log('📊 Ticket data being sent:', {
        ticketNumber: updatedTicket.ticketNumber,
        unreadCount: updatedTicket.unreadCount,
        hasUnreadMessagesForUser: updatedTicket.hasUnreadMessagesForUser
      });
      
      // Check if anyone is in the user room
      const userRoom = io.sockets.adapter.rooms.get(`user-${ticket.userId._id}`);
      console.log('📊 User room status:', {
        exists: !!userRoom,
        size: userRoom ? userRoom.size : 0,
        sockets: userRoom ? Array.from(userRoom) : []
      });
      
      io.to(`user-${ticket.userId._id}`).emit("ticket-updated", updatedTicket);
      console.log('✅ Emitted ticket-updated to user room');
    } else {
      io.to("admin-room").emit("ticket-updated", updatedTicket);
    }
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔒 Close ticket (ADMIN ONLY)
router.patch("/:ticketNumber/close", authenticateAdmin, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const { reason } = req.body;
    
    const ticket = await Ticket.findOneAndUpdate(
      { ticketNumber },
      { 
        status: "Closed",
        closedAt: new Date(),
        closedReason: reason
      },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Optional: Send system message
    const systemMessage = new Message({
      ticketNumber,
      sender: "admin",
      senderName: "System",
      content: reason || "This ticket has been closed.",
      messageType: "text"
    });
    await systemMessage.save();
    
    // 🔥 EMIT SOCKET EVENT FOR TICKET CLOSURE
    const io = req.app.get("io");
    io.to(`ticket-${ticketNumber}`).emit("ticket-closed", {
      ticket,
      message: systemMessage
    });
    io.to(`user-${ticket.userId}`).emit("ticket-updated", ticket);
    io.to("admin-room").emit("ticket-updated", ticket);
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔓 Reopen ticket (ADMIN ONLY)
router.patch("/:ticketNumber/reopen", authenticateAdmin, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    
    const ticket = await Ticket.findOneAndUpdate(
      { ticketNumber },
      { 
        status: "Open",
        $unset: { closedAt: "", closedReason: "" }
      },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Optional: Send system message
    const systemMessage = new Message({
      ticketNumber,
      sender: "admin",
      senderName: "System",
      content: "This ticket has been reopened.",
      messageType: "text"
    });
    await systemMessage.save();
    
    // 🔥 EMIT SOCKET EVENT FOR TICKET REOPENING
    const io = req.app.get("io");
    io.to(`ticket-${ticketNumber}`).emit("ticket-reopened", {
      ticket,
      message: systemMessage
    });
    io.to(`user-${ticket.userId}`).emit("ticket-updated", ticket);
    io.to("admin-room").emit("ticket-updated", ticket);
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📊 Get ticket details (BOTH - with access control)
router.get("/:ticketNumber", authenticateAny, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const ticket = await Ticket.findOne({ ticketNumber })
      .populate("reportId")
      .populate("userId", "firstName lastName email tupId");
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // If user (not admin), verify access
    if (userRole !== "superadmin") {
      if (!ticket.isAnonymous && ticket.userId?._id.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (ticket.reportId) {
        const report = await Report.findById(ticket.reportId);
        if (report && report.createdBy.toString() !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;