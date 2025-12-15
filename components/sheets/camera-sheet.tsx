import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Text } from '../ui/text';
import { Image } from 'expo-image';
import { CameraMode, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Camera, Video } from 'lucide-react-native';

const screenHeight = Dimensions.get('window').height;

export function CameraSheet(props: SheetProps<'camera-sheet'>) {
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>('picture');
  const [facing, setFacing] = useState<CameraType>('back');
  const [recording, setRecording] = useState(false);

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
    console.log({ video });
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'picture' ? 'video' : 'picture'));
  };

  const renderPicture = (uri: string) => {
    return (
      <View className="flex-1 rounded-[8px] bg-white">
        <View className="p-4">
          <Text className="font-cabinet-bold text-[#737381]">Before Photo</Text>
          <Text className="text-sm text-[#737381]">
            Document the current state before starting work.
          </Text>
        </View>

        <View className="flex-1">
          <Image source={uri} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        </View>

        <View className="flex flex-row gap-4 p-4">
          <Button onPress={() => setUri('')} className="flex-1 border-2 border-[#1B1B1E] bg-white">
            <Text className="font-cabinet-bold text-[#1B1B1E]">Retake</Text>
          </Button>

          <Button className="border-1 flex-1 border-[#1B1B1E] bg-[#1B1B1E]">
            <Text className="font-cabinet-bold text-white">Use Photo</Text>
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
              SheetManager.hide('camera-sheet');
            }}
            className="flex h-10 items-center justify-center rounded-[8px] bg-[#1B1B1E] px-4">
            <Text className="font-cabinet-bold text-sm leading-none text-[#F4F4F5]">Cancel</Text>
          </Pressable>
        </View>

        {uri ? renderPicture(uri) : renderCamera()}

        <View className="mt-auto flex flex-row items-center justify-between">
          <Pressable className="flex h-10 w-10 items-center justify-center rounded-full bg-[#27272B]">
            <Image
              source={require('@/assets/icons/element-plus.svg')}
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />
          </Pressable>

          <View className="flex items-center justify-center">
            <Pressable
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
              {mode === 'picture' ? 'Capture Photo' : 'Record Video'}
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
