import React from "react";
import { View, Text, StyleSheet } from "react-native";

const GADPlanBudget = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BUDGET</Text>
      <Text>This is the Committee Reports screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default GADPlanBudget;
