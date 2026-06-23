import { View, Pressable, AppState } from 'react-native';
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Text } from '../ui/text';
import { useAuthStore } from '@/store/auth-store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { useEffect } from 'react';

export function Header() {
  const { user, isGuest } = useAuthStore();

  const unreadNotifications = useQuery({ ...api.getUnreadNotificationCount(), enabled: !isGuest });
  const markAllNotifications = useMutation(api.markAllNotificationAsRead());

  useEffect(() => {
    if (isGuest) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        unreadNotifications?.refetch();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isGuest]);

  return (
    <View className="flex w-full flex-row items-end justify-between">
      <View className="flex flex-row items-center gap-2">
        <Avatar alt={isGuest ? 'Guest avatar' : "User's Avatar"}>
          {!isGuest && <AvatarImage source={{ uri: user?.profile?.avatarUrl }} />}
          <AvatarFallback className="bg-primary">
            <Text className="font-cabinet-bold text-sm uppercase leading-none">
              {isGuest ? 'G' : user?.profile?.fullName.substring(0, 2)}
            </Text>
          </AvatarFallback>
        </Avatar>

        <View>
          <Text className="text-xs leading-none text-[#1B1B1E]">Welcome</Text>
          <Text className="font-cabinet-bold leading-none text-[#1B1B1E]">
            {isGuest ? 'Guest' : user?.profile?.fullName}
          </Text>
        </View>
      </View>

      {isGuest ? (
        <Pressable
          onPress={() => router.navigate('/login')}
          className="flex h-9 items-center justify-center rounded-full bg-primary px-4">
          <Text className="font-cabinet-bold text-sm text-white">Login</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => {
            markAllNotifications?.mutate(undefined, {
              onSuccess: () => {
                unreadNotifications?.refetch();
              },
            });
            router.navigate('/notification');
          }}
          className="relative flex h-6 w-6 items-center justify-center">
          <Bell fill={'#1B1B1E'} />

          {unreadNotifications?.data &&
          unreadNotifications?.data?.unreadCount &&
          unreadNotifications?.data?.unreadCount > 0 ? (
            <View className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#FE6A00]" />
          ) : null}
        </Pressable>
      )}
    </View>
  );
}
