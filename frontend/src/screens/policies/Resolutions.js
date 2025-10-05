import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Resolutions = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Resolutions</Text>
            <Text style={styles.text}>This is the Resolutions screen.</Text>
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

export default Resolutions;