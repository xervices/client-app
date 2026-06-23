import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from './ui/icon';
import { ArrowLeft } from 'lucide-react-native';
import { Text } from './ui/text';

interface AuthHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackButtonPress?: () => void;
}

export function AuthHeader({
  title,
  showBackButton: showBackButton = true,
  onBackButtonPress,
}: AuthHeaderProps) {
  return (
    <View className="relative flex w-full flex-row items-center justify-center">
      {router.canGoBack() && showBackButton && (
        <Pressable
          onPress={() => {
            if (onBackButtonPress) {
              onBackButtonPress();
            } else {
              router.back();
            }
          }}
          className="absolute left-0">
          <Icon as={ArrowLeft} size={28} color={'#B4B4BC'} />
        </Pressable>
      )}

      <Text className="font-cabinet-bold text-xl">{title}</Text>
    </View>
  );
}
