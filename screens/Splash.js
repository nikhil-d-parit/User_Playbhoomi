import React, { useEffect } from "react";
import { View, StyleSheet, ImageBackground, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setAuth } from '../src/store/slices/authSlice';
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native-paper";

const SplashScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [token, userData] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userData')
        ]);
        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch(setAuth({ user, token }));
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        } else {
          navigation.replace('Login');
        }
      } catch (e) {
        navigation.replace('Login');
      }
    };
    bootstrap();
  }, [navigation, dispatch]);

  return (
    <ImageBackground
      source={require("../assets/splash-screen_BG.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.logoContainer}>
        <Image
          style={styles.imageLogo}
          source={require("../assets/logo-white.png")}
        />
        <Text style={styles.welcomeText}>Your game starts here</Text>
      </View>

      <View style={styles.loaderContainer}>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={["#fff", "#fff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.progressBarGradient}
          >
            <View style={styles.progressBarFill} />
          </LinearGradient>
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.version}>Version 1.0</Text>
      </View>
    </ImageBackground>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  background: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
  },
  imageLogo: {
    width: 271.72,
    height: 91,
    resizeMode: "contain",
  },
  welcomeText: {
    fontSize: 16,
    color: "#D3FFDA",
    fontFamily: "Inter_400Regular",
    position: "relative",
    bottom: 10,
  },
  loaderContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  progressBarBackground: {
    width: 180,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#000000ff",
    borderRadius: 4,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  versionContainer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  version: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.7,
    fontFamily: "Inter_400Regular",
  },
});
