const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes")); // 👈 added
app.use("/api/announcements", require("./routes/announcementRoutes")); // 👈 added
app.use("/api/user", require("./routes/userRoutes")); // 👈 added


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
