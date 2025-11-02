import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  ChevronRight,
  User,
  Mail,
  HelpCircle,
  Info,
  Phone,
  Settings,
  LogOut,
} from "lucide-react-native";

const AccountScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

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

  const handleNavigation = (page) => {
    switch (page) {
      case "Edit Profile":
        navigation.navigate("EditProfileScreen");
        break;
      case "Inbox":
        navigation.navigate("InboxScreen");
        break;
      case "FAQs":
        navigation.navigate("FAQScreen");
        break;
      case "About the App":
        navigation.navigate("AboutScreen");
        break;
      case "Contact Us":
        navigation.navigate("ContactScreen");
        break;
      case "Settings":
        navigation.navigate("SettingsScreen");
        break;
      case "Logout":
        handleLogout();
        break;
      default:
        console.log("No navigation found for:", page);
    }
  };

  const menuItems = [
    { label: "Inbox", icon: Mail },
    { label: "FAQs", icon: HelpCircle },
    { label: "About the App", icon: Info },
    { label: "Contact Us", icon: Phone },
    { label: "Settings", icon: Settings },
    { label: "Logout", icon: LogOut },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileIconContainer}>
            <User size={28} color="#FFF" strokeWidth={2} />
          </View>
          <View style={styles.profileContent}>
            <Text style={styles.profileLabel}>Your Profile</Text>
            <Text style={styles.profileDescription}>
              Update your personal information
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => handleNavigation("Edit Profile")}
          >
            <ChevronRight size={22} color="#4338CA" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Options</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isLastItem = index === menuItems.length - 1;
              const isLogout = item.label === "Logout";

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    !isLastItem && styles.menuItemBorder,
                    isLogout && styles.logoutItem,
                  ]}
                  onPress={() => handleNavigation(item.label)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <View
                      style={[styles.iconBox, isLogout && styles.logoutIconBox]}
                    >
                      <IconComponent
                        size={20}
                        color={isLogout ? "#DC2626" : "#4338CA"}
                        strokeWidth={2}
                      />
                    </View>
                    <Text
                      style={[styles.menuText, isLogout && styles.logoutText]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight
                    size={20}
                    color={isLogout ? "#DC2626" : "#9CA3AF"}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Footer Spacing */}
        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#4338CA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileContent: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  profileDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  profileButton: {
    padding: 8,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoutIconBox: {
    backgroundColor: "#FEE2E2",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  logoutText: {
    color: "#DC2626",
    fontWeight: "600",
  },
  logoutItem: {
    backgroundColor: "#FAFAFA",
  },
  footerSpacing: {
    height: 20,
  },
});

export default AccountScreen;
