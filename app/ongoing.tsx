import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { router, useLocalSearchParams, useNavigation, usePathname } from 'expo-router';
import { SheetManager } from 'react-native-actions-sheet';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { Image } from 'expo-image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ArrowLeft, BadgeCheck, PhoneCall } from 'lucide-react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { showErrorMessage } from '@/api/helpers';
import { getTravelTimeGoogle } from '@/lib/utils';
import { useLocation } from 'solomo';
import { useJobsSocket } from '@/hooks/use-jobs-socket';

const routeCoordinates = [
  { latitude: 37.78825, longitude: -122.4324 }, // Start point
  { latitude: 37.78625, longitude: -122.4304 },
  { latitude: 37.78425, longitude: -122.4284 },
  { latitude: 37.78225, longitude: -122.4264 },
  { latitude: 37.78025, longitude: -122.4244 },
  { latitude: 37.77825, longitude: -122.4224 },
  { latitude: 37.77625, longitude: -122.4204 }, // End point
];

export default function Screen() {
  const { id }: { id: string } = useLocalSearchParams();

  const { isLoading, data, refetch, isRefetching } = useQuery(api.getJobDetail(id));

  const approveJob = useMutation(api.approveJob(id));

  const beforeEvidence = data?.evidence?.filter((i) => i.evidenceType === 'before');
  const afterEvidence = data?.evidence?.filter((i) => i.evidenceType === 'after');

  const [artisanCoords, setArtisanCoords] = React.useState<{
    latitude: number;
    longitude: number;
  }>();

  const { isConnected } = useJobsSocket({
    autoConnect: true,
    jobId: id,
    onLocationUpdate(data) {
      setArtisanCoords({ latitude: data?.latitude, longitude: data?.longitude });
    },
  });

  const pathname = usePathname();
  const navigation = useNavigation();

  const mapRef = React.useRef<MapView>(null);

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const snapPoints = React.useMemo(() => ['50%', '70%', '90%'], []);

  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, []);

  React.useEffect(() => {
    if (mapRef.current && artisanCoords) {
      mapRef.current.animateToRegion(
        {
          latitude: artisanCoords.latitude,
          longitude: artisanCoords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        300
      );
    }
  }, [artisanCoords]);

  return (
    <Layout
      useBackground
      isRefreshing={isRefetching}
      onRefresh={refetch}
      horizontalPadding={false}
      bottomPadding={0}>
      <View className="flex-1">
        <View className="relative flex flex-1 items-center justify-center">
          <MapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            style={{ width: '100%', height: '100%' }}
            initialRegion={{
              latitude: data?.serviceRequest?.serviceLatitude || 4.7425431,
              longitude: data?.serviceRequest?.serviceLongitude || 7.0379143,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}>
            {/* <Polyline
              coordinates={routeCoordinates}
              strokeColor="#FE6A00" // Orange color
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            /> */}

            <Marker
              coordinate={{
                latitude: artisanCoords?.latitude || 4.7425431,
                longitude: artisanCoords?.longitude || 7.0379143,
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
                latitude: data?.serviceRequest?.serviceLatitude || 4.7425431,
                longitude: data?.serviceRequest?.serviceLongitude || 7.0379143,
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

          <View className="absolute top-7 flex h-[76px] w-[250px] items-center justify-center rounded-full border border-[#DFDFE1] bg-white">
            <Text className="text-center font-cabinet-bold text-xl text-[#1B1B1E]">
              Tracking {data?.artisan?.profile?.fullName}
            </Text>

            <Text className="text-center text-xs text-[#1B1B1E]">{data?.category?.name}</Text>
          </View>

          <BottomSheet
            ref={bottomSheetRef}
            index={0} // Start at first snap point (20% - peek)
            snapPoints={snapPoints}
            enablePanDownToClose={false} // Prevent closing completely
            backgroundStyle={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
            }}
            handleIndicatorStyle={{
              width: 38,
              height: 6,
              backgroundColor: '#FFF4EA',
            }}>
            <BottomSheetScrollView>
              <View className="flex gap-6 p-6">
                <View className="relative flex w-full flex-row items-center justify-center">
                  <Pressable
                    onPress={() => {
                      router.back();
                    }}
                    className="absolute left-0 h-8 w-8 justify-center">
                    <ArrowLeft size={24} color={'#B4B4BC'} />
                  </Pressable>
                </View>

                <View>
                  <Text className="font-cabinet-bold text-[#1B1B1E]">
                    {data?.artisan?.profile?.fullName} is 7 mins away
                  </Text>

                  <Text className="text-xs text-[#737381]">They'll check in when they arrive</Text>
                </View>

                <View className="flex w-full flex-row gap-4">
                  <View className="flex flex-1 flex-row items-center gap-2">
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

                        <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                      </View>

                      <Text className="text-xs text-[#1B1B1E]">
                        {data?.category?.name} Specialist
                      </Text>

                      <Text className="text-xs text-[#FF6A00]">4.8 ★ (145)</Text>
                    </View>
                  </View>

                  <View className="flex flex-1 justify-between">
                    <Text className="text-right text-xs text-[#FF6A00]">JOB ID ● {id}</Text>
                  </View>
                </View>

                <View className="flex flex-row gap-4">
                  <Button className="flex-1 border-[#1B1B1E] bg-white">
                    <PhoneCall size={16} fill={'#1B1B1E'} />

                    <Text className="font-cabinet-bold text-[#1B1B1E]">Call</Text>
                  </Button>

                  <Button
                    onPress={() => {
                      SheetManager.hideAll();
                      router.navigate({
                        pathname: '/chat',
                        params: {
                          id: id,
                        },
                      });
                    }}
                    className="flex-1 border-[#FE6A00] bg-white">
                    <Image
                      source={require('@/assets/icons/message-notif.svg')}
                      style={{ width: 16, height: 16 }}
                      contentFit="contain"
                    />

                    <Text className="font-cabinet-bold text-[#FE6A00]">Message</Text>
                  </Button>
                </View>

                <View className="flex gap-4 pb-11">
                  <Text className="font-cabinet-bold leading-none text-[#737381]">
                    Progress update
                  </Text>

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
                      source={require('@/assets/icons/driving.svg')}
                      style={{ width: 24, height: 24 }}
                      contentFit="contain"
                    />

                    <View className="flex-1">
                      <Text className="font-cabinet-bold text-sm text-[#1B1B1E]">
                        {data?.artisan?.profile?.fullName} has started driving to you
                      </Text>
                      <Text className="text-sm leading-none text-[#737381]">2 minutes ago</Text>
                    </View>
                  </View>

                  {data?.status === 'in_progress' || data?.status === 'completed' ? (
                    <>
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
                          <Text className="text-sm leading-none text-[#737381]">
                            They will be at your door shortly
                          </Text>
                        </View>
                      </View>

                      <Pressable
                        onPress={() => {
                          SheetManager.hideAll();
                          router.navigate({
                            pathname: '/photo-preview',
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

                          <Text className="text-xs text-[#B4B4BC]">
                            Before photo has been attached
                          </Text>

                          <View className="mt-1 flex flex-row flex-wrap gap-2">
                            {beforeEvidence
                              ? beforeEvidence?.map((item) => (
                                  <View
                                    key={item?.id}
                                    className="aspect-[56/46] w-14 overflow-hidden rounded-[4px]">
                                    <Image
                                      source={item?.mediaUrl}
                                      style={{ width: '100%', height: '100%' }}
                                      contentFit="cover"
                                    />
                                  </View>
                                ))
                              : null}
                          </View>
                        </View>
                      </Pressable>
                    </>
                  ) : null}

                  {data?.status === 'completed' ? (
                    <>
                      <Pressable
                        onPress={() => {
                          SheetManager.hideAll();
                          router.navigate({
                            pathname: '/photo-preview',
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

                          <Text className="text-xs text-[#B4B4BC]">
                            After photo has been attached
                          </Text>

                          <View className="mt-1 flex flex-row flex-wrap gap-2">
                            {afterEvidence
                              ? afterEvidence?.map((item) => (
                                  <View
                                    key={item?.id}
                                    className="aspect-[56/46] w-14 overflow-hidden rounded-[4px]">
                                    <Image
                                      source={item?.mediaUrl}
                                      style={{ width: '100%', height: '100%' }}
                                      contentFit="cover"
                                    />
                                  </View>
                                ))
                              : null}
                          </View>
                        </View>
                      </Pressable>

                      <View className="flex flex-row gap-4">
                        <Button
                          isLoading={approveJob?.isPending}
                          disabled={approveJob?.isPending}
                          onPress={() => {
                            approveJob?.mutate(
                              {},
                              {
                                onSuccess: (res) => {
                                  refetch();
                                  SheetManager.hideAll();
                                  router.navigate({
                                    pathname: '/rate',
                                    params: {
                                      id: id,
                                    },
                                  });
                                },
                                onError: (err) => {
                                  showErrorMessage(err?.message);
                                },
                              }
                            );
                          }}
                          className="flex-1 px-0">
                          Release Payment
                        </Button>

                        <Button
                          onPress={() => {
                            SheetManager.hideAll();
                            router.navigate({
                              pathname: '/jobs/dispute',
                              params: {
                                id: id,
                              },
                            });
                          }}
                          className="flex-1 border-[#1B1B1E] bg-white">
                          <Text className="font-cabinet-bold text-[#1B1B1E]">Reject</Text>
                        </Button>
                      </View>
                    </>
                  ) : null}
                </View>
              </View>
            </BottomSheetScrollView>
          </BottomSheet>
        </View>
      </View>
    </Layout>
  );
}
