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
import { useMutation, useQueries } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import { useOffersContext } from '@/providers/offers-context';
import { formatCurrency } from '@/lib/utils';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';

export function OfferScreen() {
  const { id }: { id: string } = useLocalSearchParams();

  const pathname = usePathname();

  const [allOffers] = useQueries({
    queries: [api.getOffers(id)],
  });

  const { joinServiceRequest, offers } = useOffersContext({
    onOfferEvent(eventType, data) {
      if (eventType === 'offer:accepted') {
        showSuccessMessage('Offer accepted, You can proceed to payment');
      }
      allOffers?.refetch();
    },
  });

  React.useEffect(() => {
    joinServiceRequest(id);
  }, []);

  const uniqueOffersByArtisan = React.useMemo(() => {
    if (!allOffers?.data) return [];
    const seen = new Set();
    return allOffers.data.filter((offer) => {
      if (seen.has(offer.artisanId)) return false;
      seen.add(offer.artisanId);
      return true;
    });
  }, [allOffers?.data]);

  return (
    <Layout
      useBackground
      isRefreshing={allOffers?.isRefetching}
      onRefresh={allOffers?.refetch}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader />
        </View>
      }>
      {allOffers?.isLoading ? (
        <LoadingState title="Loading Offers..." />
      ) : (
        <View className="flex-1 gap-2">
          <View>
            <Text className="font-cabinet-bold text-xl text-[#1B1B1E]">
              {uniqueOffersByArtisan?.length} Offer
              {uniqueOffersByArtisan && uniqueOffersByArtisan?.length > 1 ? 's' : null} Received
            </Text>
            <Text className="text-sm text-[#B4B4BC]">
              {uniqueOffersByArtisan && uniqueOffersByArtisan?.length > 1
                ? uniqueOffersByArtisan[0].serviceRequest?.category?.name
                : null}
            </Text>
          </View>

          <View className="flex gap-4">
            {uniqueOffersByArtisan?.map((offer) => (
              <OfferCard
                key={offer.id}
                id={offer.id}
                amount={offer.amount}
                artisanId={offer.artisanId}
                artisanLat={offer?.artisanLatitude}
                artisanLong={offer?.artisanLongitude}
                avatarUrl={offer?.artisan?.profile?.avatarUrl}
                name={offer?.artisan?.profile?.fullName}
                onCounterOfferCallback={() => allOffers?.refetch()}
                rating={offer?.artisanRating}
                reviewCount={offer?.artisanReviewCount}
                serviceLat={offer?.serviceRequest?.serviceLatitude}
                serviceLong={offer?.serviceRequest?.serviceLongitude}
                serviceRequestId={offer?.serviceRequestId}
              />
            ))}
          </View>
        </View>
      )}
    </Layout>
  );
}

interface OfferCardProps {
  id: string;
  serviceRequestId?: string;
  artisanId?: string;
  avatarUrl?: string;
  name?: string;
  rating?: number;
  reviewCount?: number;
  amount?: number;
  onCounterOfferCallback?: () => void;
  serviceLat?: number | null;
  serviceLong?: number | null;
  artisanLat?: number | null | Record<string, never>;
  artisanLong?: number | null | Record<string, never>;
}

function OfferCard({
  id,
  amount,
  avatarUrl,
  name,
  artisanId,
  rating,
  reviewCount,
  serviceRequestId,
  onCounterOfferCallback,
  artisanLat,
  artisanLong,
  serviceLat,
  serviceLong,
}: OfferCardProps) {
  const sendCounterOffer = useMutation(api.createCounterOffer());

  const pathname = usePathname();

  const [eta, setEta] = React.useState<string | null>(null);

  const IS_BOOK_TAB = pathname.includes('book');

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
      }
    } catch (error) {
      console.error('Error fetching ETA:', error);
    }
  };

  React.useEffect(() => {
    if (
      artisanLat &&
      artisanLong &&
      serviceLat &&
      serviceLong &&
      typeof artisanLat === 'number' &&
      typeof artisanLong === 'number'
    ) {
      fetchEta(
        {
          latitude: serviceLat,
          longitude: serviceLong,
        },
        {
          latitude: artisanLat,
          longitude: artisanLong,
        }
      );
    }
  }, [artisanLat, artisanLong, serviceLat, serviceLong]);

  return (
    <View
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
      className="flex gap-4 rounded-[8px] bg-white p-4">
      <View className="flex w-full flex-row">
        <View className="flex w-1/2 flex-row items-center gap-2">
          <Avatar alt="User's Avatar" className="h-8 w-8">
            <AvatarImage source={{ uri: avatarUrl }} />
            <AvatarFallback className="bg-primary">
              <Text className="font-cabinet-bold text-xs uppercase leading-none">
                {name?.substring(0, 2)}
              </Text>
            </AvatarFallback>
          </Avatar>

          <View>
            <View className="flex flex-row items-center">
              <Text className="font-cabinet-bold text-[18px] text-[#1B1B1E]">{name}</Text>

              <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
            </View>

            <Text className="text-xs text-[#FF6A00]">
              {rating} ★ ({reviewCount})
            </Text>
          </View>
        </View>

        <View className="flex w-1/2 justify-between">
          <Text className="text-right font-cabinet-bold text-[18px] text-[#FF6A00]">
            {formatCurrency(amount)}
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
        <Button
          isLoading={sendCounterOffer?.isPending}
          disabled={sendCounterOffer?.isPending}
          loadingIndicatorColor="#CC5600"
          onPress={() =>
            SheetManager.show('counter-offer-sheet', {
              payload: {
                type: 'counter',
                amount: amount,
                name: name,
                profileImage: avatarUrl,
                onConfirm: (amount) => {
                  sendCounterOffer.mutate(
                    // @ts-ignore
                    { amount, id },
                    {
                      onSuccess: () => {
                        onCounterOfferCallback?.();
                        showSuccessMessage('Counter offer sent successfully.');
                      },
                      onError: (err) => {
                        showErrorMessage(err.message);
                      },
                    }
                  );
                },
              },
            })
          }
          className="h-12 flex-1"
          variant={'outline'}>
          Counter
        </Button>
        <Button
          onPress={() => {
            if (IS_BOOK_TAB) {
              router.navigate({
                pathname: '/book/pro',
                params: {
                  serviceId: serviceRequestId,
                  artisanId: artisanId,
                  offerId: id,
                },
              });
            } else {
              router.navigate({
                pathname: '/pro',
                params: {
                  serviceId: serviceRequestId,
                  artisanId: artisanId,
                  offerId: id,
                },
              });
            }
          }}
          className="h-12 flex-1">
          Accept
        </Button>
      </View>
    </View>
  );
}
