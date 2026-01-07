import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from '@expo-google-fonts/inter';
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const FontLoader = ({ children }) => {
  const [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...FontAwesome.font,
  });

  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // fallback after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !timeoutReached) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return children;
};

export default FontLoader;