import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const faqsData = [
    {
        id: '1',
        question: 'How do I create an account?',
        answer: 'Tap the Sign Up button on the welcome screen and follow the prompts to create a new account.',
    },
    {
        id: '2',
        question: 'How do I reset my password?',
        answer: 'Use the "Forgot password" link on the login screen and follow the instructions sent to your email.',
    },
    {
        id: '3',
        question: 'How can I contact support?',
        answer: 'Go to Settings > Help & Support to find contact options including email and in-app chat.',
    },
];

export default function FAQsScreen() {
    const [openId, setOpenId] = useState(null);

    const toggle = (id) => {
        setOpenId(prev => (prev === id ? null : id));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>FAQs</Text>
            <ScrollView contentContainerStyle={styles.list}>
                {faqsData.map(item => {
                    const expanded = item.id === openId;
                    return (
                        <View key={item.id} style={styles.item}>
                            <TouchableOpacity
                                onPress={() => toggle(item.id)}
                                activeOpacity={0.7}
                                style={styles.row}
                            >
                                <Text style={styles.question}>{item.question}</Text>
                                <Text style={styles.icon}>{expanded ? '−' : '+'}</Text>
                            </TouchableOpacity>
                            {expanded && <Text style={styles.answer}>{item.answer}</Text>}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 24,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 12,
    },
    list: {
        paddingBottom: 24,
    },
    item: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ddd',
        paddingVertical: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    question: {
        fontSize: 16,
        flex: 1,
        paddingRight: 8,
    },
    icon: {
        fontSize: 20,
        width: 24,
        textAlign: 'center',
    },
    answer: {
        marginTop: 8,
        color: '#444',
        lineHeight: 20,
    },
});