import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { moderateScale } from 'react-native-size-matters';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface ShopData {
  name: string;
  price_bgn: number;
  price_eur: number;
  distance_km: number;
  location: LocationCoords;
  route?: LocationCoords[];
}

const MapDelevary = () => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  
  // This will be populated from your API
  const [shopsData, setShopsData] = useState<ShopData[]>([]);

  // Get user location
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your position on the map.'
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);
      setLoading(false);
      
      // TODO: Call your API here with userCoords to fetch shop data
      // fetchShopsFromAPI(userCoords);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  // TODO: Replace this with your API call
  const fetchShopsFromAPI = async (location: LocationCoords) => {
    try {
      // Example API call structure:
      // const response = await fetch(`YOUR_API_ENDPOINT?lat=${location.latitude}&lng=${location.longitude}`);
      // const data = await response.json();
      // setShopsData(data.shops);
      
      console.log('Fetch shops from API for location:', location);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const handleShopClick = async (shopName: string) => {
    if (!userLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    setSelectedShop(shopName);
    
    // TODO: Call your API to get route data for specific shop
    // fetchRouteFromAPI(userLocation, shopName);
    console.log(`Clicked on ${shopName}`);
  };

  if (loading || !userLocation) {
    return (
      <ImageBackground
        source={theme.backgroundImage}
        style={styles.backgroundImage}
      >
        <View style={[styles.centered, { flex: 1 }]}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>
            Getting your location...
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={theme.backgroundImage}
      style={styles.backgroundImage}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { 
            fontSize: moderateScale(32), 
            color: theme.colors.textPrimary 
          }]}>
            Избери верига до която да отидеш
          </Text>
          <Text style={[styles.subtitle, { 
            fontSize: moderateScale(15), 
            color: theme.colors.textSecondary || theme.colors.textPrimary,
            opacity: 0.7
          }]}>
            Цената или времето ти е по важно?
          </Text>
        </View>

        {/* Map Box */}
        <View style={styles.mapBox}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapInBox}
            region={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {/* User Location Marker */}
            <Marker 
              coordinate={userLocation} 
              title="You are here" 
              pinColor="blue" 
            />

            {/* Shop Markers - will be populated from API */}
            {shopsData.map((shop, index) => (
              <Marker
                key={`${shop.name}-${index}`}
                coordinate={shop.location}
                title={shop.name}
                description={`${shop.distance_km} км - ${shop.price_bgn} лв`}
                pinColor={index === 0 ? '#FF0000' : index === 1 ? '#0066CC' : '#00CC00'}
              />
            ))}

            {/* Route Polylines - will be populated from API */}
            {shopsData.map((shop, index) => {
              if (shop.route && (selectedShop === shop.name || selectedShop === null)) {
                return (
                  <Polyline
                    key={`route-${shop.name}-${index}`}
                    coordinates={shop.route}
                    strokeColor={index === 0 ? '#FF0000' : index === 1 ? '#0066CC' : '#00CC00'}
                    strokeWidth={selectedShop === shop.name ? 5 : 3}
                  />
                );
              }
              return null;
            })}
          </MapView>
        </View>

        <View style={styles.optionsWrapper}>
          {/* Kaufland Button */}
          <TouchableOpacity 
            style={[styles.optionContainer, {  
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.border,
            }]}
            activeOpacity={0.7}
            onPress={() => handleShopClick('Kaufland')}
          >
            <View style={styles.iconContainer}>
              <Image 
                style={{width:24, height:24}} 
                source={require('../../assets/icons/kaufland-logo.png')}
              />
              <Text style={[styles.chainName, { color: theme.colors.textPrimary }]}>
                Kaufland
              </Text>
            </View>
            <View style={styles.textContainer}>
              {/* TODO: Replace with API data */}
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(16), 
                color: theme.colors.textPrimary
              }]}>
                50 лв
              </Text>
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(16), 
                color: theme.colors.textPrimary
              }]}>
                50 евро
              </Text>
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(16), 
                color: theme.colors.textPrimary
              }]}>
                5 км
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={[styles.arrow, { color: theme.colors.textPrimary, opacity: 0.3 }]}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Lidl Button */}
          <TouchableOpacity 
            style={[styles.optionContainer, {  
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.border,
            }]}
            activeOpacity={0.7}
            onPress={() => handleShopClick('Lidl')}
          >
            <View style={styles.iconContainer}>
              <Image 
                style={{width:24, height:24}} 
                source={require('../../assets/icons/kaufland-logo.png')}
              />
              <Text style={[styles.chainName, { color: theme.colors.textPrimary }]}>
                Lidl
              </Text>
            </View>
            <View style={styles.textContainer}>
              {/* TODO: Replace with API data */}
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(16), 
                color: theme.colors.textPrimary
              }]}>
                45 лв
              </Text>
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(16), 
                color: theme.colors.textPrimary
              }]}>
                45 евро
              </Text>
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(16), 
                color: theme.colors.textPrimary
              }]}>
                3 км
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={[styles.arrow, { color: theme.colors.textPrimary, opacity: 0.3 }]}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Billa Button */}
          <TouchableOpacity 
            style={[styles.optionContainer, {  
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.border,
            }]}
            activeOpacity={0.7}
            onPress={() => handleShopClick('Billa')}
          >
            <View style={styles.iconContainer}>
              <Image 
                style={{width:24, height:24}} 
                source={require('../../assets/icons/kaufland-logo.png')}
              />
              <Text style={[styles.chainName, { color: theme.colors.textPrimary }]}>
                Billa
              </Text>
            </View>
            <View style={styles.textContainer}>
              {/* TODO: Replace with API data */}
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(16), 
                color: theme.colors.textPrimary
              }]}>
                55 лв
              </Text>
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(16), 
                color: theme.colors.textPrimary
              }]}>
                55 евро
              </Text>
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(16), 
                color: theme.colors.textPrimary
              }]}>
                7 км
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={[styles.arrow, { color: theme.colors.textPrimary, opacity: 0.3 }]}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(10),
    paddingBottom: moderateScale(30),
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: moderateScale(70),
    marginBottom: moderateScale(20),
  },
  mainTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: moderateScale(12),
  },
  subtitle: {
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  mapBox: {
    width: '100%',
    height: moderateScale(250),
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: moderateScale(20),
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mapInBox: {
    flex: 1,
  },
  optionsWrapper: {
    gap: moderateScale(20),
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    minHeight: moderateScale(100),
  },
  iconContainer: {
    flexDirection: 'column',
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(16),
    gap: 8,
  },
  chainName: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  optionTitle: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  arrowContainer: {
    marginLeft: moderateScale(8),
  },
  arrow: {
    fontSize: moderateScale(32),
    fontWeight: '300',
  },
});

export default MapDelevary;