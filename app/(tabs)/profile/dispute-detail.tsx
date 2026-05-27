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
  MessageCircleMore,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { SheetManager } from 'react-native-actions-sheet';

export default function Screen() {
  const { id }: { id: string } = useLocalSearchParams();

  const { isLoading, refetch, isRefetching, data } = useQuery(api.getDisputeDetail(id));

  const job = useQuery(api.getJobDetail(data?.jobId));

  return (
    <Layout
      useBackground
      isRefreshing={isRefetching || job?.isRefetching}
      onRefresh={() => {
        refetch();
        job?.refetch();
      }}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Disputes" />
        </View>
      }>
      {isLoading ? (
        <LoadingState title="Loading Dispute..." />
      ) : (
        <View className="flex-1 gap-4">
          <View className="flex w-full flex-row items-start gap-3">
            <View className="flex min-w-0 flex-1 flex-row items-center gap-2">
              <Avatar alt="User's Avatar" className="h-14 w-14 shrink-0">
                <AvatarImage source={{ uri: job?.data?.artisan?.profile?.avatarUrl }} />
                <AvatarFallback className="bg-primary">
                  <Text className="font-cabinet-bold text-xs uppercase leading-none">
                    {job?.data?.artisan?.profile?.fullName?.substring(0, 2)}
                  </Text>
                </AvatarFallback>
              </Avatar>

              <View className="min-w-0 flex-1">
                <View className="flex min-w-0 flex-row items-start">
                  <Text
                    // numberOfLines={2}
                    // ellipsizeMode="tail"
                    className="min-w-0 shrink font-cabinet-bold text-[18px] text-[#1B1B1E]">
                    {job?.data?.artisan?.profile?.fullName}
                  </Text>

                  <BadgeCheck
                    size={16}
                    fill={'#FE6A00'}
                    stroke={'#FFFFFF'}
                    className="mt-1 shrink-0"
                  />
                </View>

                <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#1B1B1E]">
                  {job?.data?.serviceRequest?.category?.name} Specialist
                </Text>

                <Text className="text-xs text-[#FF6A00]">
                  {job?.data?.artisanRating} ★ ({job?.data?.artisanReviewCount})
                </Text>
              </View>
            </View>

            <View className="w-24 shrink-0">
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-right text-xs text-[#FF6A00]">
                JOB ID ● {job?.data?.id}
              </Text>

              <Text className="text-right font-cabinet-bold text-[18px] text-[#FF6A00]">
                {formatCurrency(job?.data?.finalAmount)}
              </Text>
            </View>
          </View>

          <View className="flex w-full flex-row justify-between">
            <Text className="flex-1 text-sm text-[#737381]">Booking Date & Time</Text>

            <Text className="font-cabinet-bold text-sm text-[#737381]">
              {formatDateTime(job?.data?.serviceRequest?.createdAt)}
            </Text>
          </View>

          <View className="flex w-full flex-row justify-between">
            <Text className="flex-1 text-sm text-[#737381]">Job Description</Text>

            <Text className="font-cabinet-bold text-sm text-[#737381]">
              {job?.data?.serviceRequest?.category?.name}
            </Text>
          </View>

          <View className="w-full rounded-[4px] border border-[#DFDFE1] p-4">
            <Text className="flex-1 text-sm capitalize text-[#737381]">
              {data?.disputeType} Issues
            </Text>
          </View>

          <View>
            <Text className="font-cabinet-bold text-[#737381]">Concern</Text>

            <View className="w-full rounded-[4px] border border-[#DFDFE1] p-4">
              <Text className="flex-1 text-sm text-[#737381]">{data?.description}</Text>
            </View>
          </View>

          <View>
            <Text className="font-cabinet-bold text-[#737381]">Photos or Videos</Text>

            <Text className="flex-1 text-sm text-[#737381]">
              Photos and videos before and after
            </Text>

            <View className="mt-2 flex gap-2">
              <View>
                {/* <Text className="font-cabinet-bold text-xs text-[#B4B4BC]">Before</Text> */}

                <View className="flex flex-row flex-wrap gap-2">
                  {data?.evidence?.map((media) => (
                    <Pressable
                      onPress={() =>
                        SheetManager.show('image-preview-sheet', {
                          payload: {
                            imgSource: media?.mediaUrl,
                          },
                        })
                      }
                      key={media?.id}
                      className="aspect-[56/46] w-14 overflow-hidden rounded-[4px]">
                      <Image
                        source={media?.mediaUrl}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </Pressable>
                  ))}

                  {/* {new Array(4).fill(0).map((_, index) => (
                    <View key={index} className="aspect-[56/46] w-14 overflow-hidden rounded-[4px]">
                      <Image
                        source={require('@/assets/images/sample.png')}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </View>
                  ))} */}
                </View>
              </View>

              {/* <View>
                <Text className="font-cabinet-bold text-xs text-[#B4B4BC]">After</Text>

                <View className="flex flex-row flex-wrap gap-2">
                  {new Array(4).fill(0).map((_, index) => (
                    <View key={index} className="aspect-[56/46] w-14 overflow-hidden rounded-[4px]">
                      <Image
                        source={require('@/assets/images/sample.png')}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </View>
                  ))}
                </View>
              </View> */}
            </View>
          </View>

          {data?.status === 'resolved' || data?.status === 'closed' ? (
            <View>
              <Text className="font-cabinet-bold text-[#FE6A00]">Conclusion</Text>

              <View className="w-full rounded-[4px] border border-[#DFDFE1] p-4">
                <Text className="flex-1 text-sm text-[#1B1B1E]">
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </Layout>
  );
}
