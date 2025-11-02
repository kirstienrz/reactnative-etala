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
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Phone, Mail, Clock, Send, Building2 } from 'lucide-react-native';

export default function ContactGAD() {
    const [message, setMessage] = useState('');

    const handleSend = async () => {
        if (!message.trim()) {
            Alert.alert('Required Field', 'Please enter a message.');
            return;
        }

        const to = 'gad.department@example.com';
        const subject = 'GAD Inquiry';
        const body = message;
        const url = `mailto:${to}?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(body)}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
                // Clear form after opening mail client
                setMessage('');
            } else {
                Alert.alert('Cannot open mail client', `Your message:\n\n${body}\n\nPlease copy and send to: ${to}`);
            }
        } catch (err) {
            Alert.alert('Error', 'Unable to open mail client. Please try again.');
        }
    };

    const openPhone = () => {
        Linking.openURL('tel:+1234567890');
    };

    const openEmail = () => {
        Linking.openURL('mailto:gad.department@example.com');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.select({ ios: 'padding', android: undefined })}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerIconContainer}>
                            <Building2 size={32} color="#4338CA" />
                        </View>
                        <Text style={styles.title}>Contact the GAD Department</Text>
                        <Text style={styles.subtitle}>
                            For inquiries, suggestions, or concerns related to the GAD Department, 
                            you may reach us through the form below or via the contact details provided.
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Send a Message</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Message <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Write your message or inquiry..."
                                multiline
                                numberOfLines={8}
                                style={[styles.input, styles.textArea]}
                                textAlignVertical="top"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.sendButton} 
                            onPress={handleSend}
                            activeOpacity={0.8}
                        >
                            <Send size={20} color="#FFFFFF" />
                            <Text style={styles.sendButtonText}>Send via Email</Text>
                        </TouchableOpacity>

                        <Text style={styles.formNote}>
                            This will open your email app with the message ready to send.
                        </Text>
                    </View>

                    {/* Contact Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>

                        <View style={styles.infoCard}>
                            <View style={styles.infoItem}>
                                <View style={styles.infoIconContainer}>
                                    <MapPin size={20} color="#4338CA" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Office Address</Text>
                                    <Text style={styles.infoValue}>
                                        GAD Office, Main Building{'\n'}
                                        University Campus, City
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <TouchableOpacity 
                                style={styles.infoItem}
                                onPress={openPhone}
                                activeOpacity={0.7}
                            >
                                <View style={styles.infoIconContainer}>
                                    <Phone size={20} color="#4338CA" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Telephone Number</Text>
                                    <Text style={[styles.infoValue, styles.linkText]}>+63 (02) 1234-5678</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity 
                                style={styles.infoItem}
                                onPress={openEmail}
                                activeOpacity={0.7}
                            >
                                <View style={styles.infoIconContainer}>
                                    <Mail size={20} color="#4338CA" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={[styles.infoValue, styles.linkText]}>gad.department@example.com</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <View style={styles.infoItem}>
                                <View style={styles.infoIconContainer}>
                                    <Clock size={20} color="#4338CA" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Office Hours</Text>
                                    <Text style={styles.infoValue}>Monday – Friday{'\n'}8:00 AM – 5:00 PM</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer Note */}
                    <View style={styles.footerNote}>
                        <Text style={styles.footerNoteText}>
                            Your message will be directed to the GAD Department. 
                            Please allow 1–3 business days for a response.
                        </Text>
                    </View>

                    <View style={styles.spacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F9FAFB' 
    },
    flex: {
        flex: 1,
    },
    content: { 
        padding: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    headerIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: { 
        fontSize: 24, 
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        textAlign: 'center',
        paddingHorizontal: 10,
    },

    // Form Card
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: { 
        fontSize: 14, 
        fontWeight: '600',
        color: '#374151', 
        marginBottom: 8,
    },
    required: {
        color: '#DC2626',
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
        fontSize: 14,
        color: '#1F2937',
    },
    textArea: { 
        minHeight: 140,
        paddingTop: 12,
    },
    sendButton: {
        marginTop: 10,
        backgroundColor: '#4338CA',
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#4338CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    sendButtonText: { 
        color: '#FFFFFF', 
        fontWeight: '600', 
        fontSize: 16,
    },
    formNote: {
        marginTop: 12,
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        fontStyle: 'italic',
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 14,
    },

    // Info Card
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoContent: {
        flex: 1,
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#1F2937',
        lineHeight: 20,
    },
    linkText: {
        color: '#4338CA',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },

    // Footer Note
    footerNote: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    footerNoteText: {
        fontSize: 13,
        color: '#92400E',
        lineHeight: 20,
    },

    spacer: {
        height: 20,
    },
});