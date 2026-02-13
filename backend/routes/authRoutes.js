// backend/routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// -------------------- SIGNUP --------------------
router.post("/signup", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    tupId,
    department,
    userType,
    birthday,
    gender,
  } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { tupId }] });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create activation token
    const activationToken = crypto.randomBytes(32).toString("hex");

    // Save user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      tupId,
      department,
      userType,
      birthday,
      gender,
      isActivated: false,
      activationToken,
      activationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hrs
    });

    // Activation link
    const activationLink = `https://etala.vercel.app/activate/${activationToken}`;

    try {
      await sendEmail({
        to: email,
        subject: "Activate your account",
        html: `
          <p>Hello ${firstName},</p>
          <p>Please activate your account by clicking the link below:</p>
          <a href="${activationLink}">${activationLink}</a>
          <p>This link expires in 24 hours.</p>
        `,
      });
      console.log(`✅ Activation email sent to ${email}`);
    } catch (emailErr) {
      console.error(`❌ Failed to send email to ${email}`, emailErr);
      // You can decide if you want to delete the user if email fails
      return res.status(500).json({ msg: "Signup failed: Could not send activation email" });
    }

    res.status(201).json({
      msg: "Signup successful. Please check your email to activate your account.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Server error");
  }
});

// -------------------- ACTIVATE ACCOUNT --------------------
router.get("/activate/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      activationToken: token,
      activationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired activation link" });
    }

    user.isActivated = true;
    user.activationToken = undefined;
    user.activationTokenExpiry = undefined;
    await user.save();

    res.json({ msg: "Account activated successfully. You may now login." });
  } catch (err) {
    console.error("Activation error:", err);
    res.status(500).send("Server error");
  }
});

// -------------------- LOGIN --------------------
router.post("/login", async (req, res) => {
  const { email, password, tupId } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isActivated) {
      return res.status(403).json({
        msg: "Please activate your account via the link sent to your email.",
      });
    }

    if (user.isArchived) {
      return res.status(403).json({
        msg: "Your account has been deactivated. Please contact the administrator.",
      });
    }

    if (user.tupId !== tupId) {
      return res.status(400).json({ msg: "Invalid TUPT ID" });
    }

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
      firstName: user.firstName,    // ✅ ADD THIS
      lastName: user.lastName,      // ✅ ADD THIS
      email: user.email,            // ✅ ADD THIS
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});

// -------------------- CHANGE PASSWORD --------------------
router.post("/change-password", async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, {
      password: hashed,
      isFirstLogin: false,
    });
    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// -------------------- SET PIN --------------------
router.post("/set-pin", async (req, res) => {
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

// -------------------- VERIFY PIN --------------------
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
      firstName: user.firstName,    // ✅ ADD THIS
      lastName: user.lastName,      // ✅ ADD THIS
      email: user.email,            // ✅ ADD THIS
    });
  } catch (err) {
    console.error("💥 Server error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
