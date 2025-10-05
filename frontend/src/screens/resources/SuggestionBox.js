import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const SuggestionBox = () => {
    const [suggestion, setSuggestion] = useState('');

    const handleSubmit = () => {
        if (suggestion.trim() === '') {
            Alert.alert('Please enter a suggestion.');
            return;
        }
        Alert.alert('Thank you!', 'Your suggestion has been submitted.');
        setSuggestion('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Suggestion Box</Text>
            <TextInput
                style={styles.input}
                placeholder="Type your suggestion here..."
                value={suggestion}
                onChangeText={setSuggestion}
                multiline
            />
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        minHeight: 80,
        textAlignVertical: 'top',
    },
});

export default SuggestionBox;