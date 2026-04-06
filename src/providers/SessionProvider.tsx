import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { useSessionStore } from '../store/useSessionStore';
import {
  getCurrentSessionProfile,
  isSupabaseAuthReady,
  parseAuthErrorMessage,
  subscribeToAuthStateChanges,
} from '../services/auth/authService';

export function SessionProvider({ children }: PropsWithChildren) {
  const initialized = useSessionStore((state) => state.initialized);
  const setHasSupabaseAuth = useSessionStore((state) => state.setHasSupabaseAuth);
  const setLoading = useSessionStore((state) => state.setLoading);
  const setGuestSession = useSessionStore((state) => state.setGuestSession);
  const setAuthenticatedSession = useSessionStore((state) => state.setAuthenticatedSession);

  useEffect(() => {
    if (initialized) {
      return;
    }

    const authReady = isSupabaseAuthReady();
    setHasSupabaseAuth(authReady);
    setLoading();

    if (!authReady) {
      setGuestSession();
      return;
    }

    let isMounted = true;

    const unsubscribe = subscribeToAuthStateChanges((profile) => {
      if (!isMounted) {
        return;
      }

      if (profile) {
        setAuthenticatedSession(profile);
        return;
      }

      setGuestSession();
    });

    const hydrateSession = async () => {
      try {
        const profile = await getCurrentSessionProfile();
        if (!isMounted) {
          return;
        }

        if (profile) {
          setAuthenticatedSession(profile);
          return;
        }

        setGuestSession();
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setGuestSession({
          errorMessage: parseAuthErrorMessage(error),
        });
      }
    };

    void hydrateSession();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [
    initialized,
    setAuthenticatedSession,
    setGuestSession,
    setHasSupabaseAuth,
    setLoading,
  ]);

  return <>{children}</>;
}
