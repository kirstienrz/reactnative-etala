import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { fetchProfile, saveProfile } from '../../store/userSlice';

export default function Profile() {
  const dispatch = useDispatch();
  const { profile, loading, updating, error } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    gender: '',
    currentPassword: '',
    newPassword: '',
  });

  // Fetch profile on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        birthday: profile?.birthday ? profile.birthday.split('T')[0] : '',
        gender: profile.gender || '',
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [profile]);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      birthday: form.birthday,
      gender: form.gender,
    };

    if (form.currentPassword && form.newPassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }

    dispatch(saveProfile(payload));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noDataText}>No profile data</Text>
      </View>
    );
  }

  const initials = `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || 'NA'}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>My Profile</Text>
              <Text style={styles.headerSubtitle}>
                {profile.email || 'Username'} • {profile.role || 'User'}
              </Text>
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorAlert}>
            <Icon name="alert-triangle" size={20} color="#dc2626" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="user" size={20} color="#2563eb" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputContainer}>
                  <Icon name="user" size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.firstName}
                    onChangeText={(value) => handleChange('firstName', value)}
                    placeholder="Enter first name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <Icon name="user" size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.lastName}
                    onChangeText={(value) => handleChange('lastName', value)}
                    placeholder="Enter last name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Birthday</Text>
                <View style={styles.inputContainer}>
                  <Icon name="calendar" size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.birthday}
                    onChangeText={(value) => handleChange('birthday', value)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.inputContainer}>
                  <Icon name="users" size={16} color="#64748b" style={styles.inputIcon} />
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={form.gender}
                      onValueChange={(value) => handleChange('gender', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select Gender" value="" />
                      <Picker.Item label="Male" value="Male" />
                      <Picker.Item label="Female" value="Female" />
                      <Picker.Item label="Other" value="Other" />
                    </Picker>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="lock" size={20} color="#2563eb" style={styles.sectionIcon} />
            <View style={styles.sectionHeaderContent}>
              <Text style={styles.sectionTitle}>Security</Text>
              <Text style={styles.sectionSubtitle}>
                Leave blank if you don't want to change password
              </Text>
            </View>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.inputContainer}>
                  <Icon name="key" size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.currentPassword}
                    onChangeText={(value) => handleChange('currentPassword', value)}
                    placeholder="Enter current password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputContainer}>
                  <Icon name="key" size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.newPassword}
                    onChangeText={(value) => handleChange('newPassword', value)}
                    placeholder="Enter new password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Update Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.updateButton, updating && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={updating}
          >
            {updating ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" style={styles.buttonLoader} />
                <Text style={styles.updateButtonText}>Updating...</Text>
              </>
            ) : (
              <>
                <Icon name="check-circle" size={20} color="#ffffff" style={styles.buttonIcon} />
                <Text style={styles.updateButtonText}>Update Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748b', fontWeight: '500' },
  noDataText: { fontSize: 15, color: '#64748b' },
  scrollView: { flex: 1 },
  headerCard: { backgroundColor: '#ffffff', marginHorizontal: 20, marginTop: 20, marginBottom: 16, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  avatarContainer: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  headerInfo: { marginLeft: 16, flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  errorAlert: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, padding: 14, backgroundColor: '#fef2f2', borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  errorIcon: { marginRight: 10 },
  errorText: { flex: 1, color: '#dc2626', fontSize: 14, fontWeight: '500' },
  section: { backgroundColor: '#ffffff', marginHorizontal: 20, marginBottom: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  sectionIcon: { marginRight: 10 },
  sectionHeaderContent: { flex: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#0f172a' },
  sectionSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  sectionContent: { padding: 20 },
  formRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  formField: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#0f172a' },
  pickerWrapper: { flex: 1, justifyContent: 'center' },
  picker: { height: 48, color: '#0f172a' },
  buttonContainer: { marginHorizontal: 20, marginBottom: 20 },
  updateButton: { backgroundColor: '#2563eb', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 10, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonLoader: { marginRight: 8 },
  buttonIcon: { marginRight: 8 },
  updateButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  bottomSpacer: { height: 80 },
});