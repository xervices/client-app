import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ChevronRight, Mail, MessageCircleMore } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { toast } from 'sonner-native';
import { SheetManager } from 'react-native-actions-sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';

const formSchema = z
  .object({
    password: z.string().min(1, 'Password is required.'),
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function Screen() {
  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast.success('Password reset successful');
      SheetManager.show('success-sheet', {
        payload: {
          title: 'Password changed successfully',
          subtitle:
            'Your account is ready to use. You will be redirected to the home page shortly.',
          hideBackButton: true,
        },
      });
    },
  });

  return (
    <Layout
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Create new password" />
        </View>
      }>
      <View className="flex-1 gap-6">
        <View className="flex items-center justify-center">
          <Text className="text-center text-sm text-[#737381]">
            Please enter a password you can remember. Using special characters is advisable.
          </Text>
        </View>

        <View className="flex gap-4">
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
                  className="bg-white"
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
                  className="bg-white"
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <Button className="mt-6" onPress={form.handleSubmit}>
            Continue
          </Button>
        </View>
      </View>
    </Layout>
  );
}
