import { useCallback, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';

// Lazy-load native Google Sign-In (crashes on Expo Go)
let GoogleSignin = null;
let statusCodes = {};
try {
  const gsi = require('@react-native-google-signin/google-signin');
  GoogleSignin = gsi.GoogleSignin;
  statusCodes = gsi.statusCodes;
  GoogleSignin.configure({
    webClientId: config.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
} catch (e) {
  console.warn('Google Sign-In native module not available (Expo Go?)');
}

export const useGoogleLogin = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    if (!GoogleSignin) {
      Alert.alert('Not Available', 'Google Sign-In requires a production build (APK). It does not work on Expo Go.');
      return;
    }
    if (googleLoading) return;

    setGoogleLoading(true);
    try {
      // Check if Play Services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Sign in with native Google dialog
      const response = await GoogleSignin.signIn();

      const idToken = response?.data?.idToken;
      if (!idToken) {
        throw new Error('No id_token received from Google');
      }

      console.log('Google Sign-In success, authenticating with Firebase...');

      // Firebase login
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      // Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // Backend login
      const result = await authService.googleLogin(firebaseToken);

      // Store locally
      await AsyncStorage.multiSet([
        ['userToken', result.token],
        ['firebaseToken', firebaseToken],
        [
          'userData',
          JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }),
        ],
      ]);

      // Redux update
      dispatch(
        setAuth({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          },
          token: result.token,
        })
      );

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: result.message || 'Welcome!',
        position: 'bottom',
      });

      // Navigate
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Google login cancelled');
        return;
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Google sign-in already in progress');
        return;
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({
          type: 'error',
          text1: 'Google Play Services Required',
          text2: 'Please update Google Play Services',
          position: 'bottom',
        });
        return;
      }

      console.error('Google login failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2:
          error.response?.data?.message ||
          error.message ||
          'Google login failed',
        position: 'bottom',
      });
    } finally {
      setGoogleLoading(false);
    }
  }, [dispatch, navigation, googleLoading]);

  return {
    handleGoogleLogin,
    googleLoading,
  };
};
