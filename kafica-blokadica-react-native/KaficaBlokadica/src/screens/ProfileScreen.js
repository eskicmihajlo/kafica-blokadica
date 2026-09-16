import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function InvitesScreen() {

  const navigation = useNavigation();


  const handleLogOut = async () => {

    await SecureStore.deleteItemAsync("userToken");

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });


  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleLogOut}
      >
        <Text style={styles.primaryButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFB",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b2c20",
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#4b2c20",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});