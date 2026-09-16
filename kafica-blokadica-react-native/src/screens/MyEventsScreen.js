import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import API from "../api/api";

export default function EventsScreen({ navigation }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadEvents = async () => {
        try {
            const response = await API.get("/me/events");
            setEvents(response.data.events);
        } catch (error) {
            console.log("EVENTS ERROR:", error?.response?.data?.message || error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadEvents();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadEvents();
    };

    const copyToClipboard = async (token) => {
        await Clipboard.setStringAsync(token);
        Alert.alert("Copied", "Invite token copied to clipboard!");
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "OPEN":
                return { bg: "#E8F5E9", text: "#388E3C" };
            case "FINALIZED":
                return { bg: "#F3EAE3", text: "#4b2c20" };
            case "CANCELLED":
                return { bg: "#FFEBEE", text: "#D32F2F" };
            default:
                return { bg: "#F5F5F5", text: "#757575" };
        }
    };

    const renderItem = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <View style={styles.eventCard}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.eventTitle}>{item.title}</Text>
                        {item.isCreator && (
                            <View style={styles.creatorTag}>
                                <Text style={styles.creatorTagText}>CREATOR</Text>
                            </View>
                        )}
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusStyle.bg }
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusBadgeText,
                                { color: statusStyle.text }
                            ]}
                        >
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <Ionicons name="calendar-outline" size={14} color="#95816f" />
                    <Text style={styles.deadlineLabel}> Voting Deadline: </Text>
                    <Text style={styles.deadlineValue}>
                        {new Date(item.deadline).toLocaleDateString()}
                    </Text>
                </View>

                <View style={styles.cardActions}>
                    {item.inviteToken && (
                        <TouchableOpacity
                            onPress={() => copyToClipboard(item.inviteToken)}
                            style={styles.copyButton}
                        >
                            <Ionicons name="copy-outline" size={18} color="#4b2c20" />
                            <Text style={styles.copyButtonText}>Copy Invite</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("EventDetails", {
                                eventId: item.eventId
                            })
                        }
                        style={styles.detailsButton}
                    >
                        <Text style={styles.detailsButtonText}>View Details</Text>
                        <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4b2c20" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={events}
                renderItem={renderItem}
                keyExtractor={(item) => item.eventId.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#4b2c20"]}
                        tintColor="#4b2c20"
                    />
                }
                contentContainerStyle={{ paddingVertical: 10 }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        No events found. Swipe down to refresh.
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FDFCFB"
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FDFCFB"
    },
    eventCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: "#F1E9E1",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start"
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2c1c14"
    },
    creatorTag: {
        backgroundColor: "#F3EAE3",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: "flex-start",
        marginTop: 4
    },
    creatorTagText: {
        fontSize: 10,
        color: "#4b2c20",
        fontWeight: "bold"
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: "bold"
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12
    },
    deadlineLabel: {
        fontSize: 13,
        color: "#95816f",
        marginLeft: 4
    },
    deadlineValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#2c1c14"
    },
    cardActions: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1E9E1"
    },
    copyButton: {
        flexDirection: "row",
        alignItems: "center"
    },
    copyButtonText: {
        color: "#4b2c20",
        marginLeft: 6,
        fontSize: 13,
        fontWeight: "600"
    },
    detailsButton: {
        backgroundColor: "#4b2c20",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        marginLeft: "auto"
    },
    detailsButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 13,
        marginRight: 4
    },
    emptyText: {
        textAlign: "center",
        marginTop: 50,
        color: "#95816f"
    }
});