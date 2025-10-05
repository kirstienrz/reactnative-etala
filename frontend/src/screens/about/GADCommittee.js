import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GADCommittee = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>GAD Committee</Text>
            <Text style={styles.text}>
                Welcome to the Gender and Development (GAD) Committee page.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default GADCommittee;