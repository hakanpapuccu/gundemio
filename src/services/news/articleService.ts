import type { Article, ArticleFilters, Category, PaginatedResult, Source } from '../../domain/models/news';
import type { Database } from '../../types/supabase';
import { getSupabaseClient } from '../supabase/client';
import { listFavoriteArticleIds } from './favoriteService';
import { logMockFallback, shouldUseMockFallback } from './fallback';
import { getMockArticleById, getMockArticles } from './mockData';
import { createPaginatedResult, resolvePagination } from './pagination';
import { getCategoryMapByIds } from './categoryService';
import { getSourceMapByIds } from './sourceService';
import type { ListArticlesParams } from './types';

type ArticleRow = Database['public']['Tables']['articles']['Row'];

function sanitizeSearchValue(value: string) {
  return value.replaceAll(',', ' ').trim();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function resolveArticleOrder(sortBy?: ArticleFilters['sortBy']) {
  switch (sortBy) {
    case 'popular':
      return {
        column: 'published_at' as const,
        ascending: false,
      };
    case 'latest':
    default:
      return {
        column: 'published_at' as const,
        ascending: false,
      };
  }
}

function mapArticleRow(params: {
  row: ArticleRow;
  sourceMap: Record<string, Source>;
  categoryMap: Record<string, Category>;
  favoriteIds: Set<string>;
}): Article {
  const source = params.sourceMap[params.row.source_id];
  const category = params.row.category_id ? params.categoryMap[params.row.category_id] : undefined;

  return {
    id: params.row.id,
    title: params.row.title,
    summary: params.row.summary,
    content: params.row.content,
    imageUrl: params.row.image_url,
    link: params.row.link,
    publishedAt: params.row.published_at,
    sourceId: params.row.source_id,
    sourceName: source?.name ?? 'Unknown Source',
    categoryId: params.row.category_id,
    categoryName: category?.name ?? null,
    isFavorite: params.favoriteIds.has(params.row.id),
    createdAt: params.row.created_at,
  };
}

async function fetchRelatedMaps(rows: ArticleRow[]) {
  const sourceIds = [...new Set(rows.map((row) => row.source_id))];
  const categoryIds = [...new Set(rows.map((row) => row.category_id).filter((id): id is string => Boolean(id)))];

  const [sourceMap, categoryMap] = await Promise.all([getSourceMapByIds(sourceIds), getCategoryMapByIds(categoryIds)]);

  return { sourceMap, categoryMap };
}

export async function listArticles(params: ListArticlesParams = {}): Promise<PaginatedResult<Article>> {
  const client = getSupabaseClient();
  if (!client) {
    return getMockArticles(params);
  }

  const { page, limit, from, to } = resolvePagination(params.page, params.limit);
  const articleIds = params.filters?.articleIds?.filter(Boolean) ?? [];
  const categoryIds = params.filters?.categoryIds?.filter(Boolean) ?? [];
  const sourceIds = params.filters?.sourceIds?.filter(Boolean) ?? [];
  const search = params.filters?.search?.trim();
  const order = resolveArticleOrder(params.filters?.sortBy);

  if (params.filters?.articleIds && articleIds.length === 0) {
    return createPaginatedResult({
      items: [],
      page,
      limit,
      total: 0,
    });
  }

  let query = client
    .from('articles')
    .select('*', { count: 'exact' })
    .order(order.column, { ascending: order.ascending })
    .range(from, to);

  if (articleIds.length > 0) {
    query = query.in('id', articleIds);
  }

  if (categoryIds.length > 0) {
    query = query.in('category_id', categoryIds);
  }

  if (sourceIds.length > 0) {
    query = query.in('source_id', sourceIds);
  }

  if (search) {
    const sanitizedSearch = sanitizeSearchValue(search);
    query = query.or(`title.ilike.%${sanitizedSearch}%,summary.ilike.%${sanitizedSearch}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    if (shouldUseMockFallback(error)) {
      logMockFallback('listArticles', error);
      return getMockArticles(params);
    }
    throw error;
  }

  const rows = data ?? [];
  const { sourceMap, categoryMap } = await fetchRelatedMaps(rows);
  const favoriteIds = params.userId
    ? new Set(await listFavoriteArticleIds(params.userId, rows.map((row) => row.id)))
    : new Set<string>();

  const items = rows.map((row) =>
    mapArticleRow({
      row,
      sourceMap,
      categoryMap,
      favoriteIds,
    })
  );

  return createPaginatedResult({
    items,
    page,
    limit,
    total: count ?? null,
  });
}

export async function getArticleById(params: { articleId: string; userId?: string }): Promise<Article | null> {
  const client = getSupabaseClient();
  if (!client) {
    return getMockArticleById(params);
  }

  if (!isUuid(params.articleId)) {
    return getMockArticleById(params);
  }

  const { data, error } = await client
    .from('articles')
    .select('*')
    .eq('id', params.articleId)
    .maybeSingle();

  if (error) {
    if (shouldUseMockFallback(error)) {
      logMockFallback('getArticleById', error);
      return getMockArticleById(params);
    }
    throw error;
  }

  if (!data) {
    return null;
  }

  const { sourceMap, categoryMap } = await fetchRelatedMaps([data]);
  const favoriteIds = params.userId
    ? new Set(await listFavoriteArticleIds(params.userId, [params.articleId]))
    : new Set<string>();

  return mapArticleRow({
    row: data,
    sourceMap,
    categoryMap,
    favoriteIds,
  });
}
