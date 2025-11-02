import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  User,
  LogOut,
  Award,
  Grid,
  FileText,
  File,
  User2,
  Home as HomeIcon,
  QrCode,
  Calendar,
  BookOpen,
  Brain,
  Lightbulb,
  BarChart3,
  Info,
  Shield,
  FileBarChart,
  ClipboardList,
  Layers,
  Users,
  X,
  FilePlus,
  History,
} from "lucide-react-native";
import * as SecureStore from "expo-secure-store";

export default function Home({ navigation }) {
  const [activeTab, setActiveTab] = useState("Home");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [reportModalVisible, setReportModalVisible] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const email = await SecureStore.getItemAsync("email");
      if (email) {
        const name = email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const serviceCategories = [
    {
      id: 1,
      title: "About GAD",
      icon: Info,
      color: "#8B5CF6",
    },
    {
      id: 2,
      title: "Policies",
      icon: Shield,
      color: "#059669",
    },
    {
      id: 3,
      title: "Plan and Budget",
      icon: BarChart3,
      color: "#DC2626",
    },
    {
      id: 4,
      title: "Accomplishment Report",
      icon: ClipboardList,
      color: "#2563EB",
    },
    {
      id: 5,
      title: "GAD Projects",
      icon: Layers,
      color: "#EA580C",
    },
    {
      id: 6,
      title: "Committee Report",
      icon: Users,
      color: "#7C3AED",
    },
  ];

  const carouselImages = [
    { id: 1, source: require("../../../assets/carousel/CAROUSEL1.jpg") },
    { id: 2, source: require("../../../assets/carousel/CAROUSEL.png") },
    { id: 3, source: require("../../../assets/carousel/CAROUSEL2.jpg") },
  ];

  const [currentCarousel, setCurrentCarousel] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarousel((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const resourcesData = [
    {
      id: 1,
      title: "Calendar",
      subtitle: "Look upcoming events",
      icon: Calendar,
      bgColor: "#EEF2FF",
      iconColor: "#4338CA",
    },
    {
      id: 2,
      title: "Handbook",
      subtitle: "Access guidelines",
      icon: BookOpen,
      bgColor: "#ECFDF5",
      iconColor: "#059669",
    },
    {
      id: 3,
      title: "Knowledge Hub",
      subtitle: "Learn and explore",
      icon: Brain,
      bgColor: "#FEF3C7",
      iconColor: "#D97706",
    },
    {
      id: 4,
      title: "Suggestion Box",
      subtitle: "Share your ideas",
      icon: Lightbulb,
      bgColor: "#FCE7F3",
      iconColor: "#DB2777",
    },
    {
      id: 5,
      title: "Infographics",
      subtitle: "Visual information",
      icon: BarChart3,
      bgColor: "#DBEAFE",
      iconColor: "#2563EB",
    },
  ];

  const handleServicePress = (service) => {
    switch (service.title) {
      case "About":
        navigation.navigate("AboutPage");
        break;
      case "Policies":
        navigation.navigate("PoliciesPage");
        break;
      case "Plan and Budget":
        navigation.navigate("PlanBudgetPage");
        break;
      case "Accomplishment Report":
        navigation.navigate("AccomplishmentPage");
        break;
      case "GAD Projects":
        navigation.navigate("GADProjectsPage");
        break;
      case "Committee Report":
        navigation.navigate("CommitteeReportPage");
        break;
      default:
        console.log(`No page found for ${service.title}`);
    }
  };

  const handleResourcePress = (resource) => {
    switch (resource.title) {
      case "Calendar":
        navigation.navigate("CalendarScreen");
        break;
      case "Handbook":
        navigation.navigate("Handbook");
        break;
      case "Knowledge Hub":
        navigation.navigate("KnowledgeHub");
        break;
      case "Suggestion Box":
        navigation.navigate("SuggestionBox");
        break;
      case "Infographics":
        navigation.navigate("InfographicsScreen");
        break;
      default:
        console.log(`No page found for ${resource.title}`);
    }
  };

  const handleTabPress = (tab) => {
    if (tab === "Report") {
      setReportModalVisible(true);
      return;
    }

    setActiveTab(tab);

    switch (tab) {
      case "Home":
        navigation.navigate("UserHome");
        break;
      case "News":
        navigation.navigate("NewsScreen");
        break;
      case "Scan QR":
        navigation.navigate("ScanQRScreen");
        break;
      case "Account":
        navigation.navigate("AccountScreen");
        break;
      default:
        console.log("Unknown tab:", tab);
    }
  };

  const handleReportOption = (option) => {
    setReportModalVisible(false);
    if (option === "new") {
      navigation.navigate("ReportScreen");
    } else if (option === "history") {
      navigation.navigate("ReportHistoryScreen");
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("email");
      await SecureStore.deleteItemAsync("hasPin");
      await SecureStore.deleteItemAsync("userId");
      navigation.replace("LandingPage");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/logo.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>GAD Portal</Text>
            <Text style={styles.headerSubtitle}>Dashboard</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
            <Bell size={22} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <View style={styles.avatarContainer}>
              <User size={32} color="#4338CA" />
            </View>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{userName || "User"}</Text>
              <Text style={styles.welcomeSubtext}>Have a productive day!</Text>
            </View>
          </View>
          <View style={styles.welcomeIllustration}>
            <Award size={60} color="#4338CA" style={{ opacity: 0.15 }} />
          </View>
        </View>

        {/* Announcement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Announcement</Text>
          <View style={styles.announcementCard}>
            <Text style={styles.announcementText}>
              Welcome to the new GAD Portal! Check out the latest updates and resources.
            </Text>
            <TouchableOpacity style={styles.viewOlderButton}>
              <Text style={styles.viewOlderText}>View older announcements</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesGrid}>
            {serviceCategories.map((service) => {
              const IconComponent = service.icon;
              return (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCircleButton}
                  onPress={() => handleServicePress(service)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.serviceIconCircle, { backgroundColor: service.color }]}>
                    <IconComponent size={28} color="#FFFFFF" />
                  </View>
                  <Text style={styles.serviceTitleCircle}>{service.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Featured Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <View style={styles.carouselContainer}>
            <Image
              source={carouselImages[currentCarousel].source}
              style={styles.carouselImage}
              resizeMode="cover"
            />
            <View style={styles.carouselDots}>
              {carouselImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentCarousel === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {resourcesData.map((resource) => {
              const IconComponent = resource.icon;
              return (
                <TouchableOpacity
                  key={resource.id}
                  style={styles.resourceCard}
                  onPress={() => handleResourcePress(resource)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.resourceHeader, { backgroundColor: resource.bgColor }]}>
                    <Image
                      source={resource.illustration}
                      style={styles.resourceIllustration}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.resourceContent}>
                    <View style={[styles.resourceIconCircle, { backgroundColor: resource.bgColor }]}>
                      <IconComponent size={20} color={resource.iconColor} />
                    </View>
                    <View style={styles.resourceTextContainer}>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                      <Text style={styles.resourceSubtitle}>{resource.subtitle}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* News and Articles */}
        <View style={styles.section}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>News and Articles</Text>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => console.log("See all news")}>
              <Text style={{ color: "#4338CA", fontWeight: "600", fontSize: 13 }}>See All</Text>
              <Text style={{ color: "#4338CA", fontWeight: "600", fontSize: 13, marginLeft: 4 }}>→</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {[1, 2, 3, 4].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.newsCardHorizontal}
                onPress={() => console.log(`Opening news ${item}`)}
                activeOpacity={0.8}
              >
                <Image
                  source={require("../../../assets/news/news1.jpg")}
                  style={styles.newsImage}
                  resizeMode="cover"
                />
                <View style={styles.newsContent}>
                  <Text style={styles.newsDate}>Oct 14, 2025</Text>
                  <Text style={styles.newsTitle} numberOfLines={2}>Dummy News Title {item}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setReportModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Options</Text>
              <TouchableOpacity
                onPress={() => setReportModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleReportOption("new")}
                activeOpacity={0.7}
              >
                <View style={[styles.modalIconCircle, { backgroundColor: "#EEF2FF" }]}>
                  <FilePlus size={24} color="#4338CA" />
                </View>
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>Create New Report</Text>
                  <Text style={styles.modalOptionSubtitle}>Submit a new incident report</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.modalDivider} />

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleReportOption("history")}
                activeOpacity={0.7}
              >
                <View style={[styles.modalIconCircle, { backgroundColor: "#FEF3C7" }]}>
                  <History size={24} color="#D97706" />
                </View>
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>Report History</Text>
                  <Text style={styles.modalOptionSubtitle}>View your previous reports</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("Home")}
        >
          <HomeIcon
            size={22}
            color={activeTab === "Home" ? "#4338CA" : "#6B7280"}
          />
          <Text
            style={[styles.navLabel, activeTab === "Home" && styles.activeNavLabel]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("News")}
        >
          <FileText
            size={22}
            color={activeTab === "News" ? "#4338CA" : "#6B7280"}
          />
          <Text
            style={[styles.navLabel, activeTab === "News" && styles.activeNavLabel]}
          >
            News
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItemCenter}
          onPress={() => handleTabPress("Report")}
        >
          <View style={styles.centerButton}>
            <FileText size={28} color="#FFFFFF" />
          </View>
          <Text
            style={[styles.navLabel, activeTab === "Report" && styles.activeNavLabel]}
          >
            Report
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("Scan QR")}
        >
          <QrCode
            size={22}
            color={activeTab === "Scan QR" ? "#4338CA" : "#6B7280"}
          />
          <Text
            style={[styles.navLabel, activeTab === "Scan QR" && styles.activeNavLabel]}
          >
            Scan QR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("Account")}
        >
          <User2
            size={22}
            color={activeTab === "Account" ? "#4338CA" : "#6B7280"}
          />
          <Text
            style={[styles.navLabel, activeTab === "Account" && styles.activeNavLabel]}
          >
            Account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTextContainer: {
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  welcomeSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  welcomeIllustration: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 14,
  },
  announcementCard: {
    backgroundColor: "#EEF2FF",
    padding: 16,
    borderRadius: 12,
  },
  announcementText: {
    color: "#1F2937",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  viewOlderButton: {
    alignSelf: "flex-start",
  },
  viewOlderText: {
    color: "#4338CA",
    fontSize: 13,
    fontWeight: "600",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  serviceCircleButton: {
    width: "31%",
    alignItems: "center",
    marginBottom: 20,
  },
  serviceIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceTitleCircle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  carouselContainer: {
    borderRadius: 16,
    overflow: "hidden",
    height: 200,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  carouselDots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
    width: 24,
  },
  resourceCard: {
    width: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  resourceHeader: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  resourceIllustration: {
    width: "100%",
    height: "100%",
  },
  resourceContent: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  resourceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  resourceTextContainer: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  resourceSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 14,
  },
  newsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsCardHorizontal: {
    width: 300,
    height: 250,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  newsImage: {
    width: "100%",
    height: 200,
  },
  newsContent: {
    padding: 10,
  },
  newsDate: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 16,
  },
  newsText: {
    color: "#6B7280",
    fontSize: 13,
  },
  logoutButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  spacer: {
    height: 20,
  },
  bottomNav: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingVertical: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  navItemCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
  },
  centerButton: {
    backgroundColor: "#4338CA",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    shadowColor: "#4338CA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  navLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeNavLabel: {
    color: "#4338CA",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  modalOptionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
});