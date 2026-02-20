// screens/BookingScreen.js
import React, { useState, useEffect, useRef, useCallback } from "react";
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

  const [selectedDate, setSelectedDate] = useState(null);
  const [formattedDate, setFormattedDate] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Slot locking state
  const [slotStatuses, setSlotStatuses] = useState({}); // { "10:00 - 11:00": { status: "available" } }
  const [userLocks, setUserLocks] = useState([]); // [{ slot: "10:00 - 11:00", lockId: "uuid" }]
  const [lockingSlot, setLockingSlot] = useState(null); // Currently being locked
  const pollingIntervalRef = useRef(null);

  const predefinedSports = [
    { id: "Cricket", name: "Cricket", gradientIcon: cricketGradBat, whiteIcon: cricketBatWhite },
    { id: "Football", name: "Football", gradientIcon: footBallIconGrad, whiteIcon: footBallIconWhite },
    { id: "Tennis", name: "Tennis", gradientIcon: tennisIconGrad, whiteIcon: tennisIconWhite },
  ];

  const availableSports = predefinedSports.filter((sport) =>
    turfDetails?.sports?.some((t) => t.name.toLowerCase() === sport.name.toLowerCase())
  );

  // Get SELECTED sport details (slotDuration and timeSlots)
  const selectedSportDetails = turfDetails?.sports?.find(
    (s) => s.name.toLowerCase() === selectedSport?.toLowerCase()
  );

  // Get slot duration from selected sport (default 60 mins)
  const slotDuration = selectedSportDetails?.slotDuration || 60;

  // Get timeSlots from SELECTED sport (each sport has its own timings!)
  const selectedSportTimeSlots = selectedSportDetails?.timeSlots || [];

  // Fallback to first sport or root level timeSlots if no sport selected yet
  const fallbackTimeSlots = turfDetails?.sports?.[0]?.timeSlots || turfDetails?.timeSlots || [{ open: "06:00", close: "22:00" }];

  // Generate next 7 days
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

  // Set default selected sport and date
  useEffect(() => {
    if (dates.length > 0) {
      const first = dates[0];
      setSelectedDate(first.display);
      setFormattedDate(moment(first.fullDate).format("YYYY-MM-DD"));
    }
    if (availableSports.length > 0) {
      setSelectedSport(availableSports[0].id);
    }

    // Mark initial loading complete immediately after state is set
    setInitialLoading(false);
  }, []);

  // Fetch available slots
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
        // console.log("Fetching available slots:", body);

        const res = await api.post("/bookings/available-slots", body);
       // console.log("Available slots response:", res.data);

        setAvailableSlots(res.data.availableSlots || []);
      } catch (err) {
        console.error("Error fetching slots:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to fetch available slots.");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [formattedDate, selectedSport]);

  // Parse times and generate slots with dynamic duration
  const parseTime = (time) => {
    const [h, m] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const generateHourlySlots = (open, close, duration) => {
    const slots = [];
    let current = parseTime(open);
    const end = parseTime(close);

    while (current < end) {
      const next = new Date(current.getTime() + duration * 60 * 1000);
      if (next <= end) {
        slots.push(`${moment(current).format("HH:mm")} - ${moment(next).format("HH:mm")}`);
      }
      current = next;
    }
    return slots;
  };

  // Generate slots from SELECTED sport's timeSlots
  // Each sport can have multiple time ranges (e.g., morning 6-12, evening 16-22)
  const timeSlotsToUse = selectedSportTimeSlots.length > 0 ? selectedSportTimeSlots : fallbackTimeSlots;

  const hourlySlots = timeSlotsToUse.flatMap((timeRange) =>
    generateHourlySlots(timeRange.open || "06:00", timeRange.close || "22:00", slotDuration)
  );

  // console.log("Generating slots:", {
  //   sport: selectedSport,
  //   slotDuration,
  //   timeSlots: timeSlotsToUse,
  //   generatedSlots: hourlySlots,
  // });

  // Fetch slot statuses with polling (optional - won't block UI if it fails)
  const fetchSlotStatuses = useCallback(async () => {
    if (!formattedDate || !selectedSport || hourlySlots.length === 0 || !turfDetails) return;

    try {
      const res = await api.post("/slots/status", {
        vendorId: turfDetails.vendorId,
        turfId: turfDetails.turfId,
        sport: selectedSport.toLowerCase(),
        date: formattedDate,
        timeSlots: hourlySlots,
      });
    // console.log("Slot statuses response:", res.data);
      if (res.data?.slotStatuses) {
        const statusMap = {};
        res.data.slotStatuses.forEach(({ slot, status, lockId, expiresAt }) => {
          statusMap[slot] = { status, lockId, expiresAt };
        });
        setSlotStatuses(statusMap);
      }
    } catch (err) {
      // Silently handle errors - slot status is optional enhancement
      console.log("Slot status fetch skipped:", err.response?.status || err.message);
    }
  }, [formattedDate, selectedSport, hourlySlots, turfDetails]);

  // Start polling for slot statuses
  useEffect(() => {
    if (!formattedDate || !selectedSport || hourlySlots.length === 0) return;

    // Initial fetch
    fetchSlotStatuses();

    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(fetchSlotStatuses, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchSlotStatuses]);

  // Cleanup locks when leaving screen
  useEffect(() => {
    return () => {
      // Release all locks when leaving screen
      if (userLocks.length > 0) {
        userLocks.forEach(async ({ lockId }) => {
          try {
            await api.delete(`/slots/unlock/${lockId}`);
          } catch (err) {
            console.log("Cleanup skipped:", err.message);
          }
        });
      }
    };
  }, [userLocks]);

  // Reset selections when date or sport changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    // Skip the first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Release existing locks when changing date/sport
    if (userLocks.length > 0) {
      userLocks.forEach(async ({ lockId }) => {
        try {
          await api.delete(`/slots/unlock/${lockId}`);
        } catch (err) {
          console.log("Lock release on change skipped:", err.message);
        }
      });
    }
    setSelectedSlots([]);
    setUserLocks([]);
    setSlotStatuses({});
  }, [formattedDate, selectedSport]);

  // Handle slot press - toggle selection (with optional locking)
  const handleSlotPress = async (slot) => {
    const statusInfo = slotStatuses[slot] || { status: "available" };
    const { status, lockId: existingLockId } = statusInfo;

    if (status === "booked") {
      return Alert.alert("Unavailable", "This slot is already booked");
    }

    if (status === "locked") {
      return Alert.alert("In Use", "Another user is currently booking this slot. Please try again later.");
    }

    // If already selected by this user, deselect it
    if (selectedSlots.includes(slot) || status === "selected") {
      const userLock = userLocks.find((l) => l.slot === slot);
      const lockIdToRelease = userLock?.lockId || existingLockId;

      // Try to release lock if exists
      if (lockIdToRelease) {
        try {
          await api.delete(`/slots/unlock/${lockIdToRelease}`);
        } catch (err) {
          console.log("Lock release skipped:", err.message);
        }
        setUserLocks((prev) => prev.filter((l) => l.slot !== slot));
      }
      setSelectedSlots((prev) => prev.filter((s) => s !== slot));
      fetchSlotStatuses();
      return;
    }

    // Select the slot and try to lock it
    setLockingSlot(slot);
    try {
      const res = await api.post("/slots/lock", {
        vendorId: turfDetails.vendorId,
        turfId: turfDetails.turfId,
        sport: selectedSport.toLowerCase(),
        date: formattedDate,
        timeSlot: slot,
      });

      if (res.data.status === "success") {
        setSelectedSlots((prev) => [...prev, slot]);
        setUserLocks((prev) => [...prev, { slot, lockId: res.data.lockId }]);
        fetchSlotStatuses();
      } else {
        // Still select the slot even if locking fails (graceful degradation)
        setSelectedSlots((prev) => [...prev, slot]);
        //console.log("Lock failed, proceeding without lock:", res.data.message);
      }
    } catch (err) {
      // If 409 conflict, show alert but don't select
      if (err.response?.status === 409) {
        Alert.alert("Slot Unavailable", err.response?.data?.message || "This slot is no longer available");
        fetchSlotStatuses();
      } else {
        // For other errors (like auth), still allow selection (graceful degradation)
        setSelectedSlots((prev) => [...prev, slot]);
        //console.log("Lock skipped due to error:", err.message);
      }
    } finally {
      setLockingSlot(null);
    }
  };

  // Get slot display info
  const getSlotDisplayInfo = (slot) => {
    const statusInfo = slotStatuses[slot] || { status: "available" };
    const { status } = statusInfo;
    const isSelected = selectedSlots.includes(slot) || status === "selected";
    const isLocking = lockingSlot === slot;

    let bgColor = "#E9ECEF"; // available
    let textColor = "#343A40";
    let isDisabled = false;
    let statusText = null;

    if (status === "booked") {
      bgColor = "#FFE5E5";
      textColor = "#D32F2F";
      isDisabled = true;
      statusText = "Booked";
    } else if (status === "locked") {
      bgColor = "#FFF3CD";
      textColor = "#856404";
      isDisabled = true;
      statusText = "In use";
    } else if (isLocking) {
      bgColor = "#E3F2FD";
      textColor = "#1976D2";
      isDisabled = true;
      statusText = "Reserving...";
    }

    return { bgColor, textColor, isDisabled, isSelected, statusText, isLocking };
  };

  // Book selected slots
  const handleBook = async () => {
    if (selectedSlots.length === 0)
      return Alert.alert("Select Slot", "Please select at least one slot before booking.");

    const body = {
      vendorId: turfDetails.vendorId,
      turfId: turfDetails.turfId,
      sports: selectedSport.toLowerCase(),
      selectedSlots,
      date: formattedDate
    };
    //console.log("Booking request body:", body);

    try {
      setLoading(true);
     // console.log("Booking Summary request:", body);

      const res = await api.post("/bookings/summary", body);
      //console.log("Booking summary response:", res.data);

      // Navigate to checkout with lock info
      navigation.navigate("BookingStatus", {
        bookingSummary: res.data,
        userLocks, // Pass locks to confirm after payment
        date: formattedDate,
      });
    } catch (err) {
      console.error("Booking failed:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to create booking summary.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading || initialLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#004CE8" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading...</Text>
      </View>
    );
  }

  // Show error if no turf details
  if (!turfDetails) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#666", fontSize: 16, textAlign: "center" }}>
          Unable to load turf details.{"\n"}Please go back and try again.
        </Text>
        <TouchableOpacity
          style={{ marginTop: 20, padding: 12, backgroundColor: "#004CE8", borderRadius: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#fff" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Turf Header */}
        <View style={styles.headerCard}>
          <View style={{ flexDirection: "row", width: "100%" }}>
            <View style={{ width: "20%", height: 60 }}>
              <Image source={turfImage} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
            </View>
            <View style={{ width: "80%", paddingLeft: 10 }}>
              <Text style={styles.hearofScreen}>{turfDetails?.title || "Turf"}</Text>
              <View style={styles.locationRow}>
                <Image source={locationIcon} style={{ width: 16, height: 16 }} />
                <Text style={styles.location}>
                  {/* Handle both string and object vendorLocation */}
                  {typeof turfDetails?.vendorLocation === 'string'
                    ? turfDetails.vendorLocation
                    : `${turfDetails?.vendorLocation?.address || ''}, ${turfDetails?.vendorLocation?.city || ''}`
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sports */}
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

        {/* Slot Duration Info */}
        <View style={styles.durationInfo}>
          <Text style={styles.durationText}>
            Slot Duration: {slotDuration === 60 ? "1 Hour" : "1.5 Hours"}
          </Text>
        </View>

        {/* Dates */}
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

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#E9ECEF" }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#00C247" }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FFF3CD" }]} />
            <Text style={styles.legendText}>In Use</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FFE5E5" }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
        </View>

        {/* Time Slots */}
        <Text style={styles.sectionTitle}>Time</Text>
        <View style={styles.slotContainer}>
          {hourlySlots.map((slot) => {
            const { bgColor, textColor, isDisabled, isSelected, statusText, isLocking } = getSlotDisplayInfo(slot);

            return (
              <TouchableOpacity
                key={slot}
                onPress={() => !isDisabled && handleSlotPress(slot)}
                disabled={isDisabled || isLocking}
                style={{ width: "30%", marginVertical: 5 }}
              >
                {isSelected && !isLocking ? (
                  <LinearGradient
                    colors={["#00C247", "#004CE8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1.5 }}
                    style={[styles.slot, styles.gradientBackground]}
                  >
                    <Text style={[styles.slotText, { color: "#fff" }]}>{slot}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.slot, { backgroundColor: bgColor }]}>
                    <Text style={[styles.slotText, { color: textColor }]}>{slot}</Text>
                    {statusText && (
                      <Text style={[styles.statusText, { color: textColor }]}>{statusText}</Text>
                    )}
                    {isLocking && (
                      <ActivityIndicator size="small" color={textColor} style={{ marginTop: 2 }} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Slots Summary */}
        {selectedSlots.length > 0 && (
          <View style={styles.selectedSummary}>
            <Text style={styles.summaryText}>
              {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""} selected
            </Text>
            <Text style={styles.summarySubtext}>
              Slots reserved for 10 minutes
            </Text>
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity
          style={styles.gradientButton}
          onPress={handleBook}
          disabled={selectedSlots.length === 0}
        >
          <LinearGradient
            colors={selectedSlots.length > 0 ? ["#00C247", "#004CE8"] : ["#ccc", "#999"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1.5 }}
            style={styles.gradientButtonBg}
          >
            <Text style={styles.gradientButtonText}>
              {selectedSlots.length > 0 ? `Book ${selectedSlots.length} Slot${selectedSlots.length > 1 ? "s" : ""}` : "Select Slots to Book"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Styles
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
  slot: { borderRadius: 10, alignItems: "center", justifyContent: "center", paddingVertical: 10, minHeight: 50 },
  slotText: { fontSize: 13 },
  statusText: { fontSize: 10, marginTop: 2 },
  gradientButton: { marginTop: 10, width: "100%", borderRadius: 8, overflow: "hidden" },
  gradientButtonBg: { width: "100%", height: 48, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  gradientButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sectionTitle: { color: "#303030", fontSize: 16, fontWeight: "600", marginVertical: 5 },
  durationInfo: {
    backgroundColor: "#E3F2FD",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  durationText: {
    color: "#1976D2",
    fontSize: 13,
    fontWeight: "500"
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#666",
  },
  selectedSummary: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  summaryText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "600",
  },
  summarySubtext: {
    color: "#4CAF50",
    fontSize: 12,
    marginTop: 2,
  },
});

export default BookingScreen;
