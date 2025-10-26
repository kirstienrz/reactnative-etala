import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function Header() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/logo.jpg")} // ✅ Adjust path if needed
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "white",
  },
  logo: {
    width: 170,
    height: 60,
  },
});
