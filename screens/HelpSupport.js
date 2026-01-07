// src/screens/HelpSupport.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import footBallIconGrad from "../assets/icons/gradient/icon-football-gradient.png";
import termsDocs from "../assets/icons/gradient/icon-document-gradient.png";
import cancellationPolicyIcon from "../assets/icons/gradient/icon-calendar-gradient.png";
import conductIcon from "../assets/icons/gradient/icon-bulb-gradient.png";
import sportsGears from "../assets/icons/gradient/icon-badminton-gradient.png";
import payment from "../assets/icons/gradient/icon-document-gradient.png";


const HelpSupportScreen = () => {
  const menuItems = [
    { id: 1, title: "Venue Booking", icon: footBallIconGrad },
    { id: 2, title: "Venue Policies", icon: termsDocs },
    { id: 3, title: "Cancellation Policy", icon: cancellationPolicyIcon },
    { id: 4, title: "Conducts", icon: conductIcon },
    { id: 5, title: "Sports Gears", icon: sportsGears },
    { id: 6, title: "Payment & Refund", icon: payment },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Greeting */}
      <Text style={styles.greeting}>Hi, How can we help you?</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search topic, issue, quarries..."
          placeholderTextColor="#999"
        />
      </View>

      {/* Menu Grid */}
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <Image source={item.icon} style={{width:30,height:30}} />
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <TouchableOpacity style={styles.footerCard}>
        <Ionicons name="chatbox-ellipses-outline" size={22} color="#20C997" />
        <Text style={styles.footerText}>Write to us</Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#20C997"
          style={{ marginLeft: "auto" }}
        />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Greeting / Subheader
  greeting: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginTop: 0,
    marginHorizontal: 15,
    color: "#000",
  },

  // Search bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    marginHorizontal: 15,
    marginTop: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 14,
    marginLeft: 6,
    color: "#000",
    fontFamily: "Inter_400Regular",
  },

  // Grid layout
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    margin: 15,
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#333",
    textAlign: "center",
  },

  // Footer
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    margin: 15,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  footerText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#333",
  },
});

export default HelpSupportScreen;
