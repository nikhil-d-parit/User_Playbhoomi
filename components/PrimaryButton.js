// src/components/PrimaryButton.js
import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const PrimaryButton = ({ children, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[style]}>
      <LinearGradient
        colors={["#00C247", "#004CE8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1.5 }}
        style={styles.button}
      >
        <Text style={[styles.text, textStyle]}>{children}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    width: '100%'
  },
  text: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
});

export default PrimaryButton;
