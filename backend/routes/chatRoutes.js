const express = require("express");
const router = express.Router();
const Chat = require("../models/chat");       // now ticket-based "chat"
const Message = require("../models/message"); // messages inside tickets
const auth = require("../middleware/auth");

// -----------------------------
// Create a new ticket or get existing by ticketNumber
// -----------------------------
router.post("/", auth(), async (req, res) => {
  try {
    const { ticketNumber, isAnonymous } = req.body;
    const currentUserId = req.user.id;

    if (!ticketNumber) return res.status(400).json({ message: "Ticket number required" });

    let chat = await Chat.findOne({ ticketNumber })
      .populate("latestMessage")
      .lean();

    if (!chat) {
      chat = await Chat.create({
        ticketNumber,
        createdBy: currentUserId,
        isAnonymous: !!isAnonymous,
      });
    }

    res.json(chat);
  } catch (err) {
    console.error("❌ Error creating/finding ticket chat:", err);
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------
// Get all ticket chats (inbox) for logged-in user
// -----------------------------
router.get("/", auth(), async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const chats = await Chat.find({
      createdBy: currentUserId,
    })
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "firstName lastName email" },
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error("❌ Error fetching ticket chats:", err);
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------
// Send a message inside a ticket
// -----------------------------
router.post("/message", auth(), async (req, res) => {
  try {
    const { ticketId, content, type, action } = req.body;
    const currentUserId = req.user.id;

    if (!ticketId || !content) return res.status(400).json({ message: "Missing required fields" });

    const chat = await Chat.findById(ticketId);
    if (!chat) return res.status(404).json({ message: "Ticket not found" });

    // Optional: prevent duplicate actions like "PROCEED_TO_INTERVIEW"
    if (action === "PROCEED_TO_INTERVIEW") {
      const existing = await Message.findOne({ ticket: ticketId, action });
      if (existing) return res.status(400).json({ message: "Action already triggered" });
    }

    const message = await Message.create({
      ticket: ticketId,
      sender: currentUserId,
      content,
      type: type || "USER",
      action: action || null,
    });

    // Update latestMessage in Chat
    chat.latestMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    const populated = await message.populate("sender", "firstName lastName email");
    res.json(populated);
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------
// Get all messages for a ticket (chatbox)
// -----------------------------
router.get("/:ticketId/messages", auth(), async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(ticketId);
    if (!chat) return res.status(404).json({ message: "Ticket not found" });

    const messages = await Message.find({ ticket: ticketId })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName email")
      .lean();

    // Apply anonymity
    const anonymized = messages.map(msg => ({
      ...msg,
      sender: chat.isAnonymous
        ? msg.sender._id.toString() === userId.toString()
          ? "You"
          : "Anonymous"
        : msg.sender.firstName + " " + msg.sender.lastName,
    }));

    res.json(anonymized);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------
// Mark message as read
// -----------------------------
router.put("/message/:messageId/read", auth(), async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.messageId,
      { read: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("❌ Error marking as read:", err);
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------
// Mark all messages in a ticket as read
// -----------------------------
router.put("/:ticketId/read-all", auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    await Message.updateMany(
      { ticket: req.params.ticketId, read: false, sender: { $ne: userId } },
      { read: true }
    );
    res.json({ message: "All messages marked as read" });
  } catch (err) {
    console.error("❌ Error marking all as read:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
