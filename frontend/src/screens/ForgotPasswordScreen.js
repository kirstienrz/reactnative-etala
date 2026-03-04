import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Mail, ArrowLeft, Send } from "lucide-react-native";
import { forgotPassword } from "../api/auth";

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetRequest = async () => {
        if (!email) {
            Alert.alert("Missing Email", "Please enter your email address.");
            return;
        }

        setLoading(true);
        try {
            const data = await forgotPassword(email);
            Alert.alert(
                "Success",
                data.msg || "If an account exists with that email, a password reset link has been sent.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error("Forgot password error:", error.response?.data || error.message);
            Alert.alert(
                "Error",
                error.response?.data?.msg || "Something went wrong. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#fff" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                        Enter your email and we'll send you instructions to reset your password.
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        placeholder="your@etala.com"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleResetRequest}
                    disabled={loading}
                    style={[styles.resetBtn, loading && styles.disabledBtn]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={styles.btnContent}>
                            <Send size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.resetText}>Send Instructions</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 40 },
    backButton: { marginBottom: 30 },
    header: { marginBottom: 30 },
    title: { fontSize: 26, fontWeight: "700", color: "#1E1E1E", marginBottom: 10 },
    subtitle: { color: "#6B7280", fontSize: 16, lineHeight: 24 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        marginBottom: 24,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: "#F9FAFB",
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: "#111827" },
    resetBtn: {
        backgroundColor: "#4338CA",
        borderRadius: 12,
        paddingVertical: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 4,
    },
    btnContent: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    resetText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    disabledBtn: { backgroundColor: "#9CA3AF" },
});
