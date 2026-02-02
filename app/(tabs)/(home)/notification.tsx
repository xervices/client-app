import { api } from '@/api';
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
import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';

export default function Screen() {
  const { data, isLoading, isRefetching, refetch } = useQuery(api.getNotifications());

  return (
    <Layout
      useBackground
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
              <AccordionItem
                key={notification?.id}
                className="rounded-[8px] bg-[#F4F4F5] px-4 py-1"
                value={notification?.id}>
                <AccordionTrigger>
                  <View className="flex gap-2">
                    <View className="flex flex-row items-center gap-1">
                      <View className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FE6A00]">
                        <View className="h-2 w-2 rounded-full bg-white" />
                      </View>

                      <Text className="font-cabinet-extrabold text-sm text-primary">Xervices</Text>

                      <Text className="text-xs text-[#737381]">
                        {formatRelativeTime(notification?.sentAt)}
                      </Text>
                    </View>

                    <Text className="font-cabinet-bold text-[#737381]">{notification?.title}</Text>
                  </View>
                </AccordionTrigger>
                <AccordionContent>
                  <Text className="text-sm text-[#737381]">{notification?.message}</Text>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </View>
      ) : (
        <EmptyState title="No Notifications" subtitle="You do not have any notifications ye" />
      )}
    </Layout>
  );
}
