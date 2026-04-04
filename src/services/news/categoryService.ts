import type { Category } from '../../domain/models/news';
import type { Database } from '../../types/supabase';
import { getSupabaseClient } from '../supabase/client';
import { logMockFallback, shouldUseMockFallback } from './fallback';
import { getMockCategories, getMockCategoriesByIds } from './mockData';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function listCategories(): Promise<Category[]> {
  const client = getSupabaseClient();
  if (!client) {
    return getMockCategories();
  }

  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    if (shouldUseMockFallback(error)) {
      logMockFallback('listCategories', error);
      return getMockCategories();
    }
    throw error;
  }

  return (data ?? []).map(mapCategoryRow);
}

export async function getCategoryMapByIds(ids: string[]): Promise<Record<string, Category>> {
  if (ids.length === 0) {
    return {};
  }

  const client = getSupabaseClient();
  if (!client) {
    return getMockCategoriesByIds(ids);
  }

  const { data, error } = await client.from('categories').select('*').in('id', ids);

  if (error) {
    if (shouldUseMockFallback(error)) {
      logMockFallback('getCategoryMapByIds', error);
      return getMockCategoriesByIds(ids);
    }
    throw error;
  }

  return (data ?? []).reduce<Record<string, Category>>((acc, row) => {
    const category = mapCategoryRow(row);
    acc[category.id] = category;
    return acc;
  }, {});
}
