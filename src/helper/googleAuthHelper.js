import { useCallback, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, browserPopupRedirectResolver } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';

// Lazy-load native Google Sign-In (crashes on Expo Go / web)
let GoogleSignin = null;
let statusCodes = {};
if (Platform.OS !== 'web') {
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
}

// Shared helper: after Firebase sign-in, send token to backend and store locally
const completeLogin = async (firebaseUser, dispatch, navigation) => {
  const firebaseToken = await firebaseUser.getIdToken();
  const result = await authService.googleLogin(firebaseToken);

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

  navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  });
};

export const useGoogleLogin = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    if (googleLoading) return;
    setGoogleLoading(true);

    try {
      if (Platform.OS === 'web') {
        // Web: use Firebase popup sign-in
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
        await completeLogin(userCredential.user, dispatch, navigation);
      } else {
        // Native: use @react-native-google-signin
        if (!GoogleSignin) {
          Alert.alert('Not Available', 'Google Sign-In requires a production build (APK). It does not work on Expo Go.');
          return;
        }

        if (Platform.OS === 'android') {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        }

        try { await GoogleSignin.signOut(); } catch (_) {}

        const response = await GoogleSignin.signIn();
        const idToken = response?.data?.idToken;
        if (!idToken) {
          throw new Error('No id_token received from Google');
        }

        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        await completeLogin(userCredential.user, dispatch, navigation);
      }
    } catch (error) {
      // Web: user closed popup
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Google login popup closed');
        return;
      }
      // Native: cancelled
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
