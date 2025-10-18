import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const KnowledgeHub = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Knowledge Hub</Text>
            <Text style={styles.subtitle}>Welcome to your learning resource center</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});

export default KnowledgeHub;