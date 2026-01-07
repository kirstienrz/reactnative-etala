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
    const currentUserId = req.user.id;
    
    if (!currentUserId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if chat already exists between the two users
    let chat = await Chat.findOne({
      users: { $all: [currentUserId, userId] },
    })
      .populate("users", "firstName lastName email")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender receiver",
          select: "firstName lastName email"
        }
      });

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
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender receiver",
          select: "firstName lastName email"
        }
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error("❌ Error fetching chats:", err);
    res.status(500).json({ message: err.message });
  }
});

// 💬 Send message
router.post("/message", auth(), async (req, res) => {
  const { chatId, receiverId, content, type, action } = req.body;

  if (!chatId || !receiverId || !content)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const currentUserId = req.user.id;

    if (action === "PROCEED_TO_INTERVIEW") {
  const existing = await Message.findOne({
    chat: chatId,
    action: "PROCEED_TO_INTERVIEW",
  });

  if (existing) {
    return res
      .status(400)
      .json({ message: "Interview already triggered" });
  }
}

    const message = await Message.create({
  sender: currentUserId,
  receiver: receiverId,
  chat: chatId,
  content: content,        // ONLY the string text
  type: type || "USER",    // e.g., "SYSTEM"
  action: action || null,  // e.g., "PROCEED_TO_INTERVIEW"
});


    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
      updatedAt: new Date(),
    });

    const populated = await message.populate(
      "sender receiver",
      "firstName lastName email"
    );

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

// ✅ Mark all messages in a chat as read
router.put("/:chatId/read-all", auth(), async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    await Message.updateMany(
      { 
        chat: req.params.chatId,
        receiver: currentUserId,
        read: false
      },
      { read: true }
    );
    
    res.json({ message: "All messages marked as read" });
  } catch (err) {
    console.error("❌ Error marking all as read:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;