import { Layout } from '@/components/layout';
import { Header } from '@/components/home/header';
import { View, AppState, Platform } from 'react-native';
import { SearchInput } from '@/components/home/search-input';
import { Promotions } from '@/components/home/promotions';
import { Services } from '@/components/home/services';
import { UserOfWeek } from '@/components/home/user-of-week';
import { ActiveJobs } from '@/components/home/active-jobs';
import EnableLocationDialog from '@/components/enable-location-dialog';
import { useMutation, useQueries } from '@tanstack/react-query';
import { api } from '@/api';
import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { useNotification } from '@/providers/notification-provider';
import { useAuthStore } from '@/store/auth-store';
import { BroadcastDialog } from '@/components/home/broadcast-dialog';

export default function Screen() {
  const { isLoggedIn } = useAuthStore();
  const { expoPushToken } = useNotification();
  const { mutateAsync: registerDevice } = useMutation(api.registerDeviceForPushNotification());

  const [categories, requests, jobs, userOfWeek, newsPromotions] = useQueries({
    queries: [
      api.getAllCategories(),
      api.getUserServiceRequests(),
      api.getUserJobs(),
      api.getActiveFeaturedProfiles(),
      api.getNewsAndPromotions(),
    ],
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleOnRefresh = async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([
        categories.refetch(),
        requests?.refetch(),
        jobs?.refetch(),
        userOfWeek?.refetch(),
        newsPromotions?.refetch(),
      ]);
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (expoPushToken) {
      registerDevice({
        pushToken: expoPushToken,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
      }).catch((error) => {
        console.log('Failed to register device:', error);
      });
    }
  }, [expoPushToken]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        categories.refetch();
        requests?.refetch();
        jobs?.refetch();
        userOfWeek?.refetch();
        newsPromotions?.refetch();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Layout
      isRefreshing={isRefreshing}
      onRefresh={handleOnRefresh}
      useBackground
      horizontalPadding={false}
      stickyHeader={
        <View className="px-6 pb-4">
          <Header />
        </View>
      }>
      <View className="flex-1 gap-4">
        <BroadcastDialog />

        <EnableLocationDialog />

        <View className="px-6">
          <SearchInput />
        </View>

        <Promotions />

        <Services />

        <UserOfWeek />

        <ActiveJobs />
      </View>
    </Layout>
  );
}
