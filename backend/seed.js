// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const User = require("./models/User.js");
// const bcrypt = require("bcryptjs");

// dotenv.config();

// // ✅ Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// // ✅ Sample users
// const users = [
//   { firstName: "GAD", lastName: "Admin", tupId: "TUPT-00-0001", email: "gad@etala.com", password: "123456", role: "superadmin", department: "System", isArchived: false },
//   { firstName: "OSA", lastName: "Admin", tupId: "TUPT-00-0002", email: "osa_admin@etala.com", password: "123456", role: "admin", department: "OSA", isArchived: false },
//   { firstName: "HR", lastName: "Admin", tupId: "TUPT-00-0003", email: "hr_admin@etala.com", password: "123456", role: "admin", department: "HR", isArchived: false },
//   { firstName: "DeptHead", lastName: "Admin", tupId: "TUPT-00-0004", email: "depthead_admin@etala.com", password: "123456", role: "admin", department: "Department Head", isArchived: false },
//   { firstName: "Student", lastName: "One", tupId: "TUPT-00-0005", email: "student1@etala.com", password: "123456", role: "user", department: "Student", isArchived: false },
//   { firstName: "Student", lastName: "Two", tupId: "TUPT-00-0006", email: "student2@etala.com", password: "123456", role: "user", department: "Student", isArchived: false },
//   { firstName: "Faculty", lastName: "One", tupId: "TUPT-00-0007", email: "faculty1@etala.com", password: "123456", role: "user", department: "Faculty", isArchived: false },
//   { firstName: "Staff", lastName: "One", tupId: "TUPT-00-0008", email: "staff1@etala.com", password: "123456", role: "user", department: "Staff", isArchived: false },
//   { firstName: "Staff", lastName: "two", tupId: "TUPT-00-0009", email: "staff2@etala.com", password: "123456", role: "user", department: "Staff", isArchived: false },
// ];

// // ✅ Insert function
// const seedUsers = async () => {
//   try {
//     await User.deleteMany(); // clear old users

//     // Hash passwords and insert users
//     for (let user of users) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(user.password, salt);
//       await User.create(user);
//     }

//     console.log("🌱 Users seeded successfully!");
//     process.exit(); // exit after success
//   } catch (error) {
//     console.error("❌ Error seeding users:", error);
//     process.exit(1);
//   }
// };

// // Run the function
// seedUsers();