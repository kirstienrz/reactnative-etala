

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const setupSocketIO = require("./config/socket");
const path = require("path");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

require("./utils/sendAdminReminder"); // <- ADD THIS HERE

// ================= CORS CONFIG =================
const allowedOrigins = [
  "http://localhost:5173",
  "https://etala.vercel.app",
  process.env.FRONTEND_URL,
];

// Allow all preflight requests FIRST (very important for Vercel)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Express CORS
app.use(cors({
  origin: function (origin, callback) {
    // allow Postman, mobile apps, or undefined origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // IMPORTANT: do not block in production serverless
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// ================= MIDDLEWARES =================
app.use(express.json());

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true
  }
});

setupSocketIO(io);
app.set("io", io);

// ================= ROUTES =================
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
app.use("/api/finance", require("./routes/financeRoutes"));
app.use("/api/tickets", require("./routes/tickets"));
app.use("/api/admin-availability", require("./routes/adminAvailabilityRoutes"));

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("Allowed origins:", allowedOrigins);
});
