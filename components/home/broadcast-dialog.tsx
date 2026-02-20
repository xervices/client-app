import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, View } from 'react-native';
import { X, Megaphone, Wrench, Star, Gift, AlertCircle } from 'lucide-react-native';
import { LegendList, LegendListRef } from '@legendapp/list';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingIndicator } from '../ui/loading-indicator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH;

const BROADCAST_ICONS = {
  app_update: <Wrench size={20} color="#0582F1" />,
  maintenance: <Wrench size={20} color="#0582F1" />,
  promotion: <Star size={20} color="#F59E0B" />,
  policy_update: <AlertCircle size={20} color="#F00628" />,
  safety_alert: <AlertCircle size={20} color="#F00628" />,
  new_feature: <Megaphone size={20} color="#FE6A00" />,
};

export function BroadcastDialog() {
  const { isLoading, data } = useQuery(api.getActiveBroadcasts());

  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<LegendListRef | null>(null);

  const handleViewableItemsChanged = ({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  };

  useEffect(() => {
    if (data && data?.data && data?.data?.length > 0) {
      setVisible(true);
    }
  }, [data]);

  if (isLoading || !data?.data || data?.data?.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex flex-1 items-center justify-center bg-black-1/50">
        <View className="flex w-full items-center gap-4">
          {/* Horizontal broadcast list */}
          <LegendList
            ref={listRef}
            data={data?.data}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onViewableItemsChanged={handleViewableItemsChanged}
            // viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            renderItem={({ item }) => <BroadcastDialogItem {...item} />}
          />

          {/* Pagination dots */}
          <View className="flex-row items-center justify-center gap-2 pb-4">
            {data?.data?.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  listRef.current?.scrollToIndex({ index, animated: true });
                  setActiveIndex(index);
                }}>
                <View
                  className="rounded-full"
                  style={{
                    width: activeIndex === index ? 16 : 8,
                    height: 8,
                    backgroundColor: activeIndex === index ? '#FE6A00' : '#DFDFE1',
                  }}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface BroadcastDialogItem {
  id: string;
  title: string;
  body: string;
  templateType?:
    | 'app_update'
    | 'maintenance'
    | 'promotion'
    | 'policy_update'
    | 'safety_alert'
    | 'new_feature'
    | undefined;
  data?: Record<string, never> | undefined;
}

function BroadcastDialogItem({ body, id, title, templateType }: BroadcastDialogItem) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation(api.dismissBroadcast(id));

  return (
    <View style={{ width: CARD_WIDTH }} className="flex p-6">
      <View className="relative flex h-full gap-4 rounded-[12px] bg-white p-6 pt-10">
        <Pressable
          onPress={() => {
            if (isPending) return;

            mutate(undefined, {
              onSuccess: () => {
                queryClient.invalidateQueries({
                  queryKey: api.getActiveBroadcasts().queryKey,
                });
              },
            });
          }}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black-1/30">
          {isPending ? <LoadingIndicator size={16} /> : <X size={16} color="#ffffff" />}
        </Pressable>

        {/* Title */}
        <View className="flex flex-row gap-4">
          <Text className="flex-1 font-cabinet-bold text-xl text-[#1B1B1E]">{title}</Text>

          {templateType ? (
            <View
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  templateType === 'promotion'
                    ? '#FEF3C7'
                    : templateType === 'new_feature'
                      ? '#FEF3C7'
                      : '#EFF6FF',
              }}>
              {BROADCAST_ICONS[templateType]}
            </View>
          ) : null}
        </View>

        {/* Description */}
        <Text className="font-cabinet-medium text-sm leading-relaxed text-[#737381]">{body}</Text>

        {/* CTA */}
        {templateType === 'app_update' ? <Button className="mt-1">Update App</Button> : null}
      </View>
    </View>
  );
}
