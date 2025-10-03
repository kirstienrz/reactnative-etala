// seed.js
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("123456", 10);

    // Clear old users to prevent duplicate key errors
    await User.deleteMany({});

    // Insert all users
  await User.insertMany([
  // Super Admin
  {
    email: "gad@etala.com",
    password: hashedPassword,
    role: "superadmin",
    department: "System",
    tupId: "TUPT-00-0001",
  },

  // Admins
  {
    email: "osa_admin@etala.com",
    password: hashedPassword,
    role: "admin",
    department: "OSA",
    tupId: "TUPT-00-0002",
  },
  {
    email: "hr_admin@etala.com",
    password: hashedPassword,
    role: "admin",
    department: "HR",
    tupId: "TUPT-00-0003",
  },
  {
    email: "depthead_admin@etala.com",
    password: hashedPassword,
    role: "admin",
    department: "Department Head",
    tupId: "TUPT-00-0004",
  },

  // Users - Students
  {
    email: "student1@etala.com",
    password: hashedPassword,
    role: "user",
    department: "Student",
    tupId: "TUPT-00-0005",
  },
  {
    email: "student2@etala.com",
    password: hashedPassword,
    role: "user",
    department: "Student",
    tupId: "TUPT-00-0006",
  },

  // Users - Faculty
  {
    email: "faculty1@etala.com",
    password: hashedPassword,
    role: "user",
    department: "Faculty",
    tupId: "TUPT-00-0007",
  },

  // Users - Staff
  {
    email: "staff1@etala.com",
    password: hashedPassword,
    role: "user",
    department: "Staff",
    tupId: "TUPT-00-0008",
  },
]);


    console.log("✅ Superadmin, Admins, and Users created successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    mongoose.disconnect();
  }
}

seed();
