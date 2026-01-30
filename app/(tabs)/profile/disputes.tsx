import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import { ArrowUpRight, ChevronRight, Mail, MessageCircleMore } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import EmptyState from '@/components/empty-state';

export default function Screen() {
  const { data, isLoading, refetch, isRefetching } = useQuery(api.getMyDisputes());

  const [value, setValue] = React.useState('progress');

  const inProgressDisputes = data?.filter(
    (i) => i.status === 'open' || i.status === 'under_review'
  );
  const resolvedDisputes = data?.filter((i) => i.status === 'closed' || i.status === 'resolved');

  return (
    <Layout
      useBackground
      isRefreshing={isRefetching}
      onRefresh={refetch}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Disputes" />
        </View>
      }>
      {isLoading ? (
        <LoadingState title="Loading Disputes" />
      ) : (
        <Tabs value={value} onValueChange={setValue} className="w-full">
          <TabsList className="h-[52px] w-full border-none p-0">
            <TabsTrigger
              className="h-full w-1/2 rounded-none border-none"
              value="progress"
              style={{
                borderColor: undefined,
                borderWidth: 0,
                backgroundColor: value === 'progress' ? '#FE6A00' : '#FFF4EA',
              }}>
              <Text
                className="font-cabinet-bold text-sm"
                style={{
                  color: value === 'progress' ? '#FFF4EA' : '#522200',
                }}>
                In Progress
              </Text>
            </TabsTrigger>
            <TabsTrigger
              className="h-full w-1/2 rounded-none border-none"
              value="resolved"
              style={{
                borderColor: undefined,
                borderWidth: 0,
                backgroundColor: value === 'resolved' ? '#FE6A00' : '#FFF4EA',
              }}>
              <Text
                className="font-cabinet-bold text-sm"
                style={{
                  color: value === 'resolved' ? '#FFF4EA' : '#522200',
                }}>
                Resolved
              </Text>
            </TabsTrigger>
          </TabsList>

          {/* In progress content */}
          <TabsContent value="progress" className="flex gap-6 pt-4">
            {inProgressDisputes && inProgressDisputes?.length === 0 ? (
              <EmptyState title="No Disputes in progress" />
            ) : (
              inProgressDisputes?.map((dispute) => (
                <View
                  key={dispute?.id}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  className="flex gap-4 rounded-[8px] bg-white p-4">
                  <View className="flex flex-row items-center justify-between gap-4">
                    <View className="flex-1">
                      <Text className="flex-1 font-cabinet-bold leading-none text-[#1B1B1E]">
                        Plumber
                      </Text>
                      <Text className="flex-1 text-sm text-[#FE6A00]">
                        Dispute ID: {dispute?.id}
                      </Text>
                    </View>

                    <View className="flex h-[26px] items-center justify-center rounded-full bg-[#FFF4EA] px-3">
                      <Text className="text-sm text-primary">In Progress</Text>
                    </View>
                  </View>

                  <Text className="text-sm text-[#737381]">{dispute?.description}</Text>

                  <View className="flex flex-row items-center justify-between">
                    <Pressable
                      onPress={() => {
                        router.navigate({
                          pathname: '/profile/dispute-detail',
                          params: {
                            id: dispute?.id,
                          },
                        });
                      }}
                      className="flex flex-row items-center gap-1">
                      <Text className="font-cabinet-bold text-sm text-primary">View Details</Text>

                      <ArrowUpRight size={14} color={'#FE6A00'} />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </TabsContent>

          {/* Resolved content */}
          <TabsContent value="resolved" className="flex gap-6 pt-4">
            {resolvedDisputes && resolvedDisputes?.length === 0 ? (
              <EmptyState title="No Resolved disputes" />
            ) : (
              resolvedDisputes?.map((dispute) => (
                <View
                  key={dispute?.id}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  className="flex gap-4 rounded-[8px] bg-white p-4">
                  <View className="flex flex-row items-center justify-between gap-4">
                    <View className="flex-1">
                      <Text className="flex-1 font-cabinet-bold leading-none text-[#1B1B1E]">
                        Plumber
                      </Text>
                      <Text className="flex-1 text-sm text-[#FE6A00]">
                        Dispute ID: {dispute?.id}
                      </Text>
                    </View>

                    <View className="flex h-[26px] items-center justify-center rounded-full bg-[#EAF5FF] px-3">
                      <Text className="text-sm text-[#004C8D]">Resolved</Text>
                    </View>
                  </View>

                  <Text className="text-sm text-[#737381]">{dispute?.description}</Text>

                  <View className="flex flex-row items-center justify-between">
                    <Pressable
                      onPress={() => {
                        router.navigate({
                          pathname: '/profile/dispute-detail',
                          params: {
                            id: dispute?.id,
                          },
                        });
                      }}
                      className="flex flex-row items-center gap-1">
                      <Text className="font-cabinet-bold text-sm text-primary">View Details</Text>

                      <ArrowUpRight size={14} color={'#FE6A00'} />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </Layout>
  );
}
