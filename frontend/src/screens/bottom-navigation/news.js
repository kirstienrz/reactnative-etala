import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { getNews } from '../../api/news'; // adjust path

const NewsScreen = ({ navigation }) => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNews();
        const top5 = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setNewsList(top5);
      } catch (error) {
        console.log('Failed to fetch news:', error);
      }
    };

    fetchNews();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.title}>News</Text>

      {newsList.map(item => (
        <TouchableOpacity
          key={item._id}
          style={styles.newsCard}
          activeOpacity={0.8}
        >
          <Image
            source={item.imageUrl ? { uri: item.imageUrl } : require("../../../assets/news/news1.jpg")}
            style={styles.newsImage}
            resizeMode="cover"
          />
          <View style={styles.newsContent}>
            <Text style={styles.newsDate}>{item.date}</Text>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsText} numberOfLines={3}>{item.content}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  newsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsImage: {
    width: "100%",
    height: 200,
  },
  newsContent: {
    padding: 12,
  },
  newsDate: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  newsText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
});

export default NewsScreen;
