import { Pressable, StyleSheet, View } from 'react-native';
import React, { useRef, useCallback } from 'react';
import { Text } from '../ui/text';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { ArrowLeft, X } from 'lucide-react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

export interface PaymentWebviewPayload {
  authorizationUrl: string;
  callbackUrl?: string;
  cancelUrl?: string;
  onSuccess?: (reference: string) => void;
  onError?: (errorMessage: string) => void;
}

export function PaymentWebviewSheet(props: SheetProps<'payment-webview-sheet'>) {
  const webViewRef = useRef<WebView>(null);

  const payload = props.payload as PaymentWebviewPayload | undefined;
  const authorizationUrl = payload?.authorizationUrl || '';
  const callbackUrl = payload?.callbackUrl;
  const cancelUrl = payload?.cancelUrl || 'https://example.com/';
  const onSuccess = payload?.onSuccess;
  const onError = payload?.onError;

  const extractReferenceFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const reference = urlObj.searchParams.get('reference');
      return reference || '';
    } catch {
      return '';
    }
  };

  return (
    <ActionSheet
      initialSnapIndex={0}
      closable={false}
      closeOnPressBack={true}
      onNavigateBack={() => {
        // onError?.('Payment cancelled');
        SheetManager.hide('payment-webview-sheet');
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
      <View className="relative flex h-full w-full flex-col">
        {/* Header with close button */}
        <View className="relative flex w-full flex-row items-center gap-4 px-6 py-4">
          <Pressable
            onPress={() => {
              // onError?.('Payment cancelled');
              SheetManager.hide('payment-webview-sheet');
            }}
            className="h-8 w-8 justify-center">
            <ArrowLeft size={24} color={'#B4B4BC'} />
          </Pressable>
          <Text className="flex-1 font-cabinet-bold text-lg text-[#1B1B1E]">Payment</Text>
        </View>

        {/* WebView Container */}
        <View className="flex-1">
          {authorizationUrl ? (
            <WebView
              ref={webViewRef}
              style={styles.container}
              source={{ uri: authorizationUrl }}
              startInLoadingState={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scrollEnabled={true}
              scalesPageToFit={true}
              nestedScrollEnabled={true}
              originWhitelist={['*']}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                onError?.(nativeEvent.description || 'Failed to load payment page');
              }}
              onNavigationStateChange={(state) => {
                if (state.url === authorizationUrl) return;

                if (state.url.includes(callbackUrl || '')) {
                  const reference = extractReferenceFromUrl(state.url);
                  console.log(state.url);
                  if (reference) {
                    onSuccess?.(reference);
                  }
                  SheetManager.hide('payment-webview-sheet');
                  return;
                }

                if (state.url === callbackUrl) {
                  const reference = extractReferenceFromUrl(state.url);
                  console.log(state.url);
                  if (reference) {
                    onSuccess?.(reference);
                  }
                  SheetManager.hide('payment-webview-sheet');
                  return;
                }

                // Handle payment cancellation
                if (cancelUrl && state.url === cancelUrl) {
                  onError?.('Payment cancelled by user');
                  SheetManager.hide('payment-webview-sheet');
                  return;
                }
              }}
              androidLayerType="hardware"
            />
          ) : (
            <View className="flex flex-1 items-center justify-center">
              <Text className="text-[#B4B4BC]">No payment URL provided</Text>
            </View>
          )}
        </View>
      </View>
    </ActionSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
