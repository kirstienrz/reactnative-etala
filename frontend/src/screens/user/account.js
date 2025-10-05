import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { getUserProfile, updateUserProfile } from "../../api/user";

export default function ProfileScreen({ setUser }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tupId, setTupId] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        if (!storedUser) return;
        const parsed = JSON.parse(storedUser);

        if (!parsed._id) return Alert.alert("Error", "User ID missing. Login again.");

        const profile = await getUserProfile(parsed._id);

        setUserState(profile);
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setTupId(profile.tupId);
        setEmail(profile.email);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        Alert.alert("Error", "Failed to load profile");
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async () => {
    try {
      if (newPassword && !oldPassword) {
        return Alert.alert("Error", "Please enter your old password to set a new one.");
      }

      const payload = {};

      if (newPassword) {
        payload.oldPassword = oldPassword;
        payload.password = newPassword;
      }

      const updated = await updateUserProfile(user._id, payload);

      setUserState(updated);
      setOldPassword("");
      setNewPassword("");
      Alert.alert("Success", "Password updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to update password");
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  };

  if (loading)
    return <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 50 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      <View style={styles.card}>
        {/* Read-only Fields */}
        <Text style={styles.label}>First Name</Text>
        <TextInput style={styles.input} value={firstName} editable={false} />

        <Text style={styles.label}>Last Name</Text>
        <TextInput style={styles.input} value={lastName} editable={false} />

        <Text style={styles.label}>TUP ID</Text>
        <TextInput style={styles.input} value={tupId} editable={false} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} editable={false} />

        {/* Password Change */}
        <Text style={styles.label}>Old Password</Text>
        <TextInput
          style={styles.input}
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder="Enter old password"
          secureTextEntry
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F3F4F6", // slightly gray to show read-only
  },
  button: {
    width: "100%",
    backgroundColor: "#8B5CF6",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
