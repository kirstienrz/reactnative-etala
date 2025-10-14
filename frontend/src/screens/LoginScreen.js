import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { IdCard, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { loginUser } from "../api/auth";
import * as SecureStore from "expo-secure-store";
import Header from "../components/Header";

export default function LoginScreen({ navigation }) {
  const [tuptId, setTuptId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  if (!tuptId || !email || !password) {
    Alert.alert("Missing Fields", "Please fill in all fields.");
    return;
  }

  setLoading(true);

  try {
    const data = await loginUser(email, password, tuptId);

    if (data?.token) {
      // Save token & user data
      await SecureStore.setItemAsync("token", data.token);
      await SecureStore.setItemAsync("email", email);
      await SecureStore.setItemAsync("hasPin", "true");
      await SecureStore.setItemAsync("userId", data._id);

      // Navigate based on first login or PIN setup
      if (data.isFirstLogin) {
        navigation.replace("ChangePasswordScreen");
      } else if (!data.hasPin) {
        navigation.replace("SetPinScreen");
      } else {
        navigation.replace("PinLoginScreen");
      }
    } else {
      // Kung walang token pero may msg, ipakita ito
      Alert.alert(
        "Login Failed",
        data?.msg || "Invalid TUPT ID, email, or password. Please try again."
      );
    }
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);

    // Custom message kapag 400
    if (error.response?.status === 400) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.msg || "Invalid credentials. Please try again."
      );
    } else {
      Alert.alert(
        "Error",
        "Unable to connect to server. Please check your connection."
      );
    }
  } finally {
    setLoading(false);
  }
};


  const handleFocus = () => {
    // Kung walang laman, automatic lagay ng "TUPT-"
    if (tuptId.length === 0) {
      setTuptId("TUPT-");
    }
  };

  const formatTuptId = (text) => {
    // Palitan lahat ng lowercase to uppercase
    let formatted = text.toUpperCase();

    // Tanggalin lahat ng non-alphanumeric characters maliban sa dash
    formatted = formatted.replace(/[^A-Z0-9]/g, "");

    // Automatic dash insertion after TUPT-
    if (formatted.length > 4) {
      formatted = formatted.slice(0, 4) + "-" + formatted.slice(4);
    }
    if (formatted.length > 7) {
      formatted = formatted.slice(0, 7) + "-" + formatted.slice(7, 11);
    }

    // Limit length to TUPT-00-0000 (12 characters including dashes)
    return formatted.slice(0, 12);
  };


  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>Hello, Welcome!</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>

        {/* TUPT ID */}
        <View style={styles.inputContainer}>
          <IdCard size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="TUPT-00-0000"
            value={tuptId}
            onChangeText={(text) => setTuptId(formatTuptId(text))}
            onFocus={handleFocus} // <-- dito automatic "TUPT-" kapag walang laman
            style={styles.input}
            autoCapitalize="characters"
          />

        </View>


        {/* Email */}
        <View style={styles.inputContainer}>
          <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="your@etala.com"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[styles.loginBtn, loading && styles.disabledBtn]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  formContainer: { paddingHorizontal: 28, paddingVertical: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#1E1E1E", marginBottom: 4 },
  subtitle: { color: "#6B7280", marginBottom: 20, fontSize: 14 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 10, fontSize: 15, color: "#111827" },
  eyeIcon: { padding: 4 },
  forgotPassword: {
    textAlign: "right",
    color: "#4338CA",
    fontWeight: "500",
    marginBottom: 22,
    fontSize: 13,
  },
  loginBtn: {
    backgroundColor: "#4338CA",
    borderRadius: 10,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  loginText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  disabledBtn: { backgroundColor: "#9CA3AF" },
});
