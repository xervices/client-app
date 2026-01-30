import { api } from '@/api';
import { AuthHeader } from '@/components/auth-header';
import { Layout } from '@/components/layout';
import { LoadingState } from '@/components/loading-state';
import { Text } from '@/components/ui/text';
import { LegendList } from '@legendapp/list';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

const data = [
  {
    id: 1,
    name: 'Plumber',
    icon: require('@/assets/icons/plumber.svg'),
  },
  {
    id: 2,
    name: 'Cleaner',
    icon: require('@/assets/icons/cleaner.svg'),
  },
  {
    id: 3,
    name: 'Painter',
    icon: require('@/assets/icons/painter.svg'),
  },
  {
    id: 4,
    name: 'Carpenter',
    icon: require('@/assets/icons/carpenter.svg'),
  },
  {
    id: 5,
    name: 'Electrician',
    icon: require('@/assets/icons/electrician.svg'),
  },
  {
    id: 6,
    name: 'Gardener',
    icon: require('@/assets/icons/gardener.svg'),
  },
  {
    id: 7,
    name: 'Laundry',
    icon: require('@/assets/icons/laundry.svg'),
  },
  {
    id: 8,
    name: 'Handyman',
    icon: require('@/assets/icons/handyman.svg'),
  },
  {
    id: 9,
    name: 'Cook',
    icon: require('@/assets/icons/cook.svg'),
  },
  {
    id: 10,
    name: 'Logistics',
    icon: require('@/assets/icons/logistics.svg'),
  },
  {
    id: 11,
    name: 'Photography',
    icon: require('@/assets/icons/photography.svg'),
  },
  {
    id: 12,
    name: 'AC Repair',
    icon: require('@/assets/icons/acrepair.svg'),
  },
  {
    id: 13,
    name: 'Baker',
    icon: require('@/assets/icons/baker.svg'),
  },
  {
    id: 14,
    name: 'Makeup',
    icon: require('@/assets/icons/makeup.svg'),
  },
  {
    id: 15,
    name: 'Gas Refill',
    icon: require('@/assets/icons/gasrefill.svg'),
  },
];

export default function Screen() {
  const { data, isLoading, isRefetching, refetch } = useQuery(api.getAllCategories());

  return (
    <Layout
      useBackground
      isRefreshing={isRefetching}
      onRefresh={refetch}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Our Services" />
        </View>
      }>
      {isLoading ? (
        <LoadingState title="Loading Services..." />
      ) : (
        <View className="flex-1 gap-6">
          <LegendList
            data={data ?? []}
            numColumns={3}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  router.navigate({
                    pathname: '/book',
                    params: {
                      search: item.name,
                      id: item.id,
                    },
                  });
                }}
                className="flex aspect-square w-full items-center justify-center gap-[2px] rounded-[8px] border border-[#FE6A00]">
                <Image
                  source={item.iconUrl}
                  style={{ width: 24, height: 24 }}
                  contentFit="contain"
                />

                <Text className="text-center font-cabinet-bold text-xs text-[#1B1B1E]">
                  {item.name}
                </Text>
              </Pressable>
            )}
            keyExtractor={(item) => item.name}
            recycleItems
            contentContainerStyle={{
              gap: 16,
            }}
            style={{
              paddingHorizontal: 10,
            }}
          />
        </View>
      )}
    </Layout>
  );
}
