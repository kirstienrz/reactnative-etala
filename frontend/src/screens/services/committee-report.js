import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CommitteeReport = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Committee Report</Text>
            <Text>am dito rin po</Text>
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
        marginBottom: 10,
    },
});

export default CommitteeReport;