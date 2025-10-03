import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function HrAdminDashboard({ setUser }) {
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("user"); // clear saved user object
    setUser(null); // update App.js state -> auto redirect
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
      <Text style={styles.text}>HrAdminDashboard</Text>

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


