import { Layout } from '@/components/layout';
import { Header } from '@/components/home/header';
import { View, Platform, AppState } from 'react-native';
import { SearchInput } from '@/components/home/search-input';
import { Promotions } from '@/components/home/promotions';
import { Services } from '@/components/home/services';
import { UserOfWeek } from '@/components/home/user-of-week';
import { ActiveJobs } from '@/components/home/active-jobs';
import EnableLocationDialog from '@/components/enable-location-dialog';
import { useMutation, useQueries } from '@tanstack/react-query';
import { api } from '@/api';
import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Storage from 'expo-sqlite/kv-store';
import { useNotification } from '@/providers/notification-provider';
import { useAuthStore } from '@/store/auth-store';
import { BroadcastDialog } from '@/components/home/broadcast-dialog';

export default function Screen() {
  const { isLoggedIn } = useAuthStore();
  const { expoPushToken } = useNotification();
  const { mutateAsync: registerDevice } = useMutation(api.registerDeviceForPushNotification());
  const { mutateAsync: unregisterDevice } = useMutation(api.unregisterDeviceForPushNotification());

  const [categories, requests, jobs] = useQueries({
    queries: [api.getAllCategories(), api.getUserServiceRequests(), api.getUserJobs()],
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleOnRefresh = async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([categories.refetch(), requests?.refetch(), jobs?.refetch()]);
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const handleRegistration = async () => {
      if (isLoggedIn && expoPushToken) {
        const storedToken = Storage.getItemSync('push_token_registered');

        if (storedToken !== expoPushToken) {
          if (storedToken) {
            try {
              await unregisterDevice({ pushToken: storedToken });
            } catch (error) {
              console.log('Failed to unregister old token:', error);
            }
          }

          try {
            await registerDevice({
              pushToken: expoPushToken,
              platform: Platform.OS === 'ios' ? 'ios' : 'android',
            });
            Storage.setItemSync('push_token_registered', expoPushToken);
            Storage.setItemSync('is_registered_for_push', 'true');
          } catch (error) {
            console.log('Failed to register token:', error);
          }
        }
      }
    };

    handleRegistration();
  }, [isLoggedIn, expoPushToken]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        categories.refetch();
        requests?.refetch();
        jobs?.refetch();
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
