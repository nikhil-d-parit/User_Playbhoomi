// Profile.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../src/services/authService';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../src/store/slices/authSlice';
import Toast from 'react-native-toast-message';
import { useNavigation } from "@react-navigation/native";
import CommonStyles from "../components/CommonStyles";
import editProfileIcon from "../assets/icons/gradient/icon-profile_edit-gradient.png";
import helpIcon from "../assets/icons/gradient/icon-help-graident.png";
import termsDocs from "../assets/icons/gradient/icon-document-gradient.png";
import signOut from "../assets/icons/gradient/icon-exit_app-gradient.png";
import lockIcon from "../assets/icons/gray/lock.png";
import rightIcon from "../assets/icons/gradient/icon-arrow_right-gradient.png";
const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  return (
    <ScrollView style={styles.container}>
      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <View style={styles.avatarCircle}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100?img=1" }}
            style={{ width: 80, height: 80, borderRadius: 50 }}
          />
        </View>
        <Text style={styles.name}>John Smith</Text>
        <Text style={styles.email}>john.smith@email.com</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Image source={editProfileIcon} style={{ width: 20, height: 20 }} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Image source={rightIcon} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ChangePasswordScreen")}
        >
          <Image source={lockIcon} style={{ width: 20, height: 20 }} />
          <Text style={styles.menuText}>Change Password</Text>
          <Image source={rightIcon} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("HelpSupportScreen")}
        >
          <Image source={helpIcon} style={{ width: 20, height: 20 }} />

          <Text style={styles.menuText}>Help & Support</Text>
          <Image source={rightIcon} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Image source={termsDocs} style={{ width: 20, height: 20 }} />

          <Text style={styles.menuText}>Terms & Conditions</Text>
          <Image source={rightIcon} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Sign Out',
                onPress: async () => {
                  try {
                    await authService.logout();

                    await AsyncStorage.multiRemove([
                      'userToken',
                      'firebaseToken',
                      'userData'
                    ]);

                    dispatch(clearAuth());

                    Toast.show({
                      type: 'success',
                      text1: 'Signed Out Successfully',
                      position: 'bottom',
                      visibilityTime: 2000,
                    });

                    // Navigate to Login screen and reset navigation stack
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  } catch (error) {
                    console.error('Sign out error:', error);
                    Toast.show({
                      type: 'error',
                      text1: 'Sign Out Failed',
                      text2: 'Please try again',
                      position: 'bottom',
                      visibilityTime: 3000,
                    });
                  }
                },
                style: 'destructive',
              },
            ],
            { cancelable: true }
          );
        }}
      >
        <Image source={signOut} style={{ width: 20, height: 20 }} />
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold", // Header → Bold
    color: "#000",
  },
  profileInfo: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E6F9F4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#20C997",
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold", // Subheader → SemiBold
    marginTop: 10,
    color: "#067B6A",
  },
  email: {
    fontSize: 14,
    fontFamily: "Inter_400Regular", // Body → Regular
    color: "#777",
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontFamily: "Inter_500Medium", // Menu items → Medium
    color: "#000",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginTop: 20,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: "Inter_500Medium", // CTA → Medium
    color: "#444",
  },
});

export default ProfileScreen;
