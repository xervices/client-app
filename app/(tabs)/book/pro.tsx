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
import { LegendList } from '@legendapp/list';
import { useMutation, useQueries } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import { formatCurrency } from '@/lib/utils';
import { showErrorMessage } from '@/api/helpers';

const data = [
  {
    id: 1,
    icon: require('@/assets/images/sample.png'),
  },
  {
    id: 2,
    icon: require('@/assets/images/sample.png'),
  },
  {
    id: 3,
    icon: require('@/assets/images/sample.png'),
  },
  {
    id: 4,
    icon: require('@/assets/images/sample.png'),
  },
  {
    id: 5,
    icon: require('@/assets/images/sample.png'),
  },
  {
    id: 6,
    icon: require('@/assets/images/sample.png'),
  },
];

export default function Screen() {
  const {
    artisanId,
    serviceId,
    offerId,
  }: { serviceId: string; artisanId: string; offerId: string } = useLocalSearchParams();

  const [offer] = useQueries({
    queries: [api.getOfferDetails(offerId)],
  });

  const acceptOffer = useMutation(api.respondToOffer(offerId));

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

                  <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                </View>

                <Text className="text-sm text-[#737381]">
                  {offer?.data?.serviceRequest?.category?.name}
                </Text>

                <Text className="text-xs text-[#FF6A00]">4.9 ★ (145)</Text>
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

            <Text className="text-xs leading-none text-[#737381]">14 mins away</Text>
          </View>

          <View className="flex flex-row gap-4">
            <View className="flex aspect-[98/60] flex-1 items-center justify-center rounded-[8px] bg-[#F4F4F5]">
              <Text className="text-center font-cabinet-bold text-lg text-[#1B1B1E]">156</Text>
              <Text className="text-center text-xs text-[#737381]">Jobs</Text>
            </View>

            <View className="flex aspect-[98/60] flex-1 items-center justify-center rounded-[8px] bg-[#F4F4F5]">
              <Text className="text-center font-cabinet-bold text-lg text-[#1C752E]">98%</Text>
              <Text className="text-center text-xs text-[#737381]">On-time</Text>
            </View>

            <View className="flex aspect-[98/60] flex-1 items-center justify-center rounded-[8px] bg-[#F4F4F5]">
              <Text className="text-center font-cabinet-bold text-lg text-[#FE6A00]">3 min</Text>
              <Text className="text-center text-xs text-[#737381]">Response</Text>
            </View>
          </View>

          <View>
            <Text className="font-cabinet-bold text-[#737381]">Recent Work</Text>

            <LegendList
              data={data}
              numColumns={3}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    SheetManager.show('image-preview-sheet', {
                      payload: {
                        imgSource: item.icon,
                      },
                    })
                  }
                  className="flex aspect-square w-full">
                  <Image
                    source={item.icon}
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
              acceptOffer.mutate(
                {
                  action: 'accept',
                },
                {
                  onSuccess: (res) => {
                    console.log(res);
                    router.navigate({
                      pathname: '/book/confirm',
                      params: {
                        id: res.id,
                        serviceRequestId: res.serviceRequestId,
                      },
                    });
                  },
                  onError: (err) => {
                    showErrorMessage(err.message);
                  },
                }
              );

              router.navigate('/book/confirm');
            }}>
            <Text>Accept offer - {formatCurrency(offer?.data?.amount)}</Text>
          </Button>

          <View className="flex gap-2">
            <Text className="font-cabinet-bold text-[#737381]">Recent Reviews</Text>

            <View className="flex gap-1">
              <View className="flex flex-row items-center gap-2">
                <Avatar
                  alt="User's Avatar"
                  className="h-10 w-10 rounded-sm border border-[#FFE6D6]">
                  <AvatarImage source={{ uri: 'https://github.com/mrzachnugent.png' }} />
                  <AvatarFallback className="bg-primary">
                    <Text className="font-cabinet-bold leading-none">ZN</Text>
                  </AvatarFallback>
                </Avatar>

                <View>
                  <Text className="font-cabinet-bold leading-none text-[#737381]">
                    Michael Chen
                  </Text>

                  <Text className="text-xs text-[#FE6A00]">
                    ★★★★★ <Text className="text-xs text-[#B4B4BC]">2 days ago</Text>
                  </Text>
                </View>
              </View>

              <Text className="text-[#737381]">
                Sarah was fantastic! Fixed my kitchen sink leak quickly and explained everything she
                was doing. Very professional and cleaned up after herself. Will definitely call her
                again.
              </Text>
            </View>
          </View>
        </View>
      )}
    </Layout>
  );
}
