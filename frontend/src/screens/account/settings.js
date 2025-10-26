import React, { useState } from 'react';
import {

SafeAreaView,
View,
Text,
Switch,
TouchableOpacity,
Alert,
StyleSheet,
} from 'react-native';

export default function SettingsScreen() {
const [notificationsEnabled, setNotificationsEnabled] = useState(true);
const [darkModeEnabled, setDarkModeEnabled] = useState(false);

const toggleNotifications = () =>
    setNotificationsEnabled((prev) => !prev);
const toggleDarkMode = () => setDarkModeEnabled((prev) => !prev);

const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Cache cleared.', [{ text: 'OK' }]);
};

return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Settings</Text>

        <View style={styles.row}>
            <Text style={styles.label}>Notifications</Text>
            <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
            />
        </View>

        <View style={styles.row}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch value={darkModeEnabled} onValueChange={toggleDarkMode} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleClearCache}>
            <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>App version 1.0.0</Text>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
},
header: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
},
row: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
},
label: {
    fontSize: 16,
},
button: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
},
buttonText: {
    color: '#fff',
    fontWeight: '600',
},
footer: {
    marginTop: 'auto',
    textAlign: 'center',
    color: '#888',
    paddingVertical: 12,
},
});