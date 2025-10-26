import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SecureStore from "expo-secure-store";
import { getUserProfile, updateUserProfile } from "../../api/user";

const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tupId, setTupId] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🧠 Fetch user info
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const id = await SecureStore.getItemAsync("userId");
        setUserId(id);

        const data = await getUserProfile(id);

        // ✅ Populate all fields
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setTupId(data.tupId || "");
        setEmail(data.email || "");
        setDepartment(data.department || "");
        setGender(data.gender || "");
        setBirthday(data.birthday ? new Date(data.birthday) : new Date());
        setAge(data.age ? data.age.toString() : "");
      } catch (error) {
        console.error("Error loading profile:", error);
        Alert.alert("Error", "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // 🎂 Calculate age from birthday
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthday;
    setShowDatePicker(false);
    setBirthday(currentDate);

    const today = new Date();
    let userAge = today.getFullYear() - currentDate.getFullYear();
    const m = today.getMonth() - currentDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < currentDate.getDate())) {
      userAge--;
    }
    setAge(userAge.toString());
  };

  // 💾 Save changes
  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Error", "Please fill in your name.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName,
        lastName,
        birthday,
        age,
        gender,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      };

      const res = await updateUserProfile(userId, payload);
      Alert.alert("Success", "Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      {/* 🧾 Read-only info */}
      <Text style={styles.label}>TUP ID</Text>
      <TextInput style={[styles.input, styles.disabled]} value={tupId} editable={false} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={[styles.input, styles.disabled]} value={email} editable={false} />

      <Text style={styles.label}>Department</Text>
      <TextInput style={[styles.input, styles.disabled]} value={department} editable={false} />

      {/* Editable info */}
      <Text style={styles.label}>First Name</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

      <Text style={styles.label}>Last Name</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

      <Text style={styles.label}>Birthday</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text>{birthday.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={birthday} mode="date" display="default" onChange={handleDateChange} />
      )}

      <Text style={styles.label}>Age</Text>
      <TextInput style={[styles.input, styles.disabled]} value={age} editable={false} />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={gender} onValueChange={(itemValue) => setGender(itemValue)}>
          <Picker.Item label="Select gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Prefer not to say" value="Prefer not to say" />
        </Picker>
      </View>

      {/* 🔒 Change password */}
      <Text style={styles.sectionHeader}>Change Password</Text>

      <Text style={styles.label}>Current Password</Text>
      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        placeholder="Enter current password"
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        placeholder="Enter new password"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  disabled: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  datePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 15,
  },
  saveButton: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
