import { View } from 'react-native';
import { Text } from './ui/text';
import { LoadingIndicator } from './ui/loading-indicator';

interface LoadingStateProps {
  title?: string;
}

export function LoadingState({ title }: LoadingStateProps) {
  return (
    <View className="flex flex-1 items-center justify-center gap-6 bg-white">
      <LoadingIndicator />

      <Text className="text-center font-cabinet-bold text-[#FE6A00]">{title}</Text>
    </View>
  );
}
