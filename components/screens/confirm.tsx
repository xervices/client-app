import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  CircleAlert,
  Dot,
  Map,
  MapPin,
  Trash,
  Trash2,
} from 'lucide-react-native';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { Button } from '@/components/ui/button';
import { SheetManager } from 'react-native-actions-sheet';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useMutation, useQueries } from '@tanstack/react-query';
import { api } from '@/api';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';
import { LoadingState } from '@/components/loading-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import * as Location from 'expo-location';

export function ConfirmScreen() {
  const {
    id,
    serviceRequestId,
    artisanId,
    offerId,
  }: { id: string; serviceRequestId: string; offerId: string; artisanId: string } =
    useLocalSearchParams();

  const pathname = usePathname();

  const IS_BOOK_TAB = pathname.includes('book');

  const [offer] = useQueries({
    queries: [api.getOfferDetails(offerId)],
  });
  const initializePayment = useMutation(api.initializePayment());
  const verifyPayment = useMutation(api.verifyPayment());

  const [promoCode, setPromoCode] = React.useState('');
  const [useReferralReward, setUseReferralReward] = React.useState(false);
  const [artisanAddress, setArtisanAddress] = React.useState<string>();

  const [eta, setEta] = React.useState<string | null>(null);
  const [routeCoords, setRouteCoords] = React.useState<{ latitude: number; longitude: number }[]>(
    []
  );

  // Decode polyline from Google's encoded format
  const decodePolyline = (encoded: string): { latitude: number; longitude: number }[] => {
    const points: { latitude: number; longitude: number }[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b: number;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const fetchEta = async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ) => {
    try {
      const apiKey = 'AIzaSyDkT-0SiaW_dZq_ydeOTZAsKT6IvSgLp5Q'; // Fallback to dev key if Constants fails

      if (!apiKey) {
        console.warn('Google Maps API Key not found');
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`
      );

      const result = await response.json();

      if (result.routes && result.routes.length > 0 && result.routes[0].legs) {
        const duration = result.routes[0].legs[0].duration.text;
        setEta(duration);

        // Decode and set polyline
        const overviewPolyline = result.routes[0].overview_polyline?.points;
        if (overviewPolyline) {
          const decodedCoords = decodePolyline(overviewPolyline);
          setRouteCoords(decodedCoords);
        }
      }
    } catch (error) {
      console.error('Error fetching ETA:', error);
    }
  };

  const getAddressFromCoords = async ({
    latitude,
    longitude,
    defaultAddress,
  }: {
    latitude: number;
    longitude: number;
    defaultAddress: string;
  }) => {
    try {
      if (latitude && longitude) {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: latitude,
          longitude: longitude,
        });

        // formattedAddress is only available on Android, so we construct it manually for iOS
        const formattedAddress =
          address.formattedAddress ||
          [
            address.streetNumber,
            address.street,
            address.city,
            address.region,
            address.postalCode,
            address.country,
          ]
            .filter(Boolean)
            .join(', ');

        setArtisanAddress(formattedAddress);
      }
    } catch (err) {
      console.log(err);
      setArtisanAddress(defaultAddress);
    }
  };

  const mapRef = React.useRef<MapView>(null);

  React.useEffect(() => {
    if (
      offer?.data?.artisanLatitude &&
      offer?.data?.artisanLongitude &&
      offer?.data?.serviceRequest?.serviceLatitude &&
      offer?.data?.serviceRequest?.serviceLongitude &&
      typeof offer?.data?.artisanLatitude === 'number' &&
      typeof offer?.data?.artisanLongitude === 'number'
    ) {
      fetchEta(
        {
          latitude: offer?.data?.serviceRequest?.serviceLatitude,
          longitude: offer?.data?.serviceRequest?.serviceLongitude,
        },
        {
          latitude: offer?.data?.artisanLatitude,
          longitude: offer?.data?.artisanLongitude,
        }
      );

      getAddressFromCoords({
        latitude: offer?.data?.artisanLatitude,
        longitude: offer?.data?.artisanLongitude,
        defaultAddress: offer?.data?.artisan?.profile?.address || '',
      });
    }
  }, [offer?.data]);

  React.useEffect(() => {
    if (mapRef.current && offer?.data?.artisanLatitude && offer?.data?.artisanLongitude) {
      mapRef.current.animateToRegion(
        {
          // @ts-ignore
          latitude: offer.data?.artisanLatitude,
          // @ts-ignore
          longitude: offer?.data?.artisanLongitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        300
      );
    }
  }, [offer?.data]);

  return (
    <Layout
      useBackground
      isRefreshing={offer?.isRefetching}
      onRefresh={() => {
        offer?.refetch();
      }}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Confirm Booking" />
        </View>
      }>
      {offer?.isLoading ? (
        <LoadingState title="Loading booking..." />
      ) : (
        <View className="flex-1 gap-4">
          <View className="flex gap-2 rounded-[8px] border border-[#DFDFE1] p-2">
            <View className="relative aspect-[311/120] w-full overflow-hidden rounded-[8px]">
              <MapView
                ref={mapRef}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                style={{ width: '100%', height: '100%' }}
                initialRegion={{
                  latitude: offer?.data?.serviceRequest?.serviceLatitude || 4.7425431,
                  longitude: offer?.data?.serviceRequest?.serviceLongitude || 7.0379143,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}>
                {routeCoords.length > 0 && (
                  <Polyline
                    coordinates={routeCoords}
                    strokeColor="#FE6A00"
                    strokeWidth={4}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}

                <Marker
                  coordinate={{
                    latitude: offer?.data?.artisanLatitude || 4.7425431,
                    longitude: offer?.data?.artisanLongitude || 7.0379143,
                  }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 99999999,
                      backgroundColor: '#FFDCC1',
                      borderWidth: 1,
                      borderColor: '#606D5D1F',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                    }}>
                    <Image
                      style={{ width: 16, height: 16 }}
                      contentFit="contain"
                      source={require('@/assets/icons/map-pin.svg')}
                    />
                  </View>
                </Marker>

                <Marker
                  coordinate={{
                    latitude: offer?.data?.serviceRequest?.serviceLatitude || 4.7425431,
                    longitude: offer?.data?.serviceRequest?.serviceLongitude || 7.0379143,
                  }}
                  anchor={{ x: 0.5, y: 0.5 }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 99999999,
                      backgroundColor: '#1B1B1E',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                    }}>
                    <Image
                      style={{ width: 16, height: 16 }}
                      contentFit="contain"
                      source={require('@/assets/icons/map-home.svg')}
                    />
                  </View>
                </Marker>
              </MapView>

              <View className="absolute right-2 top-2 flex h-6 flex-row items-center justify-center rounded-sm bg-[#FFF4EA] px-2">
                {eta ? (
                  <Text className="font-cabinet-bold text-xs leading-none text-[#FE6A00]">
                    {eta} away
                  </Text>
                ) : (
                  <LoadingIndicator size={14} />
                )}
              </View>
            </View>

            <View>
              <View className="relative flex flex-row items-center justify-between gap-4 pb-5">
                <View className="flex flex-1 flex-row items-center gap-1">
                  <View className="flex h-4 w-4 items-center justify-center rounded-full bg-[#B4B4BC]">
                    <View className="h-2 w-2 rounded-full bg-white" />
                  </View>

                  <Text className="text-xs leading-none text-[#737381]">
                    {offer?.data?.serviceRequest?.serviceAddress}
                  </Text>
                </View>

                <Text className="flex-1 text-right text-xs leading-none text-[#737381]">
                  {/* Date: Today, Oct 11, 2025 */}
                  {formatDate(offer?.data?.serviceRequest?.createdAt)}
                </Text>

                <View className="absolute bottom-0 left-1.5 h-5 w-0.5 bg-[#FFCFAD]" />
              </View>

              <View className="relative flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-1">
                  <Image
                    source={require('@/assets/icons/location-primary.svg')}
                    style={{ width: 16, height: 16 }}
                    contentFit="contain"
                  />

                  {artisanAddress ? (
                    <Text className="flex-1 text-xs leading-none text-[#737381]">
                      {artisanAddress}
                    </Text>
                  ) : (
                    <LoadingIndicator size={14} />
                  )}
                </View>
              </View>
            </View>
          </View>

          <View className="flex w-full flex-row">
            <View className="flex flex-1 flex-row items-center gap-2">
              <Avatar alt="User's Avatar" className="h-14 w-14">
                <AvatarImage source={{ uri: offer?.data?.artisan?.profile?.avatarUrl }} />
                <AvatarFallback className="bg-primary">
                  <Text className="font-cabinet-bold text-xs uppercase leading-none">
                    {offer?.data?.artisan?.profile?.fullName?.substring(0, 2)}
                  </Text>
                </AvatarFallback>
              </Avatar>

              <View>
                <View className="flex flex-row items-center">
                  <Text className="font-cabinet-bold text-[18px] text-[#1B1B1E]">
                    {offer?.data?.artisan?.profile?.fullName}
                  </Text>

                  <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                </View>

                <Text className="text-sm text-[#737381]">
                  {offer?.data?.serviceRequest?.category?.name}
                </Text>

                <Text className="text-xs text-[#FF6A00]">
                  {offer?.data?.artisanRating} ★ ({offer?.data?.artisanReviewCount})
                </Text>
              </View>
            </View>

            <View className="flex w-1/2 justify-between">
              <Text className="text-right font-cabinet-bold text-[18px] text-[#FF6A00]">
                {formatCurrency(offer?.data?.amount)}
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center justify-between">
            <Text className="text-sm leading-none text-[#737381]">Promos</Text>

            {promoCode ? (
              <Pressable
                className="flex flex-row items-center gap-2"
                onPress={() => setPromoCode('')}>
                <Text className="text-sm leading-none text-[#FF6A00]">{promoCode}</Text>

                <Trash2 size={16} color={'#B3031E'} />
              </Pressable>
            ) : (
              <Pressable
                onPress={() =>
                  SheetManager.show('add-promo-code-sheet', {
                    payload: {
                      onAdd(code) {
                        setPromoCode(code);
                      },
                    },
                  })
                }>
                <Text className="text-sm leading-none text-[#FF6A00]">Add code</Text>
              </Pressable>
            )}
          </View>

          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center">
              <Text className="text-sm leading-none text-[#737381]">Referral Reward</Text>

              <Dot size={16} color={'#FF6A00'} />

              <Text className="text-sm leading-none text-[#FF6A00]">₦0.00</Text>
            </View>

            <Pressable
              className={`flex h-4 w-4 flex-row items-center justify-center rounded-full border-2 ${useReferralReward ? 'border-[#FE6A00]' : 'border-[#737381]'} `}
              onPress={() => setUseReferralReward((prev) => !prev)}>
              {useReferralReward && <View className="h-2 w-2 rounded-full bg-[#FE6A00]" />}
            </Pressable>
          </View>

          <View className="flex flex-row items-center justify-between border-y border-[#F4F4F5] py-4">
            <Text className="text-sm leading-none text-[#737381]">Booking Date & Time</Text>

            <Text className="text-sm leading-none text-[#737381]">2025-11-27 17:47:27</Text>
          </View>

          {promoCode && (
            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm leading-none text-[#737381]">Promo Discount</Text>

              <Text className="text-sm leading-none text-[#FE6A00]">-₦500</Text>
            </View>
          )}

          {useReferralReward && (
            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm leading-none text-[#737381]">Referral Discount</Text>

              <Text className="text-sm leading-none text-[#FE6A00]">-₦1000</Text>
            </View>
          )}

          <View className="flex flex-row items-center justify-between">
            <Text className="text-sm leading-none text-[#737381]">Total Price</Text>

            <Text className="text-sm leading-none text-[#FE6A00]">
              {formatCurrency(offer?.data?.amount)}
            </Text>
          </View>

          <Text className="text-sm text-[#737381]">
            Your payment will be held securely in escrow until the job is completed and approved.
            Funds are released only after you confirm the job is complete. Cancellations made after
            your pro is on the way may be subject to a{' '}
            <Text className="text-sm text-[#FE6A00]"> cancellation fee.</Text>{' '}
          </Text>

          <View className="flex flex-row gap-2 rounded-[8px] border border-[#0582F1] bg-[#EAF5FF] p-2">
            <CircleAlert size={20} color={'#0582F1'} />

            <Text className="flex-1 text-sm text-[#014178]">
              Prices cover service only. Materials, if needed, are handled between you and the pro.
              Xervices does not provide or charge for them.
            </Text>
          </View>

          <Button
            isLoading={initializePayment?.isPending || verifyPayment?.isPending}
            disabled={initializePayment?.isPending || verifyPayment?.isPending}
            onPress={() => {
              initializePayment?.mutate(
                { jobId: id || '', callbackUrl: 'https://example.com/' },
                {
                  onSuccess: (res) => {
                    SheetManager?.show('paystack-webview-sheet', {
                      payload: {
                        authorizationUrl: res.authorizationUrl,
                        callbackUrl: 'https://example.com/',
                        onError(errorMessage) {
                          showErrorMessage(errorMessage);
                        },
                        onSuccess(reference) {
                          verifyPayment?.mutate(
                            { reference },
                            {
                              onSuccess: (res) => {
                                showSuccessMessage(res?.message || 'Payment verified successfully');
                                SheetManager.show('success-sheet', {
                                  payload: {
                                    title: 'Your payment was successful.',
                                    subtitle: 'You will be redirected to the home page shortly.',
                                    hideBackButton: true,
                                    useCheckImage: true,
                                    onRedirect() {
                                      if (IS_BOOK_TAB) {
                                        router.replace({
                                          pathname: '/ongoing',
                                          params: {
                                            id,
                                          },
                                        });
                                      } else {
                                        router.replace({
                                          pathname: '/ongoing',
                                          params: {
                                            id,
                                          },
                                        });
                                      }
                                    },
                                  },
                                });
                              },
                              onError: (err) => {
                                showErrorMessage(err.message);
                              },
                            }
                          );
                        },
                      },
                    });
                  },
                  onError: (err) => {
                    showErrorMessage(err.message);
                  },
                }
              );
            }}>
            Proceed to payment
          </Button>
        </View>
      )}
    </Layout>
  );
}
