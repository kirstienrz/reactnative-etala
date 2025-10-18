import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const InboxScreen = () => {
    const messages = [
        { id: '1', title: 'Welcome!', content: 'Welcome to your inbox' },
        { id: '2', title: 'New Message', content: 'You have a new message' },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.messageItem}>
            <Text style={styles.messageTitle}>{item.title}</Text>
            <Text style={styles.messageContent}>{item.content}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Inbox</Text>
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    messageItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    messageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageContent: {
        fontSize: 14,
        color: '#666',
    },
});

export default InboxScreen;