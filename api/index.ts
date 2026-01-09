import { Platform } from 'react-native';
import { queryOptions } from '@tanstack/react-query';

import { apiClient, publicApiClient } from './client';
import { tokenStorage } from './token-storage';
import { getErrorMessage, RequestBody } from './helpers';
import { useAuthStore } from '@/store/auth-store';

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
        const { data, error } = await apiClient.POST('/api/auth/login', {
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
          const file = {
            // @ts-ignore
            uri: normalizePath(credentials.avatarUrl),
            // @ts-ignore - avatarMimeType sent from form but not specified in api
            type: credentials.avatarMimeType || 'image/jpeg',
            name: `avatar_${Date.now()}}`,
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

  // Support tickets endpoint
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
};
