import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useCartSuggestions } from '@/services/useShoppingCart';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';
import Svg, { Circle, Path } from 'react-native-svg';
import { WebView } from 'react-native-webview';

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

const MapDelivery = () => {
   const navigation = useNavigation();
  const { isDarkMode,isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const webViewRef = useRef<WebView>(null);
  
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [calculatingRoutes, setCalculatingRoutes] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  
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
      
     const queries = variations.map(v => `
  nwr["name"="${v}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
  nwr["brand"="${v}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
  nwr["name:en"="${v}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
  nwr["name:bg"="${v}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
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

    updatedShops.sort((a, b) => {
      if (bestOffer && a.name === bestOffer.storeChain) return -1;
      if (bestOffer && b.name === bestOffer.storeChain) return 1;
      
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

 useEffect(() => {
    if (mapLoaded && userLocation && webViewRef.current) {
      setTimeout(() => {
        updateMap();
      }, 50);
    }
  }, [shopsData, selectedShop, mapLoaded, isFullscreen, userLocation]);

  const updateMap = () => {
    if (!webViewRef.current || !userLocation) return;

    const mapData = {
      userLocation,
      shops: shopsData.map(shop => ({
        name: shop.name,
        location: shop.location,
        route: shop.route,
        color: shopColors[shop.name as keyof typeof shopColors]?.primary || '#999',
        isSelected: selectedShop === shop.name || selectedShop === null,
      })),
    };

    const script = `
      window.updateMapData(${JSON.stringify(mapData)});
      true;
    `;

    webViewRef.current.injectJavaScript(script);
  };

  const handleShopClick = async (shopName: string) => {
    if (!userLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    setSelectedShop(shopName);
    console.log(`Clicked on ${shopName}`);
  };

  const getClosestShop = (): ShopData | null => {
    const shopsWithRoutes = shopsData.filter(shop => shop.route && shop.route.distance);
    if (shopsWithRoutes.length === 0) return null;
    
    return shopsWithRoutes.reduce((closest, current) => {
      if (!closest.route || !current.route) return closest;
      return current.route.distance < closest.route.distance ? current : closest;
    });
  };

  const generateMapHTML = () => {
    const isDark = isDarkMode;
    const initialLat = userLocation?.latitude || 42.5;
    const initialLng = userLocation?.longitude || 25.5;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; }
          html, body, #map { width: 100%; height: 100%; }
          .leaflet-popup-content-wrapper {
            background: ${isDark ? '#1e1e1e' : '#ffffff'};
            color: ${isDark ? '#ffffff' : '#000000'};
          }
          .leaflet-popup-tip {
            background: ${isDark ? '#1e1e1e' : '#ffffff'};
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {
            zoomControl: true,
            attributionControl: false
          }).setView([${initialLat}, ${initialLng}], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          var userMarker = null;
          var shopMarkers = [];
          var routePolylines = [];

          window.updateMapData = function(data) {
            // Clear existing markers and routes
            if (userMarker) map.removeLayer(userMarker);
            shopMarkers.forEach(marker => map.removeLayer(marker));
            routePolylines.forEach(polyline => map.removeLayer(polyline));
            shopMarkers = [];
            routePolylines = [];

            // Add user marker
            userMarker = L.marker([data.userLocation.latitude, data.userLocation.longitude], {
              icon: L.divIcon({
                className: 'user-marker',
                html: '<div style="background: #0066CC; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              })
            }).addTo(map).bindPopup('Вие сте тук');

            // Add shop markers and routes
            data.shops.forEach(function(shop) {
              var markerIcon = L.divIcon({
                className: 'shop-marker',
                html: '<div style="background: ' + shop.color + '; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              });

              var marker = L.marker([shop.location.latitude, shop.location.longitude], {
                icon: markerIcon
              }).addTo(map);

              var popupContent = shop.name;
              if (shop.route) {
                popupContent += '<br>' + shop.route.distanceText;
              }
              marker.bindPopup(popupContent);
              
              shopMarkers.push(marker);

              // Add route if available and should be shown
              if (shop.route && shop.isSelected) {
                var coordinates = shop.route.coordinates.map(function(coord) {
                  return [coord.latitude, coord.longitude];
                });

                var polyline = L.polyline(coordinates, {
                  color: shop.color,
                  weight: shop.isSelected && data.shops.length > 1 ? 5 : 3,
                  opacity: 0.7
                }).addTo(map);

                routePolylines.push(polyline);
              }
            });

            // Fit bounds to show all markers
            if (shopMarkers.length > 0) {
              var group = L.featureGroup([userMarker, ...shopMarkers]);
              map.fitBounds(group.getBounds().pad(0.1));
            } else {
              map.setView([data.userLocation.latitude, data.userLocation.longitude], 13);
            }
          };

          // Notify React Native that map is ready
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') {
        setMapLoaded(true);
        // Immediately update the map when it's ready
        setTimeout(() => {
          updateMap();
        }, 100);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };
// Icon Components

const CarIcon = ({ size = 24, color = '#000' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      d="M8 17H16M8 17C8 18.1046 7.10457 19 6 19C4.89543 19 4 18.1046 4 17M8 17C8 15.8954 7.10457 15 6 15C4.89543 15 4 15.8954 4 17M16 17C16 18.1046 16.8954 19 18 19C19.1046 19 20 18.1046 20 17M16 17C16 15.8954 16.8954 15 18 15C19.1046 15 20 15.8954 20 17M10 5V11M4 11L4.33152 9.01088C4.56901 7.58593 4.68776 6.87345 5.0433 6.3388C5.35671 5.8675 5.79705 5.49447 6.31346 5.26281C6.8993 5 7.6216 5 9.06621 5H12.4311C13.3703 5 13.8399 5 14.2662 5.12945C14.6436 5.24406 14.9946 5.43194 15.2993 5.68236C15.6435 5.96523 15.904 6.35597 16.425 7.13744L19 11M4 17H3.6C3.03995 17 2.75992 17 2.54601 16.891C2.35785 16.7951 2.20487 16.6422 2.10899 16.454C2 16.2401 2 15.9601 2 15.4V14.2C2 13.0799 2 12.5198 2.21799 12.092C2.40973 11.7157 2.71569 11.4097 3.09202 11.218C3.51984 11 4.0799 11 5.2 11H17.2C17.9432 11 18.3148 11 18.6257 11.0492C20.3373 11.3203 21.6797 12.6627 21.9508 14.3743C22 14.6852 22 15.0568 22 15.8C22 15.9858 22 16.0787 21.9877 16.1564C21.9199 16.5843 21.5843 16.9199 21.1564 16.9877C21.0787 17 20.9858 17 20.8 17H20"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClockIcon = ({ size = 16, color = "#000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth="2" 
    />
    <Path
      d="M12 6v6l4 4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const SparkleIcon = ({ size = 16, color = "#fff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l2.4 7.2L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.8L12 2z"
      fill={color}
    />
  </Svg>
);

const LocationIcon = ({ size = 16, color = "#fff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"
      fill={color}
    />
  </Svg>
);

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
            <View style={[styles.dataBadge, { borderColor: `${colors.primary}`, backgroundColor:theme.colors.cardBackground }]}>
              <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                {shopData.price_bgn.toFixed(2)} лв
              </Text>
            </View>
            <View style={[styles.dataBadge, { borderColor: `${colors.primary}` }]}>
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
              <View style={[styles.dataBadge, { borderColor: `${colors.primary}`, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <CarIcon size={15} color={theme.colors.textPrimary} />
                <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                  {shopData.route.distanceText}
                </Text>
              </View>
              <View style={[styles.dataBadge, { borderColor: `${colors.primary}`, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <ClockIcon size={14} color={theme.colors.textPrimary} />
                <Text style={[styles.dataText, { color: theme.colors.textPrimary }]}>
                  {shopData.route.durationText}
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
          <View style={[styles.bestDealBadge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <SparkleIcon size={14} color="#fff" />
            <Text style={styles.bestDealText}>Най-добра цена</Text>
          </View>
        )}
        
        {isClosest && !isBestOffer && (
          <View style={[styles.closestBadge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <LocationIcon size={14} color="#fff" />
            <Text style={styles.closestText}>Най-близък магазин</Text>
          </View>
        )}

          {isClosest && isBestOffer && (
          <View style={[styles.closestBadge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <LocationIcon size={14} color="#fff" />
            <Text style={styles.closestText}>Най-близък и евтин магазин</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderMapContent = () => (
    <WebView
      ref={webViewRef}
      source={{ html: generateMapHTML() }}
      style={styles.mapInBox}
      onMessage={handleWebViewMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={styles.mapLoadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      )}
    />
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
            {shopsData.length} магазина наблизо
          </Text>
        </View>
      </View>
    );
  }

  const closestShop = getClosestShop();



    const BackButton = () => (
     <TouchableOpacity
               onPress={() => router.back()}
               style={styles.backButton}
             >
               {isPerformanceMode ? (
              <View 
        
                style={[styles.tabBarBlur,{backgroundColor:theme.colors.backgroundColor}]} 
              />
            ) : (
              <BlurView 
                intensity={20} 
                tint={theme.colors.TabBarColors as 'light' | 'dark'}
                experimentalBlurMethod="dimezisBlurView"
                style={[StyleSheet.absoluteFillObject,]}
              />
            )}
               <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                 <Path
                   d="M15 18l-6-6 6-6"
                   stroke={theme.colors.textPrimary}
                   strokeWidth={2}
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 />
               </Svg>
             </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={theme.backgroundImage}
      style={styles.backgroundImage}
    >
       <BackButton />
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
              {shopsData.length} магазина наблизо
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
   backButton: {
     width: 40,
     height: 40,
     top:scale(6),
    marginHorizontal: 20,

     borderRadius: 20,
     borderColor: 'white',
     borderStyle: 'solid',
     borderWidth: 1,
     overflow: 'hidden',
     justifyContent: 'center',
     alignItems: 'center',
   },
  backButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
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
  mapLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    top:moderateScale(80

    ),
    left: moderateScale(5),
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
    marginRight: moderateScale(3),
    borderWidth: 1.5,
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
    tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapDelivery;