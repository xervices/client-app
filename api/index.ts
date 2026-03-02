import { Platform } from 'react-native';
import { queryOptions } from '@tanstack/react-query';

import { apiClient, publicApiClient } from './client';
import { tokenStorage } from './token-storage';
import { getErrorMessage, RequestBody } from './helpers';
import { useAuthStore } from '@/store/auth-store';
import { getFileExtension } from '@/lib/utils';

const normalizePath = (uri: string) => (Platform.OS === 'ios' ? uri.replace('file://', '') : uri);

export const api = {
  // Server Health endpoints
  health: () =>
    queryOptions({
      queryKey: ['health'],
      queryFn: async () => {
        const { data } = await publicApiClient.GET('/api/health');

        return data;
      },
    }),
  ping: () =>
    queryOptions({
      queryKey: ['health', 'ping'],
      queryFn: async () => {
        const { data } = await publicApiClient.GET('/api/health/ping');

        return data;
      },
    }),

  // Authentication endpoints
  login: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/login', 'post'>) => {
        const { data, error } = await publicApiClient.POST('/api/auth/login', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Login failed'));
        }

        if (data?.tokens) {
          await tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        }

        if (data.user) {
          useAuthStore.getState().setUser(data.user);
        }

        return data;
      },
    };
  },
  verifyDevice: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/verify-device', 'post'>) => {
        const { data, error } = await publicApiClient.POST('/api/auth/verify-device', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Device verification failed'));
        }

        if (data?.tokens) {
          await tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        }

        if (data.user) {
          useAuthStore.getState().setUser(data.user);
        }

        return data;
      },
    };
  },
  register: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/register', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/auth/register', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Registration failed'));
        }

        if (data?.tokens) {
          await tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        }

        if (data.user) {
          useAuthStore.getState().setUser(data.user);
        }

        return data;
      },
    };
  },
  verifyAccount: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/verify', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/auth/verify', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Account verification failed'));
        }

        return data;
      },
    };
  },
  resendVerificationCode: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/resend-verification', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/auth/resend-verification', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Account verification failed'));
        }

        return data;
      },
    };
  },
  forgotPassword: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/forgot-password', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/auth/forgot-password', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Forgot password request failed'));
        }

        return data;
      },
    };
  },
  resetPassword: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/reset-password', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/auth/reset-password', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Reset password request failed'));
        }

        return data;
      },
    };
  },
  changePassword: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/change-password', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/auth/change-password', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Change password request failed'));
        }

        return data;
      },
    };
  },
  refreshToken: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/refresh', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/auth/refresh', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Refresh access request failed'));
        }

        return data;
      },
    };
  },
  logout: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/logout', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/auth/logout', {
          body: credentials,
          params: {
            header: {
              authorization: '',
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Logout request failed'));
        }

        return data;
      },
    };
  },
  googleSignin: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/auth/google/mobile', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/auth/google/mobile', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Google signin request failed'));
        }

        if (data?.tokens) {
          await tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        }

        if (data.user) {
          useAuthStore.getState().setUser(data.user);
          useAuthStore.getState().setLoginState(true);
        }

        return data;
      },
    };
  },

  // User management endpoints
  getCurrentUser: () =>
    queryOptions({
      queryKey: ['users', 'me'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/users/me');

        if (data) {
          useAuthStore.getState().setUser(data);
        }

        return data;
      },
    }),
  updateProfile: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/users/me', 'patch'>) => {
        const formData = new FormData();
        const user = useAuthStore.getState().user;

        // Define fields to append (excluding avatar which needs special handling)
        const fields = ['fullName', 'address', 'bio', 'city', 'country', 'state', 'postalCode'];

        // Append only non-empty fields
        fields.forEach((field) => {
          const value = credentials[field];

          // @ts-ignore
          const prevValue: string = user?.profile[field];

          if (value !== undefined && value !== null && value !== '' && prevValue !== value) {
            formData.append(field, String(value));
          }
        });

        // Handle avatar file upload
        // @ts-ignore
        if (credentials.avatarUrl && credentials.avatarUrl !== user?.profile?.avatarUrl) {
          // @ts-ignore
          const extension = getFileExtension(credentials.avatarUrl, credentials.avatarMimeType);

          const file = {
            // @ts-ignore
            uri: normalizePath(credentials.avatarUrl),
            // @ts-ignore - avatarMimeType sent from form but not specified in api
            type: credentials.avatarMimeType || 'image/jpeg',
            name: `avatar_${Date.now()}.${extension}`,
          };

          // @ts-ignore - FormData typing issue in React Native
          formData.append('avatar', file);
        }

        const { data, error } = await apiClient.PATCH('/api/users/me', {
          // @ts-ignore - FormData not properly typed in openapi-fetch
          body: formData,
          bodySerializer: () => formData, // Prevent body serialization
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Profile update failed'));
        }

        return data;
      },
    };
  },
  deleteAccount: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/users/me', 'delete'>) => {
        const { data, error } = await apiClient.DELETE('/api/users/me');

        if (error) {
          throw new Error(getErrorMessage(error, 'Delete account failed'));
        }

        return data;
      },
    };
  },

  // categories endpoints
  getAllCategories: () =>
    queryOptions({
      queryKey: ['categories'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/categories');

        return data;
      },
    }),

  // promotions, referrals & discounts endpoints
  getMyReferralInfo: () =>
    queryOptions({
      queryKey: ['referrals'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/referrals/me');

        return data;
      },
    }),
  getMyDiscounts: () =>
    queryOptions({
      queryKey: ['discounts'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/promotions/discounts');

        return data;
      },
    }),
  getMyPromotions: () =>
    queryOptions({
      queryKey: ['promotions'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/promotions/me');

        return data;
      },
    }),
  getPromoCodes: () =>
    queryOptions({
      queryKey: ['promo', 'codes'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/promotions/promo-codes');

        return data;
      },
    }),
  useReferralReward: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/referrals/use-reward', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/referrals/use-reward', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to use referral reward'));
        }

        return data;
      },
    };
  },
  applyReferralCode: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/referrals/apply', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/referrals/apply', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to apply referral code.'));
        }

        return data;
      },
    };
  },
  validatePromoCode: () => {
    return {
      mutationFn: async (
        credentials: RequestBody<'/api/promotions/validate-promo-code', 'post'>
      ) => {
        const { data, error } = await apiClient.POST('/api/promotions/validate-promo-code', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to validate promo code.'));
        }

        return data;
      },
    };
  },
  applyPromoCode: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/promotions/apply-promo-code', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/promotions/apply-promo-code', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to apply promo code.'));
        }

        return data;
      },
    };
  },
  removePromoCode: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/promotions/remove-promo-code', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/promotions/remove-promo-code', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to remove promo code.'));
        }

        return data;
      },
    };
  },

  // broadcast endpoints
  getActiveBroadcasts: () =>
    queryOptions({
      queryKey: ['broadcasts', 'active'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/broadcasts/active');

        return data;
      },
    }),
  dismissBroadcast: (id: string) => {
    return {
      mutationFn: async () => {
        const { data, error } = await apiClient.POST('/api/broadcasts/{id}/dismiss', {
          params: {
            path: {
              id,
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Dismiss broadcast request failed'));
        }

        return data;
      },
    };
  },

  // featured profile endpoints
  getActiveFeaturedProfiles: () =>
    queryOptions({
      queryKey: ['profiles', 'active', 'featured'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/featured-profiles', {
          params: {
            query: {
              type: 'user',
            },
          },
        });

        return data;
      },
    }),

  // news and promotions endpoints
  getNewsAndPromotions: () =>
    queryOptions({
      queryKey: ['news', 'promotions'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/promotion-slides', {
          params: {
            query: {
              audience: 'artisans',
            },
          },
        });

        return data;
      },
    }),

  // Support tickets endpoints
  createSupportTicket: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/support/tickets', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/support/tickets', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Login failed'));
        }

        return data;
      },
    };
  },

  // app ratings endpoints
  submitAppRating: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/app-ratings', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/app-ratings', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to submit rating'));
        }

        return data;
      },
    };
  },
  getMyAppRatings: () =>
    queryOptions({
      queryKey: ['app-ratings'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/app-ratings/me');

        return data;
      },
    }),

  // service endpoints
  createServiceRequest: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/service-requests', 'post'>) => {
        const formData = new FormData();

        const fields = [
          'categoryId',
          'title',
          'description',
          'serviceAddress',
          'latitude',
          'longitude',
          'destinationAddress',
          'destinationLatitude',
          'destinationLongitude',
          'contactPhone',
        ] as const;

        // Append only non-empty fields
        fields.forEach((field) => {
          const value = credentials[field];

          if (value !== undefined && value !== null && value !== '') {
            formData.append(field, String(value));
          }
        });

        // @ts-ignore
        if (credentials.media && credentials.media.length > 0) {
          // @ts-ignore
          credentials.media.forEach((cert, index) => {
            const extension = getFileExtension(cert.url, cert.mimeType);

            const file = {
              uri: normalizePath(cert.url),
              type: cert.mimeType || 'image/jpeg',
              name: cert.name || `media_${index}_${Date.now()}.${extension}`,
            };
            // @ts-ignore - FormData typing issue in React Native
            formData.append('media', file);
          });
        }

        const { data, error } = await apiClient.POST('/api/service-requests', {
          // @ts-ignore - FormData not properly typed in openapi-fetch
          body: formData,
          bodySerializer: () => formData, // Prevent body serialization
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Service request failed'));
        }

        return data;
      },
    };
  },
  getUserServiceRequests: () =>
    queryOptions({
      queryKey: ['service-request', 'user'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/service-requests');

        return data;
      },
    }),
  getMatchingArtisans: (id: string) =>
    queryOptions({
      queryKey: ['service-request', 'matching-artisans', id],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/service-requests/{id}/matching-artisans', {
          params: {
            path: {
              id,
            },
          },
        });

        return data;
      },
    }),
  getServiceRequest: (id: string) =>
    queryOptions({
      queryKey: ['service-request', id],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/service-requests/{id}', {
          params: {
            path: {
              id,
            },
          },
        });

        return data;
      },
    }),
  cancelServiceRequest: (id: string) => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/service-requests/{id}/cancel', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/service-requests/{id}/cancel', {
          params: {
            path: {
              id,
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Cancel Service request failed'));
        }

        return data;
      },
    };
  },

  // jobs endpoints
  getUserJobs: () =>
    queryOptions({
      queryKey: ['user', 'jobs'],
      queryFn: async () => {
        const { data, error } = await apiClient.GET('/api/jobs');

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to fetch jobs'));
        }

        if (!data) {
          throw new Error('No job data returned');
        }

        return data;
      },
    }),
  getJobDetail: (id: string) =>
    queryOptions({
      queryKey: ['job', id],
      queryFn: async () => {
        const { data, error } = await apiClient.GET('/api/jobs/{id}', {
          params: {
            path: {
              id,
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to fetch job details'));
        }

        if (!data) {
          throw new Error('No job detail data returned');
        }

        return data;
      },
    }),
  approveJob: (id: string) => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/jobs/{id}/approve', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/jobs/{id}/approve', {
          params: {
            path: {
              id,
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Approve job request failed'));
        }

        return data;
      },
    };
  },
  cancelJob: (id: string) => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/jobs/{id}/cancel', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/jobs/{id}/cancel', {
          body: credentials,
          params: {
            path: {
              id,
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Cancel job request failed'));
        }

        return data;
      },
    };
  },
  getArtisanLocation: (id: string) =>
    queryOptions({
      queryKey: ['job', 'artisan', 'location', id],
      queryFn: async () => {
        const { data, error } = await apiClient.GET('/api/jobs/{id}/artisan-location', {
          params: {
            path: {
              id,
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to fetch artisan location'));
        }

        if (!data) {
          throw new Error('No artisan location data returned');
        }

        return data;
      },
    }),

  // offers endpoints
  getOffers: (id: string) =>
    queryOptions({
      queryKey: ['service-request', 'offers', id],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/offers/service-request/{id}', {
          params: {
            path: {
              id,
            },
          },
        });

        return data;
      },
    }),
  getOfferDetails: (id: string) =>
    queryOptions({
      queryKey: ['offers', id],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/offers/{id}', {
          params: {
            path: {
              id,
            },
          },
        });

        return data;
      },
    }),
  createCounterOffer: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/offers/{id}/counter', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/offers/{id}/counter', {
          body: { amount: credentials.amount, message: credentials.message },
          params: {
            path: {
              // @ts-ignore
              id: credentials?.id,
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'counter offer failed to send.'));
        }

        return data;
      },
    };
  },
  respondToOffer: (id: string) => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/offers/{id}/respond', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/offers/{id}/respond', {
          body: credentials,
          params: {
            path: {
              id,
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'response to offer failed to send.'));
        }

        return data;
      },
    };
  },

  // payment endpoints
  initializePayment: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/payments/initialize', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/payments/initialize', {
          body: credentials,
        });

        console.log(error);

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to initialize payment.'));
        }

        return data;
      },
    };
  },
  verifyPayment: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/payments/verify', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/payments/verify', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to verify payment'));
        }

        return data;
      },
    };
  },
  getPaymentDetail: (id: string) =>
    queryOptions({
      queryKey: ['payment', id],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/payments/{id}', {
          params: {
            path: {
              id,
            },
          },
        });

        return data;
      },
    }),
  getJobPayment: (jobId: string) =>
    queryOptions({
      queryKey: ['payment', 'job', jobId],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/payments/job/{jobId}', {
          params: {
            path: {
              jobId,
            },
          },
        });

        return data;
      },
    }),

  // reviews endpoint
  getArtisanReviews: (artisanId: string) =>
    queryOptions({
      queryKey: ['reviews', 'artisan', artisanId],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/reviews/artisan/{artisanId}', {
          params: {
            path: {
              artisanId,
            },
          },
        });

        return data;
      },
    }),
  getArtisanStata: (artisanId: string) =>
    queryOptions({
      queryKey: ['reviews', 'stats', 'artisan', artisanId],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/reviews/artisan/{artisanId}/stats', {
          params: {
            path: {
              artisanId,
            },
          },
        });

        return data;
      },
    }),
  createReview: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/reviews', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/reviews', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to submit review'));
        }

        return data;
      },
    };
  },

  // notification endpoints
  getNotifications: () =>
    queryOptions({
      queryKey: ['user', 'notifications'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/notifications');

        return data;
      },
    }),
  getUnreadNotificationCount: () =>
    queryOptions({
      queryKey: ['user', 'notifications', 'unread'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/notifications/unread-count');

        return data;
      },
    }),
  markAllNotificationAsRead: () => {
    return {
      mutationFn: async () => {
        const { data, error } = await apiClient.POST('/api/notifications/mark-all-read');

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to mark all notifications as read.'));
        }

        return data;
      },
    };
  },
  registerDeviceForPushNotification: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/notifications/devices', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/notifications/devices', {
          body: credentials,
        });

        if (error) {
          throw new Error(
            getErrorMessage(error, 'Failed to register device for push notification')
          );
        }

        return data;
      },
    };
  },
  unregisterDeviceForPushNotification: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/notifications/devices', 'delete'>) => {
        const { data, error } = await apiClient.DELETE('/api/notifications/devices', {
          body: credentials,
        });

        if (error) {
          throw new Error(
            getErrorMessage(error, 'Failed to unregister device for push notification')
          );
        }

        return data;
      },
    };
  },

  // chat  endpoints
  getChatRoom: (jobId: string) =>
    queryOptions({
      queryKey: ['job', 'chat', 'room', jobId],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/chat/jobs/{jobId}', {
          params: {
            path: {
              jobId,
            },
          },
        });

        return data;
      },
    }),
  getMessagesChatRoom: (id: string) =>
    queryOptions({
      queryKey: ['chat', 'room', id, 'messages'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/chat/rooms/{id}/messages', {
          params: {
            path: {
              id,
            },
          },
        });

        return data;
      },
    }),
  sendMessage: (id: string) => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/chat/rooms/{id}/messages', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/chat/rooms/{id}/messages', {
          body: credentials,
          params: {
            path: {
              id,
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to send message.'));
        }

        return data;
      },
    };
  },

  // disputes endpoints
  createDispute: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/disputes', 'post'>) => {
        const formData = new FormData();

        const fields = ['jobId', 'disputeType', 'description'];

        // Append only non-empty fields
        fields.forEach((field) => {
          const value = credentials[field];

          if (value !== undefined && value !== null && value !== '') {
            formData.append(field, String(value));
          }
        });

        // @ts-ignore
        if (credentials.media && credentials.media.length > 0) {
          // @ts-ignore
          credentials.media.forEach((media, index) => {
            const extension = getFileExtension(media.url, media.mimeType);

            const file = {
              uri: normalizePath(media.url),
              type: media.mimeType || 'image/jpg',
              name: media.name || `media_${index}_${Date.now()}.${extension}`,
            };
            // @ts-ignore - FormData typing issue in React Native
            formData.append('media', file);
          });
        }

        const { data, error } = await apiClient.POST('/api/disputes', {
          // @ts-ignore - FormData not properly typed in openapi-fetch
          body: formData,
          bodySerializer: () => formData,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to create dispute.'));
        }

        return data;
      },
    };
  },
  getMyDisputes: () =>
    queryOptions({
      queryKey: ['disputes'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/disputes');

        return data;
      },
    }),
  getDisputeDetail: (id: string) =>
    queryOptions({
      queryKey: ['disputes', id],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/disputes/{id}', {
          params: {
            path: {
              id,
            },
          },
        });

        return data;
      },
    }),
  addDisputeEvidence: (id: string) => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/disputes/{id}/evidence', 'post'>) => {
        const { data, error } = await apiClient.POST('/api/disputes/{id}/evidence', {
          body: credentials,
          params: {
            path: {
              id,
            },
          },
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Failed to add dispute evidence.'));
        }

        return data;
      },
    };
  },

  // legal endpoints
  getPrivacyPolicy: () =>
    queryOptions({
      queryKey: ['privacy'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/privacy-policy');

        return data;
      },
    }),
  getTerms: () =>
    queryOptions({
      queryKey: ['terms'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/terms-and-conditions');

        return data;
      },
    }),
  getCancellationPolicy: () =>
    queryOptions({
      queryKey: ['cancellation', 'policy'],
      queryFn: async () => {
        const { data } = await apiClient.GET('/api/cancellation-policy');

        return data;
      },
    }),
};
