import { useInfiniteQuery, useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { Article, PaginatedResult } from '../../domain/models/news';
import { listArticles, getArticleById, DEFAULT_PAGE_SIZE, type ListArticlesParams } from '../../services/news';
import { newsQueryKeys } from './newsQueryKeys';

type ArticlesQueryOptions = Omit<UseQueryOptions<PaginatedResult<Article>>, 'queryKey' | 'queryFn'>;

export function useArticlesQuery(params: ListArticlesParams = {}, options?: ArticlesQueryOptions) {
  return useQuery({
    queryKey: newsQueryKeys.articles(params),
    queryFn: () => listArticles(params),
    ...options,
  });
}

export function useInfiniteArticlesQuery(params: Omit<ListArticlesParams, 'page'> = {}) {
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: newsQueryKeys.infiniteArticles({
      filters: params.filters,
      limit,
      userId: params.userId,
    }),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listArticles({
        ...params,
        page: pageParam,
        limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });
}

export function useArticleSearchQuery(params: {
  search: string;
  categoryIds?: string[];
  sourceIds?: string[];
  page?: number;
  limit?: number;
  userId?: string;
}) {
  return useArticlesQuery({
    page: params.page,
    limit: params.limit,
    userId: params.userId,
    filters: {
      search: params.search,
      categoryIds: params.categoryIds,
      sourceIds: params.sourceIds,
    },
  });
}

export function useArticleByIdQuery(params: { articleId: string; userId?: string; enabled?: boolean }) {
  return useQuery({
    queryKey: newsQueryKeys.articleById({
      articleId: params.articleId,
      userId: params.userId,
    }),
    queryFn: () =>
      getArticleById({
        articleId: params.articleId,
        userId: params.userId,
      }),
    enabled: params.enabled ?? Boolean(params.articleId),
  });
}
