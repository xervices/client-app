import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { router, useLocalSearchParams } from 'expo-router';
import { LegendList } from '@legendapp/list';
import { SheetManager } from 'react-native-actions-sheet';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { MediaThumbnail } from '@/components/media-thumbnail';

export default function Screen() {
  const { type, id }: { type: string; id: string } = useLocalSearchParams();

  const { isLoading, data, refetch, isRefetching } = useQuery(api.getJobDetail(id));

  const beforeEvidence = data?.evidence?.filter((i) => i.evidenceType === 'before');
  const afterEvidence = data?.evidence?.filter((i) => i.evidenceType === 'after');

  return (
    <Layout
      isRefreshing={isRefetching}
      onRefresh={refetch}
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title={`${type} Photos`} />
        </View>
      }>
      <View className="flex-1 gap-6">
        <LegendList
          data={
            type === 'Before' && beforeEvidence
              ? beforeEvidence
              : type === 'After' && afterEvidence
                ? afterEvidence
                : []
          }
          numColumns={3}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                SheetManager.show('image-preview-sheet', {
                  payload: {
                    imgSource: item?.mediaUrl,
                  },
                });
              }}
              className="flex aspect-square w-full items-center justify-center gap-[2px] overflow-hidden rounded-[8px]">
              <MediaThumbnail url={item?.mediaUrl} playBadgeSize={36} playIconSize={18} />
            </Pressable>
          )}
          recycleItems
          contentContainerStyle={{
            gap: 16,
          }}
          style={{
            paddingHorizontal: 10,
          }}
        />
      </View>
    </Layout>
  );
}
