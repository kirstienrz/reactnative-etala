import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const hotlines = [
    { id: '1', name: 'Emergency', number: '911' },
    { id: '2', name: 'Fire Department', number: '101' },
    { id: '3', name: 'Police', number: '100' },
    { id: '4', name: 'Ambulance', number: '102' },
];

const HotlineItem = ({ name, number }) => (
    <View style={styles.item}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.number}>{number}</Text>
    </View>
);

const Hotlines = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Important Hotlines</Text>
        <FlatList
            data={hotlines}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <HotlineItem name={item.name} number={item.number} />}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    name: {
        fontSize: 18,
    },
    number: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Hotlines;