import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function AuthLoadingScreen({ navigation }) {
  useEffect(() => {
    const checkLogin = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        navigation.replace("PinLoginScreen");
      } else {
        navigation.replace("LoginScreen");
      }
    };
    checkLogin();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#4338CA" />
    </View>
  );
}
