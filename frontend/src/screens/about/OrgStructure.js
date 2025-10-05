import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrgStructure = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Organization Structure</Text>
            <Text style={styles.text}>CEO</Text>
            <Text style={styles.text}>|</Text>
            <Text style={styles.text}>CTO   CFO   COO</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    text: {
        fontSize: 18,
        marginVertical: 4,
    },
});

export default OrgStructure;