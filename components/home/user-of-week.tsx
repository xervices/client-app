import { Image } from 'expo-image';
import { Linking, Pressable, View } from 'react-native';
import { Text } from '../ui/text';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export function UserOfWeek() {
  const { isLoading, data } = useQuery(api.getActiveFeaturedProfiles());

  if (isLoading || !data || (data && data?.data?.length === 0)) return null;
  return (
    <View className="flex gap-2 px-6">
      <Text className="font-cabinet-medium text-xs uppercase">User of the week</Text>

      {data?.data?.map((user) => (
        <Pressable
          onPress={() => {
            if (user?.videoLink) {
              Linking.openURL(user?.videoLink);
            }
          }}
          key={user?.id}
          className="w-full">
          <Image
            source={user?.imageUrl}
            style={{
              width: '100%',
              aspectRatio: '327/150',
            }}
            contentFit="cover"
          />
        </Pressable>
      ))}
    </View>
  );
}
