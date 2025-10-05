import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Circular = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Circular Policy</Text>
            <Text style={styles.content}>
                This is the Circular policy screen. Add your policy details here.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    content: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default Circular;