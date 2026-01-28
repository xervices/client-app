import { Pressable, View } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Text } from '../ui/text';
import { ArrowLeft } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LoadingIndicator } from '../ui/loading-indicator';
import { useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';

function VideoPreview({ source }: { source: string }) {
  const player = useVideoPlayer(source, (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <VideoView
      style={{ width: '100%', aspectRatio: 1, borderRadius: 8 }}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}

const isVideoUri = (source: any): boolean => {
  const uri = typeof source === 'string' ? source : source?.uri;
  if (!uri || typeof uri !== 'string') return false;
  // Basic check for common video extensions, handling query parameters
  return /\.(mp4|mov|webm|mkv|m4v)($|\?)/i.test(uri);
};

export function ImagePreviewSheet(props: SheetProps<'image-preview-sheet'>) {
  const source = props.payload?.imgSource;
  const isVideo = isVideoUri(source);

  return (
    <ActionSheet
      gestureEnabled={true}
      closeOnTouchBackdrop={true}
      containerStyle={{
        backgroundColor: '#FFFFFF',
      }}
      indicatorStyle={{
        width: 38,
        height: 6,
        backgroundColor: '#FFF4EA',
      }}>
      <View className="flex items-center gap-4 p-6">
        <View className="flex w-full">
          <Pressable
            onPress={() => {
              SheetManager.hide('image-preview-sheet');
            }}
            className="h-8 w-8 justify-center">
            <ArrowLeft size={24} color={'#B4B4BC'} />
          </Pressable>
        </View>

        {isVideo && source ? (
          <VideoPreview source={source} />
        ) : (
          <Image
            source={source}
            style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8 }}
            contentFit="contain"
          />
        )}
      </View>
    </ActionSheet>
  );
}
