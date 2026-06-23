import * as React from 'react';
import { View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import { HtmlContent } from '@/components/html-content';

export function CancellationPolicyScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery(api.getCancellationPolicy());

  return (
    <Layout
      useBackground
      isRefreshing={isRefetching}
      onRefresh={refetch}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title={'Cancellation Policy'} />
        </View>
      }>
      {isLoading ? (
        <LoadingState title="Loading Cancellation Policy..." />
      ) : (
        <View className="flex-1">
          <HtmlContent html={data?.data?.content} />
        </View>
      )}
    </Layout>
  );
}
