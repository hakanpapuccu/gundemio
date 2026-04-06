export type SessionStatus = 'idle' | 'loading' | 'guest' | 'authenticated';

export type SessionProfile = {
  userId: string;
  email: string | null;
  displayName: string;
};

export type AuthActionResult = {
  ok: boolean;
  message?: string;
  requiresEmailConfirmation?: boolean;
};
