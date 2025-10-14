import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { getItem } from "../utils/storage";

export default function StartupScreen({ navigation }) {
  useEffect(() => {
    const checkLoginState = async () => {
      const token = await getItem("token");
      const hasPin = await getItem("hasPin");

      if (token && hasPin === "true") {
        navigation.replace("PinLoginScreen");
      } else if (token) {
        navigation.replace("LoginScreen");
      } else {
        navigation.replace("LoginScreen");
      }
    };

    checkLoginState();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#4338CA" />
    </View>
  );
}
