import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { Layout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router } from 'expo-router';
import { ArrowUpRight, BadgeCheck } from 'lucide-react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LegendList } from '@legendapp/list';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { LoadingState } from '@/components/loading-state';
import EmptyState from '@/components/empty-state';

export default function Screen() {
  const [value, setValue] = React.useState('progress');

  const { isLoading, data, isRefetching, refetch } = useQuery(api.getUserJobs());

  const inProgressJobs = data?.filter((i) => i.status === 'in_progress');
  const completedJobs = data?.filter((i) => i.status === 'completed');

  return (
    <Layout scrollable={false}>
      {isLoading ? (
        <LoadingState title="Loading your jobs..." />
      ) : (
        <View className="flex-1">
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
                value="completed"
                style={{
                  borderColor: undefined,
                  borderWidth: 0,
                  backgroundColor: value === 'completed' ? '#FE6A00' : '#FFF4EA',
                }}>
                <Text
                  className="font-cabinet-bold text-sm"
                  style={{
                    color: value === 'completed' ? '#FFF4EA' : '#522200',
                  }}>
                  Completed
                </Text>
              </TabsTrigger>
            </TabsList>

            {/* In progress content */}
            <TabsContent value="progress" className="flex min-h-full gap-6 pt-4">
              {inProgressJobs && inProgressJobs?.length > 0 ? (
                <View className="flex gap-2">
                  <Text className="font-cabinet-medium text-xs uppercase">Active Jobs</Text>

                  <LegendList
                    contentContainerStyle={{ gap: 16, flexGrow: 1 }}
                    style={{ gap: 16, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    // ItemSeparatorComponent={<View className='w-full h-' />}
                    data={new Array(1).fill(0)}
                    renderItem={() => (
                      <View
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                        className="flex gap-4 rounded-[8px] bg-white p-4">
                        <View className="flex flex-row items-center justify-between">
                          <View>
                            <Text className="flex-1 font-cabinet-bold text-[#1B1B1E]">Plumber</Text>
                            <Text className="flex-1 text-xs text-[#FE6A00]">Posted 2 sec ago</Text>
                          </View>

                          <View className="flex h-[26px] items-center justify-center rounded-full bg-[#FFF4EA] px-3">
                            <Text className="text-sm text-primary">In Progress</Text>
                          </View>
                        </View>

                        <Text className="text-sm text-[#737381]">
                          Leaky kitchen faucet needs immediate repair. Water dripping constantly.
                        </Text>

                        <View className="flex flex-row items-center justify-between">
                          <View className="flex flex-row items-center gap-1">
                            <Avatar alt="User's Avatar" className="h-6 w-6">
                              <AvatarImage
                                source={{ uri: 'https://github.com/mrzachnugent.png' }}
                              />
                              <AvatarFallback className="bg-primary">
                                <Text className="font-cabinet-bold leading-none">ZN</Text>
                              </AvatarFallback>
                            </Avatar>

                            <View className="flex flex-row items-center">
                              <Text className="font-cabinet-bold text-sm text-[#737381]">
                                Sarah Rodri
                              </Text>

                              <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                            </View>
                          </View>

                          <Pressable
                            onPress={() =>
                              router.navigate({
                                pathname: '/jobs/ongoing',
                                params: {
                                  id: '97575',
                                },
                              })
                            }
                            className="flex flex-row items-center gap-1">
                            <Text className="font-cabinet-bold text-sm text-primary">
                              Track activities
                            </Text>

                            <ArrowUpRight size={14} color={'#FE6A00'} />
                          </Pressable>
                        </View>
                      </View>
                    )}
                    refreshControl={
                      <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={'#E15D02'}
                        colors={['#E15D02']}
                      />
                    }
                  />
                </View>
              ) : (
                <View className="h-full flex-1">
                  <EmptyState
                    title="No In Progress jobs"
                    subtitle="You currently don't have an In-progress Job. "
                  />
                </View>
              )}
            </TabsContent>

            {/* Completed content */}
            <TabsContent value="completed" className="flex min-h-full gap-6 pt-4">
              {completedJobs && completedJobs?.length > 0 ? (
                <View className="flex gap-2">
                  <Text className="font-cabinet-medium text-xs uppercase">Completed orders</Text>

                  <LegendList
                    contentContainerStyle={{ gap: 16, flexGrow: 1 }}
                    refreshControl={
                      <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={'#E15D02'}
                        colors={['#E15D02']}
                      />
                    }
                    style={{ gap: 16, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    data={new Array(5).fill(0)}
                    renderItem={() => (
                      <View
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                        className="flex gap-4 rounded-[8px] bg-white p-4">
                        <View className="flex flex-row items-center justify-between">
                          <View>
                            <Text className="flex-1 font-cabinet-bold text-[#1B1B1E]">Plumber</Text>
                          </View>

                          <View className="flex h-[26px] items-center justify-center rounded-full bg-[#EFFBF1] px-3">
                            <Text className="text-sm text-[#1C752E]">Completed</Text>
                          </View>
                        </View>

                        <Text className="text-sm text-[#737381]">
                          Leaky kitchen faucet needs immediate repair. Water dripping constantly.
                        </Text>

                        <View className="flex flex-row items-center justify-between">
                          <View className="flex flex-row items-center gap-1">
                            <Avatar alt="User's Avatar" className="h-6 w-6">
                              <AvatarImage
                                source={{ uri: 'https://github.com/mrzachnugent.png' }}
                              />
                              <AvatarFallback className="bg-primary">
                                <Text className="font-cabinet-bold leading-none">ZN</Text>
                              </AvatarFallback>
                            </Avatar>

                            <View className="flex flex-row items-center">
                              <Text className="font-cabinet-bold text-sm text-[#737381]">
                                Sarah Rodri
                              </Text>

                              <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                            </View>
                          </View>

                          <Pressable
                            onPress={() =>
                              router.navigate({
                                pathname: '/jobs/completed',
                                params: {
                                  id: '97575',
                                },
                              })
                            }
                            className="flex flex-row items-center gap-1">
                            <Text className="font-cabinet-bold text-sm text-primary">
                              See activities
                            </Text>

                            <ArrowUpRight size={14} color={'#FE6A00'} />
                          </Pressable>
                        </View>
                      </View>
                    )}
                  />
                </View>
              ) : (
                <View className="h-full flex-1">
                  <EmptyState
                    title="No Completed jobs"
                    subtitle="You currently don't have an completed Job. "
                  />
                </View>
              )}
            </TabsContent>
          </Tabs>
        </View>
      )}
    </Layout>
  );
}
