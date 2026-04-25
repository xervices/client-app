import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useForm } from '@tanstack/react-form';
import { router } from 'expo-router';
import * as z from 'zod';
import * as Haptics from 'expo-haptics';
import { useMutation } from '@tanstack/react-query';

import { Text } from '@/components/ui/text';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputError } from '@/components/ui/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { GoogleSigninButton } from '@/components/google-signin-button';
import { AppleSigninButton } from '@/components/apple-signin-button';

import { api } from '@/api';
import { showErrorMessage } from '@/api/helpers';
import { useAuthStore } from '@/store/auth-store';
import { formatPhoneNumber, getDeviceInfo } from '@/lib/utils';
import { SheetManager } from 'react-native-actions-sheet';

const formSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Email or Phone is required.')
    .refine(
      (val) => {
        const isEmail = val.includes('@');
        return isEmail ? val === val.toLowerCase() : true;
      },
      { message: 'Email must be lowercase.' }
    ),
  password: z.string().min(1, 'Password is required.'),
  deviceId: z.string(),
  deviceName: z.string(),
});

export default function Screen() {
  const { mutate, isPending } = useMutation({
    ...api.login(),
    onError: (err) => {
      showErrorMessage(err.message);
    },
  });

  const [checked, setChecked] = React.useState(false);

  function onCheckedChange(checked: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecked(checked);
  }

  const form = useForm({
    defaultValues: {
      emailOrPhone: '',
      password: '',
      deviceId: '',
      deviceName: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const deviceInfo = await getDeviceInfo();

      value.deviceId = deviceInfo?.deviceId || '';
      value.deviceName = deviceInfo?.deviceName || '';

      if (!value.emailOrPhone.includes('@')) {
        value.emailOrPhone = formatPhoneNumber(value.emailOrPhone);
      }

      mutate(value, {
        onSuccess: (res) => {
          if (!res.user.emailVerified) {
            router.navigate({
              pathname: '/verify-email',
              params: {
                email: value.emailOrPhone,
              },
            });
          } else if (res?.requiresDeviceVerification) {
            router.navigate({
              pathname: '/verify-device',
              params: {
                token: res?.deviceVerificationToken,
              },
            });
          } else {
            useAuthStore.getState().setLoginState(true);
          }
        },
      });
    },
  });

  return (
    <Layout useBackground>
      <View className="flex-1 gap-6">
        <View className="flex gap-2">
          <AuthHeader title="Login" />

          <Text className="text-center text-[#737381]">
            Enter your email and password to log in
          </Text>
        </View>

        <View className="flex gap-4">
          <form.Field name="emailOrPhone">
            {(field) => (
              <View>
                <Label nativeID="email">Email</Label>
                <Input
                  id="email"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your email"
                  hasError={!field.state.meta.isValid}
                  keyboardType="email-address"
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <View>
                <Label nativeID="password">Password</Label>
                <Input
                  id="password"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your password"
                  secureTextEntry
                  hasError={!field.state.meta.isValid}
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <Button onPress={form.handleSubmit} disabled={isPending} isLoading={isPending}>
            Log In
          </Button>
        </View>

        <View className="flex w-full flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Checkbox
              aria-labelledby="remember-me-checkbox"
              id="remember-me-checkbox"
              checked={checked}
              onCheckedChange={onCheckedChange}
            />
            <Label
              nativeID="remember-me-checkbox"
              htmlFor="remember-me-checkbox"
              className="text-sm"
              onPress={Platform.select({
                native: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setChecked((prev) => !prev);
                },
              })}>
              Remember me
            </Label>
          </View>

          <Pressable onPress={() => router.navigate('/forgot-password')}>
            <Text className="font-cabinet-medium text-sm text-primary">Forgot Password ?</Text>
          </Pressable>
        </View>

        <View className="flex w-full flex-row items-center justify-between gap-4">
          <View className="h-0.5 flex-1 bg-[#FFDCC1]" />

          <Text className="text-sm text-[#B4B4BC]">Or</Text>

          <View className="h-0.5 flex-1 bg-[#FFDCC1]" />
        </View>

        <GoogleSigninButton />

        <AppleSigninButton />

        <View className="flex flex-row items-center justify-center gap-1.5">
          <Text className="text-center text-[#737381]">
            Don’t have an account?{' '}
            <Text onPress={() => router.navigate('/register')} className="text-primary">
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </Layout>
  );
}
