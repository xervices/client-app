import { useState } from 'react';
import { Image } from 'expo-image';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';

import { Text } from './ui/text';
import { Button } from './ui/button';

import { showErrorMessage } from '@/api/helpers';
import { api } from '@/api';

export function GoogleSigninButton() {
  const { mutate, isPending } = useMutation(api.googleSignin());

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOnSignin = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();

      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;

        if (idToken) {
          mutate(
            { idToken },
            {
              onSuccess: () => {
                router.replace('/(tabs)/(home)');
              },
              onError: (err) => {
                showErrorMessage(err.message);
              },
            }
          );
        }
      } else {
        showErrorMessage('Google signin was cancelled!');
      }
    } catch (error) {
      console.log(error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            showErrorMessage('Google Signin is in progress!');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showErrorMessage('Google Play Services is not available on this device!');
            break;
          default:
            showErrorMessage(error.code);
            break;
        }
      } else {
        showErrorMessage('Something went wrong!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      onPress={handleOnSignin}
      className="border-[#B4B4BC] bg-[#F4F4F5]"
      loadingIndicatorColor="#B4B4BC"
      isLoading={isPending || isSubmitting}>
      <Image
        source={require('@/assets/icons/google.svg')}
        style={{ width: 18, height: 18 }}
        contentFit="contain"
      />

      <Text className="font-cabinet-extrabold text-[#737381]">Continue with Google</Text>
    </Button>
  );
}
