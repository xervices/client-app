import { Image } from 'expo-image';
import { View, ScrollView, Pressable, Linking } from 'react-native';
import { Text } from '../ui/text';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';

export function Promotions() {
  const { isLoading, data } = useQuery(api.getNewsAndPromotions());

  if (isLoading || !data || (data && data?.data?.length === 0)) return null;

  return (
    <View className="flex gap-2">
      <Text className="pl-6 font-cabinet-medium text-xs uppercase">Promotions & news</Text>

      <ScrollView
        horizontal
        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
        showsHorizontalScrollIndicator={false}>
        {data?.data?.map((news) => (
          <Pressable
            onPress={() => {
              if (news?.linkUrl) {
                Linking.openURL(news?.linkUrl);
              }
            }}
            className="h-[100px] w-[250px]"
            key={news?.id}>
            <Image
              source={news?.imageUrl}
              style={{ width: 250, height: 100 }}
              contentFit="contain"
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
