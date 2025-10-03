import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';


const GADReport = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Landing')}
            >
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>GAD Report Screen</Text>
            <Text>This is a simple GAD Report screen.</Text>
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
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    backButtonText: {
        fontSize: 16,
        color: '#333',
    },
});

// Add this inside your GADReport component, above the return statement:

export default GADReport;