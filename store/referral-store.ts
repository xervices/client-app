import { create } from 'zustand';

type ReferralStoreState = {
  code: string | null;
  setCode: (code: string) => void;
  clearCode: () => void;
};

// Deliberately not persisted — `lib/pending-referral.ts` is the durable
// source of truth. This just lets register.tsx react if a link arrives
// while it's already mounted.
export const useReferralStore = create<ReferralStoreState>((set) => ({
  code: null,
  setCode: (code) => set({ code }),
  clearCode: () => set({ code: null }),
}));
