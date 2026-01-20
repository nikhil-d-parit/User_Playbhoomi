import React from "react"; // removed unused useState
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

const BookingStatus = () => {
  const navigation = useNavigation();

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
              <Text style={styles.headerTitle}>Sports Arena Complex</Text>
              <View style={styles.locationRow}>
                <Image source={locationIcon} style={styles.locationIcon} />
                <Text style={styles.locationText}>Sector 18, Noida, UP</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sports */}
        <Text style={styles.sectionTitle}>Sports</Text>
        <View style={styles.rowWithIcon}>
          <Image source={cricketGradBat} style={styles.iconSmall} />
          <Text style={styles.detailText}>Cricket</Text>
        </View>

        {/* Date & Time */}
        <Text style={styles.sectionTitle}>Date & Time</Text>
        <View style={styles.rowWithIcon}>
          <Image source={calenderIcon} style={styles.iconSmall} />
          <Text style={styles.detailText}>Saturday, 04/10/2025</Text>
        </View>
        <View style={styles.rowWithIcon}>
          <Image source={clockIcon} style={styles.iconSmall} />
          <Text style={styles.detailText}>8:00 AM - 9:00 AM (1hr)</Text>
        </View>

        {/* Booking Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Summary</Text>

          <View style={styles.cardRow}>
            <View>
              <Text style={styles.itemLabel}>Cricket Court - 1 Hour</Text>
              <Text style={[styles.itemSubLabel,{fontFamily:'Inter_400Regular', fontSize:14, color:'#757575'}]}>₹500/hr</Text>
            </View>
            <Text style={styles.itemValue}>₹500.00</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.itemLabel}>Tax (8%)</Text>
            <Text style={styles.itemValue}>₹40.00</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.itemLabel}>Convenience Fee</Text>
            <Text style={styles.itemValue}>₹35.00</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.itemLabel}>Booking Amount</Text>
            <Text style={styles.itemValue}>₹575.00</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.itemLabel}>Discount Applied (10%)</Text>
            <Text style={styles.itemValue}>₹57.50</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.cardRow}>
            <Text style={styles.totalLabel}>Total Booking Amount</Text>
            <Text style={styles.totalValue}>₹517.50</Text>
          </View>
        </View>

        {/* Savings message */}
        <View style={styles.bottomBanner}>
          <MaterialIcons name="celebration" size={20} color="#00C247" />
          <Text style={styles.savedText}>
            You saved <Text style={styles.greenAmount}>₹57.50</Text> on this booking
          </Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={styles.gradientButton}
          onPress={handlePayment}
        >
          <LinearGradient
            colors={["#00C247", "#004CE8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1.5 }}
            style={styles.gradientButtonBg}
          >
            <Text style={styles.gradientButtonText}>Pay</Text>
          </LinearGradient>
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
    fontFamily:"Inter500Medium",
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
    fontFamily:"Inter400Regular"
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily:"Inter_600SemiBold",
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
    fontFamily:"Inter_600SemiBold",
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
    fontFamily:'Inter_400Regular'
  },
  itemSubLabel: {
    fontSize: 14,
    color: "#1E1E1E",
    marginTop: 2,
    fontFamily:'Inter_400Regular'
  },
  itemValue: {
    fontSize: 14,
    color: "#1E1E1E",
     fontFamily:'Inter_400Regular'
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
    fontFamily:'Inter_400Regular'
  },
  greenAmount: {
    color: "#00C247",
   fontFamily:'Inter_400Regular',
   fontSize:14
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
});

export default BookingStatus;
