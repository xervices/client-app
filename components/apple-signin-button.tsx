import { useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Apple } from 'lucide-react-native';

import { Text } from './ui/text';
import { Button } from './ui/button';

import { showErrorMessage } from '@/api/helpers';
import { api } from '@/api';
import { Image } from 'expo-image';

const APPLE_SERVICE_CLIENT_ID = 'com.xervices.client.services';
const APPLE_REDIRECT_URI = 'https://api.getxervices.com/auth/apple/callback';

export function AppleSigninButton() {
  const { mutate, isPending } = useMutation(api.appleSignin());

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (Platform.OS === 'android' && !appleAuthAndroid.isSupported) {
    return null;
  }

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return null;
  }

  const submit = (identityToken: string, firstName?: string, lastName?: string) => {
    mutate(
      {
        identityToken,
        platform: Platform.OS === 'android' ? 'android' : 'ios',
        firstName,
        lastName,
      },
      {
        onSuccess: () => {
          router.replace('/(tabs)/(home)');
        },
        onError: (err) => {
          showErrorMessage(err.message);
        },
      }
    );
  };

  const handleIosSignin = async () => {
    try {
      setIsSubmitting(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken, fullName } = credential;

      if (!identityToken) {
        showErrorMessage('Apple signin failed: missing identity token.');
        return;
      }

      submit(identityToken, fullName?.givenName ?? undefined, fullName?.familyName ?? undefined);
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED') {
        showErrorMessage('Apple signin was cancelled!');
      } else {
        showErrorMessage(error?.message ?? 'Something went wrong!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAndroidSignin = async () => {
    try {
      setIsSubmitting(true);

      const rawNonce = Crypto.randomUUID();
      const state = Crypto.randomUUID();

      appleAuthAndroid.configure({
        clientId: APPLE_SERVICE_CLIENT_ID,
        redirectUri: APPLE_REDIRECT_URI,
        responseType: appleAuthAndroid.ResponseType.ALL,
        scope: appleAuthAndroid.Scope.ALL,
        nonce: rawNonce,
        state,
      });

      const response = await appleAuthAndroid.signIn();

      if (!response.id_token) {
        showErrorMessage('Apple signin failed: missing identity token.');
        return;
      }

      submit(
        response.id_token,
        response.user?.name?.firstName ?? undefined,
        response.user?.name?.lastName ?? undefined
      );
    } catch (error: any) {
      if (error?.message === appleAuthAndroid.Error.SIGNIN_CANCELLED) {
        showErrorMessage('Apple signin was cancelled!');
      } else if (error?.message === appleAuthAndroid.Error.SIGNIN_FAILED) {
        showErrorMessage('Apple signin failed. Please try again.');
      } else if (error?.message === appleAuthAndroid.Error.NOT_CONFIGURED) {
        showErrorMessage('Apple signin is not configured.');
      } else {
        showErrorMessage(error?.message ?? 'Something went wrong!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnSignin = Platform.OS === 'ios' ? handleIosSignin : handleAndroidSignin;

  const loading = isPending || isSubmitting;

  return (
    <Button
      onPress={handleOnSignin}
      className="border-black bg-black-1"
      loadingIndicatorColor="#ffffff"
      isLoading={loading}
      disabled={loading}>
      <Image
        source={require('@/assets/icons/apple.svg')}
        style={{ width: 18, height: 18 }}
        contentFit="contain"
      />

      <Text className="font-cabinet-extrabold text-white">Continue with Apple</Text>
    </Button>
  );
}
