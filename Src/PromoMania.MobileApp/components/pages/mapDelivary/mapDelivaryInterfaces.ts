export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface RouteInfo {
  distance: number;
  distanceText: string;
  duration: number;
  durationText: string;
  coordinates: LocationCoords[];
}

export interface ShopData {
  name: string;
  price_bgn: number;
  price_eur: number;
  location: LocationCoords;
  route?: RouteInfo;
    isLocationFound: boolean;

}
