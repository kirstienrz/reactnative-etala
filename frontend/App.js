import React from "react";
import { StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Redux
import { Provider } from "react-redux";
import store from "./src/store/store";// <-- adjust path if needed

// ProtectedRoute
import ProtectedRoute from "./src/components/ProtectedRoute";

// Screens
import LandingPage from "./src/screens/LandingPage";
import LoginScreen from "./src/screens/LoginScreen";
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";
import SetPinScreen from "./src/screens/SetPinScreen";
import PinLoginScreen from "./src/screens/PinLoginScreen";
import StartupScreen from "./src/screens/StartupScreen";
import UserHome from "./src/screens/user/home";
import OlderAnnouncements from "./src/screens/user/older-announcements";
import ConfirmPinScreen from "./src/screens/ConfirmPinScreen";
import AuthLoadingScreen from "./src/screens/AuthLoadingScreen";
import FloatingChatbot from "./src/components/FloatingChatbot";

// Services
import AboutPage from "./src/screens/services/about";
import PoliciesPage from "./src/screens/services/policies";
import PlanBudgetPage from "./src/screens/services/planbudget";
import AccomplishmentPage from "./src/screens/services/accomplishment-report";
import GADProjectsPage from "./src/screens/services/projects";
import CommitteeReportPage from "./src/screens/services/committee-report";

// Resources
import CalendarScreen from "./src/screens/resources/calendar";
import InfographicsScreen from "./src/screens/resources/infographics";
import Handbook from "./src/screens/resources/handbook";
import KnowledgeHub from "./src/screens/resources/knowledge-hub";
import SuggestionBox from "./src/screens/resources/suggestion-box";

// Bottom Navigation
import ReportHistoryScreen from "./src/screens/bottom-navigation/myreports";
import ReportDetailsScreen from "./src/screens/bottom-navigation/report-details";
import ReportScreen from "./src/screens/bottom-navigation/report";
import AccountScreen from "./src/screens/bottom-navigation/account";
import NewsScreen from "./src/screens/bottom-navigation/news";
import ScanQRScreen from "./src/screens/bottom-navigation/scan-qr";

// Account
import EditProfileScreen from "./src/screens/account/edit-profile";
import InboxScreen from "./src/screens/account/inbox";
import ChatDetailScreen from "./src/screens/account/chat-detail";
import FAQScreen from "./src/screens/account/faqs";
import AboutScreen from "./src/screens/account/about";
import ContactScreen from "./src/screens/account/contact-us";
import SettingsScreen from "./src/screens/account/settings";

// Dashboards
import SuperadminDashboard from "./src/screens/superadmin/dashboard";
import SuperAdminSidebar from "./src/components/SuperAdminSidebar";

import DeptHeadDashboard from "./src/screens/admin/depthead/dashboard";
import HRDashboard from "./src/screens/admin/hr/dashboard";
import OSADashboard from "./src/screens/admin/osa/dashboard";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <>
        <NavigationContainer>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: "#fff" }}
            edges={Platform.select({
              ios: ["top", "left", "right"],
              android: ["left", "right"],
            })}
          >
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <Stack.Navigator
              initialRouteName="StartupScreen"
              screenOptions={{
                headerTitleAlign: "center",
                headerTitleStyle: { fontSize: 14, fontWeight: "600" },
              }}
            >
              {/* Startup & Auth */}
              <Stack.Screen name="StartupScreen" component={StartupScreen} options={{ headerShown: false }} />
              <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SetPinScreen" component={SetPinScreen} options={{ headerShown: false }} />
              <Stack.Screen name="PinLoginScreen" component={PinLoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ConfirmPinScreen" component={ConfirmPinScreen} options={{ headerShown: false }} />
              <Stack.Screen name="AuthLoadingScreen" component={AuthLoadingScreen} options={{ headerShown: false }} />
              <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }} />

              {/* Protected User Screens */}
              <Stack.Screen name="UserHome" options={{ headerShown: false }}>
                {(props) => (
                  <ProtectedRoute {...props} allowedRoles={["user", "admin", "superadmin"]}>
                    <UserHome {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>
              <Stack.Screen name="OlderAnnouncements">
                {(props) => (
                  <ProtectedRoute {...props} allowedRoles={["user", "admin", "superadmin"]}>
                    <OlderAnnouncements {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>

              {/* Services */}
              <Stack.Screen name="AboutPage" component={AboutPage} options={{ title: "About" }} />
              <Stack.Screen name="PoliciesPage" component={PoliciesPage} options={{ title: "Policies" }} />
              <Stack.Screen name="PlanBudgetPage" component={PlanBudgetPage} options={{ title: "Plan and Budget" }} />
              <Stack.Screen name="AccomplishmentPage">
                {(props) => (
                  <ProtectedRoute {...props} allowedRoles={["admin"]}>
                    <AccomplishmentPage {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>
              <Stack.Screen name="GADProjectsPage" component={GADProjectsPage} options={{ title: "Projects" }} />
              <Stack.Screen name="CommitteeReportPage">
                {(props) => (
                  <ProtectedRoute {...props} allowedRoles={["admin"]}>
                    <CommitteeReportPage {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>

              {/* Resources */}
              <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{ title: "Calendar" }} />
              <Stack.Screen name="InfographicsScreen" component={InfographicsScreen} options={{ title: "Infographics" }} />
              <Stack.Screen name="Handbook" component={Handbook} options={{ title: "Handbook" }} />
              <Stack.Screen name="KnowledgeHub" component={KnowledgeHub} options={{ title: "Knowledge Hub" }} />
              <Stack.Screen name="SuggestionBox" component={SuggestionBox} options={{ title: "Suggestion Box" }} />

              {/* Bottom Navigation */}
              <Stack.Screen name="ReportHistoryScreen"options={{ headerShown: false }}>
                {(props) => (
                  <ProtectedRoute {...props} allowedRoles={["user", "admin", "superadmin"]}>
                    <ReportHistoryScreen {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>
              <Stack.Screen name="ReportDetails" options={{ headerShown: false }}>
                {(props) => (
                  <ProtectedRoute {...props} allowedRoles={["user", "admin", "superadmin"]}>
                    <ReportDetailsScreen {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>
              <Stack.Screen name="ReportScreen" options={{ headerShown: false }}>
                {(props) => (
                  <ProtectedRoute {...props} allowedRoles={["user", "admin", "superadmin"]}>
                    <ReportScreen {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>
              <Stack.Screen name="AccountScreen" component={AccountScreen} options={{ title: "Account" }} />
              <Stack.Screen name="NewsScreen" component={NewsScreen} options={{ title: "News" }} />
              <Stack.Screen name="ScanQRScreen" component={ScanQRScreen} options={{ title: "Scan QR" }} />

              {/* Account */}
              <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
              <Stack.Screen name="InboxScreen" component={InboxScreen} options={{ title: "Inbox" }} />
              <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: "Chat", headerBackTitle: "Back" }} />
              <Stack.Screen name="FAQScreen" component={FAQScreen} options={{ title: "FAQs" }} />
              <Stack.Screen name="AboutScreen" component={AboutScreen} options={{ title: "About the App" }} />
              <Stack.Screen name="ContactScreen" component={ContactScreen} options={{ title: "Contact Us" }} />
              <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: "Settings" }} />

              {/* Dashboards */}
<Stack.Screen name="SuperadminDashboard" options={{ headerShown: false }}>
  {(props) => (
    <ProtectedRoute 
      {...props} 
      allowedRoles={["superadmin"]} 
      setUser={props.setUser}   // <-- ADD THIS
    >
      <SuperAdminSidebar {...props} />
    </ProtectedRoute>
  )}
</Stack.Screen>
              <Stack.Screen name="DeptHeadDashboard">
                {(props) => (
                  <ProtectedRoute {...props} allowedRoles={["admin"]}>
                    <DeptHeadDashboard {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>

              <Stack.Screen name="HRDashboard">
                {(props) => (
                  <ProtectedRoute {...props} allowedRoles={["admin"]}>
                    <HRDashboard {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>

              <Stack.Screen name="OSADashboard">
                {(props) => (
                  <ProtectedRoute {...props} allowedRoles={["admin"]}>
                    <OSADashboard {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </SafeAreaView>
        </NavigationContainer>

        {/* Chatbot must also be within Redux Provider */}
        <FloatingChatbot />
      </>
    </Provider>
  );
}
