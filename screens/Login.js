import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Toast from 'react-native-toast-message';
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import PrimaryButton from "../components/PrimaryButton";
import DividerWithText from "../components/DividerWithText";
import GoogleButton from "../components/GoogleButton";
import CommonStyles from "../components/CommonStyles";
import { authService } from '../src/services/authService';
import { useDispatch } from 'react-redux';
import { setAuth } from '../src/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGoogleLogin } from '../src/helper/googleAuthHelper';
import MailIcon from "../assets/icons/gray/mail.png";
import LockIcon from "../assets/icons/gray/lock.png";
import EyeIcon from "../assets/icons/gray/icon-visibility_off-grey.png";
import EyeOffIcon from "../assets/icons/gray/icon-visibility-grey.png";

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Google login hook
  const { promptAsync, request } = useGoogleLogin();

  const isValidEmailOrPhone = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    return emailRegex.test(input) || phoneRegex.test(input);
  };

  const handleContinue = async () => {
    let isValid = true;

    if (!emailOrPhone) {
      setEmailError("Enter email or phone");
      isValid = false;
    } else if (!isValidEmailOrPhone(emailOrPhone)) {
      setEmailError("Enter a valid email or phone number");
      isValid = false;
    } else {
      setEmailError("");
    }
    if (!password) {
      setPasswordError("Enter password");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (isValid) {
      setLoading(true);
      try {
        const result = await authService.login(emailOrPhone, password);

        // Store the tokens and user data for axios interceptors and session restore
        await AsyncStorage.setItem('userToken', result.token);
        await AsyncStorage.setItem('firebaseToken', result.firebaseToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));

        // Update redux auth slice (persisted via redux-persist)
        dispatch(setAuth({ user: result.user, token: result.token }));

        // Show success toast and navigate
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
          position: 'bottom',
          visibilityTime: 2000,
        });
        
        // Navigate to Home screen and clear navigation stack
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch (error) {
        console.error('Login failed:', error);
        const errorMsg = error.response?.data?.message || error.message;
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: errorMsg,
          position: 'bottom',
          visibilityTime: 3000,
        });
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGuestContinue = async () => {
    setLoading(true);
    try {
      const result = await authService.startGuestSession();
      console.log('Guest session started:', result);

      // Store guest token and user data
      await AsyncStorage.setItem('userToken', result.token);
      await AsyncStorage.setItem('userData', JSON.stringify({
        guestId: result.guestId,
        isGuest: true,
        expiresIn: result.expiresIn
      }));

      // Update redux auth slice with guest data
      dispatch(setAuth({ 
        user: { 
          guestId: result.guestId, 
          isGuest: true,
          expiresIn: result.expiresIn 
        }, 
        token: result.token 
      }));

      // Show success toast and navigate
      Toast.show({
        type: 'success',
        text1: 'Guest Session Started',
        text2: 'Welcome! Explore as a guest',
        position: 'bottom',
        visibilityTime: 2000,
      });
      
      // Navigate to Home screen and clear navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Guest login failed:', error);
      const errorMsg = error.response?.data?.message || error.message;
      Toast.show({
        type: 'error',
        text1: 'Guest Login Failed',
        text2: errorMsg,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Image
            style={CommonStyles.imageLogo}
            source={require("../assets/logo-primary.png")}
          />
          <Text style={CommonStyles.welcomeText}>Your game starts here</Text>
        </View>
        <Text style={CommonStyles.screenHeader}>Sign In</Text>

        {/* Email or Phone Input */}
        <View style={styles.inputWrapper}>
          <Image source={MailIcon} style={styles.icon} />
          <TextInput
            style={CommonStyles.textInput}
            placeholderTextColor='#A9A9A9'
            placeholder="Email or phone"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Image source={LockIcon} style={styles.icon} />
          <TextInput
            placeholder="Password"
            value={password}
            placeholderTextColor='#A9A9A9'
            onChangeText={setPassword}
            style={CommonStyles.textInput}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Image
              source={showPassword ? EyeOffIcon : EyeIcon}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
        
        {error ? (
          <Text style={[styles.errorText, { textAlign: 'center', marginBottom: 10 }]}>{error}</Text>
        ) : null}

        {/* Forgot Password Link */}
        <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.gradientButton, loading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={loading}
        >
          <LinearGradient
            colors={["#00C247", "#004CE8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1.5 }}
            style={styles.gradientButtonBg}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.gradientButtonText}>Sign In</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Or Text */}
        <Text style={styles.orText}>Or</Text>

        {/* Google Button */}
        <GoogleButton onPress={() => promptAsync()} disabled={!request} />

        {/* Sign Up and Guest Links */}
        <View style={{ alignItems: "center", marginTop: 70 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                color: "#757575",
                fontSize: 16,
                fontFamily: "Inter_400Regular",
              }}
            >
              Don’t have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={[styles.link, { color: "#067B6A", marginLeft: 5 }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ marginTop: 5 }} onPress={handleGuestContinue} disabled={loading}>
            <Text style={styles.link}>Continue as a guest</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Terms and Privacy Policy (always at the bottom) */}
      <View style={styles.termsContainer}>
        <Text style={styles.privacypolicyText}>
          By continuing, you agree to our{" "}
          <Text style={styles.termsLink}>Terms</Text> and{" "}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "space-between", // Push content upwards
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  innerContainer: {
    padding: 20,
    width: "100%",
    flexGrow: 1, // Ensures this part takes up the available space
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    fontSize: 32,
    color: "#00BFAE",
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  forgotText: {
    color: "#5A5A5A",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor:"#F3F3F5",
    height: 50,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  rightIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: 4,
  },
  gradientButton: {
    marginTop: 10,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  gradientButtonBg: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  gradientButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  orText: {
    textAlign: "center",
    color: "#1E1E1E",
    marginVertical: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  link: {
    color: "#067B6A",
    fontSize: 16,
    marginVertical: 2,
    fontFamily: "Inter_400Regular",
  },
  termsContainer: {
    padding: 20,
    width: "100%",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  termsLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
    fontFamily: "Inter_400Regular",
  },
  privacypolicyText: {
    fontSize: 12,
    textAlign: "center",
    color: "#343A40",
    fontFamily: "Inter_400Regular",
    opacity: 0.7,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginLeft: 10,
    position: "relative",
    bottom: 4,
    fontFamily: "Inter_500Regular",
  },
});
