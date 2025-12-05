// src/components/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getItem } from "../utils/storage";

const ProtectedRoute = ({ allowedRoles = [], children, setUser }) => {
  const [allowed, setAllowed] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const savedRole = await getItem("role");

        if (!savedRole) {
          setAllowed(false);
          Alert.alert(
            "Unauthorized",
            "You need to log in to access this page.",
            [{ text: "OK", onPress: () => navigation.replace("LoginScreen") }]
          );
          return;
        }

        if (allowedRoles.length === 0 || allowedRoles.includes(savedRole)) {
          setAllowed(true);
        } else {
          setAllowed(false);
          Alert.alert(
            "Access Denied",
            "You do not have permission to view this page.",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        }
      } catch (err) {
        console.error("ProtectedRoute error:", err);
        setAllowed(false);
        Alert.alert("Error", "Something went wrong.", [
          { text: "OK", onPress: () => navigation.replace("LoginScreen") },
        ]);
      }
    };

    checkRole();
  }, []);

  if (allowed === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!allowed) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>🚫 Access Denied</Text>
        <Text style={styles.subtext}>You do not have permission to view this page.</Text>
      </View>
    );
  }

  // ✅ Pass setUser down to child component
  return React.cloneElement(children, { setUser });
};

export default ProtectedRoute;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    textAlign: "center",
  },
});
