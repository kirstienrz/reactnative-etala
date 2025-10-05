// frontend/src/screens/NewsArchive.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

const NewsArchive = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Example: Simulate API loading
    setTimeout(() => {
      setNews([
        { id: 1, title: "Old Announcement 1", date: "Jan 5, 2024" },
        { id: 2, title: "Old Announcement 2", date: "Dec 20, 2023" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📜 News Archive</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <ScrollView>
          {news.map((item) => (
            <View key={item.id} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDate}>{item.date}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NewsArchive;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  newsCard: {
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  newsDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  backButton: {
    marginTop: 20,
    alignItems: "center",
  },
  backText: {
    color: "#007BFF",
    fontSize: 16,
  },
});
