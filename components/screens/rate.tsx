import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Mail,
  MessageCircleMore,
  Star,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import { formatCurrency } from '@/lib/utils';
import * as z from 'zod';
import { useForm } from '@tanstack/react-form';
import { InputError } from '@/components/ui/input-error';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';

const formSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required.'),
  punctualityRating: z.number().min(1, 'Punctuality Rating is required.'),
  communicationRating: z.number().min(1, 'Communication Rating is required.'),
  qualityRating: z.number().min(1, 'Quality Rating is required.'),
  comment: z.string(),
});

export function RateScreen() {
  const { id }: { id: string } = useLocalSearchParams();

  const { isLoading, data, refetch, isRefetching } = useQuery(api.getJobDetail(id));

  const { mutate, isPending } = useMutation(api.createReview());

  const form = useForm({
    defaultValues: {
      jobId: id,
      punctualityRating: 0,
      communicationRating: 0,
      qualityRating: 0,
      comment: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value, {
        onSuccess: (res) => {
          showSuccessMessage('Review submitted.');
          router.replace('/(tabs)/(home)');
        },
        onError: (err) => {
          showErrorMessage(err?.message);
        },
      });
    },
  });

  return (
    <Layout
      useBackground
      isRefreshing={isRefetching}
      onRefresh={refetch}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Rate Your Experience" />
        </View>
      }>
      {isLoading ? (
        <LoadingState title="Loading job..." />
      ) : (
        <View className="flex-1 gap-6">
          <View className="flex gap-4">
            <View className="flex flex-row">
              <View className="flex h-[26px] items-center justify-center rounded-full bg-[#EFFBF1] px-3">
                <Text className="text-sm text-[#1C752E]">Completed</Text>
              </View>
            </View>

            <View className="flex w-full flex-row">
              <View className="flex w-1/2 flex-row items-center gap-2">
                <Avatar alt="User's Avatar" className="h-14 w-14">
                  <AvatarImage source={{ uri: data?.artisan?.profile?.avatarUrl }} />
                  <AvatarFallback className="bg-primary">
                    <Text className="font-cabinet-bold text-xs uppercase leading-none">
                      {data?.artisan?.profile?.fullName?.substring(0, 2)}
                    </Text>
                  </AvatarFallback>
                </Avatar>

                <View>
                  <View className="flex flex-row items-center">
                    <Text className="font-cabinet-bold text-[18px] text-[#1B1B1E]">
                      {data?.artisan?.profile?.fullName}
                    </Text>

                    {data?.artisan?.profileVerified ? (
                      <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                    ) : null}
                  </View>

                  <Text className="text-xs text-[#1B1B1E]">{data?.category?.name} Specialist</Text>

                  <Text className="text-xs text-[#FF6A00]">4.9 ★ (145)</Text>
                </View>
              </View>

              <View className="flex w-1/2 justify-between">
                {/* <Text className="text-right text-xs text-[#FF6A00]">JOB ID ● {id}</Text> */}

                <Text className="text-right font-cabinet-bold text-[18px] text-[#FF6A00]">
                  {formatCurrency(data?.finalAmount)}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex gap-4">
            <View className="flex gap-2">
              <View>
                <Text className="font-cabinet-bold text-sm text-[#737381]">
                  Rate {data?.artisan?.profile?.fullName}'s Work
                </Text>
                <Text className="text-sm text-[#737381]">
                  Your detailed review helps the community and affects Trust Score
                </Text>
              </View>

              <View className="gap-4 rounded-[16px] border border-[#E9E9EB] p-4">
                <form.Field name="qualityRating">
                  {(field) => (
                    <View>
                      <Text className="text-sm text-[#1B1B1E]">Quality of Work</Text>

                      <View className="flex flex-row items-center gap-4">
                        {new Array(5).fill(0).map((_, index) => (
                          <Pressable onPress={() => field.handleChange(index + 1)} key={index}>
                            <Star
                              fill={index >= field.state.value ? '#DFDFE1' : '#FF9445'}
                              size={24}
                              stroke={index >= field.state.value ? '#DFDFE1' : '#FF9445'}
                            />
                          </Pressable>
                        ))}
                      </View>

                      <View className="flex flex-row">
                        {!field.state.meta.isValid ? (
                          <InputError errors={field.state.meta.errors} />
                        ) : null}
                      </View>
                    </View>
                  )}
                </form.Field>

                <form.Field name="punctualityRating">
                  {(field) => (
                    <View>
                      <Text className="text-sm text-[#1B1B1E]">Punctuality</Text>

                      <View className="flex flex-row items-center gap-4">
                        {new Array(5).fill(0).map((_, index) => (
                          <Pressable onPress={() => field.handleChange(index + 1)} key={index}>
                            <Star
                              fill={index >= field.state.value ? '#DFDFE1' : '#FF9445'}
                              size={24}
                              stroke={index >= field.state.value ? '#DFDFE1' : '#FF9445'}
                            />
                          </Pressable>
                        ))}
                      </View>

                      <View className="flex flex-row">
                        {!field.state.meta.isValid ? (
                          <InputError errors={field.state.meta.errors} />
                        ) : null}
                      </View>
                    </View>
                  )}
                </form.Field>

                <form.Field name="communicationRating">
                  {(field) => (
                    <View>
                      <Text className="text-sm text-[#1B1B1E]">Communication</Text>

                      <View className="flex flex-row items-center gap-4">
                        {new Array(5).fill(0).map((_, index) => (
                          <Pressable onPress={() => field.handleChange(index + 1)} key={index}>
                            <Star
                              fill={index >= field.state.value ? '#DFDFE1' : '#FF9445'}
                              size={24}
                              stroke={index >= field.state.value ? '#DFDFE1' : '#FF9445'}
                            />
                          </Pressable>
                        ))}
                      </View>

                      <View className="flex flex-row">
                        {!field.state.meta.isValid ? (
                          <InputError errors={field.state.meta.errors} />
                        ) : null}
                      </View>
                    </View>
                  )}
                </form.Field>
              </View>
            </View>

            <form.Field name="comment">
              {(field) => (
                <View>
                  <Label nativeID="comment">Add a comment (optional)</Label>
                  <Textarea
                    className="bg-white"
                    id="comment"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    placeholder="Enter your comment"
                    hasError={!field.state.meta.isValid}
                  />
                  {!field.state.meta.isValid ? (
                    <InputError errors={field.state.meta.errors} />
                  ) : null}
                </View>
              )}
            </form.Field>
          </View>

          <Button isLoading={isPending} disabled={isPending} onPress={form.handleSubmit}>
            Submit Review
          </Button>
        </View>
      )}
    </Layout>
  );
}
