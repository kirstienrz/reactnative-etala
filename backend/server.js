const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http"); // 🧩 for socket.io
const { Server } = require("socket.io"); // 🧩 import socket.io

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // 🧩 create HTTP server for sockets

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ Make `io` globally available
app.set("io", io);

app.use(express.json());
app.use(cors());

// ✅ ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/carousel", require("./routes/carouselRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/webinars", require("./routes/webinarRouter"));
app.use("/api/reports", require("./routes/reportRoutes"));

// ✅ SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ✅ SERVER LISTEN
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
