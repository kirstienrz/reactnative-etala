// src/screens/user/reports.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 My Reports</Text>
      <Text style={styles.subtitle}>You haven’t submitted any reports yet.</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>+ Create New Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { color: "gray", marginBottom: 20 },
  button: { backgroundColor: "#007bff", padding: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});


