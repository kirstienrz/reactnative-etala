import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Memoranda = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Memoranda</Text>
            <Text>This is the Memoranda screen.</Text>
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

export default Memoranda;