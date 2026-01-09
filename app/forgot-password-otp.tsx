import * as React from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { OtpInput } from 'react-native-otp-entry';
import { useMutation } from '@tanstack/react-query';

import { Text } from '@/components/ui/text';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { useTimer } from '@/hooks/use-timer';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

import { api } from '@/api';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';

export default function Screen() {
  const { email }: { email: string } = useLocalSearchParams();

  const [otpDisabled, setOTPDisabled] = React.useState(false);
  const [timer, setTimer] = React.useState(60);
  const { minute, seconds } = useTimer({ sec: timer });

  const verifyCode = useMutation({
    ...api.verifyAccount(),
    onMutate: () => {
      setOTPDisabled(true);
    },
    onError: (err) => {
      showErrorMessage(err.message);
    },
    onSettled: () => {
      setOTPDisabled(false);
    },
  });

  const resendVerificationCode = useMutation({
    ...api.resendVerificationCode(),
    onSuccess: (data) => {
      showSuccessMessage('OTP sent to your email successfully.');
    },
    onError: (err) => {
      showErrorMessage(err.message);
    },
  });

  const handleOnResendOTP = () => {
    if (Number(seconds) > 0) return;

    setTimer((prev) => prev + 30);

    resendVerificationCode.mutate({ type: 'email', email });
  };

  return (
    <Layout>
      <View className="flex-1 gap-6">
        <View className="flex gap-2">
          <AuthHeader title="Forgot password" />

          <Text className="text-center text-[#737381]">
            A verification code has been sent to{' '}
            {email && <Text className="text-center text-primary">{email}</Text>}
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
            onFilled={(value) => {
              verifyCode.mutate(
                { code: value, email },
                {
                  onSuccess: () => {
                    router.navigate({
                      pathname: '/new-password',
                      params: {
                        code: value,
                      },
                    });
                  },
                }
              );
            }}
          />
        </View>

        <View className="flex flex-row items-center justify-center gap-1.5">
          {verifyCode.isPending || resendVerificationCode.isPending ? (
            <LoadingIndicator size={24} />
          ) : Number(seconds) > 0 ? (
            <Text className="text-center text-[#737381]">
              Wait to request code in:{' '}
              <Text className="text-primary">
                {minute}:{seconds}
              </Text>
            </Text>
          ) : (
            <Text className="text-center text-[#737381]">
              <Pressable>
                <Text className="mx-1 leading-normal text-[#737381]">Haven’t gotten any code?</Text>
              </Pressable>

              <Pressable onPress={handleOnResendOTP}>
                <Text className="leading-normal text-primary">Resend</Text>
              </Pressable>
            </Text>
          )}
        </View>
      </View>
    </Layout>
  );
}
