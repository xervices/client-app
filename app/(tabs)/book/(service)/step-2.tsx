import CameraPermissionDialog from '@/components/camera-permission-dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { UploadedMedia } from '@/components/uploaded-media';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Camera } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';

export default function Screen() {
  const [mediaSrcs, setMediaSrcs] = React.useState<{ url: string; isVideo?: boolean }[]>([]);

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
          />
        </View>

        <View className="flex gap-2">
          <Text className="font-cabinet-bold leading-none text-[#737381]">Add Photos & videos</Text>

          <Text className="text-sm text-[#737381]">
            The media file or document uploaded should show how bad the job is; we don't want it to
            turn out that what was uploaded is different from the real problem.
          </Text>

          <View className="flex gap-4">
            <View className="flex flex-row flex-wrap justify-between gap-4">
              {/* Photo */}
              {mediaSrcs?.map((item) => (
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

              {/* Video */}
              {/* <View className="relative aspect-square w-[47%] overflow-hidden rounded-[8px]">
              <Image
                source={require('@/assets/images/sample.png')}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                contentFit="cover"
              />

              <View className="absolute inset-0 flex h-full w-full items-center justify-center bg-[#FFE6D6]/0 p-4">
                <Pressable
                  onPress={() => SheetManager.show('delete-image-sheet')}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF4EA]">
                  <Image
                    source={require('@/assets/icons/trash.svg')}
                    style={{ width: 14, height: 14 }}
                    contentFit="contain"
                  />
                </Pressable>

                <Pressable className="flex aspect-square w-11 items-center justify-center rounded-full bg-[#FFFFFF]">
                  <Play size={24} color={'#737381'} fill={'#737381'} />
                </Pressable>
              </View>
            </View> */}
            </View>

            <Pressable
              onPress={() =>
                SheetManager.show('camera-sheet', {
                  payload: {
                    onSelect(url, isVideo) {
                      const data = {
                        url,
                        isVideo,
                      };

                      setMediaSrcs((prev) => {
                        return [...prev, data];
                      });
                    },
                  },
                })
              }
              className="flex aspect-square w-16 items-center justify-center rounded-[8px] border border-[#E0E0E0]">
              <Camera size={24} color={'#737381'} />
            </Pressable>
          </View>
        </View>

        <Button onPress={() => router.navigate('/book/step-3')} className="mt-auto">
          Continue
        </Button>

        <CameraPermissionDialog />
      </View>
    </ScrollView>
  );
}
