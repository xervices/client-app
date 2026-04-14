import { Pressable, View, Keyboard } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Text } from '../ui/text';
import { ArrowLeft, AlertCircle, MapPin, Search } from 'lucide-react-native';
import { LoadingIndicator } from '../ui/loading-indicator';
import { useEffect, useState, useCallback, useRef } from 'react';
import { LocationSearchSheetPayload } from '.';
import { Input } from '../ui/input';
import { LegendList } from '@legendapp/list';
import * as Location from 'expo-location';

// ---------- Types ----------
interface GooglePlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlaceDetails {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address: string;
  address_components: Array<{
    types: string[];
    long_name: string;
  }>;
}

// ---------- Constants ----------
const GOOGLE_MAPS_API_KEY = 'AIzaSyDlZwHBiKYN7A9CJHuvZqbroZCPnKlCHWc';
const DEBOUNCE_DELAY = 500;
const MIN_QUERY_LENGTH = 3;

// Default region (Lagos, Nigeria)
const DEFAULT_REGION: Region = {
  latitude: 6.5244,
  longitude: 3.3792,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// ---------- Component ----------
export function LocationMapSearchSheet(props: SheetProps<'location-map-search-sheet'>) {
  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GooglePlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Map state
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);
  const [markerCoord, setMarkerCoord] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Selected location state
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reverseGeocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapView>(null);

  // ---- Get user's current location on mount ----
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userRegion: Region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setMapRegion(userRegion);
        mapRef.current?.animateToRegion(userRegion, 600);
      } catch {
        // Silently fall back to default region
      }
    })();
  }, []);

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (reverseGeocodeTimerRef.current) clearTimeout(reverseGeocodeTimerRef.current);
    };
  }, []);

  // ---- Google Places Autocomplete ----
  const searchLocations = useCallback(async (searchQuery: string) => {
    setError(null);

    if (searchQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setShowResults(false);
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setShowResults(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          searchQuery
        )}&key=${GOOGLE_MAPS_API_KEY}&language=en`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        setResults([]);
        setError('No locations found. Try a different search term.');
      } else if (data.status === 'REQUEST_DENIED') {
        console.log('Google denial reason:', data.error_message);
        setError('API key error. Please contact support.');
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        setError('Too many requests. Please try again later.');
      } else if (data.status === 'OK') {
        setResults(data.predictions || []);
        setError(null);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Location search error:', err);
        setError('Network error. Please check your connection.');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced query effect
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      searchLocations(query);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, searchLocations]);

  // ---- Reverse geocode (Google Geocoding API) ----
  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    setIsReverseGeocoding(true);
    setSelectedAddress('');

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en`
      );

      if (!response.ok) throw new Error(`Geocoding API error: ${response.status}`);

      const data = await response.json();

      if (data.status === 'OK' && data.results?.length > 0) {
        setSelectedAddress(data.results[0].formatted_address);
      } else {
        // Fallback: show raw coordinates
        setSelectedAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setSelectedAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // ---- Handle search result selection ----
  const handleSelectResult = async (item: GooglePlacePrediction) => {
    Keyboard.dismiss();
    setShowResults(false);
    setError(null);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address&language=en`
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      if (data.status !== 'OK') throw new Error(`Google API error: ${data.status}`);

      const details: GooglePlaceDetails = data.result;

      if (!details?.geometry?.location) throw new Error('Invalid location data');

      const { lat: latitude, lng: longitude } = details.geometry.location;

      // Update marker and address
      setMarkerCoord({ latitude, longitude });
      setSelectedAddress(details.formatted_address);
      setQuery(item.description);

      // Animate map to location
      const newRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
    } catch (err: any) {
      console.error('Place details error:', err);
      setError('Failed to get location details. Please try again.');
    }
  };

  // ---- Handle map press (place pin) ----
  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoord({ latitude, longitude });
    setShowResults(false);
    Keyboard.dismiss();
    reverseGeocode(latitude, longitude);
  };

  // ---- Handle marker drag end ----
  const handleMarkerDragEnd = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoord({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  // ---- Confirm location ----
  const handleConfirmLocation = async () => {
    if (!markerCoord || !selectedAddress) return;

    setIsConfirming(true);
    try {
      const locationData: LocationSearchSheetPayload = {
        address: selectedAddress,
        latitude: String(markerCoord.latitude),
        longitude: String(markerCoord.longitude),
        postal_code: '',
      };

      props?.payload?.onSelect?.(locationData);
      SheetManager.hide('location-map-search-sheet');
    } catch (err) {
      console.error('Confirm location error:', err);
      setError('Failed to confirm location. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  // ---- Close sheet ----
  const handleClose = () => {
    abortControllerRef.current?.abort();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    SheetManager.hide('location-map-search-sheet');
  };

  const isBusy = isConfirming || isReverseGeocoding;
  const canConfirm = !!markerCoord && !!selectedAddress && !isBusy;

  return (
    <ActionSheet
      gestureEnabled={!isBusy}
      closeOnTouchBackdrop={!isBusy}
      containerStyle={{
        backgroundColor: '#FFFFFF',
        height: '95%',
      }}
      indicatorStyle={{
        width: 38,
        height: 6,
        backgroundColor: '#FFF4EA',
      }}>
      <View className="flex flex-1">
        {/* ---- Header ---- */}
        <View className="relative flex w-full flex-row items-center justify-center border-b border-[#E6E6E6] px-6 py-4">
          <Pressable
            onPress={handleClose}
            disabled={isBusy}
            className="absolute left-6 h-8 w-8 justify-center">
            <ArrowLeft size={24} color={isBusy ? '#E6E6E6' : '#B4B4BC'} />
          </Pressable>

          <Text className="text-center font-cabinet-bold">Select location</Text>
        </View>

        {/* ---- Search Input ---- */}
        <View className="z-20 w-full bg-white px-6 py-3">
          <Input
            onChangeText={(text) => {
              setQuery(text);
              if (text.length === 0) {
                setShowResults(false);
                setResults([]);
              }
            }}
            value={query}
            placeholder="Search for a location"
            editable={!isBusy}
            autoCapitalize="none"
            autoCorrect={false}
            icon={<Search size={18} color="#B4B4BC" />}
          />
        </View>

        {/* ---- Map ---- */}
        <View className="relative w-full flex-1">
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton>
            {markerCoord && (
              <Marker
                coordinate={markerCoord}
                draggable
                onDragEnd={handleMarkerDragEnd}
                title="Selected Location"
              />
            )}
          </MapView>

          {/* Search Results Overlay */}
          {showResults && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                maxHeight: 250,
                backgroundColor: '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: '#E6E6E6',
                zIndex: 100,
                elevation: 5,
              }}>
              {/* Loading */}
              {loading && (
                <View className="items-center justify-center p-4">
                  <LoadingIndicator />
                  <Text className="mt-2 text-sm text-gray-500">Searching...</Text>
                </View>
              )}

              {/* Error */}
              {error && !loading && (
                <View className="items-center justify-center px-4 py-3">
                  <AlertCircle size={32} color="#EF4444" />
                  <Text className="mt-2 text-center text-sm text-red-500">{error}</Text>
                </View>
              )}

              {/* No Results */}
              {!loading && !error && query.length >= MIN_QUERY_LENGTH && results.length === 0 && (
                <View className="items-center justify-center px-4 py-3">
                  <Text className="text-center text-sm text-gray-500">
                    No locations found. Try a different search term.
                  </Text>
                </View>
              )}

              {/* Results List */}
              {!loading && !error && results.length > 0 && (
                <LegendList
                  data={results}
                  keyExtractor={(item) => item.place_id}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleSelectResult(item)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: '#E6E6E6',
                      }}
                      android_ripple={{ color: '#F5F5F5' }}>
                      <Text
                        style={{
                          color: '#4F4F4F',
                          fontSize: 14,
                          fontFamily: 'CabinetGrotesk-Medium',
                        }}>
                        {item.description}
                      </Text>
                    </Pressable>
                  )}
                  style={{ maxHeight: 250 }}
                />
              )}
            </View>
          )}
        </View>

        {/* ---- Bottom Bar: Address + Confirm ---- */}
        <View className="w-full gap-3 border-t border-[#E6E6E6] bg-white px-6 py-4">
          {/* Reverse geocoding indicator */}
          {isReverseGeocoding && (
            <View className="flex flex-row items-center gap-2">
              <LoadingIndicator size={16} />
              <Text className="text-sm text-gray-500">Getting address...</Text>
            </View>
          )}

          {/* Selected address */}
          {!isReverseGeocoding && selectedAddress !== '' && (
            <View className="flex flex-row items-start gap-2 rounded-lg bg-[#FFF4EA] p-3">
              <MapPin size={18} color="#FE6A00" style={{ marginTop: 1 }} />
              <Text className="flex-1 text-sm text-gray-700">{selectedAddress}</Text>
            </View>
          )}

          {/* Hint when no location selected */}
          {!isReverseGeocoding && !selectedAddress && !markerCoord && (
            <Text className="text-center text-sm text-gray-400">
              Search or tap the map to select a location
            </Text>
          )}

          {/* Error */}
          {error && !showResults && (
            <View className="flex flex-row items-center gap-2">
              <AlertCircle size={18} color="#EF4444" />
              <Text className="flex-1 text-xs text-red-500">{error}</Text>
            </View>
          )}

          {/* Confirm button */}
          <Pressable
            onPress={handleConfirmLocation}
            disabled={!canConfirm}
            className={`h-12 items-center justify-center rounded-lg ${
              canConfirm ? 'bg-[#FE6A00]' : 'bg-gray-300'
            }`}>
            {isConfirming ? (
              <LoadingIndicator />
            ) : (
              <Text className="font-cabinet-bold text-white">Confirm Location</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ActionSheet>
  );
}
