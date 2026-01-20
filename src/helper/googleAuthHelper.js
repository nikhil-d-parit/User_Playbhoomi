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
import config from '../../config';

export const useGoogleLogin = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: config.GOOGLE_EXPO_CLIENT_ID,
    androidClientId: config.GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: config.GOOGLE_IOS_CLIENT_ID,
    webClientId: config.GOOGLE_WEB_CLIENT_ID,
    // Request id_token for Firebase authentication
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
  });
  
  // Manual hash parsing for web (because useAuthRequest response doesn't always update)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('id_token')) {
      console.log('🔵 [MANUAL PARSE] Found id_token in URL hash');
      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get('id_token');
      
      if (idToken) {
        console.log('✅ [MANUAL PARSE] Extracted id_token');
        // Create a fake response object that matches what useAuthRequest would return
        const manualResponse = {
          type: 'success',
          params: {
            id_token: idToken
          }
        };
        
        // Process it
        authenticateWithBackend(manualResponse);
        
        // Clear the hash
        window.location.hash = '';
      }
    }
  }, []);

  const authenticateWithBackend = async (authResponse) => {
      if (authResponse?.type === 'success') {
        console.log('🔵 Google OAuth Success! Response:', authResponse.type);
        console.log('🔵 Response params:', authResponse.params);
        
        try {
          const { id_token } = authResponse.params;
          
          if (!id_token) {
            console.error('❌ No id_token in response! Params:', authResponse.params);
            throw new Error('No id_token received from Google');
          }
          
          console.log('✅ Got id_token from Google');
          
          // Sign in with Firebase
          const credential = GoogleAuthProvider.credential(id_token);
          console.log('🔵 Created Firebase credential');
          
          const userCredential = await signInWithCredential(auth, credential);
          const firebaseUser = userCredential.user;
          console.log('✅ Firebase auth successful! User:', firebaseUser.email);

          // Get Firebase ID token
          const firebaseToken = await firebaseUser.getIdToken();
          console.log('✅ Got Firebase token');

          // Call backend /users/google API
          console.log('🔵 Calling backend /users/google...');
          const result = await authService.googleLogin(firebaseToken);
          console.log('✅ Backend response:', result);

          // Store tokens and user data
          await AsyncStorage.setItem('userToken', result.token);
          await AsyncStorage.setItem('firebaseToken', firebaseToken);
          await AsyncStorage.setItem('userData', JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }));
          console.log('✅ Tokens stored in AsyncStorage');

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
          console.log('✅ Redux state updated');

          // Show success toast
          Toast.show({
            type: 'success',
            text1: 'Login Successful',
            text2: result.message || 'Welcome!',
            position: 'bottom',
            visibilityTime: 2000,
          });

          // Navigate to Home
          console.log('🔵 Navigating to Home screen...');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
          console.log('✅ Navigation complete!');
        } catch (error) {
          console.error('❌ Google login failed:', error);
          console.error('❌ Error details:', error.response?.data || error.message);
          
          const errorMsg = error.response?.data?.message || error.message || 'Google login failed';
          Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: errorMsg,
            position: 'bottom',
            visibilityTime: 3000,
          });
        }
      } else if (authResponse?.type === 'error') {
        console.error('❌ OAuth Error:', authResponse.error);
      } else if (authResponse?.type === 'cancel') {
        console.log('⚠️ User cancelled Google login');
      }
    };
  
  // Also listen to the normal response from useAuthRequest (for native)
  useEffect(() => {
    if (response) {
      console.log('🔵 [HOOK] Response from useAuthRequest:', response.type);
      authenticateWithBackend(response);
    }
  }, [response]);

  return { promptAsync, request };
};