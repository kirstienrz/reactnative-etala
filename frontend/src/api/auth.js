import API from "./config";
import { saveItem, getItem } from "../utils/storage"; // ✅ import your SecureStore helper

// 🔐 Login
export const loginUser = async (email, password, tupId) => {
  const res = await API.post("/auth/login", { email, password, tupId });

  // ✅ Save email and token for future PIN login
  await saveItem("email", email);
  if (res.data.token) {
    await saveItem("token", res.data.token);
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
