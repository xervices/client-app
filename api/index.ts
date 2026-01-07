import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { apiClient, publicApiClient } from './client';
import { tokenStorage } from './token-storage';
import { getErrorMessage, RequestBody } from './helpers';
import { useAuthStore } from '@/store/auth-store';

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
          useAuthStore.getState().setLoginState(true);
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
  updateProfile: () => {
    return {
      mutationFn: async (credentials: RequestBody<'/api/users/me', 'patch'>) => {
        const { data, error } = await apiClient.PATCH('/api/users/me', {
          body: credentials,
        });

        if (error) {
          throw new Error(getErrorMessage(error, 'Login failed'));
        }

        // if (data.user) {
        //   useAuthStore.getState().setUser(data.user);
        // }

        return data;
      },
    };
  },
};
