import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AccomplishmentReport = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Accomplishment Report</Text>
            <Text>mam dito rin po</Text>
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
        marginBottom: 16,
    },
});

export default AccomplishmentReport;