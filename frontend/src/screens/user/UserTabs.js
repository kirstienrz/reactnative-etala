// src/screens/user/UserTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./home";
import ReportsScreen from "./reports";
import InboxScreen from "./inbox";
import AccountScreen from "./account";

const Tab = createBottomTabNavigator();

export default function UserTabs({ setUser }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
          paddingBottom: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Reports":
              iconName = "document-text";
              break;
            case "Inbox":
              iconName = "chatbubbles";
              break;
            case "Account":
              iconName = "person-circle";
              break;
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* ✅ Pass setUser to Home and Account screens */}
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} setUser={setUser} />}
      </Tab.Screen>

      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />

      <Tab.Screen name="Account">
        {(props) => <AccountScreen {...props} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
