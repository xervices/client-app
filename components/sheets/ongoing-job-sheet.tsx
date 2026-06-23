import { Pressable, View } from 'react-native';
import React from 'react';
import { Text } from '../ui/text';
import ActionSheet, { ScrollView, SheetManager, SheetProps } from 'react-native-actions-sheet';
import { router } from 'expo-router';
import { ArrowLeft, BadgeCheck, PhoneCall } from 'lucide-react-native';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Image } from 'expo-image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { showErrorMessage } from '@/api/helpers';

export function OngoingJobSheet(props: SheetProps<'ongoing-job-sheet'>) {
  const jobId = props.payload?.id || '';

  const { isLoading, data, refetch, isRefetching } = useQuery(api.getJobDetail(jobId));

  const approveJob = useMutation(api.approveJob(jobId));

  const beforeEvidence = data?.evidence?.filter((i) => i.evidenceType === 'before');
  const afterEvidence = data?.evidence?.filter((i) => i.evidenceType === 'after');

  // const snapPoints = [100];

  return (
    <ActionSheet
      // snapPoints={snapPoints}
      initialSnapIndex={0}
      closable={false}
      closeOnPressBack={true}
      onNavigateBack={() => {
        SheetManager.hide('ongoing-job-sheet');
      }}
      backgroundInteractionEnabled={true}
      isModal={false}
      gestureEnabled={true}
      containerStyle={{
        backgroundColor: '#FFFFFF',
      }}
      indicatorStyle={{
        width: 38,
        height: 6,
        backgroundColor: '#FFF4EA',
      }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex gap-6 p-6">
          <View className="relative flex w-full flex-row items-center justify-center">
            <Pressable
              onPress={() => {
                SheetManager.hide('ongoing-job-sheet');
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

                <Text className="text-xs text-[#1B1B1E]">{data?.category?.name} Specialist</Text>

                <Text className="text-xs text-[#FF6A00]">4.8 ★ (145)</Text>
              </View>
            </View>

            <View className="flex flex-1 justify-between">
              <Text className="text-right text-xs text-[#FF6A00]">JOB ID ● {jobId}</Text>
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
                    id: jobId,
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
            <Text className="font-cabinet-bold leading-none text-[#737381]">Progress update</Text>

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
                      pathname: '/jobs/photo-preview',
                      params: {
                        type: 'Before',
                        id: jobId,
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
                      pathname: '/jobs/photo-preview',
                      params: {
                        type: 'After',
                        id: jobId,
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

                    <Text className="text-xs text-[#B4B4BC]">After photo has been attached</Text>

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
                              pathname: '/jobs/rate',
                              params: {
                                id: jobId,
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
                          id: jobId,
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
      </ScrollView>
    </ActionSheet>
  );
}
