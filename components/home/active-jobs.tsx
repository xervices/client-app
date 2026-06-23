import { Pressable, View } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowUpRight, BadgeCheck, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import React from 'react';
import { LoadingIndicator } from '../ui/loading-indicator';
import { showErrorMessage } from '@/api/helpers';
import { SheetManager } from 'react-native-actions-sheet';
import { useAuthStore } from '@/store/auth-store';

export function ActiveJobs() {
  const isGuest = useAuthStore((s) => s.isGuest);

  const { data, refetch } = useQuery({
    ...api.getUserServiceRequests(),
    enabled: !isGuest,
  });

  const jobs = useQuery({ ...api.getUserJobs(), enabled: !isGuest });

  const queryClient = useQueryClient();

  if (isGuest) {
    return (
      <View className="flex gap-2 px-6">
        <Text className="font-cabinet-medium text-xs uppercase">Active Jobs</Text>

        <View className="flex w-full items-center justify-center gap-5 rounded-[8px] border border-[#D4D4D8] p-4">
          <Text className="text-center text-sm text-[#737381]">
            Log in to see your active jobs and bookings.
          </Text>

          <Button onPress={() => router.navigate('/login')} className="w-full">
            Login
          </Button>
        </View>
      </View>
    );
  }

  const inCompleteSearch = data?.filter((i) => i.status === 'open');
  const negotiatingJobs = data?.filter((i) => i.status === 'in_negotiation');

  const activeJobs = jobs?.data?.filter(
    (i) => i.status === 'paid' || i.status === 'in_progress' || i.status === 'completed'
  );
  const pendingJobs = jobs?.data?.filter((i) => i.status === 'pending');

  return (
    <View className="flex gap-2 px-6">
      <Text className="font-cabinet-medium text-xs uppercase">Active Jobs</Text>

      {inCompleteSearch &&
      inCompleteSearch?.length === 0 &&
      pendingJobs &&
      pendingJobs?.length == 0 &&
      activeJobs &&
      activeJobs?.length === 0 &&
      negotiatingJobs &&
      negotiatingJobs?.length === 0 ? (
        <View className="flex w-full items-center justify-center gap-5 rounded-[8px] border border-[#D4D4D8] p-4">
          <Text className="text-sm text-[#B4B4BC]">No active job</Text>

          <Button onPress={() => router.navigate('/book')} className="w-full">
            Book a service
          </Button>
        </View>
      ) : null}

      {/* Incomplete search */}
      {inCompleteSearch &&
        inCompleteSearch?.length > 0 &&
        inCompleteSearch?.map((search) => (
          <RequestCard
            key={search.id}
            id={search.id}
            category={search.category?.name}
            onCancelFn={() => {
              queryClient.invalidateQueries({
                queryKey: api.getServiceRequest(search.id).queryKey,
              });

              refetch();
            }}
          />
        ))}

      {/* Pending jobs */}
      {pendingJobs &&
        pendingJobs?.length > 0 &&
        pendingJobs?.map((search) => (
          <PendingJobCard
            key={search.id}
            artisanId={search.artisanId}
            id={search.id}
            offerId={search?.acceptedOfferId}
            serviceId={search.serviceRequestId}
            category={search.category?.name}
            onCancelFn={() => {
              jobs?.refetch();
            }}
          />
        ))}

      {activeJobs && activeJobs?.length > 0 ? (
        <>
          {activeJobs?.map((job) => (
            <View
              key={job.id}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
              className="flex gap-4 rounded-[8px] bg-white p-4">
              <View className="flex flex-row items-center justify-between">
                <Text className="flex-1 font-cabinet-bold text-[#1B1B1E]">
                  {job?.category?.name}
                </Text>

                <View className="flex h-[26px] items-center justify-center rounded-full bg-[#FFF4EA] px-4">
                  <Text className="text-sm capitalize text-primary">{job?.status}</Text>
                </View>
              </View>

              <Text className="text-sm text-[#737381]">{job?.serviceRequest?.description}</Text>

              <View className="flex flex-row items-center justify-between gap-4">
                <View className="flex flex-1 flex-row items-center gap-1">
                  <Avatar alt="User's Avatar" className="h-6 w-6">
                    <AvatarImage source={{ uri: job?.artisan?.profile?.avatarUrl }} />
                    <AvatarFallback className="bg-primary">
                      <Text className="font-cabinet-bold text-xs leading-none">
                        {job?.artisan?.profile?.fullName?.charAt(0).toUpperCase()}
                      </Text>
                    </AvatarFallback>
                  </Avatar>

                  <View className="flex flex-1 flex-row items-center">
                    <Text className="font-cabinet-bold text-sm text-[#737381]">
                      {job?.artisan?.profile?.fullName}
                    </Text>

                    <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
                  </View>
                </View>

                <Pressable
                  onPress={() =>
                    router.navigate({
                      pathname: '/ongoing',
                      params: {
                        id: job?.id,
                      },
                    })
                  }
                  className="flex flex-row items-center gap-1">
                  <Text className="font-cabinet-bold text-sm text-primary">Track activities</Text>

                  <ArrowUpRight size={14} color={'#FE6A00'} />
                </Pressable>
              </View>
            </View>
          ))}
        </>
      ) : null}

      {negotiatingJobs && negotiatingJobs?.length > 0 && (
        <>
          {negotiatingJobs?.map((job) => (
            <NegotiatingJobCard key={job.id} jobId={job.id} onCancelFn={refetch} />
          ))}
        </>
      )}
    </View>
  );
}

interface NegotiatingJobCardProp {
  jobId: string;
  onCancelFn?: () => void;
}

function NegotiatingJobCard({ jobId, onCancelFn }: NegotiatingJobCardProp) {
  const { isLoading, data } = useQuery(api.getOffers(jobId));

  const { mutate, isPending } = useMutation(api.cancelServiceRequest(jobId));

  const excludedStatuses = ['withdrawn', 'rejected', 'expired'];

  const uniqueOffersByArtisan = React.useMemo(() => {
    if (!data) return [];
    const seen = new Set();
    return data
      .filter((offer) => {
        if (seen.has(offer.artisanId)) return false;
        seen.add(offer.artisanId);
        return true;
      })
      .filter((offer) => !excludedStatuses.includes(offer.status));
  }, [data]);

  if (
    isLoading ||
    !data ||
    data?.length === 0 ||
    !uniqueOffersByArtisan ||
    uniqueOffersByArtisan?.length === 0
  )
    return null;

  return (
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
        <Text className="text-sm text-[#737381]">
          {uniqueOffersByArtisan?.length} artisans sent offers
        </Text>

        {isPending ? (
          <LoadingIndicator size={16} />
        ) : (
          <Pressable
            onPress={() => {
              SheetManager?.show('cancel-service-sheet', {
                payload: {
                  onConfirm(reason) {
                    mutate(
                      { reason },
                      {
                        onError: (err) => {
                          showErrorMessage(err?.message);
                        },
                        onSuccess: () => {
                          onCancelFn?.();
                        },
                      }
                    );
                  },
                },
              });
            }}
            className="flex h-4 w-4 items-center justify-center">
            <X size={14} color={'#737381'} />
          </Pressable>
        )}
      </View>

      <View className="flex flex-row items-center justify-between">
        <View className="flex-row">
          {uniqueOffersByArtisan?.slice(0, 6)?.map((profile) => (
            <Avatar
              key={profile?.artisanId}
              alt={profile?.artisan?.profile?.fullName || ''}
              className="-mr-2 h-6 w-6 border-2 border-background web:border-0 web:ring-2 web:ring-background">
              <AvatarImage
                source={{ uri: (profile?.artisan?.profile?.avatarUrl || '') as string }}
              />
              <AvatarFallback className="bg-primary">
                <Text className="font-cabinet-bold text-xs uppercase">
                  {profile?.artisan?.profile?.fullName?.substring(0, 2)}
                </Text>
              </AvatarFallback>
            </Avatar>
          ))}

          {uniqueOffersByArtisan && Math.max(0, uniqueOffersByArtisan?.length - 6) > 0 && (
            <Avatar
              alt="@evilrabbit"
              className="-mr-2 h-6 w-6 border-2 border-background bg-[#F4F4F5] web:border-0 web:ring-2 web:ring-background">
              <AvatarFallback>
                <Text className="font-cabinet-bold text-xs">
                  +{Math.max(0, uniqueOffersByArtisan?.length - 6)}
                </Text>
              </AvatarFallback>
            </Avatar>
          )}
        </View>

        <Pressable
          onPress={() =>
            router.navigate({
              pathname: '/offer',
              params: {
                id: jobId,
              },
            })
          }
          className="flex flex-row items-center gap-1">
          <Text className="font-cabinet-bold text-sm text-primary">See offers</Text>

          <ArrowUpRight size={14} color={'#FE6A00'} />
        </Pressable>
      </View>
    </View>
  );
}

interface RequestCardProp {
  id: string;
  category?: string;
  onCancelFn?: () => void;
}

function RequestCard({ category, id, onCancelFn }: RequestCardProp) {
  const { mutate, isPending } = useMutation(api.cancelServiceRequest(id));

  return (
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
        <Text className="flex-1 font-cabinet-bold text-primary">Incomplete search</Text>

        {isPending ? (
          <LoadingIndicator size={16} />
        ) : (
          <Pressable
            onPress={() => {
              SheetManager?.show('cancel-service-sheet', {
                payload: {
                  onConfirm(reason) {
                    mutate(
                      {
                        reason,
                      },
                      {
                        onError: (err) => {
                          showErrorMessage(err?.message);
                        },
                        onSuccess: () => {
                          onCancelFn?.();
                        },
                      }
                    );
                  },
                },
              });
            }}
            className="flex h-4 w-4 items-center justify-center">
            <X size={14} color={'#737381'} />
          </Pressable>
        )}
      </View>

      <Text className="text-sm text-[#737381]">
        Your previous search for "{category}" was not complete. Click "continue search" to continue
        your search.
      </Text>

      <View className="flex flex-row items-center justify-end">
        <Pressable
          onPress={() => {
            router.navigate({
              pathname: '/searching',
              params: {
                id: id,
              },
            });
          }}
          className="flex flex-row items-center gap-1">
          <Text className="font-cabinet-bold text-sm text-primary">Continue search</Text>

          <ArrowUpRight size={14} color={'#FE6A00'} />
        </Pressable>
      </View>
    </View>
  );
}

interface PendingJobCardProp {
  id: string;
  serviceId: string;
  artisanId: string;
  offerId: string;
  category?: string;
  onCancelFn?: () => void;
}

function PendingJobCard({
  artisanId,
  id,
  offerId,
  serviceId,
  category,
  onCancelFn,
}: PendingJobCardProp) {
  const { mutate, isPending } = useMutation(api.cancelJob(id));

  return (
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
        <Text className="flex-1 font-cabinet-bold text-primary">Pending request</Text>

        {isPending ? (
          <LoadingIndicator size={16} />
        ) : (
          <Pressable
            onPress={() => {
              SheetManager?.show('cancel-service-sheet', {
                payload: {
                  onConfirm(reason) {
                    mutate(
                      {
                        note: reason,
                      },
                      {
                        onError: (err) => {
                          showErrorMessage(err?.message);
                        },
                        onSuccess: () => {
                          onCancelFn?.();
                        },
                      }
                    );
                  },
                },
              });
            }}
            className="flex h-4 w-4 items-center justify-center">
            <X size={14} color={'#737381'} />
          </Pressable>
        )}
      </View>

      <Text className="text-sm text-[#737381]">
        Your previous search for "{category}" was not complete. Click "continue to payment" to
        complete your request.
      </Text>

      <View className="flex flex-row items-center justify-end">
        <Pressable
          onPress={() => {
            router.navigate({
              pathname: '/pro',
              params: {
                serviceId,
                artisanId,
                offerId,
              },
            });
          }}
          className="flex flex-row items-center gap-1">
          <Text className="font-cabinet-bold text-sm text-primary">Continue to Payment</Text>

          <ArrowUpRight size={14} color={'#FE6A00'} />
        </Pressable>
      </View>
    </View>
  );
}
