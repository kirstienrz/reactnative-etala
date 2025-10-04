import mongoose from "mongoose";
import dotenv from "dotenv";
import Announcement from "./models/Announcement.js";

dotenv.config();

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Sample announcements
const sampleAnnouncements = [
  {
    title: "Barangay Clean-Up Drive",
    message: "Join us this Saturday for our community clean-up drive at 8AM. Meeting point: Barangay Hall."
  },
  {
    title: "Job Fair Announcement",
    message: "Local job fair will be held on October 20, 2025, at the Barangay Covered Court. Don’t miss it!"
  },
  {
    title: "Health Check-Up",
    message: "Free medical and dental check-up on October 15, 2025. Bring your valid ID."
  },
];

// ✅ Insert function
const seedAnnouncements = async () => {
  try {
    await Announcement.deleteMany(); // clear old data
    await Announcement.insertMany(sampleAnnouncements); // insert new ones
    console.log("🌱 Announcements seeded successfully!");
    process.exit(); // exit after success
  } catch (error) {
    console.error("❌ Error seeding announcements:", error);
    process.exit(1);
  }
};

// Run the function
seedAnnouncements();
