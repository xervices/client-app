import * as React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { SheetManager } from 'react-native-actions-sheet';

import { Text } from '@/components/ui/text';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputError } from '@/components/ui/input-error';

import { api } from '@/api';
import { showErrorMessage } from '@/api/helpers';

const formSchema = z
  .object({
    token: z.string().min(1, 'OTP is required.'),
    newPassword: z.string().min(1, 'Password is required.'),
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function Screen() {
  const { code }: { code: string } = useLocalSearchParams();

  const { mutate, isPending } = useMutation(api.resetPassword());

  const form = useForm({
    defaultValues: {
      token: code,
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const { confirmPassword, ...data } = value;

      mutate(data, {
        onSuccess: () => {
          SheetManager.show('success-sheet', {
            payload: {
              title: 'Password changed successfully',
              subtitle:
                'Your account is ready to use. You will be redirected to the login page shortly.',
              hideBackButton: true,
              onRedirect: () => router.replace('/login'),
            },
          });
        },
        onError: (err) => {
          showErrorMessage(err.message);
        },
      });
    },
  });

  return (
    <Layout>
      <View className="flex-1 gap-6">
        <View className="flex gap-2">
          <AuthHeader title="Create new password" />

          <Text className="text-center text-[#737381]">
            Please enter a password you can remember. Using special characters is advisable.
          </Text>
        </View>

        <View className="flex gap-4">
          <form.Field name="newPassword">
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

          <Button
            className="mt-6"
            onPress={form.handleSubmit}
            isLoading={isPending}
            disabled={isPending}>
            Continue
          </Button>
        </View>
      </View>
    </Layout>
  );
}
