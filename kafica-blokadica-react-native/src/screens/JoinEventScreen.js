import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import API from "../api/api";

export default function JoinEventScreen({ navigation }) {

    const [token, setToken] = useState("");
    const [eventPreview, setEventPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [joining, setJoining] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const clearInput = () => {
        setToken("");
    };

    // Fetch event preview
    const handlePreview = async () => {

        if (!token.trim()) {
            Alert.alert("Error", "Please enter a token first!");
            return;
        }

        setLoading(true);

        try {

            const response = await API.get(`/invites/${token}`);

            setEventPreview(response.data);
            setModalVisible(true);

        } catch (error) {

            Alert.alert(
                "Error",
                error.response?.data?.message ||
                "Invalid token. Please check and try again."
            );

        } finally {
            setLoading(false);
        }
    };

    // Join event
    const handleJoin = async () => {

        setJoining(true);

        try {

            await API.post(`/invites/${token}/join`);

            const eventId = eventPreview.eventID;

            clearInput();
            setModalVisible(false);

            Alert.alert(
                "Success",
                "You have successfully joined the event!",
                [
                    {
                        text: "Awesome",
                        onPress: () =>
                            navigation.navigate(
                                "EventDetails",
                                { eventId: eventId }
                            )
                    }
                ]
            );

        } catch (error) {

            const data = error?.response?.data;

            const errorMessage =
                data?.message ||
                data?.error ||
                "Failed to join the event.";

            Alert.alert("Error", errorMessage);

        } finally {
            setJoining(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* MAIN SCREEN */}
            <View style={styles.inputSection}>

                <View style={styles.mainIcon}>
                    <Ionicons
                        name="cafe-outline"
                        size={40}
                        color="#4b2c20"
                    />
                </View>

                <Text style={styles.mainTitle}>
                    Join an Event
                </Text>

                <Text style={styles.subtitle}>
                    Enter the invite token to see the event details
                </Text>

                {/* TOKEN INPUT */}
                <View style={styles.inputWrapper}>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter token..."
                        placeholderTextColor="#b8a99c"
                        value={token}
                        onChangeText={setToken}
                        autoCapitalize="characters"
                    />

                    {token.length > 0 && (
                        <TouchableOpacity
                            style={styles.trashIcon}
                            onPress={clearInput}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={22}
                                color="#EF4444"
                            />
                        </TouchableOpacity>
                    )}

                </View>

                {/* PREVIEW BUTTON */}
                <TouchableOpacity
                    style={[
                        styles.previewBtn,
                        !token && styles.disabledPreviewBtn
                    ]}
                    onPress={handlePreview}
                    disabled={loading || !token}
                >

                    {loading ? (

                        <ActivityIndicator color="#FFF" />

                    ) : (

                        <>
                            <Ionicons
                                name="eye-outline"
                                size={20}
                                color="#FFF"
                            />

                            <Text style={styles.btnText}>
                                Preview Event
                            </Text>
                        </>

                    )}

                </TouchableOpacity>

            </View>


            {/* EVENT PREVIEW MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.modalContent}>

                        {/* SMALL HANDLE */}
                        <View style={styles.modalHandle} />


                        {/* HEADER */}
                        <View style={styles.modalHeader}>

                            <View style={styles.headerTextContainer}>

                                <Text style={styles.modalLabel}>
                                    EVENT PREVIEW
                                </Text>

                                <Text style={styles.previewSubtitle}>
                                    Check the details before joining
                                </Text>

                            </View>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#4b2c20"
                                />
                            </TouchableOpacity>

                        </View>


                        {eventPreview && (
                            <>

                                {/* SCROLLABLE CONTENT */}
                                <ScrollView
                                    style={styles.previewScroll}
                                    contentContainerStyle={styles.previewScrollContent}
                                    showsVerticalScrollIndicator={false}
                                >

                                    {/* EVENT ICON */}
                                    <View style={styles.eventIcon}>

                                        <Ionicons
                                            name="cafe"
                                            size={32}
                                            color="#FFF"
                                        />

                                    </View>


                                    {/* EVENT TITLE */}
                                    <Text style={styles.eventTitle}>
                                        {eventPreview.title}
                                    </Text>


                                    {/* DESCRIPTION */}
                                    <Text style={styles.eventDesc}>

                                        {eventPreview.description ||
                                            "No description provided."}

                                    </Text>


                                    {/* EVENT INFO TITLE */}
                                    <Text style={styles.sectionTitle}>
                                        Event information
                                    </Text>


                                    {/* EVENT INFO BOX */}
                                    <View style={styles.infoBox}>

                                        {/* ORGANIZER */}
                                        <View style={styles.infoRow}>

                                            <View style={styles.infoIcon}>

                                                <Ionicons
                                                    name="person-outline"
                                                    size={21}
                                                    color="#4b2c20"
                                                />

                                            </View>

                                            <View style={styles.infoTextContainer}>

                                                <Text style={styles.infoSmallLabel}>
                                                    Organizer
                                                </Text>

                                                <Text style={styles.infoValue}>
                                                    {eventPreview.creator?.displayName ||
                                                        "Unknown"}
                                                </Text>

                                            </View>

                                        </View>


                                        <View style={styles.separator} />


                                        {/* DEADLINE */}
                                        <View style={styles.infoRow}>

                                            <View style={styles.infoIcon}>

                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={21}
                                                    color="#4b2c20"
                                                />

                                            </View>

                                            <View style={styles.infoTextContainer}>

                                                <Text style={styles.infoSmallLabel}>
                                                    Voting deadline
                                                </Text>

                                                <Text style={styles.infoValue}>

                                                    {new Date(
                                                        eventPreview.deadLine
                                                    ).toLocaleString()}

                                                </Text>

                                            </View>

                                        </View>


                                        <View style={styles.separator} />


                                        {/* STATUS */}
                                        <View style={styles.infoRow}>

                                            <View style={styles.infoIcon}>

                                                <Ionicons
                                                    name="shield-checkmark-outline"
                                                    size={21}
                                                    color="#4b2c20"
                                                />

                                            </View>

                                            <View style={styles.infoTextContainer}>

                                                <Text style={styles.infoSmallLabel}>
                                                    Status
                                                </Text>

                                                <View style={styles.statusContainer}>

                                                    <View
                                                        style={[
                                                            styles.statusDot,
                                                            eventPreview.status !== "OPEN" &&
                                                                styles.statusDotClosed
                                                        ]}
                                                    />

                                                    <Text style={styles.statusText}>
                                                        {eventPreview.status}
                                                    </Text>

                                                </View>

                                            </View>

                                        </View>

                                    </View>


                                    {/* INFO MESSAGE */}
                                    <View style={styles.joinInfo}>

                                        <Ionicons
                                            name="information-circle-outline"
                                            size={22}
                                            color="#6b4f3f"
                                        />

                                        <Text style={styles.joinInfoText}>
                                            After joining, you'll be able to vote
                                            on available times and locations.
                                        </Text>

                                    </View>

                                </ScrollView>


                                {/* BOTTOM BUTTONS */}
                                <View style={styles.buttonContainer}>

                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => setModalVisible(false)}
                                    >

                                        <Text style={styles.cancelText}>
                                            Cancel
                                        </Text>

                                    </TouchableOpacity>


                                    <TouchableOpacity
                                        style={[
                                            styles.joinBtn,
                                            eventPreview.status !== "OPEN" &&
                                                styles.disabledJoinBtn
                                        ]}
                                        onPress={handleJoin}
                                        disabled={
                                            joining ||
                                            eventPreview.status !== "OPEN"
                                        }
                                    >

                                        {joining ? (

                                            <ActivityIndicator color="#FFF" />

                                        ) : (

                                            <>
                                                <Ionicons
                                                    name="enter-outline"
                                                    size={20}
                                                    color="#FFF"
                                                />

                                                <Text style={styles.joinText}>
                                                    Join Event
                                                </Text>
                                            </>

                                        )}

                                    </TouchableOpacity>

                                </View>

                            </>
                        )}

                    </View>

                </View>

            </Modal>

        </SafeAreaView>
    );
}


const styles = StyleSheet.create({

    // ==============================
    // MAIN SCREEN
    // ==============================

    container: {
        flex: 1,
        backgroundColor: "#FDFCFB"
    },

    inputSection: {
        flex: 1,
        padding: 30,
        justifyContent: "center",
        alignItems: "center"
    },

    mainIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: "#F8F3EE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 22
    },

    mainTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2c1c14"
    },

    subtitle: {
        fontSize: 15,
        color: "#95816f",
        marginTop: 8,
        marginBottom: 35,
        textAlign: "center"
    },


    // ==============================
    // TOKEN INPUT
    // ==============================

    inputWrapper: {
        width: "100%",
        position: "relative",
        justifyContent: "center",
        marginBottom: 20
    },

    input: {
        width: "100%",
        height: 65,
        backgroundColor: "#FFF",
        borderRadius: 18,
        paddingLeft: 20,
        paddingRight: 55,
        fontSize: 18,
        borderWidth: 1.5,
        borderColor: "#EDE3DA",
        color: "#2c1c14"
    },

    trashIcon: {
        position: "absolute",
        right: 18,
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    },


    // ==============================
    // PREVIEW BUTTON
    // ==============================

    previewBtn: {
        width: "100%",
        height: 60,
        flexDirection: "row",
        gap: 9,
        backgroundColor: "#4b2c20",
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#4b2c20",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.2,
        shadowRadius: 5
    },

    disabledPreviewBtn: {
        opacity: 0.6
    },

    btnText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 17
    },


    // ==============================
    // MODAL
    // ==============================

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(43, 26, 16, 0.55)",
        justifyContent: "flex-end"
    },

    modalContent: {
        height: "94%",
        backgroundColor: "#FDFCFB",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 12,
        paddingHorizontal: 24,
        paddingBottom: 18
    },

    modalHandle: {
        width: 45,
        height: 5,
        backgroundColor: "#D9CEC5",
        borderRadius: 10,
        alignSelf: "center",
        marginBottom: 18
    },


    // ==============================
    // MODAL HEADER
    // ==============================

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#EDE3DA"
    },

    headerTextContainer: {
        flex: 1
    },

    modalLabel: {
        color: "#4b2c20",
        fontWeight: "800",
        fontSize: 13,
        letterSpacing: 1
    },

    previewSubtitle: {
        color: "#95816f",
        fontSize: 13,
        marginTop: 4
    },

    closeButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#F8F3EE",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 15
    },


    // ==============================
    // PREVIEW CONTENT
    // ==============================

    previewScroll: {
        flex: 1
    },

    previewScrollContent: {
        paddingTop: 28,
        paddingBottom: 30
    },

    eventIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: "#4b2c20",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20
    },

    eventTitle: {
        fontSize: 30,
        fontWeight: "800",
        color: "#2c1c14",
        lineHeight: 37
    },

    eventDesc: {
        fontSize: 16,
        color: "#6b4f3f",
        marginTop: 12,
        lineHeight: 24
    },


    // ==============================
    // EVENT INFO
    // ==============================

    sectionTitle: {
        fontSize: 13,
        fontWeight: "800",
        color: "#95816f",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginTop: 35,
        marginBottom: 12
    },

    infoBox: {
        backgroundColor: "#FFF",
        borderRadius: 22,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: "#EDE3DA"
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 18
    },

    infoIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#F8F3EE",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15
    },

    infoTextContainer: {
        flex: 1
    },

    infoSmallLabel: {
        fontSize: 12,
        color: "#95816f",
        marginBottom: 3
    },

    infoValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c1c14"
    },

    separator: {
        height: 1,
        backgroundColor: "#F1EAE4",
        marginLeft: 59
    },


    // ==============================
    // STATUS
    // ==============================

    statusContainer: {
        flexDirection: "row",
        alignItems: "center"
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#22C55E",
        marginRight: 7
    },

    statusDotClosed: {
        backgroundColor: "#EF4444"
    },

    statusText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#4b2c20"
    },


    // ==============================
    // JOIN INFO
    // ==============================

    joinInfo: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#F8F3EE",
        borderRadius: 18,
        padding: 16,
        marginTop: 20
    },

    joinInfoText: {
        flex: 1,
        color: "#6b4f3f",
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 10
    },


    // ==============================
    // BOTTOM BUTTONS
    // ==============================

    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        paddingTop: 18,
        borderTopWidth: 1,
        borderTopColor: "#EDE3DA"
    },

    cancelBtn: {
        flex: 1,
        height: 58,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 18,
        backgroundColor: "#F8F3EE"
    },

    joinBtn: {
        flex: 2,
        height: 58,
        flexDirection: "row",
        gap: 8,
        backgroundColor: "#4b2c20",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 18
    },

    disabledJoinBtn: {
        opacity: 0.5
    },

    cancelText: {
        color: "#95816f",
        fontWeight: "700",
        fontSize: 16
    },

    joinText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16
    }

});