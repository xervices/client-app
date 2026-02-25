import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';

export default function Screen() {
  const { data, isLoading, refetch, isRefetching } = useQuery(api.getPrivacyPolicy());

  return (
    <Layout
      useBackground
      isRefreshing={isRefetching}
      onRefresh={refetch}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title={data?.data ? data?.data?.title : 'Cancellation policies'} />
        </View>
      }>
      {isLoading ? (
        <LoadingState title="Loading Cancellation policy..." />
      ) : (
        <View className="flex-1 gap-6">
          <Text className="text-[#737381]">{data?.data?.content}</Text>
        </View>
      )}
    </Layout>
  );
}
