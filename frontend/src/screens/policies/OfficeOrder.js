import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const OfficeOrder = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.title}>Office Order</Text>
                <Text style={styles.content}>
                    This is the Office Order screen. Add your content here.
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    content: {
        fontSize: 16,
        color: '#333',
    },
});

export default OfficeOrder;