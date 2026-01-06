import { Pressable, View } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Text } from '../ui/text';
import { ArrowLeft } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LoadingIndicator } from '../ui/loading-indicator';
import { useEffect } from 'react';

export function SuccessSheet(props: SheetProps<'success-sheet'>) {
  const imageSrc = props.payload?.useCheckImage
    ? require('@/assets/images/success-check.svg')
    : require('@/assets/images/success.svg');

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      props.payload?.onRedirect?.();
      SheetManager.hide('success-sheet');
    }, 5000);

    return () => clearTimeout(redirectTimeout);
  }, []);

  return (
    <ActionSheet
      gestureEnabled={false}
      closeOnTouchBackdrop={false}
      containerStyle={{
        backgroundColor: '#FFFFFF',
      }}
      indicatorStyle={{
        width: 38,
        height: 6,
        backgroundColor: '#FFF4EA',
      }}>
      <View className="flex items-center gap-4 p-6 pt-8">
        {!props?.payload?.hideBackButton && (
          <View className="flex w-full">
            <Pressable
              onPress={() => {
                SheetManager.hide('success-sheet');
              }}
              className="h-8 w-8 justify-center">
              <ArrowLeft size={24} color={'#B4B4BC'} />
            </Pressable>
          </View>
        )}

        <Image
          source={imageSrc}
          style={{ width: '100%', aspectRatio: '295/102', marginHorizontal: 'auto' }}
          contentFit="contain"
        />

        <Text className="text-center font-cabinet-bold text-[#1C752E]">
          {props?.payload?.title}
        </Text>

        <Text className="text-center text-sm text-[#737381]">{props?.payload?.subtitle}</Text>

        <LoadingIndicator />
      </View>
    </ActionSheet>
  );
}
