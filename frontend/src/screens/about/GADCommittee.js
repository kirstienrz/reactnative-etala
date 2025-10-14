import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function GADCommittee() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header 
        title="GAD Committee" 
        subtitle="GENDER AND DEVELOPMENT OFFICE" 
      />

      <View style={styles.contentWrapper}>
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            The Gender and Development (GAD) Committee ensures the effective
            integration of gender perspectives in all policies, programs,
            projects, and activities of the university.
          </Text>
        </View>

        {/* Chairperson Section */}
        <View style={styles.levelSection}>
          <Text style={styles.levelTitle}>CHAIRPERSON</Text>
          <View style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>👩‍💼</Text>
              </View>
              <View style={styles.positionInfo}>
                <Text style={styles.positionTitle}>Ana Lopez</Text>
                <Text style={styles.positionSubtitle}>
                  Leads GAD Committee operations, oversight, and policy implementation.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vice Chairperson */}
        <View style={styles.levelSection}>
          <Text style={styles.levelTitle}>VICE CHAIRPERSON</Text>
          <View style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>👩‍💻</Text>
              </View>
              <View style={styles.positionInfo}>
                <Text style={styles.positionTitle}>Josefina Ramos</Text>
                <Text style={styles.positionSubtitle}>
                  Assists the Chairperson and oversees specific GAD initiatives.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Secretariat */}
        <View style={styles.levelSection}>
          <Text style={styles.levelTitle}>SECRETARIAT</Text>
          <View style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📋</Text>
              </View>
              <View style={styles.positionInfo}>
                <Text style={styles.positionTitle}>Liza Dizon</Text>
                <Text style={styles.positionSubtitle}>
                  Manages GAD records, documentation, and meeting coordination.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📁</Text>
              </View>
              <View style={styles.positionInfo}>
                <Text style={styles.positionTitle}>Mark Rivera</Text>
                <Text style={styles.positionSubtitle}>
                  Prepares reports, correspondence, and assists in monitoring GAD projects.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Members */}
        <View style={styles.levelSection}>
          <Text style={styles.levelTitle}>COMMITTEE MEMBERS</Text>

          <View style={styles.memberCard}>
            <Text style={styles.memberIcon}>👩‍🏫</Text>
            <Text style={styles.memberText}>Ella Garcia – Training & Advocacy</Text>
          </View>

          <View style={styles.memberCard}>
            <Text style={styles.memberIcon}>👨‍🔬</Text>
            <Text style={styles.memberText}>Carlos Mendoza – Research & Policy Support</Text>
          </View>

          <View style={styles.memberCard}>
            <Text style={styles.memberIcon}>👩‍🎓</Text>
            <Text style={styles.memberText}>Maria Santos – Student Representation</Text>
          </View>

          <View style={styles.memberCard}>
            <Text style={styles.memberIcon}>👨‍💼</Text>
            <Text style={styles.memberText}>Juan Dela Cruz – Administrative Liaison</Text>
          </View>
        </View>

        {/* Special Committees */}
        <View style={styles.committeeSection}>
          <Text style={styles.sectionTitle}>SPECIAL COMMITTEES</Text>
          <View style={styles.committeeList}>
            <View style={styles.committeeItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.committeeText}>Committee on Decorum and Investigation (CODI)</Text>
            </View>
            <View style={styles.committeeItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.committeeText}>Gender Mainstreaming and Policy Review Group</Text>
            </View>
            <View style={styles.committeeItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.committeeText}>GAD Focal Points for Colleges/Departments</Text>
            </View>
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
  introCard: {
    backgroundColor: "#EDE9FE",
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#5B21B6",
    textAlign: "center",
    fontWeight: "500",
  },
  levelSection: {
    marginBottom: 30,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5B21B6",
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: "center",
  },
  positionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  positionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    width: 50,
    height: 50,
    backgroundColor: "#F5F3FF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  badgeText: {
    fontSize: 24,
  },
  positionInfo: {
    flex: 1,
  },
  positionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#5B21B6",
    marginBottom: 4,
  },
  positionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  memberCard: {
    backgroundColor: "#F5F3FF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  memberIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  memberText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  committeeSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5B21B6",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 20,
  },
  committeeList: {
    paddingLeft: 10,
  },
  committeeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 20,
    color: "#7C3AED",
    marginRight: 12,
    lineHeight: 20,
  },
  committeeText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});
