import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import api from "../src/services/apiService";

const TopTab = createMaterialTopTabNavigator();

const BookingCard = ({ item, onViewDetails }) => {
  const isCancelled = item.bookingStatus?.toLowerCase() === "cancelled";
  const statusLabel = item.bookingStatus?.charAt(0).toUpperCase() + item.bookingStatus?.slice(1);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.venue} numberOfLines={1}>{item.turfName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isCancelled ? "#FEE2E2" : "#DCFCE7" }]}>
          <View style={[styles.statusDot, { backgroundColor: isCancelled ? "#EF4444" : "#22C55E" }]} />
          <Text style={[styles.statusText, { color: isCancelled ? "#DC2626" : "#16A34A" }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.row}>
        <Ionicons name="location-outline" size={15} color="#6B7280" />
        <Text style={styles.address} numberOfLines={1}>{item.turfLocation}</Text>
      </View>

      {/* Sport */}
      {item.sports && (
        <View style={styles.row}>
          <Ionicons name="football-outline" size={15} color="#6B7280" />
          <Text style={styles.infoText}>
            {item.sports?.charAt(0).toUpperCase() + item.sports?.slice(1)}
          </Text>
        </View>
      )}

      {/* Date & Time */}
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={15} color="#6B7280" />
        <Text style={styles.infoText}>{item.date}</Text>
        <Ionicons name="time-outline" size={15} color="#6B7280" style={{ marginLeft: 12 }} />
        <Text style={styles.infoText}>{item.timeSlot}</Text>
      </View>

      {/* Footer: Booking ID + Button */}
      <View style={styles.cardFooter}>
        <Text style={styles.bookingCode}>#{item.bookingId}</Text>
        <TouchableOpacity style={styles.detailsBtn} onPress={() => onViewDetails(item)}>
          <Text style={styles.detailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color="#007BFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BookingDetailModal = ({ booking, onClose }) => {
  if (!booking) return null;
  const isCancelled = booking.bookingStatus?.toLowerCase() === "cancelled";
  const statusColor = isCancelled ? "#F87171" : "#4ADE80";

  const rows = [
    { label: "Venue", value: booking.turfName },
    { label: "Address", value: booking.turfLocation },
    { label: "Sport", value: booking.sports?.charAt(0).toUpperCase() + booking.sports?.slice(1) },
    { label: "Date", value: booking.date },
    { label: "Time Slot", value: booking.timeSlot },
    { label: "Amount Paid", value: booking.finalAmount ? `₹${booking.finalAmount}` : booking.amount ? `₹${booking.amount}` : "—" },
    { label: "Payment ID", value: booking.paymentId || "—" },
    { label: "Booking ID", value: `#${booking.bookingId}` },
    { label: "Status", value: booking.bookingStatus?.charAt(0).toUpperCase() + booking.bookingStatus?.slice(1), color: statusColor },
  ];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Booking Details</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {rows.map(({ label, value, color }) => (
              value ? (
                <View key={label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text style={[styles.detailValue, color && { color }]}>{value}</Text>
                </View>
              ) : null
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
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
  const [selectedBooking, setSelectedBooking] = useState(null);

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
    <>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.bookingId?.toString()}
        renderItem={({ item }) => (
          <BookingCard item={item} onViewDetails={setSelectedBooking} />
        )}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
      />
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </>
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
    marginHorizontal: 14,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  venue: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1E1E1E",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  address: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginLeft: 6,
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#374151",
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  bookingCode: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
  },
  detailsText: {
    color: "#007BFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginRight: 2,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#000",
    flex: 1,
    textAlign: "right",
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
