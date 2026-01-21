const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const setupSocketIO = require("./config/socket"); // 🔥 Import socket config
const path = require('path'); // ✅ ADD THIS

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: { 
    origin: "*", // Change to your frontend URL in production
    methods: ["GET", "POST"]
  },
});

// ✅ Setup Socket.IO events
setupSocketIO(io);

// ✅ Make `io` globally available
app.set("io", io);

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use("/api/suggestions", require("./routes/suggestionRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/calendar", require("./routes/calendarRoutes"));
app.use("/api/programs", require("./routes/programsRoutes"));
app.use("/api/infographics", require("./routes/infographicRoutes"));
app.use("/api/accomplishments", require("./routes/accomplishmentRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/api/budgets", require("./routes/budgetProgramRoutes"));
app.use("/api/org-chart", require("./routes/organizationalRoutes"));
app.use("/api/albums", require("./routes/albumRoutes"));
app.use("/api/research", require("./routes/researchRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/datasets", require("./routes/datasetRoutes"));
app.use("/api/ai", require("./routes/aiModeration"));
app.use("/api/documentation", require("./routes/documentationRoutes"));


app.use("/api/tickets", require("./routes/tickets"));

// ✅ SERVER LISTEN
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));