import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScanQR = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Scan QR Code Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ScanQR;