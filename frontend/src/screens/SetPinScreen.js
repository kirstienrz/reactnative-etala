import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  Keyboard,
} from "react-native";

export default function SetPinScreen({ navigation }) {
  const [pin, setPinValue] = useState("");
  const inputRef = useRef(null);

  // Auto focus on load
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Re-focus the input when keyboard is dismissed & user taps box again
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidHide", () => {
      inputRef.current?.blur(); // make sure to unfocus first
    });
    return () => {
      showSubscription.remove();
    };
  }, []);

  const handleNext = () => {
    if (pin.length !== 6) {
      Alert.alert("Invalid PIN", "Please enter a 6-digit MPIN.");
      return;
    }
    navigation.navigate("ConfirmPinScreen", { pin });
  };

  const handleBoxPress = () => {
    inputRef.current?.focus(); // Always re-focus on press
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.active]} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
      </View>

      <Text style={styles.title}>Create your own MPIN</Text>
      <Text style={styles.subtitle}>
        Setup your MPIN. Enter a 6-digit MPIN below.
      </Text>

      <TouchableOpacity
        style={styles.pinContainer}
        onPress={handleBoxPress}
        activeOpacity={1}
      >
        {Array(6)
          .fill("")
          .map((_, index) => (
            <View key={index} style={styles.pinBox}>
              <Text style={styles.pinText}>{pin[index] || ""}</Text>
            </View>
          ))}
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="numeric"
        maxLength={6}
        value={pin}
        onChangeText={setPinValue}
        returnKeyType="done"
        blurOnSubmit={false}
      />

      <Text style={styles.infoText}>
        You will use this 6 digit PIN to login next time.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.btnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
    borderRadius: 10,
  },
  active: {
    backgroundColor: "#2563EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "left",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 32,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  pinBox: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pinText: {
    fontSize: 20,
    fontWeight: "600",
  },
  hiddenInput: {
    width: 1,
    height: 1,
    position: "absolute",
    top: 0,
    left: 0,
    color: "transparent",
    backgroundColor: "transparent",
  },
  infoText: {
    color: "#6B7280",
    textAlign: "left",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
