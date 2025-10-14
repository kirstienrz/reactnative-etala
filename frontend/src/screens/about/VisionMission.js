// VisionMission.js
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Header from "../../components/Header"; // adjust path as needed
import Footer from "../../components/Footer"; // adjust path as needed

export default function VisionMission() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Vision and Mission" subtitle="GENDER AND DEVELOPMENT OFFICE" />

      {/* Main Content */}
      <View style={styles.contentWrapper}>
        {/* Vision Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>👁️</Text>
            </View>
            <Text style={styles.cardTitle}>VISION</Text>
          </View>
          <View style={styles.cardDivider} />
          <Text style={styles.cardText}>
            A premier state university with recognized excellence in engineering,
            technology, and applied sciences, providing quality education for the
            advancement of the nation.
          </Text>
        </View>

        {/* Mission Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>🎯</Text>
            </View>
            <Text style={styles.cardTitle}>MISSION</Text>
          </View>
          <View style={styles.cardDivider} />
          <Text style={styles.cardText}>
            The Technological University of the Philippines shall provide higher
            and advanced vocational, technical, industrial, technological, and
            professional education and training in industries and technology, and
            shall carry on scientific and technological research and community
            service.
          </Text>
        </View>

        {/* GAD Core Principles */}
        <View style={styles.principlesSection}>
          <Text style={styles.principlesTitle}>GAD CORE PRINCIPLES</Text>
          
          <View style={styles.principleCard}>
            <Text style={styles.principleTitle}>Gender Equality</Text>
            <Text style={styles.principleText}>
              Promoting equal rights and opportunities for all genders
            </Text>
          </View>

          <View style={styles.principleCard}>
            <Text style={styles.principleTitle}>Empowerment</Text>
            <Text style={styles.principleText}>
              Building capacity and self-determination for all individuals
            </Text>
          </View>

          <View style={styles.principleCard}>
            <Text style={styles.principleTitle}>Inclusivity</Text>
            <Text style={styles.principleText}>
              Creating safe and welcoming spaces for diverse identities
            </Text>
          </View>

          <View style={styles.principleCard}>
            <Text style={styles.principleTitle}>Respect</Text>
            <Text style={styles.principleText}>
              Upholding dignity and human rights in all interactions
            </Text>
          </View>
        </View>
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#F5F3FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5B21B6",
    letterSpacing: 1.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 14,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
    textAlign: "justify",
  },
  principlesSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  principlesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5B21B6",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 20,
  },
  principleCard: {
    backgroundColor: "#F5F3FF",
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
  },
  principleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5B21B6",
    marginBottom: 6,
  },
  principleText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
});

// =====================================================
// Header.js - Create this as a separate component file
// =====================================================
/*
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Header({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerSubtitle}>{subtitle}</Text>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#6D28D9",
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSubtitle: {
    color: "#DDD6FE",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  headerDivider: {
    width: 60,
    height: 3,
    backgroundColor: "#C4B5FD",
    marginTop: 12,
  },
});
*/

// =====================================================
// Footer.js - Create this as a separate component file
// =====================================================
/*
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
*/