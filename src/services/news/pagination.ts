import type { PaginatedResult } from '../../domain/models/news';
import { DEFAULT_PAGE_SIZE } from './types';

export function resolvePagination(page?: number, limit?: number) {
  const safePage = page && page > 0 ? page : 1;
  const safeLimit = limit && limit > 0 ? limit : DEFAULT_PAGE_SIZE;
  return {
    page: safePage,
    limit: safeLimit,
    from: (safePage - 1) * safeLimit,
    to: safePage * safeLimit - 1,
  };
}

export function createPaginatedResult<TItem>(params: {
  items: TItem[];
  page: number;
  limit: number;
  total: number | null;
}): PaginatedResult<TItem> {
  const hasMore = params.total === null ? params.items.length >= params.limit : params.page * params.limit < params.total;

  return {
    items: params.items,
    page: params.page,
    limit: params.limit,
    total: params.total,
    hasMore,
    nextPage: hasMore ? params.page + 1 : null,
  };
}
