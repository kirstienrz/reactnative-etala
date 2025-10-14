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
import * as SecureStore from "expo-secure-store";
import { setPin } from "../api/auth"; // ✅ Make sure this exists

export default function ConfirmPinScreen({ navigation, route }) {
  const { pin: firstPin } = route.params; // ✅ PIN from SetPinScreen
  const [pin, setPinValue] = useState("");
  const inputRef = useRef(null);

  // ✅ Auto focus on load
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Handle keyboard hide event
  useEffect(() => {
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      inputRef.current?.blur();
    });
    return () => hideSub.remove();
  }, []);

  const handleBoxPress = () => {
    inputRef.current?.focus();
  };

  const handleConfirm = async () => {
    if (pin.length !== 6) {
      Alert.alert("Invalid PIN", "Please enter a 6-digit MPIN.");
      return;
    }

    if (pin !== firstPin) {
      Alert.alert("PIN Mismatch", "The MPINs do not match. Please try again.");
      setPinValue("");
      inputRef.current?.focus();
      return;
    }

    try {
      const email = await SecureStore.getItemAsync("email");
      if (!email) {
        Alert.alert("Error", "No email found. Please log in again.");
        navigation.replace("LoginScreen");
        return;
      }

      // ✅ Save PIN to backend
      await setPin(email, pin);

      // ✅ Mark that user now has a PIN
      await SecureStore.setItemAsync("hasPin", "true");

      Alert.alert("Success", "Your MPIN has been set successfully!");
      navigation.replace("PinLoginScreen");
    } catch (error) {
      console.error("❌ Error saving PIN:", error);
      Alert.alert("Error", "Failed to save your PIN. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.active]} />
        <View style={[styles.progressBar, styles.active]} />
        <View style={[styles.progressBar, styles.active]} />
        <View style={styles.progressBar} />
      </View>

      <Text style={styles.title}>Confirm your MPIN</Text>
      <Text style={styles.subtitle}>Re-enter the 6-digit MPIN to confirm.</Text>

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
        Make sure your MPIN matches the one you entered before.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.btnText}>Confirm</Text>
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
