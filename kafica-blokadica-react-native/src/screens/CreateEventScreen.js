import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import API from "../api/api";

export default function CreateEventScreen({ navigation }) {
    const [step, setStep] = useState(1);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [tempPlaceName, setTempPlaceName] = useState("");
    const [tempPlaceAddress, setTempPlaceAddress] = useState("");
    const [placeOptions, setPlaceOptions] = useState([]);

    const [deadline, setDeadline] = useState(new Date());
    const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

    const [date, setDate] = useState(new Date());
    const [duration, setDuration] = useState(60);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState("date");
    const [timeOptions, setTimeOptions] = useState([]);

    const increaseDuration = () => {
        setDuration(prev => prev + 60);
    };

    const decreaseDuration = () => {
        if (duration > 30) {
            setDuration(prev => prev - 30);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setTempPlaceName("");
        setTempPlaceAddress("");
        setTimeOptions([]);
        setPlaceOptions([]);
        setDate(new Date());
        setDeadline(new Date());
        setDuration(60);
        setStep(1);
        setShowPicker(false);
        setShowDeadlinePicker(false);
        setPickerMode("date");
    };

    const onDateChange = (event, selectedDate) => {
        if (event.type === "dismissed") {
            setShowPicker(false);
            setPickerMode("date");
            return;
        }

        if (selectedDate) {
            const currentDate = selectedDate;

            if (Platform.OS === "android" && pickerMode === "date") {
                setPickerMode("time");
                setDate(currentDate);
                setShowPicker(false);
                setTimeout(() => setShowPicker(true), 0);
            } else {
                setShowPicker(false);
                setPickerMode("date");
                setDate(currentDate);
            }
        }
    };

    const onDeadLineChange = (event, selectedDeadlineDate) => {
        if (event.type === "dismissed") {
            setShowDeadlinePicker(false);
            setPickerMode("date");
            return;
        }

        if (selectedDeadlineDate) {
            const currentDate = selectedDeadlineDate;

            if (Platform.OS === "android" && pickerMode === "date") {
                setPickerMode("time");
                setDeadline(currentDate);
                setShowDeadlinePicker(false);
                setTimeout(() => setShowDeadlinePicker(true), 0);
            } else {
                setShowDeadlinePicker(false);
                setPickerMode("date");
                setDeadline(currentDate);
            }
        }
    };

    const addPlace = () => {
        if (!tempPlaceName || !tempPlaceAddress) {
            Alert.alert("Required Fields", "Please enter both place name and address.");
            return;
        }

        const newPlace = {
            name: tempPlaceName,
            address: tempPlaceAddress,
            lat: 0,
            lng: 0
        };

        setPlaceOptions([...placeOptions, newPlace]);
        setTempPlaceName("");
        setTempPlaceAddress("");
    };

    const removePlace = (indexToRemove) => {
        const filteredPlaces = placeOptions.filter((_, index) => index !== indexToRemove);
        setPlaceOptions(filteredPlaces);
    };

    const removeTime = (indexToRemove) => {
        const filteredTime = timeOptions.filter((_, index) => index !== indexToRemove);
        setTimeOptions(filteredTime);
    };

    const addTime = () => {
        const startTime = date.getTime();
        const durationInMs = duration * 60 * 1000;
        const endTime = startTime + durationInMs;

        const newTime = {
            startsAt: new Date(startTime).toISOString(),
            endsAt: new Date(endTime).toISOString()
        };

        setTimeOptions([...timeOptions, newTime]);
        setDuration(60);
        Alert.alert("Success", `Time option added to the list. Duration: ${duration / 60}h`);
    };

    const submitEvent = async () => {
        if (!title || placeOptions.length === 0 || timeOptions.length === 0) {
            Alert.alert("Error", "Please provide a title, at least one location, and one time option.");
            return;
        }

        const finalData = {
            title,
            description,
            deadline: deadline.toISOString(),
            timeOptions,
            placeOptions
        };

        try {
            await API.post("/events", finalData);
            Alert.alert(
                "Success",
                "Event created successfully!",
                [
                    {
                        text: "OK",
                        onPress: resetForm
                    }
                ]
            );
        } catch (error) {
            console.log("API Error:", error.response?.data);
            Alert.alert(
                "Failed",
                "Could not create event. Error: " + (error.response?.data?.message || "Unknown error")
            );
        }
    };

    const nextStep = () => {
        if (step === 1 && !title.trim()) {
            Alert.alert("Error", "Please enter event title.");
            return;
        }

        if (step === 2 && placeOptions.length === 0) {
            Alert.alert("Error", "Please add at least one location.");
            return;
        }

        if (step === 3 && timeOptions.length === 0) {
            Alert.alert("Error", "Please add at least one time option.");
            return;
        }

        if (step < 4) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleClear = () => {
        Alert.alert(
            "Reset?",
            "Clear form and return?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", style: "destructive", onPress: resetForm }
            ]
        );
    };

    const renderStepContent = () => {
        if (step === 1) {
            return (
                <>
                    <Text style={styles.sectionTitle}>General Info</Text>

                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Event Title (e.g. Weekly Meeting)"
                        placeholderTextColor="#b8a99c"
                    />

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        placeholder="Short description..."
                        placeholderTextColor="#b8a99c"
                    />
                </>
            );
        }

        if (step === 2) {
            return (
                <>
                    <Text style={styles.sectionTitle}>1. Location Options</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Place Name"
                        placeholderTextColor="#b8a99c"
                        value={tempPlaceName}
                        onChangeText={setTempPlaceName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Full Address"
                        placeholderTextColor="#b8a99c"
                        value={tempPlaceAddress}
                        onChangeText={setTempPlaceAddress}
                    />

                    <TouchableOpacity style={styles.actionBtnGreen} onPress={addPlace}>
                        <Text style={styles.actionBtnText}>Add This Location</Text>
                    </TouchableOpacity>

                    {placeOptions.map((p, i) => (
                        <TouchableOpacity key={i} onPress={() => removePlace(i)}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>📍 {p.name} ({p.address})</Text>
                                <Text style={styles.removeHint}>Tap to remove</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </>
            );
        }

        if (step === 3) {
            return (
                <>
                    <Text style={styles.sectionTitle}>2. Time Options</Text>

                    <TouchableOpacity
                        style={styles.dateBtn}
                        onPress={() => {
                            setPickerMode("date");
                            setShowPicker(true);
                        }}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#4b2c20" />
                        <Text style={styles.dateBtnText}>{date.toLocaleString()}</Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={date}
                            mode={pickerMode}
                            is24Hour={true}
                            display="default"
                            onChange={onDateChange}
                        />
                    )}

                    <View style={styles.durationRow}>
                        <Text style={styles.durationText}>Duration: {duration / 60} h</Text>

                        <View style={styles.durationButtons}>
                            <TouchableOpacity onPress={decreaseDuration} style={styles.smallBtn}>
                                <Ionicons name="remove-circle-outline" size={30} color="#EF4444" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={increaseDuration} style={styles.smallBtn}>
                                <Ionicons name="add-circle-outline" size={30} color="#4CAF50" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.actionBtnOrange} onPress={addTime}>
                        <Text style={styles.actionBtnText}>Add This Time Slot</Text>
                    </TouchableOpacity>

                    {timeOptions.map((t, i) => (
                        <TouchableOpacity key={i} onPress={() => removeTime(i)}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    ⏰ {new Date(t.startsAt).toLocaleString()}
                                </Text>
                                <Text style={styles.removeHint}>Tap to remove</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </>
            );
        }

        if (step === 4) {
            return (
                <>
                    <Text style={styles.sectionTitle}>3. Deadline</Text>

                    <TouchableOpacity
                        style={styles.dateBtn}
                        onPress={() => {
                            setPickerMode("date");
                            setShowDeadlinePicker(true);
                        }}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#4b2c20" />
                        <Text style={styles.dateBtnText}>{deadline.toLocaleString()}</Text>
                    </TouchableOpacity>

                    {showDeadlinePicker && (
                        <DateTimePicker
                            value={deadline}
                            mode={pickerMode}
                            is24Hour={true}
                            display="default"
                            onChange={onDeadLineChange}
                        />
                    )}

                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryTitle}>Summary</Text>
                        <Text style={styles.summaryText}>Title: {title || "-"}</Text>
                        <Text style={styles.summaryText}>Description: {description || "-"}</Text>
                        <Text style={styles.summaryText}>Locations: {placeOptions.length}</Text>
                        <Text style={styles.summaryText}>Time options: {timeOptions.length}</Text>
                        <Text style={styles.summaryText}>Deadline: {deadline.toLocaleString()}</Text>
                    </View>
                </>
            );
        }

        return null;
    };

    return (
        <View style={styles.screen}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.stepText}>Step {step} / 4</Text>

                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
                </View>

                {renderStepContent()}
            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                    <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>

                {step > 1 ? (
                    <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
                        <Text style={styles.backBtnText}>Back</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backBtnPlaceholder} />
                )}

                {step < 4 ? (
                    <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
                        <Text style={styles.nextBtnText}>Next</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.mainBtn} onPress={submitEvent}>
                        <Text style={styles.mainBtnText}>Create</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FDFCFB"
    },
    container: {
        flex: 1,
        backgroundColor: "#FDFCFB"
    },
    content: {
        padding: 20,
        paddingBottom: 130
    },
    stepText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        color: "#95816f",
        marginBottom: 10
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: "#F1E9E1",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 25
    },
    progressBarFill: {
        height: 8,
        backgroundColor: "#4b2c20",
        borderRadius: 10
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#4b2c20",
        marginBottom: 16,
        marginTop: 10
    },
    input: {
        borderWidth: 1,
        borderColor: "#EDE3DA",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: "#fff",
        color: "#2c1c14"
    },
    textArea: {
        height: 100,
        textAlignVertical: "top"
    },
    dateBtn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#F8F3EE",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#EDE3DA",
        marginBottom: 15
    },
    dateBtnText: {
        marginLeft: 10,
        fontSize: 16,
        color: "#2c1c14"
    },
    badge: {
        backgroundColor: "#F8F3EE",
        padding: 12,
        marginTop: 8,
        borderRadius: 8,
        borderLeftWidth: 5,
        borderLeftColor: "#4b2c20"
    },
    badgeText: {
        fontSize: 14,
        color: "#4b3527"
    },
    removeHint: {
        fontSize: 10,
        color: "#EF4444",
        marginTop: 5
    },
    durationRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15
    },
    durationText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2c1c14"
    },
    durationButtons: {
        flexDirection: "row"
    },
    smallBtn: {
        padding: 5,
        marginHorizontal: 10
    },
    actionBtnGreen: {
        backgroundColor: "#4CAF50",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 10
    },
    actionBtnOrange: {
        backgroundColor: "#D97706",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 10
    },
    actionBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    summaryBox: {
        marginTop: 20,
        backgroundColor: "#F8F3EE",
        borderWidth: 1,
        borderColor: "#EDE3DA",
        borderRadius: 12,
        padding: 15
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#4b2c20"
    },
    summaryText: {
        fontSize: 15,
        color: "#4b3527",
        marginBottom: 6
    },
    bottomNav: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: 18,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#F1E9E1",
        gap: 10
    },
    clearBtn: {
        flex: 1,
        backgroundColor: "#EF4444",
        padding: 16,
        borderRadius: 14,
        alignItems: "center"
    },
    clearBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    },
    backBtn: {
        flex: 1,
        backgroundColor: "#F1E9E1",
        padding: 16,
        borderRadius: 14,
        alignItems: "center"
    },
    backBtnPlaceholder: {
        flex: 1
    },
    backBtnText: {
        color: "#4b3527",
        fontWeight: "bold",
        fontSize: 16
    },
    nextBtn: {
        flex: 1,
        backgroundColor: "#4b2c20",
        padding: 16,
        borderRadius: 14,
        alignItems: "center"
    },
    nextBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    },
    mainBtn: {
        flex: 1,
        backgroundColor: "#4b2c20",
        padding: 18,
        borderRadius: 15,
        alignItems: "center",
        shadowColor: "#4b2c20",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4
    },
    mainBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18
    }
});