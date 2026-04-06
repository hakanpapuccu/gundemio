import { useCallback } from 'react';

import type { AuthActionResult } from '../types/session';
import { useSessionStore } from '../store/useSessionStore';
import {
  getAuthConfigErrorMessage,
  isSupabaseAuthReady,
  parseAuthErrorMessage,
  sendPasswordReset,
  signInWithEmailPassword,
  signOutCurrentUser,
  signUpWithEmailPassword,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
} from '../services/auth/authService';

export function useSession() {
  const status = useSessionStore((state) => state.status);
  const initialized = useSessionStore((state) => state.initialized);
  const profile = useSessionStore((state) => state.profile);
  const hasSupabaseAuth = useSessionStore((state) => state.hasSupabaseAuth);
  const errorMessage = useSessionStore((state) => state.errorMessage);
  const setGuestSession = useSessionStore((state) => state.setGuestSession);
  const setAuthenticatedSession = useSessionStore((state) => state.setAuthenticatedSession);
  const setErrorMessage = useSessionStore((state) => state.setErrorMessage);

  const signIn = useCallback(
    async (params: { email: string; password: string }): Promise<AuthActionResult> => {
      try {
        const nextProfile = await signInWithEmailPassword(params);
        setAuthenticatedSession(nextProfile);
        return { ok: true };
      } catch (error) {
        const message = parseAuthErrorMessage(error);
        setErrorMessage(message);
        return { ok: false, message };
      }
    },
    [setAuthenticatedSession, setErrorMessage]
  );

  const signUp = useCallback(
    async (params: { email: string; password: string }): Promise<AuthActionResult> => {
      try {
        const result = await signUpWithEmailPassword(params);

        if (result.profile && !result.requiresEmailConfirmation) {
          setAuthenticatedSession(result.profile);
          return { ok: true };
        }

        setErrorMessage(null);
        return {
          ok: true,
          requiresEmailConfirmation: result.requiresEmailConfirmation,
          message: result.requiresEmailConfirmation
            ? 'Kayit olusturuldu. Hesabini aktiflestirmek icin e-posta onayi bekleniyor.'
            : undefined,
        };
      } catch (error) {
        const message = parseAuthErrorMessage(error);
        setErrorMessage(message);
        return { ok: false, message };
      }
    },
    [setAuthenticatedSession, setErrorMessage]
  );

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    if (!isSupabaseAuthReady()) {
      setGuestSession();
      return { ok: true, message: getAuthConfigErrorMessage() };
    }

    try {
      await signOutCurrentUser();
      setGuestSession();
      return { ok: true };
    } catch (error) {
      const message = parseAuthErrorMessage(error);
      setGuestSession({ errorMessage: message });
      return { ok: true, message };
    }
  }, [setGuestSession]);

  const continueAsGuest = useCallback(() => {
    setGuestSession();
  }, [setGuestSession]);

  const resetPassword = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      try {
        await sendPasswordReset(email);
        return {
          ok: true,
          message: 'Sifre sifirlama baglantisi e-posta adresine gonderildi.',
        };
      } catch (error) {
        const message = parseAuthErrorMessage(error);
        setErrorMessage(message);
        return { ok: false, message };
      }
    },
    [setErrorMessage]
  );

  const updateProfile = useCallback(
    async (params: {
      displayName: string;
      email: string;
    }): Promise<AuthActionResult> => {
      try {
        const result = await updateCurrentUserProfile(params);
        setAuthenticatedSession(result.profile);
        return {
          ok: true,
          message: result.emailChanged
            ? 'E-posta degisikligi onay gerektirebilir. Gelen kutunu kontrol et.'
            : 'Profil bilgileri guncellendi.',
        };
      } catch (error) {
        const message = parseAuthErrorMessage(error);
        setErrorMessage(message);
        return { ok: false, message };
      }
    },
    [setAuthenticatedSession, setErrorMessage]
  );

  const updatePassword = useCallback(
    async (params: {
      currentPassword: string;
      newPassword: string;
    }): Promise<AuthActionResult> => {
      try {
        await updateCurrentUserPassword(params);
        return {
          ok: true,
          message: 'Sifren guncellendi.',
        };
      } catch (error) {
        const message = parseAuthErrorMessage(error);
        setErrorMessage(message);
        return { ok: false, message };
      }
    },
    [setErrorMessage]
  );

  return {
    initialized,
    status,
    isAuthenticated: status === 'authenticated',
    isGuest: status !== 'authenticated',
    profile,
    activeUserId: profile.userId,
    hasSupabaseAuth,
    errorMessage,
    signIn,
    signUp,
    signOut,
    continueAsGuest,
    resetPassword,
    updateProfile,
    updatePassword,
  };
}
