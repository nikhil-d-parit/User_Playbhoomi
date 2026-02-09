
import { initializeApp, getApps } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence,
  browserLocalPersistence,
  RecaptchaVerifier,
  PhoneAuthProvider
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import config from '../../config';

const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY,
  authDomain: config.FIREBASE_AUTH_DOMAIN,
  projectId: config.FIREBASE_PROJECT_ID,
};

// Initialize Firebase if it hasn't been initialized yet
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Use different persistence based on platform
const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? browserLocalPersistence 
    : getReactNativePersistence(AsyncStorage)
});

export { app, auth };