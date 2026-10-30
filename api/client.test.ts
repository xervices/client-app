import { jwtDecode } from 'jwt-decode';
import { tokenStorage } from './token-storage';
import { useAuthStore } from '@/store/auth-store';
import { showErrorMessage } from './helpers';

jest.mock('./token-storage', () => ({
  tokenStorage: {
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setRefreshToken: jest.fn(),
    clearTokens: jest.fn(),
    setTokens: jest.fn(),
  },
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

jest.mock('@/store/auth-store', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

jest.mock('./helpers', () => ({
  showErrorMessage: jest.fn(),
}));

// Imported after the mocks above so the module picks up the mocked dependencies.
import { BASE_URL, authMiddleware, isTokenExpired, refreshAccessToken } from './client';

const mockedTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;
const mockedJwtDecode = jwtDecode as jest.Mock;
const mockedShowErrorMessage = showErrorMessage as jest.Mock;
const mockSetLoginState = jest.fn();

function mockFetchSequence(impl: (url: string, init?: RequestInit) => Promise<Response> | Response) {
  globalThis.fetch = jest.fn(impl) as unknown as typeof fetch;
}

function refreshSuccessResponse(accessToken = 'new-access-token', refreshToken = 'new-refresh-token') {
  return new Response(JSON.stringify({ accessToken, refreshToken }), { status: 200 });
}

beforeAll(() => {
  // showSessionExpiredOnce() in client.ts schedules a real 3s setTimeout to reset its
  // "already shown" guard. Fake timers stop that from leaking a real OS timer across
  // tests (and the "Jest did not exit" warning that comes with it).
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  jest.clearAllMocks();
  (useAuthStore.getState as jest.Mock).mockReturnValue({ setLoginState: mockSetLoginState });
});

afterEach(() => {
  // Deterministically reset showSessionExpiredOnce()'s "already shown" guard so each
  // test can independently assert on showErrorMessage without depending on run order.
  jest.advanceTimersByTime(3000);
});

describe('isTokenExpired', () => {
  it('returns false for a token that is not close to expiring', () => {
    mockedJwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

    expect(isTokenExpired('valid-token')).toBe(false);
  });

  it('returns true for a token expiring within the buffer window', () => {
    mockedJwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 100 });

    expect(isTokenExpired('expiring-token', 300)).toBe(true);
  });

  it('returns true for an already-expired token', () => {
    mockedJwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) - 60 });

    expect(isTokenExpired('expired-token')).toBe(true);
  });

  it('returns true when the token has no exp claim', () => {
    mockedJwtDecode.mockReturnValue({});

    expect(isTokenExpired('no-exp-token')).toBe(true);
  });

  it('returns true when the token cannot be decoded', () => {
    mockedJwtDecode.mockImplementation(() => {
      throw new Error('Malformed token');
    });

    expect(isTokenExpired('garbage')).toBe(true);
  });

  it('respects a custom buffer', () => {
    mockedJwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 200 });

    expect(isTokenExpired('token', 100)).toBe(false);
    expect(isTokenExpired('token', 300)).toBe(true);
  });
});

describe('refreshAccessToken', () => {
  it('dedupes concurrent calls into a single network request', async () => {
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    // Created up front so `resolveFetch` is assigned synchronously (the Promise
    // executor runs immediately), regardless of exactly when fetch() ends up
    // being invoked inside the two concurrent refreshAccessToken() calls.
    let resolveFetch: (response: Response) => void;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    mockFetchSequence(() => pendingFetch);

    const call1 = refreshAccessToken();
    const call2 = refreshAccessToken();

    resolveFetch!(refreshSuccessResponse('shared-token'));
    const [result1, result2] = await Promise.all([call1, call2]);

    expect(result1).toBe('shared-token');
    expect(result2).toBe('shared-token');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('stores the new tokens on a successful refresh', async () => {
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    mockFetchSequence(() => refreshSuccessResponse('access-1', 'refresh-1'));

    const token = await refreshAccessToken();

    expect(token).toBe('access-1');
    expect(mockedTokenStorage.setTokens).toHaveBeenCalledWith('access-1', 'refresh-1');
  });

  it('clears the session and logs out when there is no refresh token', async () => {
    mockedTokenStorage.getRefreshToken.mockResolvedValue(null);
    mockFetchSequence(() => refreshSuccessResponse());

    const token = await refreshAccessToken();

    expect(token).toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(mockedTokenStorage.clearTokens).toHaveBeenCalled();
    expect(mockSetLoginState).toHaveBeenCalledWith(false);
  });

  it('clears the session when the server rejects the refresh token', async () => {
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    mockFetchSequence(() => new Response('invalid refresh token', { status: 401 }));

    const token = await refreshAccessToken();

    expect(token).toBeNull();
    expect(mockedTokenStorage.clearTokens).toHaveBeenCalled();
    expect(mockSetLoginState).toHaveBeenCalledWith(false);
    expect(mockedShowErrorMessage).toHaveBeenCalledWith('Session expired, please login again');
  });

  it('does not touch the stored session on a network error', async () => {
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    mockFetchSequence(() => {
      throw new Error('Network request failed');
    });

    const token = await refreshAccessToken();

    expect(token).toBeNull();
    expect(mockedTokenStorage.clearTokens).not.toHaveBeenCalled();
    expect(mockSetLoginState).not.toHaveBeenCalled();
  });

  it('skips updating auth state when skipInBackground is true, even on a genuine rejection', async () => {
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    mockFetchSequence(() => new Response('invalid refresh token', { status: 401 }));

    await refreshAccessToken(true);

    // Tokens are always cleared on a genuine rejection, regardless of background mode.
    expect(mockedTokenStorage.clearTokens).toHaveBeenCalled();
    // But auth state / UI updates are skipped in background contexts.
    expect(mockSetLoginState).not.toHaveBeenCalled();
  });
});

describe('authMiddleware.onRequest', () => {
  it('leaves the request unauthenticated when there is no stored token', async () => {
    mockedTokenStorage.getAccessToken.mockResolvedValue(null);
    const request = new Request('https://api.example.com/jobs');

    const result = await authMiddleware.onRequest!({ request, schemaPath: '', params: {}, id: '' } as any);

    expect((result as Request).headers.get('Authorization')).toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('attaches the Authorization header for a token that is not expiring', async () => {
    mockedTokenStorage.getAccessToken.mockResolvedValue('valid-token');
    mockedJwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
    const request = new Request('https://api.example.com/jobs');

    const result = await authMiddleware.onRequest!({ request, schemaPath: '', params: {}, id: '' } as any);

    expect((result as Request).headers.get('Authorization')).toBe('Bearer valid-token');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('refreshes and attaches the new token when the stored token is expiring', async () => {
    mockedTokenStorage.getAccessToken.mockResolvedValue('expiring-token');
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    mockedJwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 100 });
    mockFetchSequence(() => refreshSuccessResponse('refreshed-token'));
    const request = new Request('https://api.example.com/jobs');

    const result = await authMiddleware.onRequest!({ request, schemaPath: '', params: {}, id: '' } as any);

    expect((result as Request).headers.get('Authorization')).toBe('Bearer refreshed-token');
  });

  it('leaves the request unauthenticated when the refresh fails', async () => {
    mockedTokenStorage.getAccessToken.mockResolvedValue('expiring-token');
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    mockedJwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 100 });
    mockFetchSequence(() => {
      throw new Error('Network request failed');
    });
    const request = new Request('https://api.example.com/jobs');

    const result = await authMiddleware.onRequest!({ request, schemaPath: '', params: {}, id: '' } as any);

    expect((result as Request).headers.get('Authorization')).toBeNull();
  });
});

describe('authMiddleware.onResponse', () => {
  it('passes through non-401 responses untouched', async () => {
    const request = new Request('https://api.example.com/jobs');
    const response = new Response(null, { status: 200 });

    const result = await authMiddleware.onResponse!({
      request,
      response,
      schemaPath: '',
      params: {},
      id: '',
    } as any);

    expect(result).toBe(response);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('retries once with a refreshed token and returns the retry response on success', async () => {
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    mockFetchSequence((url) => {
      if (url.toString().includes('/api/auth/refresh')) {
        return refreshSuccessResponse('refreshed-token');
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const request = new Request('https://api.example.com/jobs');
    const response = new Response(null, { status: 401 });

    const result = await authMiddleware.onResponse!({
      request,
      response,
      schemaPath: '',
      params: {},
      id: '',
    } as any);

    expect((result as Response).status).toBe(200);
    expect(mockedTokenStorage.clearTokens).not.toHaveBeenCalled();
  });

  it('logs out and surfaces a session-expired message when the retry still 401s', async () => {
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    mockFetchSequence((url) => {
      if (url.toString().includes('/api/auth/refresh')) {
        return refreshSuccessResponse('refreshed-token');
      }
      return new Response(null, { status: 401 });
    });

    const request = new Request('https://api.example.com/jobs');
    const originalResponse = new Response(null, { status: 401 });

    const result = await authMiddleware.onResponse!({
      request,
      response: originalResponse,
      schemaPath: '',
      params: {},
      id: '',
    } as any);

    // A fresh token still getting 401'd is a genuine auth failure — the original
    // response is returned, not the retry's.
    expect(result).toBe(originalResponse);
    expect(mockedTokenStorage.clearTokens).toHaveBeenCalled();
    expect(mockSetLoginState).toHaveBeenCalledWith(false);
    expect(mockedShowErrorMessage).toHaveBeenCalledWith('Session expired, please login again');
  });

  it('returns the original 401 response without retrying when refresh fails', async () => {
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    mockFetchSequence(() => {
      throw new Error('Network request failed');
    });

    const request = new Request('https://api.example.com/jobs');
    const originalResponse = new Response(null, { status: 401 });

    const result = await authMiddleware.onResponse!({
      request,
      response: originalResponse,
      schemaPath: '',
      params: {},
      id: '',
    } as any);

    expect(result).toBe(originalResponse);
    expect(mockedTokenStorage.clearTokens).not.toHaveBeenCalled();
  });
});

describe('BASE_URL', () => {
  it('is used as the base for the refresh endpoint', async () => {
    mockedTokenStorage.getRefreshToken.mockResolvedValue('refresh-token-value');
    mockFetchSequence(() => refreshSuccessResponse());

    await refreshAccessToken();

    expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/api/auth/refresh`, expect.any(Object));
  });
});
