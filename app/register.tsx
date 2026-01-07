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

import { api } from '@/api';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';

const formSchema = z
  .object({
    fullName: z.string().min(1, 'Your fullname is required.'),
    phoneNumber: z.string().min(1, 'Phone number is required.'),
    email: z.email('Invalid email address').min(1, 'Email is required.'),
    password: z.string().min(1, 'Password is required.'),
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
    role: z.union([z.literal('user')]),
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

  const form = useForm({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user' as const,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const { confirmPassword, ...registerData } = value;

      mutate(registerData, {
        onSuccess: () => {
          showSuccessMessage('Account created successfully');

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

          <Button onPress={form.handleSubmit} isLoading={isPending}>
            Get Started
          </Button>
        </View>

        <View className="flex flex-row items-center justify-between gap-4">
          <View className="h-0.5 flex-1 bg-[#FFDCC1]" />

          <Text className="text-sm text-[#B4B4BC]">Or</Text>

          <View className="h-0.5 flex-1 bg-[#FFDCC1]" />
        </View>

        <GoogleSigninButton />

        <View className="flex flex-row items-center justify-center gap-1.5">
          <Text className="text-[#737381]">Already have an account?</Text>

          <Pressable onPress={() => router.navigate('/login')}>
            <Text className="text-primary">Log in</Text>
          </Pressable>
        </View>

        <View className="flex flex-row items-center justify-center gap-1.5">
          <Text className="text-center text-[#737381]">
            <Pressable>
              <Text className="mx-1 leading-normal text-[#737381]">
                By creating an account, you agree to our
              </Text>
            </Pressable>

            <Pressable onPress={() => router.navigate('/terms')}>
              <Text className="leading-normal text-primary">Terms of Service</Text>
            </Pressable>
            <Pressable>
              <Text className="mx-1 leading-normal text-[#737381]">and</Text>
            </Pressable>
            <Pressable onPress={() => router.navigate('/privacy')}>
              <Text className="leading-normal text-primary">Privacy Policy</Text>
            </Pressable>
          </Text>
        </View>
      </View>
    </Layout>
  );
}
