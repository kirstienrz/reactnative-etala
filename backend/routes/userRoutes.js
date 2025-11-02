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


router.get("/all", auth(), async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("firstName lastName email")
      .sort({ firstName: 1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: err.message });
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

router.get("/all", auth(), async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("firstName lastName email")
      .sort({ firstName: 1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: err.message });
  }
});





// ========================================
// 👥 USER MANAGEMENT CRUD (SUPERADMIN)
// ========================================

// 📋 GET all users (for superadmin user management)
router.get("/manage/users", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const users = await User.find()
      .select("-password -pin")
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching all users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ➕ CREATE new user (superadmin only)
router.post("/manage/users", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const { 
      firstName, 
      lastName, 
      tupId, 
      email, 
      password, 
      role, 
      department, 
      birthday, 
      age, 
      gender 
    } = req.body;

    // Validation
    if (!tupId || !email || !password) {
      return res.status(400).json({ message: "TUP ID, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { tupId }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? "Email already exists" : "TUP ID already exists" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      firstName,
      lastName,
      tupId,
      email,
      password: hashedPassword,
      role: role || "user",
      department,
      birthday,
      age,
      gender,
      isFirstLogin: true,
      hasPin: false
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.pin;

    res.status(201).json(userResponse);
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// 📝 UPDATE user (superadmin only)
router.put("/manage/users/:id", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const { 
      firstName, 
      lastName, 
      tupId, 
      email, 
      role, 
      department, 
      birthday, 
      age, 
      gender,
      newPassword // optional: reset password
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent superadmin from changing their own role
    if (user._id.toString() === req.user.id && role && role !== "superadmin") {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    // Check for duplicate tupId or email (excluding current user)
    if (tupId || email) {
      const duplicate = await User.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(tupId ? [{ tupId }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (duplicate) {
        return res.status(400).json({ 
          message: duplicate.email === email ? "Email already exists" : "TUP ID already exists" 
        });
      }
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (tupId) user.tupId = tupId;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (birthday) user.birthday = birthday;
    if (age !== undefined) user.age = age;
    if (gender) user.gender = gender;

    // Reset password if provided
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.isFirstLogin = true; // Force password change on next login
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.pin;

    res.json(userResponse);
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// 🗑️ DELETE user (superadmin only)
router.delete("/manage/users/:id", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    // Prevent superadmin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// 🔍 GET single user details (superadmin only)
router.get("/manage/users/:id", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const user = await User.findById(req.params.id).select("-password -pin");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📦 ARCHIVE user (superadmin only)
router.put("/manage/users/:id/archive", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    // Prevent superadmin from archiving themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot archive your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isArchived = true;
    await user.save();

    res.json({ message: "User archived successfully" });
  } catch (err) {
    console.error("❌ Error archiving user:", err);
    res.status(500).json({ message: "Failed to archive user" });
  }
});

// 🔄 UNARCHIVE/RESTORE user (superadmin only)
router.put("/manage/users/:id/unarchive", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isArchived = false;
    await user.save();

    res.json({ message: "User restored successfully" });
  } catch (err) {
    console.error("❌ Error restoring user:", err);
    res.status(500).json({ message: "Failed to restore user" });
  }
});

module.exports = router;
