const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth"); // ✅ import your JWT middleware


// GET /api/user/me → get current user profile
router.get("/me", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/user/me → update current user profile
router.put("/me", auth(), async (req, res) => {
  try {
    const { firstName, lastName, birthday, gender, currentPassword, newPassword } = req.body || {};

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Only handle password if both fields are provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // ✅ Update only provided fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (birthday) user.birthday = birthday;
    if (gender) user.gender = gender;

    const updatedUser = await user.save();
    const userObj = updatedUser.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// 🧠 GET user profile (Protected)
router.get("/:id", auth(), async (req, res) => {
  try {
    // 🔒 Ensure user can only access their own profile (unless admin)
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✏️ UPDATE user profile (Protected + Password verification)
router.put("/:id", auth(), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthday,
      age,
      gender,
      currentPassword, // 🧩 old password
      newPassword, // 🆕 new password
    } = req.body;

    // 🔒 Ensure user can only edit their own profile
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🧩 Password change logic
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Both current and new passwords are required" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // 🧠 Update allowed fields only
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.birthday = birthday || user.birthday;
    user.age = age || user.age;
    user.gender = gender || user.gender;

    // Save changes
    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password; // remove password from response

    res.json(userResponse);
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

module.exports = router;
