import * as React from 'react';
import { View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { LoadingState } from '@/components/loading-state';
import { HtmlContent } from '@/components/html-content';

export default function Screen() {
  const { isLoading, data, refetch, isRefetching } = useQuery(api.getAbout());

  return (
    <Layout
      useBackground
      isRefreshing={isRefetching}
      onRefresh={refetch}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="About Xervices" />
        </View>
      }>
      {isLoading ? (
        <LoadingState />
      ) : (
        <View className="flex-1">
          <HtmlContent html={data?.data?.content} />
        </View>
      )}
    </Layout>
  );
}
