import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const KnowledgeHub = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Knowledge Hub</Text>
            <Text style={styles.subtitle}>Welcome to the Knowledge Hub!</Text>
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
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
    },
});

export default KnowledgeHub;