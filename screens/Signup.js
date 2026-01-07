import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import PrimaryButton from "../components/PrimaryButton";
import { Checkbox } from "react-native-paper";
import CommonStyles from "../components/CommonStyles";
import { authService } from '../src/services/authService';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleContinue = async () => {
    const newErrors = {};
    if (!firstName.trim()) {
      newErrors.firstName = "Enter your first name";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Enter your last name";
    }
    if (!phone.trim() || phone.length < 10) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Enter a password";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!checked) {
      newErrors.checkbox =
        "You must accept the terms and conditions to register an account";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        // Clean and format the phone number
        const cleanPhone = phone.trim().replace(/\D/g, '');
        console.log('Starting registration process...', { email, mobile: cleanPhone });
        
        // Register user using authService
        const result = await authService.register({
          name: `${firstName} ${lastName}`,
          email,
          mobile: cleanPhone, // Send as mobile parameter
          password,
        });
        console.log('Registration successful:', result);
        
        // Store user data and tokens in AsyncStorage
        await AsyncStorage.setItem('userToken', result.token); // Store API JWT token
        await AsyncStorage.setItem('firebaseToken', result.firebaseToken); // Store Firebase token
        await AsyncStorage.setItem('userData', JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          mobile: cleanPhone,
          uid: result.user.firebaseUid,
          isRegistered: true
        }));
        
        setRegisterSuccess(true);
        
        // First show the toast
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Please login with your credentials',
          position: 'bottom',
          visibilityTime: 2000,
        });

        // Wait a short moment before navigating
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1000);
      } catch (error) {
        console.error('Registration failed:', error);
        const errorMsg = error.response?.data?.message || error.message;
        // Show error toast
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: errorMsg,
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
        setErrors({ api: errorMsg });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScrollView>
      <View style={styles.innerContainer}>
        <View>
          <TextInput
            placeholder="First Name"
            placeholderTextColor='#A9A9A9'
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            keyboardType="default"
          />
          {errors.firstName && (
            <Text style={styles.error}>{errors.firstName}</Text>
          )}
        </View>
        <View>
          <TextInput
            placeholder="Last Name"
            placeholderTextColor='#A9A9A9'
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            keyboardType="default"
          />
          {errors.lastName && (
            <Text style={styles.error}>{errors.lastName}</Text>
          )}
        </View>
        <View>
          <TextInput
            placeholder="Phone number"
            placeholderTextColor='#A9A9A9'
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
        </View>
        <View>
          <TextInput
            placeholder="Email Address"
            placeholderTextColor='#A9A9A9'
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        </View>
        <View>
          <TextInput
            placeholder="Password"
            placeholderTextColor='#A9A9A9'
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
          />
          {errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}
        </View>
        <View>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor='#A9A9A9'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
          />
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          )}
        </View>

        <View style={styles.checkcontainer}>
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            onPress={() => setChecked(!checked)}
            color="#067B6A"
          />
          <Text style={styles.label}>
            {" "}
            I agree to the Terms and Privacy Policy
          </Text>
        </View>
        {errors.checkbox && <Text style={styles.error}>{errors.checkbox}</Text>}
        <View style={{ width: "100%", paddingHorizontal: 20, marginTop: 10 }}>
          <PrimaryButton
            mode="contained"
            onPress={handleContinue}
            style={[styles.button, { marginBottom: 20 }]}
            loading={loading}
          >
            {registerSuccess ? "Registered!" : "Create Account"}
          </PrimaryButton>
        </View>
        {errors.api && <Text style={styles.error}>{errors.api}</Text>}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
            justifyContent: "center",
            marginTop: 50
          }}
        >
          <Text
            style={{
              color: "#757575",
              fontSize: 16,
              fontFamily: "Inter_400Regular",
            }}
          >
            Alredy have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.link, { color: "#067B6A", marginLeft: 5 }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  innerContainer: { alignItems: "center", flex: 1, width: "100%" },
  input: {
    marginBottom: 10,
    borderCurve: 10,
    width: 350,
    height: 50,
    backgroundColor: "#F3F3F5",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#7B7B7B40",
    fontFamily: "Inter_400Medium",
  },
  button: { marginTop: 10 },
  title: {
    fontSize: 20,
    marginBottom: 12,
    color: "#343A40",
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    color: "#343A40",
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
  secondaryHeader: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
  },
  link: {
    color: "#0066CC",
    marginLeft: 5,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  privacypolicyText: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  error: {
    color: "red",
    marginBottom: 8,
    fontFamily: "Inter_400Regular",
    marginLeft: 10,
  },
  checkcontainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    fontFamily: "Inter_400Regular",
  },
  label: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#5A5A5A",
  },
});
