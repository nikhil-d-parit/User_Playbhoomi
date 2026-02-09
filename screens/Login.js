import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
  
  // Phone OTP states
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [countdown, setCountdown] = useState(60);
  
  // Google login hook
  const { promptAsync, request } = useGoogleLogin();

  const isValidEmailOrPhone = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    return emailRegex.test(input) || phoneRegex.test(input);
  };

  const isPhoneNumber = (input) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(input);
  };

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let timer;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handleSendOTP = async () => {
    if (!emailOrPhone) {
      setEmailError("Enter phone number");
      return;
    }
    if (!isPhoneNumber(emailOrPhone)) {
      setEmailError("Enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.sendOTP(emailOrPhone);
      setConfirmationResult(result.confirmationResult);
      setOtpSent(true);
      setCountdown(60);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Check your SMS',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Send OTP error:', error);

      // Handle specific error types
      let errorTitle = 'Failed to Send OTP';
      let errorMessage = error.message;

      if (error.code === 'auth/too-many-requests') {
        errorTitle = 'Too Many Requests';
        errorMessage = 'Please wait a few minutes before trying again';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorTitle = 'Invalid Phone Number';
        errorMessage = 'Please enter a valid phone number';
      } else if (error.message?.includes('reCAPTCHA')) {
        errorTitle = 'Verification Failed';
        errorMessage = 'Please try again or contact support';
      }

      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Enter 6-digit OTP',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyOTP(confirmationResult, otp);
      
      await AsyncStorage.setItem('userToken', result.token);
      await AsyncStorage.setItem('firebaseToken', result.firebaseToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));

      dispatch(setAuth({ user: result.user, token: result.token }));

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome!',
        position: 'bottom',
        visibilityTime: 2000,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please try again',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    // Detect if phone or email
    if (isPhoneNumber(emailOrPhone)) {
      setIsPhoneLogin(true);
      handleSendOTP();
      return;
    }

    // Email/password login
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

        await AsyncStorage.setItem('userToken', result.token);
        await AsyncStorage.setItem('firebaseToken', result.firebaseToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));

        dispatch(setAuth({ user: result.user, token: result.token }));

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
          position: 'bottom',
          visibilityTime: 2000,
        });
        
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
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* OTP Input - Show only if OTP sent */}
        {otpSent && isPhoneLogin ? (
          <>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#A9A9A9" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Enter 6-digit OTP"
                value={otp}
                placeholderTextColor='#A9A9A9'
                onChangeText={setOtp}
                style={CommonStyles.textInput}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            {countdown > 0 ? (
              <Text style={styles.otpTimer}>Resend OTP in {countdown}s</Text>
            ) : (
              <TouchableOpacity onPress={handleSendOTP}>
                <Text style={styles.resendOTP}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (!otpSent && !isPhoneNumber(emailOrPhone)) ? (
          <>
            {/* Password Input - Show only for email login */}
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
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Image
                  source={showPassword ? EyeOffIcon : EyeIcon}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </>
        ) : null}

        {/* Forgot Password Link - Show only for email login */}
        {!isPhoneNumber(emailOrPhone) && !otpSent && (
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={CommonStyles.forgotPasswordText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        )}

        {/* Sign In Button */}
        <PrimaryButton
          onPress={otpSent ? handleVerifyOTP : handleContinue}
          disabled={loading}
        >
          {loading ? (otpSent ? "Verifying..." : "Sending OTP...") : (otpSent ? "Verify OTP" : "Continue")}
        </PrimaryButton>
        
        {/* Back to phone input */}
        {otpSent && (
          <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(""); setIsPhoneLogin(false); }}>
            <Text style={styles.changeNumber}>Change Phone Number</Text>
          </TouchableOpacity>
        )}

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
              Don't have an account?
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

        {/* Terms and Privacy Policy */}
        <View style={styles.termsContainer}>
          <Text style={styles.privacypolicyText}>
            By continuing, you agree to our{" "}
            <Text style={styles.termsLink}>Terms</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
        </View>
      </ScrollView>

      {/* Invisible reCAPTCHA container for web - rendered outside ScrollView */}
      {Platform.OS === 'web' && <div id="recaptcha-container" style={{ display: 'none' }} />}
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  innerContainer: {
    padding: 20,
    width: "100%",
    minHeight: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
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
  otpTimer: {
    textAlign: "center",
    color: "#757575",
    fontSize: 14,
    marginTop: 8,
    fontFamily: "Inter_400Regular",
  },
  resendOTP: {
    textAlign: "center",
    color: "#004CE8",
    fontSize: 14,
    marginTop: 8,
    fontFamily: "Inter_600SemiBold",
  },
  changeNumber: {
    textAlign: "center",
    color: "#D32F2F",
    fontSize: 14,
    marginTop: 12,
    fontFamily: "Inter_500Medium",
  },
});
