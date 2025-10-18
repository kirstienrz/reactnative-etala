import React, { useState, useMemo } from 'react';
import {

View,
Text,
TextInput,
TouchableOpacity,
KeyboardAvoidingView,
Platform,
ScrollView,
StyleSheet,
Alert,
} from 'react-native';

/**
 * Simple Edit Profile screen for React Native.
 * - name and email inputs
 * - avatar circle showing initials (tap to cycle color)
 * - basic validation and Save action (logs/alerts)
 *
 * Save this file as: frontend/src/screens/account/edit-profile.js
 */

const COLORS = ['#4F46E5', '#059669', '#D97706', '#B91C1C', '#0EA5E9'];

export default function EditProfileScreen() {
const [name, setName] = useState('Kirst');
const [email, setEmail] = useState('kirst@example.com');
const [colorIndex, setColorIndex] = useState(0);

const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}, [name]);

const handleToggleAvatarColor = () => {
    setColorIndex((i) => (i + 1) % COLORS.length);
};

const validateEmail = (e) => {
    // simple email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
};

const handleSave = () => {
    if (!name.trim()) {
        Alert.alert('Validation', 'Name is required.');
        return;
    }
    if (!validateEmail(email)) {
        Alert.alert('Validation', 'Please enter a valid email address.');
        return;
    }

    // Replace with real save logic (API call, context update, etc.)
    console.log('Saved profile:', { name, email });
    Alert.alert('Profile saved', `Name: ${name}\nEmail: ${email}`);
};

return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={[styles.avatar, { backgroundColor: COLORS[colorIndex] }]} onPress={handleToggleAvatarColor}>
                <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>

            <View style={styles.form}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    returnKeyType="next"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#fff' },
content: {
    padding: 20,
    alignItems: 'center',
},
avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
    elevation: 3,
},
avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
},
form: {
    width: '100%',
    maxWidth: 520,
},
label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
},
input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
},
saveButton: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
},
saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
},
});