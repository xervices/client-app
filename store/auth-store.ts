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
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      isLoggedIn: false,
      setLoginState: (state) => set({ isLoggedIn: state }),
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => ({
        setItem: (key: string, value: string) => Storage.setItem(key, value),
        getItem: (key: string) => Storage.getItem(key),
        removeItem: (key: string) => Storage.removeItem(key),
      })),
    }
  )
);
