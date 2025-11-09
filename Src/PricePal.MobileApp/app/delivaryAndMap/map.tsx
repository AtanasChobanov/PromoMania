import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface Shop {
  name: string;
  location: LocationCoords;
  address: string;
  placeId: string;
  color: string;
}

interface RouteInfo {
  distance: number;
  distanceText: string;
  duration: number;
  durationText: string;
  coordinates: LocationCoords[];
}

// Choose search service:
// 'OVERPASS' - Free, Best for finding shops (RECOMMENDED) ✅
// 'NOMINATIM' - Free, Good for addresses
// 'GOOGLE' - Paid, Fastest and most accurate
const SEARCH_SERVICE = 'OVERPASS';
const ROUTING_SERVICE = 'OSRM';
const GOOGLE_MAPS_API_KEY = 'YOUR_ANDROID_API_KEY_HERE'; // Only needed if using Google

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingRoutes, setFetchingRoutes] = useState<boolean>(false);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);

  const [shopRoutes, setShopRoutes] = useState<Map<string, RouteInfo>>(new Map());

  const SHOP_COLORS = ['#FF0000', '#0066CC', '#00CC00', '#FF6600', '#9900CC', '#FF1493'];

  // Search using Nominatim (OpenStreetMap) - FREE
  const searchPlacesNominatim = async (query: string, location: LocationCoords) => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a shop name to search');
      return;
    }

    setSearching(true);
    try {
      // Search near user's location with a bounding box
      const radius = 0.15; // Change this: 0.1 = ~11km, 0.15 = ~16.5km, 0.2 = ~22km
      const bbox = `${location.longitude - radius},${location.latitude - radius},${location.longitude + radius},${location.latitude + radius}`;
      
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&bounded=1&viewbox=${bbox}&limit=10`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PricePal-MobileApp/1.0', // Required by Nominatim
        },
      });
      const data = await response.json();

      if (data.length > 0) {
        // Filter results that are shops/supermarkets
        const shopResults = data.filter((place: any) => 
          place.type === 'supermarket' || 
          place.type === 'shop' || 
          place.class === 'shop' ||
          place.display_name.toLowerCase().includes('shop') ||
          place.display_name.toLowerCase().includes(query.toLowerCase())
        );

        const foundShops: Shop[] = shopResults.slice(0, 5).map((place: any, index: number) => ({
          name: place.display_name.split(',')[0],
          location: {
            latitude: parseFloat(place.lat),
            longitude: parseFloat(place.lon),
          },
          address: place.display_name,
          placeId: place.place_id.toString(),
          color: SHOP_COLORS[index % SHOP_COLORS.length],
        }));

        if (foundShops.length > 0) {
          setShops(foundShops);
          console.log(`Found ${foundShops.length} shops for "${query}"`);
          await calculateAllRoutes(location, foundShops);
        } else {
          Alert.alert('No Results', `No shops found for "${query}" nearby`);
        }
      } else {
        Alert.alert('No Results', `No shops found for "${query}" nearby`);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      Alert.alert('Error', 'Could not search for places. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Search using Overpass API (OpenStreetMap) - FREE and more accurate for shops
  const searchPlacesOverpass = async (query: string, location: LocationCoords) => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a shop name to search');
      return;
    }

    setSearching(true);
    try {
      const radius = 15000; // Change this: 5000 = 5km, 10000 = 10km, 15000 = 15km
      
      console.log(`Searching for "${query}" near ${location.latitude}, ${location.longitude}`);
      
      // Smart query: Finds shops where name CONTAINS the search term
      // Examples: 
      // - Search "Kaufland" finds "Kaufland", "Kaufland Veliko Tarnovo", "Kaufland City"
      // - Search "Lidl" finds "Lidl", "Lidl Express", etc.
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["shop"]["name"~"${query}",i](around:${radius},${location.latitude},${location.longitude});
          way["shop"]["name"~"${query}",i](around:${radius},${location.latitude},${location.longitude});
          node["shop"]["brand"~"${query}",i](around:${radius},${location.latitude},${location.longitude});
          way["shop"]["brand"~"${query}",i](around:${radius},${location.latitude},${location.longitude});
        );
        out center;
      `;

      console.log('Overpass Query:', overpassQuery);

      const url = 'https://overpass-api.de/api/interpreter';
      const response = await fetch(url, {
        method: 'POST',
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.json();
      console.log('Overpass Response:', JSON.stringify(data, null, 2));

      if (data.elements && data.elements.length > 0) {
        console.log(`Found ${data.elements.length} results`);
        
        // Remove duplicates (same location might appear in both name and brand search)
        const uniqueElements = Array.from(
          new Map(data.elements.map((item: any) => [item.id, item])).values()
        );
        
        const foundShops: Shop[] = uniqueElements.slice(0, 5).map((element: any, index: number): Shop => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;
          
          // Use brand name or full name
          const shopName = element.tags?.brand || element.tags?.name || query;
          
          return {
            name: shopName,
            location: {
              latitude: lat,
              longitude: lon,
            },
            address: element.tags?.['addr:street'] 
              ? `${element.tags['addr:street']} ${element.tags['addr:housenumber'] || ''}`
              : element.tags?.['addr:city'] || 'Address not available',
            placeId: element.id.toString(),
            color: SHOP_COLORS[index % SHOP_COLORS.length],
          };
        });

        // Sort by distance (closest first)
        const sortedShops = foundShops.sort((a, b) => {
          const distA = calculateDistance(location, a.location);
          const distB = calculateDistance(location, b.location);
          return distA - distB;
        });

        setShops(sortedShops);
        console.log('Found shops:', sortedShops);
        await calculateAllRoutes(location, sortedShops);
      } else {
        console.log('No results found');
        // Try a broader search - just supermarkets without name filter
        await searchNearbyShops(location);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      Alert.alert('Error', `Could not search for places: ${error}`);
    } finally {
      setSearching(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (from: LocationCoords, to: LocationCoords): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Fallback: Search for any nearby supermarkets
  const searchNearbyShops = async (location: LocationCoords) => {
    try {
      console.log('Searching for any nearby supermarkets...');
      
      const radius = 10000;
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["shop"="supermarket"](around:${radius},${location.latitude},${location.longitude});
          way["shop"="supermarket"](around:${radius},${location.latitude},${location.longitude});
        );
        out center;
      `;

      const url = 'https://overpass-api.de/api/interpreter';
      const response = await fetch(url, {
        method: 'POST',
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.json();
      console.log('Nearby shops response:', JSON.stringify(data, null, 2));

      if (data.elements && data.elements.length > 0) {
        const foundShops: Shop[] = data.elements.slice(0, 5).map((element: any, index: number): Shop => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;
          
          return {
            name: element.tags?.name || 'Supermarket',
            location: {
              latitude: lat,
              longitude: lon,
            },
            address: element.tags?.['addr:street'] 
              ? `${element.tags['addr:street']} ${element.tags['addr:housenumber'] || ''}`
              : element.tags?.['addr:city'] || 'Address not available',
            placeId: element.id.toString(),
            color: SHOP_COLORS[index % SHOP_COLORS.length],
          };
        });

        setShops(foundShops);
        console.log('Found nearby shops:', foundShops);
        Alert.alert('Nearby Shops Found', `Found ${foundShops.length} supermarkets nearby. Showing closest ones.`);
        await calculateAllRoutes(location, foundShops);
      } else {
        Alert.alert('No Results', 'No supermarkets found nearby. Try increasing the search radius.');
      }
    } catch (error) {
      console.error('Error searching nearby shops:', error);
      Alert.alert('Error', 'Could not find nearby shops.');
    }
  };

  // Search for places using Google Places API
  const searchPlacesGoogle = async (query: string, location: LocationCoords) => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a shop name to search');
      return;
    }

    setSearching(true);
    try {
      const radius = 10000; // Change this: 5000 = 5km, 10000 = 10km, 50000 = 50km (max)
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&keyword=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const foundShops: Shop[] = data.results.slice(0, 5).map((place: any, index: number) => ({
          name: place.name,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          address: place.vicinity || place.formatted_address || '',
          placeId: place.place_id,
          color: SHOP_COLORS[index % SHOP_COLORS.length],
        }));

        setShops(foundShops);
        await calculateAllRoutes(location, foundShops);
      } else {
        Alert.alert('No Results', `No shops found for "${query}" nearby`);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      Alert.alert('Error', 'Could not search for places. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Main search function that uses selected service
  const searchPlaces = async (query: string, location: LocationCoords) => {
    if (SEARCH_SERVICE === 'OVERPASS') {
      await searchPlacesOverpass(query, location);
    } else if (SEARCH_SERVICE === 'NOMINATIM') {
      await searchPlacesNominatim(query, location);
    } else {
      await searchPlacesGoogle(query, location);
    }
  };

  // Search for specific shop chains
  const searchShopChain = async (chainName: string, location: LocationCoords) => {
    setSearchQuery(chainName);
    
    // Overpass is best for chain stores as it's more accurate
    await searchPlacesOverpass(chainName, location);
  };

  // Fetch route using OSRM
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

        const distanceInKm = (route.distance / 1000).toFixed(2);
        const durationInMin = Math.round(route.duration / 60);

        return {
          distance: route.distance,
          distanceText: `${distanceInKm} km`,
          duration: route.duration,
          durationText: `${durationInMin} min`,
          coordinates: points,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching directions:', error);
      return null;
    }
  };

  // Calculate routes to all shops
  const calculateAllRoutes = async (origin: LocationCoords, shopsToCalculate: Shop[]) => {
    setFetchingRoutes(true);
    const routes = new Map<string, RouteInfo>();

    for (const shop of shopsToCalculate) {
      const routeInfo = await getDirectionsOSRM(origin, shop.location);

      if (routeInfo) {
        routes.set(shop.placeId, routeInfo);
      }
    }

    setShopRoutes(routes);
    setFetchingRoutes(false);

    // Find closest shop
    let closestShop: Shop | null = null;
    let minDistance = Infinity;

    shopsToCalculate.forEach((shop) => {
      const route = routes.get(shop.placeId);
      if (route && route.distance < minDistance) {
        minDistance = route.distance;
        closestShop = shop;
      }
    });

    if (closestShop) {
      console.log(`Closest: ${closestShop.name} (${(minDistance / 1000).toFixed(2)} km)`);
      Alert.alert(
        'Closest Shop Found!',
        `${closestShop.name} is the nearest at ${(minDistance / 1000).toFixed(2)} km away!\n\n${closestShop.address}`
      );
    }
  };

  // Decode polyline
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
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();

    let locationSubscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      try {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
          },
          (location) => {
            const newLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            setUserLocation(newLocation);
          }
        );
      } catch (error) {
        console.error('Watch position error:', error);
      }
    };

    startWatching();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  if (loading || !userLocation) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000FF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* User's location marker */}
        <Marker coordinate={userLocation} title="You are here" pinColor="blue" />

        {/* Shop markers */}
        {shops.map((shop) => (
          <Marker
            key={shop.placeId}
            coordinate={shop.location}
            title={shop.name}
            description={
              shopRoutes.get(shop.placeId)
                ? `${shopRoutes.get(shop.placeId)?.distanceText} - ${shopRoutes.get(shop.placeId)?.durationText}`
                : shop.address
            }
            pinColor={shop.color}
          />
        ))}

        {/* Route polylines */}
        {shops.map((shop) => {
          const route = shopRoutes.get(shop.placeId);
          const isSelected = selectedShop === shop.placeId || selectedShop === null;

          if (route && isSelected) {
            return (
              <Polyline
                key={`route-${shop.placeId}`}
                coordinates={route.coordinates}
                strokeColor={shop.color}
                strokeWidth={selectedShop === shop.placeId ? 5 : 3}
              />
            );
          }
          return null;
        })}
      </MapView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for shops (e.g., Kaufland, Lidl)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => searchPlaces(searchQuery, userLocation)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => searchPlaces(searchQuery, userLocation)}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Search Buttons */}
      <View style={styles.quickSearchContainer}>
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: '#FF0000' }]}
          onPress={() => searchShopChain('Kaufland', userLocation)}
          disabled={searching}
        >
          <Text style={styles.quickButtonText}>Kaufland</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: '#0066CC' }]}
          onPress={() => searchShopChain('Lidl', userLocation)}
          disabled={searching}
        >
          <Text style={styles.quickButtonText}>Lidl</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: '#00CC00' }]}
          onPress={() => searchNearbyShops(userLocation)}
          disabled={searching}
        >
          <Text style={styles.quickButtonText}>All Shops</Text>
        </TouchableOpacity>
      </View>

      {/* Shop cards */}
      {shops.length > 0 && (
        <View style={styles.shopsContainer}>
          {shops.map((shop) => {
            const route = shopRoutes.get(shop.placeId);
            return (
              <TouchableOpacity
                key={shop.placeId}
                style={[
                  styles.shopCard,
                  { borderLeftColor: shop.color },
                  selectedShop === shop.placeId && styles.shopCardSelected,
                ]}
                onPress={() => setSelectedShop(selectedShop === shop.placeId ? null : shop.placeId)}
              >
                <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                {route ? (
                  <>
                    <Text style={styles.shopDistance}>{route.distanceText}</Text>
                    <Text style={styles.shopDuration}>{route.durationText}</Text>
                  </>
                ) : (
                  <ActivityIndicator size="small" color="#666" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
  searchContainer: {
    position: 'absolute',
    top: 150,
    left: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    minWidth: 80,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickSearchContainer: {
    position: 'absolute',
    top: 70,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  routeLoader: {
    position: 'absolute',
    top: 130,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeLoaderText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  shopsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  shopCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    minWidth: 100,
    maxWidth: 150,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shopCardSelected: {
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  shopName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  shopDistance: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  shopDuration: {
    fontSize: 11,
    color: '#999',
  },
});

export default MapScreen;