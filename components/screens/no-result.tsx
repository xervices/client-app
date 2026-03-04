import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ArrowUpRight, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';
import { SheetManager } from 'react-native-actions-sheet';

export function NoResultScreen() {
  const { id }: { id: string } = useLocalSearchParams();

  const queryClient = useQueryClient();

  const pathname = usePathname();

  const IS_BOOK_TAB = pathname.includes('book');

  const { mutate, isPending } = useMutation({
    ...api.cancelServiceRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.getUserServiceRequests().queryKey,
      });

      showSuccessMessage('Service Request canceled successfully!');
      if (IS_BOOK_TAB) {
        router.replace('/book');
      } else {
        router.replace('/(tabs)/(home)');
      }
    },
    onError: (err) => {
      showErrorMessage(err.message);
    },
  });

  return (
    <Layout
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader />
        </View>
      }>
      <View className="flex-1 gap-4">
        <View className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-[#FFE6D6]">
          <Image
            source={require('@/assets/images/logo-primary.svg')}
            style={{ width: 120, height: 120 }}
            contentFit="contain"
          />
        </View>

        <View className="mt-10">
          <Text className="text-center font-cabinet-bold text-[#737381]">No Pro Found</Text>
          <Text className="mx-auto max-w-[90%] text-center text-sm text-[#737381]">
            Couldn't match you with any pro at the moment. Please try requesting later."
          </Text>
        </View>

        <View className="mt-auto flex gap-2">
          <Button
            onPress={() => {
              if (IS_BOOK_TAB) {
                router.navigate({
                  pathname: '/book/searching',
                  params: {
                    id,
                  },
                });
              } else {
                router.navigate({
                  pathname: '/searching',
                  params: {
                    id,
                  },
                });
              }
            }}>
            Resubmit
          </Button>

          <Button
            onPress={() => {
              SheetManager?.show('cancel-service-sheet', {
                payload: {
                  onConfirm(reason) {
                    mutate({ reason });
                  },
                },
              });
            }}
            isLoading={isPending}
            disabled={isPending}
            variant={'destructive'}>
            Cancel Request
          </Button>
        </View>
      </View>
    </Layout>
  );
}
