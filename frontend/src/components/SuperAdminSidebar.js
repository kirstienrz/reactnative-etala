// SuperAdminDrawer.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logoutUser } from "../api/auth";
import { deleteItem } from "../utils/storage";
import { 
  LogOut, User, Users, FileText, Repeat, MessageSquare, 
  BarChart3, Image, CalendarDays, BookOpen, Lightbulb, 
  Newspaper, FileSpreadsheet, FileSignature, Briefcase, DollarSign,
  ChevronDown, ChevronRight, Video
} from "lucide-react-native";
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

// Real Dashboard screen
import SuperAdminDashboard from "../screens/superadmin/dashboard";
import UserManagement from "../screens/superadmin/UserManagement";
import Profile from "../screens/superadmin/Profile";
import Reports from "../screens/superadmin/Reports";
import Carousel from "../screens/superadmin/Carousel";
import KnowledgeHub from "../screens/superadmin/KnowledgeHub";
import News from "../screens/superadmin/News";
import Projects from "../screens/superadmin/Projects";
import Budget from "../screens/superadmin/Budget";
import Infographics from "../screens/superadmin/Infographics";
import Events from "../screens/superadmin/Events";
import Suggestions from "../screens/superadmin/Suggestions";
import Exports from "../screens/superadmin/Exports";
import Templates from "../screens/superadmin/Templates";

// Knowledge Hub sub-screens
import SexDisaggregatedData from "../screens/superadmin/SexDisaggregatedData";
import Gallery from "../screens/superadmin/Gallery";
import Research from "../screens/superadmin/Research";
import Videos from "../screens/superadmin/Videos";

// Placeholder component for unimplemented screens
const PlaceholderScreen = ({ route }) => (
  <View style={styles.screen}>
    <Text style={{ fontSize: 20 }}>{route.name} (Coming Soon)</Text>
  </View>
);

const Drawer = createDrawerNavigator();

// Custom Drawer content
function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();
  const [expandedMenus, setExpandedMenus] = useState({
    knowledgeHub: false
  });
  
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await logoutUser();
              await deleteItem("token");
              await deleteItem("email");
              await deleteItem("role");
              props.navigation.replace("LoginScreen");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const currentRoute = props.state?.routes[props.state.index]?.name;

  return (
    <View style={[styles.drawerContainer, { paddingTop: insets.top }]}>
      {/* Header - Fixed */}
      <TouchableOpacity 
        style={styles.header}
        onPress={() => props.navigation.navigate("Dashboard")}
      >
        <Text style={styles.headerTitle}>SuperAdmin Panel</Text>
        <Text style={styles.headerSubtitle}>Management Dashboard</Text>
      </TouchableOpacity>

      {/* Scrollable Menu */}
      <DrawerContentScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* MAIN */}
        <DrawerSection title="MAIN">
          <DrawerItem 
            icon={<User size={18} color={currentRoute === "Profile" ? "#fff" : "#9CA3AF"} />}
            label="My Profile" 
            screen="Profile"
            navigation={props.navigation}
            isActive={currentRoute === "Profile"}
          />
          <DrawerItem 
            icon={<Users size={18} color={currentRoute === "UserManagement" ? "#fff" : "#9CA3AF"} />}
            label="User Management" 
            screen="UserManagement"
            navigation={props.navigation}
            isActive={currentRoute === "UserManagement"}
          />
        </DrawerSection>

        {/* REPORT HANDLING */}
        <DrawerSection title="REPORT HANDLING">
          <DrawerItem 
            icon={<FileText size={18} color={currentRoute === "Reports" ? "#fff" : "#9CA3AF"} />}
            label="Report Management" 
            screen="Reports"
            navigation={props.navigation}
            isActive={currentRoute === "Reports"}
          />
          <DrawerItem 
            icon={<Repeat size={18} color={currentRoute === "Referral" ? "#fff" : "#9CA3AF"} />}
            label="Referral & Assignment" 
            screen="Referral"
            navigation={props.navigation}
            isActive={currentRoute === "Referral"}
          />
          <DrawerItem 
            icon={<MessageSquare size={18} color={currentRoute === "Messages" ? "#fff" : "#9CA3AF"} />}
            label="Messaging System" 
            screen="Messages"
            navigation={props.navigation}
            isActive={currentRoute === "Messages"}
          />
        </DrawerSection>

        {/* CONTENT MANAGEMENT */}
        <DrawerSection title="CONTENT MANAGEMENT">
          <DrawerItem 
            icon={<Image size={18} color={currentRoute === "Carousel" ? "#fff" : "#9CA3AF"} />}
            label="Carousel" 
            screen="Carousel"
            navigation={props.navigation}
            isActive={currentRoute === "Carousel"}
          />
          
          {/* KNOWLEDGE HUB WITH SUBMENU */}
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={[styles.menuButton, currentRoute.includes("Knowledge") && styles.menuButtonActive]}
              onPress={() => toggleMenu('knowledgeHub')}
            >
              <View style={styles.menuButtonContent}>
                <BookOpen size={18} color={currentRoute.includes("Knowledge") ? "#fff" : "#9CA3AF"} />
                <Text style={[styles.menuButtonText, currentRoute.includes("Knowledge") && styles.menuButtonTextActive]}>
                  Knowledge Hub
                </Text>
              </View>
              {expandedMenus.knowledgeHub ? 
                <ChevronDown size={16} color="#9CA3AF" /> : 
                <ChevronRight size={16} color="#9CA3AF" />
              }
            </TouchableOpacity>

            {/* Submenu Items */}
            {expandedMenus.knowledgeHub && (
              <View style={styles.submenuContainer}>
                <DrawerItem 
                  icon={<BarChart3 size={16} color={currentRoute === "SexDisaggregated" ? "#fff" : "#9CA3AF"} />}
                  label="Sex-Disaggregated Data"
                  screen="SexDisaggregated"
                  navigation={props.navigation}
                  isActive={currentRoute === "SexDisaggregated"}
                  indent={true}
                />
                <DrawerItem 
                  icon={<Image size={16} color={currentRoute === "Infographics" ? "#fff" : "#9CA3AF"} />}
                  label="Infographics & Posters"
                  screen="Infographics"
                  navigation={props.navigation}
                  isActive={currentRoute === "Infographics"}
                  indent={true}
                />
                <DrawerItem 
                  icon={<Image size={16} color={currentRoute === "Gallery" ? "#fff" : "#9CA3AF"} />}
                  label="Gallery"
                  screen="Gallery"
                  navigation={props.navigation}
                  isActive={currentRoute === "Gallery"}
                  indent={true}
                />
                <DrawerItem 
                  icon={<Video size={16} color={currentRoute === "Videos" ? "#fff" : "#9CA3AF"} />}
                  label="Videos"
                  screen="Videos"
                  navigation={props.navigation}
                  isActive={currentRoute === "Videos"}
                  indent={true}
                />
                <DrawerItem 
                  icon={<BookOpen size={16} color={currentRoute === "Research" ? "#fff" : "#9CA3AF"} />}
                  label="Research"
                  screen="Research"
                  navigation={props.navigation}
                  isActive={currentRoute === "Research"}
                  indent={true}
                />
              </View>
            )}
          </View>
          
          <DrawerItem 
            icon={<Newspaper size={18} color={currentRoute === "News" ? "#fff" : "#9CA3AF"} />}
            label="News & Announcements" 
            screen="News"
            navigation={props.navigation}
            isActive={currentRoute === "News"}
          />
          <DrawerItem 
            icon={<Briefcase size={18} color={currentRoute === "Projects" ? "#fff" : "#9CA3AF"} />}
            label="Projects" 
            screen="Projects"
            navigation={props.navigation}
            isActive={currentRoute === "Projects"}
          />
          <DrawerItem 
            icon={<DollarSign size={18} color={currentRoute === "Budget" ? "#fff" : "#9CA3AF"} />}
            label="Budget & Programs" 
            screen="Budget"
            navigation={props.navigation}
            isActive={currentRoute === "Budget"}
          />
        </DrawerSection>

        {/* ADMIN TOOLS */}
        <DrawerSection title="ADMIN TOOLS">
          <DrawerItem 
            icon={<CalendarDays size={18} color={currentRoute === "Events" ? "#fff" : "#9CA3AF"} />}
            label="Calendar" 
            screen="Events"
            navigation={props.navigation}
            isActive={currentRoute === "Events"}
          />
          <DrawerItem 
            icon={<Lightbulb size={18} color={currentRoute === "Suggestions" ? "#fff" : "#9CA3AF"} />}
            label="Suggestion Box" 
            screen="Suggestions"
            navigation={props.navigation}
            isActive={currentRoute === "Suggestions"}
          />
          <DrawerItem 
            icon={<FileSpreadsheet size={18} color={currentRoute === "Exports" ? "#fff" : "#9CA3AF"} />}
            label="Export Reports" 
            screen="Exports"
            navigation={props.navigation}
            isActive={currentRoute === "Exports"}
          />
          <DrawerItem 
            icon={<FileSignature size={18} color={currentRoute === "Templates" ? "#fff" : "#9CA3AF"} />}
            label="Templates" 
            screen="Templates"
            navigation={props.navigation}
            isActive={currentRoute === "Templates"}
          />
        </DrawerSection>
      </DrawerContentScrollView>

      {/* LOGOUT - Fixed at bottom */}
      <View style={[styles.logoutContainer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Reusable DrawerSection Component
const DrawerSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// Reusable DrawerItem Component
const DrawerItem = ({ icon, label, screen, navigation, isActive, indent = false }) => (
  <TouchableOpacity
    style={[
      styles.drawerItem, 
      isActive && styles.drawerItemActive,
      indent && styles.indentedItem
    ]}
    onPress={() => navigation.navigate(screen)}
  >
    {icon}
    <Text style={[styles.drawerLabel, isActive && styles.drawerLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function SuperAdminDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ 
        headerShown: true, 
        drawerType: "slide",
        drawerStyle: { backgroundColor: "#111827", width: 256 }
      }}
    >
        <Drawer.Screen name="Dashboard" component={SuperAdminDashboard} options={{ title: "Dashboard" }} />
        <Drawer.Screen name="Profile" component={Profile} options={{ title: "My Profile" }} />
        <Drawer.Screen name="UserManagement" component={UserManagement} options={{ title: "User Management" }} />
        <Drawer.Screen name="Reports" component={Reports} options={{ title: "Report Management" }} />
        <Drawer.Screen name="Referral" component={PlaceholderScreen} options={{ title: "Referral & Assignment" }} />
        <Drawer.Screen name="Messages" component={PlaceholderScreen} options={{ title: "Messaging System" }} />
        <Drawer.Screen name="Infographics" component={Infographics} options={{ title: "Infographics & Posters" }} />
        <Drawer.Screen name="Carousel" component={Carousel} options={{ title: "Carousel" }} />
        <Drawer.Screen name="Events" component={Events} options={{ title: "Calendar" }} />
        <Drawer.Screen name="KnowledgeHub" component={KnowledgeHub} options={{ title: "Knowledge Hub Main" }} />
        <Drawer.Screen name="SexDisaggregated" component={SexDisaggregatedData} options={{ title: "Sex-Disaggregated Data" }} />
        <Drawer.Screen name="Gallery" component={Gallery} options={{ title: "Gallery" }} />
        <Drawer.Screen name="Videos" component={Videos} options={{ title: "Videos" }} />
        <Drawer.Screen name="Research" component={Research} options={{ title: "Research" }} />
        <Drawer.Screen name="Suggestions" component={Suggestions} options={{ title: "Suggestion Box" }} />
        <Drawer.Screen name="News" component={News} options={{ title: "News & Announcements" }} />
        <Drawer.Screen name="Exports" component={Exports} options={{ title: "Export Reports" }} />
        <Drawer.Screen name="Templates" component={Templates} options={{ title: "Templates" }} />
        <Drawer.Screen name="Projects" component={Projects} options={{ title: "Projects" }} />
        <Drawer.Screen name="Budget" component={Budget} options={{ title: "Budget & Programs" }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    backgroundColor: "#1F2937",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 4,
    marginHorizontal: 8,
  },
  drawerItemActive: {
    backgroundColor: "#2563EB",
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: "400",
    color: "#E5E7EB",
    marginLeft: 14,
  },
  drawerLabelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  indentedItem: {
    marginLeft: 24,
    paddingHorizontal: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#374151",
  },
  menuContainer: {
    marginBottom: 4,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 4,
    marginHorizontal: 8,
  },
  menuButtonActive: {
    backgroundColor: "#2563EB",
  },
  menuButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuButtonText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#E5E7EB",
    marginLeft: 14,
  },
  menuButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  submenuContainer: {
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: "#374151",
    paddingLeft: 8,
    marginBottom: 8,
  },
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#0F172A",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#EF4444",
    marginLeft: 14,
  },
  screen: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#fff",
  },
});