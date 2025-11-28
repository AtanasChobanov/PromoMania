import { shopColors, shopImages } from '@/components/pages/mapDelivary/mapDelivaryConstants';
import { AlertIcon, CarIcon, ClockIcon, LocationIcon, SparkleIcon } from '@/components/pages/mapDelivary/mapDelivaryIcons';
import { LocationCoords, ShopData } from '@/components/pages/mapDelivary/mapDelivaryInterfaces';
import { findShopLocation, getDirectionsOSRM } from '@/components/pages/mapDelivary/mapDelivaryServices';
import { mapDelivaryStyles } from '@/components/pages/mapDelivary/mapDelivaryStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useCartSuggestions } from '@/services/useShoppingCart';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Svg, { Path } from 'react-native-svg';
import { WebView } from 'react-native-webview';
const MapDelivery = () => {
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
  
  const { bestOffer, otherOffers, isLoading: suggestionsLoading } = useCartSuggestions();


const calculateShopRoutes = async (userLoc: LocationCoords, offers: any[]) => {
    if (offers.length === 0) return;

    setCalculatingRoutes(true);

    // Process all offers in PARALLEL instead of one by one
    const shopPromises = offers.map(async (offer) => {
      const shopName = offer.storeChain;
      
      try {
        // Attempt to find location
        const shopLocation = await findShopLocation(shopName, userLoc);
        
        if (shopLocation) {
          const routeInfo = await getDirectionsOSRM(userLoc, shopLocation);
          
          return {
            name: shopName,
            price_bgn: offer.totalPriceBgn,
            price_eur: offer.totalPriceEur,
            location: shopLocation,
            route: routeInfo || undefined,
            isLocationFound: true, 
          };
        }
      } catch (error) {
        console.warn(`Error processing ${shopName}, skipping location...`, error);
      }

      // Fallback: If location not found or error occurred, return this object
      // so the shop still appears in the list (but marked as not found)
      return {
        name: shopName,
        price_bgn: offer.totalPriceBgn,
        price_eur: offer.totalPriceEur,
        location: userLoc, // Dummy location (won't be plotted)
        route: undefined,
        isLocationFound: false,
      };
    });

    // Wait for ALL shops to finish processing
    const results = await Promise.all(shopPromises);

    // Sort: Best offer -> Closest -> Not Found
    const sortedShops = results.sort((a, b) => {
      // 1. Put "Not Found" shops at the bottom
      if (a.isLocationFound && !b.isLocationFound) return -1;
      if (!a.isLocationFound && b.isLocationFound) return 1;

      // 2. Put Best Offer at the top
      if (bestOffer && a.name === bestOffer.storeChain) return -1;
      if (bestOffer && b.name === bestOffer.storeChain) return 1;
      
      // 3. Sort by distance
      const distA = a.route?.distance ?? Infinity;
      const distB = b.route?.distance ?? Infinity;
      return distA - distB;
    });

    setShopsData(sortedShops);
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

    // Only map shops where we actually found the coordinates
    const validShops = shopsData.filter(shop => shop.isLocationFound);

    const mapData = {
      userLocation,
      shops: validShops.map(shop => ({
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
        setTimeout(() => {
          updateMap();
        }, 100);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

const renderShopCard = (
    shopData: ShopData,
    isBestOffer: boolean = false,
    isClosest: boolean = false
  ) => {
    const isSelected = selectedShop === shopData.name;
    const colors = shopColors[shopData.name as keyof typeof shopColors];
    const shopImage = shopImages[shopData.name as keyof typeof shopImages];
    
    const isDisabled = !shopData.isLocationFound;

    return (
      <Pressable  
        key={shopData.name}
        style={[
          mapDelivaryStyles.optionContainer, 
          {  
            backgroundColor: theme.colors.cardBackground,
            borderColor: isSelected ? colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
            transform: [{ scale: isSelected ? 1.02 : 1 }],
            opacity: isDisabled ? 0.7 : 1, 
          }
        ]}
        onPress={() => !isDisabled && handleShopClick(shopData.name)}
      >
        <View style={[mapDelivaryStyles.iconContainer, { backgroundColor: isDisabled ? '#f0f0f0' : colors.secondary }]}>
          <Image 
            style={{ width: 28, height: 28, opacity: isDisabled ? 0.5 : 1 }} 
            source={shopImage}
            resizeMode="contain"
          />
          <Text style={[mapDelivaryStyles.chainName, { color: isDisabled ? '#666' : colors.primary }]}>
            {shopData.name}
          </Text>
        </View>

        {/* --- PRICE SECTION --- */}
        <View style={mapDelivaryStyles.infoSection}>
          <Text style={[mapDelivaryStyles.sectionLabel, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
            Цена
          </Text>
          <View style={mapDelivaryStyles.dataGroup}>
            {/* BGN Price */}
            <View style={[mapDelivaryStyles.dataBadge, { borderColor: isDisabled ? '#ccc' : colors.primary, backgroundColor:theme.colors.cardBackground }]}>
              <Text style={[mapDelivaryStyles.dataText, { color: theme.colors.textPrimary }]}>
                {shopData.price_bgn.toFixed(2)} лв
              </Text>
            </View>
            
            {/* EUR Price */}
            <View style={[mapDelivaryStyles.dataBadge, { borderColor: isDisabled ? '#ccc' : colors.primary }]}>
              <Text style={[mapDelivaryStyles.dataText, { color: theme.colors.textPrimary }]}>
                {shopData.price_eur.toFixed(2)} €
              </Text>
            </View>
          </View>
        </View>

        {/* --- DISTANCE SECTION --- */}
        <View style={mapDelivaryStyles.infoSection}>
          <Text style={[mapDelivaryStyles.sectionLabel, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
            Разстояние
          </Text>
          
          {!shopData.isLocationFound ? (
             <View style={mapDelivaryStyles.dataGroup}>
               <View style={[mapDelivaryStyles.dataBadge, { borderColor: theme.colors.error || '#FF4444', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                 <AlertIcon size={14} color={theme.colors.error || '#FF4444'} />
                 <Text style={[mapDelivaryStyles.dataText, { color: theme.colors.error || '#FF4444', fontSize: moderateScale(11) }]}>
                   Няма локация
                 </Text>
               </View>
             </View>
          ) : shopData.route ? (
            <View style={mapDelivaryStyles.dataGroup}>
              <View style={[mapDelivaryStyles.dataBadge, { borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <CarIcon size={15} color={theme.colors.textPrimary} />
                <Text style={[mapDelivaryStyles.dataText, { color: theme.colors.textPrimary }]}>
                  {shopData.route.distanceText}
                </Text>
              </View>
              <View style={[mapDelivaryStyles.dataBadge, { borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <ClockIcon size={14} color={theme.colors.textPrimary} />
                <Text style={[mapDelivaryStyles.dataText, { color: theme.colors.textPrimary }]}>
                  {shopData.route.durationText}
                </Text>
              </View>
            </View>
          ) : (
            <View style={mapDelivaryStyles.dataGroup}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[mapDelivaryStyles.calculatingText, { color: theme.colors.textSecondary }]}>
                Изчисляване...
              </Text>
            </View>
          )}
        </View>

        <View style={mapDelivaryStyles.arrowContainer}>
          {!isDisabled && (
             <Text style={[mapDelivaryStyles.arrow, { color: colors.primary, opacity: 0.6 }]}>›</Text>
          )}
        </View>

        {isBestOffer && (
          <View style={[mapDelivaryStyles.bestDealBadge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <SparkleIcon size={14} color="#fff" />
            <Text style={mapDelivaryStyles.bestDealText}>Най-добра цена</Text>
          </View>
        )}
        
        {isClosest && !isBestOffer && shopData.isLocationFound && (
          <View style={[mapDelivaryStyles.closestBadge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <LocationIcon size={14} color="#fff" />
            <Text style={mapDelivaryStyles.closestText}>Най-близък магазин</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderMapContent = () => (
    <WebView
      ref={webViewRef}
      source={{ html: generateMapHTML() }}
      style={mapDelivaryStyles.mapInBox}
      onMessage={handleWebViewMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={mapDelivaryStyles.mapLoadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      )}
    />
  );

  if (loading || !userLocation) {
    return (
      <ImageBackground
        source={theme.backgroundImage}
        style={mapDelivaryStyles.backgroundImage}
      >
        <View style={[mapDelivaryStyles.centered, { flex: 1 }]}>
          <View style={mapDelivaryStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={[mapDelivaryStyles.loadingText, { color: theme.colors.textPrimary }]}>
              Зареждане на локацията...
            </Text>
            <Text style={[mapDelivaryStyles.loadingSubtext, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
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
        style={mapDelivaryStyles.backgroundImage}
      >
        <View style={[mapDelivaryStyles.centered, { flex: 1 }]}>
          <View style={mapDelivaryStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={[mapDelivaryStyles.loadingText, { color: theme.colors.textPrimary }]}>
              Зареждане на оферти...
            </Text>
            <Text style={[mapDelivaryStyles.loadingSubtext, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
              Моля изчакайте
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (isFullscreen) {
    return (
      <View style={mapDelivaryStyles.fullscreenContainer}>
        {renderMapContent()}
        
        <Pressable 
          style={[mapDelivaryStyles.fullscreenButton, { backgroundColor: theme.colors.cardBackground }]}
          onPress={() => setIsFullscreen(false)}
        >
          <Text style={[mapDelivaryStyles.fullscreenButtonText, { color: theme.colors.textPrimary }]}>
            ✕
          </Text>
        </Pressable>

        <View style={[mapDelivaryStyles.mapInfoBadge, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[mapDelivaryStyles.mapInfoText, { color: theme.colors.textPrimary }]}>
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
               style={mapDelivaryStyles.backButton}
             >
               {isPerformanceMode ? (
              <View 
        
                style={[mapDelivaryStyles.tabBarBlur,{backgroundColor:theme.colors.backgroundColor}]} 
              />
            ) : (
              <BlurView 
                intensity={20} 
                           tint={theme.colors.GlassColor}
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
      style={mapDelivaryStyles.backgroundImage}
    >
       <BackButton />
      <ScrollView 
        style={mapDelivaryStyles.scrollView}
        contentContainerStyle={mapDelivaryStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={mapDelivaryStyles.titleContainer}>
          <Text style={[mapDelivaryStyles.mainTitle, { 
            fontSize: moderateScale(30), 
            color: theme.colors.textPrimary 
          }]}>
            Избери магазин
          </Text>
          <Text style={[mapDelivaryStyles.subtitle, { 
            fontSize: moderateScale(15), 
            color: theme.colors.textSecondary || theme.colors.textPrimary,
            opacity: 0.8
          }]}>
            Намери най-добрата оферта в района
          </Text>
        </View>

        <View style={mapDelivaryStyles.mapContainer}>
          <View style={mapDelivaryStyles.mapBox}>
            {renderMapContent()}
          </View>
          
          <Pressable 
            style={[mapDelivaryStyles.expandButton, { backgroundColor: theme.colors.cardBackground }]}
            onPress={() => setIsFullscreen(true)}
          >
            <Text style={[mapDelivaryStyles.expandButtonText, { color: theme.colors.textPrimary }]}>
              ⛶
            </Text>
          </Pressable>

          <View style={[mapDelivaryStyles.mapInfoBadge, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[mapDelivaryStyles.mapInfoText, { color: theme.colors.textPrimary }]}>
              {shopsData.length} магазина наблизо
            </Text>
          </View>
        </View>

        <View style={mapDelivaryStyles.optionsWrapper}>
          <Text style={[mapDelivaryStyles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Налични магазини
          </Text>
          
          {calculatingRoutes && (
            <View style={mapDelivaryStyles.calculatingBanner}>
              <ActivityIndicator size="small" color="#0066CC" />
              <Text style={[mapDelivaryStyles.calculatingBannerText, { color: theme.colors.textPrimary }]}>
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
            <View style={mapDelivaryStyles.emptyState}>
              <Text style={[mapDelivaryStyles.emptyStateText, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
                Няма налични оферти за вашата количка
              </Text>
            </View>
          )}
        </View>

        <View style={[mapDelivaryStyles.infoFooter,{    backgroundColor:theme.colors.cardBackgroundAlt2}]}>
          <Text style={[mapDelivaryStyles.footerText, { color:  theme.colors.textPrimary }]}>
            💡 Съвет: Изберете магазин за да видите маршрута на картата
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};




export default MapDelivery;