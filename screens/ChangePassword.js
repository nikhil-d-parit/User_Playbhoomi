// ChangePassword.js
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ChangePasswordScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Requirements Card */}
      <View style={styles.card}>
        <Text style={styles.requireTitle}>Password Requirements:</Text>

        <View style={styles.requireItem}>
          <Ionicons name="checkmark-circle" size={16} color="#20C997" />
          <Text style={styles.requireText}>At least 8 characters</Text>
        </View>

        <View style={styles.requireItem}>
          <Ionicons name="checkmark-circle" size={16} color="#20C997" />
          <Text style={styles.requireText}>At least one uppercase letter</Text>
        </View>

        <View style={styles.requireItem}>
          <Ionicons name="checkmark-circle" size={16} color="#20C997" />
          <Text style={styles.requireText}>One number</Text>
        </View>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Current password"
          secureTextEntry
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="New password"
          secureTextEntry
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          placeholderTextColor="#999"
        />
      </View>

      {/* Update Button */}
      <TouchableOpacity style={styles.buttonWrapper}>
        <LinearGradient
          colors={["#20C997", "#009F7F"]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Update Password</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 15,
    marginTop: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  requireTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold", // Subheader
    marginBottom: 8,
    color: "#000",
  },
  requireItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  requireText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Inter_400Regular", // Body
    color: "#333",
  },
  inputContainer: {
    marginHorizontal: 15,
  },
  input: {
    marginBottom: 10,
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontFamily: "Inter_500Medium", // Input text
    fontSize: 15,
    color: "#000",
  },
  buttonWrapper: {
    marginTop: 25,
    marginHorizontal: 15,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold", // CTA
    color: "#fff",
  },
});

export default ChangePasswordScreen;
