// screens/Notifications.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../src/services/apiService"; // ✅ your axios instance

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/notifications");
      console.log("Notifications API:", res.data);
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      Alert.alert("Error", "Failed to load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Load once when screen mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // ✅ Loading indicator
  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#004CE8" />
      </View>
    );
  }

  // ✅ If no notifications
  if (!loading && notifications.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#555" }}>No notifications found.</Text>
      </View>
    );
  }

  // ✅ Helper: format time (simple)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Map server response into your display format
  const mappedNotifications = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    time: formatDate(n.createdAt),
    icon: n.read ? "notifications-none" : "notifications-active",
    color: n.read ? "#888" : "#004CE8",
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 15 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Notifications</Text>

      {mappedNotifications.map((n) => (
        <View key={n.id} style={styles.card}>
          <View style={styles.row}>
            <MaterialIcons
              name={n.icon}
              size={22}
              color={n.color}
              style={styles.icon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.message}>{n.message}</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#343A40",
    marginTop: 15,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  icon: {
    marginRight: 10,
    marginTop: 2,
  },

  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#212529",
    marginBottom: 2,
  },

  message: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#555",
    marginBottom: 4,
  },

  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#888",
  },
});
