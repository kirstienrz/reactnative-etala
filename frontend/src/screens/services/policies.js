import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PoliciesScreen = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Policies</Text>
        <Text style={styles.text}>
           maam what to put here 
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
});

export default PoliciesScreen;