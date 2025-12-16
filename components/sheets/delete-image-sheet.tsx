import { Pressable, View } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Text } from '../ui/text';
import { ArrowLeft } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LoadingIndicator } from '../ui/loading-indicator';
import { useEffect } from 'react';
import { Button } from '../ui/button';

export function DeleteImageSheet(props: SheetProps<'delete-image-sheet'>) {
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
        <View className="relative flex w-full flex-row items-center justify-center">
          <Pressable
            onPress={() => {
              SheetManager.hide('delete-image-sheet');
            }}
            className="absolute left-0 h-8 w-8 justify-center">
            <ArrowLeft size={24} color={'#B4B4BC'} />
          </Pressable>

          <Text className="text-center font-cabinet-bold text-[#B3031E]">Delete</Text>
        </View>

        <Text className="text-center text-sm text-[#B4B4BC]">
          Are you sure you ant to delete photo?
        </Text>

        <View className="flex flex-row gap-4">
          <Button
            onPress={() => {
              SheetManager.hide('delete-image-sheet');
            }}
            className="flex-1 border-[#1B1B1E] bg-white">
            <Text className="font-cabinet-bold text-[#1B1B1E]">Cancel</Text>
          </Button>

          <Button
            onPress={() => {
              props.payload?.onDelete?.();
              SheetManager.hide('delete-image-sheet');
            }}
            className="flex-1">
            Yes delete
          </Button>
        </View>
      </View>
    </ActionSheet>
  );
}
