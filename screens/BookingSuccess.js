import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import moment from "moment";

import locationIcon from "../assets/icons/gray/icon-loaction-gradient.png";
import clockIcon from "../assets/icons/gradient/icon-timelapse-gradient.png";
import calenderIcon from "../assets/icons/gradient/icon-calendar-gradient.png";

const BookingSuccess = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    paymentId,
    bookingId,
    turfTitle,
    location,
    sport,
    date,
    selectedSlots = [],
    finalAmount,
  } = route.params || {};

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  const goToBookings = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }, { name: "Bookings" }],
      })
    );
  };

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconCircle}>
        <MaterialIcons name="check-circle" size={80} color="#00C247" />
      </View>

      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>
        Your booking has been successfully confirmed
      </Text>

      {/* Booking Details Card */}
      <View style={styles.card}>
        <Text style={styles.turfName}>{turfTitle || "Sports Arena"}</Text>

        {location ? (
          <View style={styles.row}>
            <Image source={locationIcon} style={styles.icon} />
            <Text style={styles.detailText}>{location}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Image source={calenderIcon} style={styles.icon} />
          <Text style={styles.detailText}>
            {date ? moment(date).format("ddd, Do MMM YYYY") : "—"}
          </Text>
        </View>

        <View style={styles.row}>
          <Image source={clockIcon} style={styles.icon} />
          <Text style={styles.detailText}>
            {selectedSlots.length === 1
              ? selectedSlots[0]
              : `${selectedSlots.length} slots booked`}
          </Text>
        </View>

        {selectedSlots.length > 1 && (
          <View style={styles.slotsWrap}>
            {selectedSlots.map((slot, i) => (
              <View key={i} style={styles.slotChip}>
                <Text style={styles.slotChipText}>{slot}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sport</Text>
          <Text style={styles.infoValue}>
            {sport ? sport.charAt(0).toUpperCase() + sport.slice(1) : "—"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Amount Paid</Text>
          <Text style={[styles.infoValue, { color: "#00C247", fontWeight: "700" }]}>
            Rs.{finalAmount || 0}.00
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment ID</Text>
          <Text style={styles.infoValueSmall}>{paymentId || "—"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Booking ID</Text>
          <Text style={styles.infoValueSmall}>{bookingId || "—"}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.primaryBtn} onPress={goToBookings}>
        <LinearGradient
          colors={["#00C247", "#004CE8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1.5 }}
          style={styles.primaryBtnBg}
        >
          <Text style={styles.primaryBtnText}>View My Bookings</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={goHome}>
        <Text style={styles.secondaryBtnText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconCircle: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E1E1E",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  turfName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  slotsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  slotChip: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  slotChipText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#757575",
  },
  infoValue: {
    fontSize: 14,
    color: "#1E1E1E",
    fontWeight: "500",
  },
  infoValueSmall: {
    fontSize: 12,
    color: "#1E1E1E",
    maxWidth: "60%",
    textAlign: "right",
  },
  primaryBtn: {
    width: "100%",
    marginTop: 24,
    borderRadius: 8,
    overflow: "hidden",
  },
  primaryBtnBg: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    marginTop: 12,
    padding: 12,
  },
  secondaryBtnText: {
    color: "#004CE8",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default BookingSuccess;
