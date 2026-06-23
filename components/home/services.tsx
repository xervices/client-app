import { Image } from 'expo-image';
import { View, Pressable } from 'react-native';
import { Text } from '../ui/text';
import { LegendList } from '@legendapp/list';
import { ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export function Services() {
  const { data } = useQuery(api.getAllCategories());

  if (!data) return null;

  return (
    <View className="flex gap-2 px-6">
      <Text className="font-cabinet-medium text-xs uppercase">Our Services</Text>

      {data && data?.length > 0 && (
        <LegendList
          data={data?.slice(0, 6)}
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
              <Image source={item.iconUrl} style={{ width: 24, height: 24 }} contentFit="contain" />

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
      )}

      <Pressable
        onPress={() => router.navigate('/services')}
        className="mt-1 flex flex-row items-center gap-1">
        <Text className="font-cabinet-bold text-xs leading-none text-[#737381]">Show all</Text>

        <ChevronDown size={12} />
      </Pressable>
    </View>
  );
}
