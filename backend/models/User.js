const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  tupId: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^TUPT-\d{2}-\d{4}$/ 
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["superadmin", "admin", "user"],
    default: "user"
  },
  department: { 
    type: String,
    enum: ["System", "OSA", "HR", "Department Head", "CIT", "Faculty", "Staff", "Student"],
  },

  // 🆕 Added fields
  birthday: { type: Date },
  age: { type: Number },
  gender: { 
    type: String,
    enum: ["Male", "Female", "Other"],
  },

  // 👇 existing fields
  isFirstLogin: { type: Boolean, default: true },
  hasPin: { type: Boolean, default: false },
  pin: { type: String }, // hashed pin
});

module.exports = mongoose.model("User", userSchema);
