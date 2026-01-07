// screens/BookingScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import api from "../src/services/apiService";
import moment from "moment";

// Icons
import locationIcon from "../assets/icons/gray/icon-loaction-gradient.png";
import turfImage from "../assets/TURF1.jpeg";
import cricketBatWhite from "../assets/icons/white/icon-cricket-white.png";
import cricketGradBat from "../assets/icons/gradient/icon-cricket-gradient.png";
import footBallIconGrad from "../assets/icons/gradient/icon-football-gradient.png";
import footBallIconWhite from "../assets/icons/white/football_white.png";
import tennisIconGrad from "../assets/icons/gradient/icon-tennis-gradient.png";
import tennisIconWhite from "../assets/icons/white/tennis_white.png";

const BookingScreen = ({ route }) => {
  const { turfDetails } = route.params || {};
  const navigation = useNavigation();

  const openTime = turfDetails?.timeSlots?.[0]?.open || "06:00";
  const closeTime = turfDetails?.timeSlots?.[0]?.close || "22:00";

  const [selectedDate, setSelectedDate] = useState(null);
  const [formattedDate, setFormattedDate] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const predefinedSports = [
    { id: "Cricket", name: "Cricket", gradientIcon: cricketGradBat, whiteIcon: cricketBatWhite },
    { id: "Football", name: "Football", gradientIcon: footBallIconGrad, whiteIcon: footBallIconWhite },
    { id: "Tennis", name: "Tennis", gradientIcon: tennisIconGrad, whiteIcon: tennisIconWhite },
  ];

  const availableSports = predefinedSports.filter((sport) =>
    turfDetails?.sports?.some((t) => t.name.toLowerCase() === sport.name.toLowerCase())
  );

  // ✅ Generate next 7 days
  const generateDates = () => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      return { display: `${dayName} ${date.getDate()}`, fullDate: date };
    });
  };
  const dates = generateDates();

  // ✅ Set default selected sport and date
  useEffect(() => {
    if (dates.length > 0) {
      const first = dates[0];
      setSelectedDate(first.display);
      setFormattedDate(moment(first.fullDate).format("YYYY-MM-DD"));
    }
    if (availableSports.length > 0) setSelectedSport(availableSports[0].id);
  }, []);

  // ✅ Fetch available slots
  useEffect(() => {
    if (!turfDetails || !formattedDate || !selectedSport) return;
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const body = {
          vendorId: turfDetails.vendorId,
          turfId: turfDetails.turfId,
          date: formattedDate,
          sports: selectedSport.toLowerCase(),
        };
        console.log("📦 Fetching available slots:", body);

        const res = await api.post("/bookings/available-slots", body);
        console.log("✅ Available slots response:", res.data);

        setAvailableSlots(res.data.availableSlots || []);
      } catch (err) {
        console.error("❌ Error fetching slots:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to fetch available slots.");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [formattedDate, selectedSport]);

  // ✅ Parse times and generate hourly slots
  const parseTime = (time) => {
    const [h, m] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const generateHourlySlots = (open, close) => {
    const slots = [];
    let current = parseTime(open);
    const end = parseTime(close);

    while (current < end) {
      const next = new Date(current.getTime() + 60 * 60 * 1000);
      slots.push(`${moment(current).format("HH:mm")} - ${moment(next).format("HH:mm")}`);
      current = next;
    }
    return slots;
  };

  const hourlySlots = availableSlots.length
    ? availableSlots.flatMap((s) => generateHourlySlots(s.open, s.close))
    : generateHourlySlots(openTime, closeTime);

  // ✅ Toggle slot select
  const toggleSlot = (slot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  // ✅ Check availability before selecting
  const handleSlotPress = async (slot) => {
    try {
      const body = {
        vendorId: turfDetails.vendorId,
        turfId: turfDetails.turfId,
        sports: selectedSport.toLowerCase(),
        date: formattedDate,
      };

      console.log("🔍 Checking slot availability:", body);
      const res = await api.post("/bookings/available-slots", body);
      console.log("✅ Check availability response:", res.data);

      if (res.data?.available) {
        toggleSlot(slot);
      } else {
        Alert.alert("Unavailable", res.data?.message || "Slot not available.");
      }
    } catch (err) {
      console.error("❌ Error checking availability:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to check slot availability.");
    }
  };

  // ✅ Book selected slots
  const handleBook = async () => {
    if (selectedSlots.length === 0)
      return Alert.alert("Select Slot", "Please select at least one slot before booking.");

    const body = {
      vendorId: turfDetails.vendorId,
      turfId: turfDetails.turfId,
      sports: selectedSport.toLowerCase(),
      selectedSlots,
    };

    try {
      setLoading(true);
      console.log("📤 Booking Summary request:", body);

      const res = await api.post("/bookings/summary", body);
      console.log("✅ Booking summary response:", res.data);

      Alert.alert("Success", "Booking created successfully!");
      navigation.navigate("BookingStatus", { bookingSummary: res.data });
      setSelectedSlots([]);
    } catch (err) {
      console.error("❌ Booking failed:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to create booking summary.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#004CE8" />
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* ✅ Turf Header */}
        <View style={styles.headerCard}>
          <View style={{ flexDirection: "row", width: "100%" }}>
            <View style={{ width: "20%", height: 60 }}>
              <Image source={turfImage} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
            </View>
            <View style={{ width: "80%", paddingLeft: 10 }}>
              <Text style={styles.hearofScreen}>{turfDetails.title}</Text>
              <View style={styles.locationRow}>
                <Image source={locationIcon} style={{ width: 16, height: 16 }} />
                <Text style={styles.location}>
                  {turfDetails.vendorLocation?.address}, {turfDetails.vendorLocation?.city}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ✅ Sports */}
        <Text style={styles.sectionTitle}>Sports</Text>
        <View style={styles.sportRow}>
          {availableSports.map((sport) => {
            const isSelected = selectedSport === sport.id;
            return (
              <TouchableOpacity key={sport.id} onPress={() => setSelectedSport(sport.id)} style={{ flex: 1, marginHorizontal: 5 }}>
                {isSelected ? (
                  <LinearGradient
                    colors={["#00C247", "#004CE8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1.5 }}
                    style={[styles.sportTab, styles.gradientBackground]}
                  >
                    <Image source={sport.whiteIcon} style={[{ width: 23, height: 23 }, styles.sportIcon]} resizeMode="contain" />
                    <Text style={[styles.sportText, styles.sportTextSelected]}>{sport.name}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.sportTab}>
                    <Image source={sport.gradientIcon} style={[{ width: 23, height: 23 }, styles.sportIcon]} resizeMode="contain" />
                    <Text style={styles.sportText}>{sport.name}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ✅ Dates */}
        <Text style={styles.sectionTitle}>Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.dateRow}>
            {dates.map((d) => {
              const [day, num] = d.display.split(" ");
              const isSelected = selectedDate === d.display;
              return (
                <TouchableOpacity
                  key={d.display}
                  onPress={() => {
                    setSelectedDate(d.display);
                    setFormattedDate(moment(d.fullDate).format("YYYY-MM-DD"));
                  }}
                  style={{ marginRight: 8 }}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={["#00C247", "#004CE8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1.5 }}
                      style={[styles.dateBox, styles.gradientBackground]}
                    >
                      <Text style={[styles.numText, styles.dateTextSelected]}>{num}</Text>
                      <Text style={[styles.dayText, styles.dateTextSelected]}>{day}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.dateBox}>
                      <Text style={styles.dayText}>{day}</Text>
                      <Text style={styles.numText}>{num}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* ✅ Time Slots */}
        <Text style={styles.sectionTitle}>Time</Text>
        <View style={styles.slotContainer}>
          {hourlySlots.map((slot) => {
            const isSelected = selectedSlots.includes(slot);
            return (
              <TouchableOpacity key={slot} onPress={() => handleSlotPress(slot)} style={{ width: "30%", marginVertical: 5 }}>
                {isSelected ? (
                  <LinearGradient colors={["#00C247", "#004CE8"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1.5 }} style={[styles.slot, styles.gradientBackground]}>
                    <Text style={[styles.slotText, { color: "#fff" }]}>{slot}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.slot, { backgroundColor: "#E9ECEF" }]}>
                    <Text style={[styles.slotText, { color: "#343A40" }]}>{slot}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ✅ Book Button */}
        <TouchableOpacity style={styles.gradientButton} 
        //onPress={handleBook}
        onPress={()=>navigation.navigate('BookingStatus')}
        >
          <LinearGradient colors={["#00C247", "#004CE8"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1.5 }} style={styles.gradientButtonBg}>
            <Text style={styles.gradientButtonText}>Book</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff", marginTop: -20 },
  hearofScreen: { color: "#1E1E1E", fontSize: 18, fontWeight: "600" },
  headerCard: { backgroundColor: "#F3F3F5", padding: 5, borderRadius: 10, marginBottom: 10 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  location: { color: "#757575", fontSize: 14, marginLeft: 2 },
  sportRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  sportTab: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, backgroundColor: "#eee" },
  gradientBackground: { borderRadius: 10 },
  sportText: { color: "#888", fontSize: 14 },
  sportTextSelected: { color: "#fff" },
  dateRow: { flexDirection: "row" },
  dateBox: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, alignItems: "center", justifyContent: "center", width: 60 },
  dayText: { fontSize: 12, color: "#757575" },
  numText: { fontSize: 18, color: "#49454F" },
  dateTextSelected: { color: "#fff" },
  slotContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  slot: { borderRadius: 10, alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  slotText: { fontSize: 13 },
  gradientButton: { marginTop: 10, width: "100%", borderRadius: 8, overflow: "hidden" },
  gradientButtonBg: { width: "100%", height: 48, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  gradientButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sectionTitle: { color: "#303030", fontSize: 16, fontWeight: "600", marginVertical: 5 },
});

export default BookingScreen;
