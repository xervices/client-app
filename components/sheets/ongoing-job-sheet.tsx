import { Pressable, View } from 'react-native';
import React from 'react';
import { Text } from '../ui/text';
import ActionSheet, { ScrollView, SheetManager } from 'react-native-actions-sheet';
import { router } from 'expo-router';
import { ArrowLeft, BadgeCheck, PhoneCall } from 'lucide-react-native';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Image } from 'expo-image';

export function OngoingJobSheet() {
  const snapPoints = [100];

  return (
    <ActionSheet
      snapPoints={snapPoints}
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
            <Text className="font-cabinet-bold text-[#1B1B1E]">Sarah is 7 mins away</Text>

            <Text className="text-xs text-[#737381]">She'll check in when he arrives</Text>
          </View>

          <View className="flex w-full flex-row">
            <View className="flex w-1/2 flex-row items-center gap-2">
              <Avatar alt="User's Avatar" className="h-14 w-14">
                <AvatarImage source={{ uri: 'https://github.com/mrzachnugent.png' }} />
                <AvatarFallback className="bg-primary">
                  <Text className="font-cabinet-bold leading-none">ZN</Text>
                </AvatarFallback>
              </Avatar>

              <View>
                <View className="flex flex-row items-center">
                  <Text className="font-cabinet-bold text-[18px] text-[#1B1B1E]">Sarah Rodri</Text>

                  <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                </View>

                <Text className="text-xs text-[#1B1B1E]">Plumbing Specialist</Text>

                <Text className="text-xs text-[#FF6A00]">4.9 ★ (145)</Text>
              </View>
            </View>

            <View className="flex w-1/2 justify-between">
              <Text className="text-right text-xs text-[#FF6A00]">JOB ID ● #25667</Text>
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
                    id: '1234',
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

          {/* <View className="flex gap-4 pb-11">
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
                  Sarah has started driving to you
                </Text>
                <Text className="text-sm leading-none text-[#737381]">2 minutes ago</Text>
              </View>
            </View>

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
                  Sarah has arrived at your location
                </Text>
                <Text className="text-sm leading-none text-[#737381]">
                  He will be at your door shortly
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
                  Sarah has checked in and is starting work
                </Text>

                <Text className="text-xs text-[#B4B4BC]">Before photo has been attached</Text>

                <View className="mt-1 flex flex-row flex-wrap gap-2">
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
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                SheetManager.hideAll();
                router.navigate({
                  pathname: '/jobs/photo-preview',
                  params: {
                    type: 'After',
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
                  Sarah is done and has checked out
                </Text>

                <Text className="text-xs text-[#B4B4BC]">After photo has been attached</Text>

                <View className="mt-1 flex flex-row flex-wrap gap-2">
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
              </View>
            </Pressable>

            <View className="flex flex-row gap-4">
              <Button
                onPress={() => {
                  SheetManager.hideAll();
                  router.navigate({
                    pathname: '/jobs/rate',
                    params: {
                      id: '1234',
                    },
                  });
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
                      id: '1234',
                    },
                  });
                }}
                className="flex-1 border-[#1B1B1E] bg-white">
                <Text className="font-cabinet-bold text-[#1B1B1E]">Reject</Text>
              </Button>
            </View>
          </View> */}
        </View>
      </ScrollView>
    </ActionSheet>
  );
}
