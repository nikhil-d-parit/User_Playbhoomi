import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import RazorpayCheckout from "react-native-razorpay";
import locationIcon from "../assets/icons/gray/icon-loaction-gradient.png";
import turfImage from "../assets/TURF1.jpeg";
import clockIcon from "../assets/icons/gradient/icon-timelapse-gradient.png";
import calenderIcon from "../assets/icons/gradient/icon-calendar-gradient.png";
import cricketGradBat from "../assets/icons/gradient/icon-cricket-gradient.png";
import footBallIconGrad from "../assets/icons/gradient/icon-football-gradient.png";
import tennisIconGrad from "../assets/icons/gradient/icon-tennis-gradient.png";

const BookingStatus = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get data from navigation params
  const { bookingSummary, userLocks = [], date } = route.params || {};

  const [processing, setProcessing] = useState(false);

  // Sport icons mapping
  const sportIcons = {
    cricket: cricketGradBat,
    football: footBallIconGrad,
    tennis: tennisIconGrad,
  };

  // Calculate values from booking summary
  const pricePerSlot = bookingSummary?.pricePerSlot || 0;
  const totalSlots = bookingSummary?.totalSlots || 0;
  const baseAmount = bookingSummary?.baseAmount || 0;
  const taxRate = bookingSummary?.taxRate || 0;
  const taxAmount = bookingSummary?.taxAmount || 0;
  const convenienceFee = bookingSummary?.convenienceFee || 0;
  const discountRate = bookingSummary?.discountRate || 0;
  const discountAmount = bookingSummary?.discountAmount || 0;
  const finalAmount = bookingSummary?.finalAmount || 0;
  const totalBeforeDiscount = baseAmount + taxAmount + convenienceFee;

  // Get sport icon
  const selectedSport = bookingSummary?.selectedSport || "cricket";
  const sportIcon = sportIcons[selectedSport.toLowerCase()] || cricketGradBat;

  // Format slots for display
  const formatSlots = () => {
    const slots = bookingSummary?.selectedSlots || [];
    if (slots.length === 0) return "8:00 AM - 9:00 AM (1hr)";
    if (slots.length === 1) return slots[0];
    return `${slots[0]} + ${slots.length - 1} more`;
  };

  // Handle payment
  // const handlePayment = async () => {
  //   if (!bookingSummary) {
  //     Alert.alert("Error", "Booking information is missing");
  //     return;
  //   }

  //   setProcessing(true);

  //   try {
  //     // Step 1: Confirm all locks
  //     if (userLocks.length > 0) {
  //       await Promise.all(
  //         userLocks.map(async ({ lockId }) => {
  //           try {
  //             await api.patch(`/slots/confirm/${lockId}`);
  //           } catch (err) {
  //             console.error("Error confirming lock:", err);
  //           }
  //         })
  //       );
  //     }

  //     // Step 2: Create booking for each slot
  //     const bookingPromises = (bookingSummary.selectedSlots || []).map(async (timeSlot) => {
  //       const bookingData = {
  //         orderId: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  //         amount: pricePerSlot,
  //         turfId: bookingSummary.turfId,
  //         vendorId: bookingSummary.vendorId || "",
  //         timeSlot,
  //         date,
  //         sports: selectedSport.toLowerCase(),
  //       };

  //       return api.post("/bookings/mock-payment-success", bookingData);
  //     });

  //     await Promise.all(bookingPromises);

  //     // Step 3: Show success and navigate
  //     Alert.alert(
  //       "Booking Confirmed!",
  //       `Your booking at ${bookingSummary.turfTitle || "the turf"} has been confirmed.`,
  //       [
  //         {
  //           text: "View My Bookings",
  //           onPress: () => navigation.navigate("Bookings"),
  //         },
  //         {
  //           text: "Go Home",
  //           onPress: () => navigation.navigate("Home"),
  //         },
  //       ]
  //     );
  //   } catch (err) {
  //     console.error("Payment error:", err.response?.data || err.message);
  //     Alert.alert("Payment Failed", "There was an error processing your payment. Please try again.");
  //   } finally {
  //     setProcessing(false);
  //   }
  // };

  // Cleanup locks if user goes back without completing payment
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (processing) {
        e.preventDefault();
        return;
      }

      // Release locks if going back
      userLocks.forEach(async ({ lockId }) => {
        try {
          await api.delete(`/slots/unlock/${lockId}`);
        } catch (err) {
          console.error("Error releasing lock on back:", err);
        }
      });
    });

    return unsubscribe;
  }, [navigation, userLocks, processing]);

  const handlePayment = () => {
    const options = {
      description: "Booking - Sports Arena Complex",
      image: "https://i.pravatar.cc/100?img=1",
      currency: "INR",
      key: "rzp_test_S3FeXSaaVbsCC4",
      amount: 51750, // ✅ MUST be number (paise)
      name: "PlayBhoomi",

      // ❌ Do NOT send order_id unless from backend
      // order_id: "order_xxxxxx",

      prefill: {
        email: "nikhilparit@gmail.com",
        contact: "8668523316",
        name: "User",
      },
      theme: { color: "#00C247" },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        if (data?.razorpay_payment_id) {
          Alert.alert(
            "Payment Successful",
            `Payment ID: ${data.razorpay_payment_id}`
          );

          // navigation.navigate("Home");
        } else {
          Alert.alert("Payment Failed", "Invalid payment response");
        }
      })
      .catch((error) => {
        console.log(
          "Razorpay Error:",
          JSON.stringify(error, null, 2)
        );

        Alert.alert(
          "Payment Failed",
          error?.description ||
            error?.message ||
            "Payment cancelled or failed"
        );
      });
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerImageWrapper}>
              <Image source={turfImage} style={styles.headerImage} />
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {bookingSummary?.turfTitle || "Sports Arena Complex"}
              </Text>
              <View style={styles.locationRow}>
                <Image source={locationIcon} style={styles.locationIcon} />
                <Text style={styles.locationText}>
                  {bookingSummary?.location || "Sector 18, Noida, UP"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lock Warning Banner */}
        {userLocks.length > 0 && (
          <View style={styles.lockBanner}>
            <MaterialIcons name="lock-clock" size={18} color="#856404" />
            <Text style={styles.lockBannerText}>
              Slots reserved for 10 minutes. Complete payment to confirm.
            </Text>
          </View>
        )}

        {/* Sports */}
        <Text style={styles.sectionTitle}>Sports</Text>
        <View style={styles.rowWithIcon}>
          <Image source={sportIcon} style={styles.iconSmall} />
          <Text style={styles.detailText}>
            {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}
          </Text>
        </View>

        {/* Date & Time */}
        <Text style={styles.sectionTitle}>Date & Time</Text>
        <View style={styles.rowWithIcon}>
          <Image source={calenderIcon} style={styles.iconSmall} />
          <Text style={styles.detailText}>{date || "Saturday, 04/10/2025"}</Text>
        </View>
        <View style={styles.rowWithIcon}>
          <Image source={clockIcon} style={styles.iconSmall} />
          <Text style={styles.detailText}>{formatSlots()}</Text>
        </View>

        {/* Selected Slots List */}
        {bookingSummary?.selectedSlots?.length > 1 && (
          <View style={styles.slotsListContainer}>
            <Text style={styles.slotsListTitle}>Selected Slots:</Text>
            {bookingSummary.selectedSlots.map((slot, index) => (
              <View key={index} style={styles.slotItem}>
                <MaterialIcons name="access-time" size={14} color="#004CE8" />
                <Text style={styles.slotItemText}>{slot}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Booking Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Summary</Text>

          <View style={styles.cardRow}>
            <View>
              <Text style={styles.itemLabel}>
                {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} - {totalSlots} Slot{totalSlots > 1 ? "s" : ""}
              </Text>
              <Text style={[styles.itemSubLabel, { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#757575' }]}>
                Rs.{pricePerSlot}/slot
              </Text>
            </View>
            <Text style={styles.itemValue}>Rs.{baseAmount}.00</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.itemLabel}>Tax ({taxRate}%)</Text>
            <Text style={styles.itemValue}>Rs.{taxAmount}.00</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.itemLabel}>Convenience Fee</Text>
            <Text style={styles.itemValue}>Rs.{convenienceFee}.00</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.itemLabel}>Booking Amount</Text>
            <Text style={styles.itemValue}>Rs.{totalBeforeDiscount}.00</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.itemLabel}>Discount Applied ({discountRate}%)</Text>
            <Text style={[styles.itemValue, { color: "#00C247" }]}>-Rs.{discountAmount}.00</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.cardRow}>
            <Text style={styles.totalLabel}>Total Booking Amount</Text>
            <Text style={styles.totalValue}>Rs.{finalAmount}.00</Text>
          </View>
        </View>

        {/* Savings message */}
        <View style={styles.bottomBanner}>
          <MaterialIcons name="celebration" size={20} color="#00C247" />
          <Text style={styles.savedText}>
            You saved <Text style={styles.greenAmount}>Rs.{discountAmount}.00</Text> on this booking
          </Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={styles.gradientButton}
          onPress={handlePayment}
          disabled={processing}
        >
          <LinearGradient
            colors={processing ? ["#999", "#666"] : ["#00C247", "#004CE8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1.5 }}
            style={styles.gradientButtonBg}
          >
            {processing ? (
              <View style={styles.processingRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.gradientButtonText, { marginLeft: 8 }]}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.gradientButtonText}>Pay Rs.{finalAmount}.00</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={processing}
        >
          <Text style={styles.cancelButtonText}>Cancel & Release Slots</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
    marginTop: -20,
  },

  headerCard: {
    backgroundColor: "#F3F3F5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerContent: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1E1E1E",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#757575",
  },

  lockBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  lockBannerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#856404",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    color: "#303030",
  },
  rowWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  iconSmall: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#1E1E1E",
  },

  slotsListContainer: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  slotsListTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  slotItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  slotItemText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#333",
  },

  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#303030",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: "#000",
  },
  itemSubLabel: {
    fontSize: 14,
    color: "#1E1E1E",
    marginTop: 2,
  },
  itemValue: {
    fontSize: 14,
    color: "#1E1E1E",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },

  bottomBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FFF0",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  savedText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#1E1E1E",
  },
  greenAmount: {
    color: "#00C247",
    fontSize: 14,
  },

  gradientButton: {
    marginTop: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  gradientButtonBg: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  gradientButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  cancelButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#D32F2F",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default BookingStatus;
