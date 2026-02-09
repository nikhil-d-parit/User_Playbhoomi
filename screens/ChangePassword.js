// ChangePassword.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from '../src/config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return {
      minLength,
      hasUppercase,
      hasNumber,
      isValid: minLength && hasUppercase && hasNumber
    };
  };

  const validation = validatePassword(newPassword);

  const handleChangePassword = async () => {
    console.log('handleChangePassword called');
    
    // Check if user is using email/password authentication
    const user = auth.currentUser;
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user logged in');
      Alert.alert('Error', 'No user logged in');
      return;
    }

    // Check if user signed in with Google
    const isGoogleUser = user.providerData.some(
      provider => provider.providerId === 'google.com'
    );
    console.log('Is Google user:', isGoogleUser);

    if (isGoogleUser) {
      console.log('User is Google user, cannot change password');
      Alert.alert(
        'Cannot Change Password',
        'You signed in with Google. Please manage your password through your Google account settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validation
    console.log('Starting validation...');
    console.log('Current password:', currentPassword ? 'provided' : 'empty');
    console.log('New password:', newPassword ? 'provided' : 'empty');
    console.log('Confirm password:', confirmPassword ? 'provided' : 'empty');
    console.log('Actual new password value:', newPassword);
    console.log('Actual confirm password value:', confirmPassword);
    
    if (!currentPassword) {
      console.log('Current password empty');
      Alert.alert('Validation Error', 'Please enter your current password');
      return;
    }

    if (!newPassword) {
      console.log('New password empty');
      Alert.alert('Validation Error', 'Please enter a new password');
      return;
    }

    console.log('Validation result:', validation);
    if (!validation.isValid) {
      console.log('Password does not meet requirements');
      
      // Build detailed error message
      const missingRequirements = [];
      if (!validation.minLength) missingRequirements.push('• At least 8 characters');
      if (!validation.hasUppercase) missingRequirements.push('• At least one uppercase letter');
      if (!validation.hasNumber) missingRequirements.push('• At least one number');
      
      Alert.alert(
        'Password Requirements Not Met',
        `Your new password is missing:\n\n${missingRequirements.join('\n')}\n\nPlease update your password to meet all requirements.`
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      console.log('Passwords do not match');
      Alert.alert(
        'Passwords Do Not Match',
        'The new password and confirm password fields must be identical. Please check and try again.'
      );
      return;
    }

    if (currentPassword === newPassword) {
      console.log('New password same as current');
      Alert.alert(
        'Password Not Changed',
        'Your new password must be different from your current password. Please choose a different password.'
      );
      return;
    }

    try {
      console.log('Starting password change process...');
      setLoading(true);

      if (!user.email) {
        throw new Error('No email found for user');
      }

      console.log('User email:', user.email);
      console.log('Re-authenticating user...');
      
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      console.log('Re-authentication successful');

      // Update password
      console.log('Updating password...');
      await updatePassword(user, newPassword);
      console.log('Password updated successfully');

      Toast.show({
        type: 'success',
        text1: 'Password Updated',
        text2: 'Your password has been changed successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });

      // Clear fields and go back
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigation.goBack();
    } catch (error) {
      console.error('Password change error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to change password';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log in again before changing password';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      console.log('Password change process completed');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* Requirements Card */}
      <View style={styles.card}>
        <Text style={styles.requireTitle}>Password Requirements:</Text>

        <View style={styles.requireItem}>
          <Ionicons
            name={validation.minLength ? "checkmark-circle" : "close-circle"}
            size={16}
            color={validation.minLength ? "#20C997" : "#999"}
          />
          <Text
            style={[
              styles.requireText,
              validation.minLength && styles.requireTextMet,
            ]}
          >
            At least 8 characters
          </Text>
        </View>

        <View style={styles.requireItem}>
          <Ionicons
            name={validation.hasUppercase ? "checkmark-circle" : "close-circle"}
            size={16}
            color={validation.hasUppercase ? "#20C997" : "#999"}
          />
          <Text
            style={[
              styles.requireText,
              validation.hasUppercase && styles.requireTextMet,
            ]}
          >
            At least one uppercase letter
          </Text>
        </View>

        <View style={styles.requireItem}>
          <Ionicons
            name={validation.hasNumber ? "checkmark-circle" : "close-circle"}
            size={16}
            color={validation.hasNumber ? "#20C997" : "#999"}
          />
          <Text
            style={[
              styles.requireText,
              validation.hasNumber && styles.requireTextMet,
            ]}
          >
            One number
          </Text>
        </View>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={[
              styles.input,
              currentPassword && !currentPassword ? styles.inputError : null,
            ]}
            placeholder="Current password"
            secureTextEntry={!showCurrentPassword}
            placeholderTextColor="#999"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            <Ionicons
              name={showCurrentPassword ? "eye-off" : "eye"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={[
              styles.input,
              newPassword && !validation.isValid ? styles.inputError : null,
            ]}
            placeholder="New password"
            secureTextEntry={!showNewPassword}
            placeholderTextColor="#999"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons
              name={showNewPassword ? "eye-off" : "eye"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        {newPassword && !validation.isValid && (
          <Text style={styles.errorText}>
            Password must have {!validation.minLength && "8+ characters, "}
            {!validation.hasUppercase && "uppercase letter, "}
            {!validation.hasNumber && "number"}
          </Text>
        )}

        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={[
              styles.input,
              confirmPassword && newPassword !== confirmPassword
                ? styles.inputError
                : null,
            ]}
            placeholder="Confirm password"
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        {confirmPassword && newPassword !== confirmPassword && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
      </View>

      {/* Update Button */}
      <TouchableOpacity
        style={styles.buttonWrapper}
        onPress={() => {
          console.log("Button clicked!");
          handleChangePassword();
        }}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#00C247", "#004CE8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1.5 }}
          style={styles.gradientButtonBg}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
          )}
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
    fontFamily: "Inter_600SemiBold",
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
    fontFamily: "Inter_400Regular",
    color: "#999",
  },
  requireTextMet: {
    color: "#333",
  },
  inputContainer: {
    marginHorizontal: 15,
  },
  passwordInputWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 45,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#000",
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 4,
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
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
   gradientButtonBg: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});

export default ChangePasswordScreen;
