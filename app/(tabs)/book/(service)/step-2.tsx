import CameraPermissionDialog from '@/components/camera-permission-dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { UploadedMedia } from '@/components/uploaded-media';
import { useServiceStore } from '@/store/service-store';
import { useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { Camera } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';

export default function Screen() {
  const { setStep2 } = useServiceStore();

  const [permission] = useCameraPermissions();
  const [showPermissionModal, setShowPermissionModal] = React.useState(false);

  const [media, setMediaSrcs] = React.useState<
    { url: string; mimeType: string; isVideo?: boolean }[]
  >([]);
  const [description, setDescription] = React.useState('');

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="flex flex-1 gap-4 bg-white">
        <Text className="text-center font-cabinet-bold text-xs text-[#B4B4BC]">Step 2 of 3</Text>

        <View className="flex gap-2">
          <Text className="font-cabinet-bold leading-none text-[#737381]">
            Describe the service request
          </Text>

          <Text className="text-sm leading-none text-[#737381]">Include any important details</Text>

          <Textarea
            placeholder="Describe what you need help with. More details help us assign the right pro to your request"
            className="rounded-[8px] bg-white"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="flex gap-2">
          <Text className="font-cabinet-bold leading-none text-[#737381]">Add Photos & videos</Text>

          <Text className="text-sm text-[#737381]">
            Show us the service request with a photo/video
          </Text>

          <View className="flex gap-4">
            <View className="flex flex-row flex-wrap justify-between gap-4">
              {/* Photo */}
              {media?.map((item) => (
                <UploadedMedia
                  key={item.url}
                  url={item.url}
                  onDelete={() =>
                    SheetManager.show('delete-image-sheet', {
                      payload: {
                        onDelete() {
                          setMediaSrcs((prev) => prev.filter((media) => media.url !== item.url));
                        },
                      },
                    })
                  }
                  type={item.isVideo ? 'video' : 'photo'}
                />
              ))}
            </View>

            <Pressable
              onPress={() => {
                if (permission?.granted) {
                  SheetManager.show('camera-sheet', {
                    payload: {
                      onSelect(value) {
                        setMediaSrcs((prev) => {
                          return [...prev, value];
                        });
                      },
                    },
                  });
                } else {
                  setShowPermissionModal(true);
                }
              }}
              className="flex aspect-square w-16 items-center justify-center rounded-[8px] border border-[#E0E0E0]">
              <Camera size={24} color={'#737381'} />
            </Pressable>
          </View>
        </View>

        <Button
          disabled={!description || !media || media.length === 0}
          onPress={() => {
            setStep2({
              title: description.substring(0, 243),
              description,
              media,
            });
            router.navigate('/book/step-3');
          }}
          className="mt-auto">
          Continue
        </Button>

        <CameraPermissionDialog
          onPermissionsGranted={() => {
            SheetManager.show('camera-sheet', {
              payload: {
                onSelect(value) {
                  setMediaSrcs((prev) => {
                    return [...prev, value];
                  });
                },
              },
            });
          }}
          visible={showPermissionModal}
          setVisible={setShowPermissionModal}
        />
      </View>
    </ScrollView>
  );
}
