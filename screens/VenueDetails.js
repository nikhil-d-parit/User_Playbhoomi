import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../src/services/apiService";

// Icons
import locationIcon from "../assets/icons/gray/icon-loaction-gradient.png";
import cricketGradBat from "../assets/icons/gradient/icon-cricket-gradient.png";
import footBallIconGrad from "../assets/icons/gradient/icon-football-gradient.png";
import tennisIconGrad from "../assets/icons/gradient/icon-tennis-gradient.png";
import badmintonIconGrad from "../assets/icons/gradient/icon-badminton-gradient.png";
import clockIcon from "../assets/icons/gradient/icon-timelapse-gradient.png";
import parkingIcon from "../assets/icons/gradient/icon-car-gradient.png";
import washroomIcon from "../assets/icons/gradient/icon-washroom-gradient.png";
import drinkingWaterIcon from "../assets/icons/gradient/icon-waterglass-gradient.png";
import floodLightIcon from "../assets/icons/gradient/icon-bulb-gradient.png";
import shoeIcon from "../assets/icons/gradient/icon-shoe-gradient.png";
import noSmokingIcon from "../assets/icons/gradient/icon-no_smoking-gradient.png";

const screenWidth = Dimensions.get("window").width;

const asArray = (value) => (Array.isArray(value) ? value : []);

const getImageUrl = (image) => {
  if (typeof image === "string") return image;
  if (image && typeof image === "object") {
    return image.secure_url || image.url || image.uri || image.src || null;
  }
  return null;
};

const getDisplayName = (item) => {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    return item.name || item.title || item.label || "";
  }
  return "";
};

const VenueDetailsScreen = ({ route }) => {
  const amenityMap = {
    wifi: {
      label: "Free WiFi",
      icon: shoeIcon,
    },
    floodlights: {
      label: "Floodlights",
      icon: floodLightIcon,
    },
    "parking areas": {
      label: "Parking",
      icon: parkingIcon,
    },
    washroom: {
      label: "Washroom",
      icon: washroomIcon,
    },
    "drinking water": {
      label: "Drinking Water",
      icon: drinkingWaterIcon,
    },
  };
  const ruleIconMap = {
    "no smoking": noSmokingIcon,
    "no food inside": shoeIcon,
    "sports shoes mandatory": shoeIcon,
    "free cancellation": clockIcon,
  };

  const navigation = useNavigation();
  const [turfDetails, setTurfDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { turfId } = route.params;

  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/users/turfs/${turfId}`);
        setTurfDetails(response.data);
      } catch (error) {
        console.error("Error fetching turf details:", error);
        Alert.alert("Error", "Failed to load turf details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTurfDetails();
  }, [turfId]);

  const openGoogleMaps = () => {
    if (
      !turfDetails?.vendorCoordinates?.lat ||
      !turfDetails?.vendorCoordinates?.lng
    )
      return;

    const { lat, lng } = turfDetails.vendorCoordinates;
    const label = encodeURIComponent(turfDetails.title || "Venue");

    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`
        : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open map"),
    );
  };

  const formatTimeToAMPM = (time) => {
    if (!time || typeof time !== "string" || !time.includes(":")) return "";
    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const renderChip = (iconSource, label, customTextStyle = {}) => (
    <View style={styles.chip}>
      <Image
        source={iconSource}
        style={styles.chipIcon}
        resizeMode="contain"
      />
      <Text
        style={[styles.chipText, customTextStyle]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {String(label || "")}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#004CE8" />
      </View>
    );
  }

  if (!turfDetails) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <Text style={{ color: "#666", textAlign: "center", marginBottom: 16 }}>
          Unable to load turf details. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#004CE8", borderRadius: 8 }}
        >
          <Text style={{ color: "#fff" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUrls = asArray(turfDetails.images).map(getImageUrl).filter(Boolean);
  const sportsList = asArray(turfDetails.sports);
  const amenitiesList = asArray(turfDetails.amenities);
  const rulesList = asArray(turfDetails.rules);
  const firstSportSlots = asArray(sportsList[0]?.timeSlots);
  const rootTimeSlots = asArray(turfDetails.timeSlots);
  const openingSlot = firstSportSlots[0] || rootTimeSlots[0] || {};

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.imageRow}>
            {imageUrls.length > 0 ? (
              imageUrls.map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))
            ) : (
              <Image
                source={require("../assets/TURF1.jpeg")}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          </View>
        </ScrollView>

        {/* Venue Info */}
        <View style={styles.content}>
          <Text variant="titleLarge" style={styles.title}>
            {turfDetails?.title || "Turf"}
          </Text>

          <View style={styles.locationRow}>
            <Image
              source={locationIcon}
              style={{ width: 14, height: 14, marginRight: 6 }}
            />
            <Text style={styles.subTitle}>{turfDetails?.address || ""}</Text>
          </View>

          {/* Prices */}
          <View style={styles.chipRow}>
            {sportsList.map((sport, index) => {
              const sportName = getDisplayName(sport) || "Sport";
              const sportIconMap = {
                Cricket: cricketGradBat,
                Football: footBallIconGrad,
                Tennis: tennisIconGrad,
                Pickleball: tennisIconGrad,
                Badminton: badmintonIconGrad,
              };
              const icon = sportIconMap[sportName] || footBallIconGrad;
              const price = sport?.discountedPrice || sport?.slotPrice || "N/A";
              return (
              <React.Fragment key={index}>
                {renderChip(
                  icon,
                  `${sportName} - Rs. ${price}${price !== "N/A" ? "/hr" : ""}`,
                  {
                    color: "#49454F",
                    fontFamily: "Inter_500Medium",
                  },
                )}
              </React.Fragment>
              );
            })}
          </View>
          {/* Timings */}
          <Text variant="titleMedium" style={[styles.title, { marginTop: 20 }]}>
            Timings
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Image
              source={clockIcon}
              style={{ width: 18, height: 18, marginRight: 6 }}
            />
            <Text style={styles.sportText}>
              {formatTimeToAMPM(openingSlot.open)}
              {" - "}
              {formatTimeToAMPM(openingSlot.close)}
            </Text>
          </View>

          {/* Amenities */}
          <Text variant="titleMedium" style={[styles.title, { marginTop: 20 }]}>
            Amenities
          </Text>
          <View style={styles.chipRow}>
            {amenitiesList.map((item, index) => {
              // Handle both string format (old) and object format (new)
              const amenityKey = getDisplayName(item);
              if (!amenityKey) return null;

              const amenity = amenityMap[amenityKey.toLowerCase().trim()];
              // If we have mapping, use it; otherwise create a default chip
              const icon = amenity?.icon || shoeIcon;
              const label = amenity?.label || amenityKey;

              return (
                <React.Fragment key={index}>
                  {renderChip(icon, label, {
                    color: "#49454F",
                    fontFamily: "Inter_500Medium",
                  })}
                </React.Fragment>
              );
            })}
          </View>

          <Text variant="titleMedium" style={[styles.title, { marginTop: 20 }]}>
            Rules & Policies
          </Text>
          <View style={styles.rulesList}>
            {rulesList.map((item, index) => {
              // Handle both string format (old) and object format (new)
              const ruleName = getDisplayName(item);
              if (!ruleName) return null;

              const icon = ruleIconMap[ruleName.toLowerCase().trim()] || clockIcon;
              return (
                <View key={index} style={styles.ruleItem}>
                  <Image
                    source={icon}
                    style={{ width: 20, height: 20, marginRight: 6 }}
                  />
                  <Text style={[styles.subTitle, { color: "#1E1E1E" }]}>
                    {ruleName}
                  </Text>
                </View>
              );
            })}
            {Number(turfDetails?.cancellationHours) > 0 && (
              <View style={styles.ruleItem}>
                <Image
                  source={clockIcon}
                  style={{ width: 20, height: 20, marginRight: 6 }}
                />
                <Text style={[styles.subTitle, { color: "#1E1E1E" }]}>
                  Free cancellation up to {turfDetails.cancellationHours} hours
                  before
                </Text>
              </View>
            )}
          </View>

          {/* Location */}
          <Text variant="titleMedium" style={[styles.title, { marginTop: 20 }]}>
            Location
          </Text>

          {turfDetails?.vendorCoordinates?.lat &&
          turfDetails?.vendorCoordinates?.lng ? (
            <TouchableOpacity
              style={styles.locationCard}
              onPress={openGoogleMaps}
              activeOpacity={0.8}
            >
              <Image
                source={locationIcon}
                style={{ width: 32, height: 32, marginBottom: 8 }}
                resizeMode="contain"
              />
              <Text style={styles.locationCardAddress} numberOfLines={2}>
                {turfDetails.address || ""}
              </Text>
              <View style={styles.directionsBtn}>
                <Text style={styles.directionsBtnText}>Get Directions</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.locationCard}>
              <Text style={{ color: "#555", fontFamily: "Inter_500Medium" }}>
                Location not available
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.gradientButton}
            onPress={() => navigation.navigate("BookScreen", { turfDetails })}
          >
            <LinearGradient
              colors={["#00C247", "#004CE8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1.5 }}
              style={styles.gradientButtonBg}
            >
              <Text style={styles.gradientButtonText}>Book Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  image: {
    width: screenWidth - 48,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  imageMap: {
    width: screenWidth - 20,
    height: 300,
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#303030",
  },
  subTitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#757575",
  },
  sportText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#1E1E1E",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    backgroundColor: "#F1F5F9",
    minHeight: 42,
    minWidth: "47%",
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chipIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  chipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#49454F",
  },
  rulesList: {
    marginTop: 8,
    gap: 4,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  ruleIcon: {
    marginRight: 8,
  },
  gradientButton: {
    marginTop: 10,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  gradientButtonBg: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  gradientButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  locationCard: {
    marginTop: 10,
    width: screenWidth - 32,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  locationCardAddress: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
  },
  directionsBtn: {
    backgroundColor: "#067B6A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  directionsBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});

export default VenueDetailsScreen;
