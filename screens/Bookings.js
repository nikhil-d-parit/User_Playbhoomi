import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import api from "../src/services/apiService";

const TopTab = createMaterialTopTabNavigator();

const BookingCard = ({ item }) => {
  const isCancelled = item.bookingStatus?.toLowerCase() === "cancelled";

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.venue}>{item.turfName}</Text>
        <Text
          style={[
            styles.status,
            { backgroundColor: isCancelled ? "#F87171" : "#4ADE80" },
          ]}
        >
          {item.bookingStatus?.charAt(0).toUpperCase() +
            item.bookingStatus?.slice(1)}
        </Text>
      </View>

      {/* Address */}
      <Text style={styles.address}>{item.turfLocation}</Text>

      {/* Date & Time */}
      <View style={styles.row}>
        <Ionicons name="calendar" size={18} color="#007BFF" />
        <Text style={styles.dateText}>
          {"  "}
          {item.date} — {item.timeSlot}
        </Text>
      </View>

      {/* Booking ID */}
      <Text style={styles.bookingCode}>Booking ID: #{item.bookingId}</Text>

      {/* Button */}
      <TouchableOpacity style={styles.detailsBtn}>
        <Text style={styles.detailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const fetchAllBookings = async () => {
  const response = await api.get("/users/my-bookings");
  return response.data.bookings || [];
};

const BookingList = ({ filter, emptyMessage }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await fetchAllBookings();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filtered = all.filter((b) => {
          const bookingDate = new Date(b.date);
          return filter === "upcoming" ? bookingDate >= today : bookingDate < today;
        });
        setBookings(filtered);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Failed to load bookings. Please try again.</Text>
      </View>
    );
  }

  if (!bookings.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.bookingId?.toString()}
      renderItem={({ item }) => <BookingCard item={item} />}
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
    />
  );
};

const Upcoming = () => (
  <BookingList filter="upcoming" emptyMessage="No upcoming bookings" />
);

const Past = () => (
  <BookingList filter="past" emptyMessage="No past bookings" />
);

export default function BookingsScreen() {
  return (
    <View style={{ flex: 1, marginTop: -23 }}>
      <TopTab.Navigator
        screenOptions={{
          tabBarIndicatorStyle: { backgroundColor: "#007BFF" },
          tabBarLabelStyle: {
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
          },
          tabBarStyle: { height: 40 },
        }}
      >
        <TopTab.Screen name="Upcoming" component={Upcoming} />
        <TopTab.Screen name="Past" component={Past} />
      </TopTab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 12,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  venue: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
  },
  address: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "gray",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#000",
  },
  bookingCode: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "gray",
  },
  detailsBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#007BFF",
  },
  detailsText: {
    color: "#007BFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  status: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#777",
  },
});
