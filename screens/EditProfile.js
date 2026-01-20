import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../src/store/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../src/config/firebase';
import { updateProfile } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/apiService';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || user?.mobile || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || 'https://i.pravatar.cc/100?img=1');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch complete user profile on mount
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        const userData = response.data.user;
        
        // Update local state with fetched data
        if (userData.name) setName(userData.name);
        if (userData.phone) setPhone(userData.phone);
        if (userData.photoURL) setPhotoURL(userData.photoURL);
        
        // Update Redux store with complete data
        dispatch(setUser({
          ...user,
          ...userData,
          displayName: userData.name,
          mobile: userData.phone,
        }));
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Request permissions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload photos.');
        return false;
      }
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Updated from MediaTypeOptions.Images
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Upload image to Cloudinary via backend
  const uploadImage = async (uri) => {
    try {
      setUploading(true);

      // Create FormData for image upload
      const formData = new FormData();
      
      // For web, convert URI to blob
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('image', blob, 'profile.jpg');
      } else {
        // For mobile
        formData.append('image', {
          uri: uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      // Upload to backend (which will upload to Cloudinary)
      const response = await api.post('/upload/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.url;
      setPhotoURL(imageUrl);

      Toast.show({
        type: 'success',
        text1: 'Photo Uploaded',
        text2: 'Profile photo uploaded successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', error.response?.data?.message || 'Failed to upload profile photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: name,
        photoURL: photoURL,
      });

      // Update backend/Firestore via API
      await api.put('/users/profile', {
        name: name,
        phone: phone,
        photoURL: photoURL,
      });

      // Update Redux store
      const updatedUser = {
        ...user,
        name: name,
        displayName: name,
        phone: phone,
        mobile: phone,
        photoURL: photoURL,
      };
      dispatch(setUser(updatedUser));

      // Update AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Update Failed', error.response?.data?.message || error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Photo */}
      <View style={styles.photoSection}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: photoURL }} style={styles.avatar} />
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage} disabled={uploading}>
          <Ionicons name="camera" size={20} color="#004CE8" />
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            editable={false}
            placeholder="Email"
            placeholderTextColor="#999"
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={phone}
            editable={false}
            placeholder="Phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
          <Text style={styles.helperText}>Phone number cannot be changed</Text>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#004CE8',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#004CE8',
  },
  changePhotoText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#004CE8',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#004CE8',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
