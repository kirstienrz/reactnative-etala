

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const setupSocketIO = require("./config/socket");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

dotenv.config();
connectDB();

// ================= CORS CONFIG =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost",
  "https://localhost",       // Added for Capacitor Android HTTPS origin
  "capacitor://localhost",
  "https://etala.vercel.app",
  "https://reactnative-etala.onrender.com",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

const app = express();

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Global CORS Middleware (Applied BEFORE Rate Limiters)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('Not allowed by CORS'));
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Correct IP detection behind proxies (Must be before rate limiters)
app.set("trust proxy", 1);

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again in 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

// Auth Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many auth attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Fix for Express 5 compatibility with express-mongo-sanitize
app.use((req, res, next) => {
  if (req.query) {
    const query = req.query;
    Object.defineProperty(req, "query", {
      value: query,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  next();
});

// Data sanitization
app.use(mongoSanitize());
app.use(xss());

const server = http.createServer(app);
require("./utils/sendAdminReminder");

// ================= MIDDLEWARES =================
// express.json is already applied above with limit

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Set to true to allow debugging, or restrict later
      }
    },
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
