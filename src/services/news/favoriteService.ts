import type { Favorite } from '../../domain/models/news';
import type { Database } from '../../types/supabase';
import { getSupabaseClient } from '../supabase/client';
import { logMockFallback, shouldUseMockFallback } from './fallback';
import { localFavoritePersistence } from './favoritePersistence';
import type { ToggleFavoriteInput } from './types';

type FavoriteRow = Database['public']['Tables']['favorites']['Row'];

function mapFavoriteRow(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    userId: row.user_id,
    articleId: row.article_id,
    createdAt: row.created_at,
  };
}

export async function listFavoriteArticleIds(userId: string, articleIds?: string[]): Promise<string[]> {
  const client = getSupabaseClient();
  if (!client) {
    return localFavoritePersistence.listFavoriteArticleIds(userId, articleIds);
  }

  let query = client.from('favorites').select('article_id').eq('user_id', userId);

  if (articleIds && articleIds.length > 0) {
    query = query.in('article_id', articleIds);
  }

  const { data, error } = await query;

  if (error) {
    if (shouldUseMockFallback(error)) {
      logMockFallback('listFavoriteArticleIds', error);
      return localFavoritePersistence.listFavoriteArticleIds(userId, articleIds);
    }
    throw error;
  }

  return (data ?? []).map((row) => row.article_id);
}

export async function toggleFavorite(input: ToggleFavoriteInput): Promise<Favorite> {
  const client = getSupabaseClient();
  if (!client) {
    return localFavoritePersistence.toggleFavorite(input);
  }

  if (!input.isFavorite) {
    const { error } = await client
      .from('favorites')
      .delete()
      .eq('user_id', input.userId)
      .eq('article_id', input.articleId);

    if (error) {
      if (shouldUseMockFallback(error)) {
        logMockFallback('toggleFavorite:delete', error);
        return localFavoritePersistence.toggleFavorite(input);
      }
      throw error;
    }

    return {
      id: `${input.userId}-${input.articleId}`,
      userId: input.userId,
      articleId: input.articleId,
      createdAt: new Date().toISOString(),
    };
  }

  // Backend assumption: favorites has a unique constraint on (user_id, article_id).
  const { data, error } = await client
    .from('favorites')
    .upsert(
      {
        user_id: input.userId,
        article_id: input.articleId,
      },
      { onConflict: 'user_id,article_id' }
    )
    .select('*')
    .single();

  if (error) {
    if (shouldUseMockFallback(error)) {
      logMockFallback('toggleFavorite:upsert', error);
      return localFavoritePersistence.toggleFavorite(input);
    }
    throw error;
  }

  return mapFavoriteRow(data);
}
