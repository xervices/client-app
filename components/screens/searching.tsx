import { Text } from '@/components/ui/text';
import * as React from 'react';
import { AppState, Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ArrowUpRight } from 'lucide-react-native';
import { MediaThumbnail } from '@/components/media-thumbnail';
import { router, useFocusEffect, useLocalSearchParams, usePathname } from 'expo-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import { formatRelativeTime } from '@/lib/utils';
import { useOffersContext } from '@/providers/offers-context';
import { useAuthStore } from '@/store/auth-store';

export function SearchingScreen() {
  const { id }: { id: string } = useLocalSearchParams();

  const { user } = useAuthStore();

  const queryClient = useQueryClient();

  const pathname = usePathname();

  const IS_BOOK_TAB = pathname.includes('book');

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const [artisans, serviceRequest, allOffers, userServiceRequests] = useQueries({
    queries: [
      api.getMatchingArtisans(id),
      api.getServiceRequest(id),
      api.getOffers(id),
      api.getUserServiceRequests(),
    ],
  });

  const { joinServiceRequest, views, offers, isConnected } = useOffersContext({
    onOfferEvent(eventType, data) {
      if (eventType === 'request:viewed') {
        queryClient.setQueryData(['service-request', id], (prev: any) =>
          prev ? { ...prev, viewersCount: (prev.viewersCount ?? 0) + 1 } : prev
        );
        serviceRequest?.refetch();
        return;
      }
      allOffers?.refetch();
    },
  });

  const handleOnRefresh = async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([
        artisans.refetch(),
        serviceRequest?.refetch(),
        allOffers?.refetch(),
        userServiceRequests?.refetch(),
      ]);
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        // Reconnect socket if disconnected
        if (!isConnected) {
          joinServiceRequest(id);
        }

        // Refetch all data
        artisans?.refetch();
        serviceRequest?.refetch();
        allOffers?.refetch();
        userServiceRequests?.refetch();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isConnected, id]);

  React.useEffect(() => {
    if (offers && offers?.length > 1) {
      if (IS_BOOK_TAB) {
        userServiceRequests?.refetch();
        router.replace({
          pathname: '/book/offer',
          params: {
            id: serviceRequest?.data?.id,
          },
        });
      } else {
        userServiceRequests?.refetch();
        router.replace({
          pathname: '/offer',
          params: {
            id: serviceRequest?.data?.id,
          },
        });
      }
    }
  }, [offers, serviceRequest?.data]);

  React.useEffect(() => {
    if (isConnected) {
      joinServiceRequest(id);
      serviceRequest?.refetch();
    }
  }, [isConnected]);

  useFocusEffect(
    React.useCallback(() => {
      serviceRequest?.refetch().then(({ data }) => {
        if (!data) return;
        if (data.status === 'cancelled' || data.status === 'expired') {
          router.replace(
            // IS_BOOK_TAB ?
            '/book'
            // '/(tabs)/(home)'
          );
        }
      });
    }, [serviceRequest?.refetch, IS_BOOK_TAB])
  );

  const uniqueViews = React.useMemo(
    () =>
      views?.filter(
        (view, index, self) =>
          self.findIndex((v) => v.artisanId === view.artisanId) === index &&
          view.artisanId !== user?.id
      ),
    [views, user?.id]
  );

  const viewersCount = Math.max(
    serviceRequest?.data?.viewersCount ?? 0,
    uniqueViews?.length ?? 0
  );

  React.useEffect(() => {
    if (!artisans.isLoading && artisans.data !== undefined && artisans.data.length === 0) {
      const redirectTimeout = setTimeout(() => {
        if (IS_BOOK_TAB) {
          userServiceRequests?.refetch();
          router.replace({
            pathname: '/book/no-result',
            params: {
              id,
            },
          });
        } else {
          userServiceRequests?.refetch();
          router.replace({
            pathname: '/no-result',
            params: {
              id,
            },
          });
        }
      }, 10000);

      return () => clearTimeout(redirectTimeout);
    }
  }, [artisans.isLoading, artisans.data?.length, id]);

  return (
    <Layout
      useBackground
      isRefreshing={isRefreshing}
      onRefresh={handleOnRefresh}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader
            onBackButtonPress={() => {
              if (IS_BOOK_TAB) {
                router.replace('/book');
              } else {
                router.back();
              }
            }}
          />
        </View>
      }>
      {artisans?.isLoading || serviceRequest?.isLoading ? (
        <LoadingState title="Loading Matching Artisans..." />
      ) : (
        <View className="flex-1 gap-2">
          <View className="flex flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-sm text-[#737381]">
              {viewersCount} {viewersCount === 1 ? 'Pro' : 'Pros'} viewed your request
            </Text>

            <View className="flex-row">
              {uniqueViews?.slice(0, 6)?.map((profile) => (
                <Avatar
                  key={profile?.artisanId}
                  alt={profile?.artisanName}
                  className="-mr-2 h-6 w-6 border-2 border-background web:border-0 web:ring-2 web:ring-background">
                  <AvatarImage source={{ uri: profile?.artisanAvatarUrl as string }} />
                  <AvatarFallback className="bg-primary">
                    <Text className="font-cabinet-bold text-xs uppercase">
                      {profile?.artisanName?.substring(0, 2)}
                    </Text>
                  </AvatarFallback>
                </Avatar>
              ))}

              {viewersCount - Math.min(uniqueViews?.length ?? 0, 6) > 0 && (
                <Avatar
                  alt="@evilrabbit"
                  className="-mr-2 h-6 w-6 border-2 border-background bg-[#F4F4F5] web:border-0 web:ring-2 web:ring-background">
                  <AvatarFallback>
                    <Text className="font-cabinet-bold text-xs">
                      +{viewersCount - Math.min(uniqueViews?.length ?? 0, 6)}
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

          {allOffers?.data && allOffers?.data.length > 0 && (
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
                    {formatRelativeTime(allOffers?.data[0]?.createdAt)}
                  </Text>
                </View>

                <View className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm border-2 border-[#FFAC70]">
                  {serviceRequest?.data?.mediaUrls &&
                    serviceRequest?.data?.mediaUrls?.length > 0 && (
                      <MediaThumbnail
                        url={serviceRequest.data.mediaUrls[0]}
                        playBadgeSize={14}
                        playIconSize={7}
                      />
                    )}
                </View>
              </View>

              <Text className="text-sm text-[#737381]">{serviceRequest?.data?.description}</Text>

              <View className="flex flex-row items-center justify-end">
                <Pressable
                  onPress={() => {
                    if (IS_BOOK_TAB) {
                      router.replace({
                        pathname: '/book/offer',
                        params: {
                          id: serviceRequest?.data?.id,
                        },
                      });
                    } else {
                      router.replace({
                        pathname: '/offer',
                        params: {
                          id: serviceRequest?.data?.id,
                        },
                      });
                    }
                  }}
                  className="flex flex-row items-center gap-1">
                  <Text className="font-cabinet-bold text-sm text-primary">View details</Text>

                  <ArrowUpRight size={14} color={'#FE6A00'} />
                </Pressable>
              </View>
            </View>
          )}

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
