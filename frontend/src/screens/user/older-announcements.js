import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

export default function OlderAnnouncements({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Older Announcements</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.date}>Oct 10, 2025</Text>
          <Text style={styles.text}>The GAD Committee will hold an orientation for new members.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.date}>Sept 25, 2025</Text>
          <Text style={styles.text}>Gender Awareness Workshop successfully concluded last week!</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.date}>Sept 1, 2025</Text>
          <Text style={styles.text}>New handbook updates are now available in the Resources section.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  scroll: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
});
