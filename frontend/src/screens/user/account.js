
// src/screens/user/home.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function AccoutScreen({ setUser }) {
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  };

  const confirmLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: handleLogout },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Account</Text>
      <Text style={styles.subtitle}>User Information</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { color: "gray", marginBottom: 30 },
  logoutBtn: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  logoutText: { color: "white", fontSize: 16, fontWeight: "bold" },
});


