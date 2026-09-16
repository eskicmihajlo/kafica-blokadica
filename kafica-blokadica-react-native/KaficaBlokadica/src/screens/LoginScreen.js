import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { sendPushTokenToBackend } from "../api/api";
import { loginUser } from "../services/authService";
import { registerForPushNotificationsAsync } from "../utils/registerPushToken";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!email || !password) {
      Alert.alert("Error", "Please insert email and password");
      return;
    }

    try {

      setLoading(true);

      /// pravi problem, treba dodati logout
      await SecureStore.deleteItemAsync("userToken");

      const token = await loginUser(email, password);

      if (!token) {
        Alert.alert("Error", "No token recieved from backend");
        return;
      }

      await SecureStore.setItemAsync("userToken", token);


      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await sendPushTokenToBackend(pushToken);
        }
      } catch (pushError) {
        console.log("Push token registration failed:", pushError.message);
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });

    }
    catch (error) {

      if (error.response) {

        console.log("SERVER ERROR DATA:", error.response.data);
        console.log("SERVER ERROR STATUS:", error.response.status);
      } else if (error.request) {

        console.log("NETWORK/REQUEST ERROR:", error.request);
      } else {

        console.log("UNKNOWN ERROR:", error.message);
      }
      Alert.alert("Error", error.response?.data?.message || "Check terminal for details.");
    }
    finally {

      setLoading(false);

    }


  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Logging in" : "Login"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.secondaryButtonText}>Create account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFB",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b4f3f",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EDE3DA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#2c1c14",
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: "#4b2c20",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4b2c20",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#4b2c20",
    fontSize: 16,
    fontWeight: "600",
  },
});