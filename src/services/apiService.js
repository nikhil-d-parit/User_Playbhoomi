import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'https://venue-backend-vigy.onrender.com/api';

// Create a custom axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get the firebase token
        const firebaseToken = await AsyncStorage.getItem('firebaseToken');
        
        // Try to get a new token from the server
        const response = await axios.post(`${API_URL}/users/refresh-token`, {
          idToken: firebaseToken
        });

        const { token } = response.data;

        // Store the new token
        await AsyncStorage.setItem('userToken', token);

        // Update the failed request's authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry the request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        // You'll need to implement this navigation logic where you use this service
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;