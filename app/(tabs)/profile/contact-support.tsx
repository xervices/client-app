import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';

export default function Screen() {
  const { isLoading, data: whatsappData } = useQuery(api.getWhatsappLinks());

  const data = [
    {
      name: 'Customer Support',
      icon: require('@/assets/icons/customer.svg'),
      isLink: true,
      isDestructive: false,
      onPress: () => router.navigate('/profile/mail-support'),
    },
    {
      name: 'WhatsApp ',
      icon: require('@/assets/icons/whatsapp.svg'),
      isLink: true,
      isDestructive: false,
      onPress: () => {
        if (whatsappData?.data?.artisanWhatsappLink) {
          Linking.openURL(whatsappData?.data?.artisanWhatsappLink);
        }
      },
    },
  ];

  return (
    <Layout
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Support" />
        </View>
      }>
      {isLoading ? (
        <LoadingState />
      ) : (
        <View className="flex-1 gap-6">
          {data.map((item) => (
            <Pressable
              onPress={item.onPress}
              key={item.name}
              className="flex h-[60px] w-full flex-row items-center justify-between rounded-[8px] border border-[#9F9FA7] px-4">
              <View className="flex flex-row items-center gap-2">
                <Image
                  source={item.icon}
                  style={{
                    width: 24,
                    height: 24,
                  }}
                  contentFit="contain"
                />

                <Text
                  className={`font-cabinet-medium text-sm ${item.isDestructive ? 'text-[#B3031E]' : 'text-[#1B1B1E]'}`}>
                  {item.name}
                </Text>
              </View>

              {item.isLink && <ChevronRight size={20} color={'#B4B4BC'} />}
            </Pressable>
          ))}
        </View>
      )}
    </Layout>
  );
}
