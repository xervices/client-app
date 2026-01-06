import createClient, { type Middleware } from 'openapi-fetch';
import { paths } from './schema';
import { tokenStorage } from './token-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://server-api-bibv.onrender.com';

// Auth middleware that adds the access token to requests
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await tokenStorage.getAccessToken();

    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    return request;
  },

  async onResponse({ response }) {
    // Handle 401 unauthorized responses
    if (response.status === 401) {
      // Token might be expired, attempt refresh
      const refreshed = await refreshAccessToken();

      if (!refreshed) {
        // Refresh failed, clear tokens and redirect to login
        await tokenStorage.clearTokens();
        // You can emit an event here or use a global state to trigger logout
        // Example: EventEmitter.emit('unauthorized');
      }
    }

    return response;
  },
};

// Function to refresh the access token
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    // Create a client without middleware for the refresh request
    const refreshClient = createClient<paths>({ baseUrl: BASE_URL });

    const { data, error } = await refreshClient.POST('/api/auth/refresh', {
      body: { refreshToken },
    });

    if (error || !data) {
      return false;
    }

    // Store the new tokens
    await tokenStorage.setTokens(data.accessToken, data.refreshToken || refreshToken);

    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

export const apiClient = createClient<paths>({ baseUrl: BASE_URL });
apiClient.use(authMiddleware);

export const publicApiClient = createClient<paths>({ baseUrl: BASE_URL });
