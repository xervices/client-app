import { api } from '@/api';
import { showErrorMessage } from '@/api/helpers';
import { AuthHeader } from '@/components/auth-header';
import EmptyState from '@/components/empty-state';
import { Layout } from '@/components/layout';
import { LoadingState } from '@/components/loading-state';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Text } from '@/components/ui/text';
import { formatRelativeTime } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { AppState, Pressable, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export default function Screen() {
  const { data, isLoading, isRefetching, refetch } = useQuery(api.getNotifications());
  const unreadCount = useQuery(api.getUnreadNotificationCount());

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleOnRefresh = async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([refetch(), unreadCount?.refetch()]);
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  const refetchAll = () => {
    refetch();
    unreadCount?.refetch();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refetch();
        unreadCount?.refetch();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Layout
      useBackground
      isRefreshing={isRefreshing}
      onRefresh={handleOnRefresh}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Notifications" />
        </View>
      }>
      {isLoading ? (
        <LoadingState title="Loading Notifications..." />
      ) : data && data?.notifications && data?.notifications?.length > 0 ? (
        <View className="flex-1 gap-6">
          <Accordion className="gap-4" type="single" collapsible>
            {data?.notifications?.map((notification) => (
              <NotificationCard
                key={notification.id}
                id={notification.id}
                isRead={notification.isRead}
                message={notification.message}
                sentAt={notification.sentAt}
                title={notification.title}
                onMarkedReadSuccessFn={refetchAll}
                onDeletedSuccessFn={refetchAll}
              />
            ))}
          </Accordion>
        </View>
      ) : (
        <EmptyState title="No Notifications" subtitle="You do not have any notifications yet." />
      )}
    </Layout>
  );
}

interface NotificationCardProps {
  id: string;
  sentAt: string;
  title: string;
  message: string;
  isRead: boolean;
  onMarkedReadSuccessFn?: () => void;
  onDeletedSuccessFn?: () => void;
}

function NotificationCard({
  id,
  message,
  sentAt,
  title,
  isRead,
  onMarkedReadSuccessFn,
  onDeletedSuccessFn,
}: NotificationCardProps) {
  const { mutate, isPending, data } = useMutation(api.markNotificationAsRead());
  const deleteNotification = useMutation(api.deleteNotification(id));

  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={(_progress, _translation, swipeable) => (
        <Pressable
          disabled={deleteNotification.isPending}
          onPress={() => {
            deleteNotification.mutate(undefined, {
              onSuccess: () => {
                onDeletedSuccessFn?.();
              },
              onError: (err) => {
                showErrorMessage(err.message);
                swipeable.close();
              },
            });
          }}
          className="ml-2 flex w-16 items-center justify-center rounded-[8px] bg-[#B3031E]">
          <Trash2 size={20} color="#FFFFFF" />
        </Pressable>
      )}>
      <AccordionItem className="rounded-[8px] bg-[#F4F4F5] px-4 py-1" value={id}>
        <AccordionTrigger
          onPress={() => {
            if (!isPending && !isRead && !data) {
              mutate(
                // @ts-ignore - generated body type is stale; the endpoint expects a flat string array
                { notificationIds: [id] },
                {
                  onSuccess: () => {
                    onMarkedReadSuccessFn?.();
                  },
                  onError: (err) => {
                    showErrorMessage(err.message);
                  },
                }
              );
            }
          }}>
          <View className="flex gap-2">
            <View className="flex flex-row items-center gap-1">
              <View className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FE6A00]">
                <View className="h-2 w-2 rounded-full bg-white" />
              </View>

              <Text className="font-cabinet-extrabold text-sm text-primary">Xervices</Text>

              <Text className="text-xs text-[#737381]">{formatRelativeTime(sentAt)}</Text>
            </View>

            <Text className="font-cabinet-bold text-[#737381]">{title}</Text>
          </View>
        </AccordionTrigger>
        <AccordionContent>
          <Text className="text-sm text-[#737381]">{message}</Text>
        </AccordionContent>
      </AccordionItem>
    </Swipeable>
  );
}
