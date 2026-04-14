import { Pressable, View } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Text } from '../ui/text';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import { LoadingIndicator } from '../ui/loading-indicator';
import { useEffect, useState, useCallback, useRef } from 'react';
import { LocationSearchSheetPayload } from '.';
import { Input } from '../ui/input';
import { LegendList } from '@legendapp/list';

// Types for better type safety
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

const GOOGLE_MAPS_API_KEY = 'AIzaSyDlZwHBiKYN7A9CJHuvZqbroZCPnKlCHWc';
const DEBOUNCE_DELAY = 500; // milliseconds
const MIN_QUERY_LENGTH = 3;

export function LocationSearchSheet(props: SheetProps<'location-search-sheet'>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GooglePlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Refs for cleanup and debouncing
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search function
  const searchLocations = useCallback(async (searchQuery: string) => {
    // Clear any previous errors
    setError(null);

    // Validate query length
    if (searchQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          searchQuery
        )}&key=${GOOGLE_MAPS_API_KEY}&language=en`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Check for Google API errors
      if (data.status === 'ZERO_RESULTS') {
        setResults([]);
        setError('No locations found. Try a different search term.');
      } else if (data.status === 'REQUEST_DENIED') {
        setError('API key error. Please contact support.');
      } else if (data.status === 'INVALID_REQUEST') {
        setError('Invalid search request.');
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        setError('Too many requests. Please try again later.');
      } else if (data.status === 'OK') {
        setResults(data.predictions || []);
        setError(null);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      // Don't show error if request was aborted (user is still typing)
      if (err.name !== 'AbortError') {
        console.error('Location search error:', err);
        setError('Network error. Please check your connection.');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced effect for query changes
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      searchLocations(query);
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, searchLocations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSelect = async (item: GooglePlacePrediction) => {
    setIsSelecting(true);
    setError(null);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${GOOGLE_MAPS_API_KEY}&language=en`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google API error: ${data.status}`);
      }

      const details: GooglePlaceDetails = data.result;

      if (!details || !details.geometry || !details.geometry.location) {
        throw new Error('Invalid location data received');
      }

      const latitude = details.geometry.location.lat;
      const longitude = details.geometry.location.lng;
      const postalCode =
        details.address_components?.find((component) => component.types.includes('postal_code'))
          ?.long_name || null;
      const fullAddress = details.formatted_address;

      const locationData: LocationSearchSheetPayload = {
        address: fullAddress,
        latitude: String(latitude),
        longitude: String(longitude),
        postal_code: postalCode || '',
      };

      props?.payload?.onSelect?.(locationData);
      SheetManager.hide('location-search-sheet');
    } catch (err: any) {
      console.error('Location details error:', err);
      setError('Failed to get location details. Please try again.');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleClose = () => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    SheetManager.hide('location-search-sheet');
  };

  return (
    <ActionSheet
      gestureEnabled={!isSelecting}
      closeOnTouchBackdrop={!isSelecting}
      containerStyle={{
        backgroundColor: '#FFFFFF',
      }}
      indicatorStyle={{
        width: 38,
        height: 6,
        backgroundColor: '#FFF4EA',
      }}>
      <View className="flex items-center gap-4 p-6 pt-2">
        <View className="flex w-full gap-4">
          {/* Header */}
          <View className="relative flex w-full flex-row items-center justify-center">
            <Pressable
              onPress={handleClose}
              disabled={isSelecting}
              className="absolute left-0 h-8 w-8 justify-center">
              <ArrowLeft size={24} color={isSelecting ? '#E6E6E6' : '#B4B4BC'} />
            </Pressable>

            <Text className="text-center font-cabinet-bold">Search location</Text>
          </View>

          {/* Search Input */}
          <Input
            onChangeText={setQuery}
            value={query}
            placeholder="Search location"
            autoFocus
            editable={!isSelecting}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Results Container */}
          <View className="flex h-[250px]">
            {/* Loading State */}
            {loading && !isSelecting && (
              <View className="flex-1 items-center justify-center">
                <LoadingIndicator />
                <Text className="mt-2 text-sm text-gray-500">Searching...</Text>
              </View>
            )}

            {/* Selecting State */}
            {isSelecting && (
              <View className="flex-1 items-center justify-center">
                <LoadingIndicator />
                <Text className="mt-2 text-sm text-gray-500">Getting location details...</Text>
              </View>
            )}

            {/* Error State */}
            {error && !loading && !isSelecting && (
              <View className="flex-1 items-center justify-center px-4">
                <AlertCircle size={40} color="#EF4444" />
                <Text className="mt-2 text-center text-sm text-red-500">{error}</Text>
              </View>
            )}

            {/* Empty State */}
            {!loading &&
              !error &&
              !isSelecting &&
              query.length > 0 &&
              query.length < MIN_QUERY_LENGTH && (
                <View className="flex-1 items-center justify-center px-4">
                  <Text className="text-center text-sm text-gray-500">
                    Type at least {MIN_QUERY_LENGTH} characters to search
                  </Text>
                </View>
              )}

            {/* No Results State */}
            {!loading &&
              !error &&
              !isSelecting &&
              query.length >= MIN_QUERY_LENGTH &&
              results.length === 0 && (
                <View className="flex-1 items-center justify-center px-4">
                  <Text className="text-center text-sm text-gray-500">
                    No locations found. Try a different search term.
                  </Text>
                </View>
              )}

            {/* Results List */}
            {!loading && !error && !isSelecting && results.length > 0 && (
              <LegendList
                data={results}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 10,
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
                style={{ maxHeight: '100%' }}
              />
            )}
          </View>
        </View>
      </View>
    </ActionSheet>
  );
}
