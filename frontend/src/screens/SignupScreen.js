import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { User, Mail, Lock, IdCard, Calendar, Users as GenderIcon, BookOpen, Eye, EyeOff } from "lucide-react-native";
import { signupUser } from "../api/auth";
import Header from "../components/Header";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SignupScreen({ navigation }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [tupId, setTupId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [department, setDepartment] = useState("");
    const [userType, setUserType] = useState("Student");
    const [gender, setGender] = useState("");
    const [birthday, setBirthday] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const departments = [
        "BASD", "CAAD", "EEAD", "MAAD"
    ];

    const userTypes = ["Student", "Faculty", "Staff"];
    const genders = ["Male", "Female", "Other"];

    const handleSignup = async () => {
        if (!firstName || !lastName || !email || !password || !tupId || !gender || !birthday) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        if (!email.endsWith("@tup.edu.ph")) {
            Alert.alert("Invalid Email", "Please use your @tup.edu.ph email address.");
            return;
        }

        if (!tupId.match(/^TUPT-\d{2}-\d{4}$/)) {
            Alert.alert("Invalid TUPT ID", "Format must be TUPT-XX-XXXX");
            return;
        }

        setLoading(true);

        try {
            const userData = {
                firstName,
                lastName,
                email,
                password,
                tupId,
                department,
                userType,
                gender,
                birthday: birthday.toISOString(),
            };

            const data = await signupUser(userData);
            Alert.alert("Success", data.msg || "Signup successful! Check your email to activate your account.");
            navigation.navigate("LoginScreen");
        } catch (error) {
            console.error("Signup error:", error.response?.data || error.message);
            Alert.alert(
                "Signup Failed",
                error.response?.data?.msg || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || birthday;
        setShowDatePicker(Platform.OS === 'ios');
        setBirthday(currentDate);
    };

    const formatTuptId = (text) => {
        let formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (formatted.length > 4) formatted = formatted.slice(0, 4) + "-" + formatted.slice(4);
        if (formatted.length > 7) formatted = formatted.slice(0, 7) + "-" + formatted.slice(7, 11);
        return formatted.slice(0, 12);
    };

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Fill in your details to get started</Text>

                {/* First Name */}
                <div style={styles.inputRow}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                        <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                            style={styles.input}
                        />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <TextInput
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                            style={styles.input}
                        />
                    </View>
                </div>

                {/* Email */}
                <View style={styles.inputContainer}>
                    <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        placeholder="your.email@tup.edu.ph"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* TUPT ID */}
                <View style={styles.inputContainer}>
                    <IdCard size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        placeholder="TUPT-XX-XXXX"
                        value={tupId}
                        onChangeText={(text) => setTupId(formatTuptId(text))}
                        style={styles.input}
                        autoCapitalize="characters"
                    />
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                    <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                    </TouchableOpacity>
                </View>

                {/* Gender */}
                <View style={styles.pickerContainer}>
                    <GenderIcon size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <View style={styles.optionsWrapper}>
                        {genders.map(g => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.optionBtn, gender === g && styles.activeOption]}
                                onPress={() => setGender(g)}
                            >
                                <Text style={[styles.optionText, gender === g && styles.activeOptionText]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* User Type */}
                <View style={styles.pickerContainer}>
                    <BookOpen size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <View style={styles.optionsWrapper}>
                        {userTypes.map(ut => (
                            <TouchableOpacity
                                key={ut}
                                style={[styles.optionBtn, userType === ut && styles.activeOption]}
                                onPress={() => setUserType(ut)}
                            >
                                <Text style={[styles.optionText, userType === ut && styles.activeOptionText]}>{ut}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Department */}
                {userType !== "Staff" && (
                    <View style={styles.pickerContainer}>
                        <View style={styles.optionsWrapper}>
                            {departments.map(d => (
                                <TouchableOpacity
                                    key={d}
                                    style={[styles.optionBtn, department === d && styles.activeOption]}
                                    onPress={() => setDepartment(d)}
                                >
                                    <Text style={[styles.optionText, department === d && styles.activeOptionText]}>{d}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Birthday */}
                <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
                    <Calendar size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <Text style={[styles.input, { color: birthday ? "#111827" : "#9CA3AF" }]}>
                        {birthday ? birthday.toLocaleDateString() : "Birthday"}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={birthday}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}

                <TouchableOpacity
                    onPress={handleSignup}
                    disabled={loading}
                    style={[styles.signupBtn, loading && styles.disabledBtn]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.signupText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")} style={{ marginTop: 20 }}>
                    <Text style={styles.loginLink}>Already have an account? <Text style={{ fontWeight: '700', color: '#4338CA' }}>Sign In</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    formContainer: { paddingHorizontal: 28, paddingVertical: 24, paddingBottom: 50 },
    title: { fontSize: 24, fontWeight: "700", color: "#1E1E1E", marginBottom: 4 },
    subtitle: { color: "#6B7280", marginBottom: 24, fontSize: 14 },
    inputRow: { flexDirection: 'row', marginBottom: 16 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        marginBottom: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#F9FAFB",
    },
    pickerContainer: {
        marginBottom: 16,
    },
    optionsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    optionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    activeOption: {
        backgroundColor: '#4338CA',
        borderColor: '#4338CA',
    },
    optionText: {
        fontSize: 12,
        color: '#6B7280',
    },
    activeOptionText: {
        color: '#fff',
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, paddingVertical: 8, fontSize: 15, color: "#111827" },
    signupBtn: {
        backgroundColor: "#4338CA",
        borderRadius: 10,
        paddingVertical: 14,
        marginTop: 10,
    },
    signupText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
    },
    disabledBtn: { backgroundColor: "#9CA3AF" },
    loginLink: {
        textAlign: "center",
        color: "#6B7280",
        fontSize: 14,
    },
});
