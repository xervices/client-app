import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ArrowUpRight, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useQueries, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import { formatRelativeTime } from '@/lib/utils';

export default function Screen() {
  const { id }: { id: string } = useLocalSearchParams();

  const [artisans, offers, serviceRequest] = useQueries({
    queries: [api.getMatchingArtisans(id), api.getOffers(id), api.getServiceRequest(id)],
  });

  return (
    <Layout
      useBackground
      isRefreshing={artisans?.isRefetching || offers?.isRefetching || serviceRequest?.isRefetching}
      onRefresh={() => {
        artisans?.refetch();
        offers?.refetch();
        serviceRequest?.refetch();
      }}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader />
        </View>
      }>
      {artisans?.isLoading || offers?.isLoading || serviceRequest?.isLoading ? (
        <LoadingState title="Loading Maatching Artisans..." />
      ) : (
        <View className="flex-1 gap-2">
          <View className="flex flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-sm text-[#737381]">
              {artisans?.data && artisans?.data?.length > 0 ? artisans?.data.length : 0} artisans
              viewed your request
            </Text>

            <View className="flex-row">
              {artisans?.data?.slice(0, 6)?.map((profile) => (
                <Avatar
                  alt="@mrzachnugent"
                  className="-mr-2 h-6 w-6 border-2 border-background web:border-0 web:ring-2 web:ring-background">
                  <AvatarImage source={{ uri: 'https://github.com/mrzachnugent.png' }} />
                  <AvatarFallback>
                    <Text>{profile.fullName.substring(0, 2)}</Text>
                  </AvatarFallback>
                </Avatar>
              ))}

              {artisans?.data && Math.max(0, artisans?.data?.length - 6) > 0 && (
                <Avatar
                  alt="@evilrabbit"
                  className="-mr-2 h-6 w-6 border-2 border-background bg-[#F4F4F5] web:border-0 web:ring-2 web:ring-background">
                  <AvatarFallback>
                    <Text className="font-cabinet-bold text-xs">
                      +{Math.max(0, artisans?.data?.length - 6)}
                    </Text>
                  </AvatarFallback>
                </Avatar>
              )}
            </View>
          </View>

          <Image
            source={require('@/assets/images/success-check.svg')}
            style={{ width: 100, height: 100, marginHorizontal: 'auto' }}
            contentFit="contain"
          />

          <View className="mt-2">
            <Text className="text-center font-cabinet-bold text-[#1B1B1E]">
              Your service has been booked!
            </Text>
            <Text className="text-center text-sm text-[#737381]">
              Your service request is now visible to verified pros
            </Text>
          </View>

          {/* {offers?.data && offers?.data.length > 0 && ( */}
          <View
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
            className="flex gap-4 rounded-[8px] bg-white p-4">
            <View className="flex flex-row items-center justify-between">
              <View>
                <Text className="flex-1 font-cabinet-bold text-[#1B1B1E]">
                  {serviceRequest?.data?.category?.name}
                </Text>
                <Text className="flex-1 text-xs text-[#FE6A00]">
                  {formatRelativeTime(serviceRequest?.data?.createdAt)}
                </Text>
              </View>

              <View className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm border-2 border-[#FFAC70]">
                {serviceRequest?.data?.mediaUrls && serviceRequest?.data?.mediaUrls?.length > 0 && (
                  <Image
                    source={serviceRequest?.data?.mediaUrls[0]}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                )}
              </View>
            </View>

            <Text className="text-sm text-[#737381]">{serviceRequest?.data?.description}</Text>

            <View className="flex flex-row items-center justify-end">
              <Pressable
                onPress={() =>
                  router.navigate({
                    pathname: '/jobs/ongoing',
                    params: {
                      id: '97575',
                    },
                  })
                }
                className="flex flex-row items-center gap-1">
                <Text className="font-cabinet-bold text-sm text-primary">View details</Text>

                <ArrowUpRight size={14} color={'#FE6A00'} />
              </Pressable>
            </View>
          </View>

          <View className="mt-3 flex gap-2">
            <Text className="font-cabinet-bold text-[#737381]">What happens next?</Text>

            <View className="flex flex-row items-center gap-2">
              <View className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#FE6A00]">
                <View className="h-1.5 w-1.5 rounded-full bg-white" />
              </View>

              <Text className="text-sm text-[#737381]">Pros will review your service request</Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <View className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#FE6A00]">
                <View className="h-1.5 w-1.5 rounded-full bg-white" />
              </View>

              <Text className="text-sm text-[#737381]">
                You’ll receive negotiable offers within 5 minutes
              </Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <View className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#FE6A00]">
                <View className="h-1.5 w-1.5 rounded-full bg-white" />
              </View>

              <Text className="text-sm text-[#737381]">Compare profiles and choose a pro</Text>
            </View>
          </View>

          <View className="mt-6 flex items-center justify-center gap-2">
            <Text className="text-center text-xs text-[#FE6A00]">
              Automatically searching for pros...
            </Text>

            <LoadingIndicator size={42} />
          </View>
        </View>
      )}
    </Layout>
  );
}
