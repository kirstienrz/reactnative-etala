const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Suggestion = require("./models/Suggestion.js");

dotenv.config();

// ✅ Connect to MongoDB using .env
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Sample suggestions
const suggestions = [
  {
    text: "Add a GAD orientation for new students and faculty.",
    submittedBy: "Maria Santos",
    email: "maria.santos@example.com",
    priority: "high",
    status: "new",
    archived: false,
    notes: [{ text: "Forwarded to the GAD Office for review." }],
    activityLog: [{ message: "Suggestion received and logged." }],
  },
  {
    text: "Install more lights near the women’s comfort room area.",
    submittedBy: "Juan Dela Cruz",
    email: "juan.dc@example.com",
    priority: "medium",
    status: "in progress",
    archived: false,
    notes: [{ text: "Request approved by admin and sent to facilities." }],
    activityLog: [{ message: "Reviewed by facilities committee." }],
  },
  {
    text: "Host a seminar about gender equality awareness next semester.",
    submittedBy: "Ana Reyes",
    email: "ana.reyes@example.com",
    priority: "low",
    status: "resolved",
    archived: true,
    notes: [{ text: "Completed during GAD Week 2025." }],
    activityLog: [{ message: "Marked as completed and archived." }],
  },
  {
    text: "Provide gender-neutral restrooms around campus.",
    submittedBy: "Carlos Perez",
    email: "carlos.perez@example.com",
    priority: "high",
    status: "new",
    archived: false,
    notes: [],
    activityLog: [{ message: "Waiting for admin review." }],
  },
];

// ✅ Insert function
const seedSuggestions = async () => {
  try {
    await Suggestion.deleteMany(); // clear old data

    await Suggestion.insertMany(suggestions);
    console.log("🌱 GAD Suggestions seeded successfully!");

    process.exit(); // ✅ exit after seeding
  } catch (error) {
    console.error("❌ Error seeding suggestions:", error);
    process.exit(1);
  }
};

// 🚀 Run the function
seedSuggestions();
