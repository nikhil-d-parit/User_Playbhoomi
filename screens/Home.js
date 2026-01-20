import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';
import api from '../src/services/apiService';
import FilterModal from "../components/FilterModal";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

//importing icons
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import searchIcon from "../assets/icons/gray/icon-search-gradient.png";
import filterIcon from "../assets/icons/gradient/icon-filter-gradient.png";
import cricketBatWhite from "../assets/icons/white/icon-cricket-white.png";
import cricketGradBat from "../assets/icons/gradient/icon-cricket-gradient.png";
import footBallIconGrad from "../assets/icons/gradient/icon-football-gradient.png";
import footBallIconWhite from "../assets/icons/white/football_white.png";
import tennisIconGrad from "../assets/icons/gradient/icon-tennis-gradient.png";
import tennisIconWhite from "../assets/icons/white/tennis_white.png";
import badmintonIconGrad from "../assets/icons/gradient/icon-badminton-gradient.png";
import badmintonIconWhite from "../assets/icons/white/badminton_white.png";
import basketballIconGrad from "../assets/icons/gradient/icon-basketball-gradient.png";
import basketballIconWhite from "../assets/icons/white/icon-basketball-white.png";
import locationIcon from "../assets/icons/gray/icon-loaction-gradient.png";

const { width } = Dimensions.get("window");

// Helper function to get minimum slot price and its discounted price from venue sports
const getMinPricing = (venue) => {
  if (!venue.sports || venue.sports.length === 0) {
    return { minPrice: null, originalPrice: null };
  }
  
  // Find the sport with the minimum discounted price (or slotPrice if no discount)
  let minSport = null;
  let minPrice = Infinity;
  
  venue.sports.forEach(sport => {
    const price = sport.discountedPrice || sport.slotPrice;
    if (price != null && price > 0 && price < minPrice) {
      minPrice = price;
      minSport = sport;
    }
  });
  
  if (!minSport) {
    return { minPrice: null, originalPrice: null };
  }
  
  // Return the discounted price and original price (if discount exists)
  return {
    minPrice: minSport.discountedPrice || minSport.slotPrice,
    originalPrice: minSport.discountedPrice ? minSport.slotPrice : null
  };
};

const HomeScreen = () => {
  const [venueData, setVenueData] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [location, setLocation] = useState(null);
  const [locationString, setLocationString] = useState("Loading location...");
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const navigation = useNavigation();

  const getLocationDetails = async (latitude, longitude) => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (response[0]) {
        const { city, region } = response[0];
        if (city && region) {
          setLocationString(`${city}, ${region}`);
          // Save location to AsyncStorage for future use
          await AsyncStorage.setItem('userLocation', `${city}, ${region}`);
        }
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      setLocationString("Location not available");
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please allow location access to find venues near you.',
          [{ text: 'OK' }]
        );
        setLocationString("Location access denied");
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Get city and region from coordinates
      await getLocationDetails(
        location.coords.latitude,
        location.coords.longitude
      );

      return location; // Return location for use in nearby venues API call
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationString("Unable to get location");
      return null;
    }
  };

 const fetchNearbyVenues = async (latitude, longitude) => {
   try {
     setIsLoading(true);
     setNoResults(false);
     const response = await api.post("/users/nearby-venues", {
       latitude,
       longitude,
     });
     const venues = response.data || [];
     const activeVenues = venues.filter((venue) => venue.deleted !== true);
    //  console.log(
    //    "Filtered nearby venues:",
    //    JSON.stringify(activeVenues)
    //  );

     setVenueData(activeVenues);
     setNoResults(activeVenues.length === 0);
   } catch (error) {
     console.error("Error fetching nearby venues:", error);
     setVenueData([]);
     setNoResults(true);
   } finally {
     setIsLoading(false);
   }
 };

  const searchTurfs = async (keyword, latitude, longitude) => {
    try {
      setIsLoading(true);
      setNoResults(false);
      const response = await api.post('/users/search-turfs', {
        keyword,
        latitude,
        longitude
      });
      console.log('Search turfs data:', JSON.stringify(response.data, null, 2));
      setVenueData(response.data || []);
      setNoResults(response.data?.length === 0);
    } catch (error) {
      console.error('Error searching turfs:', error);
      setVenueData([]);
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get user data
        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          // Handle guest users who don't have a name property
          if (userData.isGuest) {
            setUserName('Guest');
          } else if (userData.name) {
            const firstName = userData.name.split(' ')[0];
            setUserName(firstName);
          } else {
            setUserName('User');
          }
        }
//  // Get location and fetch nearby venues
//         const locationResult = await getCurrentLocation();
//         if (locationResult?.coords) {
//           fetchNearbyVenues(locationResult.coords.latitude, locationResult.coords.longitude);
//         }
        // Use hardcoded coordinates for testing
        const testCoords = {
          latitude: 23.239172,
          longitude: 87.859145
        };
        
        // Fetch nearby venues with test coordinates
        fetchNearbyVenues(testCoords.latitude, testCoords.longitude);
        
        // Still get location for display purposes
        getCurrentLocation();
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

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
    {
      id: "Tennis",
      name: "Tennis",
      gradientIcon: tennisIconGrad,
      whiteIcon: tennisIconWhite,
    },
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.imageContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.username}>Hi {userName || "Guest"}</Text>
          <TouchableOpacity
            onPress={() => {
              if (
                locationString === "Location access denied" ||
                locationString === "Unable to get location"
              ) {
                getCurrentLocation();
              }
            }}
          >
            <Text
              style={[
                styles.location,
                (locationString === "Location access denied" ||
                  locationString === "Unable to get location") && {
                  color: "#067B6A", // Use your app's primary color
                  textDecorationLine: "underline",
                },
              ]}
            >
              {locationString}
              {(locationString === "Location access denied" ||
                locationString === "Unable to get location") &&
                " (Tap to retry)"}
            </Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: "https://i.pravatar.cc/100?img=1" }}
          style={styles.profileImage}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Image
              source={searchIcon}
              style={[styles.searchIcon, { width: 16, height: 16 }]}
            />
            <TextInput
              placeholder="Search grounds, sports..."
              placeholderTextColor="#757575"
              style={styles.searchTextInput}
            />
          </View>

          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setFilterVisible(true)}
          >
            <Image source={filterIcon} style={{ width: 20, height: 20 }} />
          </TouchableOpacity>
        </View>

        <FilterModal
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          onApply={(filteredData) => {
            setVenueData(filteredData || []);
            setNoResults(filteredData?.length === 0);
            setIsFiltered(true);
            setFilterVisible(false);
          }}
        />

        {/* Sports Row */}
        <View style={styles.circleContainer}>
          {sports.map((sport) => {
            const isSelected = selectedSport === sport.id;

            return (
              <TouchableOpacity
                key={sport.id}
                onPress={() => {
                  const newSport = selectedSport === sport.id ? null : sport.id;
                  setSelectedSport(newSport);
                  if (newSport) {
                    searchTurfs(
                      sport.name.toLowerCase(),
                      23.238860,  // Using the provided coordinates
                      87.859537
                    );
                  } else {
                    // If deselecting, fetch nearby venues again
                    fetchNearbyVenues(23.238860, 87.859537);
                  }
                }}
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

        {/* Popular Venues */}
        <View style={styles.headerContainer}>
          <Text style={styles.cardSectionHeader}>
            {isFiltered 
              ? 'Filtered Venues'
              : selectedSport 
                ? `${selectedSport} Venues Near You` 
                : 'Popular Venues Near You'}
          </Text>
          {isFiltered && (
            <TouchableOpacity 
              onPress={() => {
                setIsFiltered(false);
                fetchNearbyVenues(23.238860, 87.859537);
              }}
              style={styles.clearFilter}
            >
              <Text style={styles.clearFilterText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {isLoading ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>Loading venues...</Text>
          </View>
        ) : noResults ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              {selectedSport 
                ? `No ${selectedSport} venues found in your area` 
                : 'No venues found in your area'}
            </Text>
          </View>
        ) : (
          venueData.map((venue) => (
            <View style={styles.cardContainer} key={venue.turfId}>
            <TouchableOpacity
              onPress={() => navigation.navigate("VenueDetails", { turfId: venue.turfId })}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScroll}
              >
                {venue.images?.length > 0 ? (
                  venue.images.map((url, index) => (
                    <Image
                      key={index}
                      source={{ uri: url }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ))
                ) : (
                  // Fallback image if no images available
                  <Image
                    source={require("../assets/TURF1.jpeg")}
                    style={styles.image}
                    resizeMode="cover"
                  />
                )}
              </ScrollView>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardTitle}>{venue.title}</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Image
                      source={locationIcon}
                      style={{
                        width: 12,
                        height: 12,
                        marginRight: 4,
                        marginTop: 3,
                      }}
                    />
                    <Text style={styles.cardSubtitle}>
                      {venue.address}
                    </Text>
                  </View>

                  <View style={styles.iconRow}>
                    <Image
                      source={cricketGradBat}
                      style={{ width: 16, height: 16 }}
                    />
                    <Image
                      source={footBallIconGrad}
                      style={{ width: 16, height: 16 }}
                    />
                    <Image
                      source={badmintonIconGrad}
                      style={{ width: 16, height: 16 }}
                    />
                  </View>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>Start from</Text>
                  {(() => {
                    const { minPrice, originalPrice } = getMinPricing(venue);
                    return (
                      <>
                        {originalPrice && (
                          <View style={{ position: "relative", display: "inline-block" }}>
                            <Text style={styles.oldPrice}>₹{originalPrice}/hr</Text>
                            <View
                              style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: "50%",
                                height: 1.5,
                                backgroundColor: "#B3261E",
                              }}
                            />
                          </View>
                        )}
                        <Text style={styles.priceAmount}>
                          ₹{minPrice || 'N/A'}{minPrice ? '/hr' : ''}
                        </Text>
                      </>
                    );
                  })()}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  profileImage: { width: 38, height: 38, borderRadius: 18 },
  textContainer: { justifyContent: "center" },
  username: { fontSize: 16, fontFamily: "Inter_400Regular", color: "#1E1E1E" },
  location: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#757575",
    marginTop: 2,
  },
  scrollContent: { paddingTop: 10, padding: 10 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientIcon: {
    flex: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#E9ECEF",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: { marginRight: 8 },
  searchTextInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#757575",
  },

  circleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  circleWrapper: { alignItems: "center", marginHorizontal: 8 },
  circle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#343A40",
    textAlign: "center",
  },

  cardSectionHeader: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#303030",
  },

  cardContainer: {
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  imageScroll: {
    width: width - 20,
    height: 192,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  image: { width: width - 20, height: 192, borderRadius: 12, marginRight: 6 },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#1E1E1E",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#757575",
    marginBottom: 6,
    width: 240,
  },

  iconRow: { flexDirection: "row", gap: 6 },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  priceContainer: { justifyContent: "center", alignItems: "flex-end" },
  priceText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#757575" },
  oldPrice: {
    textDecorationLine: "line-through",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#B3B3B3",
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFA500",
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#757575",
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  clearFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 6,
  },
  clearFilterText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: '#343A40',
  },
});

export default HomeScreen;
