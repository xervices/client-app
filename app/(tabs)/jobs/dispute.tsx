import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Mail,
  MessageCircleMore,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
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
import { InputError } from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const formSchema = z.object({
  type: z.string().min(1, 'Issue type is required.'),
  reason: z.string().min(1, 'Please describe your concern.'),
});

const issuesData = [
  {
    id: '1',
    label: 'Work quality issues',
  },
  {
    id: '2',
    label: "Pro didn't show up",
  },
  {
    id: '3',
    label: 'Billing dispute',
  },
  {
    id: '4',
    label: 'Safety or conduct issues',
  },
  {
    id: '5',
    label: 'Other issues',
  },
];

export default function Screen() {
  const { id }: { id: string } = useLocalSearchParams();

  const { isLoading, refetch, data, isRefetching } = useQuery(api.getJobDetail(id));

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 24,
    right: 24,
  };

  const form = useForm({
    defaultValues: {
      type: '',
      reason: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <Layout
      useBackground
      isRefreshing={isRefetching}
      onRefresh={refetch}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Dispute" />
        </View>
      }>
      {isLoading ? (
        <LoadingState title="Loading job detail..." />
      ) : (
        <View className="flex-1 gap-4">
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

                  <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                </View>

                <Text className="text-xs text-[#1B1B1E]">{data?.category?.name} Specialist</Text>

                <Text className="text-xs text-[#FF6A00]">4.9 ★ (145)</Text>
              </View>
            </View>

            <View className="flex w-1/2 justify-between">
              <Text className="text-right text-xs text-[#FF6A00]">JOB ID ● {id}</Text>

              <Text className="text-right font-cabinet-bold text-[18px] text-[#FF6A00]">
                {formatCurrency(data?.finalAmount)}
              </Text>
            </View>
          </View>

          <View className="flex w-full flex-row justify-between">
            <Text className="flex-1 text-sm text-[#737381]">Booking Date & Time</Text>

            <Text className="font-cabinet-bold text-sm text-[#737381]">
              {formatDateTime(data?.createdAt)}
            </Text>
          </View>

          <form.Field name="type">
            {(field) => (
              <View>
                <Select>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue id="state" placeholder="Select Issues Type" />
                  </SelectTrigger>
                  <SelectContent
                    insets={contentInsets}
                    className="mt-2 w-full bg-white"
                    style={{ maxHeight: 300 }}>
                    <NativeSelectScrollView className="h-full">
                      <SelectGroup>
                        <SelectLabel>Issues Type</SelectLabel>
                        {issuesData.map((type) => (
                          <SelectItem
                            onPress={() => {
                              field.handleChange(type.label);
                            }}
                            key={type.id}
                            label={type.label}
                            value={type.label}>
                            {type.label}
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

          <form.Field name="reason">
            {(field) => (
              <View>
                <Label nativeID="reason">Describe your concern</Label>
                <Textarea
                  className="bg-white"
                  id="reason"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Clearly explain your issue"
                  hasError={!field.state.meta.isValid}
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <View>
            <Text className="font-cabinet-bold text-sm text-[#737381]">Add Photos or Videos</Text>

            <Text className="text-sm text-[#737381]">
              Photos and videos will help us resolve disputes faster
            </Text>

            <Text className="text-sm text-[#FFAC70]">
              Include photos of: The completed work, Any damage or poor quality and original job
              agreement/messages
            </Text>
          </View>

          <View className="flex flex-row flex-wrap gap-2">
            {new Array(4).fill(0).map((_, index) => (
              <View key={index} className="aspect-[56/46] w-14 overflow-hidden rounded-[4px]">
                <Image
                  source={require('@/assets/images/sample.png')}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              </View>
            ))}
          </View>

          <View className="flex aspect-[327/100] w-full items-center justify-center rounded-[8px] border-[2px] border-[#E9E9EB]">
            <Image
              source={require('@/assets/icons/camera-primary.svg')}
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />

            <Text className="text-center text-sm text-[#FE6A00]">Add Photos/Videos</Text>
            <Text className="text-center text-xs text-[#B4B4BC]">
              Tap to add photos of the issue
            </Text>
          </View>

          <Button onPress={form.handleSubmit}>Submit Dispute</Button>
        </View>
      )}
    </Layout>
  );
}
