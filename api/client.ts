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

const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;
// Multipart/form-data (image/file) uploads get more time than regular JSON requests.
const UPLOAD_REQUEST_TIMEOUT_MS = 60_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Bounds every openapi-fetch request (and the 401 retry, which reuses this via a cloned Request)
// with a timeout, so a slow/hung connection fails fast instead of leaving the UI stuck.
async function fetchRequestWithTimeout(request: Request): Promise<Response> {
  const isUpload = request.headers.get('content-type')?.includes('multipart/form-data') ?? false;
  const timeoutMs = isUpload ? UPLOAD_REQUEST_TIMEOUT_MS : DEFAULT_REQUEST_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (request.signal.aborted) {
    controller.abort();
  } else {
    request.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    return await fetch(new Request(request, { signal: controller.signal }));
  } finally {
    clearTimeout(timer);
  }
}

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
    // Only true when the server has explicitly rejected the refresh token (invalid/expired/missing).
    // A network error or timeout must NOT set this — those are transient and shouldn't log the user out.
    let authRejected = false;

    try {
      const refreshToken = await tokenStorage.getRefreshToken();

      if (!refreshToken) {
        console.error('❌ No refresh token available');
        authRejected = true;
        throw new Error('No refresh token');
      }

      console.log('🔄 Refreshing access token...');

      // Use direct fetch instead of client to ensure it works in background tasks
      const response = await fetchWithTimeout(
        `${BASE_URL}/api/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        },
        DEFAULT_REQUEST_TIMEOUT_MS
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Token refresh failed:', errorText);
        authRejected = true;
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      if (!data.accessToken) {
        console.error('❌ No access token in response');
        authRejected = true;
        throw new Error('No access token in response');
      }

      // Store new tokens
      await tokenStorage.setTokens(data.accessToken, data.refreshToken || refreshToken);
      console.log('✅ Access token refreshed successfully');

      return data.accessToken;
    } catch (error) {
      console.error('❌ Token refresh error:', error);

      if (authRejected) {
        // The server genuinely rejected the refresh token — clear tokens and log out.
        await tokenStorage.clearTokens();

        // Only try to update auth state if not in background
        if (!skipInBackground && useAuthStore.getState) {
          useAuthStore.getState().setLoginState(false);
          showSessionExpiredOnce();
        }
      } else {
        // Network error, timeout, or abort — keep the session intact so the caller can retry
        // once connectivity improves, instead of logging the user out for a slow connection.
        console.warn('⚠️ Refresh failed due to a network/timeout error, session kept intact');
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
      request.headers.set('X-Active-Role', 'user');

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
          const retryResponse = await fetchRequestWithTimeout(clonedRequest);

          if (retryResponse.ok || retryResponse.status !== 401) {
            console.log('✅ Retry successful');
            return retryResponse;
          }

          // A fresh token still got 401'd on retry — this is a genuine auth failure, not a network hiccup.
          console.error('❌ Retry still unauthorized with a fresh token');
          await tokenStorage.clearTokens();
          useAuthStore.getState().setLoginState(false);
          showSessionExpiredOnce();
        }
        // If newToken is null, refreshAccessToken() has already handled logout for a genuine
        // auth rejection, or deliberately left the session intact for a network/timeout error.
        // Either way, there's nothing more to do here.
      } catch (error) {
        console.error('❌ Error handling 401:', error);
      }
    }

    return response;
  },
};

const roleMiddleware: Middleware = {
  async onRequest({ request }) {
    request.headers.set('X-Active-Role', 'user');

    return request;
  },
};

export const apiClient = createClient<paths>({ baseUrl: BASE_URL, fetch: fetchRequestWithTimeout });
apiClient.use(authMiddleware);

export const publicApiClient = createClient<paths>({
  baseUrl: BASE_URL,
  fetch: fetchRequestWithTimeout,
});
publicApiClient.use(roleMiddleware);
