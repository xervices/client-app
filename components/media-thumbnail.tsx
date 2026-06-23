import { Image, ImageContentFit } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play } from 'lucide-react-native';
import { View } from 'react-native';

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v', '.3gp', '.qt'];

export function isVideoUrl(url?: string | null) {
  if (!url) return false;
  const path = url.split('?')[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}

interface MediaThumbnailProps {
  url?: string | null;
  contentFit?: ImageContentFit;
  playIconSize?: number;
  playBadgeSize?: number;
}

export function MediaThumbnail({
  url,
  contentFit = 'cover',
  playIconSize = 10,
  playBadgeSize = 18,
}: MediaThumbnailProps) {
  const isVideo = isVideoUrl(url);
  const player = useVideoPlayer(isVideo && url ? url : '', (p) => {
    p.muted = true;
  });

  if (isVideo && url) {
    return (
      <View style={{ width: '100%', height: '100%' }}>
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%' }}
          contentFit={contentFit as any}
          nativeControls={false}
        />
        <View
          pointerEvents="none"
          className="absolute inset-0 flex items-center justify-center bg-black/15">
          <View
            style={{
              width: playBadgeSize,
              height: playBadgeSize,
              borderRadius: playBadgeSize / 2,
              backgroundColor: 'rgba(255,255,255,0.85)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Play size={playIconSize} color="#1B1B1E" fill="#1B1B1E" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <Image
      source={url || undefined}
      style={{ width: '100%', height: '100%' }}
      contentFit={contentFit}
    />
  );
}
