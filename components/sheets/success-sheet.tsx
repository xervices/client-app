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
    // Capture the callback into a local so it survives this component's
    // unmount — on iOS, hide() resolves around the same time the sheet's
    // React tree tears down, so `props` may be stale by the time we read it.
    const onRedirect = props.payload?.onRedirect;

    const redirectTimeout = setTimeout(async () => {
      // Close the sheet first so its native iOS Modal is fully torn down
      // before any navigation / auth-state change runs. Calling hide() after
      // navigation leaves the modal's backdrop orphaned on top of the new
      // screen and blocks all touches.
      try {
        await SheetManager.hide('success-sheet');
      } catch {
        // Sheet already hidden — fall through and still run the redirect.
      }
      // Decouple from this component's lifecycle: by the time hide() resolves
      // we're unmounting on iOS. Hop to the next macrotask so the redirect
      // runs cleanly after the iOS Modal's UIViewController has dismissed,
      // and outside React's unmount path.
      setTimeout(() => onRedirect?.(), 0);
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
