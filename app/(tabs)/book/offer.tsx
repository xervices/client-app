import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ArrowUpRight, BadgeCheck, ChevronRight, Map, MapPin } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function Screen() {
  const { id }: { id: string } = useLocalSearchParams();

  const [allOffers] = useQueries({
    queries: [api.getOffers(id)],
  });

  const sendCounterOffer = useMutation(api.createCounterOffer());

  const { joinServiceRequest, offers } = useOffersContext({
    onOfferEvent(eventType, data) {
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
              <View
                key={offer?.id}
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
                      <AvatarImage source={{ uri: offer.artisan?.profile?.avatarUrl }} />
                      <AvatarFallback className="bg-primary">
                        <Text className="font-cabinet-bold text-xs uppercase leading-none">
                          {offer.artisan?.profile?.fullName?.substring(0, 2)}
                        </Text>
                      </AvatarFallback>
                    </Avatar>

                    <View>
                      <View className="flex flex-row items-center">
                        <Text className="font-cabinet-bold text-[18px] text-[#1B1B1E]">
                          {offer.artisan?.profile?.fullName}
                        </Text>

                        <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                      </View>

                      <Text className="text-xs text-[#FF6A00]">4.9 ★ (145)</Text>
                    </View>
                  </View>

                  <View className="flex w-1/2 justify-between">
                    <Text className="text-right font-cabinet-bold text-[18px] text-[#FF6A00]">
                      {formatCurrency(offer.amount)}
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

                  <Text className="text-xs leading-none text-[#737381]">14 mins away</Text>
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
                          amount: offer.amount,
                          name: offer.artisan?.profile?.fullName,
                          profileImage: offer?.artisan?.profile?.avatarUrl,
                          onConfirm: (amount) => {
                            sendCounterOffer.mutate(
                              // @ts-ignore
                              { amount, id: offer.id },
                              {
                                onSuccess: () => {
                                  allOffers?.refetch();
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
                    onPress={() =>
                      router.navigate({
                        pathname: '/book/pro',
                        params: {
                          serviceId: offer.serviceRequestId,
                          artisanId: offer.artisanId,
                          offerId: offer.id,
                        },
                      })
                    }
                    className="h-12 flex-1">
                    Accept
                  </Button>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </Layout>
  );
}
