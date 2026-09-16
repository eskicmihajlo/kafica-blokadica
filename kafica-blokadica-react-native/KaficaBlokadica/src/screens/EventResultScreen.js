import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import API from '../api/api';

export default function EventResultScreen() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {

                const response = await API.get('/events/9');
                setData(response.data);
            } catch (err) {
                console.log("STATUS GREŠKE:", err.response?.status);
                console.log("PORUKA GREŠKE:", err.message);
                console.log("DETALJI:", err.response?.data);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#4b2c20" />;
    if (!data) return <View style={styles.center}><Text>Nema podataka za ovu kaficu.</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Info o kafici */}
                <View style={styles.header}>
                    <Text style={styles.title}>{data.title}</Text>
                    <Text style={styles.description}>{data.description}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{data.status}</Text>
                    </View>
                </View>

                {/* LOKACIJE */}
                <Text style={styles.sectionLabel}>📍 IZABERI LOKACIJU</Text>
                {data.placeOptions.map((place) => (
                    <TouchableOpacity key={place.id} style={styles.optionCard}>
                        <View>
                            <Text style={styles.optionName}>{place.name}</Text>
                            <Text style={styles.optionSub}>{place.address}</Text>
                        </View>
                        <View style={styles.radioCircle} />
                    </TouchableOpacity>
                ))}

                {/* VREMENA */}
                <Text style={styles.sectionLabel}>⏰ IZABERI VREME</Text>
                {data.timeOptions.map((time) => (
                    <TouchableOpacity key={time.id} style={styles.optionCard}>
                        <View>
                            <Text style={styles.optionName}>
                                {new Date(time.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h
                            </Text>
                            <Text style={styles.optionSub}>
                                Kraj: {new Date(time.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h
                            </Text>
                        </View>
                        <View style={styles.radioCircle} />
                    </TouchableOpacity>
                ))}

                {/* Deadline info */}
                <Text style={styles.deadlineText}>
                    Glasanje se zatvara: {new Date(data.deadline).toLocaleDateString()} u {new Date(data.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFCFB' },
    scrollContent: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 30, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#4b2c20' },
    description: { fontSize: 16, color: '#7f8c8d', textAlign: 'center', marginTop: 5 },
    statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 10 },
    statusText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
    sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#bdc3c7', marginBottom: 10, marginTop: 20, letterSpacing: 1 },
    optionCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F1F1',
        // Senka
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    optionName: { fontSize: 18, fontWeight: '600', color: '#2c3e50' },
    optionSub: { fontSize: 14, color: '#95a5a6' },
    radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#dcdde1' },
    deadlineText: { textAlign: 'center', color: '#e74c3c', marginTop: 30, fontSize: 12, fontStyle: 'italic' }
});