import { Pressable, StyleSheet, View } from 'react-native';
import React, { useRef, useCallback } from 'react';
import { Text } from '../ui/text';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { X } from 'lucide-react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

export interface PaystackWebviewPayload {
  authorizationUrl: string;
  callbackUrl?: string;
  cancelUrl?: string;
  onSuccess?: (reference: string) => void;
  onError?: (errorMessage: string) => void;
}

export function PaystackWebviewSheet(props: SheetProps<'paystack-webview-sheet'>) {
  const webViewRef = useRef<WebView>(null);

  const payload = props.payload as PaystackWebviewPayload | undefined;
  const authorizationUrl = payload?.authorizationUrl || '';
  const callbackUrl = payload?.callbackUrl;
  const cancelUrl = payload?.cancelUrl || '"https://standard.paystack.co/close"';
  const onSuccess = payload?.onSuccess;
  const onError = payload?.onError;

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const { url } = navState;

      if (!url) return;

      // Handle successful payment - redirect to callback URL
      if (callbackUrl && url === callbackUrl) {
        // Extract reference from URL if present
        const reference = extractReferenceFromUrl(url);
        if (reference) {
          onSuccess?.(reference);
        }
        SheetManager.hide('paystack-webview-sheet');
        return;
      }

      // Handle 3DS close redirect
      if (url === 'https://standard.paystack.co/close') {
        // Check if payment was successful by verifying the transaction
        // For now, we'll treat this as successful and let the backend verify
        onSuccess?.('');
        SheetManager.hide('paystack-webview-sheet');
        return;
      }

      // Handle payment cancellation
      if (cancelUrl && url === cancelUrl) {
        onError?.('Payment cancelled by user');
        SheetManager.hide('paystack-webview-sheet');
        return;
      }
    },
    [callbackUrl, cancelUrl, onSuccess, onError]
  );

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
        onError?.('Payment cancelled');
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
      <View className="relative flex h-full w-full flex-col">
        {/* Header with close button */}
        <View className="relative flex w-full flex-row items-center justify-between border-b border-[#F1F1F1] px-6 py-4">
          <Text className="text-lg font-semibold">Payment</Text>
          <Pressable
            onPress={() => {
              onError?.('Payment cancelled');
              SheetManager.hide('paystack-webview-sheet');
            }}
            className="h-8 w-8 items-center justify-center">
            <X size={24} color={'#B4B4BC'} />
          </Pressable>
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
                  SheetManager.hide('paystack-webview-sheet');
                  return;
                }

                if (state.url === callbackUrl) {
                  const reference = extractReferenceFromUrl(state.url);
                  console.log(state.url);
                  if (reference) {
                    onSuccess?.(reference);
                  }
                  SheetManager.hide('paystack-webview-sheet');
                  return;
                }

                // Handle payment cancellation
                if (cancelUrl && state.url === cancelUrl) {
                  onError?.('Payment cancelled by user');
                  SheetManager.hide('paystack-webview-sheet');
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
