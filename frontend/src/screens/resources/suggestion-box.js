import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const SuggestionBox = () => {
    const [suggestion, setSuggestion] = React.useState('');

    const handleSubmit = () => {
        if (suggestion.trim()) {
            // Handle submission logic here
            console.log('Submitted suggestion:', suggestion);
            setSuggestion('');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Suggestion Box</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your suggestion"
                value={suggestion}
                onChangeText={setSuggestion}
                multiline
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        minHeight: 100,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SuggestionBox;