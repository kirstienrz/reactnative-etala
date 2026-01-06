import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
  Dimensions,
} from "react-native";
import { getWebinars, getResources } from "../../api/knowledge";
import { getInfographics } from "../../api/infographics";
import { FileText, Calendar, BookOpen, Lightbulb } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

// Helper to extract YouTube video ID
const getYouTubeID = (url) => {
  if (!url) return null;
  const regex = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const KnowledgeHubPreview = () => {
  const navigation = useNavigation(); 
  const [webinars, setWebinars] = useState([]);
  const [resources, setResources] = useState([]);
  const [infographics, setInfographics] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const previewLimit = 3;

  // ================= QUICK ACCESS =================
  const quickAccess = [
    {
      id: 1,
      title: "Calendar",
      icon: Calendar,
      bgColor: "#E0E7FF",
      iconColor: "#4338CA",
      big: true,
      onPress: () => navigation?.navigate("CalendarScreen"),
    },
    {
      id: 2,
      title: "Handbook",
      icon: BookOpen,
      bgColor: "#D1FAE5",
      iconColor: "#059669",
      onPress: () => navigation?.navigate("Handbook"),
    },
    {
      id: 3,
      title: "Suggestion Box",
      icon: Lightbulb,
      bgColor: "#FFEDD5",
      iconColor: "#EA580C",
      onPress: () => navigation?.navigate("SuggestionBox"),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const w = await getWebinars();
        const r = await getResources();
        const i = await getInfographics();

        setWebinars(w.slice(0, previewLimit));
        setResources(r.slice(0, previewLimit));
        setInfographics(i.slice(0, previewLimit));
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const handleCarouselScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveSlide(index);
  };

  return (
    <ScrollView style={styles.container}>
      {/* ================= QUICK ACCESS ================= */}
      <View style={styles.quickSection}>
        <Text style={styles.quickHeader}>Resources</Text>

        {/* BIG TILE */}
        <TouchableOpacity
          style={[styles.bigTile, { backgroundColor: quickAccess[0].bgColor }]}
          activeOpacity={0.9}
          onPress={quickAccess[0].onPress}
        >
          <View style={styles.circlePatternLarge} />
          <View style={styles.diagonalPattern} />

          <Text style={styles.tileTitle}>{quickAccess[0].title}</Text>

          <View style={styles.iconBottomCenter}>
            <View style={styles.iconBase}>
              <Calendar size={46} color={quickAccess[0].iconColor} />
            </View>
          </View>
        </TouchableOpacity>

        {/* SMALL TILES */}
        <View style={styles.smallRow}>
          {quickAccess.slice(1).map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.smallTile, { backgroundColor: item.bgColor }]}
                activeOpacity={0.9}
                onPress={item.onPress}
              >
                <View style={styles.circlePatternSmall} />

                <Text style={styles.tileTitleSmall}>{item.title}</Text>

                <View style={styles.iconBottomCenter}>
                  <View style={styles.iconBaseSmall}>
                    <Icon size={38} color={item.iconColor} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ================= KNOWLEDGE HUB ================= */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Knowledge Hub</Text>
        <TouchableOpacity onPress={() => navigation?.navigate("KnowledgeHub")}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      </View>

      {/* ================= WEBINARS ================= */}
      <View style={styles.section}>
        <Text style={styles.subTitle}>Webinars</Text>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {webinars.map((item) => {
            const videoID = getYouTubeID(item.videoUrl);
            const thumbnail =
              item.thumbnailUrl ||
              (videoID
                ? `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`
                : null);

            return (
              <View key={item._id} style={styles.webinarCard}>
                {thumbnail ? (
                  <Image
                    source={{ uri: thumbnail }}
                    style={styles.webinarThumbnail}
                  />
                ) : (
                  <View style={styles.thumbnailPlaceholder}>
                    <Text style={{ color: "#6B7280" }}>No Video</Text>
                  </View>
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= LEARNING RESOURCES ================= */}
      <View style={styles.section}>
        <Text style={styles.subTitle}>Learning Resources</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {resources.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.resourceCard}
              onPress={() => Linking.openURL(item.url)}
              activeOpacity={0.8}
            >
              {item.thumbnailUrl ? (
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  style={styles.resourceThumbnail}
                />
              ) : (
                <View style={styles.resourcePlaceholder}>
                  <FileText size={40} color="#fff" />
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ================= INFOGRAPHICS ================= */}
      {infographics.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Infographics</Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate("InfographicsScreen")}
            >
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleCarouselScroll}
            scrollEventThrottle={16}
          >
            {infographics.map((item) => (
              <View key={item._id || item.id} style={styles.carouselSlide}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.carouselImage}
                />
                <View style={styles.carouselOverlay}>
                  <Text style={styles.carouselTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.dots}>
            {infographics.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeSlide === index && styles.activeDot]}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  /* Quick access */
  quickSection: {
    padding: 16,
  },
  quickHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  bigTile: {
    height: 130,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },

  smallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  smallTile: {
    width: "48%",
    height: 110,
    borderRadius: 22,
    padding: 14,
    overflow: "hidden",
  },

  tileTitle: {
    fontSize: 16,
    fontWeight: "700",
    zIndex: 2,
  },
  tileTitleSmall: {
    fontSize: 14,
    fontWeight: "700",
    zIndex: 2,
  },

  /* Icon positioning */
  iconBottomCenter: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3,
  },

  iconBase: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  iconBaseSmall: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Patterns */
  circlePatternLarge: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.25)",
    top: -60,
    right: -60,
  },
  circlePatternSmall: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.25)",
    top: -50,
    right: -50,
  },
  diagonalPattern: {
    position: "absolute",
    width: 220,
    height: 90,
    backgroundColor: "rgba(255,255,255,0.18)",
    bottom: -30,
    left: -50,
    transform: [{ rotate: "-12deg" }],
  },

  /* Knowledge hub header */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { color: "#4338CA", fontWeight: "600" },

  section: { marginBottom: 24 },
  subTitle: { fontSize: 16, fontWeight: "700", paddingHorizontal: 16, marginBottom: 8 },

  /* Webinar cards full width */
  webinarCard: {
    width: width - 32,
    height: 240,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginLeft: 16,
    overflow: "hidden",
    elevation: 2,
  },
  webinarThumbnail: { width: "100%", height: 200 },

  /* Resources cards wider */
  resourceCard: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginLeft: 16,
    overflow: "hidden",
    elevation: 2,
  },
  resourceThumbnail: { width: "100%", height: 120 },

  thumbnailPlaceholder: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  resourcePlaceholder: {
    height: 120,
    backgroundColor: "#4338CA",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { padding: 8 },
  cardTitle: { fontSize: 14, fontWeight: "600" },

  /* Infographics */
  carouselSlide: { width, paddingHorizontal: 16 },
  carouselImage: { width: "100%", height: 200, borderRadius: 12 },
  carouselOverlay: {
    position: "absolute",
    bottom: 12,
    left: 28,
    right: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 8,
  },
  carouselTitle: { color: "#fff", fontWeight: "600", fontSize: 14 },
  dots: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D1D5DB", marginHorizontal: 4 },
  activeDot: { backgroundColor: "#111827" },
});

export default KnowledgeHubPreview;
