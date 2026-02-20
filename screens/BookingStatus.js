import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectUser } from "../src/store/slices/authSlice";
// Conditionally import Razorpay only on native platforms
let RazorpayCheckout = null;
if (Platform.OS !== 'web') {
  try {
    RazorpayCheckout = require("react-native-razorpay").default;
  } catch (e) {
    console.warn("Razorpay not available:", e.message);
  }
}
import locationIcon from "../assets/icons/gray/icon-loaction-gradient.png";
import turfImage from "../assets/TURF1.jpeg";
import clockIcon from "../assets/icons/gradient/icon-timelapse-gradient.png";
import calenderIcon from "../assets/icons/gradient/icon-calendar-gradient.png";
import cricketGradBat from "../assets/icons/gradient/icon-cricket-gradient.png";
import footBallIconGrad from "../assets/icons/gradient/icon-football-gradient.png";
import tennisIconGrad from "../assets/icons/gradient/icon-tennis-gradient.png";
import api from "../src/services/apiService";

const BookingStatus = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get data from navigation params
  const { bookingSummary, userLocks = [], date } = route.params || {};

  const currentUser = useSelector(selectUser);

  const [processing, setProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(null);
  const lockTimerRef = useRef(null);
  const autoExtendTriggeredRef = useRef(false);

  // Lock countdown timer + auto-extend
  useEffect(() => {
    if (!userLocks || userLocks.length === 0 || bookingConfirmed) return;

    // Find earliest lock expiry from the locks passed via navigation
    // Locks have expiresAt from the backend response
    const expiryTimes = userLocks
      .map((lock) => lock.expiresAt ? new Date(lock.expiresAt).getTime() : null)
      .filter(Boolean);

    if (expiryTimes.length === 0) {
      // Fallback: assume 10 min from now if no expiresAt provided
      const fallback = Date.now() + 10 * 60 * 1000;
      expiryTimes.push(fallback);
    }

    const earliestExpiry = Math.min(...expiryTimes);

    lockTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((earliestExpiry - Date.now()) / 1000));
      setLockSecondsLeft(remaining);

      // Auto-extend locks when less than 2 minutes remaining
      if (remaining > 0 && remaining <= 120 && !autoExtendTriggeredRef.current && !processing) {
        autoExtendTriggeredRef.current = true;
        // Re-call lock endpoint for each lock to extend
        userLocks.forEach(async (lock) => {
          try {
            await api.post("/slots/lock", {
              vendorId: bookingSummary?.vendorId,
              turfId: bookingSummary?.turfId,
              sport: (bookingSummary?.selectedSport || "").toLowerCase(),
              date,
              timeSlot: lock.slot,
            });
          } catch (err) {
            console.warn("Auto-extend lock failed:", err.message);
          }
        });
      }
    }, 1000);

    return () => {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [userLocks, bookingConfirmed, processing, bookingSummary, date]);

  // Format seconds to MM:SS
  const formatCountdown = useCallback((seconds) => {
    if (seconds === null) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

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
      if (bookingConfirmed) {
        return;
      }

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
  }, [navigation, userLocks, processing, bookingConfirmed]);

  const buildBookingDetails = () => ({
    vendorId: bookingSummary?.vendorId,
    turfId: bookingSummary?.turfId,
    sports: selectedSport.toLowerCase(),
    selectedSlots: bookingSummary?.selectedSlots || [],
    date,
    finalAmount,
  });

  const verifyPaymentAndCreateBooking = async (paymentResponse, fallbackOrderId) => {
    const verifyRes = await api.post("/bookings/verify-payment", {
      razorpay_payment_id: paymentResponse?.razorpay_payment_id,
      razorpay_order_id: paymentResponse?.razorpay_order_id || fallbackOrderId,
      razorpay_signature: paymentResponse?.razorpay_signature,
      bookingDetails: buildBookingDetails(),
      userLocks,
    });

    setBookingConfirmed(true);
    setProcessing(false);

    const paymentId = paymentResponse?.razorpay_payment_id;
    const bookingId = verifyRes?.data?.bookingId;
    const message = `Booking Confirmed!\n\nPayment ID: ${paymentId}\nBooking ID: ${bookingId}`;

    if (Platform.OS === "web") {
      window.alert(message);
      navigation.navigate("Home");
      return;
    }

    Alert.alert("Booking Confirmed", message, [
      {
        text: "Go to Home",
        onPress: () => navigation.navigate("Home"),
      },
    ]);
  };

  const handlePayment = async () => {
    if (processing) return;
    if (!bookingSummary?.turfId || !bookingSummary?.vendorId || !date) {
      Alert.alert("Error", "Booking information is incomplete");
      return;
    }

    const razorpayKey = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      Alert.alert("Configuration Error", "Payment system is not configured. Please contact support.");
      return;
    }
    setProcessing(true);

    let orderData;
    try {
      const orderRes = await api.post("/bookings/create-order", {
        bookingDetails: buildBookingDetails(),
      });
      orderData = orderRes?.data;
      if (!orderData?.orderId) {
        throw new Error("Failed to create Razorpay order");
      }
    } catch (error) {
      setProcessing(false);
      Alert.alert(
        "Payment Init Failed",
        error?.response?.data?.message || error?.message || "Unable to create payment order"
      );
      return;
    }

    if (Platform.OS === "web") {
      try {
        const loadRazorpayScript = () =>
          new Promise((resolve) => {
            if (window.Razorpay) {
              resolve(true);
              return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setProcessing(false);
          window.alert("Failed to load Razorpay. Please try again.");
          return;
        }

        const options = {
          key: razorpayKey,
          order_id: orderData.orderId,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "PlayBhoomi",
          description: `Booking at ${bookingSummary?.turfTitle || "Sports Arena"}`,
          image: "https://i.pravatar.cc/100?img=1",
          handler: async function (response) {
            try {
              await verifyPaymentAndCreateBooking(response, orderData.orderId);
            } catch (err) {
              setProcessing(false);
              window.alert(
                err?.response?.data?.message ||
                  "Payment succeeded but booking verification failed. Contact support."
              );
            }
          },
          prefill: {
            name: currentUser?.name || "User",
            email: currentUser?.email || "",
            contact: currentUser?.phone || "",
          },
          theme: {
            color: "#00C247",
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            },
            escape: false,
            backdrop_close: false,
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on("payment.failed", function (response) {
          setProcessing(false);
          window.alert(
            `Payment Failed!\n\nReason: ${response?.error?.description || "Unknown error"}`
          );
        });
        razorpayInstance.open();
      } catch (error) {
        setProcessing(false);
        window.alert(
          error?.message || "Payment initialization failed. Please try again."
        );
      }
      return;
    }

    if (!RazorpayCheckout) {
      setProcessing(false);
      Alert.alert("Error", "Razorpay is not available on this platform");
      return;
    }

    try {
      const options = {
        description: `Booking at ${bookingSummary?.turfTitle || "Sports Arena Complex"}`,
        image: "https://i.pravatar.cc/100?img=1",
        currency: orderData.currency || "INR",
        key: razorpayKey,
        amount: orderData.amount,
        order_id: orderData.orderId,
        name: "PlayBhoomi",
        prefill: {
          name: currentUser?.name || "User",
          email: currentUser?.email || "",
          contact: currentUser?.phone || "",
        },
        theme: { color: "#00C247" },
      };

      const paymentResult = await RazorpayCheckout.open(options);
      if (!paymentResult?.razorpay_payment_id) {
        throw new Error("Invalid payment response");
      }

      await verifyPaymentAndCreateBooking(paymentResult, orderData.orderId);
    } catch (error) {
      setProcessing(false);
      Alert.alert(
        "Payment Failed",
        error?.response?.data?.message ||
          error?.description ||
          error?.message ||
          "Payment cancelled or failed"
      );
    }
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

        {/* Lock Warning Banner with Countdown */}
        {userLocks.length > 0 && (
          <View style={[styles.lockBanner, lockSecondsLeft !== null && lockSecondsLeft <= 120 && lockSecondsLeft > 0 && { backgroundColor: "#FFE0E0", borderColor: "#D32F2F" }]}>
            <MaterialIcons name="lock-clock" size={18} color={lockSecondsLeft !== null && lockSecondsLeft <= 120 ? "#D32F2F" : "#856404"} />
            <Text style={[styles.lockBannerText, lockSecondsLeft !== null && lockSecondsLeft <= 120 && lockSecondsLeft > 0 && { color: "#D32F2F" }]}>
              {lockSecondsLeft === null
                ? "Slots reserved for 10 minutes. Complete payment to confirm."
                : lockSecondsLeft <= 0
                ? "Lock expired! Payment may still work — we'll try to re-acquire."
                : `Slots reserved — ${formatCountdown(lockSecondsLeft)} remaining. Complete payment to confirm.`}
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
