import type { User, UserAttributes } from '@supabase/supabase-js';

import type { SessionProfile } from '../../types/session';
import { hasSupabaseConfig, supabase } from '../supabase/client';

const AUTH_CONFIG_ERROR_MESSAGE =
  'Supabase kimlik dogrulama ayarlari eksik. Lutfen ortam degiskenlerini kontrol et.';

function getAuthClient() {
  if (!supabase || !hasSupabaseConfig) {
    throw new Error(AUTH_CONFIG_ERROR_MESSAGE);
  }

  return supabase;
}

function parseDisplayName(user: User) {
  const metadata = user.user_metadata ?? {};
  const fullName = metadata.full_name ?? metadata.name ?? metadata.display_name;

  if (typeof fullName === 'string' && fullName.trim().length > 0) {
    return fullName.trim();
  }

  if (user.email) {
    return user.email.split('@')[0] ?? 'Kullanici';
  }

  return 'Kullanici';
}

export function mapAuthUserToProfile(user: User): SessionProfile {
  return {
    userId: user.id,
    email: user.email ?? null,
    displayName: parseDisplayName(user),
  };
}

export function getAuthConfigErrorMessage() {
  return AUTH_CONFIG_ERROR_MESSAGE;
}

export function isSupabaseAuthReady() {
  return Boolean(supabase && hasSupabaseConfig);
}

export function parseAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Kimlik dogrulama islemi su anda tamamlanamadi.';
}

export async function getCurrentSessionProfile(): Promise<SessionProfile | null> {
  if (!supabase || !hasSupabaseConfig) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const user = data.session?.user;
  return user ? mapAuthUserToProfile(user) : null;
}

export function subscribeToAuthStateChanges(
  onChange: (profile: SessionProfile | null) => void
) {
  if (!supabase || !hasSupabaseConfig) {
    return null;
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    onChange(user ? mapAuthUserToProfile(user) : null);
  });

  return () => {
    data.subscription.unsubscribe();
  };
}

export async function signInWithEmailPassword(params: {
  email: string;
  password: string;
}): Promise<SessionProfile> {
  const client = getAuthClient();

  const { data, error } = await client.auth.signInWithPassword({
    email: params.email.trim(),
    password: params.password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Giris yapildi ancak kullanici bilgisi alinmadi.');
  }

  return mapAuthUserToProfile(data.user);
}

export async function signUpWithEmailPassword(params: {
  email: string;
  password: string;
}): Promise<{ profile: SessionProfile | null; requiresEmailConfirmation: boolean }> {
  const client = getAuthClient();

  const { data, error } = await client.auth.signUp({
    email: params.email.trim(),
    password: params.password,
  });

  if (error) {
    throw error;
  }

  const profile = data.user ? mapAuthUserToProfile(data.user) : null;
  return {
    profile,
    requiresEmailConfirmation: !data.session,
  };
}

export async function signOutCurrentUser() {
  const client = getAuthClient();
  const { error } = await client.auth.signOut({ scope: 'local' });

  if (error) {
    throw error;
  }
}

export async function sendPasswordReset(email: string) {
  const client = getAuthClient();
  const { error } = await client.auth.resetPasswordForEmail(email.trim());

  if (error) {
    throw error;
  }
}

export async function updateCurrentUserProfile(params: {
  displayName: string;
  email: string;
}): Promise<{ profile: SessionProfile; emailChanged: boolean }> {
  const client = getAuthClient();
  const nextDisplayName = params.displayName.trim();
  const nextEmail = params.email.trim().toLowerCase();

  const {
    data: currentUserData,
    error: currentUserError,
  } = await client.auth.getUser();

  if (currentUserError) {
    throw currentUserError;
  }

  const currentUser = currentUserData.user;
  if (!currentUser) {
    throw new Error('Aktif kullanici bulunamadi.');
  }

  const updates: UserAttributes = {};
  const currentDisplayName = parseDisplayName(currentUser);
  const shouldUpdateName = nextDisplayName.length > 0 && nextDisplayName !== currentDisplayName;
  const shouldUpdateEmail =
    nextEmail.length > 0 && currentUser.email?.toLowerCase() !== nextEmail;

  if (shouldUpdateName) {
    updates.data = {
      ...(currentUser.user_metadata ?? {}),
      full_name: nextDisplayName,
      display_name: nextDisplayName,
      name: nextDisplayName,
    };
  }

  if (shouldUpdateEmail) {
    updates.email = nextEmail;
  }

  if (!shouldUpdateName && !shouldUpdateEmail) {
    return {
      profile: mapAuthUserToProfile(currentUser),
      emailChanged: false,
    };
  }

  const { data, error } = await client.auth.updateUser(updates);
  if (error) {
    throw error;
  }

  const updatedUser = data.user;
  if (!updatedUser) {
    throw new Error('Profil guncellenemedi.');
  }

  return {
    profile: mapAuthUserToProfile(updatedUser),
    emailChanged: shouldUpdateEmail,
  };
}

export async function updateCurrentUserPassword(params: {
  currentPassword: string;
  newPassword: string;
}) {
  const client = getAuthClient();

  const {
    data: currentUserData,
    error: currentUserError,
  } = await client.auth.getUser();

  if (currentUserError) {
    throw currentUserError;
  }

  const currentUser = currentUserData.user;
  if (!currentUser) {
    throw new Error('Aktif kullanici bulunamadi.');
  }

  if (!currentUser.email) {
    throw new Error('Sifre guncelleme icin e-posta bilgisi gerekli.');
  }

  const { error: verifyError } = await client.auth.signInWithPassword({
    email: currentUser.email,
    password: params.currentPassword,
  });

  if (verifyError) {
    throw new Error('Mevcut sifre dogrulanamadi.');
  }

  const { error: updateError } = await client.auth.updateUser({
    password: params.newPassword,
  });

  if (updateError) {
    throw updateError;
  }
}
