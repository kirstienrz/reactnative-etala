import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Footer from "../../components/Footer"; // adjust path based on your folder

export default function VisionMission() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Vision and Mission</Text>
      </View>

      {/* Vision Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vision</Text>
        <Text style={styles.sectionText}>
          A premier state university with recognized excellence in engineering,
          technology, and applied sciences, providing quality education for the
          advancement of the nation.
        </Text>
      </View>

      {/* Mission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mission</Text>
        <Text style={styles.sectionText}>
          The Technological University of the Philippines shall provide higher
          and advanced vocational, technical, industrial, technological, and
          professional education and training in industries and technology, and
          shall carry on scientific and technological research and community
          service.
        </Text>
      </View>

      {/* Add Footer */}
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
  },
  banner: {
    backgroundColor: "#EDE9FE", // Light purple banner
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  bannerText: {
    color: "#5B21B6",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    color: "#6D28D9",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "justify",
  },
});
