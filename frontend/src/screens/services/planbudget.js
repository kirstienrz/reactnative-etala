import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlanBudget = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Plan Budget</Text>
            <Text>mam wat to put heree</Text>
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

export default PlanBudget;