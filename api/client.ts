import createClient, { type Middleware } from 'openapi-fetch';
import { paths } from './schema';
import { tokenStorage } from './token-storage';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { useAuthStore } from '@/store/auth-store';
import { showErrorMessage } from './helpers';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.getxervices.com';

// Staging: https://staging-api.getxervices.com
// Production: https://api.getxervices.com

// Track ongoing refresh to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Track if we've already shown unauthorized error to prevent multiple error messages
let unauthorizedErrorShown = false;

function showSessionExpiredOnce() {
  if (unauthorizedErrorShown) return;
  unauthorizedErrorShown = true;
  showErrorMessage('Session expired, please login again');
  setTimeout(() => {
    unauthorizedErrorShown = false;
  }, 3000);
}

/**
 * Refresh the access token using the refresh token
 * Works in both foreground and background contexts
 * Prevents multiple simultaneous refresh requests
 */
export async function refreshAccessToken(
  skipInBackground: boolean = false
): Promise<string | null> {
  // If already refreshing, wait for that request to complete
  if (isRefreshing && refreshPromise) {
    console.log('⏳ Waiting for ongoing token refresh...');
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();

      if (!refreshToken) {
        console.error('❌ No refresh token available');
        throw new Error('No refresh token');
      }

      console.log('🔄 Refreshing access token...');

      // Use direct fetch instead of client to ensure it works in background tasks
      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Token refresh failed:', errorText);
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      if (!data.accessToken) {
        console.error('❌ No access token in response');
        throw new Error('No access token in response');
      }

      // Store new tokens
      await tokenStorage.setTokens(data.accessToken, data.refreshToken || refreshToken);
      console.log('✅ Access token refreshed successfully');

      return data.accessToken;
    } catch (error) {
      console.error('❌ Token refresh error:', error);

      // Clear tokens and logout on refresh failure
      await tokenStorage.clearTokens();

      // Only try to update auth state if not in background
      if (!skipInBackground && useAuthStore.getState) {
        useAuthStore.getState().setLoginState(false);
        showSessionExpiredOnce();
      }

      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Check if token is expired or about to expire (within 5 minutes)
 */
function isTokenExpired(token: string, bufferSeconds = 300): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);

    if (!decoded.exp) {
      return true;
    }

    const expirationTime = dayjs.unix(decoded.exp);
    const currentTime = dayjs();
    const secondsUntilExpiry = expirationTime.diff(currentTime, 'second');

    // Consider token expired if it expires within the buffer period
    return secondsUntilExpiry < bufferSeconds;
  } catch (error) {
    console.error('❌ Token decode error:', error);
    return true;
  }
}

// Auth middleware that adds the access token to requests
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    try {
      // Add the role header to every request
      request.headers.set('X-Active-Role', 'artisan');

      let token = await tokenStorage.getAccessToken();

      if (!token) {
        console.log('ℹ️ No access token available');
        return request;
      }

      // Check if token is expired or about to expire (within 5 minutes)
      if (isTokenExpired(token, 300)) {
        console.log('⚠️ Access token expired or expiring soon, refreshing...');

        // Refresh the token
        const newToken = await refreshAccessToken();

        if (newToken) {
          token = newToken;
        } else {
          // Refresh failed, don't add auth header
          console.error('❌ Could not refresh token, request will be unauthenticated');
          return request;
        }
      }

      // Add valid token to request
      request.headers.set('Authorization', `Bearer ${token}`);
    } catch (error) {
      console.error('❌ Auth middleware error:', error);
    }

    return request;
  },

  async onResponse({ request, response }) {
    // Handle 401 unauthorized responses
    if (response.status === 401) {
      console.log('🔒 Received 401, attempting token refresh and retry...');

      try {
        // Try to refresh the token
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Clone the original request
          const clonedRequest = request.clone();

          // Update the Authorization header
          clonedRequest.headers.set('Authorization', `Bearer ${newToken}`);

          // Retry the request with new token
          console.log('🔄 Retrying request with new token...');
          const retryResponse = await fetch(clonedRequest);

          if (retryResponse.ok || retryResponse.status !== 401) {
            console.log('✅ Retry successful');
            return retryResponse;
          }
        }

        console.error('❌ Token refresh failed or retry still unauthorized');
        await tokenStorage.clearTokens();
        useAuthStore.getState().setLoginState(false);
        showSessionExpiredOnce();
      } catch (error) {
        console.error('❌ Error handling 401:', error);
        if (error?.error === 'Unauthorized') {
          await tokenStorage.clearTokens();
          useAuthStore.getState().setLoginState(false);
          showSessionExpiredOnce();
        }
      }
    }

    return response;
  },
};

const roleMiddleware: Middleware = {
  async onRequest({ request }) {
    request.headers.set('X-Active-Role', 'artisan');

    return request;
  },
};

export const apiClient = createClient<paths>({ baseUrl: BASE_URL });
apiClient.use(authMiddleware);

export const publicApiClient = createClient<paths>({ baseUrl: BASE_URL });
publicApiClient.use(roleMiddleware);
