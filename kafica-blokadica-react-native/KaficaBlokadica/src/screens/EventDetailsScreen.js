import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Client } from "@stomp/stompjs";
import * as Clipboard from "expo-clipboard";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef } from "react";


import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert, Dimensions, Modal, Platform,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View
} from "react-native";
import API from "../api/api";

const { width } = Dimensions.get("window");



const formatDateTime = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    return date.toLocaleString("sr-RS", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export default function EventDetailsScreen({ route, navigation }) {
    const { eventId } = route.params;
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);


    ///Vote
    const [votingVisible, setVotingVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // Before send
    const [selectedTimeVotes, setSelectedTimeVotes] = useState({});  /// { optionId: "YES" }
    const [selectedPlaceVotes, setSelectedPlaceVotes] = useState({}); // { optionId: "LIKE" }


    //// Manual Finalize    
    const [finalizeModeVisible, setFinalizeModeVisible] = useState(false);
    const [manualFinalizeVisible, setManualFinalizeVisible] = useState(false);
    const [selectedFinalTimeId, setSelectedFinalTimeId] = useState(null);
    const [selectedFinalPlaceId, setSelectedFinalPlaceId] = useState(null);
    const [finalizeOptionsVisible, setFinalizeOptionsVisible] = useState(false);
    const [finalizing, setFinalizing] = useState(false);



    //// Result
    const [resultVisible, setResultVisible] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [resultLoading, setResultLoading] = useState(false);



    const stompClientRef = useRef(null);


   useEffect(() => {
    let client;
    let subscription;
    let isMounted = true;

    const connectWs = async () => {
        const token = await SecureStore.getItemAsync("userToken");

        console.log("WS token exists:", !!token);
        console.log("WS eventId:", eventId);

        if (!token || !isMounted) {
            console.log("No token or screen unmounted, WS not connecting");
            return;
        }

        client = new Client({
            ///brokerURL: "ws://192.168.0.18:8181/ws",
            brokerURL: "wss://erodent-stentoriously-brenden.ngrok-free.dev/ws",

            connectHeaders: {
                Authorization: "Bearer " + token,
            },

            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,

            debug: function (str) {
                console.log("STOMP DEBUG:", str);
            },

            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            onConnect: function (frame) {
                console.log("CONNECTED OK");
                console.log("CONNECTED frame:", frame.headers);

                const topic = `/topic/events/${eventId}`;
                console.log("Subscribing to:", topic);

                subscription = client.subscribe(topic, function (message) {
                    console.log("WS received:", message.body);
                    fetchEventDetails();
                });

                console.log("Subscribed to:", topic);
            },

            onStompError: function (frame) {
                console.log("STOMP ERROR:", frame.headers["message"]);
                console.log("STOMP ERROR body:", frame.body);
            },

            onWebSocketError: function (error) {
                console.log("WS ERROR:", error);
            },

            onWebSocketClose: function (event) {
                console.log("WS CLOSED:", event);
            },
        });

        stompClientRef.current = client;

        console.log("Activating WS client...");
        client.activate();
    };

    connectWs();

    return () => {
        isMounted = false;

        if (subscription) {
            console.log("Unsubscribing...");
            subscription.unsubscribe();
        }

        if (client) {
            console.log("Deactivating WS client...");
            client.deactivate();
        }

        stompClientRef.current = null;
    };
}, [eventId]);

    const fetchEventDetails = async () => {
        try {
            const response = await API.get(`/events/${eventId}/view`);
            setEventData(response.data);
            console.log(response.data)
        } catch (error) {
            Alert.alert("Error", "Failed to load event details.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEventDetails();
        }, [eventId])
    );

    const copyToken = async (token) => {
        await Clipboard.setStringAsync(token);
        if (Platform.OS === "android") {
            ToastAndroid.show("Token copied!", ToastAndroid.SHORT);
        } else {
            Alert.alert("Copied", "Invite token copied to clipboard!");
        }
    };


    const fetchEventResult = async () => {

        try {
            setResultLoading(true);

            const response = await API.get(`/events/${eventId}/result`);
            setResultData(response.data);
            setResultVisible(true);

        }
        catch (error) {

            Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to load event result"
            );

        }
        finally {

            setResultLoading(false);

        }



    }

    const confirmFinalizeEvent = () => {
        Alert.alert(
            "Finalize Event",
            "Are you sure you want to finalize this event? After finalization, changes may no longer be possible.",
            [{
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "OK",
                style: "destructive",
                onPress: handleFinalizeEvent

            }

            ]
        )
    }

    const handleFinalizeEvent = async () => {

        try {
            await API.post(`/events/${eventId}/finalize`);

            Alert.alert("Success", "Event Finalized", [
                {
                    text: "OK",
                    onPress: () => fetchEventDetails()
                }
            ]);
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Error during finalization");
        }
    }

    const handleFinalizeManualEvent = async () => {
        if (!selectedFinalTimeId || !selectedFinalPlaceId) {
            Alert.alert(
                "Missing selection",
                "Please choose both a final time and a final place."
            );
            return;
        }

        const selectedTime = voteState.timeOptions.find(
            (opt) => opt.timeOptionId === selectedFinalTimeId
        );

        const selectedPlace = voteState.placeOptions.find(
            (opt) => opt.placeOptionId === selectedFinalPlaceId
        );

        Alert.alert(
            "Confirm Manual Finalization",
            `Finalize event with:\n\nTime: ${formatDateTime(selectedTime?.startsAt)}\nPlace: ${selectedPlace?.name}`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "OK",
                    style: "destructive",
                    onPress: async () => {
                        const payload = {
                            timeOptionId: selectedFinalTimeId,
                            placeOptionId: selectedFinalPlaceId
                        };

                        try {
                            setFinalizing(true);

                            await API.post(`/events/${eventId}/finalize/manual`, payload);

                            setManualFinalizeVisible(false);

                            Alert.alert("Success", "Event finalized manually", [
                                {
                                    text: "OK",
                                    onPress: () => fetchEventDetails()
                                }
                            ]);
                        } catch (error) {
                            Alert.alert(
                                "Error",
                                error.response?.data?.message || "Error during manual finalization"
                            );
                        } finally {
                            setFinalizing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleLeaveEvent = () => {
    Alert.alert(
        "Leave event",
        "Are you sure you want to leave this event?",
        [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Leave",
                style: "destructive",
                onPress: async () => {
                    try {

                        
                        if (stompClientRef.current) {
                            console.log("Deactivating WS before leaving event...");

                            await stompClientRef.current.deactivate();
                            stompClientRef.current = null;
                        }

                       
                        await API.delete(`/events/${eventId}/leave`);

                        
                        navigation.replace("Home");

                    } catch (error) {

                        console.log(
                            "Leave error:",
                            error?.response?.data || error
                        );

                        Alert.alert(
                            "Error",
                            error?.response?.data?.message ||
                            "Error during leaving event"
                        );
                    }
                }
            }
        ]
    );
};
    const handleSubmitVotes = async () => {
        const payload = {
            timeVotes: Object.entries(selectedTimeVotes).map(([id, vote]) => ({
                timeOptionId: parseInt(id),
                vote: vote
            })),
            placeVotes: Object.entries(selectedPlaceVotes).map(([id, vote]) => ({
                placeOptionId: parseInt(id),
                vote: vote
            }))
        };

        try {
            setSubmitting(true)
            await API.post(`/events/${eventId}/votes`, payload);
            Alert.alert("Success", "Your vote has been recorded!");
            setVotingVisible(false);
            fetchEventDetails(); /// Refresh

            console.log(payload);
        }
        catch (error) {
            console.log("Vote error:", error?.response?.data || error);

            const data = error?.response?.data;

            const errorMessage =
                data?.message ||
                data?.error ||
                (typeof data === "string" ? data : null) ||
                error?.message ||
                "Error during vote";

            Alert.alert("Error", errorMessage);
        }
        finally {
            setSubmitting(false);
        }
    }




    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4b2c20" />
            </View>
        );
    }

    const { eventResponse, participants, voteState, viewer } = eventData;

    const isEventOpen = eventResponse?.status === "OPEN";
    const isEventFinalized = eventResponse?.status === "FINALIZED";

    return (



        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.flatHeader}>
                <Text style={styles.title}>{eventResponse.title}</Text>
                <Text style={styles.description}>{eventResponse.description}</Text>

                <View style={styles.headerFooter}>
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    eventResponse.status === "CANCELLED"
                                        ? "#FEE2E2"
                                        : "#DCFCE7"
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color:
                                        eventResponse.status === "CANCELLED"
                                            ? "#B91C1C"
                                            : "#15803D"
                                }
                            ]}
                        >
                            {eventResponse.status}
                        </Text>
                    </View>

                    <Text style={styles.deadline}>
                        Ends: {new Date(eventResponse.deadline).toLocaleDateString()}
                    </Text>
                </View>
            </View>



            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>PROPOSED TIMES</Text>

                    <View style={styles.swipeHint}>
                        <Ionicons name="chevron-back" size={14} color="#b8a99c" />
                        <Text style={styles.swipeHintText}>Swipe</Text>
                        <Ionicons name="chevron-forward" size={14} color="#b8a99c" />
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                >
                    {voteState.timeOptions.map((opt) => {
                        const yes = opt.votes.filter(
                            (v) => v.vote === "YES" || v.vote === true
                        );
                        const no = opt.votes.filter(
                            (v) => v.vote === "NO" || v.vote === false
                        );

                        return (
                            <View key={opt.timeOptionId} style={styles.horizontalCard}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.mainInfo}>
                                        {formatDateTime(opt.startsAt)}
                                    </Text>

                                    <View style={styles.badgeRow}>
                                        <Text style={styles.yesBadge}>✓ {yes.length}</Text>
                                        <Text style={styles.noBadge}>✕ {no.length}</Text>
                                    </View>
                                </View>

                                <View style={styles.voterDetails}>
                                    {yes.length > 0 && (
                                        <Text style={styles.voterText} numberOfLines={2}>
                                            <Text style={styles.boldIn}>In: </Text>
                                            {yes.map((v) => v.displayName).join(", ")}
                                        </Text>
                                    )}

                                    {no.length > 0 && (
                                        <Text style={styles.voterText} numberOfLines={2}>
                                            <Text style={styles.boldOut}>Not in: </Text>
                                            {no.map((v) => v.displayName).join(", ")}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>PROPOSED LOCATIONS</Text>

                    <View style={styles.swipeHint}>
                        <Ionicons name="chevron-back" size={14} color="#b8a99c" />
                        <Text style={styles.swipeHintText}>Swipe</Text>
                        <Ionicons name="chevron-forward" size={14} color="#b8a99c" />
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                >
                    {voteState.placeOptions.map((opt) => {
                        const likes = opt.votes.filter(
                            (v) => v.vote === "LIKE" || v.vote === true
                        );
                        const dislikes = opt.votes.filter(
                            (v) => v.vote === "DISLIKE" || v.vote === false
                        );

                        return (
                            <View key={opt.placeOptionId} style={styles.horizontalCard}>
                                <View style={styles.cardHeader}>
                                    <View style={{ flex: 1, paddingRight: 8 }}>
                                        <Text style={styles.mainInfo} numberOfLines={1}>
                                            {opt.name}
                                        </Text>
                                        <Text style={styles.subInfo} numberOfLines={2}>
                                            {opt.address}
                                        </Text>
                                    </View>

                                    <View style={styles.badgeRow}>
                                        <Text style={styles.yesBadge}>👍 {likes.length}</Text>
                                        <Text style={styles.noBadge}>👎 {dislikes.length}</Text>
                                    </View>
                                </View>

                                <View style={styles.voterDetails}>
                                    {likes.length > 0 && (
                                        <Text style={styles.voterText} numberOfLines={2}>
                                            <Text style={styles.boldLike}>Likes: </Text>
                                            {likes.map((v) => v.displayName).join(", ")}
                                        </Text>
                                    )}

                                    {dislikes.length > 0 && (
                                        <Text style={styles.voterText} numberOfLines={2}>
                                            <Text style={styles.boldDislike}>Dislike: </Text>
                                            {dislikes.map((v) => v.displayName).join(", ")}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={styles.footerStats}>
                <Text style={styles.statsTitle}>
                    {participants?.respondedParticipant} / {participants?.totalParticipants} Responded
                </Text>

                {participants?.watingFor?.length > 0 && (
                    <Text style={styles.waitingText}>
                        Waiting for: {participants.watingFor
                            .map((u) => u.displayName)
                            .join(", ")}
                    </Text>
                )}
            </View>



            {isEventOpen && (
                <>
                    {viewer?.isCreator ? (
                        <View style={styles.adminPanel}>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() =>
                                    navigation.navigate("ManageEvent", {
                                        eventId: eventId,
                                        eventData: eventData
                                    })
                                }
                            >
                                <Ionicons name="pencil-sharp" size={16} color="#FFF" />
                                <Text style={styles.btnText}>Edit Event</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.copyBtn}
                                onPress={() => copyToken(eventResponse.inviteToken)}
                            >
                                <Ionicons name="copy-outline" size={16} color="#6b4f3f" />
                                <Text style={[styles.btnText, { color: "#6b4f3f" }]}>
                                    Copy Token
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.copyBtn}
                                onPress={() => setFinalizeOptionsVisible(true)}
                            >
                                <Ionicons name="checkbox-outline" size={16} color="#6b4f3f" />
                                <Text style={[styles.btnText, { color: "#6b4f3f" }]}>
                                    Finalize
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.leavePanel}>
                            <TouchableOpacity
                                style={styles.leaveBtn}
                                onPress={handleLeaveEvent}
                            >
                                <Ionicons name="exit-outline" size={16} color="#EF4444" />
                                <Text style={styles.leaveBtnText}>Leave Event</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.mainVoteBtn}
                        onPress={() => setVotingVisible(true)}
                    >
                        <Ionicons name="save-outline" size={20} color="#FFF" />
                        <Text style={styles.mainVoteBtnText}>Vote Now</Text>
                    </TouchableOpacity>


                </>
            )}



            {isEventFinalized && (
                <TouchableOpacity
                    style={styles.viewResultBtn}
                    onPress={fetchEventResult}
                    disabled={resultLoading}
                >
                    {resultLoading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="trophy-outline" size={20} color="#FFF" />
                            <Text style={styles.viewResultBtnText}>View Result</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}




            <View style={{ height: 40 }} />

            <Modal
                visible={votingVisible && isEventOpen}
                animationType="slide"
                onRequestClose={() => setVotingVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Cast Your Vote</Text>
                        <TouchableOpacity onPress={() => setVotingVisible(false)}>
                            <Ionicons name="close" size={28} color="#2c1c14" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ padding: 20 }}>
                        <Text style={styles.voteSectionTitle}>Select Time</Text>
                        {voteState.timeOptions.map((opt) => (
                            <View key={opt.timeOptionId} style={styles.voteCard}>
                                <Text>{formatDateTime(opt.startsAt)}</Text>
                                <View style={styles.voteActionRow}>
                                    <TouchableOpacity
                                        style={[styles.smallBtn, selectedTimeVotes[opt.timeOptionId] === 'YES' && styles.btnYesActive]}
                                        onPress={() => setSelectedTimeVotes({ ...selectedTimeVotes, [opt.timeOptionId]: 'YES' })}
                                    >
                                        <Text>YES</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.smallBtn, selectedTimeVotes[opt.timeOptionId] === 'NO' && styles.btnNoActive]}
                                        onPress={() => setSelectedTimeVotes({ ...selectedTimeVotes, [opt.timeOptionId]: 'NO' })}
                                    >
                                        <Text>NO</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        <Text style={[styles.voteSectionTitle, { marginTop: 20 }]}>Select Place</Text>
                        {voteState.placeOptions.map((opt) => (
                            <View key={opt.placeOptionId} style={styles.voteCard}>
                                <Text>{opt.name}</Text>
                                <View style={styles.voteActionRow}>
                                    <TouchableOpacity
                                        style={[styles.smallBtn, selectedPlaceVotes[opt.placeOptionId] === 'LIKE' && styles.btnLikeActive]}
                                        onPress={() => setSelectedPlaceVotes({ ...selectedPlaceVotes, [opt.placeOptionId]: 'LIKE' })}
                                    >
                                        <Ionicons name="thumbs-up" size={18} color={selectedPlaceVotes[opt.placeOptionId] === 'LIKE' ? "#FFF" : "#95816f"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.smallBtn, selectedPlaceVotes[opt.placeOptionId] === 'DISLIKE' && styles.btnDislikeActive]}
                                        onPress={() => setSelectedPlaceVotes({ ...selectedPlaceVotes, [opt.placeOptionId]: 'DISLIKE' })}
                                    >
                                        <Ionicons name="thumbs-down" size={18} color={selectedPlaceVotes[opt.placeOptionId] === 'DISLIKE' ? "#FFF" : "#95816f"} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleSubmitVotes}
                            disabled={submitting}
                        >
                            {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Submit All Votes</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={finalizeOptionsVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setFinalizeOptionsVisible(false)}
            >
                <View style={styles.finalizeOverlay}>
                    <View style={styles.finalizeBox}>
                        <Text style={styles.finalizeTitle}>Finalize Event</Text>

                        <TouchableOpacity
                            style={styles.finalizeOptionBtn}
                            onPress={() => {
                                setFinalizeOptionsVisible(false);
                                confirmFinalizeEvent();
                            }}
                        >
                            <Text style={styles.finalizeOptionText}>Auto finalize</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.finalizeOptionBtn}
                            onPress={() => {
                                setFinalizeOptionsVisible(false);
                                setManualFinalizeVisible(true);
                            }}
                        >
                            <Text style={styles.finalizeOptionText}>Manual finalize</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.finalizeCancelBtn}
                            onPress={() => setFinalizeOptionsVisible(false)}
                        >
                            <Text style={styles.finalizeCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={resultVisible}
                animationType="slide"
                onRequestClose={() => setResultVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Event Result</Text>

                        <TouchableOpacity onPress={() => setResultVisible(false)}>
                            <Ionicons name="close" size={28} color="#2c1c14" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ padding: 20 }}>
                        {resultData && (
                            <>
                                <View style={styles.resultHeaderCard}>
                                    <Text style={styles.resultTitle}>{resultData.title}</Text>

                                    <Text style={styles.resultDescription}>
                                        {resultData.description}
                                    </Text>

                                    <Text style={styles.resultMeta}>
                                        Created by: {resultData.creatorName}
                                    </Text>

                                    <Text style={styles.resultMeta}>
                                        Finalized at: {formatDateTime(resultData.finalizedAt)}
                                    </Text>

                                    <Text style={styles.resultMeta}>
                                        Method: {resultData.finalizionMethod}
                                    </Text>
                                </View>

                                <View style={styles.resultCard}>
                                    <Text style={styles.resultSectionTitle}>Selected Time</Text>

                                    <Text style={styles.resultMainText}>
                                        {formatDateTime(resultData.selectedTime?.startsAt)}
                                    </Text>

                                    <Text style={styles.resultSubText}>
                                        Ends: {formatDateTime(resultData.selectedTime?.endsAt)}
                                    </Text>
                                </View>

                                <View style={styles.resultCard}>
                                    <Text style={styles.resultSectionTitle}>Selected Place</Text>

                                    <Text style={styles.resultMainText}>
                                        {resultData.selectedPlace?.name}
                                    </Text>

                                    <Text style={styles.resultSubText}>
                                        {resultData.selectedPlace?.address}
                                    </Text>
                                </View>
                            </>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </Modal>


            <Modal
                visible={manualFinalizeVisible}
                animationType="slide"
                onRequestClose={() => setManualFinalizeVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Manual Finalization</Text>

                        <TouchableOpacity onPress={() => setManualFinalizeVisible(false)}>
                            <Ionicons name="close" size={28} color="#2c1c14" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ padding: 20 }}>
                        <Text style={styles.voteSectionTitle}>Choose Final Time</Text>

                        {voteState.timeOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt.timeOptionId}
                                style={[
                                    styles.voteCard,
                                    selectedFinalTimeId === opt.timeOptionId && styles.selectedFinalCard
                                ]}
                                onPress={() => setSelectedFinalTimeId(opt.timeOptionId)}
                            >
                                <Text>{formatDateTime(opt.startsAt)}</Text>
                            </TouchableOpacity>
                        ))}

                        <Text style={[styles.voteSectionTitle, { marginTop: 20 }]}>
                            Choose Final Place
                        </Text>

                        {voteState.placeOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt.placeOptionId}
                                style={[
                                    styles.voteCard,
                                    selectedFinalPlaceId === opt.placeOptionId && styles.selectedFinalCard
                                ]}
                                onPress={() => setSelectedFinalPlaceId(opt.placeOptionId)}
                            >
                                <Text>{opt.name}</Text>
                                <Text>{opt.address}</Text>
                            </TouchableOpacity>
                        ))}

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleFinalizeManualEvent}
                            disabled={finalizing}
                        >
                            {finalizing ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>Confirm Manual Finalization</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </ScrollView>




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

    flatHeader: {
        backgroundColor: "#FFF",
        padding: 20,
        borderBottomWidth: 1,
        borderColor: "#F1E9E1"
    },

    title: {
        fontSize: 24,
        fontWeight: "900",
        color: "#2c1c14",
        letterSpacing: -0.5
    },

    description: {
        fontSize: 15,
        color: "#6b4f3f",
        marginTop: 6,
        lineHeight: 20
    },

    headerFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 18
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4
    },

    statusText: {
        fontSize: 12,
        fontWeight: "800",
        textTransform: "uppercase"
    },

    deadline: {
        fontSize: 12,
        color: "#b8a99c",
        fontWeight: "700"
    },

    footerStats: {
        margin: 20,
        backgroundColor: "#3d2418",
        padding: 20,
        borderRadius: 12
    },

    statsTitle: {
        color: "#FFF",
        fontWeight: "800",
        fontSize: 16
    },

    waitingText: {
        color: "#d9c9bc",
        fontSize: 13,
        marginTop: 6,
        fontStyle: "italic"
    },

    section: {
        paddingTop: 15,
        paddingBottom: 5
    },

    sectionLabel: {
        fontSize: 12,
        fontWeight: "800",
        color: "#b8a99c",
        letterSpacing: 1,
    },

    horizontalList: {
        paddingHorizontal: 20,
        gap: 12
    },

    horizontalCard: {
        width: width * 0.91,
        backgroundColor: "#FFF",
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#F1E9E1",
        borderBottomWidth: 3,
        borderBottomColor: "#EDE3DA"
    },

    card: {
        backgroundColor: "#FFF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderBottomWidth: 3,
        borderBottomColor: "#F1E9E1"
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start"
    },

    mainInfo: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
        color: "#2c1c14",
        paddingRight: 8
    },

    subInfo: {
        fontSize: 13,
        color: "#95816f",
        marginTop: 2,
        lineHeight: 18
    },

    badgeRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center"
    },

    yesBadge: {
        color: "#16A34A",
        fontWeight: "800",
        fontSize: 14
    },

    noBadge: {
        color: "#EF4444",
        fontWeight: "800",
        fontSize: 14
    },

    voterDetails: {
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#F8F3EE"
    },
    sectionHeader: {
        marginHorizontal: 20,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    swipeHint: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F3EE",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        gap: 2,
    },

    swipeHintText: {
        fontSize: 11,
        color: "#b8a99c",
        fontWeight: "700",
    },
    voterText: {
        fontSize: 13,
        color: "#6b4f3f",
        marginBottom: 3,
        lineHeight: 18
    },

    boldIn: {
        color: "#16A34A",
        fontWeight: "700"
    },

    boldOut: {
        color: "#EF4444",
        fontWeight: "700"
    },

    boldLike: {
        color: "#4b2c20",
        fontWeight: "700"
    },

    boldDislike: {
        color: "#95816f",
        fontWeight: "700"
    },

    adminPanel: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        padding: 20,
        paddingBottom: 0
    },

    editBtn: {
        flexGrow: 1,
        flexBasis: "30%",
        backgroundColor: "#4b2c20",
        flexDirection: "row",
        padding: 12,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        gap: 6
    },

    copyBtn: {
        flexGrow: 1,
        flexBasis: "30%",
        backgroundColor: "#F8F3EE",
        flexDirection: "row",
        padding: 12,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: "#EDE3DA"
    },

    btnText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 14
    },

    leavePanel: {
        padding: 20,
        paddingBottom: 0
    },

    leaveBtn: {
        width: "100%",
        backgroundColor: "#FEF2F2",
        flexDirection: "row",
        padding: 12,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: "#FECACA"
    },

    leaveBtnText: {
        color: "#EF4444",
        fontWeight: "700",
        fontSize: 14
    },

    mainVoteBtn: {
        backgroundColor: "#4b2c20",
        margin: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4
    },

    mainVoteBtnText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 8
    },

    modalContainer: {
        flex: 1,
        backgroundColor: "#FDFCFB"
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderColor: "#F1E9E1"
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2c1c14"
    },

    voteSectionTitle: {
        fontSize: 14,
        color: "#95816f",
        fontWeight: "bold",
        marginBottom: 10
    },

    voteCard: {
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1E9E1"
    },

    voteActionRow: {
        flexDirection: "row",
        gap: 10
    },

    smallBtn: {
        padding: 8,
        borderWidth: 1,
        borderColor: "#EDE3DA",
        borderRadius: 6,
        minWidth: 50,
        alignItems: "center"
    },

    btnYesActive: {
        backgroundColor: "#DCFCE7",
        borderColor: "#22C55E"
    },

    btnNoActive: {
        backgroundColor: "#FEE2E2",
        borderColor: "#EF4444"
    },

    btnLikeActive: {
        backgroundColor: "#4b2c20",
        borderColor: "#4b2c20"
    },

    btnDislikeActive: {
        backgroundColor: "#EF4444",
        borderColor: "#EF4444"
    },

    modalFooter: {
        padding: 20,
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderColor: "#F1E9E1"
    },

    submitBtn: {
        backgroundColor: "#10B981",
        padding: 16,
        borderRadius: 12,
        alignItems: "center"
    },

    submitBtnText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16
    },
    selectedFinalCard: {
        borderColor: "#4b2c20",
        borderWidth: 2,
        backgroundColor: "#F3EAE3"
    },
    finalizeOverlay: {
        flex: 1,
        backgroundColor: "rgba(43, 26, 16, 0.45)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },

    finalizeBox: {
        width: "100%",
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#F1E9E1"
    },

    finalizeTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#2c1c14",
        marginBottom: 16,
        textAlign: "center"
    },

    finalizeOptionBtn: {
        backgroundColor: "#F8F3EE",
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EDE3DA"
    },

    finalizeOptionText: {
        color: "#6b4f3f",
        fontWeight: "800",
        fontSize: 15
    },

    finalizeCancelBtn: {
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 4
    },

    finalizeCancelText: {
        color: "#EF4444",
        fontWeight: "800",
        fontSize: 15
    },

    viewResultBtn: {
        backgroundColor: "#4b2c20",
        margin: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        gap: 8
    },

    viewResultBtnText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16
    },

    resultHeaderCard: {
        backgroundColor: "#FFF",
        padding: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#F1E9E1",
        marginBottom: 14
    },

    resultTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: "#2c1c14",
        marginBottom: 6
    },

    resultDescription: {
        fontSize: 15,
        color: "#6b4f3f",
        lineHeight: 20,
        marginBottom: 12
    },

    resultMeta: {
        fontSize: 13,
        color: "#95816f",
        marginTop: 4,
        fontWeight: "600"
    },

    resultCard: {
        backgroundColor: "#FFF",
        padding: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#F1E9E1",
        marginBottom: 14
    },

    resultSectionTitle: {
        fontSize: 12,
        fontWeight: "900",
        color: "#b8a99c",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 8
    },

    resultMainText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#2c1c14"
    },

    resultSubText: {
        fontSize: 14,
        color: "#95816f",
        marginTop: 6
    }

});