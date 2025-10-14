// App.js
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LandingPage from "./src/screens/LandingPage";
import LoginScreen from "./src/screens/LoginScreen";
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";
import SetPinScreen from "./src/screens/SetPinScreen";
import PinLoginScreen from "./src/screens/PinLoginScreen";
import StartupScreen from "./src/screens/StartupScreen";
import UserHome from "./src/screens/user/home";
import ConfirmPinScreen from "./src/screens/ConfirmPinScreen";
import AuthLoadingScreen from "./src/screens/AuthLoadingScreen";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <Stack.Navigator initialRouteName="StartupScreen">
          <Stack.Screen name="StartupScreen" component={StartupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SetPinScreen" component={SetPinScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PinLoginScreen" component={PinLoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UserHome" component={UserHome} options={{ headerShown: false }} />
          <Stack.Screen name="ConfirmPinScreen" component={ConfirmPinScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AuthLoadingScreen" component={AuthLoadingScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="LandingPage"
            component={LandingPage}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>

      </SafeAreaView>
    </NavigationContainer>
  );
}
