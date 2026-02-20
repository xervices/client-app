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
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useCameraPermissions } from 'expo-camera';
import { UploadedMedia } from '@/components/uploaded-media';
import { SheetManager } from 'react-native-actions-sheet';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';

const formSchema = z.object({
  jobId: z.string(),
  disputeType: z.string().min(1, 'Issue type is required.'),
  description: z.string().min(1, 'Please describe your concern.'),
});

const issuesData = [
  {
    id: '1',
    label: 'Behaviour',
    value: 'behavior',
  },
  {
    id: '2',
    label: 'Payment Issue',
    value: 'payment',
  },
  {
    id: '3',
    label: 'Service Quality',
    value: 'service_quality',
  },
  {
    id: '4',
    label: 'Cancellation',
    value: 'cancellation',
  },
  {
    id: '5',
    label: 'Other issues',
    value: 'other',
  },
];

export function CreateDisputeScreen() {
  const { id }: { id: string } = useLocalSearchParams();

  const { isLoading, refetch, data, isRefetching } = useQuery(api.getJobDetail(id));

  const jobs = useQuery(api.getUserJobs());

  const { mutate, isPending } = useMutation(api.createDispute());

  const [permission] = useCameraPermissions();
  const [showPermissionModal, setShowPermissionModal] = React.useState(false);

  const [media, setMediaSrcs] = React.useState<
    { url: string; mimeType: string; isVideo?: boolean }[]
  >([]);

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 24,
    right: 24,
  };

  const form = useForm({
    defaultValues: {
      jobId: id,
      disputeType: '',
      description: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const data = { ...value, media };

      // @ts-ignore
      mutate(data, {
        onSuccess: (res) => {
          jobs?.refetch();
          showSuccessMessage('Dispute created successfully');
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

                <Text className="text-xs text-[#FF6A00]">
                  {data?.artisanRating} ★ ({data?.artisanReviewCount})
                </Text>
              </View>
            </View>

            <View className="flex w-1/2 justify-between">
              <View className="flex flex-row justify-end">
                <View className="flex flex-row items-center justify-center rounded-full bg-[#FFEAED] px-5 py-1.5">
                  <Text className="text-xs leading-none text-[#8C0317]">Dispute</Text>
                </View>
              </View>

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

          <form.Field name="disputeType">
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
                              field.handleChange(type.value);
                            }}
                            key={type.id}
                            label={type.label}
                            value={type.value}>
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

          <form.Field name="description">
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
            {media?.map((item) => (
              <UploadedMedia
                key={item.url}
                url={item.url}
                onDelete={() =>
                  SheetManager.show('delete-image-sheet', {
                    payload: {
                      onDelete() {
                        setMediaSrcs((prev) => prev.filter((media) => media.url !== item.url));
                      },
                    },
                  })
                }
                type={item.isVideo ? 'video' : 'photo'}
              />
            ))}
          </View>

          <Pressable
            onPress={() => {
              if (permission?.granted) {
                SheetManager.show('camera-sheet', {
                  payload: {
                    onSelect(value) {
                      setMediaSrcs((prev) => {
                        return [...prev, value];
                      });
                    },
                  },
                });
              } else {
                setShowPermissionModal(true);
              }
            }}
            className="flex aspect-[327/100] w-full items-center justify-center rounded-[8px] border-[2px] border-[#E9E9EB]">
            <Image
              source={require('@/assets/icons/camera-primary.svg')}
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />

            <Text className="text-center text-sm text-[#FE6A00]">Add Photos/Videos</Text>
            <Text className="text-center text-xs text-[#B4B4BC]">
              Tap to add photos of the issue
            </Text>
          </Pressable>

          <Button isLoading={isPending} disabled={isPending} onPress={form.handleSubmit}>
            Submit Dispute
          </Button>
        </View>
      )}
    </Layout>
  );
}
