import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import * as Contacts from 'expo-contacts';

export default function Screen() {
  const getContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      Contacts.presentContactPickerAsync().then((res) => {});
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="flex flex-1 gap-4 bg-white">
        <Text className="text-center font-cabinet-bold text-xs text-[#B4B4BC]">Step 3 of 3</Text>

        <View className="flex gap-2">
          <Text className="font-cabinet-bold leading-none text-[#737381]">My Location</Text>

          <Text className="text-sm leading-none text-[#737381]">Please confirm your Location.</Text>

          <View className="flex gap-2">
            <Pressable className="flex h-[52px] flex-row items-center gap-2 rounded-sm border border-[#DFDFE1] px-4">
              <View className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FE6A00]">
                <View className="h-2 w-2 rounded-full bg-white" />
              </View>

              <Text className="flex-1 text-[#B4B4BC]" numberOfLines={1}>
                Esse molestie consequat, vel illum d vel illum d vel illum d vel illum d vel illum d
                vel illum d
              </Text>
            </Pressable>

            <View className="flex flex-row">
              <Pressable className="flex flex-row items-center gap-2">
                <View className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#FFF4EA]">
                  <Image
                    source={require('@/assets/icons/picture-frame.svg')}
                    style={{ width: 16, height: 16 }}
                    contentFit="contain"
                  />
                </View>

                <Text className="font-cabinet-bold text-xs text-[#FE6A00]">My current address</Text>
              </Pressable>
            </View>
          </View>

          <Pressable className="flex h-[52px] flex-row items-center gap-2 rounded-sm border border-[#DFDFE1] px-4">
            <View className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FE6A00]">
              <View className="h-2 w-2 rounded-full bg-white" />
            </View>

            <Text className="flex-1 text-[#B4B4BC]" numberOfLines={1}>
              Esse molestie consequat, vel illum d vel illum d vel illum d vel illum d vel illum d
              vel illum d
            </Text>
          </Pressable>
        </View>

        <View className="flex gap-2">
          <Text className="font-cabinet-bold leading-none text-[#737381]">Phone Number</Text>

          <Text className="text-sm leading-none text-[#737381]">
            Confirm number or available contact
          </Text>

          <Input
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            defaultValue="8060230023"
            className="bg-white"
            rightIcon={
              <Pressable onPress={getContact}>
                <Image
                  source={require('@/assets/icons/contact-calendar.svg')}
                  style={{ width: 24, height: 24 }}
                  contentFit="contain"
                />
              </Pressable>
            }
          />
        </View>

        <Button onPress={() => router.navigate('/book/searching')} className="mt-auto">
          Continue
        </Button>
      </View>
    </ScrollView>
  );
}
