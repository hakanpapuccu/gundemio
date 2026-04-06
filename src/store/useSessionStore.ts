import { create } from 'zustand';

import { GUEST_USER_ID } from '../constants/session';
import type { SessionProfile, SessionStatus } from '../types/session';

const guestProfile: SessionProfile = {
  userId: GUEST_USER_ID,
  email: null,
  displayName: 'Misafir Kullanici',
};

type SessionStore = {
  status: SessionStatus;
  initialized: boolean;
  hasSupabaseAuth: boolean;
  profile: SessionProfile;
  errorMessage: string | null;
  setHasSupabaseAuth: (hasSupabaseAuth: boolean) => void;
  setLoading: () => void;
  setGuestSession: (params?: { errorMessage?: string | null }) => void;
  setAuthenticatedSession: (profile: SessionProfile) => void;
  setErrorMessage: (message: string | null) => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
  status: 'idle',
  initialized: false,
  hasSupabaseAuth: false,
  profile: guestProfile,
  errorMessage: null,
  setHasSupabaseAuth: (hasSupabaseAuth) =>
    set({
      hasSupabaseAuth,
    }),
  setLoading: () =>
    set((state) => ({
      status: state.initialized ? state.status : 'loading',
      errorMessage: null,
    })),
  setGuestSession: (params) =>
    set({
      status: 'guest',
      initialized: true,
      profile: guestProfile,
      errorMessage: params?.errorMessage ?? null,
    }),
  setAuthenticatedSession: (profile) =>
    set({
      status: 'authenticated',
      initialized: true,
      profile,
      errorMessage: null,
    }),
  setErrorMessage: (message) =>
    set({
      errorMessage: message,
    }),
}));
