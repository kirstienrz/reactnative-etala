const express = require("express");
const router = express.Router();
const Chat = require("../models/chat");
const Message = require("../models/message");
const auth = require("../middleware/auth");

// 🟢 Create or get existing chat between two users
router.post("/", auth(), async (req, res) => {
  const { userId } = req.body;
  
  console.log("=== CREATE/GET CHAT DEBUG ===");
  console.log("req.user:", req.user);
  console.log("userId from body:", userId);
  
  if (!userId) return res.status(400).json({ message: "User ID required" });

  try {
    // ✅ Use req.user.id (from JWT decoded token)
    const currentUserId = req.user.id;
    
    if (!currentUserId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if chat already exists between the two users
    let chat = await Chat.findOne({
      users: { $all: [currentUserId, userId] },
    })
      .populate("users", "firstName lastName email")
      .populate("latestMessage");

    if (!chat) {
      chat = await Chat.create({ users: [currentUserId, userId] });
      chat = await chat.populate("users", "firstName lastName email");
    }

    console.log("✅ Chat created/found:", chat._id);
    res.json(chat);
  } catch (err) {
    console.error("❌ Error in create/get chat:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🟡 Get all chats for logged-in user
router.get("/", auth(), async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: currentUserId } },
    })
      .populate("users", "firstName lastName email")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error("❌ Error fetching chats:", err);
    res.status(500).json({ message: err.message });
  }
});

// 💬 Send message
router.post("/message", auth(), async (req, res) => {
  const { chatId, receiverId, content } = req.body;

  if (!chatId || !receiverId || !content)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const currentUserId = req.user.id;
    
    const message = await Message.create({
      sender: currentUserId,
      receiver: receiverId,
      chat: chatId,
      content,
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });
    const populated = await message.populate("sender", "firstName lastName email");
    res.json(populated);
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ message: err.message });
  }
});

// 📩 Get all messages in a chat
router.get("/:chatId/messages", auth(), async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "firstName lastName email")
      .populate("receiver", "firstName lastName email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ message: err.message });
  }
});

// 👀 Mark message as read
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

module.exports = router;