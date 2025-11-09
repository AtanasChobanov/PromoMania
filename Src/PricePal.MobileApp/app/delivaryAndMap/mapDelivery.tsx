import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useCartSuggestions } from '@/services/useShoppingCart';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { moderateScale } from 'react-native-size-matters';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface RouteInfo {
  distance: number;
  distanceText: string;
  duration: number;
  durationText: string;
  coordinates: LocationCoords[];
}

interface ShopData {
  name: string;
  price_bgn: number;
  price_eur: number;
  location: LocationCoords;
  route?: RouteInfo;
}

const MapDelevary = () => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [calculatingRoutes, setCalculatingRoutes] = useState<boolean>(false);
  
  const [shopsData, setShopsData] = useState<ShopData[]>([]);
  
  const { suggestions, bestOffer, otherOffers, isLoading: suggestionsLoading } = useCartSuggestions();

  const shopColors = {
    Kaufland: { primary: '#E31E24', secondary: '#FFE5E6' },
    Lidl: { primary: '#0050AA', secondary: '#E5F0FF' },
    Billa: { primary: '#FFD500', secondary: '#FFF9E5' },
    TMarket: { primary: '#00A651', secondary: '#E5F5ED' }
  };

  const shopImages = {
    Kaufland: require('../../assets/icons/kaufland-logo.png'),
    Lidl: require('../../assets/icons/Lidl-logo.png'),
    Billa: require('../../assets/icons/billa-logo.jpg'),
    TMarket: require('../../assets/icons/tmarket-logo.png')
  };

  const shopNameVariations: { [key: string]: string[] } = {
    Kaufland: ['Kaufland', 'Кауфланд', 'kaufland'],
    Lidl: ['Lidl', 'Лидл', 'lidl'],
    Billa: ['Billa', 'Била', 'billa'],
    TMarket: ['T Market', 'Т Маркет', 'T-Market', 'TMarket', 'tmarket','T MARKET']
  };

  const decodePolyline = (encoded: string): LocationCoords[] => {
    const points: LocationCoords[] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  };

  const getDirectionsOSRM = async (
    origin: LocationCoords,
    dest: LocationCoords
  ): Promise<RouteInfo | null> => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${dest.longitude},${dest.latitude}?overview=full&geometries=polyline`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const points = decodePolyline(route.geometry);

        const distanceInKm = (route.distance / 1000).toFixed(1);
        const durationInMin = Math.round(route.duration / 60);

        return {
          distance: route.distance,
          distanceText: `${distanceInKm} км`,
          duration: route.duration,
          durationText: `${durationInMin} мин`,
          coordinates: points,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching directions:', error);
      return null;
    }
  };

  const findShopLocation = async (shopName: string, userLoc: LocationCoords): Promise<LocationCoords | null> => {
    try {
      const radius = 15000;
      
      const variations = shopNameVariations[shopName] || [shopName];
      
      const queries = variations.map(variation => `
        node["name"="${variation}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        way["name"="${variation}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        relation["name"="${variation}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        node["brand"="${variation}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        way["brand"="${variation}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        relation["brand"="${variation}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        node["name:en"="${variation}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        way["name:en"="${variation}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        node["name:bg"="${variation}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        way["name:bg"="${variation}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
      `).join('');
      
      const overpassQuery = `[out:json][timeout:25];(${queries});out center;`;

      console.log(`Searching for ${shopName}`);

      const url = 'https://overpass-api.de/api/interpreter';
      const response = await fetch(url, {
        method: 'POST',
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const text = await response.text();
      
      if (text.startsWith('<')) {
        console.error(`Overpass API returned HTML for ${shopName}`);
        return null;
      }
      
      const data = JSON.parse(text);

      console.log(`Found ${data.elements?.length || 0} results for ${shopName}`);

      if (data.elements && data.elements.length > 0) {
        let closestElement = null;
        let minDistance = Infinity;
        
        for (const element of data.elements) {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;
          
          if (lat && lon) {
            const R = 6371;
            const dLat = (lat - userLoc.latitude) * Math.PI / 180;
            const dLon = (lon - userLoc.longitude) * Math.PI / 180;
            const a = 
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userLoc.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            
            if (distance < minDistance) {
              minDistance = distance;
              closestElement = { latitude: lat, longitude: lon };
            }
          }
        }
        
        if (closestElement) {
          console.log(`Using closest location for ${shopName} at ${minDistance.toFixed(2)} km:`, closestElement);
          return closestElement;
        }
      }
      
      console.log(`No results found for ${shopName}`);
      return null;
    } catch (error) {
      console.error(`Error finding ${shopName}:`, error);
      return null;
    }
  };

  const calculateShopRoutes = async (userLoc: LocationCoords, offers: any[]) => {
    if (offers.length === 0) return;

    setCalculatingRoutes(true);
    const updatedShops: ShopData[] = [];

    for (const offer of offers) {
      const shopName = offer.storeChain;
      
      const shopLocation = await findShopLocation(shopName, userLoc);
      
      if (shopLocation) {
        const routeInfo = await getDirectionsOSRM(userLoc, shopLocation);
        
        updatedShops.push({
          name: shopName,
          price_bgn: offer.totalPriceBgn,
          price_eur: offer.totalPriceEur,
          location: shopLocation,
          route: routeInfo || undefined,
        });
      } else {
        console.log(`Could not find location for ${shopName}`);
        updatedShops.push({
          name: shopName,
          price_bgn: offer.totalPriceBgn,
          price_eur: offer.totalPriceEur,
          location: userLoc,
          route: undefined,
        });
      }
    }

    // Sort: best price first, then by distance
    updatedShops.sort((a, b) => {
      // Best offer always first
      if (bestOffer && a.name === bestOffer.storeChain) return -1;
      if (bestOffer && b.name === bestOffer.storeChain) return 1;
      
      // Then sort by distance
      const distA = a.route?.distance ?? Infinity;
      const distB = b.route?.distance ?? Infinity;
      return distA - distB;
    });

    setShopsData(updatedShops);
    setCalculatingRoutes(false);
  };

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
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation && !suggestionsLoading) {
      const allOffers = [];
      if (bestOffer) allOffers.push(bestOffer);
      if (otherOffers && otherOffers.length > 0) allOffers.push(...otherOffers);
      
      const availableOffers = allOffers.filter(offer => offer && offer.storeChain);
      
      if (availableOffers.length > 0) {
        calculateShopRoutes(userLocation, availableOffers);
      }
    }
  }, [userLocation, suggestionsLoading, bestOffer, otherOffers]);

  const handleShopClick = async (shopName: string) => {
    if (!userLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    setSelectedShop(shopName);
    console.log(`Clicked on ${shopName}`);
  };

  // Find the closest shop (with valid route data)
  const getClosestShop = (): ShopData | null => {
    const shopsWithRoutes = shopsData.filter(shop => shop.route && shop.route.distance);
    if (shopsWithRoutes.length === 0) return null;
    
    return shopsWithRoutes.reduce((closest, current) => {
      if (!closest.route || !current.route) return closest;
      return current.route.distance < closest.route.distance ? current : closest;
    });
  };

  const renderShopCard = (
    shopData: ShopData,
    isBestOffer: boolean = false,
    isClosest: boolean = false
  ) => {
    const isSelected = selectedShop === shopData.name;
    const colors = shopColors[shopData.name as keyof typeof shopColors];
    const shopImage = shopImages[shopData.name as keyof typeof shopImages];

    return (
      <Pressable  
        key={shopData.name}
        style={[
          styles.optionContainer, 
          {  
            backgroundColor: theme.colors.cardBackground,
            borderColor: isSelected ? colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
            transform: [{ scale: isSelected ? 1.02 : 1 }],
          }
        ]}
        onPress={() => handleShopClick(shopData.name)}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
          <Image 
            style={{ width: 28, height: 28 }} 
            source={shopImage}
            resizeMode="contain"
          />
          <Text style={[styles.chainName, { color: colors.primary }]}>
            {shopData.name}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
            Цена
          </Text>
          <View style={styles.dataGroup}>
            <View style={[styles.dataBadge, { borderColor: `${colors.primary}30` }]}>
              <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                {shopData.price_bgn.toFixed(2)} лв
              </Text>
            </View>
            <View style={[styles.dataBadge, { borderColor: `${colors.primary}30` }]}>
              <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                {shopData.price_eur.toFixed(2)}€
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
            Разстояние
          </Text>
          {shopData.route ? (
            <View style={styles.dataGroup}>
              <View style={[styles.dataBadge, { borderColor: `${colors.primary}30` }]}>
                <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                  🚗 {shopData.route.distanceText}
                </Text>
              </View>
              <View style={[styles.dataBadge, { borderColor: `${colors.primary}30` }]}>
                <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                  ⏱️ {shopData.route.durationText}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.dataGroup}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.calculatingText, { color: theme.colors.textSecondary }]}>
                Изчисляване...
              </Text>
            </View>
          )}
        </View>

        <View style={styles.arrowContainer}>
          <Text style={[styles.arrow, { color: colors.primary, opacity: 0.6 }]}>›</Text>
        </View>

        {isBestOffer && (
          <View style={[styles.bestDealBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.bestDealText}>✨ Най-добра цена</Text>
          </View>
        )}
        
        {isClosest && !isBestOffer && (
          <View style={[styles.closestBadge, { backgroundColor: '#00A651' }]}>
            <Text style={styles.closestText}>📍 Най-близък магазин</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderMapContent = () => (
    <MapView
   
      style={styles.mapInBox}
      region={{
        latitude: userLocation!.latitude,
        longitude: userLocation!.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation={true}
      showsMyLocationButton={false}
    >
      <Marker 
        coordinate={userLocation!} 
        title="Вие сте тук" 
        pinColor="blue" 
      />

      {shopsData.map((shop, index) => (
        <Marker
          key={`${shop.name}-${index}`}
          coordinate={shop.location}
          title={shop.name}
          description={shop.route ? `${shop.route.distanceText} - ${shop.price_bgn.toFixed(2)} лв` : `${shop.price_bgn.toFixed(2)} лв`}
          pinColor={shopColors[shop.name as keyof typeof shopColors]?.primary || '#999'}
        />
      ))}

      {shopsData.map((shop, index) => {
        if (shop.route && (selectedShop === shop.name || selectedShop === null)) {
          return (
            <Polyline
              key={`route-${shop.name}-${index}`}
              coordinates={shop.route.coordinates}
              strokeColor={shopColors[shop.name as keyof typeof shopColors]?.primary || '#999'}
              strokeWidth={selectedShop === shop.name ? 5 : 3}
            />
          );
        }
        return null;
      })}
    </MapView>
  );

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

  if (suggestionsLoading) {
    return (
      <ImageBackground
        source={theme.backgroundImage}
        style={styles.backgroundImage}
      >
        <View style={[styles.centered, { flex: 1 }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>
              Зареждане на оферти...
            </Text>
            <Text style={[styles.loadingSubtext, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
              Моля изчакайте
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        {renderMapContent()}
        
        <Pressable 
          style={[styles.fullscreenButton, { backgroundColor: theme.colors.cardBackground }]}
          onPress={() => setIsFullscreen(false)}
        >
          <Text style={[styles.fullscreenButtonText, { color: theme.colors.textPrimary }]}>
            ✕
          </Text>
        </Pressable>

        <View style={[styles.mapInfoBadge, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.mapInfoText, { color: theme.colors.textPrimary }]}>
            📍 {shopsData.length} магазина наблизо
          </Text>
        </View>
      </View>
    );
  }

  const closestShop = getClosestShop();

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

        <View style={styles.mapContainer}>
          <View style={styles.mapBox}>
            {renderMapContent()}
          </View>
          
          <Pressable 
            style={[styles.expandButton, { backgroundColor: theme.colors.cardBackground }]}
            onPress={() => setIsFullscreen(true)}
          >
            <Text style={[styles.expandButtonText, { color: theme.colors.textPrimary }]}>
              ⛶
            </Text>
          </Pressable>

          <View style={[styles.mapInfoBadge, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.mapInfoText, { color: theme.colors.textPrimary }]}>
              📍 {shopsData.length} магазина наблизо
            </Text>
          </View>
        </View>

        <View style={styles.optionsWrapper}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Налични магазини
          </Text>
          
          {calculatingRoutes && (
            <View style={styles.calculatingBanner}>
              <ActivityIndicator size="small" color="#0066CC" />
              <Text style={[styles.calculatingBannerText, { color: theme.colors.textPrimary }]}>
                Изчисляване на разстояния...
              </Text>
            </View>
          )}
          
          {shopsData.map((shopData, index) => {
            const isBestOffer = bestOffer?.storeChain === shopData.name;
            const isClosest = closestShop?.name === shopData.name;
            
            return renderShopCard(shopData, isBestOffer, isClosest);
          })}
          
          {shopsData.length === 0 && !calculatingRoutes && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
                Няма налични оферти за вашата количка
              </Text>
            </View>
          )}
        </View>

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
  expandButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  expandButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  fullscreenContainer: {
    flex: 1,
    position: 'relative',
  },
  fullscreenButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  fullscreenButtonText: {
    fontSize: 24,
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
  calculatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(12),
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    borderRadius: 12,
    gap: 12,
    marginBottom: moderateScale(8),
  },
  calculatingBannerText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
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
  calculatingText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
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
  closestBadge: {
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
  closestText: {
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
  emptyState: {
    padding: moderateScale(32),
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MapDelevary;