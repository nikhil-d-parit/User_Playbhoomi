import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

export const useGoogleLogin = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    const authenticateWithBackend = async () => {
      if (response?.type === 'success') {
        try {
          const { id_token } = response.params;
          
          // Sign in with Firebase
          const credential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(auth, credential);
          const firebaseUser = userCredential.user;

          // Get Firebase ID token
          const firebaseToken = await firebaseUser.getIdToken();

          // Call backend /users/google API
          const result = await authService.googleLogin(firebaseToken);

          // Store tokens and user data
          await AsyncStorage.setItem('userToken', result.token);
          await AsyncStorage.setItem('firebaseToken', firebaseToken);
          await AsyncStorage.setItem('userData', JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }));

          // Update Redux store
          dispatch(setAuth({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            },
            token: result.token,
          }));

          // Show success toast
          Toast.show({
            type: 'success',
            text1: 'Login Successful',
            text2: result.message || 'Welcome!',
            position: 'bottom',
            visibilityTime: 2000,
          });

          // Navigate to Home
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } catch (error) {
          console.error('Google login failed:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Google login failed';
          Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: errorMsg,
            position: 'bottom',
            visibilityTime: 3000,
          });
        }
      }
    };

    authenticateWithBackend();
  }, [response]);

  return { promptAsync, request };
};