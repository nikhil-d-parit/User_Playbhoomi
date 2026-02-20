import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';

export const useGoogleLogin = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: config.GOOGLE_EXPO_CLIENT_ID,
    androidClientId: config.GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: config.GOOGLE_IOS_CLIENT_ID,
    webClientId: config.GOOGLE_WEB_CLIENT_ID,
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
  });

  /**
   * 🔐 Authenticate with Firebase + Backend
   */
  const authenticateWithBackend = async (authResponse) => {
    if (!authResponse) return;

    if (authResponse.type === 'success') {
      try {
        console.log('🔵 Google OAuth success');

        const { id_token } = authResponse.params || {};
        if (!id_token) {
          throw new Error('No id_token received from Google');
        }

        // Firebase login
        const credential = GoogleAuthProvider.credential(id_token);
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
        console.error('❌ Google login failed:', error);

        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2:
            error.response?.data?.message ||
            error.message ||
            'Google login failed',
          position: 'bottom',
        });
      }
    }

    if (authResponse.type === 'cancel') {
      console.log('⚠️ Google login cancelled');
    }

    if (authResponse.type === 'error') {
      console.error('❌ OAuth error:', authResponse.error);
    }
  };

  /**
   * 🌐 MANUAL HASH PARSING (Expo Web fix)
   */
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    if (
      typeof globalThis === 'undefined' ||
      !globalThis.location ||
      !globalThis.location.hash
    ) {
      return;
    }

    const hash = globalThis.location.hash;

    if (hash.includes('id_token')) {
      console.log('🔵 [WEB] Found id_token in URL hash');

      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get('id_token');

      if (idToken) {
        authenticateWithBackend({
          type: 'success',
          params: { id_token: idToken },
        });

        // Clear URL hash
        globalThis.location.hash = '';
      }
    }
  }, []);

  /**
   * 📱 Native response listener
   */
  useEffect(() => {
    if (response) {
      authenticateWithBackend(response);
    }
  }, [response]);

  return {
    promptAsync,
    request,
  };
};
