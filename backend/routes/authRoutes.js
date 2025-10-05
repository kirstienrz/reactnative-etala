const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// LOGIN ONLY (no signup)
// routes/authRoutes.js
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({
      _id: user._id,      // ✅ send the actual user id
      token,              // ✅ send JWT token
      role: user.role,
      department: user.department,
      tupId: user.tupId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});



module.exports = router;
