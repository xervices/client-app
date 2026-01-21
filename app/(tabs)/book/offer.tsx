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

export default function Screen() {
  const { id }: { id: string } = useLocalSearchParams();

  return (
    <Layout
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader />
        </View>
      }>
      <View className="flex-1 gap-2">
        <View>
          <Text className="font-cabinet-bold text-xl text-[#1B1B1E]">3 Offers Received</Text>
          <Text className="text-sm text-[#B4B4BC]">Plumber</Text>
        </View>

        <View className="flex gap-4">
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
                  <AvatarImage source={{ uri: 'https://github.com/mrzachnugent.png' }} />
                  <AvatarFallback className="bg-primary">
                    <Text className="font-cabinet-bold leading-none">ZN</Text>
                  </AvatarFallback>
                </Avatar>

                <View>
                  <View className="flex flex-row items-center">
                    <Text className="font-cabinet-bold text-[18px] text-[#1B1B1E]">
                      Sarah Rodri
                    </Text>

                    <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                  </View>

                  <Text className="text-xs text-[#FF6A00]">4.9 ★ (145)</Text>
                </View>
              </View>

              <View className="flex w-1/2 justify-between">
                <Text className="text-right font-cabinet-bold text-[18px] text-[#FF6A00]">
                  ₦8500
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
                onPress={() => SheetManager.show('counter-offer-sheet')}
                className="h-12 flex-1"
                variant={'outline'}>
                Counter
              </Button>
              <Button onPress={() => router.navigate('/book/pro')} className="h-12 flex-1">
                Accept
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Layout>
  );
}
