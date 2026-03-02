import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import api from '../src/services/apiService';
import searchIcon from "../assets/icons/gray/icon-search-gradient.png";
import locationIcon from "../assets/icons/gray/icon-loaction-gradient.png";
import cricketBatWhite from "../assets/icons/white/icon-cricket-white.png";
import cricketGradBat from "../assets/icons/gradient/icon-cricket-gradient.png";
import footBallIconGrad from "../assets/icons/gradient/icon-football-gradient.png";
import footBallIconWhite from "../assets/icons/white/football_white.png";
import badmintonIconGrad from "../assets/icons/gradient/icon-badminton-gradient.png";
import badmintonIconWhite from "../assets/icons/white/badminton_white.png";
import basketballIconGrad from "../assets/icons/gradient/icon-basketball-gradient.png";
import basketballIconWhite from "../assets/icons/white/icon-basketball-white.png";

const TEST_COORDS = { latitude: 23.239172, longitude: 87.859145 };

const sports = [
  { id: "Cricket",    name: "Cricket",    gradientIcon: cricketGradBat,    whiteIcon: cricketBatWhite },
  { id: "Football",   name: "Football",   gradientIcon: footBallIconGrad,  whiteIcon: footBallIconWhite },
  { id: "Badminton",  name: "Badminton",  gradientIcon: badmintonIconGrad, whiteIcon: badmintonIconWhite },
  { id: "Basketball", name: "Basketball", gradientIcon: basketballIconGrad,whiteIcon: basketballIconWhite },
];

const PRICE_OPTIONS = [
  { label: "Any",         priceMin: null,  priceMax: null },
  { label: "Under ₹500",  priceMin: null,  priceMax: 500  },
  { label: "₹500–₹1000",  priceMin: 500,   priceMax: 1000 },
  { label: "₹1000–₹2000", priceMin: 1000,  priceMax: 2000 },
  { label: "₹2000+",      priceMin: 2000,  priceMax: null },
];

const FilterModal = ({ visible, onClose, onApply, currentLocation }) => {
  const [selectedDistance, setSelectedDistance] = useState("10");
  const [selectedTime, setSelectedTime] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [areaSearch, setAreaSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState(false);

  const timeSlots = ["Morning", "Afternoon", "Evening"];
  const distances = [
    { value: "5",   label: "5 km"  },
    { value: "10",  label: "10 km" },
    { value: "25",  label: "25 km" },
    { value: "50",  label: "50 km" },
  ];

  const handleApply = async () => {
    try {
      setIsLoading(true);
      setGeocodeError(false);

      // Resolve coordinates: area search > device location > test fallback
      let lat = currentLocation?.coords?.latitude  ?? TEST_COORDS.latitude;
      let lng = currentLocation?.coords?.longitude ?? TEST_COORDS.longitude;

      if (areaSearch.trim()) {
        try {
          const geocoded = await Location.geocodeAsync(areaSearch.trim());
          if (geocoded?.[0]) {
            lat = geocoded[0].latitude;
            lng = geocoded[0].longitude;
          } else {
            setGeocodeError(true);
          }
        } catch {
          setGeocodeError(true);
        }
      }

      const timeSlotCategory = selectedTime.length > 0
        ? selectedTime[0].toLowerCase()
        : undefined;

      const priceOpt = PRICE_OPTIONS[selectedPriceIndex];

      const response = await api.post('/users/filter-turfs', {
        latitude: lat,
        longitude: lng,
        maxDistanceKm: parseInt(selectedDistance),
        timeSlotCategory,
        sportsType: selectedSport?.toLowerCase(),
        ...(priceOpt.priceMin != null && { priceMin: priceOpt.priceMin }),
        ...(priceOpt.priceMax != null && { priceMax: priceOpt.priceMax }),
      });

      onApply(response.data);
      onClose();
    } catch (error) {
      console.error('Error filtering turfs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.header}>Filter Venue</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#343A40" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Area / Pin-code */}
            <View style={styles.searchBoxRow}>
              <Image source={searchIcon} style={{ width: 16, height: 16, marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search area or pin-code"
                placeholderTextColor="#757575"
                value={areaSearch}
                onChangeText={(t) => { setAreaSearch(t); setGeocodeError(false); }}
              />
              <Image source={locationIcon} style={{ width: 16, height: 16, marginLeft: 8 }} />
            </View>
            {geocodeError && (
              <Text style={styles.geocodeError}>
                Could not find that location. Using your current location instead.
              </Text>
            )}

            {/* Distance */}
            <Text style={styles.sectionHeader}>Distance</Text>
            <View style={styles.buttonRow}>
              {distances.map((d) => {
                const isSelected = selectedDistance === d.value;
                return (
                  <TouchableOpacity key={d.value} onPress={() => setSelectedDistance(d.value)}>
                    {isSelected ? (
                      <LinearGradient
                        colors={["#00C247", "#004CE8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 2.5 }}
                        style={styles.gradientButton}
                      >
                        <Text style={styles.gradientButtonText}>{d.label}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>{d.label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Slots */}
            <Text style={styles.sectionHeader}>Time Slots</Text>
            <View style={styles.buttonRow}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTime.includes(slot);
                return (
                  <TouchableOpacity
                    key={slot}
                    onPress={() =>
                      setSelectedTime((prev) =>
                        prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
                      )
                    }
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={["#00C247", "#004CE8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 2.5 }}
                        style={styles.gradientButton}
                      >
                        <Text style={styles.gradientButtonText}>{slot}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>{slot}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sports */}
            <Text style={styles.sectionHeader}>Game Type</Text>
            <View style={styles.circleContainer}>
              {sports.map((sport) => {
                const isSelected = selectedSport === sport.id;
                return (
                  <TouchableOpacity
                    key={sport.id}
                    onPress={() => setSelectedSport(isSelected ? null : sport.id)}
                    style={styles.circleWrapper}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={["#00C247", "#004CE8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 2.5 }}
                        style={styles.circle}
                      >
                        <Image source={sport.whiteIcon} style={{ width: 23, height: 23 }} />
                      </LinearGradient>
                    ) : (
                      <View style={[styles.circle, { backgroundColor: "#E9ECEF" }]}>
                        <Image source={sport.gradientIcon} style={{ width: 23, height: 23 }} />
                      </View>
                    )}
                    <Text style={[styles.label, isSelected ? { color: "#0CBE1E" } : { color: "#757575" }]}>
                      {sport.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Price Range */}
            <Text style={styles.sectionHeader}>Price Range</Text>
            <View style={styles.priceGrid}>
              {PRICE_OPTIONS.map((opt, i) => {
                const isSelected = selectedPriceIndex === i;
                return (
                  <TouchableOpacity key={i} onPress={() => setSelectedPriceIndex(i)}>
                    {isSelected ? (
                      <LinearGradient
                        colors={["#00C247", "#004CE8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 2.5 }}
                        style={styles.gradientButton}
                      >
                        <Text style={styles.gradientButtonText}>{opt.label}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>{opt.label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Apply */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#00C247", "#004CE8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 2.5 }}
                style={[styles.applyButtonGradient, isLoading && styles.applyButtonDisabled]}
              >
                <Text style={styles.applyButtonText}>
                  {isLoading ? "Loading..." : "Apply"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    maxHeight: "90%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  header: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#303030",
  },
  searchBoxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 4,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#1E1E1E",
  },
  geocodeError: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#B3261E",
    marginBottom: 12,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#303030",
    marginTop: 16,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  priceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#343A40",
  },
  gradientButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  gradientButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  circleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
    marginBottom: 4,
  },
  circleWrapper: { alignItems: "center" },
  circle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  applyButton: {
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  applyButtonGradient: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
});

export default FilterModal;
