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

// PUT /api/user/me/pin → securely update MPIN
router.put("/me/pin", auth(), async (req, res) => {
  try {
    const { currentPassword, newPin } = req.body;
    
    if (!currentPassword || !newPin) {
      return res.status(400).json({ message: "Password and new PIN are required" });
    }

    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({ message: "PIN must be exactly 6 digits" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Hash and save new PIN
    const hashedPin = await bcrypt.hash(newPin, 10);
    user.pin = hashedPin;
    user.hasPin = true;
    await user.save();

    res.json({ message: "MPIN updated successfully" });
  } catch (err) {
    console.error("Error setting PIN:", err);
    res.status(500).json({ message: "Server error while updating MPIN" });
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

// 🔍 Search users for reporter identification (admin/superadmin only) - MUST BE BEFORE /:id
router.get("/search-reporters", auth(), async (req, res) => {
  try {
    console.log("🔍 Search reporters - User role:", req.user.role);
    if (req.user.role !== "superadmin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin and Superadmin only." });
    }

    const search = req.query.search || "";
    if (!search || search.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { tupId: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
      isArchived: false,
    })
      .select("_id tupId firstName lastName email")
      .limit(20);

    res.json(users);
  } catch (err) {
    console.error("❌ Error searching reporters:", err);
    res.status(500).json({ message: "Server error" });
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

// 📋 GET users with pagination, search, and filtering (for superadmin user management)
router.get("/manage/users", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const role = req.query.role || "all";
    const department = req.query.department || "all";
    const archiveStatus = req.query.archiveStatus || "all";
    const isArchived = req.query.isArchived === 'true';

    // Build query
    const query = { isArchived };

    if (role !== "all") {
      query.role = role;
    }

    if (department !== "all") {
      query.department = department;
    }

    const conditions = [];

    if (archiveStatus !== "all") {
      if (archiveStatus === "Active") {
        // Support older database documents where archiveStatus is null or undefined
        conditions.push({
          $or: [
            { archiveStatus: "Active" },
            { archiveStatus: null },
            { archiveStatus: { $exists: false } }
          ]
        });
      } else {
        conditions.push({ archiveStatus });
      }
    }

    if (search) {
      conditions.push({
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { tupId: { $regex: search, $options: "i" } }
        ]
      });
    }

    if (conditions.length > 0) {
      query.$and = conditions;
    }

    const sortBy = req.query.sortBy || "createdAt";
    let sortObj = { createdAt: -1 };
    
    if (sortBy === "name") {
      sortObj = { firstName: 1, lastName: 1 };
    } else if (sortBy === "gracePeriod") {
      sortObj = { archiveGracePeriodEndsAt: 1 }; // closest deadline first
    } else if (sortBy === "archivedDate") {
      sortObj = { archiveGracePeriodEndsAt: -1 }; // most recently archived first
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -pin")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
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
        subject: "Your eTALA Account Has Been Created",
        html: `
          <p>Hello ${firstName},</p>
          <p>Your account has been successfully created in eTALA.</p>
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

// 📦 BULK ARCHIVE users (superadmin only)
router.put("/manage/users/bulk-archive", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const { userIds, reason, graceDays } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "A list of valid user IDs is required." });
    }

    // Filter out the superadmin's own ID if included
    const targetIds = userIds.filter(id => id !== req.user.id);
    if (targetIds.length === 0) {
      return res.status(400).json({ message: "Cannot archive your own account." });
    }

    const days = parseInt(graceDays) || 7;
    const endsAt = Date.now() + days * 24 * 60 * 60 * 1000;
    const archiveReason = reason || "Inactivity / Administrative Decision";

    // Find target users to send emails
    const targetUsers = await User.find({ _id: { $in: targetIds } });

    // Update in bulk
    await User.updateMany(
      { _id: { $in: targetIds } },
      {
        $set: {
          isArchived: false,
          archiveStatus: "Pending Archive",
          archiveReason: archiveReason,
          archiveGracePeriodEndsAt: endsAt
        },
        $unset: {
          archiveAppealReason: "",
          archiveAppealSubmittedAt: ""
        }
      }
    );

    // Send emails asynchronously
    const gracePeriodDate = new Date(endsAt).toLocaleDateString("en-US", {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    targetUsers.forEach(user => {
      sendEmail({
        to: user.email,
        subject: "Notice of Scheduled Account Archiving - eTALA Portal",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
            <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Important Account Status Update</h2>
            <p>Dear <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p>This is an official notice that your eTALA account is scheduled to be <strong>archived and detached</strong> on <strong>${gracePeriodDate}</strong>.</p>
            
            <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <strong style="color: #c2410c;">Reason for Archiving:</strong><br/>
              <p style="margin: 8px 0 0 0; font-style: italic;">"${archiveReason}"</p>
            </div>
            
            <p><strong>What does this mean?</strong><br/>
            After the date above, your account will be fully deactivated and you will no longer be able to log in to the GAD Portal. However, your previous reports and records will remain securely stored in the system database for institutional reference.</p>
            
            <h3 style="color: #1e3a8a; margin-top: 24px;">What can you do? (Archive Appeal)</h3>
            <p>If you believe this is a mistake or you require your account to remain active, you have the right to file an appeal. To do this:</p>
            <ol>
              <li>Log in to your account at <a href="https://etala.vercel.app/" style="color: #2563eb; text-decoration: none;">https://etala.vercel.app/</a> before the deadline.</li>
              <li>You will see a highly visible warning banner at the top of your dashboard.</li>
              <li>Click <strong>"Submit Appeal"</strong>, state your reason, and send.</li>
            </ol>
            <p>Submitting an appeal will temporarily freeze the countdown and notify our GAD officers for manual review.</p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;"/>
            <p style="font-size: 12px; color: #6b7280; text-align: center;">TUP eTALA Gender and Development Portal &bull; Official Institutional Notification</p>
          </div>
        `
      }).catch(err => console.error("❌ Failed to send bulk archive email:", err));
    });

    res.json({ message: `Successfully scheduled archiving for ${targetIds.length} users.` });
  } catch (err) {
    console.error("❌ Error bulk archiving users:", err);
    res.status(500).json({ message: "Failed to bulk archive users." });
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
      isActivated,
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
      const tupIdUpper = tupId.toUpperCase();
      const tupIdMatch = tupIdUpper.match(/^TUPT-(\d{2})-\d{4}$/);
      const generalIdMatch = tupIdUpper.match(/^[A-Z0-9]{2,6}-\d{2}-\d{4}$/);

      if (!generalIdMatch) {
        return res.status(400).json({ message: "Invalid TUP ID format. Use TUPT-XX-XXXX for students or e.g. AP4-10-2019 for faculty." });
      }

      // Only validate year range for student TUPT IDs
      if (tupIdMatch) {
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
    if (isActivated !== undefined) user.isActivated = isActivated;

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

// ✉️ RESEND activation link (superadmin only)
const crypto = require("crypto");
router.post("/manage/users/:id/resend-activation", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isActivated) {
      return res.status(400).json({ message: "Account is already activated" });
    }

    // Generate new token
    const activationToken = crypto.randomBytes(32).toString("hex");
    user.activationToken = activationToken;
    user.activationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs
    await user.save();

    const activationLink = `https://etala.vercel.app/activate/${activationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Activate your account",
      html: `
        <p>Hello ${user.firstName},</p>
        <p>An administrator has resent your activation link. Please activate your account by clicking the link below:</p>
        <a href="${activationLink}">${activationLink}</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    res.json({ message: "Activation link resent successfully" });
  } catch (err) {
    console.error("❌ Error resending activation:", err);
    res.status(500).json({ message: "Failed to resend activation link" });
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

    const { reason, graceDays } = req.body;
    const days = parseInt(graceDays) || 7;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isArchived = false; // Remains false during grace period
    user.archiveStatus = "Pending Archive";
    user.archiveReason = reason || "Inactivity / Administrative Decision";
    user.archiveGracePeriodEndsAt = Date.now() + days * 24 * 60 * 60 * 1000;
    
    // Clear any previous appeals
    user.archiveAppealReason = undefined;
    user.archiveAppealSubmittedAt = undefined;
    
    await user.save();

    // Send scheduled archive warning email
    try {
      const gracePeriodDate = new Date(user.archiveGracePeriodEndsAt).toLocaleDateString("en-US", {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      await sendEmail({
        to: user.email,
        subject: "Notice of Scheduled Account Archiving - eTALA Portal",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
            <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Important Account Status Update</h2>
            <p>Dear <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p>This is an official notice that your eTALA account is scheduled to be <strong>archived and detached</strong> on <strong>${gracePeriodDate}</strong>.</p>
            
            <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <strong style="color: #c2410c;">Reason for Archiving:</strong><br/>
              <p style="margin: 8px 0 0 0; font-style: italic;">"${user.archiveReason}"</p>
            </div>
            
            <p><strong>What does this mean?</strong><br/>
            After the date above, your account will be fully deactivated and you will no longer be able to log in to the GAD Portal. However, your previous reports and records will remain securely stored in the system database for institutional reference.</p>
            
            <h3 style="color: #1e3a8a; margin-top: 24px;">What can you do? (Archive Appeal)</h3>
            <p>If you believe this is a mistake or you require your account to remain active, you have the right to file an appeal. To do this:</p>
            <ol>
              <li>Log in to your account at <a href="https://etala.vercel.app/" style="color: #2563eb; text-decoration: none;">https://etala.vercel.app/</a> before the deadline.</li>
              <li>You will see a highly visible warning banner at the top of your dashboard.</li>
              <li>Click <strong>"Submit Appeal"</strong>, state your reason, and send.</li>
            </ol>
            <p>Submitting an appeal will temporarily freeze the countdown and notify our GAD officers for manual review.</p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;"/>
            <p style="font-size: 12px; color: #6b7280; text-align: center;">TUP eTALA Gender and Development Portal &bull; Official Institutional Notification</p>
          </div>
        `
      });
      console.log("✅ Scheduled Archive Notification email sent");
    } catch (err) {
      console.error("❌ Failed to send scheduled archive email:", err);
    }

    res.json({ message: "User archiving scheduled successfully." });
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
    user.archiveStatus = "Active";
    user.archiveReason = undefined;
    user.archiveGracePeriodEndsAt = undefined;
    user.archiveAppealReason = undefined;
    user.archiveAppealSubmittedAt = undefined;
    
    await user.save();

    // Send Restoration Confirmation Email
    try {
      await sendEmail({
        to: user.email,
        subject: "Your eTALA Account Has Been RESTORED - GAD Portal",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
            <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Account Successfully Restored</h2>
            <p>Dear <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p>We are writing to let you know that your eTALA account has been **restored to Active status** by our GAD administrators.</p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <strong style="color: #15803d;">Current Status:</strong> Active & Enabled<br/>
              <p style="margin: 8px 0 0 0;">All scheduled deactivations or archive locks have been removed. You can now log in and access your portal normally.</p>
            </div>
            
            <p>Thank you for your active participation in promoting GAD community safe services!</p>
            <p><a href="https://etala.vercel.app/" style="display: inline-block; background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log In to GAD Portal</a></p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;"/>
            <p style="font-size: 12px; color: #6b7280; text-align: center;">TUP eTALA Gender and Development Portal &bull; Official Account Notifications</p>
          </div>
        `
      });
      console.log("✅ Restoration email sent successfully to " + user.email);
    } catch (err) {
      console.error("❌ Failed to send restoration email:", err);
    }

    res.json({ message: "User restored successfully" });
  } catch (err) {
    console.error("❌ Error restoring user:", err);
    res.status(500).json({ message: "Failed to restore user" });
  }
});

// Add this to your user routes file

// � Search users for reporter identification (superadmin only)
router.get("/search-reporters", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin and Superadmin only." });
    }

    const search = req.query.search || "";
    if (!search || search.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { tupId: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
      isArchived: false,
    })
      .select("_id tupId firstName lastName email")
      .limit(20);

    res.json(users);
  } catch (err) {
    console.error("❌ Error searching reporters:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// �📊 GET user analytics (superadmin only)
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

// ========================================
// 🛡️ USER ARCHIVE & APPEAL SYSTEM ENDPOINTS (OPTION A)
// ========================================

// ✍️ SUBMIT APPEAL (Authenticated User)
router.post("/appeal", auth(), async (req, res) => {
  try {
    const { appealReason } = req.body;
    if (!appealReason || !appealReason.trim()) {
      return res.status(400).json({ message: "Appeal reason is required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.archiveStatus !== "Pending Archive") {
      return res.status(400).json({ message: "Your account is not currently scheduled for archiving." });
    }

    user.archiveStatus = "Appeal Under Review";
    user.archiveAppealReason = appealReason;
    user.archiveAppealSubmittedAt = Date.now();
    user.archiveGracePeriodEndsAt = undefined; // Freeze countdown
    await user.save();

    // Notify Superadmins via email about the appeal submission
    try {
      const superadmins = await User.find({ role: "superadmin" });
      const adminEmails = superadmins.map(admin => admin.email).filter(Boolean);

      if (adminEmails.length > 0) {
        // Run email sending asynchronously so the user isn't stuck waiting
        sendEmail({
          to: adminEmails,
          subject: "ALERT: New Account Archive Appeal Submitted - eTALA Portal",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
              <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">Archive Appeal Submitted</h2>
              <p>A user has submitted an appeal to keep their account active.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">User Name:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.firstName} ${user.lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">TUP ID:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.tupId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Original Archiving Reason:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">"${user.archiveReason}"</td>
                </tr>
              </table>

              <div style="background-color: #f5f3ff; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <strong style="color: #4338ca;">User's Appeal Rationale:</strong><br/>
                <p style="margin: 8px 0 0 0; font-style: italic;">"${user.archiveAppealReason}"</p>
              </div>

              <p>Please log in to the GAD Admin Panel to review this appeal and respond (Accept or Reject).</p>

              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;"/>
              <p style="font-size: 12px; color: #6b7280; text-align: center;">TUP eTALA Gender and Development Portal &bull; Admin Alerts</p>
            </div>
          `
        }).catch(err => console.error("❌ Failed to notify admins of appeal via email:", err));
        
        console.log("✅ Superadmins notified of new appeal (async)");
      }
    } catch (err) {
      console.error("❌ Failed to notify admins of appeal via email:", err);
    }

    res.json({ 
      message: "Appeal submitted successfully! Admin review is now pending.",
      archiveStatus: user.archiveStatus
    });
  } catch (err) {
    console.error("❌ Error submitting appeal:", err);
    res.status(500).json({ message: "Failed to submit appeal" });
  }
});

// 📋 GET LIST OF APPEALS (Superadmin Only)
router.get("/manage/appeals", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const appeals = await User.find({ archiveStatus: "Appeal Under Review" })
      .select("-password -pin")
      .sort({ archiveAppealSubmittedAt: 1 });

    res.json(appeals);
  } catch (err) {
    console.error("❌ Error fetching appeals:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ⚖️ RESPOND TO APPEAL (Superadmin Only)
router.put("/manage/appeals/:id/respond", auth(), async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }

    const { action } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'approve' or 'reject'." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.archiveStatus !== "Appeal Under Review") {
      return res.status(400).json({ message: "This user does not have an appeal under review." });
    }

    if (action === "approve") {
      // Restore user completely
      user.isArchived = false;
      user.archiveStatus = "Active";
      user.archiveReason = undefined;
      user.archiveGracePeriodEndsAt = undefined;
      user.archiveAppealReason = undefined;
      user.archiveAppealSubmittedAt = undefined;
      await user.save();

      // Send Acceptance Email
      try {
        await sendEmail({
          to: user.email,
          subject: "Your Account Appeal Has Been APPROVED - eTALA Portal",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
              <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Appeal Approved</h2>
              <p>Dear <strong>${user.firstName} ${user.lastName}</strong>,</p>
              <p>We are pleased to inform you that your appeal to keep your eTALA account active has been **APPROVED** by our Gender and Development administrators.</p>
              
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <strong style="color: #15803d;">Status:</strong> Active (Restored)<br/>
                <p style="margin: 8px 0 0 0;">All scheduled archiving schedules on your account have been cancelled. You can continue to use your account normally.</p>
              </div>

              <p>Thank you for your active cooperation in promoting GAD and safe community institutional services!</p>
              <p><a href="https://etala.vercel.app/" style="display: inline-block; background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log In to GAD Portal</a></p>

              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;"/>
              <p style="font-size: 12px; color: #6b7280; text-align: center;">TUP eTALA Gender and Development Portal &bull; Official Account Notifications</p>
            </div>
          `
        });
      } catch (err) {
        console.error("❌ Failed to send appeal approval email:", err);
      }

      res.json({ message: "Appeal approved and user restored successfully." });
    } else {
      // Reject appeal and finalize archiving
      user.isArchived = true;
      user.archiveStatus = "Archived";
      user.archiveGracePeriodEndsAt = undefined; // permanently archived
      await user.save();

      // Send Rejection Email
      try {
        await sendEmail({
          to: user.email,
          subject: "Your Account Appeal Has Been REJECTED - eTALA Portal",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
              <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Appeal Rejected & Account Archived</h2>
              <p>Dear <strong>${user.firstName} ${user.lastName}</strong>,</p>
              <p>This is to inform you that your appeal to retain account access has been **REJECTED** by our GAD administrators after reviewing the case.</p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <strong style="color: #991b1b;">Status:</strong> Archived & Detached<br/>
                <p style="margin: 8px 0 0 0;">Your account is now deactivated. If you have any inquiries or require institutional records, please contact our physical Gender and Development Center office.</p>
              </div>

              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;"/>
              <p style="font-size: 12px; color: #6b7280; text-align: center;">TUP eTALA Gender and Development Portal &bull; Account Notifications</p>
            </div>
          `
        });
      } catch (err) {
        console.error("❌ Failed to send appeal rejection email:", err);
      }

      res.json({ message: "Appeal rejected and user archived permanently." });
    }
  } catch (err) {
    console.error("❌ Error responding to appeal:", err);
    res.status(500).json({ message: "Failed to respond to appeal" });
  }
});

module.exports = router;
