import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

interface UploadedMediaProps {
  url?: string;
  onDelete?: () => void;
  type?: 'photo' | 'video';
}

export function UploadedMedia({ url, onDelete, type = 'photo' }: UploadedMediaProps) {
  const player = useVideoPlayer(url || '', (player) => {
    // player.loop = true;
    // player.play();
  });

  if (type === 'video')
    return (
      <View className="relative aspect-square w-[47%] overflow-hidden rounded-[8px]">
        <VideoView contentFit="cover" style={{ width: '100%', height: '100%' }} player={player} />

        <Pressable
          onPress={onDelete}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF4EA]">
          <Image
            source={require('@/assets/icons/trash.svg')}
            style={{ width: 14, height: 14 }}
            contentFit="contain"
          />
        </Pressable>
      </View>
    );

  return (
    <View key={url} className="relative aspect-square w-[47%] overflow-hidden rounded-[8px]">
      <Image
        source={url}
        style={{
          width: '100%',
          height: '100%',
        }}
        contentFit="cover"
      />

      <View className="absolute inset-0 flex h-full w-full items-center justify-center bg-[#FFE6D6]/0 p-4">
        <Pressable
          onPress={onDelete}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF4EA]">
          <Image
            source={require('@/assets/icons/trash.svg')}
            style={{ width: 14, height: 14 }}
            contentFit="contain"
          />
        </Pressable>
      </View>
    </View>
  );
}
