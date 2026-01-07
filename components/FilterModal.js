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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import api from '../src/services/apiService';
import searchIcon from "../assets/icons/gray/icon-search-gradient.png";
import locationIcon from "../assets/icons/gray/icon-loaction-gradient.png";
import cricketBatWhite from "../assets/icons/white/icon-cricket-white.png";
import cricketGradBat from "../assets/icons/gradient/icon-cricket-gradient.png";
import filterIcon from "../assets/icons/gradient/icon-filter-gradient.png";
import footBallIconGrad from "../assets/icons/gradient/icon-football-gradient.png";
import footBallIconWhite from "../assets/icons/white/football_white.png";
import tennisIconGrad from "../assets/icons/gradient/icon-tennis-gradient.png";
import tennisIconWhite from "../assets/icons/white/tennis_white.png";
import badmintonIconGrad from "../assets/icons/gradient/icon-badminton-gradient.png";
import badmintonIconWhite from "../assets/icons/white/badminton_white.png";
import basketballIconGrad from "../assets/icons/gradient/icon-basketball-gradient.png";
import basketballIconWhite from "../assets/icons/white/icon-basketball-white.png";


 const sports = [
    {
      id: "Cricket",
      name: "Cricket",
      gradientIcon: cricketGradBat,
      whiteIcon: cricketBatWhite,
    },
    {
      id: "Football",
      name: "Football",
      gradientIcon: footBallIconGrad,
      whiteIcon: footBallIconWhite,
    },
    // {
    //   id: "Tennis",
    //   name: "Tennis",
    //   gradientIcon: tennisIconGrad,
    //   whiteIcon: tennisIconWhite,
    // },
    {
      id: "Badminton",
      name: "Badminton",
      gradientIcon: badmintonIconGrad,
      whiteIcon: badmintonIconWhite,
    },
    {
      id: "Basketball",
      name: "Basketball",
      gradientIcon: basketballIconGrad,
      whiteIcon: basketballIconWhite,
    },
  ];


const FilterModal = ({ visible, onClose, onApply }) => {
  const [selectedDistance, setSelectedDistance] = useState("5");
  const [selectedTime, setSelectedTime] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [price, setPrice] = useState(500);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots = ["Morning", "Afternoon", "Evening"];
  const distances = ["5", "10", "15"];

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
            {/* Search */}
            <View style={styles.searchBoxRow}>
              <Image source={searchIcon} style={{ width: 16, height: 16, marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search area or pin-code"
                value={search}
                onChangeText={setSearch}
              />
              <Image source={locationIcon} style={{ width: 16, height: 16, marginLeft: 8 }} />
            </View>

            {/* Distance */}
            <Text style={styles.sectionHeader}>Distance</Text>
            <View style={styles.buttonRow}>
              {distances.map((d) => {
                const isSelected = selectedDistance === d;
                return (
                  <TouchableOpacity key={d} onPress={() => setSelectedDistance(d)}>
                    {isSelected ? (
                      <LinearGradient
                        colors={["#00C247", "#004CE8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 2.5 }}
                        style={styles.gradientButton}
                      >
                        <Text style={styles.gradientButtonText}>
                          {d === "5" ? "Within 5 km" : `${d} km`}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>
                          {d === "5" ? "Within 5 km" : `${d} km`}
                        </Text>
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
                    onPress={() => {
                      setSelectedTime((prev) =>
                        prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
                      );
                    }}
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
                            onPress={() => setSelectedSport(sport.id)}
                            style={styles.circleWrapper}
                          >
                            {isSelected ? (
                              // Selected: grey icon with gradient background
                              <LinearGradient
                                colors={["#00C247", "#004CE8"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 2.5 }}
                                style={styles.circle}
                              >
                                <Image
                                  source={sport.whiteIcon}
                                  style={{ width: 23, height: 23 }}
                                />
                              </LinearGradient>
                            ) : (
                              // Not selected: gradient icon with grey background
                              <View style={[styles.circle, { backgroundColor: "#E9ECEF" }]}>
                                <Image
                                  source={sport.gradientIcon}
                                  style={{ width: 23, height: 23 }}
                                />
                              </View>
                            )}
                            <Text
                              style={[
                                styles.label,
                                isSelected ? { color: "#0CBE1E" } : { color: "#757575" },
                              ]}
                            >
                              {sport.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

            {/* Price Range */}
            <Text style={styles.sectionHeader}>Price Range</Text>
            <View style={styles.sliderRow}>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${((price - 200) / (10000 - 200)) * 100}%` }]} />
                <View
                  style={[styles.sliderThumb, { left: `${((price - 200) / (10000 - 200)) * 100}%` }]}
                  {...{
                    onStartShouldSetResponder: () => true,
                    onResponderMove: (e) => {
                      const x = e.nativeEvent.locationX;
                      const percent = Math.max(0, Math.min(1, x / 300));
                      setPrice(Math.round(200 + percent * (10000 - 200)));
                    },
                  }}
                />
              </View>
              <View style={styles.priceLabelsRow}>
                <Text style={styles.priceLabel}>₹200</Text>
                <Text style={styles.priceLabel}>₹{price}</Text>
                <Text style={styles.priceLabel}>₹10000</Text>
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={async () => {
                try {
                  setIsLoading(true);
                  
                  // Convert timeSlot array to single category (taking the first selected time)
                  const timeSlotCategory = selectedTime.length > 0 
                    ? selectedTime[0].toLowerCase() 
                    : undefined;

                  const response = await api.post('/users/filter-turfs', {
                    latitude: 23.238860,
                    longitude: 87.859537,
                    maxDistanceKm: parseInt(selectedDistance),
                    timeSlotCategory,
                    sportsType: selectedSport?.toLowerCase(),
                    priceMin: 200,
                    priceMax: price
                  });

                  onApply(response.data);
                  onClose();
                } catch (error) {
                  console.error('Error filtering turfs:', error);
                  // You might want to show an error message to the user here
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              <LinearGradient 
                colors={["#00C247", "#004CE8"]} 
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 2.5 }} 
                style={[
                  styles.applyButtonGradient,
                  isLoading && styles.applyButtonDisabled
                ]}
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
    minHeight: 540,
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
    marginBottom: 18,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#757575",
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#303030",
    marginTop: 15,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
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
    marginRight: 10,
    alignItems: "center",
  },
  gradientButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  sportsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 8,
  },
  sportIconWrapper: {
    alignItems: "center",
    flex: 1,
  },
    circleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  circleWrapper: { alignItems: "center", marginHorizontal: 8 },
  circle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  sportIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  sportIconSelected: {
    backgroundColor: "#E9F7EF",
    borderWidth: 2,
    borderColor: "#00BFAE",
  },
  sportLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#343A40",
    textAlign: "center",
  },
  sliderRow: {
    marginTop: 10,
    marginBottom: 18,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    width: 300,
    alignSelf: "center",
    position: "relative",
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#00BFAE",
    borderRadius: 3,
    height: 6,
  },
  sliderThumb: {
    position: "absolute",
    top: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#343A40",
    borderWidth: 2,
    borderColor: "#fff",
  },
  priceLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginHorizontal: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#343A40",
  },
  applyButton: {
    marginTop: 18,
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
