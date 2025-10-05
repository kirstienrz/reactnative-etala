import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        {/* Left Section - About */}
        {/* <View style={styles.footerSection}>
          <Text style={styles.sectionTitle}>About GAD</Text>
          <Text style={styles.aboutText}>
            Promoting gender equality and{"\n"}
            empowerment through education{"\n"}
            and advocacy at TUP Taguig.
          </Text>
        </View> */}

        {/* Middle Section - Quick Links */}
        {/* <View style={styles.footerSection}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Programs & Services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Resources</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Contact Us</Text>
          </TouchableOpacity>
        </View> */}

        {/* Right Section - Contact Info */}
        <View style={styles.footerSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.contactRow}>
            <Text style={styles.icon}>📍</Text>
            <Text style={styles.contactInfo}>
              KM14 East Service Road, Western Bicutan, Taguig City, 1208
            </Text>
          </View>

          <View style={styles.contactRow}>
            <Text style={styles.icon}>📞</Text>
            <Text style={styles.contactInfo}>+63 993 898 7748</Text>
          </View>

          <View style={styles.contactRow}>
            <Text style={styles.icon}>✉️</Text>
            <Text style={styles.contactInfo}>tupt.gad@tup.edu.ph</Text>
          </View>

          <View style={styles.contactRow}>
            <Text style={styles.icon}>🌐</Text>
            <Text style={styles.contactInfo}>www.tupt.edu.ph</Text>
          </View>
        </View>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.copyright}>
          © 2025 Technological University of the Philippines - Taguig | All Rights Reserved
        </Text>
        <Text style={styles.developer}>Developed and Maintained by UITC</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: "#6B21A8", // GAD Purple (darker shade)
    marginTop: 40,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexWrap: "wrap",
  },
  footerSection: {
    flex: 1,
    minWidth: 150,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  aboutText: {
    color: "#E9D5FF",
    fontSize: 11,
    lineHeight: 16,
  },
  linkItem: {
    marginBottom: 5,
  },
  linkText: {
    color: "#E9D5FF",
    fontSize: 11,
    textDecorationLine: "none",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  icon: {
    fontSize: 12,
    marginRight: 6,
    color: "#F3E8FF",
  },
  contactInfo: {
    color: "#E9D5FF",
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  bottomBar: {
    backgroundColor: "#581C87", // Darker purple
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#7C3AED",
  },
  copyright: {
    color: "#D8B4FE",
    fontSize: 10,
    textAlign: "center",
    marginBottom: 3,
  },
  developer: {
    color: "#C4B5FD",
    fontSize: 9,
    textAlign: "center",
  },
});