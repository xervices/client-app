import { Text } from '@/components/ui/text';
import * as React from 'react';
import { AppState, Platform, Pressable, ScrollView, View } from 'react-native';
import * as Application from 'expo-application';
import { Layout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CheckCheck,
  Dot,
  Phone,
  Send,
} from 'lucide-react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LegendList } from '@legendapp/list';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import * as z from 'zod';
import { useForm } from '@tanstack/react-form';
import { showErrorMessage } from '@/api/helpers';
import { formatTime12HourIntl, makePhoneCall } from '@/lib/utils';
import { LoadingState } from '@/components/loading-state';
import { useAuthStore } from '@/store/auth-store';
import { useChatSocket } from '@/hooks/use-chat-socket';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useKeyboardHandler } from 'react-native-keyboard-controller';

const formSchema = z.object({
  content: z.string().min(1, 'Message content is required.'),
});

const PADDING_BOTTOM = Platform.OS === 'ios' ? 20 : 0;

const useGradualAnimation = () => {
  const height = useSharedValue(PADDING_BOTTOM);

  useKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';
        height.value = Math.max(e.height, PADDING_BOTTOM);
      },
    },
    []
  );

  return { height };
};

export default function Screen() {
  const { height } = useGradualAnimation();

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
      marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
    };
  }, []);

  const { id }: { id: string } = useLocalSearchParams();

  const job = useQuery(api.getJobDetail(id));
  const chatRoom = useQuery(api.getChatRoom(id));
  const messages = useQuery(api.getMessagesChatRoom(chatRoom?.data?.id));

  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const roomId = chatRoom?.data?.id;

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleOnRefresh = async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([job?.refetch(), chatRoom?.refetch(), messages?.refetch()]);
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  const { sendMessage, isConnected } = useChatSocket({
    roomId,
    onNewMessage: (message) => {
      queryClient.setQueryData(api.getMessagesChatRoom(roomId!).queryKey, (old: any) => {
        if (!old) return { messages: [message] };

        // 1. Check if we already have this EXACT message ID (deduplication)
        if (old.messages.some((m: any) => m.id === message.id)) return old;

        // 2. Check if we have an OPTIMISTIC version of this message
        // (Same content, same sender, generated/optimistic ID)
        const optimisticMatchIndex = old.messages.findIndex(
          (m: any) =>
            m.content === message.content && m.senderId === message.senderId && m.id !== message.id // Match content/sender but different ID
        );

        if (optimisticMatchIndex !== -1) {
          // Replace the optimistic one with the real one
          const newMessages = [...old.messages];
          newMessages[optimisticMatchIndex] = message;
          return { ...old, messages: newMessages };
        }

        return {
          ...old,
          messages: [...old.messages, message],
        };
      });
    },
  });

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Refetch all data
        job?.refetch();
        chatRoom?.refetch();
        messages?.refetch();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isConnected, id]);

  const form = useForm({
    defaultValues: {
      content: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!roomId) return;

      const content = value.content;
      form.reset();

      // Optimistic Update
      const tempId = Math.random().toString(36).substring(7);
      const tempMessage = {
        id: tempId,
        roomId,
        senderId: user?.id,
        content,
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: {
          id: user?.id,
          role: 'user',
          profile: user?.profile || { fullName: 'Me', avatarUrl: '' },
        },
      };

      // Update cache optimistically
      queryClient.setQueryData(api.getMessagesChatRoom(roomId).queryKey, (old: any) => {
        if (!old) return { messages: [tempMessage] };
        return {
          ...old,
          messages: [...old.messages, tempMessage],
        };
      });

      try {
        const response = await sendMessage(content, roomId);

        if (response.success && response.message) {
          const realMessage = response.message;

          // Ensure sender info is present for UI consistency
          if (!realMessage.sender && user) {
            realMessage.sender = {
              id: user.id || '',
              profile: {
                fullName: user.profile?.fullName || 'Me',
                avatarUrl: user.profile?.avatarUrl || '',
              },
            };
          }

          queryClient.setQueryData(api.getMessagesChatRoom(roomId).queryKey, (old: any) => {
            if (!old) return { messages: [realMessage] };
            return {
              ...old,
              messages: old.messages.map((m: any) => (m.id === tempId ? realMessage : m)),
            };
          });

          // Re-fetch to guarantee consistency with server state
          queryClient.invalidateQueries({ queryKey: api.getMessagesChatRoom(roomId).queryKey });
        }
      } catch (err: any) {
        showErrorMessage(err?.message || 'Failed to send message');
        // Rollback
        queryClient.setQueryData(api.getMessagesChatRoom(roomId).queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.filter((m: any) => m.id !== tempId),
          };
        });
      }
    },
  });

  return (
    <Layout
      isRefreshing={isRefreshing}
      onRefresh={handleOnRefresh}
      useBackground
      scrollable={false}
      keyboardAvoiding>
      {messages?.isLoading ? (
        <LoadingState title="Loading messages..." />
      ) : (
        <View className="flex-1 gap-4">
          <View className="relative flex w-full flex-row items-center justify-between">
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={28} color={'#B4B4BC'} />
            </Pressable>

            <Pressable onPress={() => makePhoneCall(job?.data?.artisan?.phoneNumber)}>
              <Phone size={24} color={'#FE6A00'} fill={'#FE6A00'} />
            </Pressable>
          </View>

          <View className="flex w-full flex-row gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <View className="relative h-14 w-14 flex-shrink-0">
                <Avatar alt="User's Avatar" className="h-14 w-14">
                  <AvatarImage source={{ uri: job?.data?.artisan?.profile?.avatarUrl }} />
                  <AvatarFallback className="bg-primary">
                    <Text className="font-cabinet-bold text-xs uppercase leading-none">
                      {job?.data?.artisan?.profile?.fullName}
                    </Text>
                  </AvatarFallback>
                </Avatar>

                <View className="absolute bottom-0 right-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-[#04802E]" />
              </View>

              <View className="min-w-0 flex-1">
                <View className="flex flex-row items-center">
                  <Text
                    className="min-w-0 flex-shrink font-cabinet-bold text-[18px] text-[#1B1B1E]"
                    numberOfLines={1}>
                    {job?.data?.artisan?.profile?.fullName}
                  </Text>

                  <BadgeCheck
                    style={{ flexShrink: 0 }}
                    size={16}
                    fill={'#FE6A00'}
                    stroke={'#FFFFFF'}
                  />
                </View>

                <Text className="text-xs text-[#1B1B1E]" numberOfLines={1}>
                  {job?.data?.category?.name} Specialist
                </Text>

                <Text className="font-cabinet-bold text-xs text-[#22973B]">Online</Text>
              </View>
            </View>

            <View className="flex-shrink-0 flex-row justify-between">
              <View className="flex h-[26px] items-center justify-center rounded-full bg-[#FFF4EA] px-3">
                <Text className="text-sm text-primary">In Progress</Text>
              </View>
            </View>
          </View>

          {messages?.data && messages?.data?.messages && messages?.data?.messages?.length > 0 ? (
            <LegendList
              data={messages?.data?.messages}
              renderItem={({ item }) =>
                item?.messageType === 'system' ? null : item?.senderId !== user?.id ? (
                  <View>
                    <Text className="text-sm text-[#1B1B1E]">{item?.content}</Text>
                    <Text className="text-xs text-[#AAA6B9]">
                      {formatTime12HourIntl(item?.createdAt)}
                    </Text>
                  </View>
                ) : (
                  <View className="flex flex-row justify-end">
                    <View className="w-[80%]">
                      <View className="rounded-2xl rounded-br-none bg-[#FE6A00] p-4">
                        <Text className="text-sm text-white">{item?.content}</Text>
                      </View>

                      <View className="mt-1 flex flex-row items-center justify-end gap-1">
                        <Text className="text-xs text-[#AAA6B9]">
                          {formatTime12HourIntl(item?.createdAt)}
                        </Text>

                        <CheckCheck size={14} color={'#808080'} />
                      </View>
                    </View>
                  </View>
                )
              }
              estimatedItemSize={68}
              //   alignItemsAtEnd
              //   maintainScrollAtEnd
              maintainScrollAtEndThreshold={0.1}
              contentContainerStyle={{ flexGrow: 1, gap: 16 }}
            />
          ) : null}

          <View className="flex w-full flex-row items-center justify-between gap-4">
            <View className="flex flex-1 flex-row">
              <form.Field name="content">
                {(field) => (
                  <View className="w-full">
                    <Input
                      id="content"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      placeholder="Type your message"
                      hasError={!field.state.meta.isValid}
                      className="h-12 bg-white"
                    />
                  </View>
                )}
              </form.Field>
              {/* <Input placeholder="Type your message" className="h-12 bg-white" /> */}
            </View>

            <Pressable
              onPress={form.handleSubmit}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8733]">
              <Send size={24} stroke={'#FFF4EA'} fill={'#FFF4EA'} />
            </Pressable>
          </View>

          <Animated.View style={fakeView} />
        </View>
      )}
    </Layout>
  );
}
