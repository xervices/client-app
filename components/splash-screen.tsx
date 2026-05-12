import { Image } from 'expo-image';
import { View } from 'react-native';
import { Text } from './ui/text';

export function SplashScreen() {
  return (
    <View className="relative flex-1 items-center justify-center bg-[#E15D02]">
      {/* <View className="absolute inset-0 h-full w-full flex-1">
        <Image
          source={require('@/assets/images/splash-background.png')}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      </View> */}

      <Image
        source={require('@/assets/images/splash-icon.png')}
        style={{ width: '35%', aspectRatio: 300 / 390 }}
        contentFit="contain"
      />

      <Text className="absolute bottom-12 text-center text-sm text-white">
        TRUSTED PROS RIGHT AT YOUR FINGERTIPS
      </Text>
    </View>
  );
}
