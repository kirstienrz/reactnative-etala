import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Handbook = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Handbook</Text>
                <Text style={styles.paragraph}>
                    Welcome to the handbook section. This is where you can find important information and guidelines.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
});

export default Handbook;
