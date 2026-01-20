// config.js - Environment-based configuration for Expo
// 
// IMPORTANT: Expo requires EXPO_PUBLIC_ prefix for environment variables
// Variables are loaded from .env file and accessible via process.env
//
// To use different environments:
// 1. Development: Uses .env file
// 2. Production: Set EXPO_PUBLIC_API_URL before build/deploy

const getEnvVars = () => {
  // Check if we're in development or production
  const isDev = __DEV__;
  
  return {
    // API Configuration
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
    
    // Firebase Configuration
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    
    // Google OAuth Client IDs
    GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    GOOGLE_EXPO_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    
    // Environment info (for debugging)
    IS_DEV: isDev,
  };
};

const config = getEnvVars();

// Log the config in development (helpful for debugging)
if (__DEV__) {
  console.log('📱 User App Config:', {
    API_URL: config.API_URL,
    IS_DEV: config.IS_DEV,
    // Don't log sensitive Firebase keys
  });
}

export default config;
