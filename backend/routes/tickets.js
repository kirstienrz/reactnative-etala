// routes/tickets.js
const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const Message = require("../models/message");
const Report = require("../models/report");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");
const notificationController = require("../controllers/notificationController");

// Middlewares
const authenticateAdmin = authMiddleware(["superadmin"]);
const authenticateUser = authMiddleware(["user", "superadmin"]);
const authenticateAny = authMiddleware(["user", "superadmin"]);

// ─── Shared email template helper ────────────────────────────────────────────

const buildEmail = ({ title, icon, accentColor = "#667eea", bodyHtml, ticketNumber = null }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
    .wrapper { padding: 30px 16px; }
    .container { max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%); color: white; padding: 32px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.3px; }
    .header .icon { font-size: 36px; margin-bottom: 10px; display: block; }
    .content { background: #ffffff; padding: 32px 30px; }
    .info-box { background: #f8f9ff; padding: 16px 20px; border-left: 4px solid ${accentColor}; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .info-box p { margin: 6px 0; font-size: 14px; }
    .info-box strong { color: #374151; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6b7280; }
    .detail-value { color: #111827; font-weight: 500; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 14px; color: #92400e; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    p { margin: 0 0 14px; font-size: 15px; color: #374151; }
    p:last-child { margin-bottom: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="icon">${icon}</span>
        <h1>${title}</h1>
      </div>
      <div class="content">
        ${bodyHtml}
        ${ticketNumber ? `<div class="info-box"><p><strong>Reference:</strong> Ticket #${ticketNumber}</p></div>` : ""}
      </div>
      <div class="footer">
        <p>This is an automated message from <strong>GAD Portal</strong>. Please do not reply to this email.</p>
        <p>© 2026 GAD Portal. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

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
      { $group: { _id: null, total: { $sum: "$unreadCount.superadmin" } } }
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
      .populate("reportId.identifiedUserId", "firstName lastName email")
      .sort({ lastMessageAt: -1 });

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
      .populate("reportId.identifiedUserId", "firstName lastName email")
      .populate("userId", "firstName lastName email")
      .sort({ [sortBy]: -1 });

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

    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (userRole !== "superadmin") {
      if (!ticket.isAnonymous && ticket.userId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
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

    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (userRole !== "superadmin") {
      if (!ticket.isAnonymous && ticket.userId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (ticket.reportId) {
        const report = await Report.findById(ticket.reportId);
        if (report && report.createdBy.toString() !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }

    const io = req.app.get("io");

    if (userRole === "superadmin") {
      await Message.updateMany(
        { ticketNumber, sender: "user", isRead: false },
        { isRead: true }
      );
      const updateResult = await Ticket.findOneAndUpdate(
        { ticketNumber },
        { "unreadCount.superadmin": 0 },
        { new: true }
      );

      console.log("✅ Mark as read result:", {
        ticketNumber,
        unreadCount: updateResult?.unreadCount,
        matched: !!updateResult
      });

      io.to(`ticket-${ticketNumber}`).emit("messages-read", {
        ticketNumber,
        readBy: "superadmin"
      });

      let updatedTicket = await Ticket.findOne({ ticketNumber })
        .populate("reportId")
        .populate("reportId.identifiedUserId", "firstName lastName email")
        .populate("userId", "firstName lastName email");

      updatedTicket = updatedTicket.toObject({ virtuals: true });

      console.log("📤 Emitting ticket-updated to admin-room");
      io.to("admin-room").emit("ticket-updated", updatedTicket);
    } else {
      console.log("👤 User is marking messages as read");
      console.log("🔍 User ID:", userId);
      console.log("🔍 Ticket user ID:", ticket.userId);

      await Message.updateMany(
        { ticketNumber, sender: "superadmin", isRead: false },
        { isRead: true }
      );
      await Ticket.findOneAndUpdate(
        { ticketNumber },
        { "unreadCount.user": 0 }
      );

      io.to(`ticket-${ticketNumber}`).emit("messages-read", {
        ticketNumber,
        readBy: "user"
      });

      let updatedTicket = await Ticket.findOne({ ticketNumber })
        .populate("reportId")
        .populate("reportId.identifiedUserId", "firstName lastName email")
        .populate("userId", "firstName lastName email");

      updatedTicket = updatedTicket.toObject({ virtuals: true });

      console.log("📤 Emitting ticket-updated to user room");
      console.log("📍 Room name:", `user-${ticket.userId}`);

      const userRoom = io.sockets.adapter.rooms.get(`user-${ticket.userId}`);
      console.log("📊 User room status:", {
        exists: !!userRoom,
        size: userRoom ? userRoom.size : 0,
        sockets: userRoom ? Array.from(userRoom) : []
      });

      io.to(`user-${ticket.userId}`).emit("ticket-updated", updatedTicket);
      console.log("✅ Emitted ticket-updated to user room");
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

    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await Ticket.findOneAndUpdate(
      { ticketNumber },
      { "unreadCount.superadmin": 1 }
    );

    let updatedTicket = await Ticket.findOne({ ticketNumber })
      .populate("reportId")
      .populate("reportId.identifiedUserId", "firstName lastName email")
      .populate("userId", "firstName lastName email");

    updatedTicket = updatedTicket.toObject({ virtuals: true });

    console.log("📤 Emitting ticket-updated (mark unread) to admin-room");

    const io = req.app.get("io");
    io.to("admin-room").emit("ticket-updated", updatedTicket);

    res.json({ success: true, message: "Ticket marked as unread" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const { censorProfanity } = require("../utils/profanityFilter");

// ─── Helper: Check if it's a new day ─────────────────────────────────────────────
const isNewDay = (lastEmailDate) => {
  if (!lastEmailDate) return true;
  const now = new Date();
  const last = new Date(lastEmailDate);
  return (
    now.getDate() !== last.getDate() ||
    now.getMonth() !== last.getMonth() ||
    now.getFullYear() !== last.getFullYear()
  );
};

// ✉️ Send message (BOTH USER & ADMIN)
router.post("/:ticketNumber/messages", authenticateAny, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    let { content, attachments } = req.body;
    const senderId = req.user.id;
    const userRole = req.user.role;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Message content is required" });
    }

    content = censorProfanity(content);

    const ticket = await Ticket.findOne({ ticketNumber })
      .populate("userId", "firstName lastName email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status === "Closed") {
      return res.status(400).json({ message: "Cannot send message to closed ticket" });
    }

    if (userRole !== "superadmin") {
      if (!ticket.isAnonymous && ticket.userId._id.toString() !== senderId) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (ticket.reportId) {
        const report = await Report.findById(ticket.reportId);
        if (report && report.createdBy.toString() !== senderId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAdmin = userRole === "superadmin";
    const senderName = isAdmin
      ? `${sender.firstName} ${sender.lastName}`
      : ticket.displayName;

    const isFirstAdminReply = isAdmin && !ticket.adminHasReplied;

    let parsedAttachments = attachments || [];
    if (typeof parsedAttachments === "string") {
      try { parsedAttachments = JSON.parse(parsedAttachments); } catch (e) { parsedAttachments = []; }
    }
    parsedAttachments = (Array.isArray(parsedAttachments) ? parsedAttachments : []).map(att => {
      if (typeof att === "string") {
        try { return JSON.parse(att); } catch (e) { return null; }
      }
      return att;
    }).filter(att => att && att.uri);

    const hasAttachments = parsedAttachments.length > 0;

    const message = new Message({
      ticketNumber,
      sender: isAdmin ? "superadmin" : "user",
      senderId,
      senderName,
      messageType: hasAttachments ? "file" : "text",
      content,
      attachments: parsedAttachments
    });

    await message.save();

    const updateData = {
      lastMessageAt: new Date(),
      lastMessage: content.substring(0, 100)
    };

    if (isAdmin) {
      updateData.$inc = { "unreadCount.user": 1 };
      if (isFirstAdminReply) {
        updateData.adminHasReplied = true;
      }
    } else {
      updateData.$inc = { "unreadCount.superadmin": 1 };
    }

    let updatedTicket = await Ticket.findOneAndUpdate(
      { ticketNumber },
      updateData,
      { new: true }
    ).populate("reportId")
      .populate("reportId.identifiedUserId", "firstName lastName email")
      .populate("userId", "firstName lastName email");

    updatedTicket = updatedTicket.toObject({ virtuals: true });

    notificationController.createNotification({
      recipient: isAdmin ? (ticket.userId?._id || ticket.userId) : null,
      recipientRole: isAdmin ? "user" : "superadmin",
      type: "message",
      title: `💬 New Message - Ticket #${ticketNumber}`,
      content: `${senderName}: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
      metadata: { ticketNumber },
      link: isAdmin ? "/user/chat" : "/superadmin/messages"
    });

    // ─── First Daily Chat Email Notifications ───────────────────────────────────────
    // Skip system-generated messages (senderName === "System")
    const isSystemMessage = senderName === "System";
    
    if (!isSystemMessage) {
      // Admin sending to user: Check if first message of the day
      if (isAdmin && isNewDay(ticket.lastEmailSentToUser) && ticket.userId?.email) {
        try {
          const userEmail = ticket.userId.email;
          const userName = ticket.displayName || `${ticket.userId.firstName} ${ticket.userId.lastName}`;

          await sendEmail({
            to: userEmail,
            subject: `New Message on Your Support Ticket #${ticketNumber} — GAD Portal`,
            html: buildEmail({
              title: "You Have a New Message",
              icon: "💬",
              accentColor: "#2563eb",
              bodyHtml: `
                <p>Hello, ${userName}!</p>
                <p>Our support team has sent you a new message. Please log in to the GAD Portal to view the message and continue the conversation.</p>
                <div class="info-box">
                  <div class="detail-row"><span class="detail-label">Ticket Number</span><span class="detail-value">#${ticketNumber}</span></div>
                  <div class="detail-row"><span class="detail-label">Message</span><span class="detail-value">${content.substring(0, 100)}${content.length > 100 ? "..." : ""}</span></div>
                </div>
                <div class="warning">📌 Please do not reply to this email. Log in to the GAD Portal to respond directly in the chat.</div>
              `,
              ticketNumber,
            }),
          });

          // Update the tracking field
          await Ticket.findOneAndUpdate(
            { ticketNumber },
            { lastEmailSentToUser: new Date() }
          );

          console.log(`✉️ First daily chat email sent to user for ticket ${ticketNumber}`);
        } catch (emailError) {
          console.error("❌ Failed to send first daily chat email to user:", emailError);
        }
      }

      // User sending to admin: Check if first message of the day
      if (!isAdmin && isNewDay(ticket.lastEmailSentToAdmin)) {
        try {
          // Get admin email (superadmin)
          const admin = await User.findOne({ role: "superadmin" });
          if (admin?.email) {
            const userName = ticket.displayName || `${ticket.userId.firstName} ${ticket.userId.lastName}`;

            await sendEmail({
              to: admin.email,
              subject: `New Message from User - Ticket #${ticketNumber} — GAD Portal`,
              html: buildEmail({
                title: "New Message from User",
                icon: "💬",
                accentColor: "#059669",
                bodyHtml: `
                  <p>Hello, Admin!</p>
                  <p>You have received a new message from a user. Please log in to the GAD Portal to view and respond.</p>
                  <div class="info-box">
                    <div class="detail-row"><span class="detail-label">Ticket Number</span><span class="detail-value">#${ticketNumber}</span></div>
                    <div class="detail-row"><span class="detail-label">User</span><span class="detail-value">${userName}</span></div>
                    <div class="detail-row"><span class="detail-label">Message</span><span class="detail-value">${content.substring(0, 100)}${content.length > 100 ? "..." : ""}</span></div>
                  </div>
                  <div class="warning">📌 Please do not reply to this email. Log in to the GAD Portal to respond directly in the chat.</div>
                `,
                ticketNumber,
              }),
            });

            // Update the tracking field
            await Ticket.findOneAndUpdate(
              { ticketNumber },
              { lastEmailSentToAdmin: new Date() }
            );

            console.log(`✉️ First daily chat email sent to admin for ticket ${ticketNumber}`);
          }
        } catch (emailError) {
          console.error("❌ Failed to send first daily chat email to admin:", emailError);
        }
      }
    }

    // ✉️ Send formatted email on first admin reply (legacy - keep for backward compatibility)
    if (isFirstAdminReply && ticket.userId?.email) {
      try {
        const userEmail = ticket.userId.email;
        const userName = ticket.displayName || `${ticket.userId.firstName} ${ticket.userId.lastName}`;

        await sendEmail({
          to: userEmail,
          subject: `New Reply on Your Support Ticket #${ticketNumber} — GAD Portal`,
          html: buildEmail({
            title: "You Have a New Reply",
            icon: "💬",
            accentColor: "#2563eb",
            bodyHtml: `
              <p>Hello, ${userName}!</p>
              <p>Our support team has replied to your ticket. Please log in to the GAD Portal to view the message and continue the conversation.</p>
              <div class="info-box">
                <div class="detail-row"><span class="detail-label">Ticket Number</span><span class="detail-value">#${ticketNumber}</span></div>
                <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">Open — Awaiting your reply</span></div>
              </div>
              <div class="warning">📌 Please do not reply to this email. Log in to the GAD Portal to respond directly in the chat.</div>
            `,
            ticketNumber,
          }),
        });

        console.log(`✉️ First reply email sent for ticket ${ticketNumber}`);
      } catch (emailError) {
        console.error("❌ Failed to send first reply email:", emailError);
      }
    }

    const io = req.app.get("io");
    io.to(`ticket-${ticketNumber}`).emit("new-message", {
      message,
      ticket: updatedTicket
    });

    const ticketUserId = ticket.userId?._id || ticket.userId;
    if (isAdmin) {
      if (ticketUserId) {
        console.log("📤 Admin sent message, emitting to user room");
        console.log("👤 User ID:", ticketUserId);
        console.log("📍 Room name:", `user-${ticketUserId}`);
        io.to(`user-${ticketUserId}`).emit("ticket-updated", updatedTicket);
        console.log("✅ Emitted ticket-updated to user room");
      } else {
        console.log("⚠️ No userId found for ticket, skipping user room emit");
      }
    } else {
      io.to("admin-room").emit("ticket-updated", updatedTicket);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Send message error:", error);
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
    ).populate("userId", "firstName lastName email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const systemMessage = new Message({
      ticketNumber,
      sender: "superadmin",
      senderName: "System",
      content: reason || "This ticket has been closed.",
      messageType: "text"
    });
    await systemMessage.save();

    // ✉️ Notify user by email
    if (ticket.userId?.email) {
      try {
        const userName = ticket.displayName || `${ticket.userId.firstName} ${ticket.userId.lastName}`;
        await sendEmail({
          to: ticket.userId.email,
          subject: `Support Ticket #${ticketNumber} Closed — GAD Portal`,
          html: buildEmail({
            title: "Your Ticket Has Been Closed",
            icon: "🔒",
            accentColor: "#6b7280",
            bodyHtml: `
              <p>Hello, ${userName}!</p>
              <p>Your support ticket has been marked as <strong>Closed</strong> by our team.</p>
              <div class="info-box">
                <div class="detail-row"><span class="detail-label">Ticket Number</span><span class="detail-value">#${ticketNumber}</span></div>
                <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">Closed</span></div>
                ${reason ? `<div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${reason}</span></div>` : ""}
              </div>
              <div class="warning">📌 If you believe this was closed in error or need further assistance, please contact us through the GAD Portal to reopen the ticket.</div>
            `,
            ticketNumber,
          }),
        });
      } catch (emailErr) {
        console.error("❌ Failed to send ticket closed email:", emailErr);
      }
    }

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
    ).populate("userId", "firstName lastName email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const systemMessage = new Message({
      ticketNumber,
      sender: "superadmin",
      senderName: "System",
      content: "This ticket has been reopened.",
      messageType: "text"
    });
    await systemMessage.save();

    // ✉️ Notify user by email
    if (ticket.userId?.email) {
      try {
        const userName = ticket.displayName || `${ticket.userId.firstName} ${ticket.userId.lastName}`;
        await sendEmail({
          to: ticket.userId.email,
          subject: `Support Ticket #${ticketNumber} Reopened — GAD Portal`,
          html: buildEmail({
            title: "Your Ticket Has Been Reopened",
            icon: "🔓",
            accentColor: "#059669",
            bodyHtml: `
              <p>Hello, ${userName}!</p>
              <p>Your support ticket has been <strong>reopened</strong> by our team and is now active again.</p>
              <div class="info-box">
                <div class="detail-row"><span class="detail-label">Ticket Number</span><span class="detail-value">#${ticketNumber}</span></div>
                <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">Open</span></div>
              </div>
              <p>Please log in to the GAD Portal to continue the conversation with our support team.</p>
            `,
            ticketNumber,
          }),
        });
      } catch (emailErr) {
        console.error("❌ Failed to send ticket reopened email:", emailErr);
      }
    }

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
      .populate("reportId.identifiedUserId", "firstName lastName email")
      .populate("userId", "firstName lastName email tupId");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

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