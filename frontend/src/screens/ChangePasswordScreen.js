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
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import { changePassword } from "../api/auth";
import Header from "../components/Header";

export default function ChangePasswordScreen({ navigation }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const userId = await SecureStore.getItemAsync("userId");
      const response = await changePassword(userId, newPassword);

      Alert.alert("Success", response.message || "Password updated successfully!");
      navigation.replace("SetPinScreen");
    } catch (error) {
      console.error("Password Change Error:", error);
      Alert.alert("Error", "Unable to change password. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Change Password" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* 🔒 Info Section */}
        <View style={styles.iconContainer}>
          <ShieldCheck size={48} color="#4338CA" />
        </View>
        <Text style={styles.title}>Secure Your Account</Text>
        <Text style={styles.subtitle}>
          For your protection, please update your password. 
        </Text>

        {/* New Password */}
        <View style={styles.inputContainer}>
          <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}
          >
            {showNewPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={loading}
          style={[styles.saveBtn, loading && styles.disabledBtn]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  formContainer: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  iconContainer: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#1E1E1E", textAlign: "center" },
  subtitle: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
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
  saveBtn: {
    backgroundColor: "#4338CA",
    borderRadius: 10,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  disabledBtn: { backgroundColor: "#9CA3AF" },
});
