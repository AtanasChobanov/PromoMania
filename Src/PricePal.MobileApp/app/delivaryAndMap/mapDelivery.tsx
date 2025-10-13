import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  duration_min: number;
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

  // Shop colors for visual differentiation
  const shopColors = {
    Kaufland: { primary: '#E31E24', secondary: '#FFE5E6' },
    Lidl: { primary: '#0050AA', secondary: '#E5F0FF' },
    Billa: { primary: '#FFD500', secondary: '#FFF9E5' }
  };

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

  const renderShopCard = (
    shopName: string, 
    priceBGN: string, 
    priceEUR: string, 
    distance: string, 
    duration: string,
    iconSize: { width: number, height: number }
  ) => {
    const isSelected = selectedShop === shopName;
    const colors = shopColors[shopName as keyof typeof shopColors];

    return (
      <Pressable  
        style={[
          styles.optionContainer, 
          {  
            backgroundColor: theme.colors.cardBackground,
            borderColor: isSelected ? colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
            transform: [{ scale: isSelected ? 1.02 : 1 }],
          }
        ]}
        onPress={() => handleShopClick(shopName)}
      >
        {/* Brand Icon Container */}
        <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
          <Image 
            style={iconSize} 
            source={require('../../assets/icons/kaufland-logo.png')}
          />
          <Text style={[styles.chainName, { color: colors.primary }]}>
            {shopName}
          </Text>
        </View>

        {/* Price Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
            Цена
          </Text>
          <View style={styles.dataGroup}>
            <View style={[styles.dataBadge, { borderColor: `${colors.primary}30` }]}>
              <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                {priceBGN}
              </Text>
            </View>
            <View style={[styles.dataBadge, { borderColor: `${colors.primary}30` }]}>
              <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                {priceEUR}
              </Text>
            </View>
          </View>
        </View>

        {/* Distance/Time Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
            Разстояние
          </Text>
          <View style={styles.dataGroup}>
            <View style={[styles.dataBadge, { borderColor: `${colors.primary}30` }]}>
              <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                🚗 {distance}
              </Text>
            </View>
            <View style={[styles.dataBadge, { borderColor: `${colors.primary}30` }]}>
              <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                ⏱️ {duration}
              </Text>
            </View>
          </View>
        </View>

        {/* Arrow Indicator */}
        <View style={styles.arrowContainer}>
          <Text style={[styles.arrow, { color: colors.primary, opacity: 0.6 }]}>›</Text>
        </View>

        {/* Best Deal Badge */}
        {shopName === 'Lidl' && (
          <View style={[styles.bestDealBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.bestDealText}>✨ Най-добра цена</Text>
          </View>
        )}
         {shopName === 'Kaufland' && (
          <View style={[styles.bestDealBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.bestDealText}>✨ Най-наблизо</Text>
          </View>
        )}
      </Pressable>
    );
  };

  if (loading || !userLocation) {
    return (
      <ImageBackground
        source={theme.backgroundImage}
        style={styles.backgroundImage}
      >
        <View style={[styles.centered, { flex: 1 }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>
              Зареждане на локацията...
            </Text>
            <Text style={[styles.loadingSubtext, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
              Моля изчакайте
            </Text>
          </View>
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
        {/* Header Section */}
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { 
            fontSize: moderateScale(30), 
            color: theme.colors.textPrimary 
          }]}>
            Избери магазин
          </Text>
          <Text style={[styles.subtitle, { 
            fontSize: moderateScale(15), 
            color: theme.colors.textSecondary || theme.colors.textPrimary,
            opacity: 0.8
          }]}>
            Намери най-добрата оферта в района
          </Text>
        </View>

        {/* Map Section */}
        <View style={styles.mapContainer}>
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
                title="Вие сте тук" 
                pinColor="blue" 
              />

              {/* Shop Markers - will be populated from API */}
              {shopsData.map((shop, index) => (
                <Marker
                  key={`${shop.name}-${index}`}
                  coordinate={shop.location}
                  title={shop.name}
                  description={`${shop.distance_km} км - ${shop.price_bgn} лв`}
                  pinColor={index === 0 ? '#E31E24' : index === 1 ? '#0050AA' : '#FFD500'}
                />
              ))}

              {/* Route Polylines - will be populated from API */}
              {shopsData.map((shop, index) => {
                if (shop.route && (selectedShop === shop.name || selectedShop === null)) {
                  return (
                    <Polyline
                      key={`route-${shop.name}-${index}`}
                      coordinates={shop.route}
                      strokeColor={index === 0 ? '#E31E24' : index === 1 ? '#0050AA' : '#FFD500'}
                      strokeWidth={selectedShop === shop.name ? 5 : 3}
                    />
                  );
                }
                return null;
              })}
            </MapView>
          </View>
          
          {/* Map Info Badge */}
          <View style={[styles.mapInfoBadge, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.mapInfoText, { color: theme.colors.textPrimary }]}>
              📍 {shopsData.length > 0 ? shopsData.length : 3} магазина наблизо
            </Text>
          </View>
        </View>

        {/* Shop Cards Section */}
        <View style={styles.optionsWrapper}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Налични магазини
          </Text>
          
          {renderShopCard('Kaufland', '50 лв', '26€', '5.2 км', '9 мин', { width: 28, height: 28 })}
          {renderShopCard('Lidl', '45 лв', '23€', '3.8 км', '7 мин', { width: 28, height: 28 })}
          {renderShopCard('Billa', '55 лв', '28€', '7.1 км', '12 мин', { width: 28, height: 28 })}
        </View>

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
            💡 Съвет: Изберете магазин за да видите маршрута на картата
          </Text>
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
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(40),
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: moderateScale(60),
    marginBottom: moderateScale(24),
    gap: 8,
  },
  mainTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  mapContainer: {
    position: 'relative',
    marginBottom: moderateScale(32),
  },
  mapBox: {
    width: '100%',
    height: moderateScale(300),
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  mapInBox: {
    flex: 1,
  },
  mapInfoBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  mapInfoText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginBottom: moderateScale(16),
    letterSpacing: 0.3,
  },
  optionsWrapper: {
    gap: moderateScale(16),
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    minHeight: moderateScale(110),
    position: 'relative',
  },
  iconContainer: {
    flexDirection: 'column',
    width: moderateScale(65),
    height: moderateScale(65),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
    gap: 6,
  },
  chainName: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoSection: {
    flex: 1,
    gap: 8,
  },
  sectionLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  dataGroup: {
    flexDirection: 'column',
    gap: 6,
  },
  dataBadge: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(7),
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dataText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  arrowContainer: {
    marginLeft: moderateScale(8),
  },
  arrow: {
    fontSize: moderateScale(36),
    fontWeight: '200',
  },
  bestDealBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bestDealText: {
    color: '#FFFFFF',
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoFooter: {
    marginTop: moderateScale(24),
    padding: moderateScale(16),
    backgroundColor: 'rgba(0, 102, 204, 0.08)',
    borderRadius: 14,
    alignItems: 'center',
  },
  footerText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default MapDelevary;