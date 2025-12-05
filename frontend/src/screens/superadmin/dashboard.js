import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { logoutUser } from "../../api/auth"; // ← ADD THIS

export default function SuperAdminDashboard({ setUser }) {
  const handleLogout = async () => {
    try {
      // Optional: Call backend logout
      await logoutUser();

      // Clear all saved data
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("role");
      await SecureStore.deleteItemAsync("email");
      await SecureStore.deleteItemAsync("user");

      // Redirect user back to login
      setUser(null);

    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert("Logout Failed", "Something went wrong while logging out.");
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: handleLogout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Super Admin Dashboard 🚀</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 22, marginBottom: 20 },
  logoutBtn: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  logoutText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
