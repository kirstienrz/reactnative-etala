import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Projects = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Projects</Text>
            <Text>mam dito rin po</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
});

export default Projects;