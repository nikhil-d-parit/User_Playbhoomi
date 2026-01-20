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
} from "react-native";
import { Text, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../src/services/apiService";
// import MapView, { Marker } from "react-native-maps"; // Commented out for web compatibility

// Icons
import locationIcon from "../assets/icons/gray/icon-loaction-gradient.png";
import cricketGradBat from "../assets/icons/gradient/icon-cricket-gradient.png";
import footBallIconGrad from "../assets/icons/gradient/icon-football-gradient.png";
import clockIcon from "../assets/icons/gradient/icon-timelapse-gradient.png";
import parkingIcon from "../assets/icons/gradient/icon-car-gradient.png";
import washroomIcon from "../assets/icons/gradient/icon-washroom-gradient.png";
import drinkingWaterIcon from "../assets/icons/gradient/icon-waterglass-gradient.png";
import floodLightIcon from "../assets/icons/gradient/icon-bulb-gradient.png";
import shoeIcon from "../assets/icons/gradient/icon-shoe-gradient.png";
import noSmokingIcon from "../assets/icons/gradient/icon-no_smoking-gradient.png";

const screenWidth = Dimensions.get("window").width;

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
        console.log("Turf details:", JSON.stringify(response.data));
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

  const renderChip = (iconSource, label, customTextStyle = {}) => (
    <Chip
      icon={() => (
        <Image
          source={iconSource}
          style={{ width: 20, height: 20 }}
          resizeMode="contain"
        />
      )}
      style={styles.chip}
      textStyle={[styles.chipText, customTextStyle]}
    >
      {label}
    </Chip>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#004CE8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.imageRow}>
            {turfDetails?.images?.length > 0 ? (
              turfDetails.images.map((url, index) => (
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
            {turfDetails.title}
          </Text>

          <View style={styles.locationRow}>
            <Image
              source={locationIcon}
              style={{ width: 14, height: 14, marginRight: 6 }}
            />
            <Text style={styles.subTitle}>
              {turfDetails?.vendorLocation?.address},{" "}
              {turfDetails?.vendorLocation?.city} • 2 km
            </Text>
          </View>

          {/* Prices */}
          <View style={styles.chipRow}>
            {turfDetails?.sports?.map((sport, index) => (
              <React.Fragment key={index}>
                {renderChip(
                  sport.name === "Cricket" ? cricketGradBat : footBallIconGrad,
                  `${sport.name} - ₹${
                    sport.discountedPrice || sport.slotPrice
                  }/hr`,
                  {
                    color: "#49454F",
                    fontFamily: "Inter_500Medium",
                  }
                )}
              </React.Fragment>
            ))}
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
              {turfDetails?.timeSlots?.[0]?.open} AM -{" "}
              {turfDetails?.timeSlots?.[0]?.close} PM
            </Text>
          </View>

          {/* Amenities */}
          <Text variant="titleMedium" style={[styles.title, { marginTop: 20 }]}>
            Amenities
          </Text>
          <View style={styles.chipRow}>
            {turfDetails?.amenities?.map((key, index) => {
              const amenity = amenityMap[key.toLowerCase()];
              return (
                amenity && (
                  <React.Fragment key={index}>
                    {renderChip(amenity.icon, amenity.label, {
                      color: "#49454F",
                      fontFamily: "Inter_500Medium",
                    })}
                  </React.Fragment>
                )
              );
            })}
          </View>

          <Text variant="titleMedium" style={[styles.title, { marginTop: 20 }]}>
            Rules & Policies
          </Text>
          <View style={styles.rulesList}>
            {turfDetails?.rules?.map((rule, index) => {
              const icon = ruleIconMap[rule.toLowerCase()] || clockIcon;
              return (
                <View key={index} style={styles.ruleItem}>
                  <Image
                    source={icon}
                    style={{ width: 20, height: 20, marginRight: 6 }}
                  />
                  <Text style={[styles.subTitle, { color: "#1E1E1E" }]}>
                    {rule}
                  </Text>
                </View>
              );
            })}
            {turfDetails?.cancellationHours && (
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
          {/* <Text variant="titleMedium" style={[styles.title, { marginTop: 20 }]}>
            Location
          </Text>
          <View style={{ alignItems: "center", marginTop: 10 }}>
            {turfDetails?.vendorLocation?.lat &&
            turfDetails?.vendorLocation?.lng ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: turfDetails.vendorLocation.lat,
                  longitude: turfDetails.vendorLocation.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: turfDetails.vendorLocation.lat,
                    longitude: turfDetails.vendorLocation.lng,
                  }}
                  title={turfDetails.title}
                  description={turfDetails.vendorLocation.address}
                />
              </MapView>
            ) : (
              <View
                style={{
                  width: screenWidth - 20,
                  height: 200,
                  borderRadius: 12,
                  backgroundColor: "#F1F5F9",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#555", fontFamily: "Inter_500Medium" }}>
                  Error at loading map...!!
                </Text>
              </View>
            )}
          </View> */}
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
    justifyContent: "space-between",
    marginTop: 12,
  },
  chip: {
    backgroundColor: "#F1F5F9",
    height: 42,
    minWidth: "48%",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Regular",
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
  map: {
  width: screenWidth - 20,
  height: 300,
  borderRadius: 12,
}
});

export default VenueDetailsScreen;
