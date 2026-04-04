import type { ArticleFilters } from '../../domain/models/news';
import type { ListSourcesParams } from '../../services/news';

function normalizeIds(values?: string[]) {
  return [...(values ?? [])].filter(Boolean).sort();
}

function normalizeSearch(value?: string) {
  return value?.trim() ?? '';
}

export function createArticleFilterKey(filters?: ArticleFilters) {
  return {
    categoryIds: normalizeIds(filters?.categoryIds),
    sourceIds: normalizeIds(filters?.sourceIds),
    search: normalizeSearch(filters?.search),
  };
}

export function createSourceFilterKey(params?: ListSourcesParams) {
  return {
    categoryIds: normalizeIds(params?.categoryIds),
    search: normalizeSearch(params?.search),
    page: params?.page ?? 1,
    limit: params?.limit ?? null,
  };
}

export const newsQueryKeys = {
  categories: ['news', 'categories'] as const,
  sources: (params?: ListSourcesParams) => ['news', 'sources', createSourceFilterKey(params)] as const,
  articles: (params?: { filters?: ArticleFilters; page?: number; limit?: number; userId?: string }) =>
    [
      'news',
      'articles',
      {
        filters: createArticleFilterKey(params?.filters),
        page: params?.page ?? 1,
        limit: params?.limit ?? null,
        userId: params?.userId ?? null,
      },
    ] as const,
  infiniteArticles: (params?: { filters?: ArticleFilters; limit?: number; userId?: string }) =>
    [
      'news',
      'articles',
      'infinite',
      {
        filters: createArticleFilterKey(params?.filters),
        limit: params?.limit ?? null,
        userId: params?.userId ?? null,
      },
    ] as const,
  articleById: (params: { articleId: string; userId?: string }) =>
    ['news', 'article', params.articleId, { userId: params.userId ?? null }] as const,
  sourceById: (sourceId: string) => ['news', 'source', sourceId] as const,
  favorites: (userId: string, articleIds?: string[]) =>
    [
      'news',
      'favorites',
      userId,
      {
        articleIds: normalizeIds(articleIds),
      },
    ] as const,
  preferences: (userId: string) => ['news', 'preferences', userId] as const,
};
