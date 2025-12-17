import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Text } from '../ui/text';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { CameraMode, CameraType, CameraView } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Camera, Video } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { RecordingIndicator } from '../recording-indicator';

const screenHeight = Dimensions.get('window').height;

export function CameraSheet(props: SheetProps<'camera-sheet'>) {
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | undefined>(undefined);
  const [videoUri, setVideoUri] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<CameraMode>('picture');
  const [facing, setFacing] = useState<CameraType>('back');
  const [recording, setRecording] = useState(false);

  const player = useVideoPlayer(videoUri || '', (player) => {
    player.loop = true;
    player.play();
  });

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) setUri(photo.uri);
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }
    setRecording(true);
    const video = await ref.current?.recordAsync();
    if (video?.uri) setVideoUri(video.uri);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'picture' ? 'video' : 'picture'));
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.type === 'image') {
        setUri(asset.uri);
      }

      if (asset.type === 'video') {
        setVideoUri(asset.uri);
      }
    }
  };

  const renderPicture = (uri?: string, videoUri?: string) => {
    return (
      <View className="flex-1 rounded-[8px] bg-white">
        <View className="p-4">
          <Text className="font-cabinet-bold text-[#737381]">Before Photo</Text>
          <Text className="text-sm text-[#737381]">
            Document the current state before starting work.
          </Text>
        </View>

        <View className="flex-1">
          {uri ? (
            <Image source={uri} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : videoUri ? (
            <View className="flex flex-1 gap-4">
              <VideoView
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
                player={player}
              />
            </View>
          ) : null}
        </View>

        <View className="flex flex-row gap-4 p-4">
          <Button
            onPress={() => {
              setVideoUri('');
              setUri('');
            }}
            className="flex-1 border-2 border-[#1B1B1E] bg-white">
            <Text className="font-cabinet-bold text-[#1B1B1E]">Retake</Text>
          </Button>

          <Button
            onPress={() => {
              if (uri) {
                props.payload?.onSelect?.(uri);
              }

              if (videoUri) {
                props.payload?.onSelect?.(videoUri, true);
              }

              setUri('');
              setVideoUri('');
              SheetManager.hide('camera-sheet');
            }}
            className="border-1 flex-1 border-[#1B1B1E] bg-[#1B1B1E]">
            <Text className="font-cabinet-bold text-white">
              Use {uri ? 'Photo' : videoUri ? 'Video' : null}
            </Text>
          </Button>
        </View>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          ref={ref}
          mode={mode}
          facing={facing}
          mute={false}
          responsiveOrientationWhenOrientationLocked
        />

        {recording && (
          <View className="absolute right-6 top-6">
            <RecordingIndicator isRecording={recording} />
          </View>
        )}
      </View>
    );
  };

  return (
    <ActionSheet
      gestureEnabled={false}
      closeOnTouchBackdrop={false}
      containerStyle={{
        backgroundColor: '#140900',
      }}>
      <View style={{ height: screenHeight }} className="flex gap-4 p-6">
        <View className="relative z-10 flex w-full flex-row items-center gap-4">
          <Pressable
            onPress={() => {
              setUri('');
              setVideoUri('');
              SheetManager.hide('camera-sheet');
            }}
            className="flex h-10 items-center justify-center rounded-[8px] bg-[#1B1B1E] px-4">
            <Text className="font-cabinet-bold text-sm leading-none text-[#F4F4F5]">Cancel</Text>
          </Pressable>
        </View>

        {uri || videoUri ? renderPicture(uri, videoUri) : renderCamera()}

        <View className="mt-auto flex flex-row items-center justify-between">
          <Pressable
            onPress={pickImage}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#27272B]">
            <Image
              source={require('@/assets/icons/element-plus.svg')}
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />
          </Pressable>

          <View className="flex items-center justify-center">
            <Pressable
              disabled={!!uri}
              onPress={() => (mode === 'picture' ? takePicture() : recordVideo())}
              className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#FF7C1F]">
              <View className="flex h-[90px] w-[90px] items-center justify-center rounded-full bg-[#FFB884]">
                <View
                  style={{ backgroundColor: mode === 'picture' ? '#FFF4EA' : '#95041A' }}
                  className="flex h-[80px] w-[80px] items-center justify-center rounded-full"
                />
              </View>
            </Pressable>

            <Text className="text-sm text-white">
              {mode === 'picture' ? 'Capture Photo' : recording ? 'Stop Recording' : 'Record Video'}
            </Text>
          </View>

          <Pressable
            onPress={toggleMode}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#27272B]">
            {mode === 'picture' ? <Video color={'#ffffff'} /> : <Camera color={'#ffffff'} />}
          </Pressable>
        </View>
      </View>
    </ActionSheet>
  );
}
