import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Layout } from '@/components/layout';
import { useLocalSearchParams } from 'expo-router';
import { AuthHeader } from '@/components/auth-header';
import { OtpInput } from 'react-native-otp-entry';
import { useTimer } from '@/hooks/use-timer';

export default function Screen() {
  const { email } = useLocalSearchParams();

  const [otpDisabled, setOTPDisabled] = React.useState(false);
  const [timer, setTimer] = React.useState(60);
  const { minute, seconds } = useTimer({ sec: timer });

  const handleOnResendOTP = () => {
    if (Number(seconds) > 0) return;

    setTimer((prev) => prev + 30);
  };

  return (
    <Layout useBackground>
      <View className="flex-1 gap-6">
        <View className="flex gap-2">
          <AuthHeader title="Verify Email Address" />

          <Text className="text-center text-[#737381]">A verification code has been sent to</Text>

          {email && <Text className="text-center text-primary">{email}</Text>}

          <Text className="text-center text-[#737381]">
            Please check your email to retrieve the code and enter it here.
          </Text>
        </View>

        <View className="mt-16">
          <OtpInput
            numberOfDigits={4}
            theme={{
              pinCodeContainerStyle: {
                width: 60,
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
              setOTPDisabled(true);
              console.log(value);
            }}
          />
        </View>

        <View className="flex flex-row items-center justify-center gap-1.5">
          {Number(seconds) > 0 ? (
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
