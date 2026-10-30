jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/lib/posthog', () => ({
  posthog: { reset: jest.fn() },
}));

import { useAuthStore } from './auth-store';
import { posthog } from '@/lib/posthog';

// Grabbed after the mock is loaded — `import` statements execute before any
// top-level `const`, so a jest.fn() built here can't be injected into the
// factory above; it needs to be read back out instead.
const mockPosthogReset = posthog!.reset as jest.Mock;

const initialState = useAuthStore.getState();

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState(initialState, true);
});

describe('setLoginState', () => {
  it('logs the user in and clears guest mode', () => {
    useAuthStore.setState({ isGuest: true });

    useAuthStore.getState().setLoginState(true);

    expect(useAuthStore.getState().isLoggedIn).toBe(true);
    expect(useAuthStore.getState().isGuest).toBe(false);
  });

  it('logs the user out, clears the user, and resets PostHog', () => {
    useAuthStore.setState({
      isLoggedIn: true,
      user: { id: 'user-1' } as any,
    });

    useAuthStore.getState().setLoginState(false);

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(mockPosthogReset).toHaveBeenCalled();
  });

  it('preserves guest mode across logout', () => {
    useAuthStore.setState({ isLoggedIn: true, isGuest: true });

    useAuthStore.getState().setLoginState(false);

    expect(useAuthStore.getState().isGuest).toBe(true);
  });
});

describe('user', () => {
  it('setUser stores the user', () => {
    const user = { id: 'user-1' } as any;

    useAuthStore.getState().setUser(user);

    expect(useAuthStore.getState().user).toBe(user);
  });

  it('clearUser removes the stored user', () => {
    useAuthStore.setState({ user: { id: 'user-1' } as any });

    useAuthStore.getState().clearUser();

    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('guest mode', () => {
  it('setGuestMode toggles isGuest independently of login state', () => {
    useAuthStore.getState().setGuestMode(true);
    expect(useAuthStore.getState().isGuest).toBe(true);

    useAuthStore.getState().setGuestMode(false);
    expect(useAuthStore.getState().isGuest).toBe(false);
  });
});

describe('onboarding', () => {
  it('completeOnboarding marks onboarding as complete', () => {
    useAuthStore.getState().completeOnboarding();
    expect(useAuthStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it('resetOnboarding marks onboarding as incomplete', () => {
    useAuthStore.setState({ hasCompletedOnboarding: true });

    useAuthStore.getState().resetOnboarding();

    expect(useAuthStore.getState().hasCompletedOnboarding).toBe(false);
  });
});

describe('pendingRedirect', () => {
  it('consumePendingRedirect returns and clears a stored path', () => {
    useAuthStore.getState().setPendingRedirect('/jobs/123');

    const path = useAuthStore.getState().consumePendingRedirect();

    expect(path).toBe('/jobs/123');
    expect(useAuthStore.getState().pendingRedirect).toBeNull();
  });

  it('consumePendingRedirect returns null when nothing is pending', () => {
    const path = useAuthStore.getState().consumePendingRedirect();

    expect(path).toBeNull();
  });
});
