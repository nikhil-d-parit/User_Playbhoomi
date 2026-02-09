import { auth } from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import api from './apiService';

export const authService = {
  // Register new user
  async register(userData) {
    try {
      console.log('Starting Firebase authentication...', { email: userData.email });
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      console.log('Firebase user created successfully:', userCredential.user.uid);
      // Set display name
      await updateProfile(userCredential.user, { displayName: userData.name });
      console.log('User profile updated with display name');
      // Get the Firebase user token
      const token = await userCredential.user.getIdToken();
      console.log('Firebase token obtained');
      // Register user in your backend
      console.log('Registering user in backend...', { uid: userCredential.user.uid });
      // Ensure we have a fresh token
      const freshToken = await userCredential.user.getIdToken(true);
      console.log('Got fresh token for backend request');
      
      const response = await api.post('/users/register', {
        email: userData.email,
        name: userData.name,
        mobile: userData.mobile, // Use mobile instead of phone
        idToken: freshToken // Only send the Firebase ID token
      });
      console.log('Backend registration successful', response.data);
      return {
        user: {
          email: userData.email,
          name: userData.name,
          mobile: userData.mobile,
          firebaseUid: userCredential.user.uid
        },
        token: response.data.token, // Use the JWT token from the API response
        firebaseToken: freshToken // Keep the Firebase token if needed
      };
    } catch (error) {
      // If backend registration fails, delete the Firebase user
      if (error.response) {
        try {
          await auth.currentUser?.delete();
        } catch (deleteError) {
          console.error('Error deleting Firebase user:', deleteError);
        }
      }
      throw error;
    }
  },

  // Sign in existing user
  async login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseToken = await userCredential.user.getIdToken();
    
    // Get JWT from backend by sending Firebase token
    const response = await api.post('/users/login', {
      idToken: firebaseToken
    });
    return {
      user: {
        email: userCredential.user.email,
        name: userCredential.user.displayName,
        uid: userCredential.user.uid,
        photoURL: userCredential.user.photoURL
      },
      token: response.data.token, // API JWT token
      firebaseToken // Firebase token
    };
  },

  // Sign out user
  async logout() {
    try {
      console.log('Attempting to sign out from Firebase...');
      await signOut(auth);
      console.log('Firebase sign out successful');
    } catch (error) {
      console.error('Firebase sign out error:', error);
      // Even if Firebase logout fails, we should still proceed with clearing local storage
    }
  },

  // Get current auth state
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  },

  // Reset password
  async resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  },

  // Update user profile
  async updateProfile(userData) {
  const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.updateProfile(userData);
    }
  },

  // Start guest session
  async startGuestSession() {
    try {
      const response = await api.post('/users/guest');
      return {
        guestId: response.data.guestId,
        token: response.data.token,
        expiresIn: response.data.expiresIn,
        message: response.data.message
      };
    } catch (error) {
      throw error;
    }
  },

  // Google login
  async googleLogin(idToken) {
    try {
      const response = await api.post('/users/google', {
        idToken: idToken
      });
      
      return {
        token: response.data.token,
        message: response.data.message
      };
    } catch (error) {
      throw error;
    }
  },

  // Phone authentication - Send OTP
  async sendOTP(phoneNumber) {
    try {
      const { signInWithPhoneNumber, RecaptchaVerifier } = await import('firebase/auth');
      const { auth } = await import('../config/firebase');

      // Format phone number to E.164 format (+91XXXXXXXXXX)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      // Create reCAPTCHA verifier for web
      // Check if we're in a web environment
      if (typeof window !== 'undefined') {
        // Clear existing verifier completely
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {
            console.log('Error clearing recaptcha:', e);
          }
          window.recaptchaVerifier = null;
        }

        // Clear the DOM element to ensure clean state
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
          recaptchaContainer.innerHTML = '';
        }

        // Create new RecaptchaVerifier - don't call render(), it will be called automatically
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            console.log('reCAPTCHA solved', response);
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            if (window.recaptchaVerifier) {
              try {
                window.recaptchaVerifier.clear();
              } catch (e) {
                console.log('Error in expired callback:', e);
              }
            }
            window.recaptchaVerifier = null;
          }
        });
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );

      return {
        verificationId: confirmationResult.verificationId,
        confirmationResult
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      // Clear recaptcha on error
      if (typeof window !== 'undefined' && window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log('Error clearing recaptcha on error:', e);
        }
        window.recaptchaVerifier = null;
      }
      throw error;
    }
  },

  // Phone authentication - Verify OTP
  async verifyOTP(confirmationResult, code) {
    try {
      const userCredential = await confirmationResult.confirm(code);
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Register/login with backend using phone
      const response = await api.post('/users/login', {
        idToken: firebaseToken
      });
      
      return {
        user: {
          phone: userCredential.user.phoneNumber,
          uid: userCredential.user.uid,
        },
        token: response.data.token,
        firebaseToken
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }
};