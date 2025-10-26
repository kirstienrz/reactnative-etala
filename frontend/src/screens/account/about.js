import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

// eto about pang mismong app na
const About = () => {
    const openLink = (url) => {
        Linking.openURL(url).catch(() => {});
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>My App</Text>
                <Text style={styles.subtitle}>Simple React Native About Screen</Text>

                <View style={styles.section}>
                    <Text style={styles.heading}>What this app does</Text>
                    <Text style={styles.paragraph}>
                        This lightweight app demonstrates a simple About screen using React Native components.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>Version</Text>
                    <Text style={styles.paragraph}>1.0.0</Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={() => openLink('https://example.com')}>
                    <Text style={styles.buttonText}>Visit our website</Text>
                </TouchableOpacity>

                <Text style={styles.footer}>© {new Date().getFullYear()} My Company</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20, alignItems: 'stretch' },
    title: { fontSize: 28, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
    section: { marginBottom: 16 },
    heading: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
    paragraph: { fontSize: 14, color: '#333', lineHeight: 20 },
    button: { marginTop: 12, backgroundColor: '#007AFF', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '600' },
    footer: { marginTop: 24, textAlign: 'center', color: '#999', fontSize: 12 },
});

export default About;