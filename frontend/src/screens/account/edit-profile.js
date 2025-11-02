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
import {
  User,
  Mail,
  Building2,
  Calendar,
  Hash,
  Lock,
  Save,
  UserCircle,
  Shield,
  IdCard,
} from "lucide-react-native";

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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const id = await SecureStore.getItemAsync("userId");
        setUserId(id);

        const data = await getUserProfile(id);

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4338CA" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerIconContainer}>
          <UserCircle size={32} color="#4338CA" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.header}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your personal information</Text>
        </View>
      </View>

      {/* Account Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IdCard size={20} color="#4338CA" />
          <Text style={styles.sectionTitle}>Account Information</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>TUP ID</Text>
          <View style={styles.inputContainer}>
            <Hash size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={tupId}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Department</Text>
          <View style={styles.inputContainer}>
            <Building2 size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={department}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>

      {/* Personal Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={20} color="#4338CA" />
          <Text style={styles.sectionTitle}>Personal Information</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <User size={18} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <User size={18} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Calendar size={18} color="#6B7280" style={styles.inputIcon} />
            <Text style={styles.datePickerText}>{birthday.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthday}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Age</Text>
          <View style={styles.inputContainer}>
            <Hash size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={age}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <User size={18} color="#6B7280" style={styles.pickerIcon} />
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Prefer not to say" value="Prefer not to say" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color="#4338CA" />
          <Text style={styles.sectionTitle}>Security Settings</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <Lock size={18} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <Lock size={18} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={styles.saveButtonContent}>
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerContainer: {
    paddingVertical: 24,
    paddingTop: 32,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 10,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    paddingLeft: 0,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "400",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
    borderColor: "#E5E7EB",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  datePickerText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "400",
    marginLeft: 8,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  pickerIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 48,
  },
  saveButton: {
    backgroundColor: "#4338CA",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#4338CA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginLeft: 8,
  },
});