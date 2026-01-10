const mongoose = require("mongoose");

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
    enum: ["superadmin", "user"],
    default: "user"
  },

  // 🏢 Department code (matches frontend list)
  department: {
    type: String,
    enum: ["BASD", "CAAD", "EEAD", "MAAD"],
    required: true,
  },

  // 👤 User classification
  userType: {
    type: String,
    enum: ["Student", "Faculty", "Non-Faculty"],
    required: true,
  },

  birthday: { type: Date },
  age: { type: Number },

  gender: { 
    type: String,
    enum: ["Male", "Female", "Other"],
  },

  isFirstLogin: { type: Boolean, default: true },
  hasPin: { type: Boolean, default: false },
  pin: { type: String },

  isActivated: {
    type: Boolean,
    default: false,
  },

  activationToken: String,
  activationTokenExpiry: Date,


  isArchived: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
