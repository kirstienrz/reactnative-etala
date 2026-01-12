// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   TextInput,
//   TouchableWithoutFeedback,
//   Image
// } from "react-native";
// import { pinLogin } from "../api/auth";
// import * as SecureStore from "expo-secure-store";
// import Header from "../components/Header";

// export default function PinLoginScreen({ navigation }) {
//   const [pin, setPin] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState(null);
//   const [maskedEmail, setMaskedEmail] = useState("");
//   const inputRef = useRef(null);

//   // Fetch stored credentials
//   useEffect(() => {
//     const fetchCredentials = async () => {
//       const savedEmail = await SecureStore.getItemAsync("email");
//       const hasPin = await SecureStore.getItemAsync("hasPin");

//       console.log("Retrieved email:", savedEmail);
//       console.log("Has PIN:", hasPin);

//       if (!savedEmail) {
//         Alert.alert("Error", "No saved email found. Please log in again.");
//         navigation.replace("LoginScreen");
//         return;
//       }

//       if (hasPin !== "true") {
//         navigation.replace("SetPinScreen", { email: savedEmail });
//         return;
//       }

//       setEmail(savedEmail);
//       setMaskedEmail(maskEmail(savedEmail));
//     };

//     fetchCredentials();
//   }, []);

//   // Mask email like fa****@gmail.com
//   const maskEmail = (email) => {
//     if (!email) return "";
//     const [local, domain] = email.split("@");
//     if (local.length <= 2) return `${local[0]}*@${domain}`;
//     const visible = local.slice(0, 2);
//     return `${visible}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
//   };

//   // Auto focus
//   useEffect(() => {
//     const timer = setTimeout(() => inputRef.current?.focus(), 600);
//     return () => clearTimeout(timer);
//   }, []);

//   const focusInput = () => {
//     if (inputRef.current) {
//       inputRef.current.blur();
//       setTimeout(() => inputRef.current.focus(), 50);
//     }
//   };

//   // Handle PIN Login
//   const handlePinLogin = async () => {
//   if (!email) {
//     Alert.alert("Error", "No email found. Please log in again.");
//     navigation.replace("LoginScreen");
//     return;
//   }

//   if (pin.length !== 6) {
//     Alert.alert("Invalid PIN", "Please enter a 6-digit PIN.");
//     return;
//   }

//   setLoading(true);

//   try {
//     const response = await pinLogin(pin);

//     if (response.token) {
//       // Save token
//       await SecureStore.setItemAsync("token", response.token);

//       // Save role for later
//       if (response.role) {
//         await SecureStore.setItemAsync("role", response.role);
//       }

//       // Navigate based on role
//       if (response.role === "superadmin") {
//         navigation.replace("SuperadminDashboard");
//       } else if (response.role === "admin") {
//         navigation.replace("SuperadminDashboard");
//       } else {
//         navigation.replace("UserHome");
//       }
//     } else {
//       Alert.alert("Error", "Incorrect PIN. Try again.");
//       setPin("");
//       focusInput();
//     }
//   } catch (error) {
//     console.error("PIN Login Error:", error);
//     Alert.alert("Error", "Unable to log in with PIN.");
//   } finally {
//     setLoading(false);
//   }
// };

//   // Switch Account
//   // Switch Account (with confirmation)
//   const handleSwitchAccount = () => {
//     Alert.alert(
//       "Switch Account",
//       "Are you sure you want to log out and switch account?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Yes, Log Out",
//           style: "destructive",
//           onPress: async () => {
//             await SecureStore.deleteItemAsync("email");
//             await SecureStore.deleteItemAsync("hasPin");
//             await SecureStore.deleteItemAsync("token");
//             navigation.replace("LandingPage");
//           },
//         },
//       ]
//     );
//   };


//   return (
//     <TouchableWithoutFeedback onPress={focusInput}>
//       <View style={styles.container}>
//         <View style={styles.logoContainer}>
//           <Image
//             source={require("../../assets/tup.png")}
//             style={styles.logo}
//             resizeMode="contain"
//           />
//           <Image
//             source={require("../../assets/logo.jpg")}
//             style={styles.logo}
//             resizeMode="contain"
//           />
//         </View>

//         <Text style={styles.title}>Welcome Back!</Text>
//         <Text style={styles.subtitle}>Enter your 6-digit MPIN to continue.</Text>


//         {maskedEmail ? (
//           <Text style={styles.emailText}>{maskedEmail}</Text>
//         ) : null}

//         <Text style={styles.mpin}>Enter your MPIN</Text>
//         {/* PIN Boxes */}
//         <View style={styles.pinContainer}>
//           {Array(6)
//             .fill("")
//             .map((_, index) => (
//               <TouchableOpacity key={index} onPress={focusInput}>
//                 <View style={styles.pinBox}>
//                   {/* Ipakita lang bullet kapag may value */}
//                   <Text style={styles.pinText}>
//                     {pin[index] ? "•" : ""}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             ))}
//         </View>


//         {/* Hidden TextInput */}
//         <TextInput
//           ref={inputRef}
//           style={styles.hiddenInput}
//           keyboardType="numeric"
//           maxLength={6}
//           value={pin}
//           onChangeText={setPin}
//           secureTextEntry
//           autoFocus
//           blurOnSubmit={false}
//         />

//         {/* Unlock button */}
//         <TouchableOpacity
//           onPress={handlePinLogin}
//           disabled={loading}
//           style={[styles.button, loading && styles.disabled]}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.btnText}>Log In</Text>
//           )}
//         </TouchableOpacity>

//         {/* Switch account */}
//         <TouchableOpacity onPress={handleSwitchAccount} style={styles.switchContainer}>
//           <Text>Not You?</Text>
//           <Text style={styles.switchText}> Switch Account</Text>
//         </TouchableOpacity>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 24,
//     justifyContent: "flex-start",
//     paddingTop: 20,
//   },
//   logoContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 10,
//     marginTop: 15,
//   },

//   logo: {
//     width: 90,
//     height: 60,
//     marginBottom: 10,
//   },
//   emailText: {
//     textAlign: "center",
//     color: "#6B7280",
//     fontSize: 14,
//     marginTop: 8,
//     marginBottom: 16,
//   },
//   title: {
//     marginTop: 50,
//     fontSize: 24,
//     fontWeight: "700",
//     textAlign: "left",
//     color: "#111827",
//   },
//   subtitle: {
//     fontSize: 15,
//     color: "#6B7280",
//     marginTop: 4,
//     marginBottom: 32,
//   },
//   mpin: {
//     fontSize: 11,
//     color: "#6B7280",
//     marginTop: 4,
//     marginBottom: 2,
//   },
//   pinContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 24,
//   },
//   pinBox: {
//     width: 48,
//     height: 48,
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   pinText: {
//     fontSize: 20,
//     fontWeight: "600",
//   },
//   hiddenInput: {
//     opacity: 0,
//     position: "absolute",
//     width: 1,
//     height: 1,
//   },
//   button: {
//     backgroundColor: "#2563EB",
//     paddingVertical: 14,
//     borderRadius: 10,
//   },
//   btnText: {
//     color: "#fff",
//     textAlign: "center",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   disabled: {
//     backgroundColor: "#9CA3AF",
//   },
//   switchContainer: {
//     flexDirection: "row", // ✅ para maging horizontal
//     justifyContent: "center", // ✅ center horizontally
//     marginTop: 16,
//     alignItems: "center",
//   },
//   switchText: {
//     color: "#2563EB",
//     fontWeight: "600",
//     fontSize: 14,
//   },
// });

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Image
} from "react-native";
import { useDispatch } from "react-redux";
import { pinLogin } from "../api/auth";
import { loginSuccess, fetchProfile } from "../store/authSlice";
import * as SecureStore from "expo-secure-store";
import Header from "../components/Header";

export default function PinLoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState("");
  const inputRef = useRef(null);

  // Fetch stored credentials
  useEffect(() => {
    const fetchCredentials = async () => {
      const savedEmail = await SecureStore.getItemAsync("email");
      const hasPin = await SecureStore.getItemAsync("hasPin");

      console.log("📧 Retrieved email:", savedEmail);
      console.log("📌 Has PIN:", hasPin);

      if (!savedEmail) {
        Alert.alert("Error", "No saved email found. Please log in again.");
        navigation.replace("LoginScreen");
        return;
      }

      if (hasPin !== "true") {
        navigation.replace("SetPinScreen", { email: savedEmail });
        return;
      }

      setEmail(savedEmail);
      setMaskedEmail(maskEmail(savedEmail));
    };

    fetchCredentials();
  }, []);

  // Mask email like fa****@gmail.com
  const maskEmail = (email) => {
    if (!email) return "";
    const [local, domain] = email.split("@");
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    const visible = local.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
  };

  // Auto focus
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 600);
    return () => clearTimeout(timer);
  }, []);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.blur();
      setTimeout(() => inputRef.current.focus(), 50);
    }
  };

  // Handle PIN Login
  const handlePinLogin = async () => {
    if (!email) {
      Alert.alert("Error", "No email found. Please log in again.");
      navigation.replace("LoginScreen");
      return;
    }

    if (pin.length !== 6) {
      Alert.alert("Invalid PIN", "Please enter a 6-digit PIN.");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Attempting PIN login...");
      const response = await pinLogin(pin);
      console.log("✅ PIN Login Response:", response);

      if (response.token) {
        // ✅ FIX: Dispatch login to Redux immediately
        dispatch(loginSuccess({
          token: response.token,
          role: response.user?.role || response.role,
          profile: response.user || { 
            _id: response._id || response.user?._id,
            email: email 
          }
        }));

        console.log("✅ Login dispatched to Redux");

        // ✅ FIX: Fetch full profile to ensure we have all user data
        try {
          await dispatch(fetchProfile()).unwrap();
          console.log("✅ Profile fetched successfully");
        } catch (profileError) {
          console.warn("⚠️ Profile fetch failed, but continuing:", profileError);
          // Continue anyway since we have basic data
        }

        // Save token to SecureStore
        await SecureStore.setItemAsync("token", response.token);

        // Save role if available
        if (response.role || response.user?.role) {
          const userRole = response.user?.role || response.role;
          await SecureStore.setItemAsync("role", userRole);
        }

        // Navigate based on role
        const userRole = response.user?.role || response.role;
        console.log("🚀 Navigating based on role:", userRole);

        if (userRole === "superadmin") {
          navigation.replace("SuperadminDashboard");
        } else if (userRole === "admin") {
          navigation.replace("SuperadminDashboard");
        } else {
          navigation.replace("UserHome");
        }
      } else {
        Alert.alert("Error", "Incorrect PIN. Try again.");
        setPin("");
        focusInput();
      }
    } catch (error) {
      console.error("❌ PIN Login Error:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      
      // Better error message
      const errorMessage = error.response?.data?.msg || 
                          error.response?.data?.message || 
                          "Unable to log in with PIN. Please try again.";
      
      Alert.alert("Login Failed", errorMessage);
      setPin("");
      focusInput();
    } finally {
      setLoading(false);
    }
  };

  // Switch Account (with confirmation)
  const handleSwitchAccount = () => {
    Alert.alert(
      "Switch Account",
      "Are you sure you want to log out and switch account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear SecureStore
              await SecureStore.deleteItemAsync("email");
              await SecureStore.deleteItemAsync("hasPin");
              await SecureStore.deleteItemAsync("token");
              await SecureStore.deleteItemAsync("role");
              await SecureStore.deleteItemAsync("userId");
              
              console.log("🧹 Cleared all stored credentials");
              
              // Navigate to landing page
              navigation.replace("LandingPage");
            } catch (error) {
              console.error("❌ Error clearing credentials:", error);
              navigation.replace("LandingPage");
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={focusInput}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/tup.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Image
            source={require("../../assets/logo.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Enter your 6-digit MPIN to continue.</Text>

        {maskedEmail ? (
          <Text style={styles.emailText}>{maskedEmail}</Text>
        ) : null}

        <Text style={styles.mpin}>Enter your MPIN</Text>

        {/* PIN Boxes */}
        <View style={styles.pinContainer}>
          {Array(6)
            .fill("")
            .map((_, index) => (
              <TouchableOpacity key={index} onPress={focusInput}>
                <View style={styles.pinBox}>
                  <Text style={styles.pinText}>
                    {pin[index] ? "•" : ""}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>

        {/* Hidden TextInput */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          keyboardType="numeric"
          maxLength={6}
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          autoFocus
          blurOnSubmit={false}
        />

        {/* Unlock button */}
        <TouchableOpacity
          onPress={handlePinLogin}
          disabled={loading}
          style={[styles.button, loading && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* Switch account */}
        <TouchableOpacity onPress={handleSwitchAccount} style={styles.switchContainer}>
          <Text>Not You?</Text>
          <Text style={styles.switchText}> Switch Account</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 15,
  },
  logo: {
    width: 90,
    height: 60,
    marginBottom: 10,
  },
  emailText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    marginTop: 50,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "left",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 32,
  },
  mpin: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 2,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  pinBox: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pinText: {
    fontSize: 20,
    fontWeight: "600",
  },
  hiddenInput: {
    opacity: 0,
    position: "absolute",
    width: 1,
    height: 1,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  disabled: {
    backgroundColor: "#9CA3AF",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    alignItems: "center",
  },
  switchText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },
});