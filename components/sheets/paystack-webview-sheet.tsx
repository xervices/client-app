import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { Text } from '../ui/text';
import ActionSheet, { ScrollView, SheetManager, SheetProps } from 'react-native-actions-sheet';
import { router } from 'expo-router';
import { ArrowLeft, BadgeCheck, PhoneCall } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

export function PaystackWebviewSheet(props: SheetProps<'paystack-webview-sheet'>) {
  const snapPoints = [100];

  return (
    <ActionSheet
      //   snapPoints={snapPoints}
      initialSnapIndex={0}
      closable={false}
      closeOnPressBack={true}
      onNavigateBack={() => {
        SheetManager.hide('paystack-webview-sheet');
      }}
      backgroundInteractionEnabled={false}
      isModal={false}
      gestureEnabled={false}
      containerStyle={{
        backgroundColor: '#FFFFFF',
      }}
      indicatorStyle={{
        width: 38,
        height: 6,
        backgroundColor: '#FFF4EA',
      }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, height: '100%' }}>
        <View className="flex gap-6 p-6">
          <View className="relative flex w-full flex-row items-center justify-center">
            <Pressable
              onPress={() => {
                SheetManager.hide('paystack-webview-sheet');
              }}
              className="absolute left-0 h-8 w-8 justify-center">
              <ArrowLeft size={24} color={'#B4B4BC'} />
            </Pressable>
          </View>

          <View className="flex-1">
            <WebView
              style={styles.container}
              originWhitelist={['*']}
              source={{ html: '<h1><center>Hello world</center></h1>' }}
            />
          </View>
        </View>
      </ScrollView>
    </ActionSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
