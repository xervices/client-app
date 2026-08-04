import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ArrowUpRight, BadgeCheck, ChevronRight, Map, MapPin } from 'lucide-react-native';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { Button } from '@/components/ui/button';
import { SheetManager } from 'react-native-actions-sheet';
import { LegendList } from '@legendapp/list';
import { useMutation, useQueries } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { showErrorMessage } from '@/api/helpers';
import { useOffersSocket } from '@/hooks/use-offers-socket';

export function ProScreen() {
  const {
    artisanId,
    serviceId,
    offerId,
  }: { serviceId: string; artisanId: string; offerId: string } = useLocalSearchParams();

  const pathname = usePathname();

  const IS_BOOK_TAB = pathname.includes('book');

  const [offer, reviews] = useQueries({
    queries: [api.getOfferDetails(offerId), api.getArtisanReviews(artisanId)],
  });

  const [eta, setEta] = React.useState<string | null>(null);

  const acceptOffer = useMutation(api.respondToOffer(offerId));

  // Keep the offer's status/offeredBy in sync when the other party responds
  // while this screen is open — the accept/reject flow otherwise only shows
  // up on the next incidental refetch (pull-to-refresh, refocus, etc).
  useOffersSocket({
    serviceRequestId: serviceId,
    onOfferAccepted: () => offer.refetch(),
    onOfferRejected: () => offer.refetch(),
    onCounterOffer: () => offer.refetch(),
  });

  const fetchEta = async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ) => {
    try {
      const apiKey = 'AIzaSyDlZwHBiKYN7A9CJHuvZqbroZCPnKlCHWc'; // Fallback to dev key if Constants fails

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
      }
    } catch (error) {
      console.error('Error fetching ETA:', error);
    }
  };

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
    }
  }, [offer?.data]);

  return (
    <Layout
      useBackground
      isRefreshing={offer.isRefetching}
      onRefresh={offer.refetch}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title={offer?.data?.artisan?.profile?.fullName} />
        </View>
      }>
      {offer?.isLoading ? (
        <LoadingState title="Loading offer details..." />
      ) : (
        <View className="flex-1 gap-4">
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

                  {/* {offer?.data?.artisan?.profileVerified ? ( */}
                  <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                  {/* ) : null} */}
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

          <View className="flex flex-row items-center justify-between gap-1">
            <View className="flex flex-row items-center gap-1.5">
              <Image
                source={require('@/assets/icons/location-primary.svg')}
                style={{ width: 16, height: 16 }}
                contentFit="contain"
              />

              <Text className="text-xs leading-none text-[#B4B4BC]">Location</Text>
            </View>

            <View className="h-0.5 flex-1 bg-[#DFDFE1]" />

            {eta ? (
              <Text className="text-xs leading-none text-[#737381]">{eta} away</Text>
            ) : (
              <LoadingIndicator size={14} />
            )}
          </View>

          <View className="flex flex-row gap-4">
            <View className="flex aspect-[98/60] flex-1 items-center justify-center rounded-[8px] bg-[#F4F4F5]">
              <Text className="text-center font-cabinet-bold text-lg text-[#1B1B1E]">
                {offer?.data?.artisanStats?.totalJobsCompleted}
              </Text>
              <Text className="text-center text-xs text-[#737381]">Jobs</Text>
            </View>

            <View className="flex aspect-[98/60] flex-1 items-center justify-center rounded-[8px] bg-[#F4F4F5]">
              <Text className="text-center font-cabinet-bold text-lg text-[#1C752E]">
                {offer?.data?.artisanStats?.averagePunctualityRating}
              </Text>
              <Text className="text-center text-xs text-[#737381]">On-time</Text>
            </View>

            <View className="flex aspect-[98/60] flex-1 items-center justify-center rounded-[8px] bg-[#F4F4F5]">
              <Text className="text-center font-cabinet-bold text-lg text-[#FE6A00]">
                {Number(offer?.data?.artisanStats?.averageResponseTimeSeconds)
                  ? `${Math.round(Number(offer?.data?.artisanStats?.averageResponseTimeSeconds) / 60)} min`
                  : '–'}
              </Text>
              <Text className="text-center text-xs text-[#737381]">Response</Text>
            </View>
          </View>

          <View>
            <Text className="font-cabinet-bold text-[#737381]">Recent Work</Text>

            <LegendList
              data={offer?.data?.artisanStats?.recentWorkPhotos || []}
              numColumns={3}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    SheetManager.show('image-preview-sheet', {
                      payload: {
                        imgSource: item,
                      },
                    })
                  }
                  className="flex aspect-square w-full">
                  <Image
                    source={item}
                    style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    contentFit="cover"
                  />
                </Pressable>
              )}
              recycleItems
              contentContainerStyle={{
                gap: 8,
              }}
              style={{
                paddingHorizontal: 10,
              }}
            />
          </View>

          <Button
            isLoading={acceptOffer?.isPending}
            disabled={acceptOffer?.isPending}
            onPress={() => {
              if (offer?.data?.offeredBy === 'user' && offer?.data?.status !== 'accepted')
                return showErrorMessage(
                  'You cannot accept your own offer. Wait for the artisan to send a counter offer'
                );
              if (offer?.data?.status === 'accepted') {
                if (IS_BOOK_TAB) {
                  router.navigate({
                    pathname: '/book/confirm',
                    params: {
                      id: offer?.data?.jobId,
                      serviceRequestId: serviceId,
                      artisanId,
                      offerId,
                    },
                  });
                } else {
                  router.navigate({
                    pathname: '/confirm',
                    params: {
                      id: offer?.data?.jobId,
                      serviceRequestId: serviceId,
                      artisanId,
                      offerId,
                    },
                  });
                }
              } else {
                acceptOffer.mutate(
                  {
                    action: 'accept',
                  },
                  {
                    onSuccess: (res) => {
                      offer?.refetch();
                      if (IS_BOOK_TAB) {
                        router.navigate({
                          pathname: '/book/confirm',
                          params: {
                            id: res.jobId,
                            serviceRequestId: res.serviceRequestId,
                            artisanId,
                            offerId,
                          },
                        });
                      } else {
                        router.navigate({
                          pathname: '/confirm',
                          params: {
                            id: res.jobId,
                            serviceRequestId: res.serviceRequestId,
                            artisanId,
                            offerId,
                          },
                        });
                      }
                    },
                    onError: (err) => {
                      showErrorMessage(err.message);
                    },
                  }
                );
              }
            }}>
            {offer?.data?.status === 'accepted' ? (
              <Text>Proceed to payment</Text>
            ) : (
              <Text>Accept offer - {formatCurrency(offer?.data?.amount)}</Text>
            )}
          </Button>

          <View className="flex gap-2">
            <Text className="font-cabinet-bold text-[#737381]">Recent Reviews</Text>

            {reviews?.data?.reviews?.map((review) => (
              <View key={review?.id} className="flex gap-1">
                <View className="flex flex-row items-center gap-2">
                  <Avatar
                    alt="User's Avatar"
                    className="h-10 w-10 rounded-sm border border-[#FFE6D6]">
                    <AvatarImage source={{ uri: review?.reviewer?.avatarUrl }} />
                    <AvatarFallback className="bg-primary">
                      <Text className="font-cabinet-bold text-xs uppercase leading-none">
                        {review?.reviewer?.fullName?.substring(0, 2)}
                      </Text>
                    </AvatarFallback>
                  </Avatar>

                  <View>
                    <Text className="font-cabinet-bold leading-none text-[#737381]">
                      {review?.reviewer?.fullName}
                    </Text>

                    <Text className="text-xs text-[#FE6A00]">
                      {/* {new Array(Math.abs(review?.rating)).fill(0)?.map((_, index) => '★')}{' '} */}
                      {new Array(Math.floor(review.rating)).fill(0).map((_, index) => (
                        <Text key={index}>★</Text>
                      ))}{' '}
                      <Text className="text-xs text-[#B4B4BC]">
                        {formatRelativeTime(review?.createdAt)}
                      </Text>
                    </Text>
                  </View>
                </View>

                <Text className="text-[#737381]">{review?.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Layout>
  );
}
