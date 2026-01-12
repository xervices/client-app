import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ChevronRight, Mail, MessageCircleMore } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';

export default function Screen() {
  const { user } = useAuthStore();

  const { mutate, isPending } = useMutation(api.forgotPassword());

  const [selectedOption, setSelectedOption] = React.useState('');

  return (
    <Layout
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Password" />
        </View>
      }>
      <View className="flex-1 gap-6">
        <View className="flex items-center justify-center">
          <Text className="text-center font-cabinet-bold text-[#1B1B1E]">Reset Password</Text>
          <Text className="text-center text-sm text-[#B4B4BC]">
            Select the contact details we can use to reset your password
          </Text>
        </View>

        {user?.phoneNumber && user?.phoneVerified && (
          <Pressable
            onPress={() => setSelectedOption(user.phoneNumber)}
            className={`flex w-full flex-row items-center gap-4 rounded-[8px] border p-4 ${selectedOption === user?.phoneNumber ? 'border-[#FE6A00]' : 'border-[#B4B4BC]'}`}>
            <View
              className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedOption === user?.phoneNumber ? 'bg-[#FFE6D6]' : 'bg-[#DFDFE1]'}`}>
              <MessageCircleMore
                size={16}
                color={selectedOption === user?.phoneNumber ? '#FE6A00' : '#737381'}
              />
            </View>

            <View className="flex-1">
              <Text className="text-sm text-[#737381]">Via Sms</Text>
              <Text
                className={`text-lg ${selectedOption === user?.phoneNumber ? 'text-[#1B1B1E]' : 'text-[#737381]'} font-cabinet-bold`}>
                {user?.phoneNumber}
              </Text>
            </View>
          </Pressable>
        )}

        {user?.email && (
          <Pressable
            onPress={() => setSelectedOption(user?.email)}
            className={`flex w-full flex-row items-center gap-4 rounded-[8px] border p-4 ${selectedOption === user?.email ? 'border-[#FE6A00]' : 'border-[#B4B4BC]'}`}>
            <View
              className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedOption === user?.email ? 'bg-[#FFE6D6]' : 'bg-[#DFDFE1]'}`}>
              <Mail size={16} color={selectedOption === user?.email ? '#FE6A00' : '#737381'} />
            </View>

            <View className="flex-1">
              <Text className="text-sm text-[#737381]">Via Email</Text>
              <Text
                className={`text-lg ${selectedOption === user?.email ? 'text-[#1B1B1E]' : 'text-[#737381]'} font-cabinet-bold`}>
                {user?.email}
              </Text>
            </View>
          </Pressable>
        )}

        <Button
          onPress={() => {
            if (selectedOption) {
              mutate(
                { emailOrPhone: selectedOption },
                {
                  onSuccess: (res) => {
                    showSuccessMessage(res.message);

                    router.navigate({
                      pathname: '/profile/password-otp',
                      params: {
                        email: selectedOption,
                      },
                    });
                  },
                  onError: (err) => {
                    showErrorMessage(err.message);
                  },
                }
              );
            }
          }}
          className="mt-auto"
          isLoading={isPending}
          disabled={!selectedOption || isPending}>
          Continue
        </Button>
      </View>
    </Layout>
  );
}
