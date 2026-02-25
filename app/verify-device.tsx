import * as React from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { OtpInput } from 'react-native-otp-entry';
import { useMutation } from '@tanstack/react-query';
import { SheetManager } from 'react-native-actions-sheet';

import { Text } from '@/components/ui/text';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useTimer } from '@/hooks/use-timer';

import { api } from '@/api';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';
import { useAuthStore } from '@/store/auth-store';
import { getDeviceInfo } from '@/lib/utils';

export default function Screen() {
  const { token }: { token: string } = useLocalSearchParams();

  const [otpDisabled, setOTPDisabled] = React.useState(false);
  //   const [timer, setTimer] = React.useState(0);
  //   const { minute, seconds } = useTimer({ sec: timer });

  const verifyDevice = useMutation({
    ...api.verifyDevice(),
    onMutate: () => {
      setOTPDisabled(true);
    },
    onSuccess: (data) => {
      SheetManager.show('success-sheet', {
        payload: {
          title: 'Welcome',
          subtitle:
            'Your device has been verified successfully. You will be redirected to the home page shortly.',
          onRedirect: () => {
            useAuthStore.getState().setLoginState(true);
            router.replace('/(tabs)/(home)');
          },
        },
      });
    },
    onError: (err) => {
      showErrorMessage(err.message);
    },
    onSettled: () => [setOTPDisabled(false)],
  });

  return (
    <Layout useBackground>
      <View className="flex-1 gap-6">
        <View className="flex gap-2">
          <AuthHeader title="Verify New Device" />

          <Text className="text-center text-[#737381]">
            A verification code has been sent to email
          </Text>

          <Text className="text-center text-[#737381]">
            Please check your email to retrieve the code and enter it here.
          </Text>
        </View>

        <View className="mt-16">
          <OtpInput
            numberOfDigits={6}
            theme={{
              pinCodeContainerStyle: {
                width: 45,
                aspectRatio: 1 / 1,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#C8C8CF',
              },
              focusStickStyle: {
                backgroundColor: '#FE6A00',
              },
              focusedPinCodeContainerStyle: {
                borderColor: '#FE6A00',
              },
              pinCodeTextStyle: {
                fontSize: 24,
                color: '#1B1B1E',
                fontFamily: 'CabinetGrotesk-Bold',
              },
            }}
            disabled={otpDisabled}
            onFilled={async (value) => {
              const deviceInfo = await getDeviceInfo();

              const deviceId = deviceInfo?.deviceId || '';
              const deviceName = deviceInfo?.deviceName || '';

              verifyDevice.mutate({ code: value, token, deviceId, deviceName });
            }}
          />
        </View>

        <View className="flex flex-row items-center justify-center gap-1.5">
          {verifyDevice.isPending ? <LoadingIndicator size={24} /> : null}
        </View>
      </View>
    </Layout>
  );
}
