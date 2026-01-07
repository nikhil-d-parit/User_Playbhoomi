import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const [upiId, setUpiId] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Venue Card */}
      <View style={styles.venueCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.venueTitle}>Sports Arena Central</Text>
          <Text style={styles.venueSubtitle}>Sector 18, Noida</Text>
          <Text style={styles.venueDate}>10 July, 8:00 AM - 9:00 AM</Text>
        </View>
        <View style={styles.venueIcon}>
          <MaterialIcons name="sports-soccer" size={28} color="#fff" />
        </View>
      </View>

      {/* Price Breakdown */}
      <Text style={styles.sectionTitle}>Price Breakdown</Text>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Hourly Rate</Text>
        <Text style={styles.priceValue}>₹500/hr</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Duration</Text>
        <Text style={styles.priceValue}>1 hour</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Subtotal</Text>
        <Text style={styles.priceValue}>₹500</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Taxes & Fees</Text>
        <Text style={styles.priceValue}>₹90</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹625</Text>
      </View>

      {/* Contact Information */}
      <Text style={styles.sectionTitle}>Contact Information</Text>
      <TextInput style={styles.input} placeholder="Name" value="Rahul Sharma" />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value="+91 98765 43210"
      />

      {/* Payment Method */}
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <Text style={styles.subLabel}>Choose App</Text>
      {/* Payment Method */}
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <Text style={styles.subLabel}>Choose App</Text>

      <View style={styles.paymentRow}>
        <TouchableOpacity style={styles.paymentBtn}>
          <Image
            source={require("../assets/gpay.png")}
            style={styles.paymentIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.paymentBtn}>
          <Image
            source={require("../assets/paytm.png")}
            style={styles.paymentIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.paymentBtn}>
          <Image
            source={require("../assets/PhonePe.png")}
            style={styles.paymentIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.paymentBtn}>
          <Image
            source={require("../assets/amzon.png")}
            style={styles.paymentIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.line} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="E.g tanaya@hdfc"
        value={upiId}
        onChangeText={setUpiId}
      />
      <TouchableOpacity style={styles.verifyBtn}>
        <Text style={styles.verifyBtnText}>Verify</Text>
      </TouchableOpacity>

      {/* Confirm Button */}
      <TouchableOpacity style={{ marginTop: 20 }}>
        <LinearGradient
          colors={["#00C247", "#004CE8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1.8 }}
          style={styles.confirmBtn}
        >
          <Text style={styles.confirmBtnText}>Confirm & Pay ₹625</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: -20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  header: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginLeft: 12,
    color: "#000",
  },

  venueCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00C247",
    marginBottom: 20,
  },

  venueTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
  },
  venueSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6c757d",
    marginVertical: 2,
  },
  venueDate: {
    fontSize: 13,
    fontFamily: "Inter_500Regular",
    color: "#343A40",
  },
  venueIcon: {
    backgroundColor: "#0a8",
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
    marginTop: 10,
    marginBottom: 8,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6c757d",
  },
  priceValue: {
    fontSize: 14,
    fontFamily: "Inter_500Regular",
    color: "#000",
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
  },
  totalValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#000",
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

  subLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Regular",
    color: "#6c757d",
    marginBottom: 8,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  paymentBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: "#f8f9fa",
  },

  verifyBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  verifyBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },

  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  paymentBtn: {
    flex: 1,
    height: 60, // ✅ fixed height for consistency
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  paymentIcon: {
    width: "70%", // ✅ scale based on container
    height: "70%",
  },
  orContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 15,
},

line: {
  flex: 1,
  height: 1,
  backgroundColor: "#ddd",
},

orText: {
  marginHorizontal: 10,
  fontSize: 14,
  fontFamily: "Inter_500Regular",
  color: "#666",
},
});
