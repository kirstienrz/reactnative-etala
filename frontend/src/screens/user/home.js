import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { getAnnouncements } from "../../api/announcement";

export default function HomeScreen({ navigation, setUser }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      Alert.alert("Error", "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

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

  const latestAnnouncement = announcements[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔔 Announcements Section */}
      <View style={styles.announcementBox}>
        <Text style={styles.announcementTitle}>📢 Announcements</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#8B5CF6" />
        ) : !latestAnnouncement ? (
          <Text style={styles.announcementText}>No announcements available.</Text>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{latestAnnouncement.title}</Text>
            <Text style={styles.cardMessage}>{latestAnnouncement.message}</Text>
            <Text style={styles.cardDate}>
              {new Date(latestAnnouncement.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* 👇 View Older Announcements Link */}
        {announcements.length > 1 && (
          <TouchableOpacity
            style={styles.viewOlderButton}
            onPress={() => navigation.navigate("NewsArchive")}
            activeOpacity={0.7}
          >
            <Text style={styles.viewOlderText}>View Older Announcements</Text>
            <Text style={styles.viewOlderArrow}>←</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🚪 Logout (optional) */}
      {/* <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#f8f9fa",
  },
  announcementBox: {
    backgroundColor: "#e9f5ff",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    width: "90%",
    marginBottom: 20,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  announcementText: { fontSize: 15, color: "#333" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  cardMessage: { fontSize: 14, color: "#555", marginBottom: 5 },
  cardDate: { fontSize: 12, color: "gray", textAlign: "right" },

  // ✅ small text version link
  viewOlderButton: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  viewOlderText: {
    fontSize: 13,
    color: "#8B5CF6",
    textDecorationLine: "underline",
  },
  viewOlderArrow: {
    fontSize: 13,
    color: "#8B5CF6",
    marginLeft: 3,
  },

  logoutBtn: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  logoutText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
