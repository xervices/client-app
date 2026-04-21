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
import { emojiRegex, formatPhoneNumber } from '@/lib/utils';

const formSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Your fullname is required.')
      .refine((val) => !emojiRegex.test(val), 'Name cannot contain emojis.'),
    phoneNumber: z.string().min(1, 'Phone number is required.'),
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

  const form = useForm({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user' as const,
      referralCode: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const { confirmPassword, referralCode, ...registerData } = value;

      registerData.phoneNumber = formatPhoneNumber(registerData.phoneNumber);

      mutate(registerData, {
        onSuccess: () => {
          showSuccessMessage('Account created successfully');

          if (referralCode) {
            applyReferralCode?.mutate({ referralCode });
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

  return (
    <Layout useBackground>
      <View className="flex-1 gap-6">
        <View className="flex gap-2">
          <AuthHeader title="Get Started now" />

          <Text className="text-center text-[#737381]">
            Join thousands of satisfied customers using trusted pros.
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
                <Label nativeID="phone">Phone Number</Label>
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
              const hasUppercase = /[A-Z]/.test(password);
              const hasLowercase = /[a-z]/.test(password);
              const hasMinLength = password.length >= 6;

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
                    <View className="flex flex-row items-center gap-2">
                      <Text
                        className={
                          hasUppercase ? 'text-sm text-green-600' : 'text-sm text-gray-400'
                        }>
                        {hasUppercase ? '✓' : '○'}
                      </Text>
                      <Text
                        className={
                          hasUppercase ? 'text-sm text-green-600' : 'text-sm text-gray-400'
                        }>
                        Uppercase letter
                      </Text>
                    </View>
                    <View className="flex flex-row items-center gap-2">
                      <Text
                        className={
                          hasLowercase ? 'text-sm text-green-600' : 'text-sm text-gray-400'
                        }>
                        {hasLowercase ? '✓' : '○'}
                      </Text>
                      <Text
                        className={
                          hasLowercase ? 'text-sm text-green-600' : 'text-sm text-gray-400'
                        }>
                        Lowercase letter
                      </Text>
                    </View>
                    <View className="flex flex-row items-center gap-2">
                      <Text
                        className={
                          hasMinLength ? 'text-sm text-green-600' : 'text-sm text-gray-400'
                        }>
                        {hasMinLength ? '✓' : '○'}
                      </Text>
                      <Text
                        className={
                          hasMinLength ? 'text-sm text-green-600' : 'text-sm text-gray-400'
                        }>
                        Minimum 6 characters
                      </Text>
                    </View>
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
