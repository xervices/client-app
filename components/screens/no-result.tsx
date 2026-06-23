import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams, usePathname } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';
import { SheetManager } from 'react-native-actions-sheet';
import { LoadingState } from '../loading-state';

export function NoResultScreen() {
  const { id }: { id: string } = useLocalSearchParams();

  const { isLoading, data, isRefetching, refetch } = useQuery(api.getServiceRequest(id));

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

  useFocusEffect(
    React.useCallback(() => {
      refetch().then(({ data }) => {
        if (!data) return;
        if (data.status === 'cancelled' || data.status === 'expired') {
          router.replace(
            // IS_BOOK_TAB ?
            '/book'
            // '/(tabs)/(home)'
          );
        }
      });
    }, [refetch, IS_BOOK_TAB])
  );

  return (
    <Layout
      isRefreshing={isRefetching}
      onRefresh={refetch}
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader
            onBackButtonPress={() => {
              if (IS_BOOK_TAB) {
                router.replace('/book');
              } else {
                router.replace('/(tabs)/(home)');
              }
            }}
          />
        </View>
      }>
      {isLoading || isRefetching ? (
        <LoadingState title="Loading request." />
      ) : (
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
              We couldn’t find a pro available at the moment. Please try requesting again later.
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
      )}
    </Layout>
  );
}
