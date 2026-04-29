import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { tokenStorage } from '@/api/token-storage';
import { useNotification } from '@/providers/notification-provider';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api';
import Storage from 'expo-sqlite/kv-store';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { SheetManager } from 'react-native-actions-sheet';
import { Button } from '@/components/ui/button';

export default function Screen() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const { expoPushToken } = useNotification();
  const { mutateAsync: unregisterDevice, isPending } = useMutation(
    api.unregisterDeviceForPushNotification()
  );

  if (isGuest) {
    return (
      <Layout
        useBackground
        stickyHeader={
          <View className="pb-4">
            <AuthHeader title="Settings" showBackButton={false} />
          </View>
        }>
        <View className="flex flex-1 items-center justify-center gap-6 px-6">
          <View className="gap-2">
            <Text className="text-center font-cabinet-bold text-xl text-[#1B1B1E]">
              Login to access your profile
            </Text>
            <Text className="text-center text-sm text-[#737381]">
              Sign in to manage your personal details, password, disputes and more.
            </Text>
          </View>

          <Button onPress={() => router.navigate('/login')} className="w-full">
            Login
          </Button>
        </View>
      </Layout>
    );
  }

  const data = [
    {
      name: 'Personal Details',
      icon: require('@/assets/icons/personal.svg'),
      isLink: true,
      isDestructive: false,
      onPress: () => router.navigate('/profile/personal'),
    },
    {
      name: 'Password',
      icon: require('@/assets/icons/password.svg'),
      isLink: true,
      isDestructive: false,
      onPress: () => router.navigate('/profile/password'),
    },
    {
      name: 'Dispute',
      icon: require('@/assets/icons/dispute.svg'),
      isLink: true,
      isDestructive: false,
      onPress: () => router.navigate('/profile/disputes'),
    },
    // {
    //   name: 'Payment',
    //   icon: require('@/assets/icons/payment.svg'),
    //   isLink: true,
    //   onPress: () => router.navigate('/profile'),
    // },
    {
      name: 'Promo',
      icon: require('@/assets/icons/promo.svg'),
      isLink: true,
      isDestructive: false,
      onPress: () => router.navigate('/profile/promo'),
    },
    {
      name: 'Rate Xervices',
      icon: require('@/assets/icons/rate.svg'),
      isLink: true,
      isDestructive: false,
      onPress: () => router.navigate('/profile/rate'),
    },
    {
      name: 'Support',
      icon: require('@/assets/icons/support.svg'),
      isLink: true,
      isDestructive: false,
      onPress: () => router.navigate('/profile/support'),
    },
    {
      name: 'About Xervices',
      icon: require('@/assets/icons/about.svg'),
      isLink: true,
      isDestructive: false,
      onPress: () => router.navigate('/profile/about'),
    },
    {
      name: 'Logout',
      icon: require('@/assets/icons/logout.svg'),
      isLink: false,
      isDestructive: true,
      onPress: async () => {
        if (expoPushToken) {
          try {
            await unregisterDevice({ pushToken: expoPushToken });
            Storage.removeItemSync('push_token_registered');
            Storage.removeItemSync('is_registered_for_push');
          } catch (e) {
            console.log(e);
          }
        }
        await tokenStorage.clearTokens();
        useAuthStore.getState().setLoginState(false);
      },
    },
    {
      name: 'Delete account',
      icon: require('@/assets/icons/delete.svg'),
      isLink: true,
      isDestructive: true,
      onPress: () => SheetManager.show('delete-account-sheet'),
    },
  ];

  return (
    <Layout
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Settings" showBackButton={false} />
        </View>
      }>
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

            {isPending && item.name === 'Logout' && item.isDestructive ? (
              <LoadingIndicator size={14} />
            ) : null}
          </Pressable>
        ))}
      </View>
    </Layout>
  );
}
