const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth"); // ✅ import your JWT middleware
const sendEmail = require("../utils/sendEmail"); // adjust path
// const sendEmail = require("../utils/sendEmailSendGrid");


router.get("/analytics", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied." });
    }

    const users = await User.find();

    // Basic counts
    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.isArchived).length;
    const archivedUsers = users.filter(u => u.isArchived).length;

    // User type distribution
    const userTypeCount = {};
    users.forEach(u => {
      userTypeCount[u.userType] = (userTypeCount[u.userType] || 0) + 1;
    });

    // Department distribution
    const deptCount = {};
    users.forEach(u => {
      deptCount[u.department] = (deptCount[u.department] || 0) + 1;
    });

    // Monthly registrations (last 6 months)
    const months = [];
    const counts = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleDateString('en-US', { month: 'short' }));

      const count = users.filter(u => {
        if (!u.createdAt) return false;
        const diff = (new Date().getFullYear() - u.createdAt.getFullYear()) * 12 +
          (new Date().getMonth() - u.createdAt.getMonth());
        return diff === i;
      }).length;
      counts.push(count);
    }

    res.json({
      overview: { totalUsers, activeUsers, archivedUsers },
      userType: userTypeCount,
      department: deptCount,
      trend: { months, counts }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

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
// ✏️ UPDATE user profile (Protected + Password verification)
router.put("/:id", auth(), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthday,
      age,
      gender,
      currentPassword,
      newPassword,
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
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    // ✅ FIX: Properly handle birthday - allow null/undefined to clear it
    if (birthday !== undefined) {
      user.birthday = birthday ? new Date(birthday) : null;
    }

    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;

    // Save changes
    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

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

    const { firstName, lastName, tupId, email, password, role, department, birthday, age, gender, userType } = req.body;

    if (!tupId || !email || !password) {
      return res.status(400).json({ message: "TUP ID, email, and password are required" });
    }

    // TUPT ID Year Validation (ONLY for Students)
    const tupIdMatch = tupId?.match(/^TUPT-(\d{2})-\d{4}$/);
    if (tupIdMatch && userType === "Student") {
      const idYear = parseInt(tupIdMatch[1]);
      const currentYearShort = new Date().getFullYear() % 100;
      const minYearShort = currentYearShort - 5;
      if (idYear < minYearShort || idYear > currentYearShort) {
        return res.status(400).json({
          message: `Invalid TUPT ID year. Only student IDs from 20${minYearShort} to 20${currentYearShort} are allowed.`
        });
      }
    }

    const existingUser = await User.findOne({ $or: [{ email }, { tupId }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? "Email already exists" : "TUP ID already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
      userType: userType || "Student",
      isFirstLogin: true,
      hasPin: false
    });

    await newUser.save();

    // Remove sensitive fields before sending response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.pin;

    // ✉️ Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: "Your Etala Account Has Been Created",
        html: `
          <p>Hello ${firstName},</p>
          <p>Your account has been successfully created in Etala.</p>
          <p><strong>Email:</strong> ${email}<br/>
          <p>Password is your username in capital</p>
          <p>Please log in and change your password immediately.</p>

          <p>https://etala.vercel.app/</p>
        `
      });
      console.log("✅ Confirmation email sent");
    } catch (err) {
      console.error("❌ Failed to send confirmation email:", err);
    }

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
      userType,
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

    // TUPT ID Year Validation (if being updated and user is a Student)
    if (tupId) {
      const tupIdMatch = tupId.match(/^TUPT-(\d{2})-\d{4}$/);
      if (tupIdMatch) {
        // Only check year limit if the user is a Student
        // Check both the existing userType or the one being updated
        const targetUserType = userType || user.userType;
        if (targetUserType === "Student") {
          const idYear = parseInt(tupIdMatch[1]);
          const currentYearShort = new Date().getFullYear() % 100;
          const minYearShort = currentYearShort - 5;
          if (idYear < minYearShort || idYear > currentYearShort) {
            return res.status(400).json({
              message: `Invalid TUPT ID year. Only student IDs from 20${minYearShort} to 20${currentYearShort} are allowed.`
            });
          }
        }
      } else {
        return res.status(400).json({ message: "Invalid TUPT ID format. Use TUPT-XX-XXXX" });
      }
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
    if (userType) user.userType = userType;

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

// Add this to your user routes file

// 📊 GET user analytics (superadmin only)
router.get("/analytics", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const users = await User.find();

    // 📊 Total counts
    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.isArchived).length;
    const archivedUsers = users.filter(u => u.isArchived).length;
    const activatedUsers = users.filter(u => u.isActivated).length;
    const pendingActivation = users.filter(u => !u.isActivated).length;

    // 👥 User type distribution
    const userTypeDistribution = users.reduce((acc, user) => {
      acc[user.userType] = (acc[user.userType] || 0) + 1;
      return acc;
    }, {});

    // 🏢 Department distribution
    const departmentDistribution = users.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {});

    // 👤 Gender distribution
    const genderDistribution = users.reduce((acc, user) => {
      if (user.gender) {
        acc[user.gender] = (acc[user.gender] || 0) + 1;
      }
      return acc;
    }, {});

    // 🔐 Role distribution
    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // 📅 Monthly registration trend (last 12 months)
    const monthlyRegistrations = Array(12).fill(0);
    const currentDate = new Date();

    users.forEach(user => {
      if (user.createdAt) {
        const monthDiff =
          (currentDate.getFullYear() - user.createdAt.getFullYear()) * 12 +
          (currentDate.getMonth() - user.createdAt.getMonth());

        if (monthDiff >= 0 && monthDiff < 12) {
          monthlyRegistrations[11 - monthDiff]++;
        }
      }
    });

    // 📆 Get month labels
    const monthLabels = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthLabels.push(d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    // 📖 Booking access stats
    const usersWithBookingAccess = users.filter(u => u.bookingAccess?.granted).length;
    const usedBookingAccess = users.filter(u => u.bookingAccess?.used).length;
    const unusedBookingAccess = usersWithBookingAccess - usedBookingAccess;

    // 🎂 Age distribution (by ranges)
    const ageRanges = {
      "Under 18": 0,
      "18-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-55": 0,
      "56+": 0
    };

    users.forEach(user => {
      if (user.age) {
        if (user.age < 18) ageRanges["Under 18"]++;
        else if (user.age <= 25) ageRanges["18-25"]++;
        else if (user.age <= 35) ageRanges["26-35"]++;
        else if (user.age <= 45) ageRanges["36-45"]++;
        else if (user.age <= 55) ageRanges["46-55"]++;
        else ageRanges["56+"]++;
      }
    });

    // 📍 PIN setup status
    const usersWithPin = users.filter(u => u.hasPin).length;
    const usersWithoutPin = totalUsers - usersWithPin;

    // 🆕 First login status
    const firstTimeUsers = users.filter(u => u.isFirstLogin).length;
    const returningUsers = totalUsers - firstTimeUsers;

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        archivedUsers,
        activatedUsers,
        pendingActivation
      },
      distributions: {
        userType: userTypeDistribution,
        department: departmentDistribution,
        gender: genderDistribution,
        role: roleDistribution,
        ageRanges
      },
      trends: {
        monthlyRegistrations,
        monthLabels
      },
      bookingAccess: {
        total: usersWithBookingAccess,
        used: usedBookingAccess,
        unused: unusedBookingAccess
      },
      security: {
        usersWithPin,
        usersWithoutPin,
        firstTimeUsers,
        returningUsers
      }
    });
  } catch (err) {
    console.error("❌ Error fetching analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
