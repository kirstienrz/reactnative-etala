
// =====================================================
// Footer.js - Create this as a separate component file
// =====================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <Text style={styles.footerTitle}>Gender and Development Office</Text>
        <Text style={styles.footerText}>Technological University of the Philippines</Text>
        <Text style={styles.footerText}>Email: gad@tup.edu.ph | Tel: (02) 8301-3001</Text>
        <Text style={styles.footerCopyright}>© 2025 TUP GAD Office. All Rights Reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#1F2937",
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerContent: {
    alignItems: "center",
  },
  footerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  footerText: {
    color: "#D1D5DB",
    fontSize: 13,
    marginBottom: 4,
    textAlign: "center",
  },
  footerCopyright: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
  },
});