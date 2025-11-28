import { LocationCoords, RouteInfo, ShopData } from '@/components/pages/mapDelivary/mapDelivaryInterfaces';

// --- Constants ---
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
];

const SHOP_NAME_VARIATIONS: { [key: string]: string[] } = {
  Kaufland: ['Kaufland', 'Кауфланд', 'kaufland'],
  Lidl: ['Lidl', 'Лидл', 'lidl'],
  Billa: ['Billa', 'Била', 'billa'],
  TMarket: ['T Market', 'Т Маркет', 'T-Market', 'TMarket', 'tmarket', 'T MARKET']
};

// --- Helpers ---

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

// --- API Functions ---

export const getDirectionsOSRM = async (
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

export const findShopLocation = async (
  shopName: string,
  userLoc: LocationCoords
): Promise<LocationCoords | null> => {
  try {
    const radius = 15000; // 15 km search radius
    const variations = SHOP_NAME_VARIATIONS[shopName] || [shopName];

    // Build query for each name variation
    const queries = variations
      .map(
        (v) => `
        nwr["name"="${v}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        nwr["brand"="${v}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        nwr["name:en"="${v}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
        nwr["name:bg"="${v}"](around:${radius},${userLoc.latitude},${userLoc.longitude});
      `
      )
      .join('');

    const overpassQuery = `[out:json][timeout:30];(${queries});out center qt;`;

    console.log(`🔎 Searching for "${shopName}" near ${userLoc.latitude},${userLoc.longitude}`);

    // Try multiple endpoints until one works
    let response: Response | null = null;
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          body: `data=${encodeURIComponent(overpassQuery)}`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (response.ok) break;
      } catch (err) {
        console.warn(` Overpass endpoint failed: ${endpoint}`);
      }
    }

    if (!response) {
      console.error(' All Overpass endpoints failed.');
      return null;
    }

    const text = await response.text();

    if (text.startsWith('<')) {
      console.error(`Overpass returned HTML for ${shopName}`);
      return null;
    }

    const data = JSON.parse(text);
    const elements = data.elements || [];

    if (elements.length === 0) return null;

    // Find the closest result
    let closestElement: LocationCoords | null = null;
    let minDistance = Infinity;

    for (const element of elements) {
      const lat = element.lat || element.center?.lat;
      const lon = element.lon || element.center?.lon;
      if (!lat || !lon) continue;

      const dLat = ((lat - userLoc.latitude) * Math.PI) / 180;
      const dLon = ((lon - userLoc.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(userLoc.latitude * Math.PI / 180) *
          Math.cos(lat * Math.PI / 180) *
          Math.sin(dLon / 2) ** 2;
      const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      if (distance < minDistance) {
        minDistance = distance;
        closestElement = { latitude: lat, longitude: lon };
      }
    }

    return closestElement;
  } catch (error) {
    console.error(`Error finding ${shopName}:`, error);
    return null;
  }
};

/**
 * Orchestrates fetching locations and calculating routes for all offers
 */
export const fetchAllShopRoutes = async (
  userLoc: LocationCoords,
  offers: any[],
  bestOffer: any
): Promise<ShopData[]> => {
  if (offers.length === 0) return [];

  const shopPromises = offers.map(async (offer) => {
    const shopName = offer.storeChain;
    
    try {
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

    return {
      name: shopName,
      price_bgn: offer.totalPriceBgn,
      price_eur: offer.totalPriceEur,
      location: userLoc, // Dummy location
      route: undefined,
      isLocationFound: false,
    };
  });

  const results = await Promise.all(shopPromises);

  // Sorting Logic
  return results.sort((a, b) => {
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
};