import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react-native';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import * as z from 'zod';
import { useForm } from '@tanstack/react-form';
import { InputError } from '@/components/ui/input-error';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';
import { router } from 'expo-router';

const formSchema = z.object({
  rating: z.number().min(1, 'Rating is required.'),
  feedback: z.string().min(1, 'Feedback is required.'),
});

export default function Screen() {
  const { data, isLoading, refetch } = useQuery(api.getMyAppRatings());
  const { mutate, isPending } = useMutation(api.submitAppRating());

  const form = useForm({
    defaultValues: {
      // @ts-ignore
      rating: data?.data?.rating || 0,
      // @ts-ignore
      feedback: data?.data?.feedback || '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(
        {
          rating: value.rating,
          feedback: value.feedback,
          appVersion: Application.nativeApplicationVersion || undefined,
          deviceInfo: {
            os: Device.osName as never,
            version: Device.osVersion as never,
            model: Device.modelName as never,
          },
        },
        {
          onSuccess: () => {
            showSuccessMessage('Rating submitted successfully!');
            refetch();
            router.back();
          },
          onError: (err) => {
            showErrorMessage(err.message);
          },
        }
      );
    },
  });

  return (
    <Layout
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Rate Xervices" />
        </View>
      }>
      {isLoading ? (
        <LoadingState title="Getting things ready" />
      ) : (
        <View className="flex-1 gap-6">
          <View className="flex gap-2">
            <Text className="text-center font-cabinet-bold text-[#737381]">
              Please rate your experience
            </Text>

            <Text className="text-center text-sm text-[#737381]">We’d love to hear from you!</Text>
          </View>

          <View className="flex gap-10">
            <form.Field name="rating">
              {(field) => (
                <View>
                  <View className="flex flex-row items-center justify-center gap-4">
                    {new Array(5).fill(0).map((_, index) => (
                      <Pressable onPress={() => field.handleChange(index + 1)} key={index}>
                        <Star
                          fill={index >= field.state.value ? '#DFDFE1' : '#FF9445'}
                          size={28}
                          stroke={index >= field.state.value ? '#DFDFE1' : '#FF9445'}
                        />
                      </Pressable>
                    ))}
                  </View>
                  <View className="flex flex-row items-center justify-center">
                    {!field.state.meta.isValid ? (
                      <InputError errors={field.state.meta.errors} />
                    ) : null}
                  </View>
                </View>
              )}
            </form.Field>

            <form.Field name="feedback">
              {(field) => (
                <View>
                  <Label nativeID="comment">Add a comment</Label>
                  <Textarea
                    className="bg-white"
                    id="comment"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    placeholder="Enter your feedback"
                    hasError={!field.state.meta.isValid}
                  />
                  {!field.state.meta.isValid ? (
                    <InputError errors={field.state.meta.errors} />
                  ) : null}
                </View>
              )}
            </form.Field>
          </View>

          <Button
            onPress={form.handleSubmit}
            isLoading={isPending}
            disabled={isPending}
            className="mt-auto">
            Submit Review
          </Button>
        </View>
      )}
    </Layout>
  );
}
