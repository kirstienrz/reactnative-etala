// import React, { useState, useEffect } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import * as SecureStore from "expo-secure-store";

// import LandingPage from "./src/screens/LandingPage";  // ✅ import LandingPage
// import LoginScreen from "./src/screens/LoginScreen";
// import UserHome from "./src/screens/user/home";
// import SuperAdminDashboard from "./src/screens/superadmin/dashboard";
// import OsaAdminDashboard from "./src/screens/admin/osa/dashboard";
// import HrAdminDashboard from "./src/screens/admin/hr/dashboard";
// import DeptHeadDashboard from "./src/screens/admin/depthead/dashboard";
// import CommitteeReports from "./src/screens/CommitteeReports";
// import GADBudget from "./src/screens/GADBudget";
// import GADProjects from "./src/screens/GADProjects";
// import GADReport from "./src/screens/GADReport";
// import Resources from "./src/screens/Resources";
// import FloatingChatbot from "./src/components/FloatingChatbot";
// import UserTabs from "./src/screens/user/UserTabs"; // add this at top


// const Stack = createStackNavigator();

// export default function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkUser = async () => {
//       const storedUser = await SecureStore.getItemAsync("user");
//       if (storedUser) setUser(JSON.parse(storedUser));
//       setLoading(false);
//     };
//     checkUser();
//   }, []);

//   if (loading) return null; // Optional: splash screen here

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {!user ? (
//           <>
//             {/* ✅ LandingPage is now the FIRST screen */}
//             <Stack.Screen name="Landing" component={LandingPage} />
//             <Stack.Screen name="Login">
//               {(props) => <LoginScreen {...props} setUser={setUser} />}
//             </Stack.Screen>
//             <Stack.Screen name="CommitteeReports" component={CommitteeReports} />
//             <Stack.Screen name="GADBudget" component={GADBudget} />
//             <Stack.Screen name="GADProjects" component={GADProjects} />
//             <Stack.Screen name="GADReport" component={GADReport} />
//             <Stack.Screen name="Resources" component={Resources} />


//           </>
//         ) : user.role === "superadmin" ? (
//           <Stack.Screen name="SuperAdminDashboard">
//             {(props) => <SuperAdminDashboard {...props} setUser={setUser} />}
//           </Stack.Screen>
//         ) : user.role === "admin" && user.department === "OSA" ? (
//           <Stack.Screen name="OsaAdminDashboard">
//             {(props) => <OsaAdminDashboard {...props} setUser={setUser} />}
//           </Stack.Screen>
//         ) : user.role === "admin" && user.department === "HR" ? (
//           <Stack.Screen name="HrAdminDashboard">
//             {(props) => <HrAdminDashboard {...props} setUser={setUser} />}
//           </Stack.Screen>
//         ) : user.role === "admin" && user.department === "Department Head" ? (
//           <Stack.Screen name="DeptHeadDashboard">
//             {(props) => <DeptHeadDashboard {...props} setUser={setUser} />}
//           </Stack.Screen>
//         ) : (
//           <Stack.Screen name="UserTabs">
//             {(props) => <UserTabs {...props} setUser={setUser} />}
//           </Stack.Screen>
//         )}
//       </Stack.Navigator>
//       <FloatingChatbot />

//     </NavigationContainer>
//   );
// }


import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from "expo-secure-store";

import LandingPage from "./src/screens/LandingPage";
import LoginScreen from "./src/screens/LoginScreen";
import UserTabs from "./src/screens/user/UserTabs";
import SuperAdminDashboard from "./src/screens/superadmin/dashboard";
import OsaAdminDashboard from "./src/screens/admin/osa/dashboard";
import HrAdminDashboard from "./src/screens/admin/hr/dashboard";
import DeptHeadDashboard from "./src/screens/admin/depthead/dashboard";
import CommitteeReports from "./src/screens/CommitteeReports";
import GADPlanBudget from "./src/screens/GADPlanBudget";
import GADProjects from "./src/screens/GADProjects";
import GADReport from "./src/screens/GADReport";
import Resources from "./src/screens/Resources";
import FloatingChatbot from "./src/components/FloatingChatbot";
import VisionMission from "./src/screens/about/VisionMission";
import OrgStructure from "./src/screens/about/OrgStructure";
import GADCommittee from "./src/screens/about/GADCommittee";
import Hotlines from "./src/screens/about/Hotlines";
import Circular from "./src/screens/policies/Circular";
import Memoranda from "./src/screens/policies/Memoranda";
import Resolutions from "./src/screens/policies/Resolutions";
import OfficeOrder from "./src/screens/policies/OfficeOrder"; 
import Handbook from "./src/screens/resources/Handbook";
import KnowledgeHub from "./src/screens/resources/KnowledgeHub";
import SuggestionBox from "./src/screens/resources/SuggestionBox";
import MoreInfographics from "./src/screens/MoreInfographics"; // Import MoreInfographics
import NewsArchive from "./src/screens/NewsArchive"; // Import NewsArchive
const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState("Landing");

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await SecureStore.getItemAsync("user");
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer
      onStateChange={(state) => {
        const route = state?.routes[state.index]?.name;
        setCurrentRoute(route);
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Landing" component={LandingPage} />
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} setUser={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="CommitteeReports" component={CommitteeReports} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="GADPlanBudget" component={GADPlanBudget} options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="GADProjects" component={GADProjects} options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="GADReport" component={GADReport} options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="Resources" component={Resources} options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="VisionMission" component={VisionMission} options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="OrgStructure" component={OrgStructure} options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="GADCommittee" component={GADCommittee} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="Hotlines" component={Hotlines} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="Circular" component={Circular} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="Memoranda" component={Memoranda} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="Resolutions" component={Resolutions} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="OfficeOrder" component={OfficeOrder} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="Handbook" component={Handbook} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="KnowledgeHub" component={KnowledgeHub} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="SuggestionBox" component={SuggestionBox} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="MoreInfographics" component={MoreInfographics} options={{ headerShown: true, title: "" }}/>
            <Stack.Screen name="NewsArchive" component={NewsArchive} options={{ headerShown: true, title: "" }}/>
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
          <Stack.Screen name="UserTabs">
            {(props) => <UserTabs {...props} setUser={setUser} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>

      {/* ✅ Show chatbot only on Landing or UserTabs */}
      {(currentRoute === "Landing" || currentRoute === "UserTabs") && (
        <FloatingChatbot />
      )}
    </NavigationContainer>
  );
}
