import createClient, { type Middleware } from 'openapi-fetch';
import { paths } from './schema';
import { tokenStorage } from './token-storage';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { useAuthStore } from '@/store/auth-store';
import { showErrorMessage } from './helpers';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://server-api-bibv.onrender.com';

// Auth middleware that adds the access token to requests
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();

    if (token) {
      const decodedAccessToken = jwtDecode(token);

      const isAccessTokenExpired = decodedAccessToken.exp
        ? dayjs.unix(decodedAccessToken.exp).diff(dayjs()) < 1
        : true;

      if (isAccessTokenExpired) {
        if (refreshToken) {
          const refreshClient = createClient<paths>({ baseUrl: BASE_URL });

          const { data } = await refreshClient.POST('/api/auth/refresh', {
            body: { refreshToken },
          });

          if (data) {
            await tokenStorage.setTokens(data.accessToken, data.refreshToken || refreshToken);

            request.headers.set('Authorization', `Bearer ${data.accessToken}`);
          }
        }
      } else {
        request.headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return request;
  },

  async onResponse({ response }) {
    // Handle 401 unauthorized responses
    if (response.status === 401) {
      await tokenStorage.clearTokens();

      useAuthStore.getState().setLoginState(false);

      showErrorMessage('Session expired, login to continue using the app!');
    }

    return response;
  },
};

export const apiClient = createClient<paths>({ baseUrl: BASE_URL });
apiClient.use(authMiddleware);

export const publicApiClient = createClient<paths>({ baseUrl: BASE_URL });
