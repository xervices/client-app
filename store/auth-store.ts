import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import Storage from 'expo-sqlite/kv-store';
import { paths } from '@/api/schema';

export type UserType =
  paths['/api/auth/login']['post']['responses'][200]['content']['application/json']['user'];
export type TokensType =
  paths['/api/auth/login']['post']['responses'][200]['content']['application/json']['tokens'];

type AuthStoreState = {
  user: UserType | null;
  setUser: (user: UserType) => void;
  clearUser: () => void;
  isLoggedIn: boolean;
  setLoginState: (state: boolean) => void;
  isGuest: boolean;
  setGuestMode: (state: boolean) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  pendingRedirect: string | null;
  setPendingRedirect: (path: string | null) => void;
  consumePendingRedirect: () => string | null;
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      isLoggedIn: false,
      setLoginState: (state) => set({ isLoggedIn: state, isGuest: state ? false : get().isGuest }),
      isGuest: false,
      setGuestMode: (state) => set({ isGuest: state }),
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
      pendingRedirect: null,
      setPendingRedirect: (path) => set({ pendingRedirect: path }),
      consumePendingRedirect: () => {
        const path = get().pendingRedirect;
        if (path) set({ pendingRedirect: null });
        return path;
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => ({
        setItem: (key: string, value: string) => Storage.setItem(key, value),
        getItem: (key: string) => Storage.getItem(key),
        removeItem: (key: string) => Storage.removeItem(key),
      })),
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isGuest: state.isGuest,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
