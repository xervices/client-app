import * as React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';

import { Text } from '@/components/ui/text';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputError } from '@/components/ui/input-error';
import { GoogleSigninButton } from '@/components/google-signin-button';
import { AppleSigninButton } from '@/components/apple-signin-button';

import { api } from '@/api';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';
import { emojiRegex, formatPhoneNumber, getDeviceInfo } from '@/lib/utils';
import { getStableDeviceId } from '@/lib/app-install';
import { clearPendingReferral } from '@/lib/pending-referral';
import { useReferralStore } from '@/store/referral-store';
import { useAuthStore } from '@/store/auth-store';

const formSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Your fullname is required.')
      .refine((val) => !emojiRegex.test(val), 'Name cannot contain emojis.'),
    phoneNumber: z.string(),
    email: z
      .email('Invalid email address')
      .min(1, 'Email is required.')
      .refine(
        (val) => {
          const isEmail = val.includes('@');
          return isEmail ? val === val.toLowerCase() : true;
        },
        { message: 'Email must be lowercase.' }
      ),
    password: z
      .string()
      .min(1, 'Password is required.')
      .refine((val) => !/\s/.test(val), 'Password cannot contain spaces.')
      .refine((val) => !emojiRegex.test(val), 'Password cannot contain emojis.'),
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
    role: z.union([z.literal('user')]),
    referralCode: z.string(),
    deviceId: z.string(),
    deviceName: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function Screen() {
  const { mutate, isPending } = useMutation({
    ...api.register(),
    onError: (err) => {
      showErrorMessage(err.message);
    },
  });

  const applyReferralCode = useMutation(api.applyReferralCode());

  const pendingReferralCode = useReferralStore((s) => s.code);
  const clearReferralCode = useReferralStore((s) => s.clearCode);

  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const form = useForm({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user' as const,
      referralCode: '',
      deviceId: '',
      deviceName: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const deviceInfo = await getDeviceInfo();

      value.deviceId = await getStableDeviceId();
      value.deviceName = deviceInfo?.deviceName || '';

      const { confirmPassword, referralCode, ...registerData } = value;

      if (registerData.phoneNumber.trim()) {
        registerData.phoneNumber = formatPhoneNumber(registerData.phoneNumber);
      } else {
        // @ts-expect-error — phoneNumber is optional on the server after the App Store 5.1.1(v) fix
        delete registerData.phoneNumber;
      }

      mutate(registerData, {
        onSuccess: () => {
          showSuccessMessage('Account created successfully');

          if (referralCode) {
            applyReferralCode.mutate(
              { referralCode },
              {
                onSuccess: (data) => {
                  clearPendingReferral();
                  clearReferralCode();
                  if (data?.referrerName) {
                    showSuccessMessage(`Referred by ${data.referrerName}`);
                  }
                },
                onError: (err) => {
                  showErrorMessage(err.message);
                  // Leave the code pending on a network failure so it can
                  // retry; only clear it once the server has definitively
                  // rejected it.
                  if (!(err instanceof TypeError)) {
                    clearPendingReferral();
                    clearReferralCode();
                  }
                },
              }
            );
          }

          router.navigate({
            pathname: '/verify-email',
            params: {
              email: value.email,
            },
          });
        },
      });
    },
  });

  React.useEffect(() => {
    if (pendingReferralCode && !form.state.values.referralCode) {
      form.setFieldValue('referralCode', pendingReferralCode);
    }
  }, [pendingReferralCode]);

  // A referral deep link can drop a first-time user straight here, skipping
  // onboarding entirely. Getting this far counts as onboarded — otherwise the
  // screens this one hands off to (verify-email, terms, login) stay unmounted
  // behind the `hasCompletedOnboarding` guard in `_layout.tsx`.
  React.useEffect(() => {
    if (!hasCompletedOnboarding) completeOnboarding();
  }, [hasCompletedOnboarding, completeOnboarding]);

  return (
    <Layout useBackground>
      <View className="flex-1 gap-6">
        <View className="flex gap-2">
          <AuthHeader title="Get Started now" />

          <Text className="text-center text-[#737381]">
            Join thousands of satisfied customers using trusted pros.
          </Text>
        </View>

        <View className="rounded-xl border border-[#FFDCC1] bg-[#FFF6EE] px-4 py-3">
          <Text className="text-center text-sm leading-normal text-[#737381]">
            Creating an account helps us find artisans in your specific neighborhood and keeps our
            community safe.
          </Text>
        </View>

        <View className="flex gap-4">
          <form.Field name="fullName">
            {(field) => (
              <View>
                <Label nativeID="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your name"
                  hasError={!field.state.meta.isValid}
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <form.Field name="email">
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

          <form.Field name="phoneNumber">
            {(field) => (
              <View>
                <Label nativeID="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your phone number"
                  hasError={!field.state.meta.isValid}
                  keyboardType="phone-pad"
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const password = field.state.value;
              const requirements = [
                { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
                { label: 'Lowercase letter', met: /[a-z]/.test(password) },
                { label: 'Number', met: /[0-9]/.test(password) },
                { label: 'Special character (e.g. !@#$%)', met: /[^A-Za-z0-9.,]/.test(password) },
                { label: 'Minimum 8 characters', met: password.length >= 8 },
              ];

              return (
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

                  <View className="mt-2 gap-1">
                    {requirements.map(({ label, met }) => (
                      <View key={label} className="flex flex-row items-center gap-2">
                        <Text className={met ? 'text-sm text-green-600' : 'text-sm text-gray-400'}>
                          {met ? '✓' : '○'}
                        </Text>
                        <Text className={met ? 'text-sm text-green-600' : 'text-sm text-gray-400'}>
                          {label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {!field.state.meta.isValid ? (
                    <InputError errors={field.state.meta.errors} />
                  ) : null}
                </View>
              );
            }}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <View>
                <Label nativeID="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Confirm your password"
                  secureTextEntry
                  hasError={!field.state.meta.isValid}
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <form.Field name="referralCode">
            {(field) => (
              <View>
                <Label nativeID="referral">Referral Code (Optional)</Label>
                <Input
                  id="referral"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your referral code"
                  hasError={!field.state.meta.isValid}
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <Button onPress={form.handleSubmit} isLoading={isPending} disabled={isPending}>
            Get Started
          </Button>
        </View>

        <View className="flex flex-row items-center justify-between gap-4">
          <View className="h-0.5 flex-1 bg-[#FFDCC1]" />

          <Text className="text-sm text-[#B4B4BC]">Or</Text>

          <View className="h-0.5 flex-1 bg-[#FFDCC1]" />
        </View>

        <GoogleSigninButton />

        <AppleSigninButton />

        <View className="flex flex-row items-center justify-center gap-1.5">
          <Text className="text-center text-[#737381]">
            Already have an account?{' '}
            <Text onPress={() => router.navigate('/login')} className="text-primary">
              Log in
            </Text>
          </Text>
        </View>

        <View className="flex w-full flex-row flex-wrap items-center justify-center gap-1">
          <Text className="text-center leading-normal text-[#737381]">
            By creating an account, you agree to our applicable{' '}
            <Text onPress={() => router.navigate('/terms')} className="leading-normal text-primary">
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              onPress={() => router.navigate('/privacy')}
              className="leading-normal text-primary">
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </Layout>
  );
}
