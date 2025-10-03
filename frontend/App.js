import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from "expo-secure-store";

import LandingPage from "./src/screens/LandingPage";  // ✅ import LandingPage
import LoginScreen from "./src/screens/LoginScreen";
import UserHome from "./src/screens/user/home";
import SuperAdminDashboard from "./src/screens/superadmin/dashboard";
import OsaAdminDashboard from "./src/screens/admin/osa/dashboard";
import HrAdminDashboard from "./src/screens/admin/hr/dashboard";
import DeptHeadDashboard from "./src/screens/admin/depthead/dashboard";
import CommitteeReports from "./src/screens/CommitteeReports";
import GADBudget from "./src/screens/GADBudget";
import GADProjects from "./src/screens/GADProjects";
import GADReport from "./src/screens/GADReport";
import Resources from "./src/screens/Resources";
import FloatingChatbot from "./src/components/FloatingChatbot";


const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await SecureStore.getItemAsync("user");
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null; // Optional: splash screen here

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            {/* ✅ LandingPage is now the FIRST screen */}
            <Stack.Screen name="Landing" component={LandingPage} />
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} setUser={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="CommitteeReports" component={CommitteeReports} />
            <Stack.Screen name="GADBudget" component={GADBudget} />
            <Stack.Screen name="GADProjects" component={GADProjects} />
            <Stack.Screen name="GADReport" component={GADReport} />
            <Stack.Screen name="Resources" component={Resources} />


          </>
        ) : user.role === "superadmin" ? (
          <Stack.Screen name="SuperAdminDashboard">
            {(props) => <SuperAdminDashboard {...props} setUser={setUser} />}
          </Stack.Screen>
        ) : user.role === "admin" && user.department === "OSA" ? (
          <Stack.Screen name="OsaAdminDashboard">
            {(props) => <OsaAdminDashboard {...props} setUser={setUser} />}
          </Stack.Screen>
        ) : user.role === "admin" && user.department === "HR" ? (
          <Stack.Screen name="HrAdminDashboard">
            {(props) => <HrAdminDashboard {...props} setUser={setUser} />}
          </Stack.Screen>
        ) : user.role === "admin" && user.department === "Department Head" ? (
          <Stack.Screen name="DeptHeadDashboard">
            {(props) => <DeptHeadDashboard {...props} setUser={setUser} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="UserHome">
            {(props) => <UserHome {...props} setUser={setUser} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
      <FloatingChatbot /> 

    </NavigationContainer>
  );
}
