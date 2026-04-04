import type { UserPreferences } from '../../domain/models/news';
import type { Database } from '../../types/supabase';
import { getSupabaseClient } from '../supabase/client';
import { logMockFallback, shouldUseMockFallback } from './fallback';
import { getMockUserPreferences, upsertMockUserPreferences } from './mockData';
import type { UpsertPreferencesInput } from './types';

type UserPreferencesRow = Database['public']['Tables']['user_preferences']['Row'];

function mapPreferencesRow(row: UserPreferencesRow): UserPreferences {
  return {
    userId: row.user_id,
    categoryIds: row.category_ids ?? [],
    sourceIds: row.source_ids ?? [],
    updatedAt: row.updated_at,
  };
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const client = getSupabaseClient();
  if (!client) {
    return getMockUserPreferences(userId);
  }

  const { data, error } = await client
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (shouldUseMockFallback(error)) {
      logMockFallback('getUserPreferences', error);
      return getMockUserPreferences(userId);
    }
    throw error;
  }

  if (!data) {
    return getMockUserPreferences(userId);
  }

  return mapPreferencesRow(data);
}

export async function upsertUserPreferences(input: UpsertPreferencesInput): Promise<UserPreferences> {
  const client = getSupabaseClient();
  if (!client) {
    return upsertMockUserPreferences(input);
  }

  // Backend assumption: user_preferences has a unique row per user_id.
  const { data, error } = await client
    .from('user_preferences')
    .upsert(
      {
        user_id: input.userId,
        category_ids: input.categoryIds,
        source_ids: input.sourceIds,
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();

  if (error) {
    if (shouldUseMockFallback(error)) {
      logMockFallback('upsertUserPreferences', error);
      return upsertMockUserPreferences(input);
    }
    throw error;
  }

  return mapPreferencesRow(data);
}
