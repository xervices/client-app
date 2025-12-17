import React, { useEffect, useState } from 'react';
import { Text } from './ui/text';
import { Modal, Pressable, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Button } from './ui/button';
import { useCameraPermissions } from 'expo-camera';
import { requestRecordingPermissionsAsync } from 'expo-audio';

export default function CameraPermissionDialog() {
  const [permission, requestPermission] = useCameraPermissions();
  const [visible, setVisible] = useState(!permission?.granted);

  useEffect(() => {
    if (permission?.granted) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [permission]);

  if (!permission) {
    return null;
  }

  const onRequestPermission = async () => {
    requestPermission()
      .then(() => {
        requestRecordingPermissionsAsync();
      })
      .finally(() => setVisible(false));
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-start bg-black-1/50 px-6 pt-20">
        <View
          className="flex w-full gap-2 rounded-[8px] bg-white p-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}>
          {/* Header with Close Button */}
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 font-cabinet-bold text-[#1B1B1E]">
              We need your permission to use the camera
            </Text>

            <Pressable
              onPress={() => setVisible(false)}
              className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF4EA]"
              hitSlop={8}>
              <X size={16} color="#1B1B1E" />
            </Pressable>
          </View>

          {/* Description */}
          <Text className="text-sm text-[#737381]">So you can record and take photos/videos.</Text>

          {/* Action Button */}
          <Button onPress={onRequestPermission}>Grant permission</Button>
        </View>
      </View>
    </Modal>
  );
}
