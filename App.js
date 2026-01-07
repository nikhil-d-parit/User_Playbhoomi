import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import FontLoader from "./components/FontLoader";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import Toast from 'react-native-toast-message';

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import SplashScreen from "./screens/Splash";
import LoginScreen from "./screens/Login";
import SignUpScreen from "./screens/Signup";
import OTPScreen from "./screens/Otp";
import HomeScreen from "./screens/Home";
import NotificationScreen from "./screens/Notification";
import BookingsScreen from "./screens/Bookings";
import ProfileScreen from "./screens/Profile";
import VenueDetails from "./screens/VenueDetails";
import BookScreen from "./screens/Book";
import BookingStatus from "./screens/BookingStatus";
import CheckoutScreen from "./screens/Checkout";
import ChangePasswordScreen from "./screens/ChangePassword";
import HelpSupportScreen from "./screens/HelpSupport";

// Navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Wrapper with optional insets
const ScreenWrapper =
  (Component, { withInsets = false, onlyTopInset = false } = {}) =>
  (props) => {
    const insets = useSafeAreaInsets();
    let wrapperStyle = [styles.screenContainer];
    if (withInsets) {
      wrapperStyle.push({
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      });
    } else if (onlyTopInset) {
      wrapperStyle.push({ paddingTop: insets.top });
    }
    return (
      <View style={wrapperStyle}>
        <Component {...props} />
      </View>
    );
  };

const MyTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const iconName =
          route.name === "Home"
            ? "home"
            : route.name === "Notification"
            ? "notifications"
            : route.name === "Bookings"
            ? "calendar"
            : "person";
        return {
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <LinearGradient
              colors={focused ? ["#007BFF", "#0CBE1E"] : ["gray", "gray"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Ionicons
                name={focused ? iconName : `${iconName}-outline`}
                size={15}
                color="white"
              />
            </LinearGradient>
          ),
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tabLabel, { color }]}>{route.name}</Text>
          ),
          tabBarActiveTintColor: "#4facfe",
          tabBarInactiveTintColor: "gray",
        };
      }}
    >
      <Tab.Screen
        name="Home"
        component={ScreenWrapper(HomeScreen, { onlyTopInset: true })}
      />
      <Tab.Screen
        name="Notification"
        component={ScreenWrapper(NotificationScreen, { withInsets: true })}
        options={{
          headerShown: true,
          title: "Notification",
          headerTitleAlign: "center",
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={ScreenWrapper(BookingsScreen, { onlyTopInset: true })}
        options={{
          headerShown: true,
          title: "Bookings",
          headerTitleAlign: "center",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ScreenWrapper(ProfileScreen, { withInsets: true })}
        options={{
          headerShown: true,
          title: "Profile",
          headerTitleAlign: "center",
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <FontLoader>
            <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash">
            {/* Full safe area screens */}
            <Stack.Screen
              name="Splash"
              component={ScreenWrapper(SplashScreen, { withInsets: true })}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={ScreenWrapper(LoginScreen, { withInsets: true })}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={ScreenWrapper(SignUpScreen, { withInsets: true })}
              options={{
                title: "Create Account",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="OTP"
              component={ScreenWrapper(OTPScreen, { withInsets: true })}
              options={{ headerShown: false }}
            />

            {/* Tab navigator */}
            <Stack.Screen
              name="Home"
              component={MyTabs}
              options={{ headerShown: false }}
            />

            {/* Other stack screens with headers */}
            <Stack.Screen
              name="VenueDetails"
              component={ScreenWrapper(VenueDetails, { withInsets: true })}
              options={{
                title: "Venue Details",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="Notification"
              component={ScreenWrapper(NotificationScreen, {
                withInsets: true,
              })}
              options={{
                title: "Notification",
                headerShown: true,
                headerLeft: () => (
                  <TouchableOpacity onPress={() => {}}>
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color="black"
                      style={{ marginLeft: 20 }}
                    />
                  </TouchableOpacity>
                ),
                headerLeftContainerStyle: { marginLeft: 10 },
                headerRight: () => (
                  <TouchableOpacity onPress={() => console.log("Bell Pressed")}>
                    <Ionicons
                      name="notifications"
                      size={24}
                      color="black"
                      style={{ marginRight: 10 }}
                    />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="BookScreen"
              component={ScreenWrapper(BookScreen, { withInsets: true })}
              options={{
                title: "Book",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="BookingStatus"
              component={ScreenWrapper(BookingStatus, { withInsets: true })}
              options={{
                title: "Booking Summary",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="CheckoutScreen"
              component={ScreenWrapper(CheckoutScreen, { withInsets: true })}
              options={{
                title: "Checkout",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="ChangePasswordScreen"
              component={ScreenWrapper(ChangePasswordScreen, {
                withInsets: true,
              })}
              options={{
                title: "Change Password",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="HelpSupportScreen"
              component={ScreenWrapper(HelpSupportScreen, { withInsets: true })}
              options={{
                title: "Help Support",
                headerShown: true,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
            </FontLoader>
            <Toast />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  iconContainer: {
    borderRadius: 20,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
