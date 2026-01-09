import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SheetManager } from 'react-native-actions-sheet';
import {
  NativeSelectScrollView,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api';
import { showErrorMessage } from '@/api/helpers';

export const TICKET_CATEGORIES = ['feedback', 'technical', 'billing', 'general', 'other'] as const;

const formSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  category: z.enum(TICKET_CATEGORIES),
  message: z.string().min(1, 'Message is required.'),
});

export default function Screen() {
  const { mutate, isPending } = useMutation(api.createSupportTicket());

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 24,
    right: 24,
  };

  const form = useForm({
    defaultValues: {
      subject: '',
      category: '',
      message: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      // @ts-ignore
      mutate(value, {
        onSuccess: () => {
          SheetManager.show('success-sheet', {
            payload: {
              subtitle:
                'Your complaint has been sent successfully. You will receive confirmation via email shortly.',
              title: 'Complaint sent successfully',
              useCheckImage: true,
              onRedirect: () => router.back(),
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
    <Layout
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Support" />
        </View>
      }>
      <View className="flex-1 gap-6">
        <Text className="text-center text-sm text-[#737381]">
          Have a concern or problem, how can we help you?
        </Text>

        <View className="flex gap-4">
          <form.Field name="subject">
            {(field) => (
              <View>
                <Label nativeID="subject">Subject</Label>
                <Input
                  className="bg-white"
                  id="subject"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter the Subject"
                  hasError={!field.state.meta.isValid}
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <form.Field name="category">
            {(field) => (
              <View>
                <Label nativeID="category">Category</Label>

                <Select>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue id="state" placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent
                    insets={contentInsets}
                    className="mt-2 w-full bg-white"
                    style={{ maxHeight: 300 }}>
                    <NativeSelectScrollView className="h-full">
                      <SelectGroup>
                        <SelectLabel>Category</SelectLabel>
                        {TICKET_CATEGORIES.map((cat) => (
                          <SelectItem
                            onPress={() => {
                              field.handleChange(cat);
                            }}
                            key={cat}
                            label={cat}
                            value={cat}
                            className="capitalize">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </NativeSelectScrollView>
                  </SelectContent>
                </Select>

                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <form.Field name="message">
            {(field) => (
              <View>
                <Label nativeID="message">Message</Label>
                <Textarea
                  className="bg-white"
                  id="message"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your message"
                  hasError={!field.state.meta.isValid}
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>
        </View>

        <Button className="mt-auto" onPress={form.handleSubmit} isLoading={isPending}>
          Submit
        </Button>
      </View>
    </Layout>
  );
}
