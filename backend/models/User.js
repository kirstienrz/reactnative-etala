const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
firstName: { type: String, required: false},
lastName: { type: String, required: false },
tupId: { 
  type: String, 
  required: true, 
  unique: true, 
  match: /^TUPT-\d{2}-\d{4}$/ // ensures TUPT-00-0000 format
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
  }
});

module.exports = mongoose.model("User", userSchema);
