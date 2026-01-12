// import API from "./config";
// import { saveItem, getItem } from "../utils/storage"; // ✅ import your SecureStore helper

// // 🔐 Login
// export const loginUser = async (email, password, tupId) => {
//   const res = await API.post("/auth/login", { email, password, tupId });

//   // Save email for PIN login
//   await saveItem("email", email);

//   // Save token
//   if (res.data.token) {
//     await saveItem("token", res.data.token);
//   }

//   // Save role (IMPORTANT for role-based UI)
//   if (res.data.user && res.data.user.role) {
//     await saveItem("role", res.data.user.role);
//   }

//   return res.data;
// };

// // 🚪 Logout (optional backend clearing)
// export const logoutUser = async () => {
//   return true;
// };

// // 🔄 Change Password (first login)
// export const changePassword = async (userId, newPassword) => {
//   const res = await API.post("/auth/change-password", { userId, newPassword });
//   return res.data;
// };
// // 🔓 PIN Login (for returning users)
// export const pinLogin = async (pin) => {
//   try {
//     const savedEmail = await getItem("email");
//     console.log("📧 Retrieved email from SecureStore:", savedEmail);
//     console.log("🔢 PIN received by pinLogin function:", pin);

//     if (!savedEmail) {
//       throw new Error("No saved email found");
//     }

//     if (!pin || pin.length !== 6) {
//       throw new Error("Invalid PIN");
//     }

//     console.log("🚀 Sending to backend - Email:", savedEmail, "PIN:", pin);

//     const res = await API.post("/auth/verify-pin", { 
//       email: savedEmail, 
//       pin: pin 
//     });
    
//     return res.data;
//   } catch (error) {
//     console.error("💥 Error in pinLogin function:", error);
//     throw error;
//   }
// };

// // 🔐 Set PIN (for first-time PIN setup)
// export const setPin = async (email, pin) => {
//   try {
//     const res = await API.post("/auth/set-pin", { email, pin });
//     return res.data;
//   } catch (error) {
//     console.error("❌ Error in setPin API:", error.response?.data || error.message);
//     throw error;
//   }
// };


import API from "./config";
import { saveItem, getItem } from "../utils/storage";

// 🔐 Login
export const loginUser = async (email, password, tupId) => {
  const res = await API.post("/auth/login", { email, password, tupId });

  // Save email for PIN login
  await saveItem("email", email);

  // Save token
  if (res.data.token) {
    await saveItem("token", res.data.token);
  }

  // Save role (IMPORTANT for role-based UI)
  if (res.data.user && res.data.user.role) {
    await saveItem("role", res.data.user.role);
  }

  // ✅ FIX: Save userId from the response
  if (res.data.user && res.data.user._id) {
    await saveItem("userId", res.data.user._id);
  } else if (res.data._id) {
    await saveItem("userId", res.data._id);
  }

  return res.data;
};

// 🚪 Logout (optional backend clearing)
export const logoutUser = async () => {
  return true;
};

// 🔄 Change Password (first login)
export const changePassword = async (userId, newPassword) => {
  const res = await API.post("/auth/change-password", { userId, newPassword });
  return res.data;
};

// 🔓 PIN Login (for returning users)
export const pinLogin = async (pin) => {
  try {
    const savedEmail = await getItem("email");
    console.log("📧 Retrieved email from SecureStore:", savedEmail);
    console.log("🔢 PIN received by pinLogin function:", pin);

    if (!savedEmail) {
      throw new Error("No saved email found");
    }

    if (!pin || pin.length !== 6) {
      throw new Error("Invalid PIN");
    }

    console.log("🚀 Sending to backend - Email:", savedEmail, "PIN:", pin);

    const res = await API.post("/auth/verify-pin", { 
      email: savedEmail, 
      pin: pin 
    });
    
    // ✅ FIX: Save userId from PIN login response
    if (res.data.user && res.data.user._id) {
      await saveItem("userId", res.data.user._id);
    } else if (res.data._id) {
      await saveItem("userId", res.data._id);
    }
    
    // ✅ FIX: Save token if provided
    if (res.data.token) {
      await saveItem("token", res.data.token);
    }

    // ✅ FIX: Save role if provided
    if (res.data.user && res.data.user.role) {
      await saveItem("role", res.data.user.role);
    }
    
    return res.data;
  } catch (error) {
    console.error("💥 Error in pinLogin function:", error);
    throw error;
  }
};

// 🔐 Set PIN (for first-time PIN setup)
export const setPin = async (email, pin) => {
  try {
    const res = await API.post("/auth/set-pin", { email, pin });
    return res.data;
  } catch (error) {
    console.error("❌ Error in setPin API:", error.response?.data || error.message);
    throw error;
  }
};