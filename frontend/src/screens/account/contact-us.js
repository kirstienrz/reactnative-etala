import React, { useState } from 'react';
import {

View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
KeyboardAvoidingView,
Platform,
Alert,
Linking,
ScrollView,
} from 'react-native';

export default function ContactUs() {
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [message, setMessage] = useState('');

const handleSend = async () => {
    if (!message.trim()) {
        Alert.alert('Please enter a message.');
        return;
    }

    // Optional simple email validation
    const emailValid =
        email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
        Alert.alert('Please enter a valid email address or leave it empty.');
        return;
    }

    const to = 'support@example.com';
    const subject = `Contact Us: ${name || 'Anonymous'}`;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const url = `mailto:${to}?subject=${encodeURIComponent(
        subject
    )}&body=${encodeURIComponent(body)}`;

    try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            // Fallback: show the composed message so user can copy it
            Alert.alert('Cannot open mail client', `${subject}\n\n${body}`);
        }
    } catch (err) {
        Alert.alert('Error', 'Unable to send message.');
    }
};

return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
        <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Contact Us</Text>

            <Text style={styles.label}>Name (optional)</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                style={styles.input}
                returnKeyType="next"
            />

            <Text style={styles.label}>Email (optional)</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                returnKeyType="next"
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Write your message..."
                multiline
                numberOfLines={6}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
            />

            <TouchableOpacity style={styles.button} onPress={handleSend}>
                <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
        </ScrollView>
    </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#fff' },
content: { padding: 20 },
title: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
label: { fontSize: 14, color: '#444', marginTop: 10, marginBottom: 6 },
input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
},
textArea: { minHeight: 120 },
button: {
    marginTop: 18,
    backgroundColor: '#007aff',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
},
buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});