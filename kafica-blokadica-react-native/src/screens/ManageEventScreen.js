import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import API from "../api/api";

export default function ManageEventScreen({ route, navigation }) {
    const { eventId } = route.params;

    const [eventData, setEventData] = useState(null);
    const [activeTab, setActiveTab] = useState("options");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [duration, setDuration] = useState(60);

    // Modals & Pickers
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showPlaceModal, setShowPlaceModal] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState("date");


    // Form States
    const [newPlace, setNewPlace] = useState({
        name: "",
        address: "",
        lat: 0,
        lng: 0
    });
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchEventDetails = async () => {
        try {
            const response = await API.get(`/events/${eventId}/view`);
            setEventData(response.data);
        } catch (error) {
            Alert.alert("Error", "Could not fetch event data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const onDateChange = (event, date) => {
        if (event.type === "dismissed") {
            setShowPicker(false);
            setPickerMode("date");
            return;
        }

        if (date) {
            if (Platform.OS === "android" && pickerMode === "date") {
                setPickerMode("time");
                setSelectedDate(date);
                setShowPicker(false);
                setTimeout(() => setShowPicker(true), 0);
            } else {
                setShowPicker(false);
                setPickerMode("date");
                setSelectedDate(date);
            }
        }
    };

    const handleAddTime = async () => {
        setActionLoading(true);
        try {
            const startTime = selectedDate.getTime();
            const durationInMs = duration * 60 * 1000;
            const endTime = startTime + durationInMs;

            const payload = {
                startsAt: new Date(startTime).toISOString(),
                endsAt: new Date(endTime).toISOString()
            };

            await API.post(`/events/${eventId}/time-options`, payload);
            setShowTimeModal(false);
            setDuration(60);
            fetchEventDetails();
        } catch (e) {
            Alert.alert("Error", "Failed to add time option.");
        } finally {
            setActionLoading(false);
        }
    };



    const handleKick = (userId, username) => {
        Alert.alert(
            "Kick Participant",
            `Are you sure you want to remove ${username || "this user"} from the event?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Kick",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await API.delete(`/events/${eventId}/participants/${userId}`);
                            Alert.alert("Success", "User has been removed.");
                            fetchEventDetails();
                        } catch (error) {
                            Alert.alert("Error", "Failed to kick user.");
                        }
                    }
                }
            ]
        );
    };

    const handleAddPlace = async () => {
        if (!newPlace.name || !newPlace.address) {
            return Alert.alert("Error", "Please fill all fields");
        }

        setActionLoading(true);
        try {
            await API.post(`/events/${eventId}/place-options`, newPlace);
            setShowPlaceModal(false);
            setNewPlace({ name: "", address: "", lat: 0, lng: 0 });
            fetchEventDetails();
        } catch (e) {
            Alert.alert("Error", "Failed to add location.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = (type, optionId) => {
        const path = type === "time" ? "time-options" : "place-options";

        Alert.alert("Delete", "Are you sure you want to remove this?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await API.delete(`/events/${eventId}/${path}/${optionId}`);
                        fetchEventDetails();
                    } catch (e) {
                        Alert.alert("Error", "Delete failed.");
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4b2c20" />
            </View>
        );
    }

    const viewerId = eventData?.viewer?.userID;

    // Uzimamo listu ljudi iz prve time opcije jer backend tu već vraća sve učesnike.
    // Ako nema time opcija, probamo iz prve place opcije.
    const participantsList =
        eventData?.voteState?.timeOptions?.[0]?.votes ||
        eventData?.voteState?.placeOptions?.[0]?.votes ||
        [];

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "options" && styles.activeTab]}
                    onPress={() => setActiveTab("options")}
                >
                    <Text style={[styles.tabText, activeTab === "options" && styles.activeTabText]}>
                        Options
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === "participants" && styles.activeTab]}
                    onPress={() => setActiveTab("participants")}
                >
                    <Text style={[styles.tabText, activeTab === "participants" && styles.activeTabText]}>
                        Participants
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === "options" ? (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Time Options</Text>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => setShowTimeModal(true)}
                            >
                                <Ionicons name="add" size={18} color="#4b2c20" />
                                <Text style={styles.addBtnText}>Add Time</Text>
                            </TouchableOpacity>
                        </View>

                        {eventData?.voteState?.timeOptions?.map((opt) => (
                            <View key={opt.timeOptionId} style={styles.editCard}>
                                <Text style={styles.mainInfo}>
                                    {new Date(opt.startsAt).toLocaleString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => handleDelete("time", opt.timeOptionId)}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color="#EF4444"
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <View style={[styles.sectionHeader, { marginTop: 30 }]}>
                            <Text style={styles.sectionTitle}>Place Options</Text>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => setShowPlaceModal(true)}
                            >
                                <Ionicons name="add" size={18} color="#4b2c20" />
                                <Text style={styles.addBtnText}>Add Place</Text>
                            </TouchableOpacity>
                        </View>

                        {eventData?.voteState?.placeOptions?.map((opt) => (
                            <View key={opt.placeOptionId} style={styles.editCard}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.mainInfo}>{opt.name}</Text>
                                    <Text style={styles.subInfo}>{opt.address}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleDelete("place", opt.placeOptionId)}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color="#EF4444"
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.participantsContainer}>
                        <Text style={styles.sectionTitle}>People in this event</Text>

                        {participantsList.length > 0 ? (
                            participantsList.map((user) => {
                                const isMe = user.userId === viewerId;

                                return (
                                    <View key={user.userId} style={styles.userCard}>
                                        <View style={styles.userInfo}>
                                            <View
                                                style={[
                                                    styles.avatar,
                                                    isMe && styles.myAvatar
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.avatarText,
                                                        isMe && styles.myAvatarText
                                                    ]}
                                                >
                                                    {user.displayName?.charAt(0).toUpperCase() || "U"}
                                                </Text>
                                            </View>

                                            <View>
                                                <View
                                                    style={{
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        gap: 5
                                                    }}
                                                >
                                                    <Text style={styles.username}>
                                                        {user.displayName}
                                                    </Text>
                                                    {isMe && (
                                                        <Ionicons
                                                            name="star"
                                                            size={14}
                                                            color="#F59E0B"
                                                        />
                                                    )}
                                                </View>

                                                <Text style={styles.userRole}>
                                                    {isMe ? "Owner" : "Participant"}
                                                </Text>
                                            </View>
                                        </View>

                                        {!isMe ? (
                                            <TouchableOpacity
                                                style={styles.kickBtn}
                                                onPress={() =>
                                                    handleKick(user.userId, user.displayName)
                                                }
                                            >
                                                <Ionicons
                                                    name="person-remove-outline"
                                                    size={18}
                                                    color="#EF4444"
                                                />
                                                <Text style={styles.kickBtnText}>Kick</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <View style={styles.ownerBadge}>
                                                <Text style={styles.ownerBadgeText}>OWNER</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={48} color="#D9C9BC" />
                                <Text style={styles.emptyText}>No participants yet.</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            <Modal visible={showTimeModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Select Time Option</Text>

                        <TouchableOpacity
                            style={styles.inputLike}
                            onPress={() => {
                                setPickerMode("date");
                                setShowPicker(true);
                            }}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#95816f" />
                            <Text style={styles.dateText}>
                                {selectedDate.toLocaleString()}
                            </Text>
                        </TouchableOpacity>

                        {showPicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode={pickerMode}
                                is24Hour={true}
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

                        <View style={styles.durationRow}>
                            <Text style={styles.durationText}>
                                Duration: {duration / 60} h
                            </Text>

                            <View style={styles.durationButtons}>
                                <TouchableOpacity
                                    onPress={() =>
                                        duration > 30 && setDuration((prev) => prev - 30)
                                    }
                                    style={styles.smallBtn}
                                >
                                    <Ionicons
                                        name="remove-circle-outline"
                                        size={30}
                                        color="#EF4444"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setDuration((prev) => prev + 30)}
                                    style={styles.smallBtn}
                                >
                                    <Ionicons
                                        name="add-circle-outline"
                                        size={30}
                                        color="#10B981"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setShowTimeModal(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleAddTime}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showPlaceModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Add New Location</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Place Name"
                            placeholderTextColor="#b8a99c"
                            value={newPlace.name}
                            onChangeText={(text) =>
                                setNewPlace({ ...newPlace, name: text })
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Address"
                            placeholderTextColor="#b8a99c"
                            value={newPlace.address}
                            onChangeText={(text) =>
                                setNewPlace({ ...newPlace, address: text })
                            }
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setShowPlaceModal(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleAddPlace}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FDFCFB" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FDFCFB" },
    tabBar: {
        flexDirection: "row",
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderColor: "#F1E9E1"
    },
    tab: { flex: 1, paddingVertical: 15, alignItems: "center" },
    activeTab: { borderBottomWidth: 2, borderBottomColor: "#4b2c20" },
    tabText: { fontWeight: "700", color: "#95816f", fontSize: 14 },
    activeTabText: { color: "#4b2c20" },
    content: { padding: 20 },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "800",
        color: "#b8a99c",
        textTransform: "uppercase",
        letterSpacing: 1
    },
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#F3EAE3",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8
    },
    addBtnText: { color: "#4b2c20", fontWeight: "700", fontSize: 13 },
    editCard: {
        backgroundColor: "#FFF",
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1E9E1",
        justifyContent: "space-between"
    },
    mainInfo: { fontSize: 15, fontWeight: "600", color: "#2c1c14" },
    subInfo: { fontSize: 12, color: "#95816f", marginTop: 2 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(43, 26, 16, 0.6)",
        justifyContent: "center",
        padding: 25
    },
    modalContent: { backgroundColor: "#FFF", borderRadius: 16, padding: 20 },
    modalHeader: { fontSize: 18, fontWeight: "800", marginBottom: 15, color: "#2c1c14" },
    input: {
        backgroundColor: "#F8F3EE",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        color: "#2c1c14"
    },
    inputLike: {
        backgroundColor: "#F8F3EE",
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center"
    },
    dateText: { marginLeft: 10, fontSize: 16, color: "#2c1c14" },
    modalActions: { flexDirection: "row", gap: 10 },
    cancelBtn: {
        flex: 1,
        padding: 12,
        alignItems: "center",
        backgroundColor: "#F8F3EE",
        borderRadius: 8
    },
    cancelBtnText: { color: "#6b4f3f", fontWeight: "700" },
    saveBtn: {
        flex: 2,
        padding: 12,
        alignItems: "center",
        backgroundColor: "#4b2c20",
        borderRadius: 8
    },
    saveBtnText: { color: "#FFF", fontWeight: "700" },
    participantsContainer: { paddingBottom: 20 },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF",
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#F1E9E1"
    },
    userInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3EAE3",
        alignItems: "center",
        justifyContent: "center"
    },
    myAvatar: { backgroundColor: "#4b2c20" },
    avatarText: { color: "#4b2c20", fontWeight: "bold", fontSize: 16 },
    myAvatarText: { color: "#FFF" },
    username: { fontSize: 15, fontWeight: "600", color: "#2c1c14" },
    userRole: { fontSize: 12, color: "#95816f" },
    kickBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: "#FEF2F2"
    },
    kickBtnText: { color: "#EF4444", fontSize: 13, fontWeight: "700" },
    ownerBadge: {
        backgroundColor: "#F8F3EE",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    ownerBadgeText: { fontSize: 10, fontWeight: "800", color: "#95816f" },
    durationRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 15
    },
    durationText: { fontSize: 16, fontWeight: "700", color: "#2c1c14" },
    durationButtons: { flexDirection: "row", alignItems: "center" },
    smallBtn: { padding: 5, marginLeft: 10 },
    emptyState: { alignItems: "center", marginTop: 40 },
    emptyText: { color: "#b8a99c", fontSize: 16, marginTop: 10 }
});