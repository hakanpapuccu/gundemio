import type { PaginatedResult, Source } from '../../domain/models/news';
import type { Database } from '../../types/supabase';
import { getSupabaseClient } from '../supabase/client';
import { logMockFallback, shouldUseMockFallback } from './fallback';
import { getMockSourceByIdentifier, getMockSources, getMockSourcesByIds } from './mockData';
import { createPaginatedResult, resolvePagination } from './pagination';
import type { ListSourcesParams } from './types';

type SourceRow = Database['public']['Tables']['sources']['Row'];

function mapSourceRow(row: SourceRow): Source {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    websiteUrl: row.website_url,
    logoUrl: row.logo_url,
    categoryId: row.category_id,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function listSources(params: ListSourcesParams = {}): Promise<PaginatedResult<Source>> {
  const client = getSupabaseClient();
  if (!client) {
    return getMockSources(params);
  }

  const { page, limit, from, to } = resolvePagination(params.page, params.limit);
  const categoryIds = params.categoryIds?.filter(Boolean) ?? [];
  const search = params.search?.trim();

  let query = client
    .from('sources')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('name', { ascending: true })
    .range(from, to);

  if (categoryIds.length > 0) {
    query = query.in('category_id', categoryIds);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    if (shouldUseMockFallback(error)) {
      logMockFallback('listSources', error);
      return getMockSources(params);
    }
    throw error;
  }

  return createPaginatedResult({
    items: (data ?? []).map(mapSourceRow),
    page,
    limit,
    total: count ?? null,
  });
}

export async function getSourceMapByIds(ids: string[]): Promise<Record<string, Source>> {
  if (ids.length === 0) {
    return {};
  }

  const client = getSupabaseClient();
  if (!client) {
    return getMockSourcesByIds(ids);
  }

  const { data, error } = await client.from('sources').select('*').in('id', ids);

  if (error) {
    if (shouldUseMockFallback(error)) {
      logMockFallback('getSourceMapByIds', error);
      return getMockSourcesByIds(ids);
    }
    throw error;
  }

  return (data ?? []).reduce<Record<string, Source>>((acc, row) => {
    const source = mapSourceRow(row);
    acc[source.id] = source;
    return acc;
  }, {});
}

export async function getSourceByIdentifier(identifier: string): Promise<Source | null> {
  const client = getSupabaseClient();
  if (!client) {
    return getMockSourceByIdentifier(identifier);
  }

  const bySlug = await client
    .from('sources')
    .select('*')
    .eq('slug', identifier)
    .maybeSingle();

  if (bySlug.error) {
    if (shouldUseMockFallback(bySlug.error)) {
      logMockFallback('getSourceByIdentifier:slug', bySlug.error);
      return getMockSourceByIdentifier(identifier);
    }
    throw bySlug.error;
  }

  if (bySlug.data) {
    return mapSourceRow(bySlug.data);
  }

  if (!isUuid(identifier)) {
    return null;
  }

  const byId = await client
    .from('sources')
    .select('*')
    .eq('id', identifier)
    .maybeSingle();

  if (byId.error) {
    if (shouldUseMockFallback(byId.error)) {
      logMockFallback('getSourceByIdentifier:id', byId.error);
      return getMockSourceByIdentifier(identifier);
    }
    throw byId.error;
  }

  return byId.data ? mapSourceRow(byId.data) : null;
}
