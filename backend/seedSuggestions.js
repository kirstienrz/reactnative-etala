// backend/seed/seedSuggestions.js
const mongoose = require("mongoose");
require("dotenv").config();

// ---- Suggestion Schema (same as backend) ----
const suggestionSchema = new mongoose.Schema({
  id: Number,
  text: String,
  submittedBy: String,
  submittedDate: String,
  status: String,
  priority: String,
  archived: Boolean
});

const Suggestion = mongoose.model("Suggestion", suggestionSchema);

// ---- SAMPLE DATA FOR SEEDING ----
const seedData = [
  {
    id: 1,
    text: "Provide more GAD training sessions for students.",
    submittedBy: "Jane D.",
    submittedDate: "2025-01-12",
    status: "pending",
    priority: "high",
    archived: false
  },
  {
    id: 2,
    text: "Create a safe space lounge for women.",
    submittedBy: "Mark C.",
    submittedDate: "2025-02-05",
    status: "under-review",
    priority: "medium",
    archived: false
  },
  {
    id: 3,
    text: "More awareness campaigns about gender equality.",
    submittedBy: "Anonymous",
    submittedDate: "2025-02-17",
    status: "approved",
    priority: "low",
    archived: false
  },
  {
    id: 4,
    text: "Implement reporting hotline for harassment cases.",
    submittedBy: "Carlos R.",
    submittedDate: "2025-03-01",
    status: "rejected",
    priority: "high",
    archived: false
  },
  {
    id: 5,
    text: "Add monthly seminar about emotional well-being.",
    submittedBy: "Maria S.",
    submittedDate: "2025-03-10",
    status: "implemented",
    priority: "medium",
    archived: false
  },
  {
    id: 6,
    text: "Archive test sample.",
    submittedBy: "Tester",
    submittedDate: "2025-01-10",
    status: "approved",
    priority: "low",
    archived: true
  }
];

// ---- SEED FUNCTION ----
async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Clearing existing data...");
    await Suggestion.deleteMany({});

    console.log("Inserting seed data...");
    await Suggestion.insertMany(seedData);

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
