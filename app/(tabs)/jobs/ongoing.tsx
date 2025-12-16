import { Text } from '@/components/ui/text';
import * as React from 'react';
import { BackHandler, Platform, Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { useNavigation, usePathname } from 'expo-router';
import { SheetManager } from 'react-native-actions-sheet';
import { Image } from 'expo-image';

export default function Screen() {
  const pathname = usePathname();
  const navigation = useNavigation();

  React.useEffect(() => {
    if (pathname === '/jobs/ongoing') {
      SheetManager.show('ongoing-job-sheet');
    } else {
      SheetManager.hide('ongoing-job-sheet');
    }
  }, [pathname]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      SheetManager.hide('ongoing-job-sheet');
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Layout useBackground scrollable={false} horizontalPadding={false} bottomPadding={0}>
      <View className="flex-1">
        <View className="relative flex flex-1 items-center justify-center">
          <Image
            source={require('@/assets/images/map-view.svg')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />

          <View className="absolute top-7 flex h-[76px] w-[250px] items-center justify-center rounded-full border border-[#DFDFE1] bg-white">
            <Text className="text-center font-cabinet-bold text-xl text-[#1B1B1E]">
              Tracking Sarah
            </Text>

            <Text className="text-center text-xs text-[#1B1B1E]">Plumber</Text>
          </View>
        </View>
        {/* <View className="h-[25%] w-full bg-white"></View> */}
      </View>
    </Layout>
  );
}
