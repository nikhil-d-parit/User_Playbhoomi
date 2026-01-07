import React, { useState, useRef } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Button, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import PrimaryButton from "../components/PrimaryButton";
import DividerWithText from "../components/DividerWithText";
import GoogleButton from "../components/GoogleButton";

const OTPScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={{ justifyContent: "center", alignItems: "center",marginVertical:20 }}>
          <Text style={styles.mainHeader}>KRIDA</Text>
        </View>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          {`A 4-digit code has been sent to\n+91 XXXXX 2305`}
        </Text>
        <View style={styles.otpcontainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.inputBox}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 10,
          }}
        >
          <Text style={styles.otpText}>
            Resend OTP in : <Text style={styles.timerText}>0 : 30</Text>
          </Text>
        </View>
        <TouchableOpacity>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text styles={styles.resetOtp}>Resend OTP</Text>
          </View>
        </TouchableOpacity>
        {/* {error ? <Text style={styles.error}>{error}</Text> : null} */}
        <PrimaryButton mode="contained" style={styles.button} onPress={()=>navigation.navigate('Home')}>
          Verify & Continue
        </PrimaryButton>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.contactSupportText}>
            Having trouble? Contact Support
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  innerContainer: { padding: 20, width: "100%" },
  mainHeader: { color: "#343A40", fontSize: 30, fontFamily: "Inter_700Bold" },
  button: { marginTop: 20 },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#343A40",
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
  inputHeader: {
    color: "#343A40",
    fontFamily: "Inter_500Medium",
    margin: 5,
  },
  privacypolicyText: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  error: { color: "red", marginBottom: 8 },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    color: "#343A40",
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
  otpcontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 5,
  },
  otpText: {
    color: "#737373",
    fontFamily: "Inter_400Regular",
  },
  timerText: {
    color: "#FF0000",
    fontFamily: "Inter_400Regular",
  },
  resetOtp: {
    color: "#A3A3A3",
    fontFamily: "Inter_400Regular",
  },
  contactSupportText:{
    color: "#737373",
    fontFamily: "Inter_400Regular",
    textAlign:'center'
  }
});
