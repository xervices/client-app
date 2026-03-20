import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Mail,
  MapPin,
  MessageCircleMore,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { LoadingState } from '@/components/loading-state';

export default function Screen() {
  const { id }: { id: string } = useLocalSearchParams();

  const { isLoading, data, refetch, isRefetching } = useQuery(api.getJobDetail(id));

  const beforeEvidence = data?.evidence?.filter((i) => i.evidenceType === 'before');
  const afterEvidence = data?.evidence?.filter((i) => i.evidenceType === 'after');

  return (
    <Layout
      isRefreshing={isRefetching}
      onRefresh={refetch}
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Completed Jobs" />
        </View>
      }>
      {isLoading ? (
        <LoadingState title="Loading job detail..." />
      ) : (
        <View className="flex-1 gap-6">
          <View className="flex w-full flex-row">
            <View className="flex w-1/2 flex-row items-center gap-2">
              <Avatar alt="User's Avatar" className="h-14 w-14">
                <AvatarImage source={{ uri: data?.artisan?.profile?.avatarUrl }} />
                <AvatarFallback className="bg-primary">
                  <Text className="font-cabinet-bold text-xs uppercase leading-none">
                    {data?.artisan?.profile?.fullName?.substring(0, 2)}
                  </Text>
                </AvatarFallback>
              </Avatar>

              <View>
                <View className="flex flex-row items-center">
                  <Text className="font-cabinet-bold text-[18px] text-[#1B1B1E]">
                    {data?.artisan?.profile?.fullName}
                  </Text>

                  {/* {data?.artisan?.profileVerified ? ( */}
                  <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                  {/* ) : null} */}
                </View>

                <Text className="text-xs text-[#1B1B1E]">{data?.category?.name} Specialist</Text>

                <Text className="text-xs text-[#FF6A00]">
                  {data?.artisanRating} ★ ({data?.artisanReviewCount})
                </Text>
              </View>
            </View>

            {/* <View className="flex w-1/2 justify-between">
              <Text className="text-right text-xs text-[#FF6A00]">JOB ID ● {id}</Text>
            </View> */}
          </View>

          <View className="flex gap-4">
            <Text className="text-sm text-[#737381]">Progress update</Text>

            <View
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
              className="flex flex-row items-center justify-between gap-4 rounded-[8px] bg-white p-4">
              <Image
                source={require('@/assets/icons/location.svg')}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />

              <View className="flex-1">
                <Text className="font-cabinet-bold text-sm text-[#1B1B1E]">
                  {data?.artisan?.profile?.fullName} has arrived at your location
                </Text>
                <Text className="text-xs leading-none text-[#B4B4BC]">
                  {formatDateTime(data?.startedAt)}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                router.navigate({
                  pathname: '/jobs/photo-preview',
                  params: {
                    type: 'Before',
                    id: id,
                  },
                });
              }}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
              className="flex flex-row justify-between gap-4 rounded-[8px] bg-white p-4">
              <Image
                source={require('@/assets/icons/checkin.svg')}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />

              <View className="flex-1 gap-1">
                <Text className="font-cabinet-bold text-sm text-[#1B1B1E]">
                  {data?.artisan?.profile?.fullName} has checked in and is starting work
                </Text>

                <Text className="text-xs text-[#B4B4BC]">Before photo has been attached</Text>

                <Text className="text-xs leading-none text-[#B4B4BC]">
                  {formatDateTime(data?.startedAt)}
                </Text>

                <View className="mt-1 flex flex-row flex-wrap gap-2">
                  {beforeEvidence?.map((i) => (
                    <View key={i?.id} className="aspect-[56/46] w-14 overflow-hidden rounded-[4px]">
                      <Image
                        source={i?.mediaUrl}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                router.navigate({
                  pathname: '/jobs/photo-preview',
                  params: {
                    type: 'After',
                    id: id,
                  },
                });
              }}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
              className="flex flex-row justify-between gap-4 rounded-[8px] bg-white p-4">
              <Image
                source={require('@/assets/icons/checkout.svg')}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />

              <View className="flex-1 gap-1">
                <Text className="font-cabinet-bold text-sm text-[#1B1B1E]">
                  {data?.artisan?.profile?.fullName} is done and has checked out
                </Text>

                <Text className="text-xs text-[#B4B4BC]">After photo have been attached</Text>

                <Text className="text-xs leading-none text-[#B4B4BC]">
                  {formatDateTime(data?.completedAt)}
                </Text>

                <View className="mt-1 flex flex-row flex-wrap gap-2">
                  {afterEvidence?.map((i) => (
                    <View key={i?.id} className="aspect-[56/46] w-14 overflow-hidden rounded-[4px]">
                      <Image
                        source={i?.mediaUrl}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>

            {/* <View className="flex flex-row items-center justify-between">
              <Text className="text-sm leading-none text-[#737381]">Promos</Text>
              <Text className="text-sm leading-none text-[#FF6A00]">XS12334555</Text>
            </View> */}

            <View className="mx-auto h-[1px] w-[92%] bg-[#F1F1F1]" />

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm leading-none text-[#737381]">Booking Date & Time</Text>
              <Text className="text-sm leading-none text-[#737381]">
                {formatDateTime(data?.createdAt)}
              </Text>
            </View>

            <View className="mx-auto h-[1px] w-[92%] bg-[#F1F1F1]" />

            {data?.discountAmount && data?.discountAmount > 0 ? (
              <View className="flex flex-row items-center justify-between">
                <Text className="text-sm leading-none text-[#737381]">Promo Discount</Text>
                <Text className="text-sm leading-none text-[#FF6A00]">
                  {formatCurrency(data?.discountAmount)}
                </Text>
              </View>
            ) : null}

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm leading-none text-[#737381]">Total Price</Text>
              <Text className="text-sm leading-none text-[#FF6A00]">
                {formatCurrency(data?.finalAmount)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </Layout>
  );
}
