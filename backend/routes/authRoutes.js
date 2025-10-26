const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// LOGIN ONLY (no signup)
// routes/authRoutes.js
router.post("/login", async (req, res) => {
  const { email, password, tupId } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    if (user.tupId !== tupId)
      return res.status(400).json({ msg: "Invalid TUPT ID" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      _id: user._id,
      token,
      role: user.role,
      department: user.department,
      tupId: user.tupId,
      isFirstLogin: user.isFirstLogin,
      hasPin: user.hasPin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
router.post("/change-password", async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, {
      password: hashed,
      isFirstLogin: false
    });
    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});router.post("/set-pin", async (req, res) => {
  const { email, pin } = req.body;

  try {
    if (!/^\d{6}$/.test(pin))
      return res.status(400).json({ msg: "PIN must be 6 digits" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const hashedPin = await bcrypt.hash(pin, 10);
    user.pin = hashedPin;
    user.hasPin = true;
    await user.save();

    res.json({ msg: "PIN setup successful" });
  } catch (err) {
    console.error("Error in /set-pin:", err);
    res.status(500).send("Server error");
  }
});

// VERIFY PIN (for PIN login)
router.post("/verify-pin", async (req, res) => {
  const { email, pin } = req.body;
  console.log("🔍 Received PIN login:", { email, pin });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ No user found for this email");
      return res.status(400).json({ msg: "Invalid email" });
    }

    if (!user.hasPin) {
      console.log("⚠️ User has no PIN set");
      return res.status(400).json({ msg: "No PIN set" });
    }

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      console.log("❌ Wrong PIN entered");
      return res.status(400).json({ msg: "Invalid PIN" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ PIN verified for:", email);
    res.json({
      msg: "PIN verified successfully",
      token,
      role: user.role,
      department: user.department,
      tupId: user.tupId,
    });
  } catch (err) {
    console.error("💥 Server error:", err);
    res.status(500).send("Server error");
  }
});




module.exports = router;
