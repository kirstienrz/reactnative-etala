import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Handbook = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Handbook</Text>
            <Text style={styles.text}>Welcome to the Handbook screen!</Text>
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
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    text: {
        fontSize: 18,
        color: '#333',
    },
});

export default Handbook;